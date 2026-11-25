from fastapi import APIRouter

from app.services.faiss_index import get_faiss_manager, get_speaker_faiss_manager

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    faiss_manager = get_faiss_manager()
    speaker_faiss_manager = get_speaker_faiss_manager()
    return {
        "status": "ok",
        "faiss_vectors_indexed": faiss_manager.total_vectors,
        "speaker_vectors_indexed": speaker_faiss_manager.total_vectors,
    }
