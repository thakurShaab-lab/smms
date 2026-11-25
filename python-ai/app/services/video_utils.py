import glob
import json
import logging
import os
import subprocess
import uuid

import cv2

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class VideoProcessingError(Exception):
    pass


def _run(command: list[str], timeout: int = 120) -> subprocess.CompletedProcess:
    try:
        return subprocess.run(command, capture_output=True, timeout=timeout, check=True)
    except subprocess.CalledProcessError as error:
        stderr = error.stderr.decode("utf-8", errors="ignore") if error.stderr else ""
        raise VideoProcessingError(f"Command failed: {' '.join(command)} :: {stderr[-500:]}") from error
    except subprocess.TimeoutExpired as error:
        raise VideoProcessingError(f"Command timed out: {' '.join(command)}") from error


def probe_video(path: str) -> dict:
    settings = get_settings()
    result = _run(
        [
            settings.ffprobe_cmd,
            "-v", "error",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            path,
        ]
    )
    data = json.loads(result.stdout.decode("utf-8"))

    video_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), {})
    duration = float(data.get("format", {}).get("duration", 0) or 0)

    fps = 0.0
    frame_rate = video_stream.get("avg_frame_rate", "0/1")
    if "/" in frame_rate:
        numerator, denominator = frame_rate.split("/")
        denominator = float(denominator)
        fps = float(numerator) / denominator if denominator else 0.0

    return {
        "width": int(video_stream.get("width", 0) or 0),
        "height": int(video_stream.get("height", 0) or 0),
        "duration": duration,
        "fps": fps,
        "codec": video_stream.get("codec_name"),
    }


def extract_frames(path: str, interval_seconds: float, max_frames: int) -> list[tuple[float, "cv2.Mat"]]:
    settings = get_settings()
    tmp_frames_dir = os.path.join(settings.tmp_dir, f"frames_{uuid.uuid4().hex}")
    os.makedirs(tmp_frames_dir, exist_ok=True)

    pattern = os.path.join(tmp_frames_dir, "frame_%06d.jpg")
    fps_filter = f"fps=1/{interval_seconds}"

    try:
        _run(
            [
                settings.ffmpeg_cmd,
                "-y",
                "-i", path,
                "-vf", fps_filter,
                "-frames:v", str(max_frames),
                "-qscale:v", "3",
                pattern,
            ],
            timeout=300,
        )

        frame_files = sorted(glob.glob(os.path.join(tmp_frames_dir, "frame_*.jpg")))
        frames = []
        for index, frame_file in enumerate(frame_files):
            image = cv2.imread(frame_file)
            if image is None:
                continue
            timestamp = round(index * interval_seconds, 2)
            frames.append((timestamp, image))
        return frames
    finally:
        for frame_file in glob.glob(os.path.join(tmp_frames_dir, "*")):
            try:
                os.remove(frame_file)
            except OSError:
                pass
        try:
            os.rmdir(tmp_frames_dir)
        except OSError:
            pass


def generate_thumbnail_bytes(path: str, at_seconds: float = 1.0) -> bytes:
    settings = get_settings()
    tmp_file = os.path.join(settings.tmp_dir, f"thumb_{uuid.uuid4().hex}.jpg")
    try:
        _run(
            [
                settings.ffmpeg_cmd,
                "-y",
                "-ss", str(at_seconds),
                "-i", path,
                "-frames:v", "1",
                "-vf", f"scale=-2:{settings.thumbnail_max_height}",
                "-qscale:v", "3",
                tmp_file,
            ]
        )
        with open(tmp_file, "rb") as f:
            return f.read()
    finally:
        if os.path.exists(tmp_file):
            os.remove(tmp_file)


def generate_preview_bytes(path: str) -> bytes:
    settings = get_settings()
    tmp_file = os.path.join(settings.tmp_dir, f"preview_{uuid.uuid4().hex}.mp4")
    try:
        _run(
            [
                settings.ffmpeg_cmd,
                "-y",
                "-i", path,
                "-t", str(settings.video_preview_max_seconds),
                "-vf", f"scale=-2:{settings.video_preview_max_height}",
                "-an",
                "-c:v", "libx264",
                "-preset", "veryfast",
                "-crf", "28",
                "-movflags", "+faststart",
                tmp_file,
            ],
            timeout=180,
        )
        with open(tmp_file, "rb") as f:
            return f.read()
    finally:
        if os.path.exists(tmp_file):
            os.remove(tmp_file)
