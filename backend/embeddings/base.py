"""
Abstract interfaces that every embedding/captioning provider must implement.

Keeping indexing and retrieval code against these interfaces (rather than
any specific vendor SDK) is what lets the backing service be swapped later
via `openai_provider.py`, `gemini_provider.py`, `anthropic_provider.py`, etc.
"""

from abc import ABC, abstractmethod


class EmbeddingProvider(ABC):
    """Turns text into dense vector embeddings."""

    @abstractmethod
    def embed_text(self, text: str) -> list[float]:
        """Return a dense embedding vector for a single piece of text."""
        raise NotImplementedError

    @abstractmethod
    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Return dense embedding vectors for a batch of texts."""
        raise NotImplementedError

    @property
    @abstractmethod
    def dimensions(self) -> int:
        """Vector dimensionality this provider returns (needed by ChromaDB)."""
        raise NotImplementedError


class CaptioningProvider(ABC):
    """Turns an image into a text description, so images can be embedded
    and searched the same way as text via the EmbeddingProvider."""

    @abstractmethod
    def caption_image(self, image_path: str) -> str:
        """Return a natural-language description of the image at image_path."""
        raise NotImplementedError
