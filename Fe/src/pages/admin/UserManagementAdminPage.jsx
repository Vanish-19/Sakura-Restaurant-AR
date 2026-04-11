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
      message.error('Failed to load users')
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
      message.success('User deleted')
      fetchData()
    } catch (err) {
      message.error('Failed to delete')
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
        message.success('User updated')
      } else {
        await createUser(values)
        message.success('User created')
      }
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      if (err.errorFields) return
      message.error('Action failed')
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
        title: 'JOINED DATE', 
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
          <Popconfirm title="Delete this user?" onConfirm={() => handleDelete(record._id)}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }
  ]

  const statItems = [
    { key: 'total', label: 'TOTAL USERS', value: stats.total, note: 'Since beginning' },
    { key: 'active', label: 'VERIFIED USERS', value: stats.active, note: 'Passed email check' },
  ]

  return (
    <div className="admin-page pb-20">
      <AdminSectionHeader
        title="Customer Management"
        subtitle="Manage end-user accounts, memberships and verified statuses."
        action={<Button onClick={() => handleOpenModal()} className="admin-primary-btn" type="primary" icon={<PlusOutlined />}>Add Customer</Button>}
      />

      <Row gutter={[16, 16]}>
        {statItems.map((stat, idx) => (
          <Col key={stat.key} xs={24} md={12}>
             <AdminStatCard title={stat.label} value={stat.value} note={stat.note} accent={idx === 1} />
          </Col>
        ))}
      </Row>

      <Card className="admin-panel-card mt-4" title="Customer Database" bodyStyle={{ padding: 0 }}>
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
        title={editingId ? "Edit Customer" : "New Customer"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={500}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
             <Input />
          </Form.Item>
          
          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
             <Input />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="role" label="Membership Role" rules={[{ required: true }]}>
               <Select>
                 <Select.Option value="Guest">Guest</Select.Option>
                 <Select.Option value="Pro Member">Pro Member</Select.Option>
                 <Select.Option value="Platinum Member">Platinum Member</Select.Option>
               </Select>
            </Form.Item>
            <Form.Item name="status" label="Account Status" rules={[{ required: true }]}>
               <Select>
                 <Select.Option value="Pending">Pending</Select.Option>
                 <Select.Option value="Verified">Verified</Select.Option>
                 <Select.Option value="Inactive">Inactive</Select.Option>
               </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
