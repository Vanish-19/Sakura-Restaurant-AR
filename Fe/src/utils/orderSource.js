const TABLE_LOCK_KEY = 'armenuweb_locked_table'
const SERVICE_MODE_KEY = 'armenuweb_service_mode'

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

export function getSavedServiceMode() {
    try {
        const raw = sessionStorage.getItem(SERVICE_MODE_KEY)
        if (raw === 'delivery' || raw === 'dine-in' || raw === 'dine-in-pending') {
            return raw
        }
    } catch {
        // ignore
    }

    return null
}

export function setSavedServiceMode(mode) {
    if (mode !== 'delivery' && mode !== 'dine-in' && mode !== 'dine-in-pending') {
        return null
    }

    try {
        sessionStorage.setItem(SERVICE_MODE_KEY, mode)
    } catch {
        // ignore
    }

    return mode
}

export function clearSavedServiceMode() {
    try {
        sessionStorage.removeItem(SERVICE_MODE_KEY)
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

    const savedMode = getSavedServiceMode()
    if (savedMode === 'delivery') {
        return {
            mode: 'delivery',
            tableCode: null,
            label: 'Ship ve',
        }
    }

    if (savedMode === 'dine-in-pending') {
        return {
            mode: 'pending-table',
            tableCode: null,
            label: 'Chon ban',
        }
    }

    return {
        mode: 'unselected',
        tableCode: null,
        label: 'Chon dich vu',
    }
}
