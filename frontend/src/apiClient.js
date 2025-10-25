// frontend/src/apiClient.js
// Axios instance with auth header from localStorage
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to gracefully handle auth expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        // Clear stale credentials and navigate to login
        localStorage.removeItem('token');
        const isLoginRoute = window.location.pathname === '/login';
        if (!isLoginRoute) {
          window.location.href = '/login';
        }
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;