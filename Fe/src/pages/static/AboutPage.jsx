import {
  CustomerServiceOutlined,
  HeartOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ScanOutlined,
} from '@ant-design/icons'
import { Card, Col, Row, Typography } from 'antd'
import useStaticPageContent from '../../hooks/useStaticPageContent.js'

const { Paragraph, Text, Title } = Typography

const valueIcons = {
  safety: <SafetyCertificateOutlined />,
  rocket: <RocketOutlined />,
  heart: <HeartOutlined />,
  service: <CustomerServiceOutlined />,
}

const defaultAboutContent = {
  hero: {
    title: 'Về Chúng Tôi -',
    accent: 'Sakura Restaurant',
    subtitle: 'Nơi Giao Thoa Giữa Di Sản Ẩm Thực Truyền Thống Và Công Nghệ Tương Lai',
    backgroundImage: '/about1.png',
  },
  story: {
    eyebrow: 'Câu chuyện thương hiệu',
    title: 'Khởi Nguồn Của Một Trải Nghiệm Khác Biệt',
    quote:
      '"Ẩm thực Nhật Bản là nghệ thuật của sự tĩnh lặng và tinh tế. Nhưng làm thế nào để thực khách có thể chạm vào nghệ thuật ấy ngay cả trước khi nếm thử?"',
    paragraphs: [
      'Đó là trăn trở nuôi dưỡng sự ra đời của Sakura Restaurant. Chúng tôi trân trọng một bữa ăn hoàn hảo không chỉ dừng lại ở hương vị đánh thức vị giác, mà phải là một cuộc hành trình trọn vẹn của mọi giác quan.',
      'Ra đời với khát vọng mang tinh hoa ẩm thực xứ Phù Tang đến gần hơn với thực khách Việt, Sakura Restaurant tự hào là một trong những nhà hàng tiên phong ứng dụng Công nghệ Thực tế Tăng cường (AR - Augmented Reality) vào không gian ẩm thực cao cấp.',
      'Đến với Sakura, bạn không chỉ đang gọi một món ăn, bạn đang mở ra một câu chuyện sống động trên chính chiếc bàn của mình.',
    ],
    image: '/about2.png',
    imageAlt: 'Phòng ăn phong cách Nhật với trải nghiệm AR',
    cardTitle: 'AR Preview Menu',
    cardText: 'Scan to view dishes in 3D',
  },
  visionMission: {
    title: 'Tầm Nhìn & Sứ Mệnh',
    subtitle: 'Định hướng tương lai của ẩm thực trải nghiệm.',
    visionTitle: 'Tầm nhìn',
    visionText:
      'Trở thành biểu tượng của sự đổi mới trong ngành F&B, nơi định nghĩa lại cách thực khách tương tác và thưởng thức ẩm thực Nhật Bản cao cấp.',
    missionTitle: 'Sứ mệnh',
    missionText:
      'Giao thoa hoàn hảo giữa kỹ thuật chế biến thủ công truyền thống và công nghệ hiện đại, mang đến những bữa ăn không chỉ chuẩn vị, an toàn mà còn mang lại sự ngạc nhiên và niềm vui.',
  },
  valuesSection: {
    eyebrow: 'Giá trị cốt lõi',
    title: 'Bốn Giá Trị Định Hình Sakura',
    items: [
      {
        icon: 'safety',
        title: 'Chất Lượng Nguyên Bản',
        text: 'Sự tươi mới khắt khe. Chúng tôi tôn trọng triết lý shun để mỗi lát sashimi, chén miso và phần cơm đều giữ trọn tinh thần Nhật Bản.',
      },
      {
        icon: 'rocket',
        title: 'Sáng Tạo Đột Phá',
        text: 'Công nghệ AR luôn đi cùng trải nghiệm ẩm thực, giúp thực khách khám phá món ăn từ hình dáng, kết cấu đến câu chuyện phía sau.',
      },
      {
        icon: 'heart',
        title: 'Tinh Thần Omotenashi',
        text: 'Lòng hiếu khách Nhật Bản xuất hiện trong từng lời chào, từng chi tiết nhỏ và cảm giác được chăm sóc trọn vẹn tại bàn ăn.',
      },
      {
        icon: 'service',
        title: 'Không Gian Tĩnh Tại',
        text: 'Phong cách Zen, ánh sáng dịu và chất liệu tự nhiên tạo nên một nơi đủ tĩnh để thực khách tận hưởng hương vị.',
      },
    ],
  },
  arExperience: {
    title: 'Trải Nghiệm AR Độc Quyền',
    subtitle: 'Thưởng Thức Bằng Tri Giác Trước Khi Nếm Bằng Vị Giác',
    description:
      'Tại Sakura Restaurant, công thực đơn giấy truyền thống được nâng tầm thành một không gian ẩm thực hiển thị ngay trước mắt.',
    image: '/about4.png',
    imageAlt: 'AR Experience Preview',
    features: [
      {
        title: 'Chiêm ngưỡng chân thực',
        text: 'Các món ăn được tái hiện với kích thước, màu sắc và kết cấu gần như thật ngay trên bàn của bạn.',
      },
      {
        title: 'Tương tác trực quan',
        text: 'Khám phá từng góc nhìn của món ăn bằng cách xoay, phóng to và quan sát trước khi gọi món.',
      },
      {
        title: 'Thấu hiểu món ăn',
        text: 'Công nghệ AR kết nối nguyên liệu, kỹ thuật chế biến và câu chuyện văn hóa đằng sau mỗi lựa chọn.',
      },
    ],
  },
  artisans: {
    eyebrow: 'Đội ngũ bếp chuyên gia',
    title: 'Những Nghệ Nhân Của Hương Vị',
    image: '/about3.png',
    imageAlt: 'Nghệ nhân cắt sashimi',
    paragraphs: [
      'Ẩm thực Nhật Bản đòi hỏi tính kỷ luật và sự kiên nhẫn tuyệt đối. Đội ngũ đầu bếp tại Sakura Restaurant được dẫn dắt bởi những bếp trưởng dày dạn kinh nghiệm trong tinh hoa ẩm thực Nhật.',
      'Đối với họ, mỗi lưỡi dao lướt qua đều chứa đựng sự tôn kính với nguyên liệu, mỗi cách bài trí đều tuân theo những quy tắc thẩm mỹ khắt khe.',
    ],
    quote:
      'Dựa trên triết lý "Ichi-go Ichi-e" (Nhất kỳ nhất hội), trân trọng mỗi cuộc gặp gỡ vì có thể chỉ diễn ra một lần trong đời, đội ngũ của chúng tôi cam kết đặt trọn tâm huyết vào từng món ăn.',
  },
}

