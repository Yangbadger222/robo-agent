from langchain_core.tools import tool

from rag.store import retrieve


@tool
def rag_retrieve(query: str) -> str:
    """Retrieve relevant documents from the robotics knowledge base for a given query."""
    results = retrieve(query)
    if not results:
        return "No relevant documents found."

    chunks = []
    for i, doc in enumerate(results, 1):
        source = doc.get("metadata", {}).get("source", "unknown")
        chunks.append(f"[{i}] (source: {source}, score: {doc.get('score', 'N/A')})\n{doc['content']}")

    return "\n\n---\n\n".join(chunks)
