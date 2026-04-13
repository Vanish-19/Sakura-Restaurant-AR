import { AppstoreOutlined, BellFilled, LogoutOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { Button, message } from 'antd'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogout } from '../../../services/authApi.js'
import { clearAdminSession, getAdminProfile } from '../../../utils/authSession.js'

export default function AdminTopbar() {
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
      <label className="relative w-full max-w-[300px] sm:max-w-[360px]">
        <SearchOutlined className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-zinc-400" />
        <input
          type="text"
          placeholder="Tìm đơn hàng, khách hàng..."
          className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-100/70 pl-9 pr-3 text-[12px] text-zinc-700 outline-none placeholder:text-zinc-400 focus:border-zinc-300"
        />
      </label>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button className="grid h-8 w-8 place-items-center rounded-md text-zinc-600 hover:bg-zinc-100" type="button" aria-label="thông báo">
          <BellFilled className="text-[13px]" />
        </button>
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
