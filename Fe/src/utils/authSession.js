const USER_ACCESS_KEY = 'user_access_token'
const USER_REFRESH_KEY = 'user_refresh_token'
const USER_PROFILE_KEY = 'user_profile'

const ADMIN_ACCESS_KEY = 'admin_access_token'
const ADMIN_REFRESH_KEY = 'admin_refresh_token'
const ADMIN_PROFILE_KEY = 'admin_profile'

function safeGet(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key, value) {
  try {
    if (value === null || value === undefined || value === '') {
      localStorage.removeItem(key)
      return
    }
    localStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

function safeSetJson(key, value) {
  try {
    if (!value) {
      localStorage.removeItem(key)
      return
    }
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

function safeGetJson(key) {
  const raw = safeGet(key)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setUserSession({ accessToken, refreshToken, user }) {
  safeSet(USER_ACCESS_KEY, accessToken || '')
  safeSet(USER_REFRESH_KEY, refreshToken || '')
  safeSetJson(USER_PROFILE_KEY, user || null)
}

export function clearUserSession() {
  safeSet(USER_ACCESS_KEY, '')
  safeSet(USER_REFRESH_KEY, '')
  safeSetJson(USER_PROFILE_KEY, null)
}

export function getUserAccessToken() {
  return safeGet(USER_ACCESS_KEY)
}

export function getUserRefreshToken() {
  return safeGet(USER_REFRESH_KEY)
}

export function getUserProfile() {
  return safeGetJson(USER_PROFILE_KEY)
}

export function isUserLoggedIn() {
  return Boolean(getUserAccessToken())
}

export function setAdminSession({ accessToken, refreshToken, admin }) {
  safeSet(ADMIN_ACCESS_KEY, accessToken || '')
  safeSet(ADMIN_REFRESH_KEY, refreshToken || '')
  safeSetJson(ADMIN_PROFILE_KEY, admin || null)
}

export function clearAdminSession() {
  safeSet(ADMIN_ACCESS_KEY, '')
  safeSet(ADMIN_REFRESH_KEY, '')
  safeSetJson(ADMIN_PROFILE_KEY, null)
}

export function getAdminAccessToken() {
  return safeGet(ADMIN_ACCESS_KEY)
}

export function getAdminRefreshToken() {
  return safeGet(ADMIN_REFRESH_KEY)
}

export function getAdminProfile() {
  return safeGetJson(ADMIN_PROFILE_KEY)
}
