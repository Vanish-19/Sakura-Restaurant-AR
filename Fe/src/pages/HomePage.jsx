import { RestOutlined, ScanOutlined } from '@ant-design/icons'
import { message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import FeaturePill from '../components/molecules/FeaturePill.jsx'
import ServiceTypeModal from '../components/organisms/ServiceTypeModal.jsx'
import TableSelectionModal from '../components/organisms/TableSelectionModal.jsx'
import MenuItemCard from '../components/molecules/MenuItemCard.jsx'
import CategoryBar from '../components/organisms/CategoryBar.jsx'
import { useCart } from '../contexts/CartContext.jsx'
import { getMenuItems } from '../services/orderApi.js'
import { ensureTableToken } from '../utils/tableSession.js'
import {
  clearLockedTableCode,
  getLockedTableCode,
  getOrderSource,
  lockTableCode,
} from '../utils/orderSource.js'

function toCategoryLabel(key) {
  const value = String(key || '').toLowerCase()
  if (!value || value === 'all') return 'All'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const { addItem } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isAndroidPreview = searchParams.get('preview') === 'android'
  const [menuItems, setMenuItems] = useState([])
  const [serviceModalOpen, setServiceModalOpen] = useState(false)
  const [isScanningQr, setIsScanningQr] = useState(false)
  const orderSource = getOrderSource(searchParams)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const fromApi = await getMenuItems()
        if (!isMounted) return
        setMenuItems(fromApi)
      } catch {
        if (!isMounted) return
        setMenuItems([])
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  const categories = useMemo(() => {
    const fromMenu = Array.from(
      new Set(
        menuItems
          .map((item) => item.category)
          .filter((c) => c && c !== 'all')
          .map((c) => c.toLowerCase()),
      ),
    ).map((key) => ({ key, label: toCategoryLabel(key) }))

    return fromMenu.length > 0 ? [{ key: 'all', label: 'All' }, ...fromMenu] : []
  }, [menuItems])

  const categoryLabelByKey = useMemo(() => {
    const entries = categories.map((c) => [c.key, c.label])
    return Object.fromEntries(entries)
  }, [categories])

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return menuItems
    return menuItems.filter((item) => item.category === activeCategory)
  }, [activeCategory, menuItems])

  useEffect(() => {
    let cancelled = false

    const normalizeTableCode = (value) => {
      if (value === null || value === undefined) return null
      const cleaned = String(value).trim().toUpperCase().replace(/\s+/g, '-')
      return cleaned || null
    }

    const syncOrderSource = async () => {
      const locked = getLockedTableCode()

      if (locked) {
        const currentTable = searchParams.get('table')
        if (currentTable !== locked) {
          const next = new URLSearchParams(searchParams)
          next.set('table', locked)
          next.delete('tableId')
          next.delete('ban')
          setSearchParams(next, { replace: true })
        }
        setServiceModalOpen(false)
        return
      }

      const queryTable =
        searchParams.get('table') ||
        searchParams.get('tableId') ||
        searchParams.get('ban')
      const normalized = normalizeTableCode(queryTable)

      if (!normalized) {
        setServiceModalOpen(false)
        return
      }

      try {
        setIsScanningQr(true)
        await ensureTableToken(normalized)
        if (cancelled) return

        lockTableCode(normalized)
        const next = new URLSearchParams(searchParams)
        next.set('table', normalized)
        next.delete('tableId')
        next.delete('ban')
        setSearchParams(next, { replace: true })
        setServiceModalOpen(false)
        message.success(`Da kich hoat phien tai ban ${normalized}`)
      } catch {
        if (cancelled) return
        clearLockedTableCode()
        const next = new URLSearchParams(searchParams)
        next.delete('table')
        next.delete('tableId')
        next.delete('ban')
        setSearchParams(next, { replace: true })
        message.error('Khong xac thuc duoc ban. Vui long quet lai QR tai nha hang.')
      } finally {
        if (!cancelled) setIsScanningQr(false)
      }
    }

    syncOrderSource()

    return () => {
      cancelled = true
    }
  }, [searchParams, setSearchParams])

  const pickServiceType = (type) => {
    if (type === 'dine-in') {
      message.info('Dine-in chi kich hoat khi quet QR tai ban.')
      return
    }

    const next = new URLSearchParams(searchParams)
    next.delete('table')
    next.delete('tableId')
    next.delete('ban')
    clearLockedTableCode()
    setSearchParams(next, { replace: true })
    navigate('/', { replace: true })
    setServiceModalOpen(false)
  }

  return (
    <div className="bg-[#fafaf6]">
      <section className="relative overflow-hidden border-b border-[#e9e7df] bg-gradient-to-b from-[#f9f6ef] via-[#f7f3ea] to-[#f2ece0] text-slate-900">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'url(/patterns/sakura-wagara.svg)' }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/55 via-transparent to-white/35" />

        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center md:px-8 md:py-28">
          <h1
            className={
              isAndroidPreview
                ? 'text-2xl font-light tracking-tight font-[var(--font-heading)]'
                : 'text-4xl font-light tracking-tight font-[var(--font-heading)] md:text-6xl'
            }
          >
            Experience Japanese Cuisine in AR
          </h1>
          <p
            className={
              isAndroidPreview
                ? 'mt-6 text-sm text-slate-600'
                : 'mt-7 text-base text-slate-600 md:text-lg'
            }
          >
            View 3D models of our dishes before you order
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <FeaturePill
              icon={<RestOutlined />}
              text="Authentic Japanese"
              variant="light"
            />
            <FeaturePill icon={<ScanOutlined />} text="AR Preview" variant="light" />
          </div>
        </div>
      </section>

      <CategoryBar
        categories={categories}
        activeKey={activeCategory}
        onChange={setActiveCategory}
      />

      {orderSource.mode === 'dine-in' ? (
        <div className="mx-auto mt-5 max-w-6xl px-6 md:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
            Calling for {orderSource.label}
          </div>
        </div>
      ) : null}

      {isScanningQr ? (
        <div className="mx-auto mt-5 max-w-6xl px-6 md:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            Dang xac thuc phien ban tu QR...
          </div>
        </div>
      ) : null}

      <section className="bg-[#fafaf6]">
        <div className="mx-auto max-w-6xl px-6 py-14 md:px-8 md:py-20">
          <div
            className={
              isAndroidPreview
                ? 'grid grid-cols-1 gap-5'
                : 'grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4'
            }
          >
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                categoryLabel={categoryLabelByKey[item.category] ?? item.category}
                onAdd={(it) => {
                  addItem(it.id, 1)
                  message.success('Đã thêm vào giỏ hàng')
                }}
                onViewAr={() => {
                  message.info('Tính năng AR sẽ sớm có')
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <ServiceTypeModal
        open={serviceModalOpen}
        onClose={() => {}}
        onSelect={pickServiceType}
      />
    </div>
  )
}
