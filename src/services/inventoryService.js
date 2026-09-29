import api from './api.js';

const inventoryService = {
  async list(filters) {
    const { data } = await api.get('/inventory', { params: filters });
    return data;
  },
};

export default inventoryService;
