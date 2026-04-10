import { apiRequest } from './apiClient.js'

export async function adminLogin(identity, password) {
  const username = identity

  return apiRequest('/admin/auth/login', {
    method: 'POST',
    body: {
      username,
      password,
    },
  })
}
