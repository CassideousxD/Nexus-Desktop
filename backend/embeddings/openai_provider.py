"""
OpenAI implementation of EmbeddingProvider / CaptioningProvider.

Uses `text-embedding-3-small` (or `-large`) for embeddings, and a
vision-capable chat model (default gpt-4o) for image captioning, via the
official `openai` client.
"""

import base64
from pathlib import Path

from openai import OpenAI

from .base import CaptioningProvider, EmbeddingProvider

_EMBEDDING_DIMENSIONS = {
    "text-embedding-3-small": 1536,
    "text-embedding-3-large": 3072,
    "text-embedding-ada-002": 1536,
}

_MIME_TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
}


class OpenAIEmbeddingProvider(EmbeddingProvider):
    def __init__(self, api_key: str, model: str = "text-embedding-3-small") -> None:
        self.client = OpenAI(api_key=api_key)
        self.model = model

    def embed_text(self, text: str) -> list[float]:
        return self.embed_batch([text])[0]

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        response = self.client.embeddings.create(model=self.model, input=texts)
        # The API returns results in the same order as the input list, but
        # `index` is included on each item, so sort defensively rather than
        # trusting ordering blindly.
        ordered = sorted(response.data, key=lambda item: item.index)
        return [item.embedding for item in ordered]

    @property
    def dimensions(self) -> int:
        return _EMBEDDING_DIMENSIONS.get(self.model, 1536)


class OpenAICaptioningProvider(CaptioningProvider):
    def __init__(self, api_key: str, model: str = "gpt-4o") -> None:
        self.client = OpenAI(api_key=api_key)
        self.model = model

    def caption_image(self, image_path: str) -> str:
        ext = Path(image_path).suffix.lower()
        mime_type = _MIME_TYPES.get(ext, "image/png")

        with open(image_path, "rb") as f:
            b64_data = base64.b64encode(f.read()).decode("utf-8")

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Describe this image in detail, covering any text, "
                                "objects, people, and context visible in it. Write it "
                                "as a dense paragraph suitable for semantic search "
                                "indexing, not a bulleted list."
                            ),
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime_type};base64,{b64_data}"},
                        },
                    ],
                }
            ],
            max_tokens=400,
        )
        return response.choices[0].message.content or ""