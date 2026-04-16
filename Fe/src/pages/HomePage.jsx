import { RestOutlined, ScanOutlined } from '@ant-design/icons'
import { message } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  clearSavedServiceMode,
  getSavedServiceMode,
  getLockedTableCode,
  lockTableCode,
  setSavedServiceMode,
} from '../utils/orderSource.js'
import { getUserAccessToken } from '../utils/authSession.js'

function toCategoryLabel(key) {
  const value = String(key || '').toLowerCase()
  if (!value || value === 'all') return 'Tất cả'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function normalizeTableCode(value) {
  const raw = String(value || '').trim().toUpperCase()
  const digitsOnly = raw.replace(/\D/g, '')
  if (digitsOnly) return digitsOnly.padStart(2, '0')
  return raw
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const { addItem } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const isAndroidPreview = searchParams.get('preview') === 'android'
  const [menuItems, setMenuItems] = useState([])
  const [serviceModalOpen, setServiceModalOpen] = useState(false)
  const [tableModalOpen, setTableModalOpen] = useState(false)
  const [isScanningQr, setIsScanningQr] = useState(false)
  const guestRefreshResetRef = useRef(false)

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

    return fromMenu.length > 0 ? [{ key: 'all', label: 'Tất cả' }, ...fromMenu] : []
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

    const normalizeQueryTableCode = (value) => {
      if (value === null || value === undefined) return null
      const cleaned = normalizeTableCode(value)
      return cleaned || null
    }

    const syncOrderSource = async () => {
      const isLoggedIn = Boolean(getUserAccessToken())

      if (!isLoggedIn && !guestRefreshResetRef.current) {
        guestRefreshResetRef.current = true
        clearLockedTableCode()
        clearSavedServiceMode()

        const hasServiceQuery =
          searchParams.has('table') ||
          searchParams.has('tableId') ||
          searchParams.has('ban')

        if (hasServiceQuery) {
          const next = new URLSearchParams(searchParams)
          next.delete('table')
          next.delete('tableId')
          next.delete('ban')
          setSearchParams(next, { replace: true })
          return
        }
      }

      const locked = getLockedTableCode()

      if (locked) {
        setSavedServiceMode('dine-in')
        const currentTable = searchParams.get('table')
        if (currentTable !== locked) {
          const next = new URLSearchParams(searchParams)
          next.set('table', locked)
          next.delete('tableId')
          next.delete('ban')
          setSearchParams(next, { replace: true })
        }
        setServiceModalOpen(false)
        setTableModalOpen(false)
        return
      }

      const queryTable =
        searchParams.get('table') ||
        searchParams.get('tableId') ||
        searchParams.get('ban')
      const normalized = normalizeQueryTableCode(queryTable)

      if (!normalized) {
        const savedMode = getSavedServiceMode()
        if (savedMode === 'delivery') {
          setServiceModalOpen(false)
          setTableModalOpen(false)
          return
        }

        if (savedMode === 'dine-in-pending') {
          setServiceModalOpen(false)
          setTableModalOpen(true)
          return
        }

        clearSavedServiceMode()
        setTableModalOpen(false)
        setServiceModalOpen(true)
        return
      }

      try {
        setIsScanningQr(true)
        await ensureTableToken(normalized)
        if (cancelled) return

        lockTableCode(normalized)
        setSavedServiceMode('dine-in')
        const next = new URLSearchParams(searchParams)
        next.set('table', normalized)
        next.delete('tableId')
        next.delete('ban')
        setSearchParams(next, { replace: true })
        setServiceModalOpen(false)
        setTableModalOpen(false)
        message.success(`Đã kích hoạt phiên tại bàn ${normalized}`)
      } catch {
        if (cancelled) return
        clearLockedTableCode()
        clearSavedServiceMode()
        const next = new URLSearchParams(searchParams)
        next.delete('table')
        next.delete('tableId')
        next.delete('ban')
        setSearchParams(next, { replace: true })
        setTableModalOpen(false)
        setServiceModalOpen(true)
        message.error('Không xác thực được bàn. Vui lòng quét lại mã QR tại nhà hàng.')
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
      setSavedServiceMode('dine-in-pending')
      setServiceModalOpen(false)
      setTableModalOpen(true)
      return
    }

    const next = new URLSearchParams(searchParams)
    next.delete('table')
    next.delete('tableId')
    next.delete('ban')
    clearLockedTableCode()
    setSavedServiceMode('delivery')
    setSearchParams(next, { replace: true })
    navigate('/', { replace: true })
    setServiceModalOpen(false)
    setTableModalOpen(false)
  }

  const confirmTableSelection = async (tableNo) => {
    try {
      setIsScanningQr(true)
      const normalized = normalizeTableCode(tableNo)
      await ensureTableToken(normalized)
      lockTableCode(normalized)
      setSavedServiceMode('dine-in')

      const next = new URLSearchParams(searchParams)
      next.set('table', normalized)
      next.delete('tableId')
      next.delete('ban')
      setSearchParams(next, { replace: true })

      setTableModalOpen(false)
      setServiceModalOpen(false)
      message.success(`Đã chọn bàn ${normalized}`)
    } catch {
      message.error('Không thể gán bàn này. Vui lòng thử bàn khác.')
    } finally {
      setIsScanningQr(false)
    }
  }

  const handleViewAr = (item) => {
    if (!item?.arModels?.glb_url && !item?.arModels?.usdz_url) {
      message.warning('Món này chưa có model AR để xem')
      return
    }

    navigate(`/ar?itemId=${encodeURIComponent(item.id)}`)
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
            Trải nghiệm món Nhật với AR
          </h1>
          <p
            className={
              isAndroidPreview
                ? 'mt-6 text-sm text-slate-600'
                : 'mt-7 text-base text-slate-600 md:text-lg'
            }
          >
            Xem mô hình 3D món ăn trước khi gọi món
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <FeaturePill
              icon={<RestOutlined />}
              text="Ẩm thực Nhật chuẩn vị"
              variant="light"
            />
            <FeaturePill icon={<ScanOutlined />} text="Xem thử AR" variant="light" />
          </div>
        </div>
      </section>

      <CategoryBar
        categories={categories}
        activeKey={activeCategory}
        onChange={setActiveCategory}
      />

      {isScanningQr ? (
        <div className="mx-auto mt-5 max-w-6xl px-6 md:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            Đang xác thực phiên bàn từ mã QR...
          </div>
        </div>
      ) : null}

      <section className="bg-[#fafaf6]">
        <div className="mx-auto max-w-6xl px-6 py-14 md:px-8 md:py-20">
          <div
            className={
              isAndroidPreview
                ? 'grid grid-cols-1 gap-4'
                : 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
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
                  handleViewAr(item)
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

      <TableSelectionModal
        open={tableModalOpen}
        forceSelection
        onCancel={() => {}}
        onConfirm={confirmTableSelection}
      />
    </div>
  )
}
