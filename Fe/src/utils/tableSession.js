import { scanTableSession } from '../services/orderApi.js'

const USE_MOCK_TABLE_SCAN = import.meta.env.VITE_USE_MOCK_TABLE_SCAN === 'true'

function tokenStorageKey(tableCode) {
  return `armenuweb_table_token:${tableCode}`
}

function normalizeTableCode(tableCode) {
  const raw = String(tableCode || '').trim().toUpperCase()
  const digitsOnly = raw.replace(/\D/g, '')

  if (digitsOnly) return digitsOnly.padStart(2, '0')
  return raw
}

function buildQrHashCandidates(tableCode) {
  const normalized = normalizeTableCode(tableCode)
  const digits = normalized.replace(/\D/g, '')
  const list = [normalized]

  if (digits) {
    const twoDigits = digits.padStart(2, '0')
    const threeDigits = digits.padStart(3, '0')
    const numericDigits = digits.replace(/^0+/, '') || '0'
    const variants = Array.from(new Set([digits, twoDigits, threeDigits, numericDigits]))

    for (const value of variants) {
      list.push(`t-${value}`)
      list.push(`table-${value}`)
      list.push(`table-${value}-qr`)
      list.push(`table-${value}-sakura`)
    }
  }

  return Array.from(new Set(list.filter(Boolean)))
}

export async function ensureTableToken(tableCode) {
  const normalizedTableCode = normalizeTableCode(tableCode)
  const key = tokenStorageKey(normalizedTableCode)
  const cachedToken = sessionStorage.getItem(key)
  if (cachedToken) return cachedToken

  let token = null
  const qrCandidates = buildQrHashCandidates(normalizedTableCode)

  for (const qrHash of qrCandidates) {
    try {
      const res = await scanTableSession(qrHash)
      token = res?.token
      if (token) break
    } catch {
      // try next format
    }
  }

  if (!token && USE_MOCK_TABLE_SCAN) {
    token = `mock-table-token-${normalizedTableCode}`
  }

  if (!token) {
    throw new Error('Không lấy được token bàn từ máy chủ')
  }

  sessionStorage.setItem(key, token)
  return token
}
