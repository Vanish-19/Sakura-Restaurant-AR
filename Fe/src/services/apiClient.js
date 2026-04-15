const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api/v1'

const DIRECT_API_BASE_URL =
  import.meta.env.VITE_API_DIRECT_BASE_URL || 'http://127.0.0.1:3000/api/v1'

function getToken(key) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function joinUrl(base, path) {
  if (!path.startsWith('/')) return `${base}/${path}`
  return `${base}${path}`
}

function getPreferredBases() {
  if (!API_BASE_URL.startsWith('/')) return [API_BASE_URL]
  return [API_BASE_URL, DIRECT_API_BASE_URL]
}

async function requestWithFallback(path, requestInit) {
  const bases = getPreferredBases()
  let lastError = null

  for (const base of bases) {
    try {
      return await fetch(joinUrl(base, path), requestInit)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('Network request failed')
}

async function parseBody(response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function tryRefreshAdminToken() {
  const refreshToken = typeof window !== 'undefined' ? getToken('admin_refresh_token') : null
  if (!refreshToken) return false

  const refreshInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }

  const response = await requestWithFallback('/admin/auth/refresh', refreshInit)
  const payload = await parseBody(response)
  if (!response.ok) return false

  const data = payload?.data || payload
  const nextAccessToken = data?.accessToken || data?.token || ''
  const nextRefreshToken = data?.refreshToken || ''
  const nextAdmin = data?.admin || null

  if (!nextAccessToken || !nextRefreshToken) return false

  try {
    window.localStorage.setItem('admin_access_token', nextAccessToken)
    window.localStorage.setItem('admin_refresh_token', nextRefreshToken)
    if (nextAdmin) {
      window.localStorage.setItem('admin_profile', JSON.stringify(nextAdmin))
    }
  } catch {
    return false
  }

  return true
}

export async function apiRequest(path, { method = 'GET', headers, body, _retry = false } = {}) {
  const normalizedPath = String(path || '')
  const isAdminApi = normalizedPath.startsWith('/admin')
  const needsUserAuth =
    normalizedPath.startsWith('/takeaway/orders') ||
    normalizedPath.startsWith('/user/') ||
    normalizedPath === '/auth/logout'

  const adminToken = typeof window !== 'undefined' ? getToken('admin_access_token') : null
  const userToken = typeof window !== 'undefined' ? getToken('user_access_token') : null

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  const requestInit = {
    method,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(isAdminApi && adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
      ...(!isAdminApi && needsUserAuth && userToken ? { Authorization: `Bearer ${userToken}` } : {}),
      ...(headers ?? {}),
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  }

  const response = await requestWithFallback(path, requestInit)

  const payload = await parseBody(response)

  if (
    !response.ok &&
    isAdminApi &&
    !_retry &&
    (response.status === 401 || response.status === 403)
  ) {
    const refreshed = await tryRefreshAdminToken()
    if (refreshed) {
      return apiRequest(path, { method, headers, body, _retry: true })
    }
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Request failed with status ${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

export { API_BASE_URL }
