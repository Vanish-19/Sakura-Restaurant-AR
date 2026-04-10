import { ShoppingCartOutlined } from '@ant-design/icons'
import { Badge, Button, Layout, message } from 'antd'
import { useEffect, useRef } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import Brand from '../atoms/Brand.jsx'
import { useCart } from '../../contexts/CartContext.jsx'
import { getOrderSource } from '../../utils/orderSource.js'

const { Header } = Layout

export default function AppHeader({ variant = 'desktop' }) {
  const { totalItems } = useCart()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const orderSource = getOrderSource(searchParams)
  const homePath = orderSource.mode === 'dine-in' ? '/order' : '/'
  const scopeKeyRef = useRef(null)

  useEffect(() => {
    const currentScopeKey =
      orderSource.mode === 'dine-in'
        ? `table:${orderSource.tableCode}`
        : 'delivery'

    if (scopeKeyRef.current === null) {
      scopeKeyRef.current = currentScopeKey
      return
    }

    if (scopeKeyRef.current === currentScopeKey) {
      return
    }

    scopeKeyRef.current = currentScopeKey
    message.destroy()
    message.info(
      orderSource.mode === 'dine-in'
        ? `Đang ở ${orderSource.label}`
        : 'Đang ở chế độ mua ship về',
      1.8,
    )
  }, [orderSource.mode, orderSource.tableCode, orderSource.label])

  const headerClassName =
    variant === 'android'
      ? '!sticky !top-0 !z-50 !h-16 !bg-red-700 !px-0'
      : '!fixed !top-0 !left-0 !right-0 !z-50 !h-16 !bg-red-700 !px-0'

  return (
    <Header
      className={
        headerClassName +
        ' !bg-gradient-to-r !from-red-900 !via-red-800 !to-red-900 !shadow-sm'
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
          <div className="hidden rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white/95 sm:block">
            {orderSource.label}
          </div>

          <Link to="/auth/login" className="hidden sm:inline-flex">
            <Button
              type="text"
              className="!h-10 !rounded-full !border !border-white/30 !bg-transparent !px-4 !font-semibold !text-white !transition-all !duration-200 hover:!bg-white/15"
            >
              Login
            </Button>
          </Link>

          <Link to="/auth/register" className="hidden sm:inline-flex">
            <Button
              type="text"
              className="!h-10 !rounded-full !border-0 !bg-white !px-4 !font-semibold !text-[#900020] !transition-all !duration-200 hover:!bg-white/90"
            >
              Register
            </Button>
          </Link>

          <Link to={{ pathname: '/cart', search: location.search }}>
            <Badge count={totalItems} size="small" offset={[-6, 6]}>
              <Button
                type="text"
                icon={<ShoppingCartOutlined />}
                className="!h-10 !rounded-full !border-0 !bg-white/15 !px-5 !font-semibold !text-white !transition-all !duration-200 hover:!-translate-y-0.5 hover:!bg-white/25 hover:!shadow-md active:!translate-y-0"
              >
                Cart
              </Button>
            </Badge>
          </Link>
        </div>
      </div>
    </Header>
  )
}
