import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getOrderSource } from '../utils/orderSource.js'

const STORAGE_KEY = 'armenuweb_cart_v1'

const DELIVERY_SCOPE_KEY = 'delivery'

function toScopeKey(orderSource) {
  if (!orderSource || orderSource.mode === 'delivery') return DELIVERY_SCOPE_KEY
  return `table:${orderSource.tableCode}`
}

/**
 * @typedef {Object} CartContextValue
 * @property {string} scopeKey
 * @property {Record<string, number>} cartById
 * @property {[string, number][]} entries
 * @property {number} totalItems
 * @property {(id: string, quantity?: number) => void} addItem
 * @property {(id: string, quantity: number) => void} setQuantity
 * @property {(id: string) => void} removeItem
 * @property {() => void} clearCart
 */

function safeParse(json) {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

function normalizeCart(value) {
  if (!value || typeof value !== 'object') return {}

  const normalized = {}

  for (const [key, qty] of Object.entries(value)) {
    if (typeof key !== 'string') continue
    const n = Number(qty)
    if (!Number.isFinite(n)) continue
    const quantity = Math.floor(n)
    if (quantity <= 0) continue
    normalized[key] = quantity
  }

  return normalized
}

function normalizeScopedCartMap(value) {
  if (!value || typeof value !== 'object') {
    return { [DELIVERY_SCOPE_KEY]: {} }
  }

  const result = {}

  for (const [scopeKey, cart] of Object.entries(value)) {
    if (typeof scopeKey !== 'string' || !scopeKey) continue
    result[scopeKey] = normalizeCart(cart)
  }

  if (!result[DELIVERY_SCOPE_KEY]) {
    result[DELIVERY_SCOPE_KEY] = {}
  }

  return result
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { scopeKey, id, quantity } = action.payload
      const scopeCart = state[scopeKey] ?? {}
      const nextQty = (scopeCart[id] ?? 0) + quantity

      return {
        ...state,
        [scopeKey]: { ...scopeCart, [id]: nextQty },
      }
    }
    case 'setQuantity': {
      const { scopeKey, id, quantity } = action.payload
      const scopeCart = state[scopeKey] ?? {}

      if (quantity <= 0) {
        const { [id]: _removed, ...restScopeCart } = scopeCart
        return {
          ...state,
          [scopeKey]: restScopeCart,
        }
      }

      return {
        ...state,
        [scopeKey]: { ...scopeCart, [id]: quantity },
      }
    }
    case 'remove': {
      const { scopeKey, id } = action.payload
      const scopeCart = state[scopeKey] ?? {}
      const { [id]: _removed, ...restScopeCart } = scopeCart

      return {
        ...state,
        [scopeKey]: restScopeCart,
      }
    }
    case 'clear': {
      const { scopeKey } = action.payload
      return {
        ...state,
        [scopeKey]: {},
      }
    }
    default:
      return state
  }
}

function getInitialCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = safeParse(raw)
    return normalizeScopedCartMap(parsed)
  } catch {
    return { [DELIVERY_SCOPE_KEY]: {} }
  }
}

/** @type {import('react').Context<CartContextValue | null>} */
const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [searchParams] = useSearchParams()
  const orderSource = getOrderSource(searchParams)
  const scopeKey = toScopeKey(orderSource)

  const [cartByScope, dispatch] = useReducer(cartReducer, undefined, getInitialCart)

  const cartById = useMemo(() => {
    return cartByScope[scopeKey] ?? {}
  }, [cartByScope, scopeKey])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartByScope))
    } catch {
      // ignore
    }
  }, [cartByScope])

  const value = useMemo(() => {
    const entries = Object.entries(cartById)

    const totalItems = entries.reduce((sum, [, qty]) => sum + qty, 0)

    return {
      scopeKey,
      cartById,
      entries,
      totalItems,
      addItem: (id, quantity = 1) => {
        const q = Math.floor(Number(quantity))
        if (!id || !Number.isFinite(q) || q <= 0) return
        dispatch({ type: 'add', payload: { scopeKey, id, quantity: q } })
      },
      setQuantity: (id, quantity) => {
        const q = Math.floor(Number(quantity))
        if (!id || !Number.isFinite(q)) return
        dispatch({ type: 'setQuantity', payload: { scopeKey, id, quantity: q } })
      },
      removeItem: (id) => {
        if (!id) return
        dispatch({ type: 'remove', payload: { scopeKey, id } })
      },
      clearCart: () => dispatch({ type: 'clear', payload: { scopeKey } }),
    }
  }, [cartById, scopeKey])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within <CartProvider>')
  }
  return ctx
}
