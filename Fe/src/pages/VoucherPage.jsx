import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd'
import {
  GiftOutlined,
  PercentageOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAvailableRewardVouchers, previewLoyalty } from '../services/loyaltyApi.js'

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function formatDiscount(voucher) {
  if (voucher.discount_type === 'percentage') {
    const maxDiscount = Number(voucher.max_discount_amount || 0)
    return `Giảm ${Number(voucher.discount_value || 0)}%${maxDiscount > 0 ? `, tối đa ${currency.format(maxDiscount)}` : ''}`
  }

  return `Giảm ${currency.format(voucher.discount_value || voucher.discount_amount || 0)}`
}

function formatExpiry(value) {
  if (!value) return 'Không giới hạn thời gian'

  try {
    return `Hết hạn ${new Date(value).toLocaleDateString('vi-VN')}`
  } catch {
    return 'Không giới hạn thời gian'
  }
}

function getQuantityLabel(voucher) {
  if (voucher.is_unlimited || voucher.quantity_left === null || voucher.quantity_left === undefined) {
    return 'Không giới hạn lượt'
  }

  return `Còn ${Number(voucher.quantity_left || 0).toLocaleString('vi-VN')} lượt`
}

export default function VoucherPage() {
  const [form] = Form.useForm()
  const [vouchers, setVouchers] = useState([])
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    let mounted = true

    getAvailableRewardVouchers()
      .then((response) => {
        if (!mounted) return
        setVouchers(Array.isArray(response?.data) ? response.data : [])
      })
      .catch(() => {
        if (mounted) {
          setVouchers([])
          message.error('Không thể tải danh sách voucher')
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const displayVouchers = useMemo(() => {
    const previewVouchers = preview?.available_vouchers
    return Array.isArray(previewVouchers) && previewVouchers.length > 0 ? previewVouchers : vouchers
  }, [preview, vouchers])

  const handleCheckVoucher = async () => {
    const values = await form.validateFields()
    setChecking(true)

    try {
      const response = await previewLoyalty(values.phone, values.subtotal || 0)
      setPreview(response?.data || null)
    } catch (error) {
      setPreview(null)
      message.error(error?.message || 'Không thể kiểm tra điều kiện voucher')
    } finally {
      setChecking(false)
    }
  }

  const clearPreview = () => {
    form.resetFields()
    setPreview(null)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:px-8">
      <section className="overflow-hidden rounded-none border-b border-[#f0d9dc] bg-[linear-gradient(135deg,#fff7f7_0%,#ffffff_48%,#fff8ec_100%)] px-4 py-10 sm:px-8 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f1c7cc] bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#a80f22]">
              <GiftOutlined />
              Sakura Rewards
            </div>
            <Typography.Title level={1} className="!mt-5 !mb-3 !text-3xl !font-black !text-slate-950 sm:!text-5xl">
              Voucher đang phát hành
            </Typography.Title>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              Xem các voucher đổi thưởng hiện có, kiểm tra số điểm theo số điện thoại và điều kiện áp dụng trước khi đặt món.
            </p>
          </div>

          <Card className="!rounded-lg !border-[#ead9d4] !shadow-[0_16px_34px_rgba(17,24,39,0.08)]">
            <Form
              form={form}
              layout="vertical"
              initialValues={{ phone: '', subtotal: 0 }}
              onFinish={handleCheckVoucher}
            >
              <Form.Item
                name="phone"
                label="Số điện thoại tích điểm"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }, { min: 8, message: 'Số điện thoại phải có ít nhất 8 ký tự' }]}
              >
                <Input size="large" placeholder="0987654321" />
              </Form.Item>

              <Form.Item name="subtotal" label="Tạm tính đơn hàng dự kiến">
                <InputNumber
                  size="large"
                  min={0}
                  step={10000}
                  className="!w-full"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(String(value || '').replace(/\D/g, ''))}
                  placeholder="0"
                />
              </Form.Item>

              <div className="flex flex-wrap gap-2">
                <Button type="primary" htmlType="submit" loading={checking} icon={<SearchOutlined />} className="!bg-[#8B0000]">
                  Kiểm tra voucher
                </Button>
                {preview ? (
                  <Button onClick={clearPreview}>
                    Xem tất cả
                  </Button>
                ) : null}
              </div>
            </Form>
          </Card>
        </div>
      </section>

      {preview?.profile ? (
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[#f3d3d8] bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#b64b57]">
              <WalletOutlined />
              Điểm hiện có
            </div>
            <div className="mt-2 text-3xl font-black text-[#941225]">
              {Number(preview.profile.available_points || 0).toLocaleString('vi-VN')}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white px-5 py-4 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Đơn đã thanh toán</div>
            <div className="mt-2 text-3xl font-black text-slate-950">
              {Number(preview.profile.total_orders_paid || 0).toLocaleString('vi-VN')}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white px-5 py-4 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Điểm dự kiến</div>
            <div className="mt-2 text-3xl font-black text-slate-950">
              +{Number(preview.points_to_earn || 0).toLocaleString('vi-VN')}
            </div>
          </div>
        </section>
      ) : preview ? (
        <Alert
          className="mt-6"
          type="info"
          showIcon
          message="Số điện thoại này chưa có điểm tích lũy."
          description="Bạn vẫn có thể xem điều kiện voucher và bắt đầu tích điểm từ đơn hàng tiếp theo."
        />
      ) : null}

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Typography.Title level={2} className="!mb-1 !text-2xl !font-black !text-slate-950">
              Kho voucher
            </Typography.Title>
            <p className="text-sm text-slate-500">
              {preview ? 'Kết quả đang tính theo số điện thoại và tạm tính bạn vừa nhập.' : 'Danh sách voucher đang mở cho khách hàng.'}
            </p>
          </div>

          <Link to="/cart" className="no-underline">
            <Button icon={<ShoppingCartOutlined />} className="!h-10 !rounded-full">
              Tới giỏ hàng
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <Spin size="large" />
          </div>
        ) : displayVouchers.length === 0 ? (
          <Empty description="Hiện chưa có voucher đang phát hành." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {displayVouchers.map((voucher) => {
              const hasPreviewStatus = typeof voucher.is_eligible === 'boolean'
              const statusColor = !hasPreviewStatus ? 'blue' : voucher.is_eligible ? 'green' : 'gold'
              const statusText = !hasPreviewStatus ? 'Đang phát hành' : voucher.is_eligible ? 'Đủ điều kiện' : 'Chưa đủ điều kiện'

              return (
                <Card key={voucher.id} className="!rounded-lg !border-[#eadfe0] !shadow-[0_10px_26px_rgba(17,24,39,0.05)]">
                  <div className="flex min-h-[230px] flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Tag color="red" className="!mb-2 !font-bold">{voucher.code}</Tag>
                        <h3 className="line-clamp-2 text-lg font-black text-slate-950">{voucher.title}</h3>
                      </div>
                      <Tag color={statusColor}>{statusText}</Tag>
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {voucher.description || 'Áp dụng cho đơn hàng đủ điều kiện tại Sakura Restaurant.'}
                    </p>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2 font-bold text-[#9d1223]">
                        <PercentageOutlined />
                        {formatDiscount(voucher)}
                      </div>
                      <div className="text-slate-500">
                        Đổi bằng <span className="font-semibold text-slate-800">{Number(voucher.points_cost || 0).toLocaleString('vi-VN')} điểm</span>
                      </div>
                      {Number(voucher.min_order_amount || 0) > 0 ? (
                        <div className="text-slate-500">
                          Áp dụng cho đơn từ <span className="font-semibold text-slate-800">{currency.format(voucher.min_order_amount)}</span>
                        </div>
                      ) : null}
                      <div className="text-slate-500">{getQuantityLabel(voucher)}</div>
                      <div className="text-slate-500">{formatExpiry(voucher.expires_at)}</div>
                    </div>

                    {hasPreviewStatus && !voucher.is_eligible && voucher.reasons?.length ? (
                      <Alert className="mt-4" type="warning" showIcon message={voucher.reasons[0]} />
                    ) : null}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
