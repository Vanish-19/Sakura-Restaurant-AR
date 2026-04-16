import { RestOutlined } from '@ant-design/icons'
import { useSiteSettings } from '../../utils/siteSettings.js'

export default function Brand({ className = '' }) {
  const settings = useSiteSettings()
  const clientWebsiteName = settings?.clientWebsiteName || 'Sakura Restaurant'
  const clientTagline = settings?.clientTagline || 'Premium Japanese AR Dining'

  return (
    <div className={['flex items-center gap-3', className].join(' ')}>
      <RestOutlined className="text-2xl -rotate-12" />
      <div className="leading-tight">
        <div className="text-lg font-semibold tracking-wide font-[var(--font-heading)]">
          {clientWebsiteName}
        </div>
        <div className="text-xs opacity-90 font-[var(--font-jp)] truncate max-w-[240px]" title={clientTagline}>
          {clientTagline}
        </div>
      </div>
    </div>
  )
}
