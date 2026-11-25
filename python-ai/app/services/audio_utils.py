import json
import subprocess

from app.core.config import get_settings
from app.services.video_utils import VideoProcessingError


def probe_audio(path: str) -> dict:
    settings = get_settings()
    try:
        result = subprocess.run(
            [
                settings.ffprobe_cmd,
                "-v", "error",
                "-print_format", "json",
                "-show_format",
                "-show_streams",
                path,
            ],
            capture_output=True,
            timeout=60,
            check=True,
        )
    except subprocess.CalledProcessError as error:
        stderr = error.stderr.decode("utf-8", errors="ignore") if error.stderr else ""
        raise VideoProcessingError(f"ffprobe failed: {stderr[-500:]}") from error

    data = json.loads(result.stdout.decode("utf-8"))
    audio_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "audio"), {})
    duration = float(data.get("format", {}).get("duration", 0) or 0)
    bitrate = data.get("format", {}).get("bit_rate")

    return {
        "duration_seconds": duration,
        "codec": audio_stream.get("codec_name"),
        "bitrate": int(bitrate) if bitrate else None,
        "sample_rate": int(audio_stream["sample_rate"]) if audio_stream.get("sample_rate") else None,
    }
