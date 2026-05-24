import { apiRequest } from './apiClient.js'

export async function createPayment(orderId, method) {
  return apiRequest('/admin/payments', {
    method: 'POST',
    body: { order_id: orderId, method },
  })
}

export async function confirmCodPayment(paymentId) {
  return apiRequest(`/admin/payments/${paymentId}/confirm-cod`, {
    method: 'POST',
  })
}
