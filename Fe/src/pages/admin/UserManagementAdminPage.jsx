import { Button, Card, Col, Row, Tag, Space, Table, Popconfirm, message, Modal, Form, Input, Select, Avatar } from 'antd'
import { useEffect, useState } from 'react'
import { DeleteOutlined, EditOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'
import AdminSectionHeader from '../../components/molecules/admin/AdminSectionHeader.jsx'
import AdminStatCard from '../../components/molecules/admin/AdminStatCard.jsx'
import { getAllUsers, createUser, updateUser, deleteUser, getUserStats } from '../../services/adminUserApi.js'

export default function UserManagementAdminPage() {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0 })
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getAllUsers()
      const statsRes = await getUserStats()
      if (res?.success) setUsers(res.data)
      if (statsRes?.success) setStats(statsRes.data)
    } catch (err) {
      message.error('Không thể tải danh sách khách hàng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id) => {
    try {
      await deleteUser(id)
      message.success('Đã xóa khách hàng')
      fetchData()
    } catch (err) {
      message.error('Không thể xóa khách hàng')
    }
  }

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record._id)
      form.setFieldsValue({
        name: record.name,
        email: record.email,
        role: record.role,
        status: record.status,
      })
    } else {
      setEditingId(null)
      form.resetFields()
      form.setFieldsValue({ status: 'Pending', role: 'Guest' })
    }
    setIsModalOpen(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingId) {
        await updateUser(editingId, values)
        message.success('Đã cập nhật khách hàng')
      } else {
        await createUser(values)
        message.success('Đã tạo khách hàng mới')
      }
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      if (err.errorFields) return
      message.error('Thao tác thất bại')
    }
  }

  const columns = [
    { 
      title: 'USER', 
      key: 'user', 
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} className="!bg-zinc-200 !text-zinc-600" />
          <div>
            <div className="font-semibold text-zinc-900">{row.name}</div>
            <div className="text-[11px] text-zinc-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'ROLE',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag color={role === 'Platinum Member' ? 'gold' : role === 'Pro Member' ? 'blue' : 'default'} className="uppercase font-semibold">{role}</Tag>,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
         let color = 'default'
         if (status === 'Verified') color = 'green'
         else if (status === 'Pending') color = 'orange'
         else color = 'red'
         return <Tag color={color}>{status}</Tag>
      }
    },
    { 
      title: 'NGÀY THAM GIA', 
        dataIndex: 'createdAt', 
        key: 'date',
        render: (date) => <span className="text-xs text-zinc-500">{new Date(date).toLocaleDateString()}</span>
    },
    {
      title: 'ACTION',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="Bạn có chắc muốn xóa khách hàng này?" onConfirm={() => handleDelete(record._id)}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }
  ]

  const statItems = [
    { key: 'total', label: 'TỔNG KHÁCH HÀNG', value: stats.total, note: 'Từ khi bắt đầu' },
    { key: 'active', label: 'ĐÃ XÁC THỰC', value: stats.active, note: 'Đã qua kiểm tra email' },
  ]

  return (
    <div className="admin-page pb-20">
      <AdminSectionHeader
        title="Quản lý khách hàng"
        subtitle="Quản lý tài khoản người dùng, hạng thành viên và trạng thái xác thực."
        action={<Button onClick={() => handleOpenModal()} className="admin-primary-btn" type="primary" icon={<PlusOutlined />}>Thêm khách hàng</Button>}
      />

      <Row gutter={[16, 16]}>
        {statItems.map((stat, idx) => (
          <Col key={stat.key} xs={24} md={12}>
             <AdminStatCard title={stat.label} value={stat.value} note={stat.note} accent={idx === 1} />
          </Col>
        ))}
      </Row>

      <Card className="admin-panel-card mt-4" title="Cơ sở dữ liệu khách hàng" bodyStyle={{ padding: 0 }}>
        <div className="px-5 pb-5 pt-3">
          <Table 
            columns={columns} 
            dataSource={users} 
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 15 }} 
          />
        </div>
      </Card>

      <Modal
        title={editingId ? 'Chỉnh sửa khách hàng' : 'Khách hàng mới'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={500}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}>
             <Input />
          </Form.Item>
          
          <Form.Item name="email" label="Địa chỉ email" rules={[{ required: true, type: 'email' }]}>
             <Input />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="role" label="Hạng thành viên" rules={[{ required: true }]}>
               <Select>
                 <Select.Option value="Guest">Khách thường</Select.Option>
                 <Select.Option value="Pro Member">Thành viên Pro</Select.Option>
                 <Select.Option value="Platinum Member">Thành viên Platinum</Select.Option>
               </Select>
            </Form.Item>
            <Form.Item name="status" label="Trạng thái tài khoản" rules={[{ required: true }]}>
               <Select>
                 <Select.Option value="Pending">Chờ xác thực</Select.Option>
                 <Select.Option value="Verified">Đã xác thực</Select.Option>
                 <Select.Option value="Inactive">Ngưng hoạt động</Select.Option>
               </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
