import asyncio
import logging

from fastapi import APIRouter, Depends

from app.core.security import verify_internal_api_key
from app.models.schemas import (
    EnrollSpeakerRequest,
    EnrollSpeakerResponse,
    RebuildSpeakerIndexRequest,
    RebuildSpeakerIndexResponse,
    RemoveSpeakerRequest,
)
from app.services.faiss_index import get_speaker_faiss_manager
from app.services.speaker_audio_utils import convert_to_wav_mono_16k, load_waveform
from app.services.speaker_engine import get_speaker_engine
from app.utils.http_client import cleanup_file, download_to_tmp_file

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/speakers", tags=["speakers"], dependencies=[Depends(verify_internal_api_key)])


async def _embed_audio_url(audio_url: str):
    """Download an audio clip and return a single speaker embedding for the
    whole thing (used for enrollment, where the sample is expected to be one
    clean recording of a single voice) - analogous to detect_best() on an
    enrollment photo."""
    src_path = await download_to_tmp_file(audio_url, suffix=".audio")
    wav_path = None
    try:
        wav_path = await asyncio.to_thread(convert_to_wav_mono_16k, src_path)
        waveform, sample_rate = await asyncio.to_thread(load_waveform, wav_path)
        engine = get_speaker_engine()
        return await asyncio.to_thread(engine.get_embedding, waveform, sample_rate)
    finally:
        cleanup_file(src_path)
        if wav_path:
            cleanup_file(wav_path)


@router.post("/enroll", response_model=EnrollSpeakerResponse)
async def enroll_speaker(request: EnrollSpeakerRequest):
    result = await _embed_audio_url(request.audio_url)

    if result is None:
        return EnrollSpeakerResponse(success=False, message="No usable voice signal detected in the uploaded audio")

    faiss_manager = get_speaker_faiss_manager()
    await asyncio.to_thread(faiss_manager.add, request.faiss_label, result.embedding)

    return EnrollSpeakerResponse(success=True, faiss_label=request.faiss_label, quality_score=result.quality_score)


@router.post("/remove")
async def remove_speaker(request: RemoveSpeakerRequest):
    faiss_manager = get_speaker_faiss_manager()
    await asyncio.to_thread(faiss_manager.remove, [request.faiss_label])
    return {"success": True}


@router.post("/rebuild-index", response_model=RebuildSpeakerIndexResponse)
async def rebuild_speaker_index(request: RebuildSpeakerIndexRequest):
    entries = []
    failed = []

    for entry in request.entries:
        try:
            result = await _embed_audio_url(entry.audio_url)
            if result is None:
                failed.append(entry.faiss_label)
                continue
            entries.append((entry.faiss_label, result.embedding))
        except Exception as error:  # noqa: BLE001
            logger.error("Failed to process speaker %s during rebuild: %s", entry.faiss_label, error)
            failed.append(entry.faiss_label)

    faiss_manager = get_speaker_faiss_manager()
    await asyncio.to_thread(faiss_manager.rebuild, entries)

    return RebuildSpeakerIndexResponse(
        success=True,
        total_entries=len(request.entries),
        enrolled=len(entries),
        failed=failed,
    )
