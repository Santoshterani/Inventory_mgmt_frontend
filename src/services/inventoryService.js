import api from './api.js';

const inventoryService = {
  async list(filters) {
    const { data } = await api.get('/inventory', { params: filters });
    return data;
  },

  // Admin adds/corrects inventory directly, separate from purchases/transfers.
  async upsert(payload) {
    const { data } = await api.post('/inventory', payload);
    return data;
  },
};

export default inventoryService;
