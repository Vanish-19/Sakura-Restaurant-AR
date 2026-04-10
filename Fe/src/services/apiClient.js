const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api/v1'

const DIRECT_API_BASE_URL =
  import.meta.env.VITE_API_DIRECT_BASE_URL || 'http://127.0.0.1:3000/api/v1'

function joinUrl(base, path) {
  if (!path.startsWith('/')) return `${base}/${path}`
  return `${base}${path}`
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

export async function apiRequest(path, { method = 'GET', headers, body } = {}) {
  const requestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  }

  let response

  try {
    response = await fetch(joinUrl(API_BASE_URL, path), requestInit)
  } catch (error) {
    const shouldRetryWithDirectApi = API_BASE_URL.startsWith('/')
    if (!shouldRetryWithDirectApi) {
      throw error
    }

    response = await fetch(joinUrl(DIRECT_API_BASE_URL, path), requestInit)
  }

  const payload = await parseBody(response)

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
