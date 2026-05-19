import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const SERVER_BASE = API_BASE.replace(/\/api\/?$/, '');

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('adas_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adas_token');
      localStorage.removeItem('adas_user');
      if (!location.pathname.includes('/login')) location.href = '/login';
    }
    return Promise.reject(error);
  }
);
