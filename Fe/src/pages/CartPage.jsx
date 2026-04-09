import { Card, Empty, Typography, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CartItemRow from '../components/molecules/CartItemRow.jsx'
import { useCart } from '../contexts/CartContext.jsx'
import { MENU_ITEMS } from '../data/menuItems.js'
import { createDineInOrder, createTakeawayOrder, getMenuItems } from '../services/orderApi.js'
import { ensureTableToken } from '../utils/tableSession.js'
import { getOrderSource } from '../utils/orderSource.js'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export default function CartPage() {
  const { entries, removeItem, setQuantity, clearCart } = useCart()
  const [searchParams] = useSearchParams()
  const isAndroidPreview = searchParams.get('preview') === 'android'
  const orderSource = getOrderSource(searchParams)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [menuItems, setMenuItems] = useState(MENU_ITEMS)

  useEffect(() => {
    let mounted = true
    getMenuItems()
      .then((items) => { if (mounted && items.length > 0) setMenuItems(items) })
      .catch(() => {})
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
      : 'Đặt giao hàng'

  const checkoutPayload = useMemo(() => {
    return {
      orderType: orderSource.mode,
      tableCode: orderSource.tableCode,
      sourceLabel: orderSource.label,
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
  }, [lines, orderSource.label, orderSource.mode, orderSource.tableCode, subtotal, tax, total])

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
          const customer_name =
            window.prompt('Nhap ten nguoi nhan', 'Khach hang') || ''
          const customer_phone = window.prompt('Nhap so dien thoai', '') || ''
          const delivery_address = window.prompt('Nhap dia chi giao hang', '') || ''

          if (!customer_name || !customer_phone || !delivery_address) {
            message.warning('Can nhap du thong tin giao hang')
            return
          }

          response = await createTakeawayOrder({
            customer_name,
            customer_phone,
            delivery_address,
            items: lines.map((line) => ({
              menu_item_id: line.id,
              quantity: line.quantity,
            })),
          })
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
      } catch (error) {
        const text = error?.message || 'Khong the ket noi API'
        message.error(text)
      } finally {
        setIsSubmitting(false)
      }
    })()
  }

  const summaryActionButtonClass =
    'mt-3 h-12 w-full rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-lg font-semibold text-white shadow-[0_8px_22px_rgba(220,38,38,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:from-red-400 hover:to-red-500 hover:shadow-[0_12px_30px_rgba(220,38,38,0.26)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60'

  const continueShoppingClass =
    'mt-3 flex h-12 w-full items-center justify-center rounded-xl border border-[#ddd7cb] bg-[#f9f9f6] text-[1.02rem] font-medium tracking-[0.01em] !text-[#3f3a37] visited:!text-[#3f3a37] no-underline font-[var(--font-heading)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b89b9b] hover:bg-white hover:!text-[#900020] hover:shadow-md active:translate-y-0'

  const renderSummaryCard = () => (
    <Card className="rounded-2xl !border-[#e5e7eb]" title="Order Summary">
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
    <div className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
      <Typography.Title
        level={2}
        className="!mb-1 !font-light font-[var(--font-heading)]"
      >
        Your Cart
      </Typography.Title>
      <Typography.Text type="secondary">
        {orderSource.mode === 'dine-in'
          ? `カート • ${orderSource.label}`
          : 'カート • Mua ship về'}
      </Typography.Text>

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

              {renderSummaryCard()}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
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
              </div>

              <div className="lg:sticky lg:top-24 lg:self-start">
                {renderSummaryCard()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
