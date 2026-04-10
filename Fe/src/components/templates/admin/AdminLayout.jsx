import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../organisms/admin/AdminSidebar.jsx'
import AdminTopbar from '../../organisms/admin/AdminTopbar.jsx'

const { Content } = Layout

export default function AdminLayout() {
  return (
    <Layout className="admin-layout">
      <AdminSidebar />
      <Layout>
        <Content className="admin-content">
          <AdminTopbar />
          <div className="admin-page-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
