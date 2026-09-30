"""
Gemini implementation of EmbeddingProvider / CaptioningProvider.

Uses Google's `google-generativeai` package with `models/text-embedding-004`
for text embeddings and `gemini-1.5-flash` for vision-based image captioning.
"""

from PIL import Image
import google.generativeai as genai

from .base import CaptioningProvider, EmbeddingProvider

_EMBEDDING_DIMENSIONS = 768


class GeminiEmbeddingProvider(EmbeddingProvider):
    def __init__(self, api_key: str, model: str = "models/text-embedding-004") -> None:
        self.api_key = api_key
        self.model = model if model.startswith("models/") else f"models/{model}"
        genai.configure(api_key=self.api_key)

    def embed_text(self, text: str) -> list[float]:
        return self.embed_batch([text])[0]

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        res = genai.embed_content(
            model=self.model,
            content=texts,
            task_type="retrieval_document"
        )
        embeddings = res.get("embedding", [])
        # When embedding multiple items, google-generativeai returns a list of vectors
        if embeddings and isinstance(embeddings[0], float):
            return [embeddings]
        return embeddings

    @property
    def dimensions(self) -> int:
        return _EMBEDDING_DIMENSIONS


class GeminiCaptioningProvider(CaptioningProvider):
    def __init__(self, api_key: str, model: str = "gemini-1.5-flash") -> None:
        self.api_key = api_key
        self.model = model
        genai.configure(api_key=self.api_key)
        self._model_client = genai.GenerativeModel(self.model)

    def caption_image(self, image_path: str) -> str:
        with Image.open(image_path) as img:
            img_copy = img.copy()

        prompt = (
            "Describe this image in detail, covering any text, objects, people, "
            "and context visible in it. Write it as a dense paragraph suitable "
            "for semantic search indexing, not a bulleted list."
        )
        response = self._model_client.generate_content([prompt, img_copy])
        return response.text.strip() if response.text else ""

