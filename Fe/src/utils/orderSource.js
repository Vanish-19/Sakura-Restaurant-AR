function normalizeTableCode(value) {
    if (value === null || value === undefined) return null

    const cleaned = String(value).trim().toUpperCase().replace(/\s+/g, '-')
    if (!cleaned) return null

    return cleaned
}

export function getOrderSource(searchParams) {
    const tableRaw =
        searchParams.get('table') ||
        searchParams.get('tableId') ||
        searchParams.get('ban')

    const tableCode = normalizeTableCode(tableRaw)

    if (tableCode) {
        return {
            mode: 'dine-in',
            tableCode,
            label: `Bàn ${tableCode}`,
        }
    }

    return {
        mode: 'delivery',
        tableCode: null,
        label: 'Ship về',
    }
}
