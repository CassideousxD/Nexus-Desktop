"""
ChromaClient — thin wrapper around a local, persistent ChromaDB instance.
"""

from pathlib import Path

import chromadb


class ChromaClient:
    def __init__(self, persist_dir: Path | None = None, collection_name: str = "nexus_files") -> None:
        self.persist_dir = persist_dir or Path.home() / ".nexus" / "chroma_data"
        self.persist_dir.mkdir(parents=True, exist_ok=True)
        self.collection_name = collection_name

        self._client = chromadb.PersistentClient(path=str(self.persist_dir))
        self._collection = self._client.get_or_create_collection(name=self.collection_name)

    def upsert(self, ids: list[str], embeddings: list[list[float]], metadatas: list[dict]) -> None:
        if not ids:
            return
        self._collection.upsert(ids=ids, embeddings=embeddings, metadatas=metadatas)

    def query(self, embedding: list[float], top_k: int = 10) -> list[dict]:
        if self._collection.count() == 0:
            return []

        # Chroma errors if n_results exceeds the collection size.
        n_results = min(top_k, self._collection.count())

        results = self._collection.query(query_embeddings=[embedding], n_results=n_results)

        ids = results.get("ids", [[]])[0]
        distances = results.get("distances", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]

        return [
            {"id": id_, "distance": distance, "metadata": metadata or {}}
            for id_, distance, metadata in zip(ids, distances, metadatas)
        ]

    def delete(self, ids: list[str]) -> None:
        if not ids:
            return
        self._collection.delete(ids=ids)

    def delete_by_file_path(self, file_path: str) -> None:
        try:
            self._collection.delete(where={"file_path": file_path})
        except Exception:
            pass

    def clear(self) -> None:
        try:
            all_items = self._collection.get()
            ids = all_items.get("ids", [])
            if ids:
                self._collection.delete(ids=ids)
        except Exception:
            pass

    def count(self) -> int:
        return self._collection.count()