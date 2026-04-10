import {
  Avatar,
  Button,
  Card,
  Segmented,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd'
import {
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons'
import { useMemo, useState } from 'react'
import { adminAccounts, adminStats } from '../../data/admin/adminMockData.js'

const viewModes = [
  { label: 'Admin', value: 'admin' },
  { label: 'Staff', value: 'staff' },
]

const roleMeta = {
  'Super Admin': { level: 'L-1', tone: 'text-rose-700 bg-rose-50 border-rose-100' },
  'Floor Manager': { level: 'L-2', tone: 'text-sky-700 bg-sky-50 border-sky-100' },
  Chef: { level: 'L-3', tone: 'text-violet-700 bg-violet-50 border-violet-100' },
}

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function AdminManagementAdminPage() {
  const [viewMode, setViewMode] = useState('admin')

  const filteredAccounts = useMemo(() => {
    if (viewMode === 'admin') return adminAccounts.filter((item) => item.role === 'Super Admin' || item.role === 'Floor Manager')
    return adminAccounts.filter((item) => item.role !== 'Super Admin')
  }, [viewMode])

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
        const meta = roleMeta[role] || { level: 'L-4', tone: 'text-zinc-700 bg-zinc-50 border-zinc-200' }
        return (
          <div className="space-y-1">
            <Tag className={`!m-0 !rounded-full !border !px-2 !py-0.5 !text-[10px] !font-semibold ${meta.tone}`}>
              {role}
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
      title: 'LAST LOGIN',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (value) => <span className="text-[12px] font-medium text-zinc-600">{value}</span>,
    },
    {
      title: 'ACTION',
      dataIndex: 'status',
      key: 'action',
      render: (status) => (
        <Button
          size="small"
          className={`!h-7 !rounded-md !px-3 !text-[10px] !font-semibold !uppercase !tracking-wide ${
            status === 'Active'
              ? '!border-zinc-900 !bg-zinc-900 !text-white hover:!border-zinc-800 hover:!bg-zinc-800'
              : '!border-rose-600 !bg-rose-600 !text-white hover:!border-rose-500 hover:!bg-rose-500'
          }`}
        >
          {status === 'Active' ? 'Manage' : 'Reactivate'}
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[44px] leading-[0.95] font-black tracking-[-0.03em] text-zinc-900">Admin Management</h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Real-time control over permissions, sessions and security integrity of your operation team.
          </p>
        </div>
        <Segmented options={viewModes} value={viewMode} onChange={setViewMode} className="!rounded-lg !bg-zinc-100 !p-1" />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {adminStats.map((stat, idx) => (
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
              <h3 className="m-0 text-[22px] leading-none font-extrabold tracking-tight text-zinc-900">Active Admin Accounts</h3>
              <Tag className="!rounded-full !border-rose-200 !bg-rose-50 !px-2 !py-0.5 !text-[10px] !font-bold !tracking-wide !text-rose-600">
                LIVE UPDATE
              </Tag>
            </Space>

            <Space size={10}>
              <Tooltip title="Filter">
                <Button shape="circle" icon={<FilterOutlined />} className="!border-zinc-200 !text-zinc-600" />
              </Tooltip>
              <Tooltip title="Refresh">
                <Button shape="circle" icon={<ReloadOutlined />} className="!border-zinc-200 !text-zinc-600" />
              </Tooltip>
            </Space>
          </div>

          <div className="px-3 pb-3 pt-1">
            <Table
              columns={columns}
              dataSource={filteredAccounts}
              pagination={false}
              scroll={{ x: 920 }}
              rowClassName={() => 'hover:!bg-zinc-50'}
            />
          </div>
        </Card>

        <Card
          className="!rounded-2xl !border-none !bg-gradient-to-b !from-zinc-950 !to-rose-950 !text-white !shadow-none 2xl:col-span-3"
          bodyStyle={{ padding: 20 }}
        >
          <h3 className="m-0 text-xl font-bold tracking-tight">Security Pulse</h3>
          <p className="mt-1 text-xs text-zinc-300">Operational authentication windows</p>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-zinc-900/70 p-3">
              <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-400">Strong Auth</div>
              <div className="mt-1 text-base font-semibold">2FA + Device Bind</div>
            </div>
            <div className="rounded-xl bg-zinc-900/70 p-3">
              <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-400">Session Timeout</div>
              <div className="mt-1 text-base font-semibold">14 Minutes</div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-rose-900/40 bg-rose-950/50 p-3">
            <div className="text-[10px] uppercase tracking-[0.14em] text-rose-200">Live Security Team</div>
            <div className="mt-2 flex items-center gap-2">
              <Avatar size={26} className="!bg-rose-700">A</Avatar>
              <Avatar size={26} className="!bg-zinc-700">K</Avatar>
              <Avatar size={26} className="!bg-zinc-700">R</Avatar>
              <Tag className="!m-0 !rounded-full !border-zinc-700 !bg-zinc-900 !text-zinc-200">+2</Tag>
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
            Admin security score is currently at 96%. Keep account reviews weekly and enforce role-based permissions.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button className="!h-9 !rounded-md !border-0 !bg-white !px-4 !text-[11px] !font-bold !uppercase !tracking-wide !text-rose-700">
              Manage Workload
            </Button>
            <Button className="!h-9 !rounded-md !border-0 !bg-rose-700 !px-4 !text-[11px] !font-bold !uppercase !tracking-wide !text-white">
              View Analytics
            </Button>
          </div>
        </Card>

        <Card className="!rounded-2xl !border !border-zinc-200 !shadow-none" bodyStyle={{ padding: 22 }}>
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
            <UserAddOutlined className="text-lg" />
          </div>
          <h4 className="m-0 text-lg font-bold text-zinc-900">New Admin Account</h4>
          <p className="mt-1 text-xs text-zinc-500">Create secured account for operation lead or executive manager.</p>
          <Button
            block
            icon={<PlusOutlined />}
            className="!mt-4 !h-10 !rounded-md !border-0 !bg-zinc-900 !text-[11px] !font-bold !uppercase !tracking-wide !text-white"
          >
            Quick Create
          </Button>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card className="!rounded-xl !border !border-zinc-200 !shadow-none" bodyStyle={{ padding: 14 }}>
          <Space>
            <SafetyOutlined className="text-zinc-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Security</span>
          </Space>
        </Card>
        <Card className="!rounded-xl !border !border-zinc-200 !shadow-none" bodyStyle={{ padding: 14 }}>
          <Space>
            <UsergroupAddOutlined className="text-zinc-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Support</span>
          </Space>
        </Card>
      </section>
    </div>
  )
}
