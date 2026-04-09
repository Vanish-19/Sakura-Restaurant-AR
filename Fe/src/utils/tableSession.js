import { scanTableSession } from '../services/orderApi.js'

function tokenStorageKey(tableCode) {
  return `armenuweb_table_token:${tableCode}`
}

export async function ensureTableToken(tableCode) {
  const key = tokenStorageKey(tableCode)
  const cachedToken = sessionStorage.getItem(key)
  if (cachedToken) return cachedToken

  const res = await scanTableSession(tableCode)
  const token = res?.token

  if (!token) {
    throw new Error('Khong lay duoc token ban tu server')
  }

  sessionStorage.setItem(key, token)
  return token
}
