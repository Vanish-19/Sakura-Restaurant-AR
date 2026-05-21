import { apiRequest } from './apiClient.js'

function toMenuItemId(item) {
  return item.id || item._id
}

export async function getMenuItems(category) {
  const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : ''
  const res = await apiRequest(`/menu/items${query}`)
  const list = Array.isArray(res?.data) ? res.data : []

  return list
    .map((item) => {
      const id = toMenuItemId(item)
      if (!id) return null

      const imageUrl =
        item?.assets?.image_url ||
        item?.image_url ||
        'https://placehold.co/800x500?text=Dish'

      return {
        id,
        name: item.name || 'Unnamed dish',
        jpName: item.jp_name || item.jpName || '',
        description: item.description || '',
        price: Number(item.price || 0),
        category: (item.category || 'all').toLowerCase(),
        imageUrl,
        arModels: item?.ar_models
          ? {
              glb_url: item.ar_models.glb_url || '',
              usdz_url: item.ar_models.usdz_url || '',
            }
          : item?.assets?.ar_models
          ? {
              glb_url: item.assets.ar_models.glb || '',
              usdz_url: item.assets.ar_models.usdz || '',
            }
          : null,
        isBestSeller: Boolean(item?.is_best_seller),
        ingredients: Array.isArray(item?.ingredients) ? item.ingredients : [],
        allergens: Array.isArray(item?.allergens) ? item.allergens : [],
        recommendedFor: Array.isArray(item?.recommended_for) ? item.recommended_for : [],
      }
    })
    .filter(Boolean)
}

export async function getMenuItemById(id) {
  const res = await apiRequest(`/menu/items/${id}`)
  const item = res?.data
  if (!item) return null

  const mappedItems = await Promise.resolve(
    [item]
      .map((entry) => {
        const mappedId = toMenuItemId(entry)
        if (!mappedId) return null

        const imageUrl =
          entry?.assets?.image_url ||
          entry?.image_url ||
          'https://placehold.co/800x500?text=Dish'

        return {
          id: mappedId,
          name: entry.name || 'Unnamed dish',
          jpName: entry.jp_name || entry.jpName || '',
          description: entry.description || '',
          price: Number(entry.price || 0),
          category: (entry.category || 'all').toLowerCase(),
          imageUrl,
          arModels: entry?.ar_models
            ? {
                glb_url: entry.ar_models.glb_url || '',
                usdz_url: entry.ar_models.usdz_url || '',
              }
            : entry?.assets?.ar_models
            ? {
                glb_url: entry.assets.ar_models.glb || '',
                usdz_url: entry.assets.ar_models.usdz || '',
              }
            : null,
          isBestSeller: Boolean(entry?.is_best_seller),
          ingredients: Array.isArray(entry?.ingredients) ? entry.ingredients : [],
          allergens: Array.isArray(entry?.allergens) ? entry.allergens : [],
          recommendedFor: Array.isArray(entry?.recommended_for) ? entry.recommended_for : [],
        }
      })
      .filter(Boolean),
  )

  return mappedItems[0] || null
}

export async function scanTableSession(qrHash) {
  return apiRequest('/tables/scan', {
    method: 'POST',
    body: { qr_hash: qrHash },
  })
}

export async function createDineInOrder(token, items) {
  return createDineInOrderWithUser(token, items)
}

export async function createDineInOrderWithUser(tableToken, items, options = {}) {
  const userAccessToken = options.userAccessToken || ''
  const customerPhone = options.customerPhone || ''
  const rewardVoucherId = options.rewardVoucherId || ''

  return apiRequest('/orders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tableToken}`,
      ...(userAccessToken ? { 'x-user-authorization': `Bearer ${userAccessToken}` } : {}),
    },
    body: {
      items,
      ...(customerPhone ? { customer_phone: customerPhone } : {}),
      ...(rewardVoucherId ? { reward_voucher_id: rewardVoucherId } : {}),
    },
  })
}

export async function createTakeawayOrder(payload) {
  return apiRequest('/takeaway/orders', {
    method: 'POST',
    body: payload,
  })
}

export async function getTakeawayOrderById(id) {
  return apiRequest(`/takeaway/orders/${id}`)
}

export async function cancelTakeawayOrder(id) {
  return apiRequest(`/takeaway/orders/${id}/cancel`, {
    method: 'PATCH',
  })
}

export async function getUserOrderHistory() {
  return apiRequest('/user/orders/history', {
    method: 'GET',
  })
}

export async function getMyTableOrders(tableToken) {
  return apiRequest('/orders/my', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tableToken}`,
    },
  })
}
