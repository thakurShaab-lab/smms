from typing import Optional

from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int


class FaceMatch(BaseModel):
    faiss_label: int
    similarity: float


class DetectedFace(BaseModel):
    bbox: BoundingBox
    quality_score: float
    matches: list[FaceMatch] = Field(default_factory=list)
    timestamp: Optional[float] = None


# ---------------------------------------------------------------------------
# Face enrollment
# ---------------------------------------------------------------------------
class EnrollFaceRequest(BaseModel):
    faiss_label: int
    student_id: int
    image_url: str


class EnrollFaceResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    faiss_label: Optional[int] = None
    quality_score: Optional[float] = None
    bbox: Optional[BoundingBox] = None


class RemoveFaceRequest(BaseModel):
    faiss_label: int


class RebuildIndexEntry(BaseModel):
    faiss_label: int
    image_url: str


class RebuildIndexRequest(BaseModel):
    entries: list[RebuildIndexEntry]


class RebuildIndexResponse(BaseModel):
    success: bool
    total_entries: int
    enrolled: int
    failed: list[int] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Recognition
# ---------------------------------------------------------------------------
class RecognizePhotoRequest(BaseModel):
    image_url: str
    top_k: int = 5
    threshold: float = 0.42


class RecognizePhotoResponse(BaseModel):
    width: int
    height: int
    faces: list[DetectedFace] = Field(default_factory=list)


class RecognizeVideoRequest(BaseModel):
    video_url: str
    frame_interval_seconds: float = 1.0
    top_k: int = 5
    threshold: float = 0.42


class SampledFrame(BaseModel):
    timestamp: float
    faces: list[DetectedFace] = Field(default_factory=list)


class RecognizeVideoResponse(BaseModel):
    width: int
    height: int
    duration_seconds: float
    fps: float
    frame_count: int
    thumbnail_base64: Optional[str] = None
    thumbnail_mime: Optional[str] = None
    preview_base64: Optional[str] = None
    preview_mime: Optional[str] = None
    frames: list[SampledFrame] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Documents
# ---------------------------------------------------------------------------
class ProcessDocumentRequest(BaseModel):
    document_url: str
    mime_type: str
    top_k: int = 3
    threshold: float = 0.42


class ExtractedStudentFields(BaseModel):
    student_name: Optional[str] = None
    admission_number: Optional[str] = None
    roll_number: Optional[str] = None
    class_name: Optional[str] = None
    section_name: Optional[str] = None


class ProcessDocumentResponse(BaseModel):
    raw_text: str
    extracted: ExtractedStudentFields
    confidence: float
    page_image_base64: Optional[str] = None
    page_image_mime: Optional[str] = None
    faces: list[DetectedFace] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Audio metadata
# ---------------------------------------------------------------------------
class AudioMetadataRequest(BaseModel):
    audio_url: str


class AudioMetadataResponse(BaseModel):
    duration_seconds: Optional[float] = None
    codec: Optional[str] = None
    bitrate: Optional[int] = None
    sample_rate: Optional[int] = None


# ---------------------------------------------------------------------------
# Speaker enrollment (voice biometrics - mirrors face enrollment)
# ---------------------------------------------------------------------------
class EnrollSpeakerRequest(BaseModel):
    faiss_label: int
    student_id: int
    audio_url: str


class EnrollSpeakerResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    faiss_label: Optional[int] = None
    quality_score: Optional[float] = None


class RemoveSpeakerRequest(BaseModel):
    faiss_label: int


class RebuildSpeakerIndexEntry(BaseModel):
    faiss_label: int
    audio_url: str


class RebuildSpeakerIndexRequest(BaseModel):
    entries: list[RebuildSpeakerIndexEntry]


class RebuildSpeakerIndexResponse(BaseModel):
    success: bool
    total_entries: int
    enrolled: int
    failed: list[int] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Audio recognition (multi-speaker matching - mirrors video recognition)
# ---------------------------------------------------------------------------
class SpeakerMatch(BaseModel):
    faiss_label: int
    similarity: float


class DetectedSpeakerSegment(BaseModel):
    start_time: float
    end_time: float
    quality_score: float
    matches: list[SpeakerMatch] = Field(default_factory=list)


class RecognizeAudioRequest(BaseModel):
    audio_url: str
    segment_seconds: Optional[float] = None
    top_k: int = 5
    threshold: float = 0.5


class RecognizeAudioResponse(BaseModel):
    duration_seconds: float
    codec: Optional[str] = None
    bitrate: Optional[int] = None
    sample_rate: Optional[int] = None
    segments: list[DetectedSpeakerSegment] = Field(default_factory=list)
