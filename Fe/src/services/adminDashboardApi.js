import { apiRequest } from './apiClient.js';

export async function getDashboardStats() {
  return apiRequest('/admin/dashboard/stats', { method: 'GET' });
}
