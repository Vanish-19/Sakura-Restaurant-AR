import {
  Avatar,
  Button,
  Card,
  Segmented,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
} from 'antd'
import {
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import { getAllAdmins, getAdminStats, toggleAdminStatus, registerAdmin } from '../../services/adminAccountApi.js'
import { getAdminProfile } from '../../utils/authSession.js'

const viewModes = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Admin', value: 'admin' },
  { label: 'Super Admin', value: 'super_admin' },
]

const roleMeta = {
  'admin': { label: 'Admin', level: 'L-1', tone: 'text-rose-700 bg-rose-50 border-rose-100' },
  'super_admin': { label: 'Super Admin', level: 'L-0', tone: 'text-purple-700 bg-purple-50 border-purple-100' },
}

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function AdminManagementAdminPage() {
  const [currentAdmin, setCurrentAdmin] = useState(() => getAdminProfile())
  const [viewMode, setViewMode] = useState('all')
  const [admins, setAdmins] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, alerts: 0 })
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const currentRole = currentAdmin?.role === 'superAdmin' ? 'super_admin' : currentAdmin?.role
  const isSuperAdmin = currentRole === 'super_admin'

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getAllAdmins()
      const statsRes = await getAdminStats()
      if (res?.success) setAdmins(res.data)
      if (statsRes?.success) setStats(statsRes.data)
    } catch (err) {
      message.error('Không thể tải danh sách tài khoản quản trị')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentAdmin(getAdminProfile())
    fetchData()
  }, [])

  const handleToggleStatus = async (id) => {
    if (!isSuperAdmin) {
      message.warning('Chỉ super admin mới được khóa hoặc mở tài khoản admin')
      return
    }

    try {
      await toggleAdminStatus(id)
      message.success('Đã cập nhật trạng thái tài khoản')
      fetchData()
    } catch (err) {
      message.error('Không thể cập nhật trạng thái')
    }
  }

  const handleRegister = async () => {
    if (!isSuperAdmin) {
      message.warning('Chỉ super admin mới được tạo tài khoản admin mới')
      return
    }

    try {
      const values = await form.validateFields()
      await registerAdmin(values)
      message.success('Đã tạo tài khoản quản trị mới')
      setIsModalOpen(false)
      form.resetFields()
      fetchData()
    } catch (err) {
      if (err.errorFields) return
      message.error(err.message || 'Tạo tài khoản thất bại')
    }
  }

  const filteredAccounts = useMemo(() => {
    if (viewMode === 'all') return admins
    return admins.filter((item) => item.role === viewMode)
  }, [viewMode, admins])

  const columns = [
    {
      title: 'ACCOUNT',
      dataIndex: 'name',
      key: 'name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar size={34} className="!bg-zinc-100 !text-zinc-600 !font-semibold">
            {getInitials(row.name)}
          </Avatar>
          <div>
            <div className="text-[13px] font-semibold text-zinc-900">{row.name}</div>
            <div className="text-[11px] text-zinc-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'ROLE',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const meta = roleMeta[role] || { label: role, level: 'N/A', tone: 'text-zinc-700 bg-zinc-50 border-zinc-200' }
        return (
          <div className="space-y-1">
            <Tag className={`!m-0 !rounded-full !border !px-2 !py-0.5 !text-[10px] !font-semibold ${meta.tone}`}>
              {meta.label.toUpperCase()}
            </Tag>
            <div className="text-[10px] uppercase tracking-wider text-zinc-400">{meta.level}</div>
          </div>
        )
      },
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          className={`!m-0 !rounded-full !border !px-2 !py-0.5 !text-[10px] !font-semibold ${
            status === 'Active'
              ? '!border-emerald-100 !bg-emerald-50 !text-emerald-700'
              : '!border-zinc-200 !bg-zinc-100 !text-zinc-500'
          }`}
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'LẦN ĐĂNG NHẬP CUỐI',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (value) => <span className="text-[12px] font-medium text-zinc-600">{value ? new Date(value).toLocaleString() : 'Chưa đăng nhập'}</span>,
    },
    {
      title: 'ACTION',
      key: 'action',
      render: (_, row) => (
        isSuperAdmin ? (
          <Popconfirm
            title={`${row.status === 'Active' ? 'Khóa' : 'Mở lại'} tài khoản này?`}
            onConfirm={() => handleToggleStatus(row._id)}
          >
            <Button
              size="small"
              className={`!h-7 !rounded-md !px-3 !text-[10px] !font-semibold !uppercase !tracking-wide ${
                row.status === 'Active'
                  ? '!border-rose-600 !bg-white !text-rose-600 hover:!bg-rose-50'
                  : '!border-emerald-600 !bg-emerald-600 !text-white hover:!bg-emerald-500'
              }`}
            >
              {row.status === 'Active' ? 'Khóa' : 'Mở lại'}
            </Button>
          </Popconfirm>
        ) : (
          <Tag className="!m-0 !rounded-full !border !border-zinc-200 !bg-zinc-50 !px-2 !py-0.5 !text-[10px] !font-semibold !text-zinc-500">
            Chỉ super admin
          </Tag>
        )
      ),
    },
  ]

  const statsItems = [
    { key: 'admins', label: 'TỔNG TÀI KHOẢN', value: stats.total, note: 'Toàn bộ tài khoản hệ thống' },
    { key: 'sessions', label: 'ĐANG HOẠT ĐỘNG', value: stats.active, note: 'Nhân sự trực tuyến' },
    { key: 'alerts', label: 'CẢNH BÁO BẢO MẬT', value: stats.alerts, note: 'Hệ thống an toàn và đã xác thực' },
  ]

  return (
    <div className="space-y-5 pb-20">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[44px] leading-[0.95] font-black tracking-[-0.03em] text-zinc-900">Quản lý tài khoản admin</h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Theo dõi phân quyền, phiên đăng nhập và mức độ an toàn của đội vận hành theo thời gian thực.
          </p>
        </div>
        <Segmented options={viewModes} value={viewMode} onChange={setViewMode} className="!rounded-lg !bg-zinc-100 !p-1" />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {statsItems.map((stat, idx) => (
          <Card
            key={stat.key}
            bordered={false}
            className="!rounded-xl !border !border-zinc-200 !shadow-none"
            bodyStyle={{ padding: 18 }}
          >
            <div className={`mb-3 h-1.5 w-8 rounded-full ${idx === 1 ? 'bg-black' : 'bg-rose-600'}`} />
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">{stat.label}</div>
            <div className="mt-2 text-[34px] leading-none font-black tracking-tight text-zinc-900">{stat.value}</div>
            <p className="mt-1 text-xs font-medium text-rose-600">{stat.note}</p>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 2xl:grid-cols-12">
        <Card className="!rounded-2xl !border !border-zinc-200 !shadow-none 2xl:col-span-9" bodyStyle={{ padding: 0 }}>
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <Space size={10}>
              <h3 className="m-0 text-[22px] leading-none font-extrabold tracking-tight text-zinc-900">Admin Accounts</h3>
              <Tag className="!rounded-full !border-rose-200 !bg-rose-50 !px-2 !py-0.5 !text-[10px] !font-bold !tracking-wide !text-rose-600">
                TRỰC TIẾP
              </Tag>
            </Space>

            <Space size={10}>
              <Tooltip title="Làm mới">
                <Button onClick={fetchData} shape="circle" icon={<ReloadOutlined />} className="!border-zinc-200 !text-zinc-600" />
              </Tooltip>
            </Space>
          </div>

          <div className="px-3 pb-3 pt-1">
            <Table
              columns={columns}
              dataSource={filteredAccounts}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 15 }}
              scroll={{ x: 920 }}
              rowClassName={() => 'hover:!bg-zinc-50'}
            />
          </div>
        </Card>

        <Card
          className="!rounded-2xl !border-none !bg-gradient-to-b !from-zinc-950 !to-rose-950 !text-white !shadow-none 2xl:col-span-3"
          bodyStyle={{ padding: 20 }}
        >
          <h3 className="m-0 text-xl font-bold tracking-tight">Trạng thái bảo mật</h3>
          <p className="mt-1 text-xs text-zinc-300">Giám sát xác thực vận hành</p>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-zinc-900/70 p-3">
              <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-400">Xác thực mạnh</div>
              <div className="mt-1 text-base font-semibold">2FA + Ràng buộc thiết bị</div>
            </div>
            <div className="rounded-xl bg-zinc-900/70 p-3">
              <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-400">Hết hạn phiên</div>
              <div className="mt-1 text-base font-semibold">14 phút</div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-rose-900/40 bg-rose-950/50 p-3">
            <div className="text-[10px] uppercase tracking-[0.14em] text-rose-200">Nhân sự đang trực</div>
            <div className="mt-2 flex items-center gap-2">
              {admins.slice(0, 3).map(a => (
                  <Avatar key={a._id} size={26} className="!bg-rose-700">{getInitials(a.name)}</Avatar>
              ))}
              {admins.length > 3 && <Tag className="!m-0 !rounded-full !border-zinc-700 !bg-zinc-900 !text-zinc-200">+{admins.length - 3}</Tag>}
            </div>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card
          className="!rounded-2xl !border-none !bg-rose-600 !text-white !shadow-none xl:col-span-2"
          bodyStyle={{ padding: 22 }}
        >
          <p className="m-0 text-[34px] leading-none font-black tracking-tight">"Control is the foundation of trust."</p>
          <p className="mt-2 mb-0 max-w-2xl text-sm text-rose-100">
            Duy trì kiểm tra tài khoản hằng tuần và phân quyền theo vai trò để bảo đảm an toàn vận hành.
          </p>
        </Card>

        <Card className="!rounded-2xl !border !border-zinc-200 !shadow-none" bodyStyle={{ padding: 22 }}>
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
            <UserAddOutlined className="text-lg" />
          </div>
          <h4 className="m-0 text-lg font-bold text-zinc-900">Tạo tài khoản admin mới</h4>
          <p className="mt-1 text-xs text-zinc-500">Tạo tài khoản bảo mật cho trưởng ca hoặc quản lý điều hành.</p>
          <Button
            block
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            disabled={!isSuperAdmin}
            className="!mt-4 !h-10 !rounded-md !border-0 !bg-zinc-900 !text-[11px] !font-bold !uppercase !tracking-wide !text-white hover:!bg-zinc-800"
          >
            Tạo nhanh
          </Button>
          {!isSuperAdmin ? (
            <p className="mt-2 text-[11px] text-zinc-500">Chỉ super admin mới có quyền tạo tài khoản admin.</p>
          ) : null}
        </Card>
      </section>

      <Modal
        title="Tạo tài khoản admin mới"
        open={isModalOpen}
        onOk={handleRegister}
        onCancel={() => setIsModalOpen(false)}
        okText="Tạo"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Địa chỉ email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
             <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
                <Input />
             </Form.Item>
             <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                <Select>
                    <Select.Option value="admin">Admin</Select.Option>
                  <Select.Option value="super_admin">Super Admin</Select.Option>
                </Select>
             </Form.Item>
          </div>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
             <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
