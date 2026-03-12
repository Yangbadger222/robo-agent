from pathlib import Path

import chromadb
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from unstructured.partition.pdf import partition_pdf

from config import settings

COLLECTION_NAME = "robo_docs"


def ingest_docs(docs_dir: str = "data/docs") -> int:
    docs_path = Path(docs_dir)
    if not docs_path.exists():
        raise FileNotFoundError(f"Directory not found: {docs_dir}")

    embed_kwargs = dict(
        model=settings.embedding_model,
        openai_api_key=settings.openai_api_key,
    )
    if settings.openai_base_url:
        embed_kwargs["openai_api_base"] = settings.openai_base_url
    embeddings = OpenAIEmbeddings(**embed_kwargs)
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

    client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
    collection = client.get_or_create_collection(name=COLLECTION_NAME)

    all_chunks: list[str] = []
    all_metadatas: list[dict] = []
    all_ids: list[str] = []

    for filepath in sorted(docs_path.iterdir()):
        if filepath.suffix.lower() == ".pdf":
            elements = partition_pdf(str(filepath))
            text = "\n\n".join(str(el) for el in elements)
        elif filepath.suffix.lower() in (".txt", ".md"):
            text = filepath.read_text(encoding="utf-8")
        else:
            continue

        chunks = splitter.split_text(text)
        for i, chunk in enumerate(chunks):
            doc_id = f"{filepath.stem}_{i}"
            all_chunks.append(chunk)
            all_metadatas.append({"source": filepath.name, "chunk_index": i})
            all_ids.append(doc_id)

    if not all_chunks:
        return 0

    vectors = embeddings.embed_documents(all_chunks)

    collection.upsert(
        ids=all_ids,
        embeddings=vectors,
        documents=all_chunks,
        metadatas=all_metadatas,
    )

    return len(all_chunks)


if __name__ == "__main__":
    count = ingest_docs()
    print(f"Ingested {count} chunks into '{COLLECTION_NAME}'")
