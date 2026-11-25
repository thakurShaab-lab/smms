import { api } from '@/lib/axios';

export async function listClasses() {
  const { data } = await api.get('/classes');
  return data.data;
}

export async function createClass(payload) {
  const { data } = await api.post('/classes', payload);
  return data.data;
}

export async function updateClass(id, payload) {
  const { data } = await api.patch(`/classes/${id}`, payload);
  return data.data;
}

export async function deleteClass(id) {
  await api.delete(`/classes/${id}`);
}

export async function createSection(payload) {
  const { data } = await api.post('/classes/sections', payload);
  return data.data;
}

export async function updateSection(id, payload) {
  const { data } = await api.patch(`/classes/sections/${id}`, payload);
  return data.data;
}

export async function deleteSection(id) {
  await api.delete(`/classes/sections/${id}`);
}
