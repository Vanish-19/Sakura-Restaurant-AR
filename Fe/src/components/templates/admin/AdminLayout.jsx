import { useCallback, useEffect, useMemo, useState } from 'react'
import { notification } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import AdminSidebar from '../../organisms/admin/AdminSidebar.jsx'
import AdminTopbar from '../../organisms/admin/AdminTopbar.jsx'
import { defaultSiteSettings, SITE_SETTINGS_KEY } from '../../../utils/siteSettings.js'
import { connectAdminSocket } from '../../../services/adminSocket.js'
import { showReservationNotification } from '../../../utils/reservationNotification.jsx'

const ADMIN_RESERVATION_NOTIFICATIONS_KEY = 'armenuweb_admin_reservation_notifications_v1'
const MAX_ADMIN_NOTIFICATIONS = 30

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

function getInitialAdminNotifications() {
  try {
    const raw = localStorage.getItem(ADMIN_RESERVATION_NOTIFICATIONS_KEY)
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ADMIN_NOTIFICATIONS) : []
  } catch {
    return []
  }
}

function formatReservationTime(value) {
  if (!value) return 'chưa xác định thời gian'

  try {
    return new Date(value).toLocaleString('vi-VN')
  } catch {
    return 'chưa xác định thời gian'
  }
}

function dispatchReservationUpdate(type, reservation) {
  window.dispatchEvent(new CustomEvent('admin-reservation-updated', {
    detail: { type, reservation },
  }))
}

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [notificationApi, notificationContextHolder] = notification.useNotification()
  const [adminSearchQuery, setAdminSearchQuery] = useState('')
  const [adminSettings, setAdminSettings] = useState(getInitialAdminSettings)
  const [adminNotifications, setAdminNotifications] = useState(getInitialAdminNotifications)

  const isOrderSearchEnabled = useMemo(() => {
    return (
      location.pathname.startsWith('/admin/orders') ||
      location.pathname.startsWith('/admin/dashboard')
    )
  }, [location.pathname])

  const unreadNotificationCount = useMemo(
    () => adminNotifications.filter((item) => !item.read).length,
    [adminNotifications],
  )

  const addAdminNotification = useCallback((item) => {
    setAdminNotifications((current) => [
      {
        id: `${item.type || 'reservation'}:${item.reservationId || Date.now()}:${Date.now()}`,
        createdAt: new Date().toISOString(),
        read: false,
        href: '/admin/tables',
        ...item,
      },
      ...current,
    ].slice(0, MAX_ADMIN_NOTIFICATIONS))
  }, [])

  const markNotificationsRead = useCallback(() => {
    setAdminNotifications((current) => current.map((item) => ({ ...item, read: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setAdminNotifications([])
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(adminSettings))
      window.dispatchEvent(new Event('site-settings-updated'))
    } catch {
      // ignore storage failures
    }
  }, [adminSettings])

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_RESERVATION_NOTIFICATIONS_KEY, JSON.stringify(adminNotifications))
    } catch {
      // ignore storage failures
    }
  }, [adminNotifications])

  useEffect(() => {
    const socket = connectAdminSocket()

    socket.on('reservation_created', (reservation) => {
      const tableName = reservation?.table?.name || 'bàn phù hợp'
      const reservationTime = formatReservationTime(reservation?.reservation_time)
      const title = 'Có đặt bàn mới'
      const description = `${reservation?.customer_name || 'Khách hàng'} vừa đặt ${tableName} cho ${reservation?.party_size || '--'} khách lúc ${reservationTime}.`

      addAdminNotification({
        type: 'reservation_created',
        reservationId: reservation?._id,
        title,
        description,
      })
      showReservationNotification(notificationApi, {
        message: title,
        description,
        duration: 8,
        actionLabel: 'Xem quản lý bàn',
        onAction: () => navigate('/admin/tables'),
      })
      dispatchReservationUpdate('created', reservation)
    })

    socket.on('reservation_expired', (reservation) => {
      const tableName = reservation?.table?.name || 'bàn phù hợp'
      const reservationTime = formatReservationTime(reservation?.reservation_time)
      const title = 'Đặt bàn quá hạn đã tự hủy'
      const description = `${reservation?.customer_name || 'Khách hàng'} đặt ${tableName} lúc ${reservationTime} đã quá 30 phút, hệ thống đã hủy và trả bàn về trạng thái trống.`

      addAdminNotification({
        type: 'reservation_expired',
        reservationId: reservation?._id,
        title,
        description,
      })
      showReservationNotification(notificationApi, {
        type: 'warning',
        message: title,
        description,
        duration: 8,
        actionLabel: 'Xem quản lý bàn',
        onAction: () => navigate('/admin/tables'),
      })
      dispatchReservationUpdate('expired', reservation)
    })

    return () => {
      socket.disconnect()
    }
  }, [addAdminNotification, navigate, notificationApi])

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
            notifications={adminNotifications}
            unreadNotificationCount={unreadNotificationCount}
            onMarkNotificationsRead={markNotificationsRead}
            onClearNotifications={clearNotifications}
          />
          <div className="admin-page-wrapper">
            <Outlet context={{ adminSearchQuery: isOrderSearchEnabled ? adminSearchQuery : '' }} />
          </div>
        </div>
      </main>
    </div>
  )
}
