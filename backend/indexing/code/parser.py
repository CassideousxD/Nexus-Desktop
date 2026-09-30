"""
Code / plain-text parser — reads the file as UTF-8 (tolerating stray
non-UTF-8 bytes) and chunks it with a smaller chunk size than prose, since
code tends to pack more meaning per word.
"""

from ..chunking import chunk_text


def parse(file_path: str) -> list[str]:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read()

    return chunk_text(text, chunk_size=300, overlap=30)