import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../organisms/admin/AdminSidebar.jsx'
import AdminTopbar from '../../organisms/admin/AdminTopbar.jsx'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f3f3f4] text-[#161616]">
      <AdminSidebar />
      <main className="lg:pl-[220px]">
        <div className="mx-auto max-w-[1360px] px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          <AdminTopbar />
          <div className="admin-page-wrapper">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
