import { PlusOutlined } from '@ant-design/icons'
import { Avatar, Button, Card, Segmented, Space, Table, Tag } from 'antd'
import { useMemo, useState } from 'react'
import { dishes } from '../../data/admin/adminMockData.js'

const menuModes = [
  { label: 'Dine-in', value: 'dine-in' },
  { label: 'Delivery', value: 'delivery' },
]

const stats = [
  { key: 'live', title: 'LIVE DISHES', value: '24', note: '+ 12% from last hour', tone: 'text-rose-600', bar: 'bg-rose-600' },
  { key: 'prep', title: 'AVG PREP TIME', value: '18 min', note: 'Target: 15 min', tone: 'text-zinc-400', bar: 'bg-rose-600' },
  { key: 'revenue', title: 'REVENUE TODAY', value: '¥84.2k', note: 'Peak period active', tone: 'text-zinc-400', bar: 'bg-zinc-900' },
]

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function FoodManagementAdminPage() {
  const [mode, setMode] = useState('dine-in')

  const tableData = useMemo(
    () =>
      dishes.slice(0, 3).map((dish, index) => ({
        key: dish.key,
        dishId: `#FD-${dish.sku.replace('RAM-', '').replace('SUS-', '').replace('DES-', '')}`,
        dishName: dish.dish,
        chef: ['Yuki Sato', 'Hiroshi Kondo', 'Maki Asakawa'][index],
        station: ['B-12', 'A-04', 'C-01'][index],
        amount: dish.price,
        status: ['Preparing', 'Pending', 'Served'][index],
        action: ['Process', 'Accept', 'Details'][index],
      })),
    [],
  )

  const columns = [
    {
      title: 'DISH ID',
      dataIndex: 'dishId',
      key: 'dishId',
      render: (value) => <span className="text-[22px] font-black tracking-tight text-zinc-900">{value}</span>,
    },
    {
      title: 'DISH',
      dataIndex: 'dishName',
      key: 'dishName',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar size={30} className="!bg-zinc-100 !text-zinc-600">{getInitials(row.chef)}</Avatar>
          <div>
            <p className="m-0 text-[12px] font-semibold text-zinc-900">{row.chef}</p>
            <p className="m-0 text-[11px] text-zinc-500">{row.dishName}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'STATION',
      dataIndex: 'station',
      key: 'station',
      render: (value) => <Tag className="!rounded-md !border-zinc-200 !bg-zinc-100 !px-2 !py-0.5 !font-semibold">{value}</Tag>,
    },
    { title: 'AMOUNT', dataIndex: 'amount', key: 'amount' },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const classes =
          status === 'Preparing'
            ? '!border-amber-200 !bg-amber-50 !text-amber-700'
            : status === 'Pending'
              ? '!border-rose-200 !bg-rose-50 !text-rose-600'
              : '!border-emerald-200 !bg-emerald-50 !text-emerald-700'

        return <Tag className={`!rounded-full !px-2 !py-0 !text-[10px] !font-bold ${classes}`}>{status.toUpperCase()}</Tag>
      },
    },
    {
      title: 'ACTION',
      dataIndex: 'action',
      key: 'action',
      render: (action) => {
        const classes =
          action === 'Process'
            ? '!bg-rose-600 hover:!bg-rose-500'
            : action === 'Accept'
              ? '!bg-zinc-900 hover:!bg-zinc-800'
              : '!bg-zinc-200 hover:!bg-zinc-300 !text-zinc-700'
        return (
          <Button className={`!h-7 !rounded-md !border-0 !px-3 !text-[10px] !font-bold !uppercase ${classes}`}>
            {action}
          </Button>
        )
      },
    },
  ]

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[44px] leading-[0.96] font-black tracking-[-0.03em] text-zinc-900">Food Management</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Real-time control over your kitchen's pulse. Manage floor and logistics from one central inkstone.
          </p>
        </div>

        <Space>
          <Segmented
            options={menuModes}
            value={mode}
            onChange={setMode}
            className="!rounded-lg !bg-zinc-100 !p-1"
          />
          <Button icon={<PlusOutlined />} className="!h-9 !rounded-lg !border-0 !bg-rose-600 !px-4 !text-xs !font-bold !uppercase !text-white">
            New Dish
          </Button>
        </Space>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
            <h3 className="m-0 text-2xl font-extrabold tracking-tight text-zinc-900">Active Kitchen Orders</h3>
            <Tag className="!rounded-full !border-rose-200 !bg-rose-50 !px-2 !py-0.5 !text-[10px] !font-bold !tracking-wide !text-rose-600">LIVE UPDATE</Tag>
          </Space>
          <span className="text-xs text-zinc-400">{mode === 'dine-in' ? 'Dine-in queue active' : 'Delivery queue active'}</span>
        </div>

        <div className="px-3 pb-3 pt-1">
          <Table columns={columns} dataSource={tableData} pagination={false} scroll={{ x: 940 }} rowClassName={() => 'hover:!bg-zinc-50'} />
        </div>
      </Card>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="!rounded-2xl !border-none !bg-rose-600 !text-white !shadow-none xl:col-span-2" bodyStyle={{ padding: 24 }}>
          <p className="m-0 text-[38px] leading-none font-black italic tracking-tight">"Precision is the ingredient of perfection."</p>
          <p className="mt-3 mb-0 max-w-2xl text-sm text-rose-100">
            Kitchen backlog is currently at 85%. Consider slowing down delivery intakes to maintain dine-in quality standards.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <Button className="!h-9 !rounded-md !border-0 !bg-white !px-4 !text-[11px] !font-bold !uppercase !tracking-wide !text-rose-700">Manage Workload</Button>
            <Button className="!h-9 !rounded-md !border-0 !bg-rose-700 !px-4 !text-[11px] !font-bold !uppercase !tracking-wide !text-white">View Analytics</Button>
          </div>
        </Card>

        <Card className="!rounded-2xl !border !border-zinc-200 !shadow-none" bodyStyle={{ padding: 24 }}>
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
            <PlusOutlined />
          </div>
          <h4 className="m-0 text-xl font-bold text-zinc-900">New Manual Dish</h4>
          <p className="mt-2 text-xs text-zinc-500">Click below to create quick dish order for phone bookings or walk-ins.</p>
          <Button block className="!mt-6 !h-10 !rounded-md !border-0 !bg-zinc-200 !text-[11px] !font-bold !uppercase !tracking-wide !text-zinc-700">
            Quick Create
          </Button>
        </Card>
      </section>
    </div>
  )
}
