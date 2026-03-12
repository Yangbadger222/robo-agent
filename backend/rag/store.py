import chromadb
from langchain_openai import OpenAIEmbeddings

from config import settings

COLLECTION_NAME = "robo_docs"

_client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
_embeddings = OpenAIEmbeddings(
    model=settings.embedding_model,
    openai_api_key=settings.openai_api_key,
)


def retrieve(query: str, k: int = 5) -> list[dict]:
    collection = _client.get_or_create_collection(name=COLLECTION_NAME)

    if collection.count() == 0:
        return []

    k = min(k, collection.count())
    query_vector = _embeddings.embed_query(query)

    results = collection.query(
        query_embeddings=[query_vector],
        n_results=k,
        include=["documents", "metadatas", "distances"],
    )

    if not results["documents"] or not results["documents"][0]:
        return []

    docs = []
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        docs.append({
            "content": doc,
            "metadata": meta,
            "score": 1 - dist,
        })

    return docs
