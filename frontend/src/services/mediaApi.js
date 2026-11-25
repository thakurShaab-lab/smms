import { api } from '@/lib/axios';

const UPLOAD_ENDPOINTS = {
  photo: '/media/photos',
  video: '/media/videos',
  document: '/media/documents',
  audio: '/media/audio'
};

export async function uploadMedia(mediaType, file, meta, onUploadProgress) {
  const formData = new FormData();
  formData.append('file', file);
  if (meta?.classId) formData.append('classId', meta.classId);
  if (meta?.sectionId) formData.append('sectionId', meta.sectionId);
  if (meta?.capturedAt) formData.append('capturedAt', meta.capturedAt);

  const { data } = await api.post(UPLOAD_ENDPOINTS[mediaType], formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
  return data.data;
}

export async function listMedia(params) {
  const { data } = await api.get('/media', { params });
  return data;
}

export async function getMedia(id) {
  const { data } = await api.get(`/media/${id}`);
  return data.data;
}

export async function deleteMedia(id) {
  await api.delete(`/media/${id}`);
}

export async function tagStudentInMedia(mediaId, studentId) {
  const { data } = await api.post(`/media/${mediaId}/mappings`, { studentId });
  return data.data;
}

export async function untagStudentFromMedia(mediaId, studentId) {
  await api.delete(`/media/${mediaId}/mappings/${studentId}`);
}
