import cv2
import numpy as np
import pytesseract

from app.core.config import get_settings

_configured = False


def _ensure_configured():
    global _configured
    if not _configured:
        pytesseract.pytesseract.tesseract_cmd = get_settings().tesseract_cmd
        _configured = True


def run_ocr(image_bgr: np.ndarray) -> tuple[str, float]:
    _ensure_configured()

    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 15)

    # PSM 4 ("assume a single column of text of variable sizes") keeps each
    # row's label and value together in reading order. The default PSM 3
    # auto-detects columns and instead groups all labels together followed
    # by all values - which silently breaks the "Label Value" field parser
    # for the two-column form/ID-card layouts these documents commonly use.
    config = "--psm 4"
    text = pytesseract.image_to_string(gray, config=config)

    data = pytesseract.image_to_data(gray, config=config, output_type=pytesseract.Output.DICT)
    confidences = [float(c) for c in data.get("conf", []) if c not in ("-1", -1)]
    avg_confidence = (sum(confidences) / len(confidences) / 100.0) if confidences else 0.0

    return text.strip(), avg_confidence