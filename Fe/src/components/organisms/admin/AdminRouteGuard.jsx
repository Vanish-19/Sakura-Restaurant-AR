import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function AdminRouteGuard() {
  const location = useLocation()
  const token = localStorage.getItem('admin_access_token')

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
