import { apiRequest } from './apiClient.js';

export async function createReservation(payload) {
  return apiRequest('/reservations', { method: 'POST', body: payload });
}
