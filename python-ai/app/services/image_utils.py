import base64

import cv2
import numpy as np
from PIL import Image
import io


def decode_image_bytes(data: bytes) -> np.ndarray:
    """Decode arbitrary image bytes (jpg/png/webp) into a BGR OpenCV array."""
    pil_image = Image.open(io.BytesIO(data)).convert("RGB")
    rgb_array = np.array(pil_image)
    return cv2.cvtColor(rgb_array, cv2.COLOR_RGB2BGR)


def encode_image_to_jpeg_base64(image_bgr: np.ndarray, quality: int = 85) -> str:
    success, buffer = cv2.imencode(".jpg", image_bgr, [cv2.IMWRITE_JPEG_QUALITY, quality])
    if not success:
        raise ValueError("Failed to encode image to JPEG")
    return base64.b64encode(buffer.tobytes()).decode("utf-8")


def resize_to_max_height(image_bgr: np.ndarray, max_height: int) -> np.ndarray:
    height, width = image_bgr.shape[:2]
    if height <= max_height:
        return image_bgr
    scale = max_height / height
    return cv2.resize(image_bgr, (int(width * scale), max_height), interpolation=cv2.INTER_AREA)


def clip_bbox(x1: float, y1: float, x2: float, y2: float, width: int, height: int) -> tuple[int, int, int, int]:
    x1 = max(0, min(int(round(x1)), width - 1))
    y1 = max(0, min(int(round(y1)), height - 1))
    x2 = max(0, min(int(round(x2)), width))
    y2 = max(0, min(int(round(y2)), height))
    return x1, y1, max(1, x2 - x1), max(1, y2 - y1)


def pad_for_detection(image_bgr: np.ndarray, margin_ratio: float = 0.4) -> tuple[np.ndarray, int, int]:
    """
    RetinaFace (and anchor-based detectors in general) reliably miss faces
    that are cropped tight enough to touch the image edges - a very common
    real-world case for headshot-style photos (profile pictures, ID photos,
    cropped social media images) with no surrounding background context.
    Padding the frame before detection gives the detector the margin it
    needs; the returned offsets let callers map bboxes back to the
    original, unpadded image.
    """
    height, width = image_bgr.shape[:2]
    pad_x = int(width * margin_ratio)
    pad_y = int(height * margin_ratio)
    padded = cv2.copyMakeBorder(image_bgr, pad_y, pad_y, pad_x, pad_x, cv2.BORDER_CONSTANT, value=(114, 114, 114))
    return padded, pad_x, pad_y
