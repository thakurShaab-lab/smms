import asyncio
import logging

from fastapi import APIRouter, Depends

from app.core.config import get_settings
from app.core.security import verify_internal_api_key
from app.models.schemas import (
    DetectedFace,
    DetectedSpeakerSegment,
    FaceMatch,
    RecognizeAudioRequest,
    RecognizeAudioResponse,
    RecognizePhotoRequest,
    RecognizePhotoResponse,
    RecognizeVideoRequest,
    RecognizeVideoResponse,
    SampledFrame,
    SpeakerMatch,
)
from app.services.audio_utils import probe_audio
from app.services.face_engine import get_face_engine
from app.services.faiss_index import get_faiss_manager, get_speaker_faiss_manager
from app.services.image_utils import decode_image_bytes, encode_image_to_jpeg_base64
from app.services.speaker_audio_utils import convert_to_wav_mono_16k, load_waveform, plan_segments, slice_waveform
from app.services.speaker_engine import get_speaker_engine
from app.services.video_utils import (
    extract_frames,
    generate_preview_bytes,
    generate_thumbnail_bytes,
    probe_video,
)
from app.utils.http_client import cleanup_file, download_to_bytes, download_to_tmp_file
import base64

logger = logging.getLogger(__name__)

router = APIRouter(tags=["recognition"], dependencies=[Depends(verify_internal_api_key)])


def _detect_and_match(image_bgr, top_k: int, threshold: float, timestamp: float | None = None) -> list[DetectedFace]:
    engine = get_face_engine()
    faiss_manager = get_faiss_manager()

    detected = []
    for face in engine.detect(image_bgr):
        if face.det_score < engine.min_det_score:
            continue

        raw_matches = faiss_manager.search(face.embedding, top_k)
        matches = [FaceMatch(faiss_label=label, similarity=similarity) for label, similarity in raw_matches if similarity >= threshold]

        detected.append(
            DetectedFace(bbox=face.bbox, quality_score=face.det_score, matches=matches, timestamp=timestamp)
        )
    return detected


@router.post("/recognition/photo", response_model=RecognizePhotoResponse)
async def recognize_photo(request: RecognizePhotoRequest):
    image_bytes = await download_to_bytes(request.image_url)
    image_bgr = await asyncio.to_thread(decode_image_bytes, image_bytes)
    height, width = image_bgr.shape[:2]

    faces = await asyncio.to_thread(_detect_and_match, image_bgr, request.top_k, request.threshold)

    return RecognizePhotoResponse(width=width, height=height, faces=faces)


@router.post("/recognition/video", response_model=RecognizeVideoResponse)
async def recognize_video(request: RecognizeVideoRequest):
    settings = get_settings()
    tmp_path = await download_to_tmp_file(request.video_url, suffix=".mp4")

    try:
        metadata = await asyncio.to_thread(probe_video, tmp_path)

        thumbnail_b64 = None
        try:
            thumbnail_bytes = await asyncio.to_thread(
                generate_thumbnail_bytes, tmp_path, min(1.0, max(metadata["duration"] / 2, 0.1))
            )
            thumbnail_b64 = base64.b64encode(thumbnail_bytes).decode("utf-8")
        except Exception as error:  # noqa: BLE001
            logger.error("Thumbnail generation failed: %s", error)

        preview_b64 = None
        try:
            preview_bytes = await asyncio.to_thread(generate_preview_bytes, tmp_path)
            preview_b64 = base64.b64encode(preview_bytes).decode("utf-8")
        except Exception as error:  # noqa: BLE001
            logger.error("Preview generation failed: %s", error)

        # extract_frames caps total output at video_max_frames_sampled, so a
        # fixed interval would only ever cover the first N seconds of a
        # longer video (e.g. 60 frames @ 1s = the first minute only, no
        # matter how long the upload actually is). Widen the interval so
        # sampling spans the FULL duration whenever the naive interval would
        # exceed the frame cap; short videos still get dense sampling.
        requested_interval = request.frame_interval_seconds or settings.video_frame_interval_seconds
        max_frames = settings.video_max_frames_sampled
        duration = metadata["duration"] or 0
        interval = max(requested_interval, duration / max_frames) if duration > 0 else requested_interval

        sampled = await asyncio.to_thread(extract_frames, tmp_path, interval, max_frames)

        frames = []
        for timestamp, frame_bgr in sampled:
            faces = await asyncio.to_thread(_detect_and_match, frame_bgr, request.top_k, request.threshold, timestamp)
            if faces:
                frames.append(SampledFrame(timestamp=timestamp, faces=faces))

        return RecognizeVideoResponse(
            width=metadata["width"],
            height=metadata["height"],
            duration_seconds=metadata["duration"],
            fps=metadata["fps"],
            frame_count=len(sampled),
            thumbnail_base64=thumbnail_b64,
            thumbnail_mime="image/jpeg" if thumbnail_b64 else None,
            preview_base64=preview_b64,
            preview_mime="video/mp4" if preview_b64 else None,
            frames=frames,
        )
    finally:
        cleanup_file(tmp_path)


def _embed_and_match_segment(waveform, sample_rate, top_k: int, threshold: float, start: float, end: float):
    engine = get_speaker_engine()
    faiss_manager = get_speaker_faiss_manager()

    segment_waveform = slice_waveform(waveform, sample_rate, start, end)
    result = engine.get_embedding(segment_waveform, sample_rate)
    if result is None:
        return None

    raw_matches = faiss_manager.search(result.embedding, top_k)
    matches = [SpeakerMatch(faiss_label=label, similarity=similarity) for label, similarity in raw_matches if similarity >= threshold]

    return DetectedSpeakerSegment(start_time=start, end_time=end, quality_score=result.quality_score, matches=matches)


@router.post("/recognition/audio", response_model=RecognizeAudioResponse)
async def recognize_audio(request: RecognizeAudioRequest):
    settings = get_settings()
    src_path = await download_to_tmp_file(request.audio_url, suffix=".audio")
    wav_path = None

    try:
        metadata = await asyncio.to_thread(probe_audio, src_path)
        duration = metadata["duration_seconds"] or 0

        wav_path = await asyncio.to_thread(convert_to_wav_mono_16k, src_path)
        waveform, sample_rate = await asyncio.to_thread(load_waveform, wav_path)

        segment_seconds = request.segment_seconds or settings.audio_segment_seconds
        windows = plan_segments(duration, segment_seconds, settings.audio_max_segments_sampled)

        segments = []
        for start, end in windows:
            segment = await asyncio.to_thread(
                _embed_and_match_segment, waveform, sample_rate, request.top_k, request.threshold, start, end
            )
            if segment is not None:
                segments.append(segment)

        return RecognizeAudioResponse(
            duration_seconds=duration,
            codec=metadata["codec"],
            bitrate=metadata["bitrate"],
            sample_rate=metadata["sample_rate"],
            segments=segments,
        )
    finally:
        cleanup_file(src_path)
        if wav_path:
            cleanup_file(wav_path)
