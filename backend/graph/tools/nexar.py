import asyncio
import time

import httpx
from langchain_core.tools import tool

from config import settings

_token_cache: dict = {"access_token": None, "expires_at": 0.0}

TOKEN_URL = "https://identity.nexar.com/connect/token"
GRAPHQL_URL = "https://api.nexar.com/graphql"

SEARCH_QUERY = """
query SearchComponents($query: String!, $limit: Int!) {
  supSearchMpn(q: $query, limit: $limit) {
    results {
      part {
        mpn
        manufacturer {
          name
        }
        descriptions {
          text
        }
        medianPrice1000 {
          price
          currency
        }
        sellers {
          offers {
            inventoryLevel
          }
        }
      }
    }
  }
}
"""


async def _get_token() -> str:
    now = time.time()
    if _token_cache["access_token"] and now < _token_cache["expires_at"] - 30:
        return _token_cache["access_token"]

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            TOKEN_URL,
            data={
                "grant_type": "client_credentials",
                "client_id": settings.nexar_client_id,
                "client_secret": settings.nexar_client_secret,
            },
        )
        resp.raise_for_status()
        data = resp.json()

    _token_cache["access_token"] = data["access_token"]
    _token_cache["expires_at"] = now + data.get("expires_in", 3600)
    return data["access_token"]


async def _graphql_request(query: str, variables: dict, retries: int = 3) -> dict:
    token = await _get_token()
    headers = {"Authorization": f"Bearer {token}"}

    for attempt in range(retries):
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                GRAPHQL_URL,
                json={"query": query, "variables": variables},
                headers=headers,
                timeout=30.0,
            )

        if resp.status_code == 429 and attempt < retries - 1:
            await asyncio.sleep(2 ** (attempt + 1))
            continue

        resp.raise_for_status()
        return resp.json()

    raise RuntimeError("All Nexar API retries exhausted")


def _parse_results(data: dict) -> list[dict]:
    results = []
    hits = (
        data.get("data", {})
        .get("supSearchMpn", {})
        .get("results", [])
    )

    for hit in hits:
        part = hit.get("part", {})
        descriptions = part.get("descriptions", [])
        median = part.get("medianPrice1000") or {}
        sellers = part.get("sellers", [])

        total_stock = 0
        for seller in sellers:
            for offer in seller.get("offers", []):
                level = offer.get("inventoryLevel", 0)
                if isinstance(level, (int, float)):
                    total_stock += int(level)

        results.append(
            {
                "mpn": part.get("mpn", ""),
                "manufacturer": (part.get("manufacturer") or {}).get("name", ""),
                "description": descriptions[0].get("text", "") if descriptions else "",
                "avg_price": median.get("price"),
                "currency": median.get("currency", "USD"),
                "stock": total_stock,
                "datasheet_url": None,
            }
        )

    return results


async def search_components_async(query: str, limit: int = 10) -> list[dict]:
    """Async version for use within async node code."""
    data = await _graphql_request(SEARCH_QUERY, {"query": query, "limit": limit})
    return _parse_results(data)


@tool
def search_components(query: str, limit: int = 10) -> list[dict]:
    """Search the Nexar electronic component database for parts matching the query string."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as pool:
            future = pool.submit(
                asyncio.run,
                _graphql_request(SEARCH_QUERY, {"query": query, "limit": limit}),
            )
            data = future.result()
    else:
        data = asyncio.run(
            _graphql_request(SEARCH_QUERY, {"query": query, "limit": limit})
        )
    return _parse_results(data)
