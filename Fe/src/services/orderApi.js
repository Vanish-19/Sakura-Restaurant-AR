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
        arModels: item?.assets?.ar_models
          ? {
              glb_url: item.assets.ar_models.glb || '',
              usdz_url: item.assets.ar_models.usdz || '',
            }
          : null,
        isBestSeller: Boolean(item?.is_best_seller),
      }
    })
    .filter(Boolean)
}

export async function scanTableSession(qrHash) {
  return apiRequest('/tables/scan', {
    method: 'POST',
    body: { qr_hash: qrHash },
  })
}

export async function createDineInOrder(token, items) {
  return apiRequest('/orders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: { items },
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
