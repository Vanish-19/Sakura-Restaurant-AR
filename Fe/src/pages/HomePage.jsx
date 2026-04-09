import { MobileOutlined, RestOutlined, ScanOutlined } from '@ant-design/icons'
import { message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import FeaturePill from '../components/molecules/FeaturePill.jsx'
import MenuItemCard from '../components/molecules/MenuItemCard.jsx'
import CategoryBar from '../components/organisms/CategoryBar.jsx'
import { useCart } from '../contexts/CartContext.jsx'
import { CATEGORIES } from '../data/categories.js'
import { MENU_ITEMS } from '../data/menuItems.js'
import { getMenuItems } from '../services/orderApi.js'

function toCategoryLabel(key) {
  const value = String(key || '').toLowerCase()
  if (!value || value === 'all') return 'All'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const { addItem } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const isAndroidPreview = searchParams.get('preview') === 'android'
  const [menuItems, setMenuItems] = useState(MENU_ITEMS)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const fromApi = await getMenuItems()
        if (!isMounted || fromApi.length === 0) return
        setMenuItems(fromApi)
      } catch {
        // Keep local fallback menu when API is unavailable.
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

    if (fromMenu.length > 0) {
      return [{ key: 'all', label: 'All' }, ...fromMenu]
    }

    return CATEGORIES
  }, [menuItems])

  const categoryLabelByKey = useMemo(() => {
    const entries = categories.map((c) => [c.key, c.label])
    return Object.fromEntries(entries)
  }, [categories])

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return menuItems
    return menuItems.filter((item) => item.category === activeCategory)
  }, [activeCategory, menuItems])

  const toggleAndroidPreview = () => {
    const next = new URLSearchParams(searchParams)
    next.set('preview', 'android')
    setSearchParams(next, { replace: true })
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
              icon={<MobileOutlined />}
              text="Mobile Optimized"
              onClick={toggleAndroidPreview}
              isActive={isAndroidPreview}
              variant="light"
            />
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
    </div>
  )
}
