import { Alert, Card, Empty, Form, Input, Radio, Space, Typography, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import CartItemRow from '../components/molecules/CartItemRow.jsx'
import { useCart } from '../contexts/CartContext.jsx'
import { createDineInOrder, createTakeawayOrder, getMenuItems } from '../services/orderApi.js'
import { ensureTableToken } from '../utils/tableSession.js'
import { getOrderSource } from '../utils/orderSource.js'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
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

  const checkoutLabel =
    orderSource.mode === 'dine-in'
      ? `Gọi món cho ${orderSource.label}`
      : paymentMethod === 'online'
        ? 'Đặt hàng và thanh toán VNPAY'
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
        lineTotal: Number((line.item.price * line.quantity).toFixed(2)),
      })),
      pricing: {
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
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

      setIsSubmitting(true)

      try {
        let response

        if (orderSource.mode === 'dine-in') {
          const token = await ensureTableToken(orderSource.tableCode)
          response = await createDineInOrder(
            token,
            lines.map((line) => ({
              menu_item_id: line.id,
              quantity: line.quantity,
              note: '',
            })),
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
            const checkoutUrl = response?.data?.checkout_url

            if (!checkoutUrl) {
              throw new Error('Không tạo được liên kết thanh toán online')
            }

            window.location.href = checkoutUrl
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
            ? `Da gui order cho ${orderSource.label}`
            : 'Da tao don giao hang thanh cong',
        )

        navigate(
          {
            pathname: '/',
            search: searchParams.toString() ? `?${searchParams.toString()}` : '',
          },
          { replace: true },
        )
      } catch (error) {
        const text = error?.message || 'Khong the ket noi API'
        message.error(text)
      } finally {
        setIsSubmitting(false)
      }
    })()
  }

  const summaryActionButtonClass =
    'mt-3 h-12 w-full rounded-[12px] bg-gradient-to-r from-red-500 to-red-600 text-lg font-semibold text-white shadow-[0_6px_16px_rgba(220,38,38,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:from-red-400 hover:to-red-500 hover:shadow-[0_10px_22px_rgba(220,38,38,0.24)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60'

  const continueShoppingClass =
    'mt-3 flex h-12 w-full items-center justify-center rounded-xl border border-[#ddd7cb] bg-[#f9f9f6] text-[1.02rem] font-medium tracking-[0.01em] !text-[#3f3a37] visited:!text-[#3f3a37] no-underline font-[var(--font-heading)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b89b9b] hover:bg-white hover:!text-[#900020] hover:shadow-md active:translate-y-0'

  const renderDeliveryForm = () => (
    <Card className="rounded-2xl !border-[#e7e7ea] !shadow-[0_8px_22px_rgba(17,24,39,0.04)]" title="Thông tin giao hàng">
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
    <Card className="rounded-2xl !border-[#e7e7ea] !shadow-[0_8px_22px_rgba(17,24,39,0.04)]" title="Phương thức thanh toán">
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
            ? 'Bạn sẽ được chuyển sang VNPAY sau khi tạo đơn.'
            : 'Đơn COD sẽ được ghi nhận và xác nhận thanh toán sau.'
        }
      />
    </Card>
  )

  const renderDeliverySummary = () => (
    <Card className="rounded-2xl !border-[#e7e7ea] !shadow-[0_8px_22px_rgba(17,24,39,0.04)]" title="Tóm tắt giao hàng">
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
          <span className="font-medium text-slate-700">{paymentMethod === 'online' ? 'Online' : 'COD'}</span>
        </div>
      </Space>
    </Card>
  )

  const renderSummaryCard = () => (
    <Card className="rounded-2xl !border-[#e7e7ea] !shadow-[0_16px_34px_rgba(17,24,39,0.08)]" title="Order Summary">
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="text-slate-500">Subtotal</div>
          <div className="font-medium text-slate-700">{currency.format(subtotal)}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-slate-500">Tax (10%)</div>
          <div className="font-medium text-slate-700">{currency.format(tax)}</div>
        </div>
        <div className="border-t border-[#e5e7eb]" />
        <div className="flex items-center justify-between pt-1">
          <div className="text-3xl font-bold text-slate-900">Total</div>
          <div className="text-3xl font-extrabold text-red-600">{currency.format(total)}</div>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          className={summaryActionButtonClass}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Dang gui...' : checkoutLabel}
        </button>

        <Link to={continueShoppingTo} className={continueShoppingClass}>
          Continue Shopping
        </Link>
      </div>
    </Card>
  )

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14">
      <div className="mb-5">
        <Typography.Title
          level={2}
          className="!mb-1 !font-light font-[var(--font-heading)]"
        >
          Your Cart
        </Typography.Title>
        <div className="mt-2 inline-flex items-center rounded-full border border-[#f7c8cc] bg-[#ffe9eb] px-3 py-1.5 text-[12px] font-semibold tracking-[0.02em] text-[#a80f22] shadow-[0_4px_10px_rgba(229,62,86,0.12)]">
          {orderSource.mode === 'dine-in'
            ? `カート • ${orderSource.label}`
            : 'カート • Mua ship về'}
        </div>
      </div>

      {lines.length === 0 ? (
        <div className="py-12">
          <Empty description="Chưa có món nào trong giỏ." />
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
              ) : null}

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
                ) : null}
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
