import { Alert, Button, Card, Divider, Empty, Result, Spin, Tag, Typography, message } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { cancelTakeawayOrder, getTakeawayOrderById } from '../services/orderApi.js'
import { useCart } from '../contexts/CartContext.jsx'

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function statusColor(status) {
  if (status === 'paid') return 'green'
  if (status === 'cancelled') return 'red'
  return 'gold'
}

export default function PaymentPage() {
  const { orderId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { clearCart } = useCart()

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [checkoutUrl, setCheckoutUrl] = useState(location.state?.checkoutUrl || '')
  const checkoutUrlRef = useRef(location.state?.checkoutUrl || '')
  const successShownRef = useRef(false)
  const timeoutHandledRef = useRef(false)

  const payment = order?.payment || null
  const orderStatus = order?.status || 'pending'
  const isPaid = orderStatus === 'paid'

  const transferContent = useMemo(() => {
    if (!payment?.provider_ref) return ''
    return `SEVQR TKPV88 ${payment.provider_ref}`.trim()
  }, [payment?.provider_ref])

  useEffect(() => {
    if (isPaid) {
      return undefined
    }

    let mounted = true
    let intervalId = null
    let timeoutId = null

    const loadOrder = async () => {
      if (!orderId) {
        if (mounted) {
          setError('Thiếu mã đơn thanh toán')
          setLoading(false)
        }
        return
      }

      try {
        const response = await getTakeawayOrderById(orderId)
        const data = response?.data || null

        if (!mounted) return

        setOrder(data)
        const nextCheckoutUrl = data?.checkout_url || data?.payment?.checkout_url || checkoutUrlRef.current
        if (nextCheckoutUrl && nextCheckoutUrl !== checkoutUrlRef.current) {
          checkoutUrlRef.current = nextCheckoutUrl
          setCheckoutUrl(nextCheckoutUrl)
        }
        setLoading(false)

        if (data?.status === 'paid') {
          if (timeoutId) window.clearTimeout(timeoutId)
          clearCart()
          if (!successShownRef.current) {
            message.success('Thanh toán online thành công')
            successShownRef.current = true
          }
          window.clearInterval(intervalId)
        }
      } catch (fetchError) {
        if (!mounted) return
        setError(fetchError?.message || 'Không tải được đơn thanh toán')
        setLoading(false)
      }
    }

    loadOrder()
    intervalId = window.setInterval(loadOrder, 3000)
    timeoutId = window.setTimeout(async () => {
      if (!mounted || timeoutHandledRef.current || isPaid) return
      timeoutHandledRef.current = true

      if (intervalId) window.clearInterval(intervalId)

      try {
        await cancelTakeawayOrder(orderId)
      } catch {
        // ignore cancel failure and still return to cart
      }

      message.error('Hết 5 phút thanh toán, đơn đã được hủy')
      navigate('/cart?payment=cancelled', { replace: true })
    }, 5 * 60 * 1000)

    return () => {
      mounted = false
      if (intervalId) window.clearInterval(intervalId)
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [clearCart, navigate, orderId, isPaid])

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-6 py-12">
        <Spin size="large" tip="Đang tải QR thanh toán..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Card className="rounded-2xl">
          <Empty description={error} />
          <div className="mt-4 flex justify-center">
            <Button type="primary" onClick={() => navigate('/cart', { replace: true })}>
              Quay lại giỏ hàng
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="overflow-hidden rounded-3xl border border-[#ece8df] shadow-[0_18px_42px_rgba(17,24,39,0.08)]">
        {isPaid ? (
          <div className="rounded-3xl bg-white p-3 shadow-inner">
            <Result
              status="success"
              title="Thanh toán thành công"
              subTitle="Đơn hàng đã được SePay xác nhận. Bạn có thể quay lại trang chính để tiếp tục đặt món."
              extra={[
                <Button key="home" type="primary" onClick={() => navigate('/', { replace: true })}>
                  Về trang chính
                </Button>,
              ]}
            />
          </div>
        ) : (
          <>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <Typography.Title level={2} className="!mb-1 !mt-0">
              Quét QR để thanh toán
            </Typography.Title>
            <Typography.Text type="secondary">
              Thanh toán chuyển khoản sẽ được xác nhận tự động khi SePay bắn webhook.
            </Typography.Text>
          </div>
          <Tag color={statusColor(orderStatus)} className="m-0 px-3 py-1 text-sm capitalize">
            {orderStatus}
          </Tag>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-[#fff8f0] to-[#fffdf9] p-4 shadow-inner">
          {checkoutUrl ? (
            <img
              src={checkoutUrl}
              alt="QR thanh toán SePay"
              className="mx-auto block w-full max-w-[460px] rounded-2xl bg-white p-3 shadow-[0_14px_28px_rgba(17,24,39,0.12)]"
            />
          ) : (
            <Empty description="Không tìm thấy QR thanh toán" />
          )}
        </div>

        <Alert
          className="mt-5"
          type="info"
          showIcon
          message="Mở app ngân hàng, quét QR, chuyển đúng số tiền và nội dung bên dưới để hệ thống tự xác nhận đơn."
        />
          </>
        )}
      </Card>

      <Card className="rounded-3xl border border-[#ece8df] shadow-[0_18px_42px_rgba(17,24,39,0.08)]">
        <Typography.Title level={4} className="!mt-0">
          Thông tin thanh toán
        </Typography.Title>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Mã đơn</span>
            <span className="font-semibold text-slate-800">{order?._id}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Tổng tiền</span>
            <span className="font-semibold text-slate-800">{currency.format(order?.total_amount || 0)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Trạng thái</span>
            <Tag color={statusColor(orderStatus)} className="m-0 px-3 py-1 capitalize">
              {orderStatus}
            </Tag>
          </div>
        </div>

        <Divider />

        <div className="space-y-3 rounded-2xl bg-[#faf7f2] p-4">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Nội dung chuyển khoản</div>
            <div className="mt-2 break-words rounded-xl bg-white px-4 py-3 font-semibold text-slate-900 shadow-sm">
              {transferContent || 'SEVQR TKPV88 [Mã đơn]'}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Trạng thái xác nhận</div>
            <div className="mt-2 text-slate-700">
              {orderStatus === 'paid'
                ? 'Đơn đã được xác nhận tự động.'
                : 'Đang chờ webhook SePay xác nhận giao dịch.'}
            </div>
          </div>

          <Button
            type="primary"
            block
            onClick={() => window.location.reload()}
            className="mt-2 h-11 font-semibold"
          >
            Tôi đã chuyển khoản xong
          </Button>
        </div>
      </Card>
    </div>
  )
}