import { ShoppingCartOutlined } from '@ant-design/icons'
import { Badge, Button, Layout, message } from 'antd'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Brand from '../atoms/Brand.jsx'
import { userLogout } from '../../services/authApi.js'
import { useCart } from '../../contexts/CartContext.jsx'
import { clearUserSession, getUserProfile } from '../../utils/authSession.js'
import { getOrderSource } from '../../utils/orderSource.js'
import useStaticPageContent from '../../hooks/useStaticPageContent.js'

const { Header } = Layout
const emptyLayoutContent = {}

export default function AppHeader({ variant = 'desktop' }) {
  const { t } = useTranslation()
  const layoutContent = useStaticPageContent('site-layout', emptyLayoutContent)
  const headerContent = layoutContent.header || {}
  const headerActions = headerContent.actions || {}
  const { totalItems, clearAllCarts } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderSource = getOrderSource(searchParams)
  const userProfile = getUserProfile()
  const userDisplayName =
    userProfile?.name ||
    userProfile?.email ||
    userProfile?.phone ||
    ''
  const isUserLoggedIn = Boolean(userDisplayName)
  const homePath = orderSource.mode === 'dine-in' ? '/order' : '/'
  const scopeKeyRef = useRef(null)
  const defaultNavItems = [
    { key: 'home', label: t('navigation.home'), to: homePath, match: ['/', '/order'] },
    { key: 'about', label: t('navigation.about'), to: '/about', match: ['/about'] },
    { key: 'blog', label: t('navigation.blog'), to: '/blog', match: ['/blog'] },
    { key: 'contact', label: t('navigation.contact'), to: '/contact', match: ['/contact'] },
  ]
  const navItems = headerContent.navItems?.length ? headerContent.navItems : defaultNavItems
  const resolvedNavItems = navItems.map((item) => ({
    ...item,
    label: item.key ? t(`navigation.${item.key}`, { defaultValue: item.label }) : item.label,
    to: item.key === 'home' && orderSource.mode === 'dine-in' ? homePath : item.to,
    match: Array.isArray(item.match) ? item.match : [item.to],
  }))

  const handleLogout = async () => {
    try {
      await userLogout()
    } catch {
      // ignore API failures and clear client session anyway
    }

    clearUserSession()
    clearAllCarts()
    message.success(t('auth.logoutSuccess', { defaultValue: 'Đăng xuất thành công' }))
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
        ? `${headerActions.dineInNoticePrefix || 'Đang ở'} ${orderSource.label}`
        : orderSource.mode === 'delivery'
          ? headerActions.deliveryNotice || 'Đang ở chế độ giao tận nơi'
          : orderSource.mode === 'pending-table'
            ? headerActions.pendingTableNotice || 'Vui lòng chọn bàn để tiếp tục'
            : headerActions.serviceModeNotice || 'Vui lòng chọn hình thức phục vụ'
    message.info(notice, 1.8)
  }, [headerActions.deliveryNotice, headerActions.dineInNoticePrefix, headerActions.pendingTableNotice, headerActions.serviceModeNotice, orderSource.mode, orderSource.tableCode, orderSource.label])

  const headerClassName =
    variant === 'android'
      ? '!sticky !top-0 !z-50 !h-16 !bg-white/95 !px-0 backdrop-blur'
      : '!fixed !top-0 !left-0 !right-0 !z-50 !h-16 !bg-white/95 !px-0 backdrop-blur'

  const isActiveRoute = (matches) =>
    matches.some((route) => location.pathname === route)

  return (
    <Header className={headerClassName + ' !border-b !border-[#ece7dc] !shadow-sm'}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4 lg:gap-6">
        <Link
          to={{ pathname: homePath, search: location.search }}
          className="min-w-0 shrink no-underline"
        >
          <Brand className="text-[#b10b22]" name={headerContent.brandName} tagline={headerContent.tagline} />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-700 lg:flex">
          {resolvedNavItems.map((item) => (
            <Link
              key={item.key}
              to={{ pathname: item.to, search: location.search }}
              className={`header-nav__link ${isActiveRoute(item.match) ? 'header-nav__link--active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          {isUserLoggedIn ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 md:inline-flex">
                <span className="text-slate-400">{t('common.greeting', { defaultValue: headerActions.greeting || 'Xin chào,' })}</span>
                <span className="max-w-[140px] truncate font-semibold text-slate-800">{userDisplayName}</span>
              </div>

              <Button
                type="text"
                onClick={handleLogout}
                className="!h-9 !rounded-full !border !border-red-200 !bg-white !px-4 !font-semibold !text-[#b10b22] !transition-all !duration-300 !ease-out hover:!-translate-y-0.5 hover:!border-[#c6001e] hover:!bg-[#fff1f3] hover:!text-[#b10b22] hover:!shadow-[0_10px_22px_rgba(177,11,34,0.12)] active:!translate-y-0"
              >
                {t('common.logout', { defaultValue: headerActions.logout || 'Đăng xuất' })}
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="inline-flex">
                <Button
                  type="text"
                  className="!h-8 !rounded-full !border !border-slate-200 !bg-white !px-2.5 !text-[11px] !font-semibold !text-slate-700 !transition-all !duration-300 !ease-out hover:!-translate-y-0.5 hover:!border-[#c6001e] hover:!bg-[#fff1f3] hover:!text-[#b10b22] hover:!shadow-[0_10px_22px_rgba(177,11,34,0.12)] active:!translate-y-0 sm:!h-9 sm:!px-4 sm:!text-sm"
                >
                  {t('common.login', { defaultValue: headerActions.login || 'Đăng nhập' })}
                </Button>
              </Link>

              <Link to="/auth/register" className="inline-flex">
                <Button
                  type="text"
                  className="!h-8 !rounded-full !border-0 !bg-[#8B0000] !px-2.5 !text-[11px] !font-semibold !text-white !shadow-[0_8px_18px_rgba(139,0,0,0.18)] !transition-all !duration-300 !ease-out hover:!-translate-y-0.5 hover:!bg-[#700000] hover:!shadow-[0_14px_28px_rgba(139,0,0,0.28)] active:!translate-y-0 sm:!h-9 sm:!px-4 sm:!text-sm"
                >
                  {t('common.register', { defaultValue: headerActions.register || 'Đăng ký' })}
                </Button>
              </Link>
            </>
          )}

          <Link to={{ pathname: '/cart', search: location.search }}>
            <Badge count={totalItems} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                icon={<ShoppingCartOutlined />}
                className="!h-9 !w-9 !min-w-9 !rounded-full !border !border-slate-200 !bg-white !p-0 !text-slate-700 !transition-all !duration-300 !ease-out hover:!-translate-y-0.5 hover:!border-[#c6001e] hover:!bg-[#fff1f3] hover:!text-[#b10b22] hover:!shadow-[0_10px_22px_rgba(177,11,34,0.12)] active:!translate-y-0"
              />
            </Badge>
          </Link>
        </div>
      </div>
    </Header>
  )
}
