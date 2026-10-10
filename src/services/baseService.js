import api from './api.js';

const baseService = {
  async list() {
    const { data } = await api.get('/bases');
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/bases', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.patch(`/bases/${id}`, payload);
    return data;
  },
};

export default baseService;
