import asyncio
import logging

from fastapi import APIRouter, Depends

from app.core.security import verify_internal_api_key
from app.models.schemas import (
    EnrollFaceRequest,
    EnrollFaceResponse,
    RebuildIndexRequest,
    RebuildIndexResponse,
    RemoveFaceRequest,
)
from app.services.face_engine import get_face_engine
from app.services.faiss_index import get_faiss_manager
from app.services.image_utils import decode_image_bytes
from app.utils.http_client import download_to_bytes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/faces", tags=["faces"], dependencies=[Depends(verify_internal_api_key)])


@router.post("/enroll", response_model=EnrollFaceResponse)
async def enroll_face(request: EnrollFaceRequest):
    image_bytes = await download_to_bytes(request.image_url)
    image_bgr = await asyncio.to_thread(decode_image_bytes, image_bytes)

    engine = get_face_engine()
    best_face = await asyncio.to_thread(engine.detect_best, image_bgr)

    if best_face is None:
        return EnrollFaceResponse(success=False, message="No usable face detected in the uploaded image")

    faiss_manager = get_faiss_manager()
    await asyncio.to_thread(faiss_manager.add, request.faiss_label, best_face.embedding)

    return EnrollFaceResponse(
        success=True,
        faiss_label=request.faiss_label,
        quality_score=best_face.det_score,
        bbox=best_face.bbox,
    )


@router.post("/remove")
async def remove_face(request: RemoveFaceRequest):
    faiss_manager = get_faiss_manager()
    await asyncio.to_thread(faiss_manager.remove, [request.faiss_label])
    return {"success": True}


@router.post("/rebuild-index", response_model=RebuildIndexResponse)
async def rebuild_index(request: RebuildIndexRequest):
    engine = get_face_engine()
    entries = []
    failed = []

    for entry in request.entries:
        try:
            image_bytes = await download_to_bytes(entry.image_url)
            image_bgr = await asyncio.to_thread(decode_image_bytes, image_bytes)
            best_face = await asyncio.to_thread(engine.detect_best, image_bgr)
            if best_face is None:
                failed.append(entry.faiss_label)
                continue
            entries.append((entry.faiss_label, best_face.embedding))
        except Exception as error:  # noqa: BLE001
            logger.error("Failed to process face %s during rebuild: %s", entry.faiss_label, error)
            failed.append(entry.faiss_label)

    faiss_manager = get_faiss_manager()
    await asyncio.to_thread(faiss_manager.rebuild, entries)

    return RebuildIndexResponse(
        success=True,
        total_entries=len(request.entries),
        enrolled=len(entries),
        failed=failed,
    )
