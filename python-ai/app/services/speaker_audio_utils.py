import os
import uuid

import numpy as np
import soundfile as sf

from app.core.config import get_settings
from app.services.video_utils import _run  # shared ffmpeg subprocess wrapper


def convert_to_wav_mono_16k(input_path: str) -> str:
    """SpeechBrain's ECAPA-TDNN model expects 16kHz mono PCM. Routing every
    input format (mp3/m4a/wav/...) through ffmpeg once, rather than relying
    on soundfile/torchaudio's per-codec backends, keeps format handling
    consistent with the rest of the app (which already uses ffmpeg
    everywhere else)."""
    settings = get_settings()
    os.makedirs(settings.tmp_dir, exist_ok=True)
    output_path = os.path.join(settings.tmp_dir, f"{uuid.uuid4().hex}.wav")
    _run([settings.ffmpeg_cmd, "-y", "-i", input_path, "-ar", "16000", "-ac", "1", output_path], timeout=180)
    return output_path


def load_waveform(wav_path: str) -> tuple[np.ndarray, int]:
    data, sample_rate = sf.read(wav_path, dtype="float32", always_2d=False)
    if data.ndim > 1:
        data = data.mean(axis=1)
    return data, sample_rate


def plan_segments(duration: float, segment_seconds: float, max_segments: int) -> list[tuple[float, float]]:
    """Fixed-length, non-overlapping windows spanning the FULL duration.
    Mirrors the video frame-sampling fix: widen the step when the naive
    segment_seconds would exceed max_segments, so a long recording still
    gets scanned end-to-end instead of only its first few minutes."""
    if duration <= 0:
        return []

    step = max(segment_seconds, duration / max_segments)
    segments = []
    start = 0.0
    while start < duration and len(segments) < max_segments:
        end = min(start + segment_seconds, duration)
        segments.append((start, end))
        start += step
    return segments


def slice_waveform(waveform: np.ndarray, sample_rate: int, start: float, end: float) -> np.ndarray:
    start_sample = int(start * sample_rate)
    end_sample = min(int(end * sample_rate), len(waveform))
    return waveform[start_sample:end_sample]
