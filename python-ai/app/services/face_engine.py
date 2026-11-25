import logging
import threading

import numpy as np
from insightface.app import FaceAnalysis

from app.core.config import get_settings
from app.services.image_utils import clip_bbox, pad_for_detection

logger = logging.getLogger(__name__)


class DetectedFaceResult:
    def __init__(self, bbox_xyxy, det_score: float, embedding: np.ndarray, original_shape, offset_x: int = 0, offset_y: int = 0):
        height, width = original_shape[:2]
        x1, y1 = bbox_xyxy[0] - offset_x, bbox_xyxy[1] - offset_y
        x2, y2 = bbox_xyxy[2] - offset_x, bbox_xyxy[3] - offset_y
        x, y, w, h = clip_bbox(x1, y1, x2, y2, width, height)
        self.bbox = {"x": x, "y": y, "width": w, "height": h}
        self.det_score = float(det_score)
        self.embedding = embedding


class FaceEngine:
    """Thin wrapper around InsightFace's FaceAnalysis pipeline (detection,
    alignment and ArcFace embedding are all handled internally by the
    'buffalo_l' model pack)."""

    def __init__(self):
        settings = get_settings()
        self._lock = threading.Lock()

        self._app = FaceAnalysis(
            name=settings.insightface_model_name,
            providers=settings.insightface_providers_list
        )
        det_size = settings.insightface_det_size
        self._app.prepare(ctx_id=0, det_size=(det_size, det_size))
        self.min_det_score = settings.face_min_det_score
        logger.info("InsightFace engine ready (model=%s, det_size=%d)", settings.insightface_model_name, det_size)

    def detect(self, image_bgr: np.ndarray) -> list[DetectedFaceResult]:
        # Faces cropped tight enough to touch the frame edges (headshots,
        # profile pictures, ID-style photos) are reliably missed by
        # RetinaFace without extra margin, so we always detect on a padded
        # copy and map boxes back to the original image's coordinates.
        padded, offset_x, offset_y = pad_for_detection(image_bgr)

        with self._lock:
            faces = self._app.get(padded)

        results = []
        for face in faces:
            embedding = getattr(face, "normed_embedding", None)
            if embedding is None:
                continue
            results.append(
                DetectedFaceResult(face.bbox, face.det_score, embedding, image_bgr.shape, offset_x, offset_y)
            )
        return results

    def detect_best(self, image_bgr: np.ndarray) -> DetectedFaceResult | None:
        faces = self.detect(image_bgr)
        usable = [f for f in faces if f.det_score >= self.min_det_score]
        if not usable:
            return None
        usable.sort(key=lambda f: f.bbox["width"] * f.bbox["height"] * f.det_score, reverse=True)
        return usable[0]


_engine: FaceEngine | None = None
_engine_lock = threading.Lock()


def get_face_engine() -> FaceEngine:
    global _engine
    if _engine is None:
        with _engine_lock:
            if _engine is None:
                _engine = FaceEngine()
    return _engine
