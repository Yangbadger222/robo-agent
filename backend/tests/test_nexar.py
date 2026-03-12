import pytest
from unittest.mock import AsyncMock, patch


@pytest.mark.asyncio
async def test_search_components_mock():
    mock_response = {
        "data": {
            "supSearchMpn": {
                "results": [
                    {
                        "part": {
                            "mpn": "NEMA17-1234",
                            "manufacturer": {"name": "TestMotor Co"},
                            "shortDescription": "Stepper motor",
                            "medianPrice1000": {"price": 15.99, "currency": "USD"},
                            "sellers": [{"offers": [{"inventoryLevel": 500}]}],
                        }
                    }
                ]
            }
        }
    }

    with patch("graph.tools.nexar.httpx.AsyncClient") as MockClient:
        mock_client = AsyncMock()
        MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        MockClient.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_client.post.return_value.json.return_value = {"access_token": "test"}
        mock_client.post.return_value.status_code = 200

        from graph.tools.nexar import search_components
        assert search_components.name == "search_components"
