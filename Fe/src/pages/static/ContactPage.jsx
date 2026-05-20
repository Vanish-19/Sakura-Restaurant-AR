import {
  ArrowRightOutlined,
  BookOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  MailOutlined,
  PhoneOutlined,
  WifiOutlined,
} from '@ant-design/icons'
import { Button, Card, Form, Input, Select, Typography, message } from 'antd'
import useStaticPageContent from '../../hooks/useStaticPageContent.js'

const { Paragraph, Text, Title } = Typography

const defaultContactContent = {
  hero: {
    title: 'Liên Hệ & Đặt Bàn',
    subtitle: 'Kết Nối Với Không Gian Ẩm Thực Tương Lai',
    description:
      'Tại Sakura, chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Dù bạn có thắc mắc, cần đặt bàn hay muốn hợp tác, hãy liên hệ với chúng tôi qua các kênh dưới đây.',
    backgroundImage: '/bgheadContact.png',
  },
  contactSection: {
    title: 'Thông Tin Liên Hệ',
    items: [
      {
        iconKey: 'environment',
        title: 'Địa Chỉ',
        lines: [
          'Phong thí nghiệm AR/VR, Tầng 3, Toà nhà A',
          'Học viện Công nghệ Bưu chính Viễn thông (PTIT)',
          'Hà Nội, Việt Nam',
        ],
        action: 'Xem trên bản đồ',
      },
      {
        iconKey: 'phone',
        title: 'Hotline (24/7)',
        lines: ['1900 xxxx', '(+84) 28 1234 5678'],
      },
      {
        iconKey: 'mail',
        title: 'Email',
        lines: ['Chăm sóc khách hàng: cskh@sakura-ar.vn', 'Đối tác & truyền thông: partner@sakura-ar.vn'],
      },
      {
        iconKey: 'clock-circle',
        title: 'Giờ Phục Vụ',
        lines: ['10:00 Sáng - 10:00 Tối', 'Lưu ý: Bếp nhận order cuối cùng vào lúc 9:30 Tối'],
      },
    ],
  },
  supportCard: {
    title: 'Trải nghiệm AR của bạn gặp trục trặc?',
    description: 'Đội ngũ kỹ thuật của chúng tôi luôn sẵn sàng hỗ trợ bạn nhanh chóng.',
    actionLabel: 'Hỗ trợ kỹ thuật AR',
    backgroundImage: '/bgBody.png',
  },
  contactForm: {
    title: 'Gửi Thông Điệp Cho Chúng Tôi',
    submitLabel: 'Gửi Yêu Cầu Của Bạn',
    successMessage: 'Cảm ơn bạn. Sakura Restaurant sẽ liên hệ lại trong thời gian sớm nhất.',
    fields: {
      name: {
        label: 'Họ Và Tên *',
        placeholder: 'Nhập họ và tên của bạn',
        requiredMessage: 'Vui lòng nhập họ tên',
      },
      phone: {
        label: 'Số Điện Thoại *',
        placeholder: 'Nhập số điện thoại của bạn',
        requiredMessage: 'Vui lòng nhập số điện thoại',
      },
      email: {
        label: 'Email *',
        placeholder: 'Nhập email của bạn',
        requiredMessage: 'Vui lòng nhập email',
        invalidMessage: 'Email không hợp lệ',
      },
      purpose: {
        label: 'Mục Đích Liên Hệ *',
        placeholder: 'Chọn mục đích liên hệ',
        requiredMessage: 'Vui lòng chọn mục đích liên hệ',
      },
      guests: {
        label: 'Số Lượng Khách (Nếu đặt bàn)',
        placeholder: 'Nhập số lượng khách',
      },
      message: {
        label: 'Yêu Cầu Đặc Biệt / Tin Nhắn',
        placeholder: 'Hãy cho chúng tôi biết thêm yêu cầu đặc biệt về vị trí ngồi, chế độ ăn, hoặc hỗ trợ kỹ thuật AR...',
      },
    },
    purposeOptions: [
      { value: 'booking', label: 'Đặt bàn' },
      { value: 'support', label: 'Hỗ trợ trải nghiệm AR' },
      { value: 'partner', label: 'Hợp tác đối tác' },
      { value: 'other', label: 'Khác' },
    ],
  },
  serviceCards: [
    {
      iconKey: 'wifi',
      title: 'Kết nối Wifi',
      text: 'Đảm bảo thiết bị của bạn được kết nối với mạng "Sakura_AR_Guest" để tối ưu hoá tốc độ tải mô hình 3D.',
      action: null,
    },
    {
      iconKey: 'book',
      title: 'Hướng dẫn sử dụng',
      text: 'Xem nhanh hướng dẫn tương tác AR để biết cách quét mã và xem món ăn chi tiết.',
      action: 'Xem hướng dẫn',
    },
    {
      iconKey: 'heart',
      title: 'Hỗ trợ trực tiếp',
      text: 'Vui lòng thông báo cho nhân viên phục vụ tại bàn hoặc gọi Hotline để đội ngũ kỹ thuật hỗ trợ ngay lập tức.',
      action: null,
    },
  ],
}

