import { Layout } from 'antd'
import { useEffect } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import AppFooter from '../organisms/AppFooter.jsx'
import AppHeader from '../organisms/AppHeader.jsx'
import AndroidFrame from './AndroidFrame.jsx'
import { useSiteSettings } from '../../utils/siteSettings.js'

const { Content } = Layout

export default function AppLayout() {
  const [searchParams] = useSearchParams()
  const isAndroidPreview = searchParams.get('preview') === 'android'
  const settings = useSiteSettings()

  useEffect(() => {
    if (typeof document === 'undefined') return

    const nextTitle = settings?.clientWebsiteName || 'Sakura Restaurant'
    document.title = nextTitle
    document.body.dataset.clientTheme = settings?.themePreset || 'default'

    return () => {
      delete document.body.dataset.clientTheme
    }
  }, [settings?.clientWebsiteName, settings?.themePreset])

  const layout = (
    <Layout className={isAndroidPreview ? 'client-layout-shell min-h-full !min-h-[100dvh] flex flex-col' : 'client-layout-shell min-h-screen !min-h-[100dvh] flex flex-col'}>
      <AppHeader variant={isAndroidPreview ? 'android' : 'desktop'} />
      {isAndroidPreview ? null : <div className="h-16" />}

      <Content className="client-layout-content flex-1">
        <Outlet />
      </Content>

      <AppFooter />
    </Layout>
  )

  return isAndroidPreview ? <AndroidFrame>{layout}</AndroidFrame> : layout
}
