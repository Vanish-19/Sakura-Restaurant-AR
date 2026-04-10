import {
  DashboardOutlined,
  ForkOutlined,
  OrderedListOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  SettingOutlined,
  TableOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons'
import { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { key: '/admin/dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
  { key: '/admin/food', label: 'Food Management', icon: <ForkOutlined /> },
  { key: '/admin/orders', label: 'Order Management', icon: <OrderedListOutlined /> },
  { key: '/admin/tables', label: 'Table Management', icon: <TableOutlined /> },
  { key: '/admin/users', label: 'User Management', icon: <TeamOutlined /> },
  { key: '/admin/admins', label: 'Admin Management', icon: <UserSwitchOutlined /> },
  { key: '/admin/content', label: 'Content Management', icon: <ReadOutlined /> },
]

export default function AdminSidebar() {
  const location = useLocation()

  const selectedKeys = useMemo(() => {
    const exact = navItems.find((item) => location.pathname.startsWith(item.key))
    return exact ? [exact.key] : ['/admin/dashboard']
  }, [location.pathname])

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[220px] border-r border-zinc-200 bg-[#efefef] lg:flex lg:flex-col">
      <div className="px-5 pb-4 pt-4">
        <div className="mb-2.5 flex items-center gap-2.5">
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] bg-[#c10017] text-white shadow-sm">
            <ForkOutlined className="text-[12px]" />
          </div>
          <div className="min-w-0 max-w-[150px]">
            <p className="truncate text-[13px] font-extrabold uppercase leading-none tracking-tight text-zinc-900">ZenithCrimson</p>
            <p className="mt-1 truncate text-[9px] font-medium uppercase leading-none tracking-[0.16em] text-zinc-500">Premium Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-0">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const selected = selectedKeys.includes(item.key)
            return (
              <li key={item.key}>
                <NavLink
                  to={item.key}
                  className={[
                    'relative flex items-center gap-2.5 px-5 py-3 text-[13px] font-medium transition',
                    selected
                      ? 'bg-white text-[#c10017] before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[#c10017]'
                      : 'text-zinc-600 hover:bg-white/60 hover:text-zinc-900',
                  ].join(' ')}
                >
                  <span className="text-[14px]">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="space-y-1 px-0 pb-6">
        <div className="flex items-center gap-2.5 px-5 py-2 text-[13px] text-zinc-600">
          <SettingOutlined className="text-[13px]" />
          <span>Settings</span>
        </div>
        <div className="flex items-center gap-2.5 px-5 py-2 text-[13px] text-zinc-600">
          <QuestionCircleOutlined className="text-[13px]" />
          <span>Support</span>
        </div>
      </div>
    </aside>
  )
}
