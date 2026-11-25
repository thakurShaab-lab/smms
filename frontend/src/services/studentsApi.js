import { api } from '@/lib/axios';

export async function listStudents(params) {
  const { data } = await api.get('/students', { params });
  return data;
}

export async function getStudent(id) {
  const { data } = await api.get(`/students/${id}`);
  return data.data;
}

export async function createStudent(payload) {
  const { data } = await api.post('/students', payload);
  return data.data;
}

export async function updateStudent(id, payload) {
  const { data } = await api.patch(`/students/${id}`, payload);
  return data.data;
}

export async function deleteStudent(id) {
  await api.delete(`/students/${id}`);
}

export async function listFaceImages(studentId) {
  const { data } = await api.get(`/students/${studentId}/faces`);
  return data.data;
}

export async function addFaceImage(studentId, file) {
  const formData = new FormData();
  formData.append('faceImage', file);
  const { data } = await api.post(`/students/${studentId}/faces`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data.data;
}

export async function removeFaceImage(studentId, faceId) {
  await api.delete(`/students/${studentId}/faces/${faceId}`);
}

export async function rebuildFaceIndex() {
  const { data } = await api.post('/students/face-index/rebuild');
  return data.data;
}

export async function listVoiceSamples(studentId) {
  const { data } = await api.get(`/students/${studentId}/voices`);
  return data.data;
}

export async function addVoiceSample(studentId, file) {
  const formData = new FormData();
  formData.append('voiceSample', file);
  const { data } = await api.post(`/students/${studentId}/voices`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data.data;
}

export async function removeVoiceSample(studentId, voiceId) {
  await api.delete(`/students/${studentId}/voices/${voiceId}`);
}

export async function rebuildSpeakerIndex() {
  const { data } = await api.post('/students/voice-index/rebuild');
  return data.data;
}
