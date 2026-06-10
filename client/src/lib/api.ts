import axios, { AxiosError } from 'axios';
import { clearToken, getToken } from './auth-storage';

export interface ApiErrorPayload {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the bearer token (when present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Catch 401 responses, clear the stale token and redirect back to login.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearToken();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

/** Extract a human-friendly message from an Axios error using the API payload. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorPayload | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }
  }
  return fallback;
}

export default api;
