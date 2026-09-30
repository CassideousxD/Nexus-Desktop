"""
Word document parser — extracts paragraph and table text with
`python-docx`, then chunks it.
"""

from docx import Document

from ..chunking import chunk_text


def parse(file_path: str) -> list[str]:
    doc = Document(file_path)

    lines = [p.text for p in doc.paragraphs if p.text.strip()]

    for table in doc.tables:
        for row in table.rows:
            cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
            if cells:
                lines.append(" | ".join(cells))

    full_text = "\n".join(lines)
    return chunk_text(full_text)