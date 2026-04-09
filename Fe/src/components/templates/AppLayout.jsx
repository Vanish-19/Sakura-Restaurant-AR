import { Layout } from 'antd'
import { Outlet, useSearchParams } from 'react-router-dom'
import AppFooter from '../organisms/AppFooter.jsx'
import AppHeader from '../organisms/AppHeader.jsx'
import AndroidFrame from './AndroidFrame.jsx'

const { Content } = Layout

export default function AppLayout() {
  const [searchParams] = useSearchParams()
  const isAndroidPreview = searchParams.get('preview') === 'android'

  const layout = (
    <Layout className={isAndroidPreview ? 'min-h-full' : 'min-h-screen'}>
      <AppHeader variant={isAndroidPreview ? 'android' : 'desktop'} />
      {isAndroidPreview ? null : <div className="h-16" />}

      <Content className="bg-[#fafaf6]">
        <Outlet />
      </Content>

      <AppFooter />
    </Layout>
  )

  return isAndroidPreview ? <AndroidFrame>{layout}</AndroidFrame> : layout
}
