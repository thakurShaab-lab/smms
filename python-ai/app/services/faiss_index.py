import logging
import os
import threading

import faiss
import numpy as np

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class FaissIndexManager:
    """
    Thread-safe wrapper around a FAISS IndexIDMap(IndexFlatIP) used for
    cosine-similarity face matching. Vectors are L2-normalized before being
    added or queried so inner product == cosine similarity.

    The integer label for every vector is the MySQL row id (face_embeddings
    or speaker_embeddings) that the Node backend assigns and passes in on
    every call. This keeps the Python service free of any database
    dependency while still allowing the backend to resolve a match straight
    back to a student. One instance is used per biometric modality (face,
    speaker) - each gets its own index file and embedding dimension.
    """

    def __init__(self, dim: int | None = None, index_path: str | None = None):
        settings = get_settings()
        self.dim = dim or settings.faiss_embedding_dim
        self.index_path = index_path or os.path.join(settings.faiss_index_dir, settings.faiss_index_file)
        # RLock (not Lock): add() calls remove() while already holding the
        # lock, so the same thread must be able to re-acquire it.
        self._lock = threading.RLock()
        self._index = self._load_or_create()

    def _load_or_create(self):
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        if os.path.exists(self.index_path):
            try:
                index = faiss.read_index(self.index_path)
                logger.info("Loaded FAISS index with %d vectors from %s", index.ntotal, self.index_path)
                return index
            except Exception as error:  # noqa: BLE001
                logger.error("Failed to load FAISS index, creating a new one: %s", error)

        base_index = faiss.IndexFlatIP(self.dim)
        index = faiss.IndexIDMap(base_index)
        logger.info("Created a new empty FAISS index (dim=%d)", self.dim)
        return index

    def _save(self):
        faiss.write_index(self._index, self.index_path)

    @staticmethod
    def _normalize(vectors: np.ndarray) -> np.ndarray:
        vectors = np.ascontiguousarray(vectors, dtype=np.float32)
        faiss.normalize_L2(vectors)
        return vectors

    def add(self, label: int, embedding: np.ndarray) -> None:
        vector = self._normalize(embedding.reshape(1, -1))
        ids = np.array([label], dtype=np.int64)
        with self._lock:
            self.remove([label])
            self._index.add_with_ids(vector, ids)
            self._save()

    def remove(self, labels: list[int]) -> None:
        if not labels:
            return
        # faiss's Python wrapper accepts a plain int64 ndarray here and
        # internally builds the IDSelectorBatch/swig_ptr plumbing for us.
        ids = np.array(labels, dtype=np.int64)
        with self._lock:
            self._index.remove_ids(ids)
            self._save()

    def search(self, embedding: np.ndarray, top_k: int) -> list[tuple[int, float]]:
        if self._index.ntotal == 0:
            return []
        vector = self._normalize(embedding.reshape(1, -1))
        with self._lock:
            similarities, labels = self._index.search(vector, min(top_k, self._index.ntotal))
        results = []
        for label, similarity in zip(labels[0], similarities[0]):
            if label == -1:
                continue
            results.append((int(label), float(similarity)))
        return results

    def rebuild(self, entries: list[tuple[int, np.ndarray]]) -> None:
        base_index = faiss.IndexFlatIP(self.dim)
        new_index = faiss.IndexIDMap(base_index)

        if entries:
            vectors = self._normalize(np.stack([entry[1] for entry in entries]))
            ids = np.array([entry[0] for entry in entries], dtype=np.int64)
            new_index.add_with_ids(vectors, ids)

        with self._lock:
            self._index = new_index
            self._save()

    @property
    def total_vectors(self) -> int:
        return self._index.ntotal


_manager: FaissIndexManager | None = None
_speaker_manager: FaissIndexManager | None = None
_manager_lock = threading.Lock()
_speaker_manager_lock = threading.Lock()


def get_faiss_manager() -> FaissIndexManager:
    global _manager
    if _manager is None:
        with _manager_lock:
            if _manager is None:
                _manager = FaissIndexManager()
    return _manager


def get_speaker_faiss_manager() -> FaissIndexManager:
    global _speaker_manager
    if _speaker_manager is None:
        with _speaker_manager_lock:
            if _speaker_manager is None:
                settings = get_settings()
                index_path = os.path.join(settings.faiss_index_dir, settings.speaker_faiss_index_file)
                _speaker_manager = FaissIndexManager(dim=settings.speaker_embedding_dim, index_path=index_path)
    return _speaker_manager
