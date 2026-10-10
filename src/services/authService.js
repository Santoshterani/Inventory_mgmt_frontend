import api from './api.js';

const authService = {
  async login(username, password) {
    const { data } = await api.post('/auth/login', { username, password });
    if (data?.token) {
      localStorage.setItem('ams_token', data.token);
    }
    return data.user;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('ams_token');
    }
  },

  async me() {
    const { data } = await api.get('/auth/me');
    return data.user;
  },

  // Self-service change, used both voluntarily (Navbar menu) and to clear a
  // temporary/reset password (must_change_password gate).
  async changePassword(currentPassword, newPassword) {
    await api.patch('/auth/change-password', { currentPassword, newPassword });
  },

  // "Forgot password" flow. No email provider is configured yet, so in
  // non-production the backend echoes a dev reset link/token in the
  // response so this is testable end-to-end without real email delivery.
  async forgotPassword(username) {
    const { data } = await api.post('/auth/forgot-password', { username });
    return data;
  },

  async resetPassword(token, newPassword) {
    await api.post('/auth/reset-password', { token, newPassword });
  },
};

export default authService;
