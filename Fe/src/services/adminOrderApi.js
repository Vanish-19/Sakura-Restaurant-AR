import { apiRequest } from './apiClient.js';

export async function getAllOrders(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/admin/orders?${query}`, { method: 'GET' });
}

export async function getOrderById(id) {
  return apiRequest(`/admin/orders/${id}`, { method: 'GET' });
}

export async function updateOrderStatus(id, status) {
  return apiRequest(`/admin/orders/${id}/status`, { method: 'PUT', body: { status } });
}

export async function cancelOrder(id) {
  return apiRequest(`/admin/orders/${id}/cancel`, { method: 'PUT' });
}

export async function getOrderStats() {
  return apiRequest(`/admin/orders/stats`, { method: 'GET' });
}
