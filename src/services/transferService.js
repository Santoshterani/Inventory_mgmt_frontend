import api from './api.js';

const transferService = {
  async list(filters) {
    const { data } = await api.get('/transfers', { params: filters });
    return data;
  },

  async get(id) {
    const { data } = await api.get(`/transfers/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/transfers', payload);
    return data;
  },

  async changeStatus(id, status) {
    const { data } = await api.patch(`/transfers/${id}/status`, { status });
    return data;
  },
};

export default transferService;
