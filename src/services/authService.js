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
};

export default authService;
