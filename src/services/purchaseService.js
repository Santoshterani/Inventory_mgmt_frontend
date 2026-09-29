import api from './api.js';

const purchaseService = {
  async list(filters) {
    const { data } = await api.get('/purchases', { params: filters });
    return data;
  },

  async get(id) {
    const { data } = await api.get(`/purchases/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/purchases', payload);
    return data;
  },
};

export default purchaseService;
