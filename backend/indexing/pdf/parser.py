"""
PDF parser — extracts text per page with `pypdf`, then chunks it.
"""

from pypdf import PdfReader

from ..chunking import chunk_text


def parse(file_path: str) -> list[str]:
    reader = PdfReader(file_path)
    pages_text = []
    for page in reader.pages:
        text = page.extract_text() or ""
        if text.strip():
            pages_text.append(text)

    full_text = "\n\n".join(pages_text)
    return chunk_text(full_text)