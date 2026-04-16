export const TABLE_QR_COUNT = 50
export const TABLE_QR_BASE_URL = 'http://10.76.189.63:5173'

export const TABLE_QR_PATHS_50 = Array.from({ length: TABLE_QR_COUNT }, (_, index) => {
  const tableCode = String(index + 1).padStart(2, '0')
  return {
    tableCode,
    path: `/order?table=${tableCode}`,
  }
})

export function buildTableQrUrls(baseUrl) {
  const normalizedBase = String(baseUrl || TABLE_QR_BASE_URL).replace(/\/$/, '')
  return TABLE_QR_PATHS_50.map((item) => ({
    ...item,
    url: `${normalizedBase}${item.path}`,
  }))
}
