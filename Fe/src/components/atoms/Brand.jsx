import { RestOutlined } from '@ant-design/icons'
import { useSiteSettings } from '../../utils/siteSettings.js'

export default function Brand({ className = '', name, tagline }) {
  const settings = useSiteSettings()
  const clientWebsiteName = name || settings?.clientWebsiteName || 'Sakura Restaurant'
  const clientTagline = tagline || settings?.clientTagline || 'Premium Japanese AR Dining'

  return (
    <div className={['flex min-w-0 items-center gap-2 sm:gap-3', className].join(' ')}>
      <RestOutlined className="shrink-0 -rotate-12 text-xl sm:text-2xl" />
      <div className="min-w-0 leading-tight">
        <div className="max-w-[120px] truncate text-sm font-semibold tracking-wide font-[var(--font-heading)] sm:max-w-none sm:text-lg">
          {clientWebsiteName}
        </div>
        <div className="hidden max-w-[240px] truncate text-xs opacity-90 font-[var(--font-jp)] sm:block" title={clientTagline}>
          {clientTagline}
        </div>
      </div>
    </div>
  )
}
