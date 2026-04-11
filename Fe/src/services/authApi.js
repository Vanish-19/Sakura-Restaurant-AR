import { apiRequest } from './apiClient.js'

export async function adminLogin(identity, password) {
  const username = String(identity || '').trim()

  const response = await apiRequest('/admin/auth/login', {
    method: 'POST',
    body: {
      username,
      password,
    },
  })

  return response?.data ?? response
}
