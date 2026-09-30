"""
Shared chunking utility used by every file-type parser.

Word-count based rather than token-based — simple and dependency-free.
If embedding costs or context limits become an issue, swap this for a
tokenizer-aware splitter (e.g. tiktoken) without touching any parser.
"""


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """
    Split text into overlapping chunks of roughly `chunk_size` words each,
    with `overlap` words shared between consecutive chunks so a sentence
    that straddles a chunk boundary still shows up whole in at least one
    chunk.
    """
    words = text.split()
    if not words:
        return []

    if overlap >= chunk_size:
        overlap = chunk_size // 2

    step = max(chunk_size - overlap, 1)
    chunks: list[str] = []

    for start in range(0, len(words), step):
        chunk_words = words[start : start + chunk_size]
        if not chunk_words:
            continue
        chunks.append(" ".join(chunk_words))
        if start + chunk_size >= len(words):
            break

    return chunks