import { useEffect, useMemo, useState } from 'react'
import { notification } from 'antd'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from '../../organisms/admin/AdminSidebar.jsx'
import AdminTopbar from '../../organisms/admin/AdminTopbar.jsx'
import { defaultSiteSettings, SITE_SETTINGS_KEY } from '../../../utils/siteSettings.js'
import { connectAdminSocket } from '../../../services/adminSocket.js'
import { showReservationNotification } from '../../../utils/reservationNotification.jsx'

function getInitialAdminSettings() {
  try {
    const raw = localStorage.getItem(SITE_SETTINGS_KEY)
    if (!raw) return defaultSiteSettings

    const parsed = JSON.parse(raw)
    return {
      ...defaultSiteSettings,
      ...(parsed || {}),
    }
  } catch {
    return defaultSiteSettings
  }
}

export default function AdminLayout() {
  const location = useLocation()
  const [notificationApi, notificationContextHolder] = notification.useNotification()
  const [adminSearchQuery, setAdminSearchQuery] = useState('')
  const [adminSettings, setAdminSettings] = useState(getInitialAdminSettings)

  const isOrderSearchEnabled = useMemo(() => {
    return (
      location.pathname.startsWith('/admin/orders') ||
      location.pathname.startsWith('/admin/dashboard')
    )
  }, [location.pathname])

  useEffect(() => {
    try {
      localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(adminSettings))
      window.dispatchEvent(new Event('site-settings-updated'))
    } catch {
      // ignore storage failures
    }
  }, [adminSettings])

  useEffect(() => {
    const socket = connectAdminSocket()

    socket.on('reservation_created', (reservation) => {
      const tableName = reservation?.table?.name || 'bàn phù hợp'
      const reservationTime = reservation?.reservation_time
        ? new Date(reservation.reservation_time).toLocaleString('vi-VN')
        : 'chưa xác định thời gian'

      showReservationNotification(notificationApi, {
        message: 'Có đặt bàn mới',
        description: `${reservation?.customer_name || 'Khách hàng'} vừa đặt ${tableName} cho ${reservation?.party_size || '--'} khách lúc ${reservationTime}.`,
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [notificationApi])

  const layoutStyle = {
    '--admin-accent': adminSettings.accentColor,
  }

  return (
    <div
      className="min-h-screen bg-[#f3f3f4] text-[#161616]"
      data-admin-theme={adminSettings.themePreset}
      style={layoutStyle}
    >
      {notificationContextHolder}
      <AdminSidebar adminSettings={adminSettings} onUpdateSettings={setAdminSettings} />
      <main className="lg:pl-[220px]">
        <div className="mx-auto max-w-[1360px] px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          <AdminTopbar
            searchEnabled={isOrderSearchEnabled}
            searchValue={isOrderSearchEnabled ? adminSearchQuery : ''}
            onSearchChange={setAdminSearchQuery}
          />
          <div className="admin-page-wrapper">
            <Outlet context={{ adminSearchQuery: isOrderSearchEnabled ? adminSearchQuery : '' }} />
          </div>
        </div>
      </main>
    </div>
  )
}
