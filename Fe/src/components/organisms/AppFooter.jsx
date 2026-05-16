import {
  ApiOutlined,
  FacebookFilled,
  GiftOutlined,
  HeartOutlined,
  InstagramOutlined,
  RestOutlined,
  SafetyCertificateOutlined,
  TikTokOutlined,
  YoutubeFilled,
} from '@ant-design/icons'
import { Button, Input, Layout, Typography } from 'antd'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../../utils/siteSettings.js'

const { Footer } = Layout
const { Paragraph, Text } = Typography

const socialLinks = [
  { label: 'Facebook', icon: <FacebookFilled />, href: '#' },
  { label: 'Instagram', icon: <InstagramOutlined />, href: '#' },
  { label: 'YouTube', icon: <YoutubeFilled />, href: '#' },
  { label: 'TikTok', icon: <TikTokOutlined />, href: '#' },
  { label: 'Reviews', icon: <RestOutlined />, href: '#' },
]

const highlights = [
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Tinh hoa ẩm thực Nhật',
    text: 'Nguyên liệu tươi ngon chuẩn Nhật',
  },
  {
    icon: <ApiOutlined />,
    title: 'Công nghệ AR độc đáo',
    text: 'Trải nghiệm ẩm thực sống động',
  },
  {
    icon: <GiftOutlined />,
    title: 'Không gian tinh tế',
    text: 'Thiết kế mang đậm bản sắc Nhật Bản',
  },
  {
    icon: <HeartOutlined />,
    title: 'Dịch vụ tận tâm',
    text: 'Đội ngũ chuyên nghiệp, phục vụ bằng cả trái tim',
  },
]

const footerLinks = [
  { label: 'Privacy Policy', to: '/privacy&policy' },
  { label: 'Terms Of Service', to: '/term&service' },
  { label: 'Careers', to: '/career' },
  { label: 'Press Kit', to: '/press-kit' },
]

export default function AppFooter() {
  const settings = useSiteSettings()
  const clientWebsiteName = settings?.clientWebsiteName || 'Sakura Restaurant'
  const clientTagline = settings?.clientTagline || 'Premium Japanese AR Dining'
  const footerPrimary =
    settings?.footerPrimary ||
    '© 2026 Sakura Restaurant. Experience Japanese cuisine in AR/VR.'
  const footerSecondary =
    settings?.footerSecondary ||
    'さくらレストラン - AR/VRで体験する日本の食文化'

  return (
    <Footer className="!mt-auto !w-full !bg-white !px-0 !py-0">
      <div className="relative w-full overflow-hidden border-t border-[#f0e7e7] bg-white shadow-[0_-6px_28px_rgba(17,24,39,0.04)]">
        <img
          src="/bgfooter.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/22" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/16 via-white/24 to-white/38" />

        <div className="relative z-10 mx-auto grid w-full max-w-[1680px] gap-10 px-6 py-12 md:grid-cols-[1.1fr_1.25fr_1.15fr] md:px-14 xl:px-20 2xl:px-28">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 no-underline">
              <span className="grid h-11 w-11 place-items-center rounded-md text-3xl text-[#e0001d]">
                <RestOutlined className="-rotate-12" />
              </span>
              <span>
                <Text className="!block font-[var(--font-heading)] !text-3xl !font-extrabold !leading-none !text-[#d8001e]">
                  {clientWebsiteName}
                </Text>
                <Text className="!mt-2 !block !text-sm !font-medium !text-[#7b6f6f]">
                  {clientTagline}
                </Text>
              </span>
            </Link>
          </div>

          <Paragraph className="!mb-0 !max-w-md !text-sm !font-medium !leading-7 !text-[#4A4A4A]">
            Sakura Restaurant kết hợp tinh hoa ẩm thực Nhật Bản với công nghệ AR hiện đại, mang đến trải nghiệm ẩm thực sống động và đáng nhớ.
          </Paragraph>

          <div>
            <Text className="!block !text-sm !font-extrabold !uppercase !tracking-[0.08em] !text-[#1C1C1E]">
              Đăng ký nhận tin
            </Text>
            <Paragraph className="!mb-4 !mt-2 !text-sm !leading-6 !text-[#6f6666]">
              Nhận thông tin mới nhất về ưu đãi và sự kiện
            </Paragraph>
            <div className="footer-newsletter flex max-w-[500px] flex-col gap-3 rounded-[28px] border border-[#eadede] bg-white/88 p-2 shadow-[0_12px_28px_rgba(144,0,32,0.08)] backdrop-blur-sm sm:flex-row sm:items-center sm:rounded-full">
              <Input
                placeholder="Nhập email của bạn"
                className="footer-newsletter__input !h-12 !min-w-0 !flex-1 !rounded-full !border-0 !bg-transparent !px-5 !text-sm !shadow-none placeholder:!text-[#b8adad]"
              />
              <Button className="!h-12 !shrink-0 !rounded-full !border-0 !bg-[#8B0000] !px-8 !font-bold !text-white !shadow-[0_10px_22px_rgba(139,0,0,0.20)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!bg-[#700000] hover:!shadow-[0_14px_28px_rgba(139,0,0,0.30)]">
                Đăng ký
              </Button>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto h-px w-[calc(100%-3rem)] max-w-[1680px] bg-[#eee3e3]/90 md:w-[calc(100%-7rem)] xl:w-[calc(100%-10rem)] 2xl:w-[calc(100%-14rem)]" />

        <div className="relative z-10 mx-auto grid w-full max-w-[1680px] gap-8 px-6 py-10 md:grid-cols-[1fr_2.8fr] md:px-14 xl:px-20 2xl:px-28">
          <div>
            <Text className="!block !text-sm !font-extrabold !uppercase !tracking-[0.08em] !text-[#d8001e]">
              Kết nối với chúng tôi
            </Text>
            <div className="mt-5 flex flex-wrap gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-[#eee3e3] bg-white text-[#1C1C1E] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c6001e] hover:bg-[#fff1f3] hover:text-[#900020] hover:shadow-[0_10px_22px_rgba(144,0,32,0.12)]"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => (
              <div key={item.title} className="text-center">
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-full text-3xl text-[#e0001d]">
                  {item.icon}
                </span>
                <Text className="!mt-3 !block !text-sm !font-extrabold !text-[#1C1C1E]">
                  {item.title}
                </Text>
                <Paragraph className="!mx-auto !mb-0 !mt-1 !max-w-[170px] !text-xs !leading-5 !text-[#6f6666]">
                  {item.text}
                </Paragraph>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 overflow-hidden border-t border-[#eee3e3]/90 px-6 py-8 text-center md:px-10">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[url('/patterns/sakura-wagara.svg')] bg-[length:180px_180px] bg-bottom opacity-[0.08]" />
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-3">
            {footerLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#d8001e] no-underline transition-colors duration-300 hover:text-[#8B0000]"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Text className="relative z-10 !mt-6 !block !text-xs !font-semibold !uppercase !tracking-[0.18em] !text-[#9b9292]">
            {footerPrimary}
          </Text>
          <Text className="relative z-10 !mt-2 !block font-[var(--font-jp)] !text-xs !tracking-[0.08em] !text-[#b2a8a8]">
            {footerSecondary}
          </Text>
        </div>
      </div>
    </Footer>
  )
}
