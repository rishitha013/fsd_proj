import axios from 'axios';

// Ensure /api is at the end of the base URL
const RAW_URL = import.meta.env.VITE_API_URL || 'https://fsd-proj-62kb.onrender.com/api';
const API_BASE = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDashboardStats = () => api.get('/dashboard/stats');
export const createApplication = (data) => api.post('/applications', data);
export const getApplications = (limit = 50) => api.get(`/applications?limit=${limit}`);
export const getApplicationById = (id) => api.get(`/applications/${id}`);
export const runWhatIf = (payload) => api.post('/what-if', payload);
export const sendChatMessage = (payload) => api.post('/chat', payload);

export default api;
