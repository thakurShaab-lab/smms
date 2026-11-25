import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

const client = axios.create({
  baseURL: env.pythonAi.baseUrl,
  timeout: env.pythonAi.timeoutMs,
  headers: {
    'X-Internal-Api-Key': env.pythonAi.apiKey,
    'Content-Type': 'application/json'
  }
});

async function call(method, url, data) {
  try {
    const response = await client.request({ method, url, data });
    return response.data;
  } catch (error) {
    const detail = error.response?.data?.detail || error.response?.data?.message || error.message;
    logger.error('Python AI service call failed', { url, detail });
    throw new AppError(`AI service error: ${detail}`, 502, 'AI_SERVICE_ERROR');
  }
}

export function enrollFace({ faissLabel, studentId, imageUrl }) {
  return call('post', '/api/v1/faces/enroll', {
    faiss_label: faissLabel,
    student_id: studentId,
    image_url: imageUrl
  });
}

export function removeFace({ faissLabel }) {
  return call('post', '/api/v1/faces/remove', { faiss_label: faissLabel });
}

export function rebuildFaceIndex({ entries }) {
  return call('post', '/api/v1/faces/rebuild-index', {
    entries: entries.map((entry) => ({ faiss_label: entry.faissLabel, image_url: entry.imageUrl }))
  });
}

export function recognizePhoto({ imageUrl, topK = 5, threshold = 0.42 }) {
  return call('post', '/api/v1/recognition/photo', { image_url: imageUrl, top_k: topK, threshold });
}

export function recognizeVideo({ videoUrl, frameIntervalSeconds = 1, topK = 5, threshold = 0.42 }) {
  return call('post', '/api/v1/recognition/video', {
    video_url: videoUrl,
    frame_interval_seconds: frameIntervalSeconds,
    top_k: topK,
    threshold
  });
}

export function processDocument({ documentUrl, mimeType, topK = 3, threshold = 0.42 }) {
  return call('post', '/api/v1/documents/process', {
    document_url: documentUrl,
    mime_type: mimeType,
    top_k: topK,
    threshold
  });
}

export function enrollSpeaker({ faissLabel, studentId, audioUrl }) {
  return call('post', '/api/v1/speakers/enroll', {
    faiss_label: faissLabel,
    student_id: studentId,
    audio_url: audioUrl
  });
}

export function removeSpeaker({ faissLabel }) {
  return call('post', '/api/v1/speakers/remove', { faiss_label: faissLabel });
}

export function rebuildSpeakerIndex({ entries }) {
  return call('post', '/api/v1/speakers/rebuild-index', {
    entries: entries.map((entry) => ({ faiss_label: entry.faissLabel, audio_url: entry.audioUrl }))
  });
}

export function recognizeAudio({ audioUrl, segmentSeconds, topK = 5, threshold = 0.5 }) {
  return call('post', '/api/v1/recognition/audio', {
    audio_url: audioUrl,
    segment_seconds: segmentSeconds,
    top_k: topK,
    threshold
  });
}

export function checkHealth() {
  return call('get', '/api/v1/health');
}
