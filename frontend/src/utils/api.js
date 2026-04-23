import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});

export const scanAPI = {
  start: (data) => api.post('/scan', data),
  getAll: () => api.get('/scan'),
  getById: (id) => api.get(`/scan/${id}`),
};

export const portAPI = {
  block: (port, protocol, reason) => api.post('/ports/block', { port, protocol, reason }),
  allow: (port, protocol) => api.post('/ports/allow', { port, protocol }),
  getRules: () => api.get('/ports/rules'),
  getStatus: (port) => api.get(`/ports/status/${port}`),
};

export const logAPI = {
  getAll: (params) => api.get('/logs', { params }),
  clear: () => api.delete('/logs'),
};

export const alertAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  acknowledge: (id) => api.put(`/alerts/${id}/acknowledge`),
  acknowledgeAll: () => api.put('/alerts/acknowledge-all'),
  delete: (id) => api.delete(`/alerts/${id}`),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
