import {
  DashboardOutlined,
  ForkOutlined,
  OrderedListOutlined,
  ReadOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons'
import { Layout, Menu } from 'antd'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const { Sider } = Layout

const navItems = [
  { key: '/admin/dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
  { key: '/admin/food', label: 'Food Management', icon: <ForkOutlined /> },
  { key: '/admin/orders', label: 'Order Management', icon: <OrderedListOutlined /> },
  { key: '/admin/content', label: 'Content Management', icon: <ReadOutlined /> },
  { key: '/admin/users', label: 'User Management', icon: <TeamOutlined /> },
  { key: '/admin/admins', label: 'Admin Management', icon: <UserSwitchOutlined /> },
]

export default function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const selectedKeys = useMemo(() => {
    const exact = navItems.find((item) => location.pathname.startsWith(item.key))
    return exact ? [exact.key] : ['/admin/dashboard']
  }, [location.pathname])

  return (
    <Sider
      width={250}
      breakpoint="lg"
      collapsedWidth={0}
      className="admin-sider"
      theme="light"
    >
      <div className="admin-brand">Zenith Crimson</div>
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        items={navItems}
        className="admin-menu"
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  )
}
