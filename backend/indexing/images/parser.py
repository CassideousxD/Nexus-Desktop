"""
Image parser — images have no extractable text of their own, so this
delegates to a CaptioningProvider to produce a natural-language description,
which is then treated as the single "chunk" for that image (so it can be
embedded and searched the same way as any other text chunk).
"""

from PIL import Image

from embeddings.base import CaptioningProvider


def parse(file_path: str, captioning_provider: CaptioningProvider | None = None) -> list[str]:
    if captioning_provider is None:
        raise ValueError(
            "Indexing an image requires a configured CaptioningProvider "
            "(none was supplied — save provider settings first)."
        )

    # Validate the file is actually a readable image before spending an API
    # call on it.
    with Image.open(file_path) as img:
        img.verify()

    caption = captioning_provider.caption_image(file_path)
    if not caption or not caption.strip():
        return []

    return [caption.strip()]