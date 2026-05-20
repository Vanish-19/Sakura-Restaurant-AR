import {
  ApartmentOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  ShareAltOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Button, Card, Typography } from 'antd'
import useStaticPageContent from '../../hooks/useStaticPageContent.js'

const { Paragraph, Text, Title } = Typography

const pressKitPath = '/presskit'

const defaultPressKitContent = {
  hero: {
    eyebrow: 'Press Kit',
    title: 'Tài Nguyên Truyền Thông',
    subtitle: 'Kết nối di sản ẩm thực truyền thống với công nghệ AR tương lai.',
    description:
      'Bộ tài nguyên truyền thông chính thức của Sakura Restaurant dành cho báo chí, đối tác và các đơn vị truyền thông. Vui lòng tuân thủ các quy định sử dụng khi khai thác tài liệu.',
    backgroundImage: `${pressKitPath}/bgheadpress.png`,
  },
  mediaContact: {
    representative: 'Mr Phung Van',
    email: 'van.pa@tinasoft.vn',
    hotline: '+84 (0) 966 490 431',
  },
  overviewCards: [
    {
      iconKey: 'safety-certificate',
      title: 'Về Sakura Restaurant',
      text: 'Sakura là biểu tượng của sự giao thoa tinh tế giữa nghệ thuật ẩm thực Nhật Bản truyền thống và công nghệ tương tác hiện đại.',
    },
    {
      iconKey: 'calendar',
      title: 'Thành lập',
      value: '2024',
    },
    {
      iconKey: 'share-alt',
      title: 'Mô hình',
      value: 'Fine Dining & AR Experience',
    },
    {
      title: 'Công nghệ cốt lõi',
      value: 'AR Menu & Projection Mapping',
      featured: true,
    },
  ],
  logoAssets: [
    { label: 'Primary Red', brandClass: 'text-[#e0001d]', bgClass: 'bg-white', format: 'SVG' },
    { label: 'Monochrome Dark', brandClass: 'text-[#111111]', bgClass: 'bg-white', format: 'SVG' },
    { label: 'Monochrome Light', brandClass: 'text-white', bgClass: 'bg-[#101010]', format: 'SVG' },
  ],
  mediaAssets: [
    {
      title: 'Nghệ Thuật Ẩm Thực',
      text: 'Độ phân giải cao. Chụp chuẩn cho sử dụng in ấn và digital.',
      image: `${pressKitPath}/sushi.png`,
      format: 'JPG',
    },
    {
      title: 'Kiến Trúc Không Gian',
      text: 'Nội thất mang phong cách The Modern Ikikaitone.',
      image: `${pressKitPath}/canhSushi.png`,
      format: 'JPG',
    },
  ],
  usageGuides: [
    {
      iconKey: 'check-circle',
      title: 'Quyền sử dụng',
      text: 'Tất cả tài nguyên trong Press Kit này được cấp phép sử dụng cho mục đích biên tập, báo chí và truyền thông liên quan đến Sakura Restaurant.',
    },
    {
      iconKey: 'apartment',
      title: 'Tỷ lệ & Khoảng trống',
      text: 'Vui lòng không thay đổi tỷ lệ, bóp méo logo hoặc thêm các hiệu ứng không có trong bộ nhận diện chuẩn.',
    },
    {
      iconKey: 'camera',
      title: 'Ghi nhận bản quyền',
      text: 'Khi xuất bản hình ảnh, video và tài liệu, vui lòng ghi rõ nguồn: “Hình ảnh & Video: Sakura Restaurant”.',
    },
  ],
  brandAssetsSection: {
    title: 'Tài Sản Thương Hiệu',
    logoHeading: 'Logo & Định Dạng',
    logoDescription: 'Tải xuống các phiên bản logo chính thức của Sakura Restaurant.',
    mediaHeading: 'Hình Ảnh Báo Chí',
    mediaDescription: 'Tải liệu hình ảnh chất lượng cao phục vụ truyền thông và báo chí.',
    mediaActionLabel: 'Tải toàn bộ bộ ảnh',
    usageHeading: 'Hướng Dẫn Sử Dụng',
  },
  contactCta: {
    title: 'Liên Hệ Truyền Thông',
    description: 'Cần thêm thông tin, phỏng vấn hoặc yêu cầu trải nghiệm đặc biệt? Đội ngũ truyền thông của chúng tôi luôn sẵn sàng hỗ trợ.',
    actionLabel: 'Liên hệ ngay',
    backgroundImage: `${pressKitPath}/bg%20foot.png`,
  },
}

const PRESS_ICON_MAP = {
  apartment: <ApartmentOutlined />,
  calendar: <CalendarOutlined />,
  camera: <CameraOutlined />,
  'check-circle': <CheckCircleOutlined />,
  'safety-certificate': <SafetyCertificateOutlined />,
  'share-alt': <ShareAltOutlined />,
}

