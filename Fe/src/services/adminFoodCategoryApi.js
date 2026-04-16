import { apiRequest } from './apiClient.js';

export async function getAllFoodCategories() {
  return apiRequest('/admin/food-categories', { method: 'GET' });
}

export async function createFoodCategory(payload) {
  return apiRequest('/admin/food-categories', { method: 'POST', body: payload });
}

export async function updateFoodCategory(id, payload) {
  return apiRequest(`/admin/food-categories/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteFoodCategory(id, payload = {}) {
  return apiRequest(`/admin/food-categories/${id}`, { method: 'DELETE', body: payload });
}