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
    if (status === 401) {
      localStorage.removeItem('ams_token');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
