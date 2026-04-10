import { Navigate, Route, Routes } from 'react-router-dom'
import AdminRouteGuard from './components/organisms/admin/AdminRouteGuard.jsx'
import ClientAuthLayout from './components/templates/auth/ClientAuthLayout.jsx'
import AdminLayout from './components/templates/admin/AdminLayout.jsx'
import AppLayout from './components/templates/AppLayout.jsx'
import CartPage from './pages/CartPage.jsx'
import HomePage from './pages/HomePage.jsx'
import AdminManagementAdminPage from './pages/admin/AdminManagementAdminPage.jsx'
import ContentManagementAdminPage from './pages/admin/ContentManagementAdminPage.jsx'
import DashboardAdminPage from './pages/admin/DashboardAdminPage.jsx'
import FoodManagementAdminPage from './pages/admin/FoodManagementAdminPage.jsx'
import OrderManagementAdminPage from './pages/admin/OrderManagementAdminPage.jsx'
import UserManagementAdminPage from './pages/admin/UserManagementAdminPage.jsx'
import AdminLoginPage from './pages/auth/AdminLoginPage.jsx'
import ClientLoginPage from './pages/auth/ClientLoginPage.jsx'
import ClientRegisterPage from './pages/auth/ClientRegisterPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/order" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
      </Route>

      <Route path="/auth" element={<ClientAuthLayout />}>
        <Route path="login" element={<ClientLoginPage />} />
        <Route path="register" element={<ClientRegisterPage />} />
      </Route>

      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route element={<AdminRouteGuard />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardAdminPage />} />
          <Route path="food" element={<FoodManagementAdminPage />} />
          <Route path="orders" element={<OrderManagementAdminPage />} />
          <Route path="content" element={<ContentManagementAdminPage />} />
          <Route path="users" element={<UserManagementAdminPage />} />
          <Route path="admins" element={<AdminManagementAdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
