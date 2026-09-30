"""
Indexing pipeline — parses a file, embeds its chunks, and writes both the
vectors (ChromaDB) and the metadata (SQLite) for it.

This is the piece `/index` in main.py calls per file. A directory-crawling
/ background-watcher layer can sit on top of `index_path` later without
changing this function.
"""

from pathlib import Path

from embeddings.base import CaptioningProvider, EmbeddingProvider
from storage.chroma_client import ChromaClient
from storage.metadata_db import MetadataDB

from . import index_file


def index_path(
    file_path: str,
    embedding_provider: EmbeddingProvider,
    chroma_client: ChromaClient,
    metadata_db: MetadataDB,
    captioning_provider: CaptioningProvider | None = None,
) -> int:
    """
    Index a single file end-to-end. Returns the number of chunks indexed
    (0 if the file produced no usable text).
    """
    path = Path(file_path)

    chunks = index_file(str(path), captioning_provider=captioning_provider)
    if not chunks:
        return 0

    file_id = metadata_db.upsert_file(
        path=str(path),
        file_type=path.suffix.lower().lstrip("."),
        last_modified=path.stat().st_mtime,
    )

    embeddings = embedding_provider.embed_batch(chunks)

    chunk_ids = [f"{file_id}-{i}" for i in range(len(chunks))]
    metadatas = [
        {"file_path": str(path), "snippet": chunk[:300]}
        for chunk in chunks
    ]

    chroma_client.upsert(ids=chunk_ids, embeddings=embeddings, metadatas=metadatas)

    for i, (chunk_id, chunk) in enumerate(zip(chunk_ids, chunks)):
        metadata_db.add_chunk(chunk_id=chunk_id, file_id=file_id, chunk_index=i, text=chunk)

    metadata_db.mark_indexed(file_id)
    return len(chunks)