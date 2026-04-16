import { ShoppingCartOutlined } from '@ant-design/icons'
import { Badge, Button, Layout, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Brand from '../atoms/Brand.jsx'
import { userLogout } from '../../services/authApi.js'
import { useCart } from '../../contexts/CartContext.jsx'
import { clearUserSession, getUserProfile } from '../../utils/authSession.js'
import { getOrderSource } from '../../utils/orderSource.js'

const { Header } = Layout

export default function AppHeader({ variant = 'desktop' }) {
  const { totalItems, clearAllCarts } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderSource = getOrderSource(searchParams)
  const [userProfile, setUserProfile] = useState(() => getUserProfile())
  const userDisplayName =
    userProfile?.name ||
    userProfile?.email ||
    userProfile?.phone ||
    ''
  const isUserLoggedIn = Boolean(userDisplayName)
  const homePath = orderSource.mode === 'dine-in' ? '/order' : '/'
  const scopeKeyRef = useRef(null)

  useEffect(() => {
    setUserProfile(getUserProfile())
  }, [location.pathname, location.search])

  const handleLogout = async () => {
    try {
      await userLogout()
    } catch {
      // ignore API failures and clear client session anyway
    }

    clearUserSession()
    clearAllCarts()
    setUserProfile(null)
    message.success('Đăng xuất thành công')
    navigate('/', { replace: true })
  }

  useEffect(() => {
    const currentScopeKey =
      orderSource.mode === 'dine-in'
        ? `table:${orderSource.tableCode}`
        : orderSource.mode

    if (scopeKeyRef.current === null) {
      scopeKeyRef.current = currentScopeKey
      return
    }

    if (scopeKeyRef.current === currentScopeKey) {
      return
    }

    scopeKeyRef.current = currentScopeKey
    message.destroy()
    const notice =
      orderSource.mode === 'dine-in'
        ? `Đang ở ${orderSource.label}`
        : orderSource.mode === 'delivery'
          ? 'Đang ở chế độ giao tận nơi'
          : orderSource.mode === 'pending-table'
            ? 'Vui lòng chọn bàn để tiếp tục'
            : 'Vui lòng chọn hình thức phục vụ'
    message.info(notice, 1.8)
  }, [orderSource.mode, orderSource.tableCode, orderSource.label])

  const headerClassName =
    variant === 'android'
      ? '!sticky !top-0 !z-50 !h-16 !bg-red-700 !px-0'
      : '!fixed !top-0 !left-0 !right-0 !z-50 !h-16 !bg-red-700 !px-0'

  return (
    <Header
      className={
        headerClassName +
        ' client-header !shadow-sm'
      }
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          to={{ pathname: homePath, search: location.search }}
          className="no-underline !text-white hover:!text-white"
        >
          <Brand className="!text-white" />
        </Link>

        <div className="flex items-center gap-2">
          {isUserLoggedIn ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 py-1.5 text-sm text-white sm:inline-flex">
                <span className="text-white/75">Xin chào,</span>
                <span className="max-w-[140px] truncate font-semibold">{userDisplayName}</span>
              </div>

              <Button
                type="text"
                onClick={handleLogout}
                className="!h-10 !rounded-full !border-0 !bg-white !px-4 !font-semibold !text-[#a0001b] !transition-all !duration-200 hover:!bg-[#ffe8ec]"
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="hidden sm:inline-flex">
                <Button
                  type="text"
                  className="!h-10 !rounded-full !border !border-white/30 !bg-transparent !px-4 !font-semibold !text-white !transition-all !duration-200 hover:!bg-white/15"
                >
                  Đăng nhập
                </Button>
              </Link>

              <Link to="/auth/register" className="hidden sm:inline-flex">
                <Button
                  type="text"
                  className="!h-10 !rounded-full !border-0 !bg-white !px-4 !font-semibold !text-[#900020] !transition-all !duration-200 hover:!bg-white/90"
                >
                  Đăng ký
                </Button>
              </Link>
            </>
          )}

          <Link to={{ pathname: '/cart', search: location.search }}>
            <Badge count={totalItems} size="small" offset={[-6, 6]}>
              <Button
                type="text"
                icon={<ShoppingCartOutlined />}
                className="!h-10 !rounded-full !border-0 !bg-white/15 !px-5 !font-semibold !text-white !transition-all !duration-200 hover:!-translate-y-0.5 hover:!bg-white/25 hover:!shadow-md active:!translate-y-0"
              >
                Giỏ hàng
              </Button>
            </Badge>
          </Link>
        </div>
      </div>
    </Header>
  )
}
