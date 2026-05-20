import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  InfoCircleOutlined,
  ScanOutlined,
  ShoppingCartOutlined,
  StarFilled,
} from '@ant-design/icons'
import { Breadcrumb, Button, Card, Empty, Skeleton, Tag, message } from 'antd'
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

  const handleAddToCart = () => {
    if (!item?.id) return
    addItem(item.id, 1)
    message.success('Đã thêm món vào giỏ hàng')
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
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-12">
        <Breadcrumb
          className="mb-6"
          items={[
            { title: <Link to="/">Trang chủ</Link> },
            { title: <Link to={`/?category=${item.category}`}>{formatCategoryLabel(item.category)}</Link> },
            { title: item.name },
          ]}
        />

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-[32px] border border-[#efe3da] bg-white shadow-[0_20px_50px_rgba(60,33,18,0.08)]">
            <div className="relative h-[320px] bg-[#f5ede5] md:h-[420px]">
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1d120b]/70 to-transparent px-6 py-5">
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
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.22em] text-[#a26745]">
                {formatCategoryLabel(item.category)}
              </p>
              <h1 className="m-0 text-4xl font-black tracking-[-0.04em] text-[#24130b] md:text-5xl">
                {item.name}
              </h1>
              <p className="mt-4 text-lg leading-8 text-[#5f4b3f]">
                {item.description || 'Món ăn nổi bật trong thực đơn Sakura Restaurant.'}
              </p>
            </div>

            <div className="rounded-[28px] border border-[#ead8cc] bg-white/90 p-6 shadow-[0_12px_32px_rgba(60,33,18,0.06)]">
              <div className="flex items-end justify-between gap-4 border-b border-[#f2e6dd] pb-5">
                <div>
                  <p className="m-0 text-xs font-bold uppercase tracking-[0.2em] text-[#9f6d4d]">Giá bán</p>
                  <p className="mt-2 mb-0 text-3xl font-black text-[#8b0000]">
                    {currency.format(item.price)}
                  </p>
                </div>

                <Button
                  type="primary"
                  shape="round"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  className="!h-11 !border-0 !bg-[#8B0000] !px-5 !font-bold"
                >
                  Thêm vào giỏ
                </Button>
              </div>

              <div className="mt-5 space-y-4">
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

                <div className="grid gap-4">
                  <Card className="!rounded-2xl !border-[#efe5db] !shadow-none" bodyStyle={{ padding: 18 }}>
                    <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-[#a26745]">Trải nghiệm AR</p>
                    <p className="mt-2 mb-0 text-base font-semibold text-[#24130b]">
                      {canViewAr ? 'Có thể xem mô hình 3D/AR của món này' : 'Món này chưa có mô hình AR'}
                    </p>
                  </Card>
                </div>

                {item.recommendedFor?.length > 0 ? (
                  <div className="rounded-2xl border border-[#efe5db] bg-[#fffdfa] px-4 py-4">
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

                <div className="flex flex-wrap gap-3">
                  {canViewAr ? (
                    <Button
                      shape="round"
                      icon={<ScanOutlined />}
                      onClick={() => navigate(`/ar?itemId=${encodeURIComponent(item.id)}`)}
                      className="!h-10 !rounded-full !border-[#dcb7b7] !px-4 !font-semibold !text-[#8B0000]"
                    >
                      Xem AR món ăn
                    </Button>
                  ) : null}

                  <Button
                    shape="round"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/')}
                    className="!h-10 !rounded-full !border-[#e4d4c5] !px-4 !font-semibold !text-[#5a4033]"
                  >
                    Quay lại thực đơn
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {relatedItems.length > 0 ? (
          <section className="mt-12">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#a26745]">Có thể bạn sẽ thích</p>
                <h2 className="m-0 text-2xl font-black tracking-tight text-[#24130b]">Món cùng danh mục</h2>
              </div>
              <Button type="link" onClick={() => navigate('/')} className="!px-0 !font-semibold !text-[#8B0000]">
                Xem toàn bộ thực đơn
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
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
