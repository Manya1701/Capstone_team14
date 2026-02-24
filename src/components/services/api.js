import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User API calls
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAllowedPorts: () => api.get('/users/allowed-ports'),
};

// Request API calls
export const requestAPI = {
  createRequest: (data) => api.post('/requests', data),
  getMyRequests: () => api.get('/requests/my-requests'),
  getAllRequests: (filters) => api.get('/requests', { params: filters }),
  approveRequest: (id, comment) => api.put(`/requests/${id}/approve`, { comment }),
  denyRequest: (id, comment) => api.put(`/requests/${id}/deny`, { comment }),
};

// Admin API calls
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  managePort: (userId, port, action) => 
    api.post('/admin/ports/manage', { userId, port, action }),
  getPendingRequests: () => api.get('/admin/requests/pending'),
  getAuditLogs: (filters) => api.get('/admin/audit-logs', { params: filters }),
  exportAuditLogs: (filters) => api.get('/admin/audit-logs/export', { 
    params: filters,
    responseType: 'blob' 
  }),
};

export default api;