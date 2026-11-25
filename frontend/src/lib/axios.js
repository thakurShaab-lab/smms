import axios from 'axios';
import { getAccessToken, setAccessToken } from './tokenStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((response) => {
        const token = response.data?.data?.accessToken;
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        const token = await refreshAccessToken();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch {
        setAccessToken(null);
      }
    }

    return Promise.reject(error);
  }
);

export function extractErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
}