export default function AboutPage() {
  const pageContent = useStaticPageContent('about', defaultAboutContent)
  const hero = pageContent.hero || defaultAboutContent.hero
  const story = pageContent.story || defaultAboutContent.story
  const visionMission = pageContent.visionMission || defaultAboutContent.visionMission
  const values = pageContent.coreValues || defaultAboutContent.coreValues
  const coreValuesEyebrow = pageContent.coreValuesEyebrow || 'Giá trị cốt lõi'
  const coreValuesTitle = pageContent.coreValuesTitle || 'Bốn Giá Trị Định Hình Sakura'
  const arExperience = pageContent.arExperience || defaultAboutContent.arExperience
  const artisans = pageContent.artisans || defaultAboutContent.artisans

  return (
    <div className="bg-white text-slate-950">
      <section className="relative min-h-[430px] overflow-hidden border-b border-slate-200">
        <img src={hero.backgroundImage} alt={hero.subtitle} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-white/68" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-white via-white/85 to-transparent" />
        <div className="relative mx-auto flex min-h-[430px] max-w-6xl items-center justify-center px-5 pt-8 text-center">
          <div className="max-w-3xl">
            <Title level={1} className="!mb-2 !text-4xl !font-extrabold !leading-tight !text-slate-950 md:!text-5xl">
              {hero.title} <br className="sm:hidden" />
              <span className="text-[#d8001e]">{hero.accent}</span>
            </Title>
            <Paragraph className="!mx-auto !mb-0 !max-w-xl !text-sm !font-medium !leading-relaxed !text-slate-600 md:!text-base">
              {hero.subtitle}
            </Paragraph>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1fr_0.92fr] md:px-8 lg:py-20">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-11 bg-[#d8001e]" />
              <Text className="!text-[11px] !font-bold !uppercase !tracking-[0.16em] !text-[#d8001e]">{story.eyebrow}</Text>
            </div>
            <Title level={2} className="!mb-5 !max-w-xl !text-3xl !font-extrabold !leading-none !text-slate-950 md:!text-4xl">
              {story.title}
            </Title>
            <Paragraph className="!mb-6 !border-l-2 !border-[#d8001e] !pl-4 !text-sm !italic !leading-relaxed !text-slate-500">
              {story.quote}
            </Paragraph>
            {(story.paragraphs || []).map((paragraph, index) => (
              <Paragraph key={`${paragraph}-${index}`} className={`${index === story.paragraphs.length - 1 ? '!mb-0 !font-semibold !text-slate-800' : ''} !text-sm !leading-7 !text-slate-600`}>
                {paragraph}
              </Paragraph>
            ))}
          </div>

          <div className="relative">
            <img src={story.image} alt={story.imageAlt} className="h-[360px] w-full rounded-lg object-cover shadow-[0_18px_40px_rgba(15,23,42,0.14)] md:h-[460px]" />
            <Card className="!absolute !bottom-5 !left-5 !right-5 !rounded-md !border-0 !shadow-[0_14px_28px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-[#d8001e] text-lg text-white">
                  <ScanOutlined />
                </span>
                <div>
                  <Text className="!block !text-sm !font-bold !text-slate-900">{story.cardTitle}</Text>
                  <Text className="!text-xs !text-slate-500">{story.cardText}</Text>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f7f7] px-5 py-16 md:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <Title level={2} className="!mb-2 !text-3xl !font-extrabold !text-slate-950">{visionMission.title}</Title>
            <Paragraph className="!mb-0 !text-sm !text-slate-500">{visionMission.subtitle}</Paragraph>
          </div>
          <Row gutter={[24, 24]}>
            <VisionCard title={visionMission.visionTitle} text={visionMission.visionText} />
            <VisionCard title={visionMission.missionTitle} text={visionMission.missionText} />
          </Row>
        </div>
      </section>

      <section className="bg-white px-5 py-16 md:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <Text className="!text-[11px] !font-bold !uppercase !tracking-[0.16em] !text-[#d8001e]">
              {coreValuesEyebrow}
            </Text>
            <Title level={2} className="!mt-2 !mb-0 !text-3xl !font-extrabold !text-slate-950 md:!text-4xl">
              {coreValuesTitle}
            </Title>
          </div>
          <Row gutter={[28, 28]}>
            {(valuesSection.items || []).map((item) => (
              <Col key={item.title} xs={24} sm={12} lg={6}>
                <div className="h-full">
                  <span className="mb-5 grid h-10 w-10 place-items-center rounded-md bg-slate-100 text-lg text-slate-700">
                    {valueIcons[item.icon] || valueIcons.safety}
                  </span>
                  <Title level={3} className="!mb-3 !text-base !font-bold !text-slate-950">{item.title}</Title>
                  <Paragraph className="!mb-0 !text-xs !leading-6 !text-slate-600">{item.text}</Paragraph>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section className="bg-[#f7f7f7] px-5 py-16 md:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[0.9fr_1fr]">
          <div>
            <Title level={2} className="!mb-4 !text-3xl !font-extrabold !text-slate-950">{arExperience.title}</Title>
            <Paragraph className="!mb-6 !text-base !italic !text-slate-500">{arExperience.subtitle}</Paragraph>
            <Paragraph className="!mb-8 !text-sm !leading-7 !text-slate-600">{arExperience.description}</Paragraph>
            <div className="space-y-6">
              {(arExperience.features || []).map((item, index) => (
                <div key={item.title} className="flex gap-4">
                  <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#f0b9c1] bg-white text-xs font-bold text-[#d8001e]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <Text className="!block !font-bold !text-slate-950">{item.title}</Text>
                    <Paragraph className="!mb-0 !mt-1 !text-xs !leading-6 !text-slate-600">{item.text}</Paragraph>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card className="!overflow-hidden !rounded-lg !border-0 !bg-white !p-0 !shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
            <img src={arExperience.image} alt={arExperience.imageAlt} className="h-[320px] w-full object-contain md:h-[390px]" />
          </Card>
        </div>
      </section>

      <section className="bg-white px-5 py-16 md:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[0.95fr_1fr]">
          <div className="rounded-lg bg-slate-100 p-3">
            <img src={artisans.image} alt={artisans.imageAlt} className="h-[360px] w-full rounded-md object-cover grayscale md:h-[470px]" />
          </div>
          <div>
            <div className="mb-5 flex items-center gap-3">
              <Text className="!text-[11px] !font-bold !uppercase !tracking-[0.16em] !text-[#d8001e]">{artisans.eyebrow}</Text>
            </div>
            <Title level={2} className="!mb-5 !max-w-lg !text-3xl !font-extrabold !leading-none !text-slate-950 md:!text-4xl">{artisans.title}</Title>
            {(artisans.paragraphs || []).map((paragraph, index) => (
              <Paragraph key={`${paragraph}-${index}`} className="!text-sm !leading-7 !text-slate-600">{paragraph}</Paragraph>
            ))}
            <Card className="!mt-8 !rounded-md !border-0 !bg-[#fff7f8] !shadow-none">
              <Paragraph className="!mb-0 !border-l-2 !border-[#d8001e] !pl-4 !text-sm !font-semibold !italic !leading-7 !text-slate-800">
                {artisans.quote}
              </Paragraph>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

function VisionCard({ title, text }) {
  return (
    <Col xs={24} md={12}>
      <Card className="!h-full !rounded-lg !border-0 !bg-white !p-2 !shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        <Title level={3} className="!mb-4 !border-l-4 !border-[#d8001e] !pl-3 !text-xl !font-bold !text-slate-950">{title}</Title>
        <Paragraph className="!mb-0 !text-sm !leading-7 !text-slate-600">{text}</Paragraph>
      </Card>
    </Col>
  )
}
