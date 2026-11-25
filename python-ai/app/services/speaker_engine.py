import logging
import threading

import numpy as np
import torch

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _patch_symlink_fallback():
    """SpeechBrain's Pretrainer (which downloads the actual model checkpoint
    files, separately from the hyperparams.yaml fetched by from_hparams())
    always uses LocalStrategy.SYMLINK internally regardless of the
    local_strategy passed to from_hparams() - and creating a symlink on
    Windows requires Developer Mode or admin rights, which a normal dev/
    prod install won't have. Patch the low-level linking function itself so
    any symlink permission failure falls back to a plain file copy."""
    import speechbrain.utils.fetching as sb_fetching

    if getattr(sb_fetching.link_with_strategy, "_smms_patched", False):
        return

    original = sb_fetching.link_with_strategy

    def patched(src, dst, local_strategy):
        if local_strategy == sb_fetching.LocalStrategy.SYMLINK:
            try:
                return original(src, dst, local_strategy)
            except OSError as error:
                logger.warning("Symlink failed (%s); falling back to file copy for %s", error, src)
                return original(src, dst, sb_fetching.LocalStrategy.COPY)
        return original(src, dst, local_strategy)

    patched._smms_patched = True
    sb_fetching.link_with_strategy = patched


_patch_symlink_fallback()


class SpeakerEmbeddingResult:
    def __init__(self, embedding: np.ndarray, quality_score: float):
        self.embedding = embedding
        self.quality_score = quality_score


class SpeakerEngine:
    """Wraps SpeechBrain's pretrained ECAPA-TDNN speaker embedding model
    (192-d x-vectors), mirroring how FaceEngine wraps InsightFace for face
    biometrics. There is no detector here (unlike faces, a segment of audio
    either has enough voice signal to embed or it doesn't) - quality is
    approximated from signal energy so near-silent segments are skipped."""

    def __init__(self):
        from speechbrain.inference.speaker import EncoderClassifier
        from speechbrain.utils.fetching import LocalStrategy

        settings = get_settings()
        self._lock = threading.Lock()
        self._classifier = EncoderClassifier.from_hparams(
            source=settings.speaker_model_source,
            savedir=settings.speaker_model_dir,
            run_opts={"device": "cpu"},
            # Symlinks (SpeechBrain's default) need elevated privileges on
            # Windows; copying the cached model files works everywhere.
            local_strategy=LocalStrategy.COPY,
        )
        self.min_segment_seconds = settings.audio_min_segment_seconds
        logger.info("Speaker embedding engine ready (model=%s)", settings.speaker_model_source)

    def get_embedding(self, waveform: np.ndarray, sample_rate: int) -> SpeakerEmbeddingResult | None:
        duration = len(waveform) / sample_rate
        if duration < self.min_segment_seconds:
            return None

        rms = float(np.sqrt(np.mean(np.square(waveform)))) if len(waveform) else 0.0
        # Empirical scaling: typical recorded speech RMS is roughly in the
        # 0.02-0.1 range, so this puts normal speech near 0.3-1.0 and
        # near-silence near 0.
        quality_score = min(1.0, rms * 10)
        if quality_score < 0.03:
            return None

        tensor = torch.from_numpy(waveform).float().unsqueeze(0)
        with self._lock:
            embedding = self._classifier.encode_batch(tensor)

        vector = embedding.squeeze().detach().numpy().astype(np.float32)
        return SpeakerEmbeddingResult(embedding=vector, quality_score=quality_score)


_engine: SpeakerEngine | None = None
_engine_lock = threading.Lock()


def get_speaker_engine() -> SpeakerEngine:
    global _engine
    if _engine is None:
        with _engine_lock:
            if _engine is None:
                _engine = SpeakerEngine()
    return _engine
