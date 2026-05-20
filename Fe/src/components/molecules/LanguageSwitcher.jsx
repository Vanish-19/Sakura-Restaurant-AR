import { GlobalOutlined } from '@ant-design/icons'
import { Button, Dropdown } from 'antd'
import flagJp from 'flag-icons/flags/4x3/jp.svg'
import flagUs from 'flag-icons/flags/4x3/us.svg'
import flagVn from 'flag-icons/flags/4x3/vn.svg'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

const languages = [
  { key: 'vi', nameKey: 'common.vietnamese', flagSrc: flagVn },
  { key: 'jpn', nameKey: 'common.japanese', flagSrc: flagJp },
  { key: 'en', nameKey: 'common.english', flagSrc: flagUs },
]

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const activeLanguage = i18n.resolvedLanguage || i18n.language || 'vi'
  const activeItem = languages.find((item) => item.key === activeLanguage) || languages[0]
  const isStandalonePage =
    location.pathname.startsWith('/auth') ||
    location.pathname === '/admin/login' ||
    location.pathname === '/ar'

  const items = languages.map((item) => ({
    key: item.key,
    label: (
      <span className="flex min-w-[120px] items-center gap-3 font-semibold">
        <img src={item.flagSrc} alt="" className="h-4 w-6 rounded-sm object-cover shadow-sm" />
        <span className="text-xs font-medium text-slate-500">{t(item.nameKey)}</span>
      </span>
    ),
  }))

  return (
    <div className={`fixed right-4 z-[1001] ${isStandalonePage ? 'top-4' : 'top-20'}`}>
      <Dropdown
        menu={{
          items,
          selectable: true,
          selectedKeys: [activeItem.key],
          onClick: ({ key }) => i18n.changeLanguage(key),
        }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button
          type="default"
          icon={<GlobalOutlined />}
          className="!h-10 !rounded-full !border-[#eadede] !bg-white/95 !px-4 !font-extrabold !text-[#8B0000] !shadow-[0_10px_24px_rgba(17,24,39,0.10)] backdrop-blur hover:!border-[#d8001e] hover:!text-[#d8001e]"
        >
          <img src={activeItem.flagSrc} alt={t(activeItem.nameKey)} className="h-4 w-6 rounded-sm object-cover shadow-sm" />
        </Button>
      </Dropdown>
    </div>
  )
}
