import { api } from '@/lib/axios';

export async function listTeachers(params) {
  const { data } = await api.get('/teachers', { params });
  return data;
}

export async function getTeacher(id) {
  const { data } = await api.get(`/teachers/${id}`);
  return data.data;
}

export async function createTeacher(payload) {
  const { data } = await api.post('/teachers', payload);
  return data.data;
}

export async function updateTeacher(id, payload) {
  const { data } = await api.patch(`/teachers/${id}`, payload);
  return data.data;
}

export async function deleteTeacher(id) {
  await api.delete(`/teachers/${id}`);
}
