import { Alert, Card, Empty, Form, Input, Radio, Space, Typography, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import CartItemRow from '../components/molecules/CartItemRow.jsx'
import { useCart } from '../contexts/CartContext.jsx'
import { createDineInOrderWithUser, createTakeawayOrder, getMenuItems } from '../services/orderApi.js'
import { getUserAccessToken, isUserLoggedIn } from '../utils/authSession.js'
import { ensureTableToken } from '../utils/tableSession.js'
import { getOrderSource } from '../utils/orderSource.js'

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

export default function CartPage() {
  const { entries, removeItem, setQuantity, clearCart } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const isAndroidPreview = searchParams.get('preview') === 'android'
  const paymentStatus = searchParams.get('payment')
  const orderSource = getOrderSource(searchParams)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [menuItems, setMenuItems] = useState([])
  const [deliveryForm] = Form.useForm()
  const [dineInIdentityForm] = Form.useForm()
  const [paymentMethod, setPaymentMethod] = useState('cod')

  useEffect(() => {
    let mounted = true
    getMenuItems()
      .then((items) => { if (mounted) setMenuItems(items) })
      .catch(() => { if (mounted) setMenuItems([]) })
    return () => { mounted = false }
  }, [])

  const itemsById = useMemo(() => {
    return Object.fromEntries(menuItems.map((item) => [item.id, item]))
  }, [menuItems])

  const lines = useMemo(() => {
    return entries
      .map(([id, quantity]) => ({ item: itemsById[id], id, quantity }))
      .filter((line) => Boolean(line.item))
  }, [entries, itemsById])

  const subtotal = useMemo(() => {
    return lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0)
  }, [lines])

  const tax = useMemo(() => subtotal * 0.1, [subtotal])
  const total = useMemo(() => subtotal + tax, [subtotal, tax])

  const continueShoppingTo = {
    pathname: orderSource.mode === 'dine-in' ? '/order' : '/',
    search: searchParams.toString() ? `?${searchParams.toString()}` : '',
  }

  const orderHistoryTo = {
    pathname: '/orders/history',
    search: searchParams.toString() ? `?${searchParams.toString()}` : '',
  }

  const checkoutLabel =
    orderSource.mode === 'dine-in'
      ? `Gọi món cho ${orderSource.label}`
      : paymentMethod === 'online'
        ? 'Đặt hàng và thanh toán SePay'
        : 'Đặt hàng COD'

  useEffect(() => {
    if (paymentStatus === 'success') {
      clearCart()
      message.success('Thanh toán online thành công')

      const next = new URLSearchParams(searchParams)
      next.delete('payment')
      navigate(
        {
          pathname: '/',
          search: next.toString() ? `?${next.toString()}` : '',
        },
        { replace: true },
      )
      return
    }

    if (paymentStatus === 'cancelled') {
      message.info('Thanh toán online đã bị hủy')

      const next = new URLSearchParams(searchParams)
      next.delete('payment')
      setSearchParams(next, { replace: true })
    }
  }, [clearCart, navigate, paymentStatus, searchParams, setSearchParams])

  const checkoutPayload = useMemo(() => {
    return {
      orderType: orderSource.mode,
      tableCode: orderSource.tableCode,
      sourceLabel: orderSource.label,
      paymentMethod,
      items: lines.map((line) => ({
        id: line.id,
        name: line.item.name,
        unitPrice: line.item.price,
        quantity: line.quantity,
        lineTotal: Math.round(line.item.price * line.quantity),
      })),
      pricing: {
        subtotal: Math.round(subtotal),
        tax: Math.round(tax),
        total: Math.round(total),
      },
      createdAt: new Date().toISOString(),
    }
  }, [lines, orderSource.label, orderSource.mode, orderSource.tableCode, paymentMethod, subtotal, tax, total])

  const handleCheckout = () => {
    return (async () => {
      if (isSubmitting) return
      if (lines.length === 0) {
        message.warning('Giỏ hàng đang trống')
        return
      }

      if (orderSource.mode === 'delivery' && !isUserLoggedIn()) {
        message.warning('Đơn giao tận nơi yêu cầu đăng nhập hoặc đăng ký tài khoản')
        navigate(`/auth/login?redirect=${encodeURIComponent('/cart')}`)
        return
      }

      setIsSubmitting(true)

      try {
        let response

        if (orderSource.mode === 'dine-in') {
          const activeUserToken = getUserAccessToken()
          const loyaltyPhone = String(dineInIdentityForm.getFieldValue('customer_phone') || '').trim()

          const token = await ensureTableToken(orderSource.tableCode)
          response = await createDineInOrderWithUser(
            token,
            lines.map((line) => ({
              menu_item_id: line.id,
              quantity: line.quantity,
              note: '',
            })),
            {
              userAccessToken: activeUserToken,
              customerPhone: loyaltyPhone,
            },
          )
        } else {
          const values = await deliveryForm.validateFields()

          response = await createTakeawayOrder({
            customer_name: values.customer_name,
            customer_phone: values.customer_phone,
            delivery_address: values.delivery_address,
            payment_method: paymentMethod,
            items: lines.map((line) => ({
              menu_item_id: line.id,
              quantity: line.quantity,
            })),
          })

          if (paymentMethod === 'online') {
            const orderId = response?.data?._id
            const checkoutUrl = response?.data?.checkout_url

            if (!orderId) {
              throw new Error('Không tạo được đơn thanh toán online')
            }

            navigate(
              {
                pathname: `/payment/${orderId}`,
              },
              {
                replace: true,
                state: checkoutUrl ? { checkoutUrl } : undefined,
              },
            )
            return
          }

          try {
            localStorage.setItem(
              'armenuweb_last_delivery_payment_method',
              paymentMethod,
            )
            localStorage.setItem(
              'armenuweb_last_delivery_form',
              JSON.stringify({
                customer_name: values.customer_name,
                customer_phone: values.customer_phone,
                delivery_address: values.delivery_address,
                payment_method: paymentMethod,
              }),
            )
          } catch {
            // ignore if storage is unavailable
          }
        }

        try {
          localStorage.setItem(
            'armenuweb_last_checkout_payload',
            JSON.stringify({
              request: checkoutPayload,
              response,
            }),
          )
        } catch {
          // ignore if storage is unavailable
        }

        clearCart()
        message.success(
          orderSource.mode === 'dine-in'
            ? `Đã gửi đơn cho ${orderSource.label}`
            : 'Đã tạo đơn giao hàng thành công',
        )

        const shouldGoHistory = orderSource.mode === 'dine-in' || isUserLoggedIn()
        if (shouldGoHistory) {
          navigate(
            {
              pathname: '/orders/history',
              search: searchParams.toString() ? `?${searchParams.toString()}` : '',
            },
            { replace: true },
          )
          return
        }

        navigate(
          {
            pathname: '/',
            search: searchParams.toString() ? `?${searchParams.toString()}` : '',
          },
          { replace: true },
        )
      } catch (error) {
        const text = error?.message || 'Không thể kết nối máy chủ'
        message.error(text)
      } finally {
        setIsSubmitting(false)
      }
    })()
  }

  const renderDineInIdentityForm = () => {
    return (
      <Card className="rounded-2xl !border-[#e7e7ea] !shadow-[0_8px_22px_rgba(17,24,39,0.04)]" title="Thông tin tích điểm (tùy chọn)">
        <Form form={dineInIdentityForm} layout="vertical" initialValues={{ customer_name: '', customer_phone: '' }}>
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            <Form.Item label="Tên (tùy chọn)" name="customer_name" className="!mb-3">
              <Input placeholder="Nguyễn Văn A" size="large" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại tích điểm"
              name="customer_phone"
              rules={[{ min: 8, message: 'Số điện thoại phải có ít nhất 8 ký tự' }]}
              className="!mb-3"
            >
              <Input placeholder="0987654321" size="large" />
            </Form.Item>
          </div>
          <div className="text-xs text-slate-500">
            Khách ăn tại chỗ có thể bỏ qua bước này. Nếu nhập số điện thoại, hệ thống sẽ ghi nhận tích điểm cho bạn.
          </div>
        </Form>
      </Card>
    )
  }

  const summaryActionButtonClass = 'ui-btn-primary mt-3 h-12 w-full text-base !text-white hover:!text-white disabled:cursor-not-allowed disabled:opacity-60'

  const continueShoppingClass =
    'ui-btn-soft mt-3 flex h-12 w-full items-center justify-center text-[1.02rem] tracking-[0.01em] !text-[#3f3a37] visited:!text-[#3f3a37] no-underline font-[var(--font-heading)]'

  const orderHistoryButtonClass =
    'ui-btn-accent mt-3 flex h-12 w-full items-center justify-center text-[1rem] tracking-[0.01em] !text-[#b30d26] visited:!text-[#b30d26] no-underline'

  const renderDeliveryForm = () => (
    <Card className="ui-form-card" title="Thông tin giao hàng">
      <Form
        form={deliveryForm}
        layout="vertical"
        initialValues={{
          customer_name: '',
          customer_phone: '',
          delivery_address: '',
        }}
      >
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <Form.Item
            label="Tên người nhận"
            name="customer_name"
            rules={[{ required: true, message: 'Vui lòng nhập tên người nhận' }]}
            className="!mb-3"
          >
            <Input placeholder="Nguyễn Văn A" size="large" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="customer_phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { min: 8, message: 'Số điện thoại phải có ít nhất 8 ký tự' },
            ]}
            className="!mb-3"
          >
            <Input placeholder="0987654321" size="large" />
          </Form.Item>
        </div>

        <Form.Item
          label="Địa chỉ giao hàng"
          name="delivery_address"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng' }]}
          className="!mb-1"
        >
          <Input.TextArea
            rows={2}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
          />
        </Form.Item>
      </Form>
    </Card>
  )

  const renderPaymentMethods = () => (
    <Card className="ui-form-card" title="Phương thức thanh toán">
      <Radio.Group
        value={paymentMethod}
        onChange={(event) => setPaymentMethod(event.target.value)}
        className="grid gap-2.5 md:grid-cols-2"
      >
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#e5e7eb] p-3.5 transition hover:border-[#c9c0b5]">
          <Radio value="online" className="mt-1" />
          <span>
            <span className="block font-semibold text-slate-900">Thanh toán online</span>
            <span className="block text-sm text-slate-500">Chuyển khoản hoặc cổng thanh toán điện tử</span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#e5e7eb] p-3.5 transition hover:border-[#c9c0b5]">
          <Radio value="cod" className="mt-1" />
          <span>
            <span className="block font-semibold text-slate-900">Thanh toán khi nhận hàng</span>
            <span className="block text-sm text-slate-500">Trả tiền mặt cho shipper hoặc tại cửa</span>
          </span>
        </label>
      </Radio.Group>

      <Alert
        className="mt-4"
        type="info"
        showIcon
        message={
          paymentMethod === 'online'
            ? 'Bạn sẽ được chuyển sang SePay sau khi tạo đơn.'
            : 'Đơn COD sẽ được ghi nhận và xác nhận thanh toán sau.'
        }
      />
    </Card>
  )

  const renderDeliverySummary = () => (
    <Card className="ui-form-card" title="Tóm tắt giao hàng">
      <Space direction="vertical" size={8} className="w-full">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Tên người nhận</span>
          <span className="font-medium text-slate-700">{deliveryForm.getFieldValue('customer_name') || 'Chưa nhập'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Số điện thoại</span>
          <span className="font-medium text-slate-700">{deliveryForm.getFieldValue('customer_phone') || 'Chưa nhập'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Thanh toán</span>
          <span className="font-medium text-slate-700">{paymentMethod === 'online' ? 'Trực tuyến' : 'COD'}</span>
        </div>
      </Space>
    </Card>
  )

  const renderSummaryCard = () => (
    <Card className="ui-card !shadow-[0_16px_34px_rgba(17,24,39,0.08)]" title="Tóm tắt đơn hàng">
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="text-slate-500">Tạm tính</div>
          <div className="font-medium text-slate-700">{currency.format(subtotal)}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-slate-500">Thuế (10%)</div>
          <div className="font-medium text-slate-700">{currency.format(tax)}</div>
        </div>
        <div className="border-t border-[#e5e7eb]" />
        <div className="flex items-center justify-between pt-1">
          <div className="text-3xl font-bold text-slate-900">Tổng cộng</div>
          <div className="text-3xl font-extrabold text-red-600">{currency.format(total)}</div>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          className={summaryActionButtonClass}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang gửi...' : checkoutLabel}
        </button>

        <Link to={continueShoppingTo} className={continueShoppingClass}>
          Tiếp tục chọn món
        </Link>

        <Link to={orderHistoryTo} className={orderHistoryButtonClass}>
          Xem lịch sử gọi món
        </Link>
      </div>
    </Card>
  )

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14">
      <div className="mb-5">
        <Typography.Title
          level={2}
          className="ui-page-title"
        >
          Giỏ hàng của bạn
        </Typography.Title>
        <div className="mt-2 inline-flex items-center rounded-full border border-[#f7c8cc] bg-[#ffe9eb] px-3 py-1.5 text-[12px] font-semibold tracking-[0.02em] text-[#a80f22] shadow-[0_4px_10px_rgba(229,62,86,0.12)]">
          {orderSource.mode === 'dine-in'
            ? `Giỏ hàng • ${orderSource.label}`
            : 'Giỏ hàng • Giao tận nơi'}
        </div>
      </div>

      {lines.length === 0 ? (
        <div className="py-12">
          <Empty description="Chưa có món nào trong giỏ." />
          <div className="mx-auto mt-4 max-w-sm">
            <Link
              to={orderHistoryTo}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-[#f0b9c1] bg-[#fff2f4] text-[0.98rem] font-semibold !text-[#b30d26] no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-[#da8695] hover:bg-[#ffe6ea] hover:!text-[#98001b] hover:shadow-md"
            >
              Xem lịch sử gọi món
            </Link>
          </div>
        </div>
      ) : (
        <>
          {isAndroidPreview ? (
            <div className="mt-6 space-y-4">
              {lines.map((line) => (
                <CartItemRow
                  key={line.id}
                  item={line.item}
                  quantity={line.quantity}
                  onIncrease={() => setQuantity(line.id, line.quantity + 1)}
                  onDecrease={() =>
                    setQuantity(line.id, Math.max(1, line.quantity - 1))
                  }
                  onRemove={() => removeItem(line.id)}
                />
              ))}

              {orderSource.mode === 'delivery' ? (
                <div className="space-y-4">
                  {renderDeliveryForm()}
                  {renderPaymentMethods()}
                </div>
              ) : (
                renderDineInIdentityForm()
              )}

              {renderSummaryCard()}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                {lines.map((line) => (
                  <CartItemRow
                    key={line.id}
                    item={line.item}
                    quantity={line.quantity}
                    onIncrease={() => setQuantity(line.id, line.quantity + 1)}
                    onDecrease={() =>
                      setQuantity(line.id, Math.max(1, line.quantity - 1))
                    }
                    onRemove={() => removeItem(line.id)}
                  />
                ))}

                {orderSource.mode === 'delivery' ? (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>{renderDeliveryForm()}</div>
                    <div className="space-y-4">
                      {renderPaymentMethods()}
                      {renderDeliverySummary()}
                    </div>
                  </div>
                ) : (
                  <div>{renderDineInIdentityForm()}</div>
                )}
              </div>

              <div className="lg:sticky lg:top-20 lg:self-start">
                {renderSummaryCard()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