export default function PressKitPage() {
  const pageContent = useStaticPageContent('press-kit', defaultPressKitContent)
  const hero = pageContent.hero || defaultPressKitContent.hero
  const mediaContact = pageContent.mediaContact || defaultPressKitContent.mediaContact
  const overviewCards = pageContent.overviewCards || defaultPressKitContent.overviewCards
  const logoAssets = pageContent.logoAssets || defaultPressKitContent.logoAssets
  const mediaAssets = pageContent.mediaAssets || defaultPressKitContent.mediaAssets
  const usageGuides = pageContent.usageGuides || defaultPressKitContent.usageGuides
  const brandAssetsSection = pageContent.brandAssetsSection || defaultPressKitContent.brandAssetsSection
  const contactCta = pageContent.contactCta || defaultPressKitContent.contactCta

  return (
    <div className="bg-[#fffafa] text-[#111827]">
      <section className="relative min-h-[560px] overflow-hidden md:min-h-[640px]">
        <img
          src={hero.backgroundImage}
          alt="Không gian Sakura Restaurant"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/86 to-white/6" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#fffafa] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-5 pt-8 md:min-h-[640px] md:px-8 xl:px-10">
          <Text className="!mb-5 !block !text-sm !font-black !uppercase !tracking-[0.08em] !text-[#d8001e]">
            {hero.eyebrow}
          </Text>
          <Title level={1} className="!mb-6 !max-w-2xl !text-5xl !font-black !uppercase !leading-tight !tracking-tight !text-[#05070f] md:!text-5xl xl:!text-6xl">
            {hero.title}
          </Title>
          <Text className="!block !max-w-2xl !text-base !font-extrabold !text-slate-700 md:!text-lg">
            {hero.subtitle}
          </Text>
          <Paragraph className="!mt-10 !mb-0 !max-w-2xl !text-base !font-semibold !leading-8 !text-slate-700">
            {hero.description}
          </Paragraph>
        </div>
      </section>

      <section className="relative z-20 mx-auto mt-8 grid max-w-7xl gap-5 px-5 md:mt-10 md:grid-cols-2 md:px-8 lg:grid-cols-4 xl:px-10">
        {overviewCards.map((item) => (
          <OverviewCard key={item.title} item={item} />
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-16 xl:px-10">
        <SectionHeading title={brandAssetsSection.title} />

        <div className="mt-10">
          <Subheading marker="A." title={brandAssetsSection.logoHeading} text={brandAssetsSection.logoDescription} />
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {logoAssets.map((item) => (
              <LogoCard key={item.label} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 md:px-8 md:pb-16 xl:px-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <Subheading marker="B." title={brandAssetsSection.mediaHeading} text={brandAssetsSection.mediaDescription} />
          <Button
            type="text"
            className="!h-auto !self-start !p-0 !font-black !text-[#d8001e] hover:!bg-transparent hover:!text-[#a80018] md:!self-auto"
            icon={<ArrowRightOutlined />}
            iconPosition="end"
          >
            {brandAssetsSection.mediaActionLabel}
          </Button>
        </div>

        <div className="mt-6 grid gap-7 lg:grid-cols-2">
          {mediaAssets.map((item) => (
            <MediaCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-8 md:px-8 xl:px-10">
        <SectionHeading title={brandAssetsSection.usageHeading} />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {usageGuides.map((item) => (
            <GuideCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8 xl:px-10">
        <Card className="!overflow-hidden !rounded-xl !border-0 !bg-[#140907] !shadow-[0_22px_48px_rgba(17,24,39,0.18)]" bodyStyle={{ padding: 0 }}>
          <div className="relative">
            <img
              src={contactCta.backgroundImage}
              alt="Liên hệ truyền thông Sakura Restaurant"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/64 to-black/10" />
            <div className="relative z-10 grid gap-8 p-7 text-white md:grid-cols-[auto_1fr] md:p-10">
              <span className="grid h-24 w-24 place-items-center rounded-full bg-[#d8001e]/15 text-5xl text-[#ff1f36]">
                <MailOutlined />
              </span>
              <div>
                <Title level={2} className="!mb-3 !text-3xl !font-black !uppercase !text-white">
                  {contactCta.title}
                </Title>
                <Paragraph className="!mb-6 !max-w-xl !text-base !font-semibold !leading-7 !text-white/86">
                  {contactCta.description}
                </Paragraph>
                <Button
                  className="!h-12 !rounded-lg !border-0 !bg-[#d8001e] !px-7 !font-black !text-white hover:!bg-[#b00018]"
                  icon={<ArrowRightOutlined />}
                  iconPosition="end"
                >
                  {contactCta.actionLabel}
                </Button>
              </div>
            </div>

            <div className="relative z-10 grid border-t border-white/14 bg-black/32 text-white backdrop-blur-sm md:grid-cols-3">
              <ContactItem icon={<UserOutlined />} title="Đại diện truyền thông" text={mediaContact.representative} />
              <ContactItem icon={<MailOutlined />} title="Email" text={mediaContact.email} />
              <ContactItem icon={<PhoneOutlined />} title="Hotline (Press only)" text={mediaContact.hotline} />
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}

function OverviewCard({ item }) {
  return (
    <Card className="h-full !rounded-xl !border-[#eee3e3] !bg-white/92 !shadow-[0_16px_36px_rgba(17,24,39,0.08)] backdrop-blur" bodyStyle={{ padding: 28 }}>
      <div className={item.featured ? 'flex gap-6' : ''}>
        {item.featured ? <span className="h-24 w-2 shrink-0 rounded-full bg-[#d8001e]" /> : null}
        <div>
          {item.iconKey ? (
            <span className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-[#fff1f3] text-2xl text-[#d8001e]">
              {PRESS_ICON_MAP[item.iconKey] || <SafetyCertificateOutlined />}
            </span>
          ) : null}
          <Text className="!block !text-sm !font-black !uppercase !text-[#111827]">{item.title}</Text>
          {item.value ? (
            <Title level={3} className="!mb-0 !mt-5 !text-2xl !font-black !leading-snug !text-[#111827]">
              {item.value}
            </Title>
          ) : (
            <Paragraph className="!mb-0 !mt-5 !text-sm !font-semibold !leading-7 !text-slate-600">{item.text}</Paragraph>
          )}
        </div>
      </div>
    </Card>
  )
}

function SectionHeading({ title }) {
  return (
    <div className="text-center">
      <Title level={2} className="!mb-3 !text-3xl !font-black !uppercase !text-[#111827]">
        {title}
      </Title>
      <span className="mx-auto block h-0.5 w-10 bg-[#d8001e]" />
    </div>
  )
}

function Subheading({ marker, title, text }) {
  return (
    <div>
      <Title level={3} className="!mb-3 !text-xl !font-black !uppercase !text-[#111827]">
        <span className="text-[#d8001e]">{marker}</span> {title}
      </Title>
      <Paragraph className="!mb-0 !text-sm !font-semibold !leading-6 !text-slate-600">{text}</Paragraph>
    </div>
  )
}

function LogoCard({ item }) {
  return (
    <Card className="!overflow-hidden !rounded-lg !border-[#eee3e3] !shadow-[0_12px_30px_rgba(17,24,39,0.06)]" bodyStyle={{ padding: 0 }}>
      <div className={`${item.bgClass} flex aspect-[1.75] items-center justify-center px-8`}>
        <Text className={`!text-4xl !font-black !tracking-tight ${item.brandClass}`}>SAKURA</Text>
      </div>
      <div className={`flex items-center justify-between border-t px-5 py-4 ${item.bgClass === 'bg-[#101010]' ? 'border-white/10 bg-[#101010] text-white' : 'border-slate-100 bg-white'}`}>
        <Text className={item.bgClass === 'bg-[#101010]' ? '!font-semibold !text-white/86' : '!font-semibold !text-slate-700'}>{item.label}</Text>
        <Button type="text" className="!h-auto !p-0 !font-black !text-[#d8001e] hover:!bg-transparent hover:!text-[#a80018]" icon={<DownloadOutlined />}>
          {item.format}
        </Button>
      </div>
    </Card>
  )
}

function MediaCard({ item }) {
  return (
    <div>
      <img src={item.image} alt={item.title} className="h-[260px] w-full rounded-lg object-cover shadow-[0_12px_30px_rgba(17,24,39,0.08)]" />
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <Title level={3} className="!mb-2 !text-xl !font-black !text-[#111827]">
            {item.title}
          </Title>
          <Paragraph className="!mb-0 !text-sm !font-semibold !text-slate-600">{item.text}</Paragraph>
        </div>
        <Button type="text" className="!h-auto !p-0 !font-black !text-[#d8001e] hover:!bg-transparent hover:!text-[#a80018]" icon={<DownloadOutlined />}>
          {item.format}
        </Button>
      </div>
    </div>
  )
}

function GuideCard({ item }) {
  return (
    <Card className="h-full !rounded-xl !border-[#eee3e3] !bg-white !shadow-[0_12px_30px_rgba(17,24,39,0.06)]" bodyStyle={{ padding: 28 }}>
      <div className="flex gap-5">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#fff1f3] text-3xl text-[#d8001e]">
          {PRESS_ICON_MAP[item.iconKey] || <CheckCircleOutlined />}
        </span>
        <div>
          <Text className="!block !text-base !font-black !text-[#111827]">{item.title}</Text>
          <Paragraph className="!mb-0 !mt-3 !text-sm !font-semibold !leading-7 !text-slate-600">{item.text}</Paragraph>
        </div>
      </div>
    </Card>
  )
}

function ContactItem({ icon, title, text }) {
  return (
    <div className="flex items-center gap-5 border-white/14 px-7 py-5 md:border-r last:md:border-r-0">
      <span className="text-3xl text-[#d8001e]">{icon}</span>
      <div>
        <Text className="!block !text-sm !font-black !uppercase !text-white">{title}</Text>
        <Text className="!mt-1 !block !text-base !font-semibold !text-white/86">{text}</Text>
      </div>
    </div>
  )
}
