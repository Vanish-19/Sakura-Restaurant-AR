import { apiRequest } from './apiClient.js'

const USE_MOCK_ADMIN_AUTH = import.meta.env.VITE_USE_MOCK_ADMIN_AUTH !== 'false'

const MOCK_ADMIN_ACCOUNT = {
  username: 'admin',
  password: 'admin123',
  role: 'admin',
}

function createMockAuthResponse(identity) {
  return {
    token: `mock-admin-token-${Date.now()}`,
    admin: {
      id: 'mock-admin-1',
      username: identity,
      role: MOCK_ADMIN_ACCOUNT.role,
    },
    source: 'fe-mock',
  }
}

export async function adminLogin(identity, password) {
  const username = String(identity || '').trim()

  if (USE_MOCK_ADMIN_AUTH) {
    const isValidUser = username === MOCK_ADMIN_ACCOUNT.username
    const isValidPassword = password === MOCK_ADMIN_ACCOUNT.password

    if (!isValidUser || !isValidPassword) {
      const error = new Error('Invalid credentials')
      error.status = 401
      throw error
    }

    return createMockAuthResponse(username)
  }

  return apiRequest('/admin/auth/login', {
    method: 'POST',
    body: {
      username,
      password,
    },
  })
}
