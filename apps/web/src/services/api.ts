import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';
// Đảm bảo loại bỏ dấu / ở cuối nếu có để tránh bị double slash //
const cleanBaseURL = rawBaseURL.replace(/\/+$/, ''); 

const baseURL = cleanBaseURL.endsWith('/api') ? cleanBaseURL : `${cleanBaseURL}/api`;

const tokenStorage = {
  get(): string | null {
    return localStorage.getItem('travelmind_token');
  },
  set(token: string) {
    localStorage.setItem('travelmind_token', token);
  },
  clear() {
    localStorage.removeItem('travelmind_token');
  },
};

export const tokenStore = tokenStorage;

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 20000,
});

// Dedicated instance for long-running AI calls (Gemini can take 40-90s).
// Shares the same baseURL + token middleware; only the timeout differs.
export const aiApi: AxiosInstance = axios.create({
  baseURL,
  timeout: 90000,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string | string[] }>) => {
    const status = error.response?.status;
    const message = extractMessage(error);

    if (status === 401) {
      tokenStorage.clear();
    } else if (typeof message === 'string' && message) {
      toast.error(message);
    }
    return Promise.reject(error);
  },
);

// Apply the same auth + error handling to aiApi so callers can use it
// transparently with the same toast behaviour.
aiApi.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

aiApi.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string | string[] }>) => {
    const status = error.response?.status;
    const message = extractMessage(error);

    if (status === 401) {
      tokenStorage.clear();
    } else if (typeof message === 'string' && message) {
      // Skip noisy timeout toast - caller will handle UX.
      if (error.code !== 'ECONNABORTED') {
        toast.error(message);
      }
    }
    return Promise.reject(error);
  },
);

function extractMessage(error: AxiosError<{ message?: string | string[] }>): string {
  const data = error.response?.data;
  if (data?.message) {
    if (Array.isArray(data.message)) return data.message.join(', ');
    return data.message;
  }
  return error.message ?? 'Request failed';
}
