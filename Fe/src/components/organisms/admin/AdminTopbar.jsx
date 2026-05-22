import { AppstoreOutlined, BellFilled, LogoutOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { Badge, Button, Empty, Popover, message } from 'antd'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogout } from '../../../services/authApi.js'
import { clearAdminSession, getAdminProfile } from '../../../utils/authSession.js'

function formatNotificationTime(value) {
  if (!value) return ''

  try {
    return new Date(value).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    })
  } catch {
    return ''
  }
}

export default function AdminTopbar({
  searchEnabled = false,
  searchValue = '',
  onSearchChange,
  notifications = [],
  unreadNotificationCount = 0,
  onMarkNotificationsRead,
  onClearNotifications,
}) {
  const navigate = useNavigate()
  const adminProfile = getAdminProfile()

  const adminName = useMemo(() => {
    return (
      adminProfile?.name ||
      adminProfile?.username ||
      adminProfile?.email ||
      'Admin'
    )
  }, [adminProfile])

  const adminRoleLabel = useMemo(() => {
    const role = String(adminProfile?.role || '').toLowerCase()
    if (role === 'super_admin') return 'SUPER ADMIN'
    return 'ADMIN'
  }, [adminProfile])

  const notificationContent = (
    <div className="w-[340px] max-w-[calc(100vw-32px)]">
      <div className="mb-2 flex items-center justify-between gap-3 border-b border-zinc-100 pb-2">
        <div>
          <p className="m-0 text-sm font-bold text-zinc-900">Thông báo vận hành</p>
          <p className="m-0 text-[11px] text-zinc-500">{notifications.length} thông báo gần nhất</p>
        </div>
        <Button size="small" type="text" onClick={onClearNotifications} disabled={notifications.length === 0}>
          Xóa
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có thông báo" />
      ) : (
        <div className="max-h-[360px] overflow-y-auto">
          {notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => item.href && navigate(item.href)}
              className={`mb-2 w-full rounded-xl border px-3 py-2 text-left transition hover:border-[#d8001e] hover:bg-[#fff5f6] ${
                item.read ? 'border-zinc-100 bg-white' : 'border-[#ffd0d7] bg-[#fff6f7]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="m-0 text-[13px] font-bold text-zinc-900">{item.title}</p>
                {!item.read ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#d8001e]" /> : null}
              </div>
              <p className="m-0 mt-1 text-xs leading-5 text-zinc-600">{item.description}</p>
              <p className="m-0 mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                {formatNotificationTime(item.createdAt)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  const handleLogout = async () => {
    try {
      await adminLogout()
    } catch {
      // ignore API failures and clear session on client
    }

    clearAdminSession()
    message.success('Đăng xuất quản trị thành công')
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
      {searchEnabled ? (
        <label className="relative w-full max-w-[300px] sm:max-w-[360px]">
          <SearchOutlined className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn hàng..."
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-100/70 pl-9 pr-3 text-[12px] text-zinc-700 outline-none placeholder:text-zinc-400 focus:border-zinc-300"
          />
        </label>
      ) : <div />}

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Popover
          trigger="click"
          placement="bottomRight"
          content={notificationContent}
          onOpenChange={(open) => {
            if (open) onMarkNotificationsRead?.()
          }}
        >
          <Badge count={unreadNotificationCount} size="small" offset={[-2, 4]}>
            <button className="grid h-8 w-8 place-items-center rounded-md text-zinc-600 hover:bg-zinc-100" type="button" aria-label="thông báo vận hành">
              <BellFilled className="text-[13px]" />
            </button>
          </Badge>
        </Popover>

        <button className="grid h-8 w-8 place-items-center rounded-md text-zinc-600 hover:bg-zinc-100" type="button" aria-label="ứng dụng">
          <AppstoreOutlined className="text-[13px]" />
        </button>

        <div className="h-8 w-px bg-zinc-200" />

        <div className="flex items-center gap-2 rounded-md bg-white px-2 py-1">
          <div className="text-right leading-tight">
            <p className="text-[11px] font-semibold text-zinc-900">{adminName}</p>
            <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-400">{adminRoleLabel}</p>
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-md bg-[#c10017] text-white">
            <UserOutlined className="text-[12px]" />
          </div>
        </div>

        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="!h-8 !rounded-md !border !border-zinc-200 !bg-white !px-2 !text-zinc-700 hover:!bg-zinc-50"
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  )
}
