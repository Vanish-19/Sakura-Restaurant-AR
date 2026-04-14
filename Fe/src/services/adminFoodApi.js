import { apiRequest } from './apiClient.js';

export async function getAllFoods(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/admin/foods?${query}`, { method: 'GET' });
}

export async function getFoodById(id) {
  return apiRequest(`/admin/foods/${id}`, { method: 'GET' });
}

export async function createFood(payload) {
  return apiRequest(`/admin/foods`, { method: 'POST', body: payload });
}

export async function updateFood(id, payload) {
  return apiRequest(`/admin/foods/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteFood(id) {
  return apiRequest(`/admin/foods/${id}`, { method: 'DELETE' });
}
