import { apiRequest } from './apiClient.js';

export async function getAllUsers(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/admin/users?${query}`, { method: 'GET' });
}

export async function getUserStats() {
  return apiRequest(`/admin/users/stats`, { method: 'GET' });
}

export async function getUserById(id) {
  return apiRequest(`/admin/users/${id}`, { method: 'GET' });
}

export async function createUser(payload) {
  return apiRequest(`/admin/users`, { method: 'POST', body: payload });
}

export async function updateUser(id, payload) {
  return apiRequest(`/admin/users/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteUser(id) {
  return apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
}
