from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    host: str = "0.0.0.0"
    port: int = 8000
    environment: str = "development"

    internal_api_key: str = "change_me_internal_service_key"
    allowed_origins: str = "http://localhost:4000"

    insightface_model_name: str = "buffalo_l"
    insightface_providers: str = "CPUExecutionProvider"
    insightface_det_size: int = 640
    face_min_det_score: float = 0.55
    face_match_threshold: float = 0.42

    faiss_index_dir: str = "./storage/faiss_index"
    faiss_index_file: str = "index.faiss"
    faiss_embedding_dim: int = 512

    speaker_model_source: str = "speechbrain/spkrec-ecapa-voxceleb"
    speaker_model_dir: str = "./storage/speaker_model"
    speaker_embedding_dim: int = 192
    speaker_faiss_index_file: str = "speaker_index.faiss"
    speaker_match_threshold: float = 0.5
    audio_segment_seconds: float = 4.0
    audio_max_segments_sampled: int = 60
    audio_min_segment_seconds: float = 1.5

    tmp_dir: str = "./storage/tmp"
    max_download_size_mb: int = 600
    download_timeout_seconds: int = 90

    video_frame_interval_seconds: float = 1.0
    video_max_frames_sampled: int = 60
    video_preview_max_seconds: int = 6
    video_preview_max_height: int = 480
    thumbnail_max_height: int = 480

    tesseract_cmd: str = "tesseract"
    ffmpeg_cmd: str = "ffmpeg"
    ffprobe_cmd: str = "ffprobe"

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    @property
    def insightface_providers_list(self) -> list[str]:
        return [p.strip() for p in self.insightface_providers.split(",") if p.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
