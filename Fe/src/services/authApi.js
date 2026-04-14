import { apiRequest } from './apiClient.js'

export async function userRegister(payload) {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: payload,
  })

  return response?.data ?? response
}

export async function userLogin(identity, password) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: {
      identity: String(identity || '').trim(),
      password,
    },
  })

  return response?.data ?? response
}

export async function userPhoneToken(phone, name) {
  const response = await apiRequest('/auth/phone-token', {
    method: 'POST',
    body: {
      phone: String(phone || '').trim(),
      name: String(name || '').trim(),
    },
  })

  return response?.data ?? response
}

export async function userRefreshToken(refreshToken) {
  const response = await apiRequest('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  })

  return response?.data ?? response
}

export async function userLogout() {
  return apiRequest('/auth/logout', {
    method: 'POST',
  })
}

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

export async function adminRefreshToken(refreshToken) {
  const response = await apiRequest('/admin/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  })

  return response?.data ?? response
}

export async function adminLogout() {
  return apiRequest('/admin/auth/logout', {
    method: 'POST',
  })
}
