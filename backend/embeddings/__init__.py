"""
Embeddings module — provider-abstracted interfaces for text embedding and
image captioning, so the backing service (OpenAI, Gemini, Anthropic, ...)
can be swapped without touching indexing/retrieval code.
"""

from .base import CaptioningProvider, EmbeddingProvider

__all__ = ["EmbeddingProvider", "CaptioningProvider"]
