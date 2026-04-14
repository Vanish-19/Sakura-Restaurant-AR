import { Button, Card, Empty, Segmented, Spin, Tag, Typography, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getMyTableOrders, getUserOrderHistory } from '../services/orderApi.js'
import { getUserAccessToken } from '../utils/authSession.js'
import { getOrderSource } from '../utils/orderSource.js'
import { ensureTableToken } from '../utils/tableSession.js'

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function normalizeOrders(payload) {
  const list = Array.isArray(payload?.data) ? payload.data : []
  return list
}

function statusColor(status) {
  switch (status) {
    case 'paid':
      return 'green'
    case 'cancelled':
      return 'red'
    case 'cooking':
      return 'orange'
    case 'served':
      return 'cyan'
    default:
      return 'default'
  }
}

export default function OrderHistoryPage() {
  const [searchParams] = useSearchParams()
  const orderSource = getOrderSource(searchParams)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [expandedOrderId, setExpandedOrderId] = useState(null)

  const modeLabel = useMemo(() => {
    if (orderSource.mode === 'dine-in') return orderSource.label || 'Ăn tại bàn'
    return 'Giao tận nơi'
  }, [orderSource.label, orderSource.mode])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)

        if (orderSource.mode === 'dine-in' && orderSource.tableCode) {
          const tableToken = await ensureTableToken(orderSource.tableCode)
          const payload = await getMyTableOrders(tableToken)
          if (!cancelled) setOrders(normalizeOrders(payload))
          return
        }

        const userToken = getUserAccessToken()
        if (!userToken) {
          if (!cancelled) setOrders([])
          return
        }

        const payload = await getUserOrderHistory()
        if (!cancelled) setOrders(normalizeOrders(payload))
      } catch (error) {
        if (!cancelled) {
          setOrders([])
          message.error(error?.message || 'Không thể tải lịch sử đơn hàng')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [orderSource.mode, orderSource.tableCode])

  const visibleOrders = useMemo(() => {
    if (activeFilter === 'all') return orders
    return orders.filter((order) => order.order_type === activeFilter)
  }, [activeFilter, orders])

  const firstItemImage = (order) => {
    const first = order?.items?.[0]
    return first?.menu_item?.image_url || 'https://placehold.co/260x160?text=Sakura'
  }

  const filterOptions = [
    { label: 'Ăn tại chỗ', value: 'dine_in' },
    { label: 'Giao tận nơi', value: 'takeaway' },
    { label: 'Tất cả', value: 'all' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            to={{ pathname: orderSource.mode === 'dine-in' ? '/order' : '/', search: searchParams.toString() ? `?${searchParams.toString()}` : '' }}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-red-600"
          >
            Quay lại trang món ăn
          </Link>
          <Typography.Title level={2} className="ui-page-title !mb-1 !mt-2">
            Lịch sử món đã gọi
          </Typography.Title>
          <p className="ui-page-subtitle m-0">Xem lại các món bạn đã thưởng thức tại {modeLabel}. Chạm vào từng đơn để xem chi tiết.</p>
        </div>

        <Segmented
          options={filterOptions}
          value={activeFilter}
          onChange={setActiveFilter}
          className="!rounded-lg !bg-[#f4f4f6] !p-1"
        />
      </div>

      <Card className="ui-card !bg-[#fbfbfc]">
        {loading ? (
          <div className="flex items-center justify-center py-14">
            <Spin />
          </div>
        ) : visibleOrders.length === 0 ? (
          <Empty description="Chưa có đơn nào" />
        ) : (
          <div className="space-y-4">
            {visibleOrders.map((order) => {
              const isExpanded = expandedOrderId === order._id

              return (
                <button
                  key={order._id}
                  type="button"
                  onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                  className="w-full rounded-2xl border border-[#ececf1] bg-white p-4 text-left transition hover:border-[#d6d6df] hover:shadow-[0_10px_24px_rgba(17,24,39,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <img
                      src={firstItemImage(order)}
                      alt="order-preview"
                      className="h-20 w-28 rounded-lg object-cover"
                    />

                    <div className="min-w-[240px] flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-base font-bold text-slate-900">#{String(order._id).slice(-6).toUpperCase()}</div>
                        <Tag color={statusColor(order.status)}>{String(order.status || '').toUpperCase()}</Tag>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</div>

                      <div className="mt-2 text-sm text-slate-700">
                        {(order.items || []).slice(0, 2).map((line) => line.menu_item?.name || 'Món ăn').join(', ')}
                        {(order.items || []).length > 2 ? ` +${(order.items || []).length - 2} món` : ''}
                      </div>
                    </div>

                    <div className="min-w-[130px] text-right">
                      <div className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Tổng cộng</div>
                      <div className="mt-1 text-2xl font-extrabold text-red-600">{currency.format(order.total_amount || 0)}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button size="small" className="!h-8 !rounded-md !border !border-[#e3e4ea] !bg-[#f7f8fb] !px-3 !font-semibold !text-slate-600">
                      {order.status === 'paid' ? 'Đặt lại' : 'Theo dõi đơn'}
                    </Button>
                    <Button size="small" className="!h-8 !rounded-md !border !border-[#f3c2cb] !bg-[#fff1f4] !px-3 !font-semibold !text-[#b3132b]">
                      {isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                    </Button>
                  </div>

                  {isExpanded ? (
                    <div className="mt-4 rounded-xl border border-[#ececf1] bg-[#fafafb] p-3">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Chi tiết món đã gọi</div>
                      <div className="space-y-1.5">
                        {(order.items || []).map((line) => (
                          <div key={`${order._id}-${line._id || line.menu_item?._id}`} className="flex items-center justify-between text-sm">
                            <span className="text-slate-700">{line.menu_item?.name || 'Món ăn'} x{line.quantity}</span>
                            <span className="font-semibold text-slate-800">{currency.format((line.price_at_order || 0) * (line.quantity || 0))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </button>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
