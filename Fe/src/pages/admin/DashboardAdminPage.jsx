import {
  ClockCircleOutlined,
  FireOutlined,
  PlusOutlined,
  TeamOutlined,
  TrophyOutlined,
  WalletOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import { message, Spin } from 'antd'
import { useOutletContext } from 'react-router-dom'
import { getDashboardStats } from '../../services/adminDashboardApi.js'
import { getAllOrders } from '../../services/adminOrderApi.js'

function formatCurrency(num) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(num || 0))
}

function statusClassName(status) {
  if (['completed', 'paid', 'served'].includes(status)) return 'bg-emerald-50 text-emerald-700'
  if (['pending', 'cooking', 'ready'].includes(status)) return 'bg-amber-50 text-amber-700'
  return 'bg-rose-50 text-rose-700'
}

function toneClassName(tone) {
  if (tone === 'red') return 'border-l-[#cf0f23]'
  if (tone === 'dark') return 'border-l-[#111111]'
  if (tone === 'ruby') return 'border-l-[#8b1f2a]'
  return 'border-l-[#5e6168]'
}

export default function DashboardAdminPage() {
  const { adminSearchQuery = '' } = useOutletContext() || {}
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchOrders, setSearchOrders] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  const recentOrders = useMemo(() => data?.recentOrders || [], [data])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getDashboardStats()
      if (res?.success) {
        setData(res.data)
      }
    } catch (err) {
      console.error(err)
      message.error('Không thể tải dữ liệu bảng điều khiển')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const keyword = String(adminSearchQuery || '').trim()

    if (!keyword) {
      setSearchOrders([])
      setSearchLoading(false)
      return
    }

    let mounted = true
    setSearchLoading(true)

    getAllOrders({ order_id: keyword, limit: 25 })
      .then((res) => {
        if (!mounted) return
        const rows = Array.isArray(res?.orders) ? res.orders : []
        setSearchOrders(rows.map((o) => ({
          id: o._id,
          customer: o.customer_name || 'Dine-in Guest',
          items_count: Array.isArray(o.items) ? o.items.length : 0,
          time: o.createdAt,
          amount: o.total_amount,
          status: o.status,
        })))
      })
      .catch(() => {
        if (!mounted) return
        setSearchOrders([])
      })
      .finally(() => {
        if (mounted) setSearchLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [adminSearchQuery])

  const displayedRecentOrders = useMemo(() => {
    const keyword = String(adminSearchQuery || '').trim()
    if (!keyword) return recentOrders
    return searchOrders
  }, [adminSearchQuery, recentOrders, searchOrders])

  if (loading || !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
      </div>
    )
  }

  const { stats: s } = data
  const revenueTrend = Array.isArray(data?.revenueTrend) ? data.revenueTrend : []
  const maxTrendRevenue = Math.max(1, ...revenueTrend.map((point) => Number(point?.revenue || 0)))
  const trendTotal = revenueTrend.reduce((sum, point) => sum + Number(point?.revenue || 0), 0)

  const statsDisplay = [
    { key: 'revenue', title: 'Tổng doanh thu', value: formatCurrency(s.revenue), delta: '+Thời gian thực', icon: <WalletOutlined />, tone: 'red' },
    { key: 'orders', title: 'Tổng đơn hàng', value: s.totalOrders, delta: 'Toàn thời gian', icon: <FireOutlined />, tone: 'dark' },
    { key: 'newCustomers', title: 'Khách mới hôm nay', value: s.newCustomers, delta: 'Đã tham gia', icon: <TeamOutlined />, tone: 'slate' },
    { key: 'topDish', title: 'Món nổi bật', value: s.topDish.name, delta: `Đã bán ${s.topDish.count}`, icon: <TrophyOutlined />, tone: 'ruby' },
  ]

  return (
    <section className="space-y-5 pb-20">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#171717]">Tổng quan trong ngày</h1>
          <p className="mt-1.5 text-sm text-[#6d6f75]">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })} - Nhịp bếp</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[#c70f21] px-5 text-[12px] font-semibold uppercase tracking-[0.05em] text-white shadow-[0_10px_22px_rgba(199,15,33,0.25)] transition hover:bg-[#d2162a]"
          type="button"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
          Làm mới số liệu
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsDisplay.map((stat) => (
          <article
            key={stat.key}
            className={[
              'rounded-xl border border-[#e8e8ea] bg-[#fcfcfd] p-4 shadow-[0_2px_8px_rgba(16,24,40,0.03)]',
              'border-l-[2px]',
              toneClassName(stat.tone),
            ].join(' ')}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-[#f0f1f3] text-[#44474d]">{stat.icon}</div>
              <span className="rounded px-2 py-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50">{stat.delta}</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#8b8e95]">{stat.title}</p>
            <p className="mt-2 text-[29px] font-semibold leading-tight text-[#151618]">{stat.value}</p>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <article className="rounded-2xl border border-[#ebebed] bg-[#fcfcfd] p-5 shadow-[0_2px_12px_rgba(16,24,40,0.03)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[28px] font-semibold leading-tight text-[#191a1b]">Hiệu suất doanh thu</h2>
              <p className="text-sm text-[#8a8d95]">Doanh thu 7 ngày gần nhất từ các đơn đã thanh toán</p>
            </div>
            <div className="rounded-lg border border-[#ececef] bg-white px-3 py-2 text-right">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#8a8d95]">Tổng 7 ngày</p>
              <p className="text-sm font-semibold text-[#1a1b1d]">{formatCurrency(trendTotal)}</p>
            </div>
          </div>

          <div className="h-[250px] rounded-xl border border-[#ececef] bg-[#fafafb] px-4 py-5">
            {revenueTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <WalletOutlined className="text-3xl text-zinc-300" />
                  <p className="mt-2 text-xs font-medium uppercase tracking-widest text-zinc-400">Chưa có dữ liệu doanh thu</p>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-end gap-3">
                {revenueTrend.map((point) => {
                  const revenue = Number(point?.revenue || 0)
                  const ratio = revenue / maxTrendRevenue
                  const height = `${Math.max(8, Math.round(ratio * 100))}%`

                  return (
                    <div key={point.date} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                      <span className="text-[10px] font-medium text-[#7a7d84]">{formatCurrency(revenue)}</span>
                      <div className="relative flex h-[170px] w-full items-end rounded-md bg-white/70 px-1.5 pb-1.5 ring-1 ring-[#ededf0]">
                        <div
                          className="w-full rounded-sm bg-gradient-to-t from-[#b60d1d] to-[#e33a4f] shadow-[0_8px_14px_rgba(179,18,40,0.25)] transition-all"
                          style={{ height }}
                          title={`${point.label}: ${formatCurrency(revenue)}`}
                        />
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.1em] text-[#8a8d95]">{point.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </article>

        <aside className="rounded-2xl bg-gradient-to-b from-[#111111] to-[#2e1015] p-5 text-white shadow-[0_14px_28px_rgba(17,17,17,0.32)]">
          <h3 className="text-[28px] font-semibold leading-tight">Trạng thái bếp</h3>
          <p className="mt-1 text-xs text-white/60">Khung vận hành tối ưu</p>

          <div className="mt-6 space-y-3">
            <div className="rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10">
              <p className="text-[10px] uppercase tracking-[0.11em] text-white/65">Trạng thái</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Hệ thống ổn định
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10">
              <p className="text-[10px] uppercase tracking-[0.11em] text-white/65">Thời gian chờ trung bình</p>
              <p className="mt-2 text-lg font-semibold">14 phút</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-gradient-to-r from-[#4c090f] to-[#740f1b] p-3.5 ring-1 ring-white/10">
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/65">Giám sát trực tiếp</p>
            <div className="mt-3 flex items-center gap-2">
                <p className="text-[11px] text-white/80">Đang tổng hợp dữ liệu thời gian thực từ cụm MongoDB Atlas.</p>
            </div>
          </div>
        </aside>
      </div>

      <article className="rounded-2xl border border-[#e9e9eb] bg-[#fcfcfd] shadow-[0_2px_12px_rgba(16,24,40,0.03)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#efeff1] px-5 py-4">
          <div>
            <h3 className="text-[28px] font-semibold leading-tight text-[#191a1b]">Đơn hàng gần đây</h3>
            <p className="text-sm text-[#8a8d95]">Các giao dịch mới nhất theo mọi hình thức phục vụ</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.12em] text-[#9699a2]">
                <th className="px-5 py-3">Mã đơn</th>
                <th className="px-5 py-3">Khách hàng</th>
                <th className="px-5 py-3">Món</th>
                <th className="px-5 py-3">Thời gian</th>
                <th className="px-5 py-3">Số tiền</th>
                <th className="px-5 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {displayedRecentOrders.map((row) => (
                <tr key={row.id} className="border-t border-[#efeff1] text-sm text-[#2a2b30]">
                  <td className="px-5 py-4 font-mono text-[11px] font-semibold text-[#21242a]">{row.id}</td>
                  <td className="px-5 py-4">{row.customer}</td>
                  <td className="px-5 py-4 text-[#656870]">{row.items_count} món</td>
                  <td className="px-5 py-4 text-[#656870]">{new Date(row.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-5 py-4 font-semibold">{formatCurrency(row.amount)}</td>
                  <td className="px-5 py-4">
                    <span className={["rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]", statusClassName(row.status)].join(' ')}>{row.status}</span>
                  </td>
                </tr>
              ))}
              {displayedRecentOrders.length === 0 && !searchLoading ? (
                <tr>
                  <td className="px-5 py-6 text-center text-sm text-zinc-500" colSpan={6}>
                    Không tìm thấy đơn hàng theo mã đã nhập.
                  </td>
                </tr>
              ) : null}
              {searchLoading ? (
                <tr>
                  <td className="px-5 py-6 text-center text-sm text-zinc-500" colSpan={6}>
                    Đang tìm đơn hàng...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
