const TABLE_LOCK_KEY = 'armenuweb_locked_table'

function normalizeTableCode(value) {
    if (value === null || value === undefined) return null

    const cleaned = String(value).trim().toUpperCase().replace(/\s+/g, '-')
    if (!cleaned) return null

    return cleaned
}

export function getLockedTableCode() {
    try {
        return normalizeTableCode(sessionStorage.getItem(TABLE_LOCK_KEY))
    } catch {
        return null
    }
}

export function lockTableCode(tableCode) {
    const normalized = normalizeTableCode(tableCode)
    if (!normalized) return null

    try {
        sessionStorage.setItem(TABLE_LOCK_KEY, normalized)
    } catch {
        // ignore
    }

    return normalized
}

export function clearLockedTableCode() {
    try {
        sessionStorage.removeItem(TABLE_LOCK_KEY)
    } catch {
        // ignore
    }
}

export function getOrderSource(searchParams) {
    const lockedTableCode = getLockedTableCode()

    if (lockedTableCode) {
        return {
            mode: 'dine-in',
            tableCode: lockedTableCode,
            label: `Bàn ${lockedTableCode}`,
        }
    }

    return {
        mode: 'delivery',
        tableCode: null,
        label: 'Ship về',
    }
}
