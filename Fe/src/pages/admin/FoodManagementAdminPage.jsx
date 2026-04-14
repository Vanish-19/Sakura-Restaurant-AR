import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Space, Table, Tag, message, Avatar, Popconfirm, Modal, Form, Input, InputNumber, Switch, Select } from 'antd'
import { useEffect, useState } from 'react'
import { getAllFoods, createFood, updateFood, deleteFood } from '../../services/adminFoodApi.js'

const formatVnd = (value) => new Intl.NumberFormat('vi-VN').format(Number(value || 0))

export default function FoodManagementAdminPage() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()

  const fetchFoods = async () => {
    try {
      setLoading(true)
      const res = await getAllFoods()
      if (res?.success) {
        setFoods(res.data || [])
      }
    } catch (err) {
      console.error(err)
      message.error('Không thể tải danh sách món ăn')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFoods()
  }, [])

  const handleDelete = async (id) => {
    try {
      await deleteFood(id)
      message.success('Đã xóa món ăn')
      fetchFoods()
    } catch (err) {
      message.error('Không thể xóa món ăn')
    }
  }

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record._id)
      form.setFieldsValue({
        name: record.name,
        price: record.price,
        category: record.category,
        is_available: record.is_available,
        is_best_seller: record.is_best_seller,
        image_url: record.image_url,
        glb_url: record.ar_models?.glb_url,
        usdz_url: record.ar_models?.usdz_url,
        description: record.description,
      })
    } else {
      setEditingId(null)
      form.resetFields()
      form.setFieldsValue({ is_available: true, is_best_seller: false, category: 'sushi' })
    }
    setIsModalOpen(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        name: values.name,
        price: values.price,
        category: values.category,
        is_available: values.is_available,
        is_best_seller: values.is_best_seller,
        image_url: values.image_url,
        description: values.description,
        ar_models: {
          glb_url: values.glb_url,
          usdz_url: values.usdz_url,
        }
      }

      if (editingId) {
        await updateFood(editingId, payload)
        message.success('Cập nhật món ăn thành công')
      } else {
        await createFood(payload)
        message.success('Tạo món ăn thành công')
      }
      setIsModalOpen(false)
      fetchFoods()
    } catch (err) {
      if (err.errorFields) return // Validation error
      message.error(err.message || 'Thao tác thất bại')
    }
  }

  const columns = [
    {
      title: 'DISH',
      key: 'dish',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.image_url} shape="square" size={40} className="!bg-zinc-100 border border-zinc-200" />
          <div>
            <p className="m-0 text-[13px] font-bold text-zinc-900">{row.name}</p>
            <p className="m-0 text-[11px] text-zinc-500 w-48 truncate">{row.description}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      key: 'category',
      render: (value) => <Tag className="!rounded-md !border-zinc-200 !bg-zinc-100 !px-2 !py-0.5 !font-semibold uppercase">{value}</Tag>,
    },
    { 
      title: 'PRICE', 
      dataIndex: 'price', 
      key: 'price',
      render: (price) => <span className="font-semibold">{formatVnd(price)} VNĐ</span>
    },
    {
      title: 'AR STATUS',
      key: 'arStatus',
      render: (_, row) => {
        const hasGlb = !!row.ar_models?.glb_url
        const hasUsdz = !!row.ar_models?.usdz_url
        if (hasGlb || hasUsdz) return <Tag color="blue">Đã bật</Tag>
        return <Tag color="default">Thiếu</Tag>
      },
    },
    {
      title: 'BEST SELLER',
      dataIndex: 'is_best_seller',
      key: 'bestSeller',
      render: (isBestSeller) => (
        isBestSeller ? <Tag color="gold">Bán chạy</Tag> : <Tag>Thường</Tag>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'is_available',
      key: 'status',
      render: (is_available) => (
        is_available ? <Tag color="green">Đang bán</Tag> : <Tag color="red">Đã ẩn</Tag>
      ),
    },
    {
      title: 'ACTION',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="Bạn có chắc muốn xóa món này?" onConfirm={() => handleDelete(record._id)}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const stats = [
    { key: 'total', title: 'TỔNG MÓN ĂN', value: foods.length, note: 'Trong thực đơn', tone: 'text-zinc-600', bar: 'bg-zinc-900' },
    { key: 'best', title: 'MÓN BÁN CHẠY', value: foods.filter(f => f.is_best_seller).length, note: 'Danh sách ưu tiên', tone: 'text-amber-600', bar: 'bg-amber-500' },
    { key: 'ar', title: 'CÓ AR', value: foods.filter(f => f.ar_models?.glb_url || f.ar_models?.usdz_url).length, note: 'Có mô hình 3D', tone: 'text-blue-600', bar: 'bg-blue-600' },
    { key: 'active', title: 'ĐANG BÁN', value: foods.filter(f => f.is_available).length, note: 'Sẵn sàng phục vụ', tone: 'text-emerald-600', bar: 'bg-emerald-600' },
  ]

  return (
    <div className="space-y-5 pb-20">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[44px] leading-[0.96] font-black tracking-[-0.03em] text-zinc-900">Quản lý món ăn</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Quản lý thực đơn số, cập nhật giá bán và mô hình AR.
          </p>
        </div>

        <Button onClick={() => handleOpenModal()} icon={<PlusOutlined />} className="!h-9 !rounded-lg !border-0 !bg-rose-600 !px-4 !text-xs !font-bold !uppercase !text-white">
          Thêm món mới
        </Button>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.key} className="!rounded-xl !border !border-zinc-200 !shadow-none" bodyStyle={{ padding: 20 }}>
            <div className={`mb-4 h-1 w-8 rounded-full ${stat.bar}`} />
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">{stat.title}</div>
            <div className="mt-2 text-[42px] leading-none font-black tracking-tight text-zinc-900">{stat.value}</div>
            <p className={`mt-2 text-xs font-semibold ${stat.tone}`}>{stat.note}</p>
          </Card>
        ))}
      </section>

      <Card className="!rounded-2xl !border !border-zinc-200 !shadow-none" bodyStyle={{ padding: 0 }}>
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <Space size={10}>
            <h3 className="m-0 text-2xl font-extrabold tracking-tight text-zinc-900">Danh mục món ăn</h3>
          </Space>
        </div>

        <div className="px-3 pb-3 pt-1">
          <Table 
            columns={columns} 
            dataSource={foods} 
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 15 }} 
            scroll={{ x: 940 }} 
            rowClassName={() => 'hover:!bg-zinc-50'} 
          />
        </div>
      </Card>

      <Modal
        title={editingId ? 'Cập nhật món ăn' : 'Tạo món ăn mới'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu"
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="name" label="Tên món" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="sushi">Sushi</Select.Option>
                <Select.Option value="ramen">Ramen</Select.Option>
                <Select.Option value="appetizers">Khai vị</Select.Option>
                <Select.Option value="dessert">Tráng miệng</Select.Option>
                <Select.Option value="drinks">Đồ uống</Select.Option>
              </Select>
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="price" label="Giá (VNĐ)" rules={[{ required: true }]}>
              <InputNumber
                className="w-full"
                min={0}
                step={1000}
                precision={0}
                addonAfter="VNĐ"
                formatter={(value) => formatVnd(value)}
                parser={(value) => String(value || '').replace(/\D/g, '')}
              />
            </Form.Item>
            <Form.Item name="is_available" label="Trạng thái" valuePropName="checked">
              <Switch checkedChildren="Đang bán" unCheckedChildren="Ẩn" />
            </Form.Item>
          </div>

          <Form.Item name="is_best_seller" label="Món bán chạy" valuePropName="checked">
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item name="image_url" label="Đường dẫn ảnh">
            <Input />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2">
            <Form.Item name="glb_url" label="Mô hình AR (.glb) - Android/Web">
              <Input placeholder="https://..." />
            </Form.Item>
            <Form.Item name="usdz_url" label="Mô hình AR (.usdz) - iOS">
              <Input placeholder="https://..." />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
