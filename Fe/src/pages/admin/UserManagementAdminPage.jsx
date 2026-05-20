import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
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
import { createUser, deleteUser, getAllUsers, getUserStats, updateUser } from '../../services/adminUserApi.js'

const roleOptions = [
  { label: 'Khách thường', value: 'Guest' },
  { label: 'Thành viên Pro', value: 'Pro Member' },
  { label: 'Thành viên Platinum', value: 'Platinum Member' },
]

const statusOptions = [
  { label: 'Chờ xác thực', value: 'Pending' },
  { label: 'Đã xác thực', value: 'Verified' },
  { label: 'Ngưng hoạt động', value: 'Inactive' },
]

function getRoleColor(role) {
  if (role === 'Platinum Member') return 'gold'
  if (role === 'Pro Member') return 'blue'
  return 'default'
}

function getStatusColor(status) {
  if (status === 'Verified') return 'green'
  if (status === 'Pending') return 'orange'
  return 'red'
}

export default function UserManagementAdminPage() {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0 })
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [filterRole, setFilterRole] = useState(null)
  const [filterStatus, setFilterStatus] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async () => {
    try {
      setLoading(true)
      const [res, statsRes] = await Promise.all([getAllUsers(), getUserStats()])
      if (res?.success) setUsers(res.data || [])
      if (statsRes?.success) setStats(statsRes.data || { total: 0, active: 0 })
    } catch (err) {
      console.error(err)
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
      console.error(err)
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
      if (err?.errorFields) return
      console.error(err)
      message.error('Thao tác thất bại')
    }
  }

  const filteredUsers = useMemo(() => {
    const keyword = String(searchText || '').trim().toLowerCase()

    return users.filter((user) => {
      const matchesKeyword =
        keyword.length === 0 ||
        String(user?.name || '').toLowerCase().includes(keyword) ||
        String(user?.email || '').toLowerCase().includes(keyword)
      const matchesRole = filterRole ? user.role === filterRole : true
      const matchesStatus = filterStatus ? user.status === filterStatus : true
      return matchesKeyword && matchesRole && matchesStatus
    })
  }, [filterRole, filterStatus, searchText, users])

  const spotlightUser = useMemo(() => {
    return [...filteredUsers]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0] || null
  }, [filteredUsers])

  const pendingUsers = useMemo(() => {
    return users.filter((user) => user.status === 'Pending').length
  }, [users])

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
      ),
    },
    {
      title: 'ROLE',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)} className="uppercase font-semibold">
          {role}
        </Tag>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'NGÀY THAM GIA',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => (
        <span className="text-xs text-zinc-500">
          {date ? new Date(date).toLocaleDateString('vi-VN') : '--'}
        </span>
      ),
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
    },
  ]

  const statItems = [
    { key: 'total', label: 'TỔNG KHÁCH HÀNG', value: stats.total, note: 'Từ khi bắt đầu' },
    { key: 'active', label: 'ĐÃ XÁC THỰC', value: stats.active, note: 'Đã qua kiểm tra email' },
    { key: 'pending', label: 'CHỜ XỬ LÝ', value: pendingUsers, note: 'Cần CSKH theo dõi' },
  ]

  return (
    <div className="admin-page pb-20">
      <AdminSectionHeader
        eyebrow="CRM"
        title="Quản lý khách hàng"
        subtitle="Theo dõi hồ sơ người dùng, hạng thành viên và trạng thái xác thực theo cùng nhịp vận hành nội dung."
        action={
          <Button onClick={() => handleOpenModal()} className="admin-primary-btn" type="primary" icon={<PlusOutlined />}>
            Thêm khách hàng
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card className="admin-panel-card admin-spotlight-card h-full">
            <p className="admin-spotlight-card__eyebrow">Khách hàng nổi bật</p>
            <h3 className="admin-spotlight-card__title">
              {spotlightUser?.name || 'Danh sách khách hàng đang sẵn sàng để quản lý'}
            </h3>
            <p className="admin-spotlight-card__meta">
              {spotlightUser
                ? `${spotlightUser.email} • ${spotlightUser.role || 'Guest'} • ${spotlightUser.status || 'Pending'}`
                : 'Dùng bộ lọc để tập trung vào nhóm thành viên phù hợp.'}
            </p>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Row gutter={[16, 16]}>
            {statItems.map((stat, idx) => (
              <Col key={stat.key} xs={24} sm={8} lg={24}>
                <AdminStatCard title={stat.label} value={stat.value} note={stat.note} accent={idx === 1} />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      <Card className="admin-panel-card mt-4" bodyStyle={{ padding: 0 }}>
        <div className="admin-toolbar">
          <div className="admin-toolbar__meta">
            <h3 className="admin-toolbar__title">Cơ sở dữ liệu khách hàng</h3>
            <p className="admin-toolbar__description">Lọc theo hạng thành viên, trạng thái xác thực hoặc tra cứu nhanh theo tên và email.</p>
          </div>
          <div className="admin-toolbar__controls">
            <Input
              allowClear
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              prefix={<SearchOutlined className="text-zinc-400" />}
              className="admin-toolbar__search"
            />
            <Select
              allowClear
              placeholder="Lọc hạng thành viên"
              value={filterRole}
              onChange={setFilterRole}
              options={roleOptions}
              style={{ width: 190 }}
            />
            <Select
              allowClear
              placeholder="Lọc trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
              options={statusOptions}
              style={{ width: 170 }}
            />
          </div>
        </div>

        <div className="px-5 pb-5 pt-3">
          <Table
            columns={columns}
            dataSource={filteredUsers}
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
              <Select options={roleOptions} />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái tài khoản" rules={[{ required: true }]}>
              <Select options={statusOptions} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
