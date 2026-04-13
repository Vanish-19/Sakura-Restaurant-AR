import { Navigate, Outlet } from 'react-router-dom'

export default function AdminLoginGuard() {
  const token = localStorage.getItem('admin_access_token')

  if (token) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <Outlet />
}
