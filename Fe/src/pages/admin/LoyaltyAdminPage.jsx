import {
  DeleteOutlined,
  EditOutlined,
  GiftOutlined,
  PlusOutlined,
  SearchOutlined,
  StarOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import AdminSectionHeader from '../../components/molecules/admin/AdminSectionHeader.jsx'
import AdminStatCard from '../../components/molecules/admin/AdminStatCard.jsx'
import {
  createRewardVoucher,
  deleteRewardVoucher,
  getLoyaltyOverview,
  getLoyaltyProfiles,
  getRewardVouchers,
  updateRewardVoucher,
} from '../../services/adminLoyaltyApi.js'

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const discountTypeOptions = [
  { label: 'Giảm tiền cố định', value: 'fixed_amount' },
  { label: 'Giảm theo phần trăm', value: 'percentage' },
]

export default function LoyaltyAdminPage() {
  const [overview, setOverview] = useState(null)
  const [profiles, setProfiles] = useState([])
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState(null)
  const [voucherForm] = Form.useForm()

  const fetchData = async (search = '') => {
    try {
      setLoading(true)
      const [overviewRes, profileRes, voucherRes] = await Promise.all([
        getLoyaltyOverview(),
        getLoyaltyProfiles(search ? { search } : {}),
        getRewardVouchers(),
      ])
      setOverview(overviewRes?.data || null)
      setProfiles(profileRes?.data || [])
      setVouchers(voucherRes?.data || [])
    } catch (error) {
      console.error(error)
      message.error('Không thể tải dữ liệu loyalty')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSearch = () => {
    fetchData(searchText)
  }

  const handleOpenVoucherModal = (record = null) => {
    setEditingVoucher(record)
    voucherForm.resetFields()
    voucherForm.setFieldsValue(
      record
        ? {
            ...record,
            expires_at: record.expires_at ? String(record.expires_at).slice(0, 16) : '',
          }
        : {
            code: '',
            title: '',
            description: '',
            points_cost: 50,
            discount_type: 'fixed_amount',
            discount_value: 30000,
            min_order_amount: 0,
            max_discount_amount: 0,
            quantity: 0,
            is_active: true,
            expires_at: '',
          },
    )
    setIsVoucherModalOpen(true)
  }

  const handleSaveVoucher = async () => {
    try {
      const values = await voucherForm.validateFields()
      const payload = {
        ...values,
        expires_at: values.expires_at ? new Date(values.expires_at).toISOString() : null,
      }
      if (editingVoucher?._id) {
        await updateRewardVoucher(editingVoucher._id, payload)
        message.success('Đã cập nhật voucher đổi thưởng')
      } else {
        await createRewardVoucher(payload)
        message.success('Đã tạo voucher đổi thưởng')
      }
      setIsVoucherModalOpen(false)
      fetchData(searchText)
    } catch (error) {
      if (error?.errorFields) return
      console.error(error)
      message.error('Không thể lưu voucher')
    }
  }

  const handleDeleteVoucher = async (id) => {
    try {
      await deleteRewardVoucher(id)
      message.success('Đã xóa voucher đổi thưởng')
      fetchData(searchText)
    } catch (error) {
      console.error(error)
      message.error('Không thể xóa voucher')
    }
  }

  const spotlightProfile = useMemo(() => {
    return [...profiles].sort((a, b) => Number(b.available_points || 0) - Number(a.available_points || 0))[0] || null
  }, [profiles])

  const statItems = [
    {
      key: 'profiles',
      title: 'HỒ SƠ TÍCH ĐIỂM',
      value: overview?.summary?.total_profiles || 0,
      note: 'Số điện thoại đã phát sinh loyalty',
    },
    {
      key: 'available',
      title: 'ĐIỂM ĐANG LƯU HÀNH',
      value: Number(overview?.summary?.available_points || 0).toLocaleString('vi-VN'),
      note: 'Tổng điểm khả dụng trên toàn hệ thống',
    },
    {
      key: 'redeemed',
      title: 'ĐIỂM ĐÃ ĐỔI',
      value: Number(overview?.summary?.total_points_redeemed || 0).toLocaleString('vi-VN'),
      note: 'Đã quy đổi thành voucher thưởng',
    },
  ]

  const profileColumns = [
    {
      title: 'KHÁCH HÀNG',
      key: 'profile',
      render: (_, row) => (
        <div>
          <div className="font-semibold text-zinc-900">{row.display_name || 'Khách vãng lai'}</div>
          <div className="text-xs text-zinc-500">{row.phone}</div>
        </div>
      ),
    },
    {
      title: 'ĐIỂM KHẢ DỤNG',
      dataIndex: 'available_points',
      key: 'available_points',
      render: (value) => <span className="font-semibold text-[#9d1223]">{Number(value || 0).toLocaleString('vi-VN')}</span>,
    },
    {
      title: 'TÍCH LŨY',
      dataIndex: 'total_points_earned',
      key: 'total_points_earned',
      render: (value) => Number(value || 0).toLocaleString('vi-VN'),
    },
    {
      title: 'CHI TIÊU TRỌN ĐỜI',
      dataIndex: 'lifetime_spend',
      key: 'lifetime_spend',
      render: (value) => currency.format(Number(value || 0)),
    },
    {
      title: 'CẬP NHẬT',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '--'),
    },
  ]

  const voucherColumns = [
    {
      title: 'VOUCHER',
      key: 'voucher',
      render: (_, row) => (
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-zinc-900">{row.title}</span>
            <Tag color={row.is_active ? 'green' : 'default'}>{row.is_active ? 'Active' : 'Paused'}</Tag>
          </div>
          <div className="mt-1 text-xs text-zinc-500">{row.code}</div>
        </div>
      ),
    },
    {
      title: 'ĐỔI BẰNG',
      dataIndex: 'points_cost',
      key: 'points_cost',
      render: (value) => <span className="font-semibold">{Number(value || 0).toLocaleString('vi-VN')} điểm</span>,
    },
    {
      title: 'ƯU ĐÃI',
      key: 'discount',
      render: (_, row) =>
        row.discount_type === 'percentage'
          ? `${row.discount_value}%${row.max_discount_amount > 0 ? ` (tối đa ${currency.format(row.max_discount_amount)})` : ''}`
          : currency.format(Number(row.discount_value || 0)),
    },
    {
      title: 'ĐIỀU KIỆN',
      key: 'conditions',
      render: (_, row) => (
        <div className="text-xs text-zinc-500">
          <div>Đơn tối thiểu: {currency.format(Number(row.min_order_amount || 0))}</div>
          <div>Lượt dùng: {Number(row.used_count || 0)}/{Number(row.quantity || 0) || '∞'}</div>
        </div>
      ),
    },
    {
      title: 'ACTION',
      key: 'action',
      render: (_, row) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleOpenVoucherModal(row)} />
          <Popconfirm title="Xóa voucher này?" onConfirm={() => handleDeleteVoucher(row._id)}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="admin-page pb-20">
      <AdminSectionHeader
        eyebrow="Rewards"
        title="Loyalty & Voucher"
        subtitle="Theo dõi điểm theo số điện thoại, cấu hình voucher đổi thưởng và giữ cùng một nhịp quản trị với các tab nội dung còn lại."
        action={
          <Button className="admin-primary-btn" type="primary" icon={<PlusOutlined />} onClick={() => handleOpenVoucherModal()}>
            Tạo voucher
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card className="admin-panel-card admin-spotlight-card h-full">
            <p className="admin-spotlight-card__eyebrow">Khách hàng nổi bật</p>
            <h3 className="admin-spotlight-card__title">{spotlightProfile?.display_name || spotlightProfile?.phone || 'Loyalty đang sẵn sàng hoạt động'}</h3>
            <p className="admin-spotlight-card__meta">
              {spotlightProfile
                ? `${spotlightProfile.phone} • ${Number(spotlightProfile.available_points || 0).toLocaleString('vi-VN')} điểm khả dụng`
                : 'Các số điện thoại phát sinh đơn đã trả tiền sẽ tự động lên bảng xếp hạng ở đây.'}
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-[#f4d8dc] bg-white/80 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Chi tiêu toàn hệ</div>
                <div className="mt-1 text-lg font-black text-zinc-900">{currency.format(Number(overview?.summary?.lifetime_spend || 0))}</div>
              </div>
              <div className="rounded-2xl border border-[#f4d8dc] bg-white/80 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Voucher đang phát hành</div>
                <div className="mt-1 text-lg font-black text-zinc-900">{overview?.summary?.total_vouchers || 0}</div>
              </div>
              <div className="rounded-2xl border border-[#f4d8dc] bg-white/80 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Điểm đã tích</div>
                <div className="mt-1 text-lg font-black text-zinc-900">{Number(overview?.summary?.total_points_earned || 0).toLocaleString('vi-VN')}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Row gutter={[16, 16]}>
            {statItems.map((item, index) => (
              <Col key={item.key} xs={24} sm={8} lg={24}>
                <AdminStatCard title={item.title} value={item.value} note={item.note} accent={index === 1} />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      <Card className="admin-panel-card mt-4" bodyStyle={{ padding: 0 }}>
        <div className="admin-toolbar">
          <div className="admin-toolbar__meta">
            <h3 className="admin-toolbar__title">Hồ sơ tích điểm theo số điện thoại</h3>
            <p className="admin-toolbar__description">Tra cứu nhanh theo tên hoặc số điện thoại để xem lượng điểm khả dụng và tổng chi tiêu.</p>
          </div>
          <div className="admin-toolbar__controls">
            <Input
              allowClear
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              onPressEnter={handleSearch}
              placeholder="Tìm theo tên hoặc số điện thoại..."
              prefix={<SearchOutlined className="text-zinc-400" />}
              className="admin-toolbar__search"
            />
            <Button onClick={handleSearch}>Tìm</Button>
          </div>
        </div>

        <div className="px-5 pb-5 pt-3">
          <Table columns={profileColumns} dataSource={profiles} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
        </div>
      </Card>

      <Card className="admin-panel-card mt-4" bodyStyle={{ padding: 0 }}>
        <div className="admin-toolbar">
          <div className="admin-toolbar__meta">
            <h3 className="admin-toolbar__title">Kho voucher đổi thưởng</h3>
            <p className="admin-toolbar__description">Thiết lập chi phí điểm, mức giảm, ngưỡng đơn hàng và trạng thái phát hành cho từng voucher.</p>
          </div>
          <div className="admin-toolbar__controls">
            <Button className="admin-primary-btn" type="primary" icon={<GiftOutlined />} onClick={() => handleOpenVoucherModal()}>
              Tạo voucher
            </Button>
          </div>
        </div>

        <div className="px-5 pb-5 pt-3">
          <Table columns={voucherColumns} dataSource={vouchers} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
        </div>
      </Card>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={12}>
          <Card className="admin-panel-card h-full" title="Top điểm thưởng">
            <Space direction="vertical" size={12} className="w-full">
              {(overview?.top_profiles || []).map((profile, index) => (
                <div key={profile._id} className="flex items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fff4f5] text-[#9d1223]">
                      {index === 0 ? <TrophyOutlined /> : <StarOutlined />}
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-900">{profile.display_name || 'Khách vãng lai'}</div>
                      <div className="text-xs text-zinc-500">{profile.phone}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#9d1223]">{Number(profile.available_points || 0).toLocaleString('vi-VN')} điểm</div>
                    <div className="text-xs text-zinc-500">{currency.format(Number(profile.lifetime_spend || 0))}</div>
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="admin-panel-card h-full" title="Giao dịch loyalty gần đây">
            <Space direction="vertical" size={12} className="w-full">
              {(overview?.recent_transactions || []).map((transaction) => (
                <div key={transaction._id} className="rounded-2xl border border-zinc-200 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-zinc-900">{transaction.phone}</div>
                      <div className="mt-1 text-xs text-zinc-500">{transaction.note || transaction.type}</div>
                    </div>
                    <Tag color={transaction.type === 'earn' ? 'green' : transaction.type === 'redeem_refund' ? 'blue' : 'gold'}>
                      {transaction.type}
                    </Tag>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-zinc-500">{new Date(transaction.createdAt).toLocaleString('vi-VN')}</span>
                    <span className="font-semibold text-[#9d1223]">{Number(transaction.points || 0).toLocaleString('vi-VN')} điểm</span>
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingVoucher?._id ? 'Cập nhật voucher đổi thưởng' : 'Tạo voucher đổi thưởng'}
        open={isVoucherModalOpen}
        onCancel={() => setIsVoucherModalOpen(false)}
        onOk={handleSaveVoucher}
        okText={editingVoucher?._id ? 'Lưu thay đổi' : 'Tạo voucher'}
        width={680}
      >
        <Form form={voucherForm} layout="vertical" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Item name="code" label="Mã voucher" rules={[{ required: true, message: 'Vui lòng nhập mã voucher' }]}>
              <Input placeholder="VD: SAKURA30" />
            </Form.Item>
            <Form.Item name="title" label="Tên voucher" rules={[{ required: true, message: 'Vui lòng nhập tên voucher' }]}>
              <Input placeholder="Giảm 30.000đ" />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả ngắn">
            <Input.TextArea rows={2} placeholder="Áp dụng cho đơn sushi buổi tối..." />
          </Form.Item>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Item name="points_cost" label="Điểm cần đổi" rules={[{ required: true, message: 'Vui lòng nhập số điểm cần đổi' }]}>
              <InputNumber className="!w-full" min={1} />
            </Form.Item>
            <Form.Item name="discount_type" label="Loại ưu đãi" rules={[{ required: true, message: 'Vui lòng chọn loại ưu đãi' }]}>
              <Select options={discountTypeOptions} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Item name="discount_value" label="Giá trị giảm" rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm' }]}>
              <InputNumber className="!w-full" min={1} />
            </Form.Item>
            <Form.Item name="max_discount_amount" label="Giảm tối đa (nếu %)">
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Form.Item name="min_order_amount" label="Đơn tối thiểu">
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
            <Form.Item name="quantity" label="Số lượt phát hành (0 = không giới hạn)">
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
            <Form.Item name="expires_at" label="Hết hạn (YYYY-MM-DDTHH:mm)">
              <Input placeholder="2026-12-31T23:59" />
            </Form.Item>
          </div>

          <Form.Item name="is_active" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select
              options={[
                { label: 'Đang hoạt động', value: true },
                { label: 'Tạm khóa', value: false },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
