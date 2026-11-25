import { api } from '@/lib/axios';

export async function loginRequest({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data;
}

export async function logoutRequest() {
  await api.post('/auth/logout');
}

export async function refreshRequest() {
  const { data } = await api.post('/auth/refresh');
  return data.data;
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/auth/me');
  return data.data;
}

export async function changePasswordRequest(payload) {
  const { data } = await api.post('/auth/change-password', payload);
  return data;
}
