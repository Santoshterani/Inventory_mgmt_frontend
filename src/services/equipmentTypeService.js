import api from './api.js';

const equipmentTypeService = {
  async list() {
    const { data } = await api.get('/equipment-types');
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/equipment-types', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.patch(`/equipment-types/${id}`, payload);
    return data;
  },
};

export default equipmentTypeService;
