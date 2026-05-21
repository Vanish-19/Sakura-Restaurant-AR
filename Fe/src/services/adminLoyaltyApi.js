import { apiRequest } from './apiClient.js'

export async function getLoyaltyOverview() {
  return apiRequest('/admin/loyalty/overview', { method: 'GET' })
}

export async function getLoyaltyProfiles(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/admin/loyalty/profiles${query ? `?${query}` : ''}`, { method: 'GET' })
}

export async function getRewardVouchers() {
  return apiRequest('/admin/loyalty/vouchers', { method: 'GET' })
}

export async function createRewardVoucher(payload) {
  return apiRequest('/admin/loyalty/vouchers', { method: 'POST', body: payload })
}

export async function updateRewardVoucher(id, payload) {
  return apiRequest(`/admin/loyalty/vouchers/${id}`, { method: 'PATCH', body: payload })
}

export async function deleteRewardVoucher(id) {
  return apiRequest(`/admin/loyalty/vouchers/${id}`, { method: 'DELETE' })
}
