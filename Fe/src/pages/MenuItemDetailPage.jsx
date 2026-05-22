import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  MinusOutlined,
  PlusOutlined,
  ScanOutlined,
  ShoppingCartOutlined,
  StarFilled,
} from '@ant-design/icons'
import { Button, Empty, InputNumber, Skeleton, Tag, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCart } from '../contexts/CartContext.jsx'
import { getMenuItemById, getMenuItems } from '../services/orderApi.js'

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function formatCategoryLabel(value) {
  const text = String(value || '').trim()
  if (!text) return ''

  return text
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ')
}

export default function MenuItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [item, setItem] = useState(null)
  const [relatedItems, setRelatedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setLoading(true)
        setError('')

        const detail = await getMenuItemById(id)
        if (!active) return

        if (!detail) {
          setItem(null)
          setError('Không tìm thấy món ăn này.')
          return
        }

        setItem(detail)
        setQuantity(1)

        const menu = await getMenuItems(detail.category)
        if (!active) return

        setRelatedItems(menu.filter((entry) => entry.id !== detail.id).slice(0, 3))
      } catch (err) {
        if (!active) return
        console.error(err)
        setItem(null)
        setRelatedItems([])
        setError('Không thể tải chi tiết món ăn vào lúc này.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [id])

  const canViewAr = Boolean(item?.arModels?.glb_url || item?.arModels?.usdz_url)

  const featureTags = useMemo(() => {
    if (!item) return []

    return [
      item.isBestSeller ? { label: 'Best Seller', color: 'gold', icon: <StarFilled /> } : null,
      canViewAr ? { label: 'Có AR', color: 'blue', icon: <ScanOutlined /> } : null,
    ].filter(Boolean)
  }, [canViewAr, item])

  const totalPrice = useMemo(() => {
    return Math.max(0, Number(item?.price || 0) * Number(quantity || 1))
  }, [item?.price, quantity])

  const handleAddToCart = () => {
    if (!item?.id) return
    addItem(item.id, quantity)
    message.success(`Đã thêm ${quantity} món vào giỏ hàng`)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-8">
        <Skeleton.Image active className="!h-[360px] !w-full !rounded-[28px]" />
        <Skeleton active paragraph={{ rows: 8 }} className="mt-8" />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center px-6 py-16 md:px-8">
        <Empty
          description={error || 'Không tìm thấy món ăn'}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
            Quay lại thực đơn
          </Button>
        </Empty>
      </div>
    )
  }

  return (
    <div className="bg-[#faf7f1]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12">
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#8a7366] sm:mb-7">
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-[#ead8cc] bg-white/80 px-3 py-1.5 text-[#7a5a49] no-underline transition-colors hover:border-[#cfa58f] hover:text-[#8B0000]"
          >
            <ArrowLeftOutlined className="mr-1.5 text-[11px]" />
            Thực đơn
          </Link>
          <span className="text-[#c1aa9d]">/</span>
          <Link
            to={`/?category=${item.category}`}
            className="rounded-full px-2 py-1 text-[#9f6d4d] no-underline hover:text-[#8B0000]"
          >
            {formatCategoryLabel(item.category)}
          </Link>
          <span className="max-w-[220px] truncate text-[#4d3529] sm:max-w-[420px]">{item.name}</span>
        </nav>

        <section className="grid items-start gap-5 sm:gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="self-start overflow-hidden rounded-3xl border border-[#efe3da] bg-white shadow-[0_20px_50px_rgba(60,33,18,0.08)] sm:rounded-[32px]">
            <div className="relative aspect-[4/3] bg-[#f5ede5] sm:aspect-auto sm:h-[320px] md:h-[420px]">
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1d120b]/70 to-transparent px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex flex-wrap items-center gap-2">
                  {featureTags.map((tag) => (
                    <Tag key={tag.label} color={tag.color} className="!m-0 !rounded-full !px-3 !py-1 !text-xs !font-bold">
                      <span className="inline-flex items-center gap-1">{tag.icon}{tag.label}</span>
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#a26745] sm:text-sm">
                {formatCategoryLabel(item.category)}
              </p>
              <h1 className="m-0 text-[clamp(1.875rem,8vw,3rem)] font-black leading-tight tracking-[-0.035em] text-[#24130b] md:text-5xl">
                {item.name}
              </h1>
              <p className="mt-3 text-base leading-7 text-[#5f4b3f] sm:mt-4 sm:text-lg sm:leading-8">
                {item.description || 'Món ăn nổi bật trong thực đơn Sakura Restaurant.'}
              </p>
            </div>

            <div className="rounded-3xl border border-[#ead8cc] bg-white/95 p-4 shadow-[0_14px_34px_rgba(60,33,18,0.07)] sm:rounded-[28px] sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="m-0 text-xs font-bold uppercase tracking-[0.2em] text-[#9f6d4d]">Giá bán</p>
                  <p className="mt-2 mb-0 text-3xl font-black leading-none text-[#8b0000]">
                    {currency.format(totalPrice)}
                  </p>
                </div>
                {canViewAr ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#dcb7b7] bg-[#fff8f8] px-3 py-1 text-xs font-bold text-[#8B0000]">
                    <ScanOutlined />
                    AR
                  </span>
                ) : null}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#9f6d4d]">Số lượng</p>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#ead8cc] bg-[#fff8f4] p-1">
                    <Button
                      type="text"
                      shape="circle"
                      icon={<MinusOutlined />}
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      className="!flex !h-9 !w-9 !items-center !justify-center !text-[#8B0000]"
                    />
                    <InputNumber
                      min={1}
                      max={99}
                      value={quantity}
                      controls={false}
                      onChange={(value) => setQuantity(Math.max(1, Number(value || 1)))}
                      className="menu-detail-quantity-input !w-16 !border-0 !bg-transparent !text-center"
                    />
                    <Button
                      type="text"
                      shape="circle"
                      icon={<PlusOutlined />}
                      onClick={() => setQuantity((current) => Math.min(99, current + 1))}
                      className="!flex !h-9 !w-9 !items-center !justify-center !text-[#8B0000]"
                    />
                  </div>
                </div>

                <Button
                  type="primary"
                  shape="round"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  className="!h-11 !w-full !border-0 !bg-[#8B0000] !px-5 !font-bold sm:!w-auto"
                >
                  Thêm vào giỏ
                </Button>
              </div>

              <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
                {canViewAr ? (
                  <Button
                    shape="round"
                    icon={<ScanOutlined />}
                    onClick={() => navigate(`/ar?itemId=${encodeURIComponent(item.id)}`)}
                    className="!h-10 !w-full !rounded-full !border-[#dcb7b7] !px-4 !font-semibold !text-[#8B0000] sm:!w-auto"
                  >
                    Xem AR món ăn
                  </Button>
                ) : null}

                <Button
                  shape="round"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/')}
                  className="!h-10 !w-full !rounded-full !border-[#e4d4c5] !px-4 !font-semibold !text-[#5a4033] sm:!w-auto"
                >
                  Quay lại thực đơn
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-[#ead8cc] bg-white/80 p-5 shadow-[0_10px_28px_rgba(60,33,18,0.04)]">
            <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-[#a26745]">Thông tin món</p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-bold text-[#24130b]">Nguyên liệu chính</p>
                <div className="flex flex-wrap gap-2">
                  {(item.ingredients?.length ? item.ingredients : ['Đang cập nhật']).map((entry) => (
                    <Tag key={entry} className="!m-0 !rounded-full !border-[#ecd7c8] !bg-[#fdf7f2] !px-3 !py-1 !text-sm !text-[#714b38]">
                      {entry}
                    </Tag>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-bold text-[#24130b]">Lưu ý dị ứng</p>
                <div className="flex flex-wrap gap-2">
                  {(item.allergens?.length ? item.allergens : ['Không có ghi chú cụ thể']).map((entry) => (
                    <Tag key={entry} className="!m-0 !rounded-full !border-[#f5d8d8] !bg-[#fff6f6] !px-3 !py-1 !text-sm !text-[#9d4e4e]">
                      {entry}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-[#ead8cc] bg-white/80 p-5 shadow-[0_10px_28px_rgba(60,33,18,0.04)]">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-[#a26745]">Trải nghiệm AR</p>
              <p className="mt-2 mb-0 text-base font-semibold text-[#24130b]">
                {canViewAr ? 'Có thể xem mô hình 3D/AR của món này' : 'Món này chưa có mô hình AR'}
              </p>
            </div>

            {item.recommendedFor?.length > 0 ? (
              <div className="rounded-3xl border border-[#ead8cc] bg-white/80 p-5 shadow-[0_10px_28px_rgba(60,33,18,0.04)]">
                <p className="m-0 text-sm font-bold text-[#24130b]">Gợi ý phù hợp</p>
                <div className="mt-3 space-y-2">
                  {item.recommendedFor.map((entry) => (
                    <div key={entry} className="flex items-start gap-2 text-sm text-[#5f4b3f]">
                      <CheckCircleFilled className="mt-0.5 text-[#8B0000]" />
                      <span>{entry}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {relatedItems.length > 0 ? (
          <section className="mt-10 sm:mt-12">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#a26745]">Có thể bạn sẽ thích</p>
                <h2 className="m-0 text-2xl font-black tracking-tight text-[#24130b]">Món cùng danh mục</h2>
              </div>
              <Button type="link" onClick={() => navigate('/')} className="!h-auto !px-0 !text-left !font-semibold !text-[#8B0000]">
                Xem toàn bộ thực đơn
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedItems.map((related) => (
                <button
                  key={related.id}
                  type="button"
                  onClick={() => navigate(`/menu/${related.id}`)}
                  className="overflow-hidden rounded-[24px] border border-[#eaded2] bg-white text-left shadow-[0_12px_28px_rgba(60,33,18,0.05)] transition-transform hover:-translate-y-1"
                >
                  <div className="h-44 overflow-hidden bg-[#f4ece5]">
                    <img src={related.imageUrl} alt={related.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <p className="m-0 text-lg font-bold text-[#24130b]">{related.name}</p>
                    <p className="mt-2 mb-0 line-clamp-2 text-sm leading-6 text-[#625044]">{related.description}</p>
                    <p className="mt-4 mb-0 text-base font-extrabold text-[#8B0000]">{currency.format(related.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
