import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from '../../organisms/admin/AdminSidebar.jsx'
import AdminTopbar from '../../organisms/admin/AdminTopbar.jsx'

const ADMIN_SETTINGS_KEY = 'armenuweb_admin_settings_v1'

function getInitialAdminSettings() {
  const fallback = {
    websiteName: 'ZenithCrimson',
    themePreset: 'default',
    accentColor: '#c10017',
  }

  try {
    const raw = localStorage.getItem(ADMIN_SETTINGS_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return {
      ...fallback,
      ...(parsed || {}),
    }
  } catch {
    return fallback
  }
}

export default function AdminLayout() {
  const location = useLocation()
  const [adminSearchQuery, setAdminSearchQuery] = useState('')
  const [adminSettings, setAdminSettings] = useState(getInitialAdminSettings)

  const isOrderSearchEnabled = useMemo(() => {
    return (
      location.pathname.startsWith('/admin/orders') ||
      location.pathname.startsWith('/admin/dashboard')
    )
  }, [location.pathname])

  useEffect(() => {
    if (!isOrderSearchEnabled && adminSearchQuery) {
      setAdminSearchQuery('')
    }
  }, [isOrderSearchEnabled, adminSearchQuery])

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(adminSettings))
    } catch {
      // ignore storage failures
    }
  }, [adminSettings])

  const layoutStyle = {
    '--admin-accent': adminSettings.accentColor,
  }

  return (
    <div
      className="min-h-screen bg-[#f3f3f4] text-[#161616]"
      data-admin-theme={adminSettings.themePreset}
      style={layoutStyle}
    >
      <AdminSidebar adminSettings={adminSettings} onUpdateSettings={setAdminSettings} />
      <main className="lg:pl-[220px]">
        <div className="mx-auto max-w-[1360px] px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          <AdminTopbar
            searchEnabled={isOrderSearchEnabled}
            searchValue={adminSearchQuery}
            onSearchChange={setAdminSearchQuery}
          />
          <div className="admin-page-wrapper">
            <Outlet context={{ adminSearchQuery }} />
          </div>
        </div>
      </main>
    </div>
  )
}
