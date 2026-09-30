"""
PowerPoint parser — extracts text from every shape/text frame on every
slide with `python-pptx`, then chunks it.
"""

from pptx import Presentation

from ..chunking import chunk_text


def parse(file_path: str) -> list[str]:
    presentation = Presentation(file_path)

    lines = []
    for slide_number, slide in enumerate(presentation.slides, start=1):
        slide_lines = []
        for shape in slide.shapes:
            if shape.has_text_frame:
                for paragraph in shape.text_frame.paragraphs:
                    text = "".join(run.text for run in paragraph.runs).strip()
                    if text:
                        slide_lines.append(text)
            if shape.has_table:
                for row in shape.table.rows:
                    cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                    if cells:
                        slide_lines.append(" | ".join(cells))

        if slide_lines:
            lines.append(f"Slide {slide_number}")
            lines.extend(slide_lines)

    full_text = "\n".join(lines)
    return chunk_text(full_text)