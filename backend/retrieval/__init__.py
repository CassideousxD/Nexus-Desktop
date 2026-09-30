"""
Retrieval module — hybrid search combining sparse (BM25) and dense
(embedding similarity) results into a single ranked result set.

Stubbed; no combination/re-ranking logic implemented yet.
"""

from .hybrid_search import HybridSearcher

__all__ = ["HybridSearcher"]
