import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL,
  withCredentials: true, // allow cookie-based sessions if the backend uses them
});

// Attach bearer token for token-based auth (FR-01). Harmless no-op if the
// backend instead relies purely on httpOnly session cookies.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ams_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralize 401/403 handling so every screen behaves consistently
// (section 3.5: 401 = not authenticated, 403 = not authorized).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const code = error?.response?.data?.details?.code;
    if (status === 401) {
      localStorage.removeItem('ams_token');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    // Defense in depth: the backend also blocks every route but /api/auth/*
    // while a temporary/reset password hasn't been changed yet. Normally the
    // frontend router redirects first, but if something slips through,
    // honor the same rule here.
    if (status === 403 && code === 'MUST_CHANGE_PASSWORD') {
      if (window.location.pathname !== '/change-password') {
        window.location.assign('/change-password');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
