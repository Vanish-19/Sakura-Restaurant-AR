import { apiRequest } from './apiClient.js';

export async function getAllAdmins() {
  return apiRequest('/admin/accounts', { method: 'GET' });
}

export async function getAdminStats() {
  return apiRequest('/admin/accounts/stats', { method: 'GET' });
}

export async function toggleAdminStatus(id) {
  return apiRequest(`/admin/accounts/${id}/toggle-status`, { method: 'PATCH' });
}

export async function getAdminDetail(id) {
  return apiRequest(`/admin/accounts/${id}`, { method: 'GET' });
}

export async function resetAdminPassword(id, password) {
  return apiRequest(`/admin/accounts/${id}/password`, {
    method: 'PATCH',
    body: { password },
  });
}

export async function registerAdmin(payload) {
  return apiRequest('/admin/auth/register', { method: 'POST', body: payload });
}
