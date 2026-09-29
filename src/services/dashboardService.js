import api from './api.js';

const dashboardService = {
  async getMetrics(filters) {
    const { data } = await api.get('/dashboard', { params: filters });
    return data;
  },

  async getNetMovementDetails(filters) {
    const { data } = await api.get('/dashboard/net-movement-details', { params: filters });
    return data;
  },
};

export default dashboardService;
