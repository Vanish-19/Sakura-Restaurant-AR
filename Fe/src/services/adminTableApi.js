import { apiRequest } from './apiClient.js';

export async function getAllTables() {
  return apiRequest('/admin/tables', { method: 'GET' });
}

export async function createTable(payload) {
  return apiRequest('/admin/tables', { method: 'POST', body: payload });
}

export async function updateTable(id, payload) {
  return apiRequest(`/admin/tables/${id}`, { method: 'PUT', body: payload });
}

export async function deleteTable(id) {
  return apiRequest(`/admin/tables/${id}`, { method: 'DELETE' });
}

export async function resetTable(id) {
  return apiRequest(`/admin/tables/${id}/reset`, { method: 'POST' });
}
