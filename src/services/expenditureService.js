import api from './api.js';

const expenditureService = {
  async list(filters) {
    const { data } = await api.get('/expenditures', { params: filters });
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/expenditures', payload);
    return data;
  },
};

export default expenditureService;
