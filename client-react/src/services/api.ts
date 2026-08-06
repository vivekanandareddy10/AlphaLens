import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Trigger research workflow
  research: async (companyName: string) => {
    const response = await apiClient.post('/research', { companyName });
    return response.data;
  },

  // Get all saved reports
  getReports: async () => {
    const response = await apiClient.get('/reports');
    return response.data;
  },

  // Get specific report details
  getReport: async (id: string) => {
    const response = await apiClient.get(`/reports/${id}`);
    return response.data;
  },

  // Delete a report
  deleteReport: async (id: string) => {
    const response = await apiClient.delete(`/reports/${id}`);
    return response.data;
  },

  // Get recent searches
  getHistory: async () => {
    const response = await apiClient.get('/history');
    return response.data;
  },
};
