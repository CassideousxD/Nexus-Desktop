"""
Anthropic implementation of CaptioningProvider.

Claude models are vision-capable (via the Messages API) and are used for image captioning.
Note: Anthropic does not currently offer a dedicated text embedding API, so Anthropic
captioning is paired with an embedding provider (e.g. OpenAI or Gemini) or local embeddings.
"""

import base64
from pathlib import Path
from anthropic import Anthropic

from .base import CaptioningProvider

_MIME_TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
}


class AnthropicCaptioningProvider(CaptioningProvider):
    def __init__(self, api_key: str, model: str = "claude-3-5-sonnet-20241022") -> None:
        self.client = Anthropic(api_key=api_key)
        self.model = model

    def caption_image(self, image_path: str) -> str:
        ext = Path(image_path).suffix.lower()
        media_type = _MIME_TYPES.get(ext, "image/png")

        with open(image_path, "rb") as f:
            b64_data = base64.b64encode(f.read()).decode("utf-8")

        response = self.client.messages.create(
            model=self.model,
            max_tokens=400,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": b64_data,
                            },
                        },
                        {
                            "type": "text",
                            "text": (
                                "Describe this image in detail, covering any text, "
                                "objects, people, and context visible in it. Write it "
                                "as a dense paragraph suitable for semantic search "
                                "indexing, not a bulleted list."
                            ),
                        },
                    ],
                }
            ],
        )
        return response.content[0].text if response.content else ""

