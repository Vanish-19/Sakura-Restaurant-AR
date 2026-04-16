import { Layout } from 'antd'
import { useSiteSettings } from '../../utils/siteSettings.js'

const { Footer } = Layout

export default function AppFooter() {
  const settings = useSiteSettings()
  const footerPrimary =
    settings?.footerPrimary ||
    '© 2026 Sakura Restaurant. Experience Japanese cuisine in AR/VR.'
  const footerSecondary =
    settings?.footerSecondary ||
    'さくらレストラン - AR/VRで日本料理を体験'

  return (
    <Footer className="client-footer !mt-auto !py-5 !text-center">
      <div className="text-[15px] leading-6">
        {footerPrimary}
      </div>
      <div className="mt-1.5 text-xs leading-5 font-[var(--font-jp)] client-footer-secondary">
        {footerSecondary}
      </div>
    </Footer>
  )
}
