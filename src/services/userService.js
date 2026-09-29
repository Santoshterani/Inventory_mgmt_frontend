import api from './api.js';

const userService = {
  async list(filters) {
    const { data } = await api.get('/users', { params: filters });
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/users', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.patch(`/users/${id}`, payload);
    return data;
  },
};

export default userService;
