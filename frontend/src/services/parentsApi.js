import { api } from '@/lib/axios';

export async function listParents(params) {
  const { data } = await api.get('/parents', { params });
  return data;
}

export async function getParent(id) {
  const { data } = await api.get(`/parents/${id}`);
  return data.data;
}

export async function createParent(payload) {
  const { data } = await api.post('/parents', payload);
  return data.data;
}

export async function updateParent(id, payload) {
  const { data } = await api.patch(`/parents/${id}`, payload);
  return data.data;
}

export async function linkStudentToParent(parentId, payload) {
  const { data } = await api.post(`/parents/${parentId}/students`, payload);
  return data.data;
}

export async function unlinkStudentFromParent(parentId, studentId) {
  await api.delete(`/parents/${parentId}/students/${studentId}`);
}
