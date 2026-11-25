import io

import cv2
import fitz  # PyMuPDF
import numpy as np
from docx import Document
from PIL import Image


def render_pdf_first_page(pdf_bytes: bytes, zoom: float = 2.0) -> np.ndarray:
    document = fitz.open(stream=pdf_bytes, filetype="pdf")
    try:
        if document.page_count == 0:
            raise ValueError("The PDF document has no pages")
        page = document.load_page(0)
        matrix = fitz.Matrix(zoom, zoom)
        pixmap = page.get_pixmap(matrix=matrix, alpha=False)
        image = np.frombuffer(pixmap.samples, dtype=np.uint8).reshape(pixmap.height, pixmap.width, pixmap.n)
        if pixmap.n == 4:
            return cv2.cvtColor(image, cv2.COLOR_RGBA2BGR)
        return cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    finally:
        document.close()


def extract_docx_text_and_image(docx_bytes: bytes) -> tuple[str, np.ndarray | None]:
    document = Document(io.BytesIO(docx_bytes))

    text_parts = [paragraph.text for paragraph in document.paragraphs if paragraph.text.strip()]
    for table in document.tables:
        for row in table.rows:
            for cell in row.cells:
                if cell.text.strip():
                    text_parts.append(cell.text)
    raw_text = "\n".join(text_parts)

    image_bgr = None
    for relation in document.part.rels.values():
        if "image" in relation.reltype:
            try:
                image_bytes = relation.target_part.blob
                pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                image_bgr = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
                break
            except Exception:  # noqa: BLE001
                continue

    return raw_text, image_bgr