const CONTACT_ICON_MAP = {
  environment: <EnvironmentOutlined />,
  phone: <PhoneOutlined />,
  mail: <MailOutlined />,
  'clock-circle': <ClockCircleOutlined />,
  wifi: <WifiOutlined />,
  book: <BookOutlined />,
  heart: <HeartOutlined />,
}

export default function ContactPage() {
  const [form] = Form.useForm()
  const pageContent = useStaticPageContent('contact', defaultContactContent)
  const hero = pageContent.hero || defaultContactContent.hero
  const contactSection = pageContent.contactSection || defaultContactContent.contactSection
  const supportCard = pageContent.supportCard || defaultContactContent.supportCard
  const contactForm = pageContent.contactForm || defaultContactContent.contactForm
  const serviceCards = pageContent.serviceCards || defaultContactContent.serviceCards
  const contactFields = contactForm.fields || defaultContactContent.contactForm.fields
  const getContactField = (key) => ({
    ...(defaultContactContent.contactForm.fields[key] || {}),
    ...(contactFields[key] || {}),
  })

  const handleSubmit = () => {
    message.success(contactForm.successMessage || defaultContactContent.contactForm.successMessage)
    form.resetFields()
  }

  return (
    <div className="bg-[#fffafa] text-[#1C1C1E]">
      <section className="relative min-h-[560px] overflow-hidden bg-white md:min-h-[640px] xl:min-h-[700px]">
        <div
          className="absolute inset-x-0 top-0 h-full overflow-hidden"
          style={{
            clipPath:
              'polygon(0 0, 100% 0, 100% 88%, 92% 84%, 84% 80.5%, 76% 77.5%, 68% 75.5%, 60% 74.2%, 50% 73.8%, 40% 74.2%, 32% 75.5%, 24% 77.5%, 16% 80.5%, 8% 84%, 0 88%)',
          }}
        >
          <img
            src={hero.backgroundImage}
            alt="Không gian liên hệ Sakura Restaurant"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-zinc-200/62" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/24 via-white/48 to-white/68" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[500px] max-w-7xl items-center justify-center px-5 pb-24 pt-10 text-center sm:px-8 md:min-h-[570px] md:pb-28 xl:min-h-[620px] xl:px-10">
          <div className="max-w-3xl">
            <Title level={1} className="!mb-3 !text-4xl !font-extrabold !tracking-tight !text-slate-950 md:!text-5xl xl:!text-6xl">
              {hero.title}
            </Title>
            <div className="mx-auto mb-5 h-1 w-16 rounded-full bg-[#8B0000]" />
            <Text className="!block !text-base !font-bold !text-slate-900 md:!text-lg">
              {hero.subtitle}
            </Text>
            <Paragraph className="!mx-auto !mt-4 !mb-0 !max-w-2xl !text-sm !font-medium !leading-7 !text-slate-700 md:!text-base">
              {hero.description}
            </Paragraph>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#fffafa] px-5 py-14 sm:px-8 md:py-16 xl:px-10">

        <div className="relative z-10 mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.35fr] xl:gap-16">
          <div>
            <div className="mb-7">
              <Text className="!text-sm !font-extrabold !text-[#1C1C1E]">
                Thông Tin Liên Hệ
              </Text>
              <div className="mt-2 h-0.5 w-11 rounded-full bg-[#8B0000]" />
            </div>

            <div className="space-y-4">
              {contactItems.map((item) => (
                <Card
                  key={item.title}
                  className="!rounded-xl !border !border-[#f1e5e5] !bg-white/88 !shadow-[0_12px_28px_rgba(17,24,39,0.05)] backdrop-blur-sm"
                  bodyStyle={{ padding: 20 }}
                >
                  <div className="flex gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fff1f3] text-lg text-[#d8001e]">
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <Text className="!block !font-extrabold !text-slate-950">
                        {item.title}
                      </Text>
                      <div className="mt-2 space-y-1">
                        {item.lines.map((line) => (
                          <Paragraph key={line} className="!mb-0 !text-xs !leading-5 !text-slate-600 md:!text-sm">
                            {line}
                          </Paragraph>
                        ))}
                      </div>
                      {item.action ? (
                        <Button
                          size="small"
                          className="!mt-3 !h-8 !rounded-full !border-[#f0c8ce] !bg-white !px-3 !text-xs !font-bold !text-[#8B0000] hover:!border-[#c6001e] hover:!bg-[#fff1f3]"
                        >
                          {item.action} <ArrowRightOutlined />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </Card>
              ))}

              <Card
                className="!overflow-hidden !rounded-xl !border !border-[#f1e5e5] !bg-white/88 !shadow-[0_12px_28px_rgba(17,24,39,0.05)]"
                bodyStyle={{ padding: 0 }}
              >
                <div className="relative min-h-[150px] p-6">
                  <img
                    src="/bgBody.png"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover object-right opacity-70"
                  />
                  <div className="absolute inset-0 bg-white/50" />
                  <div className="relative z-10 max-w-[260px]">
                    <Text className="!block !text-base !font-extrabold !text-slate-950">
                      Trải nghiệm AR của bạn gặp trục trặc?
                    </Text>
                    <Paragraph className="!mt-2 !mb-4 !text-xs !leading-5 !text-slate-700">
                      Đội ngũ kỹ thuật của chúng tôi luôn sẵn sàng hỗ trợ bạn nhanh chóng.
                    </Paragraph>
                    <Button className="!h-9 !rounded-full !border-0 !bg-[#8B0000] !px-4 !text-xs !font-bold !text-white hover:!bg-[#700000]">
                      Hỗ trợ kỹ thuật AR
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Card className="!rounded-xl !border !border-[#f1e5e5] !bg-white/90 !shadow-[0_18px_42px_rgba(17,24,39,0.07)] backdrop-blur-sm" bodyStyle={{ padding: 28 }}>
            <div className="mb-7">
              <Text className="!text-sm !font-extrabold !text-[#1C1C1E]">
                Gửi Thông Điệp Cho Chúng Tôi
              </Text>
              <div className="mt-2 h-0.5 w-11 rounded-full bg-[#8B0000]" />
            </div>

            <Form form={form} layout="vertical" onFinish={handleSubmit} className="contact-form">
              <Form.Item label={getContactField('name').label} name="name" rules={[{ required: true, message: getContactField('name').requiredMessage }]}>
                <Input placeholder={getContactField('name').placeholder} />
              </Form.Item>

              <Form.Item label={getContactField('phone').label} name="phone" rules={[{ required: true, message: getContactField('phone').requiredMessage }]}>
                <Input placeholder={getContactField('phone').placeholder} />
              </Form.Item>

              <Form.Item label={getContactField('email').label} name="email" rules={[{ required: true, message: getContactField('email').requiredMessage }, { type: 'email', message: getContactField('email').invalidMessage }]}>
                <Input placeholder={getContactField('email').placeholder} />
              </Form.Item>

              <Form.Item label={getContactField('purpose').label} name="purpose" rules={[{ required: true, message: getContactField('purpose').requiredMessage }]}>
                <Select
                  placeholder={getContactField('purpose').placeholder}
                  options={contactForm.purposeOptions}
                />
              </Form.Item>

              <Form.Item label={getContactField('guests').label} name="guests">
                <Input placeholder={getContactField('guests').placeholder} />
              </Form.Item>

              <Form.Item label={getContactField('message').label} name="message">
                <Input.TextArea rows={5} placeholder={getContactField('message').placeholder} />
              </Form.Item>

              <Button
                htmlType="submit"
                type="primary"
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                className="!h-11 !rounded-lg !border-0 !bg-[#8B0000] !px-6 !font-bold !text-white !shadow-[0_10px_22px_rgba(139,0,0,0.20)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!bg-[#700000] hover:!shadow-[0_14px_28px_rgba(139,0,0,0.30)]"
              >
                {contactForm.submitLabel || defaultContactContent.contactForm.submitLabel}
              </Button>
            </Form>
          </Card>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#fffafa] px-5 py-10 sm:px-8 xl:px-10">
        <div className="relative z-10 mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {serviceCards.map((item) => (
            <Card key={item.title} className="!rounded-xl !border !border-[#f1e5e5] !bg-white/90 !shadow-[0_12px_28px_rgba(17,24,39,0.05)]" bodyStyle={{ padding: 24 }}>
              <div className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fff1f3] text-lg text-[#d8001e]">
                  {item.icon}
                </span>
                <div>
                  <Text className="!block !font-extrabold !text-slate-950">{item.title}</Text>
                  <Paragraph className="!mb-0 !mt-2 !text-xs !leading-6 !text-slate-600">
                    {item.text}
                  </Paragraph>
                  {item.action ? (
                    <Button type="link" className="!mt-2 !h-auto !p-0 !text-xs !font-bold !text-[#8B0000] hover:!text-[#700000]">
                      {item.action} <ArrowRightOutlined />
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
