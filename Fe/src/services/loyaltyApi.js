import { apiRequest } from './apiClient.js'

export async function getAvailableRewardVouchers() {
  return apiRequest('/loyalty/vouchers', {
    method: 'GET',
  })
}

export async function previewLoyalty(phone, subtotal = 0) {
  return apiRequest('/loyalty/preview', {
    method: 'POST',
    body: {
      phone,
      subtotal: Math.max(0, Math.round(Number(subtotal) || 0)),
    },
  })
}

export async function getMyLoyaltySummary() {
  return apiRequest('/loyalty/me', {
    method: 'GET',
  })
}
