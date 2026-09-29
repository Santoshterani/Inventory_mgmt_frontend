import api from './api.js';

const assignmentService = {
  async list(filters) {
    const { data } = await api.get('/assignments', { params: filters });
    return data;
  },

  async get(id) {
    const { data } = await api.get(`/assignments/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/assignments', payload);
    return data;
  },
};

export default assignmentService;
