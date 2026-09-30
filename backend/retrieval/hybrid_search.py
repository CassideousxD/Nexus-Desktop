"""
HybridSearcher — combines BM25 (sparse, keyword-based) and dense embedding
similarity search into one ranked result list.

Approach: run both retrieval methods independently, normalize each to a
0-1 score, then combine via a tunable weighted sum. Reciprocal rank fusion
is a reasonable alternative if the weighted-sum blend doesn't rank well in
practice — see docs/architecture.md.
"""

from rank_bm25 import BM25Okapi

from embeddings.base import EmbeddingProvider
from storage.chroma_client import ChromaClient
from storage.metadata_db import MetadataDB


class HybridSearcher:
    def __init__(
        self,
        chroma_client: ChromaClient,
        metadata_db: MetadataDB,
        embedding_provider: EmbeddingProvider,
        bm25_weight: float = 0.5,
        dense_weight: float = 0.5,
    ) -> None:
        self.chroma_client = chroma_client
        self.metadata_db = metadata_db
        self.embedding_provider = embedding_provider
        self.bm25_weight = bm25_weight
        self.dense_weight = dense_weight

        self._bm25: BM25Okapi | None = None
        self._bm25_chunks: list[dict] = []
        self.refresh_index()

    def refresh_index(self) -> None:
        """Rebuild the in-memory BM25 index from whatever's currently in
        the metadata DB. Call this after indexing new files."""
        self._bm25_chunks = self.metadata_db.all_chunks()
        if not self._bm25_chunks:
            self._bm25 = None
            return

        tokenized_corpus = [chunk["text"].lower().split() for chunk in self._bm25_chunks]
        self._bm25 = BM25Okapi(tokenized_corpus)

    def search(self, query: str, top_k: int = 10) -> list[dict]:
        dense_results = self._dense_search(query, top_k)
        sparse_results = self._sparse_search(query, top_k)
        return self._merge(dense_results, sparse_results, top_k)

    def _dense_search(self, query: str, top_k: int) -> dict[str, dict]:
        embedding = self.embedding_provider.embed_text(query)
        raw = self.chroma_client.query(embedding, top_k=top_k)

        results = {}
        for item in raw:
            # Cosine/L2 distance -> a bounded similarity-ish score in (0, 1].
            results[item["id"]] = {
                "file_path": item["metadata"].get("file_path", ""),
                "snippet": item["metadata"].get("snippet", ""),
                "score": 1.0 / (1.0 + max(item["distance"], 0.0)),
            }
        return results

    def _sparse_search(self, query: str, top_k: int) -> dict[str, dict]:
        if self._bm25 is None:
            return {}

        tokenized_query = query.lower().split()
        scores = self._bm25.get_scores(tokenized_query)
        if len(scores) == 0:
            return {}

        max_score = max(scores) if max(scores) > 0 else 1.0
        ranked_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:top_k]

        results = {}
        for i in ranked_indices:
            if scores[i] <= 0:
                continue
            chunk = self._bm25_chunks[i]
            results[chunk["chunk_id"]] = {
                "file_path": chunk["path"],
                "snippet": chunk["text"][:300],
                "score": scores[i] / max_score,
            }
        return results

    def _merge(self, dense_results: dict, sparse_results: dict, top_k: int) -> list[dict]:
        combined: dict[str, dict] = {}

        for chunk_id, result in dense_results.items():
            combined[chunk_id] = {**result, "score": result["score"] * self.dense_weight}

        for chunk_id, result in sparse_results.items():
            weighted_score = result["score"] * self.bm25_weight
            if chunk_id in combined:
                combined[chunk_id]["score"] += weighted_score
            else:
                combined[chunk_id] = {**result, "score": weighted_score}

        ranked = sorted(combined.values(), key=lambda r: r["score"], reverse=True)
        return ranked[:top_k]