import {
  ArrowRightOutlined,
  CodeOutlined,
  CustomerServiceOutlined,
  DownOutlined,
  ExperimentOutlined,
  HomeOutlined,
  LaptopOutlined,
  MailOutlined,
  NotificationOutlined,
  PhoneOutlined,
  SendOutlined,
  ShopOutlined,
  ToolOutlined,
  UploadOutlined,
  UpOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Button, Card, DatePicker, Form, Input, Modal, Radio, Select, Tag, Typography, Upload, message } from 'antd'
import { useState } from 'react'
import useStaticPageContent from '../../hooks/useStaticPageContent.js'
import { submitCareerApplication } from '../../services/careerApi.js'

const { Paragraph, Text, Title } = Typography

const defaultCareerContent = {
  hero: {
    eyebrow: 'Tuyển dụng',
    title: 'Cơ Hội Nghề Nghiệp',
    subtitle: 'Khởi Đầu Tương Lai Cùng Ngành Ẩm Thực Công Nghệ',
    description:
      'Tại Sakura Restaurant, chúng tôi không chỉ đơn thuần phục vụ những món ăn ngon. Chúng tôi đang kiến tạo một trải nghiệm ẩm thực đa giác quan, nơi truyền thống Nhật Bản hòa quyện cùng công nghệ tương lai.',
    backgroundImage: '/headbgPrivacy.png',
  },
  application: {
    email: 'phunganhvan13122004@gmail.com',
    hotline: '0966 490 431',
    title: 'Cách Thức Ứng Tuyển',
    description: 'Vui lòng gửi CV và Portfolio nếu có qua email bên dưới với tiêu đề theo cú pháp:',
    subjectFormat: '[ Vị Trí Ứng Tuyển ] - [ Họ Và Tên ]',
    privacyNote:
      'Bằng việc gửi đơn ứng tuyển, bạn đồng ý cho Sakura Restaurant lưu trữ và xử lý thông tin cá nhân của bạn cho mục đích tuyển dụng.',
  },
  featuredJobs: [
    {
      title: 'Nhân Viên Phục Vụ & Hướng Dẫn Viên AR',
      type: 'Part-time / Full-time',
      iconKey: 'customer-service',
      highlights: [
        'Chào đón và phục vụ khách hàng theo tiêu chuẩn Omotenashi.',
        'Hướng dẫn khách sử dụng tính năng AR để trải nghiệm menu tương tác.',
        'Giải đáp thắc mắc về các món ăn và chức năng công nghệ.',
      ],
      goodFit: [
        'Ngoại hình sáng, giao tiếp tốt bằng Anh/V hoặc Nhật là lợi thế.',
        'Quan tâm công nghệ và văn hóa Nhật Bản.',
        'Kỹ năng xử lý tình huống linh hoạt.',
      ],
      benefits: [
        'Mức lương cạnh tranh, service charge và tip.',
        'Đào tạo chuyên sâu về AR và văn hóa ẩm thực Nhật Bản.',
        'Môi trường làm việc hiện đại, năng động.',
      ],
    },
    {
      title: 'Đầu Bếp Chuyên Thớt / Sushi Chef',
      type: 'Full-time',
      iconKey: 'shop',
      highlights: [
        'Đảm nhiệm khu vực Sushi & Sashimi.',
        'Phối hợp cùng bộ phận R&D để phát triển các món ăn mới phù hợp với hình ảnh AR.',
        'Đảm bảo tiêu chuẩn vệ sinh an toàn thực phẩm tuyệt đối.',
      ],
      goodFit: [
        'Kinh nghiệm tối thiểu 2 năm ở vị trí tương đương.',
        'Kỹ năng dùng dao điêu luyện, am hiểu về hải sản tươi sống.',
        'Tinh thần sáng tạo, sẵn sàng tiếp thu cái mới.',
      ],
      benefits: [
        'Thu nhập hấp dẫn theo năng lực.',
        'Cơ hội thăng tiến lên bếp trưởng.',
        'Phúc lợi bảo hiểm, đồng phục và các chế độ theo hiện hành.',
      ],
    },
    {
      title: 'Thực Tập Sinh Lập Trình Web - Định Hướng AR/WebXR',
      type: 'Internship',
      iconKey: 'code',
      highlights: [
        'Tham gia phát triển và tối ưu nền tảng Web App của nhà hàng.',
        'Nghiên cứu tích hợp các tính năng WebXR/WebAR trên mobile.',
        'Hỗ trợ xử lý UI và nâng cấp giao diện người dùng.',
      ],
      goodFit: [
        'Sinh viên năm 3, năm 4 chuyên ngành CNTT/Thiết kế tương tác.',
        'Nắm chắc HTML, CSS, JavaScript cơ bản. Biết React/Three.js là lợi thế.',
        'Tư duy logic tốt, tinh thần học hỏi cao.',
      ],
      benefits: [
        'Hỗ trợ chi phí thực tập.',
        'Được mentor bởi các kỹ sư giàu kinh nghiệm.',
        'Cơ hội trở thành nhân viên chính thức sau khi tốt nghiệp.',
      ],
    },
  ],
  extraJobs: [
    {
      title: 'Quản Lý Nhà Hàng',
      type: 'Full-time',
      location: 'Hồ Chí Minh',
      description: 'Quản lý vận hành, đội ngũ và trải nghiệm khách hàng theo tiêu chuẩn Sakura.',
      iconKey: 'home',
    },
    {
      title: 'Nhân Viên Marketing',
      type: 'Full-time',
      location: 'Hồ Chí Minh',
      description: 'Lên kế hoạch truyền thông, quảng bá thương hiệu và các chiến dịch AR.',
      iconKey: 'notification',
    },
    {
      title: 'Nhân Viên R&D Ẩm Thực',
      type: 'Full-time',
      location: 'Hồ Chí Minh',
      description: 'Nghiên cứu và phát triển món ăn mới kết hợp công nghệ AR và ẩm thực Nhật Bản.',
      iconKey: 'experiment',
    },
    {
      title: 'Nhân Viên IT Support',
      type: 'Full-time',
      location: 'Hồ Chí Minh',
      description: 'Hỗ trợ kỹ thuật hệ thống AR, thiết bị và phần mềm trong nhà hàng.',
      iconKey: 'laptop',
    },
    {
      title: 'Thu Ngân',
      type: 'Part-time',
      location: 'Hồ Chí Minh',
      description: 'Thanh toán, xuất hóa đơn và hỗ trợ khách hàng khi cần thiết.',
      iconKey: 'wallet',
    },
    {
      title: 'Tạp Vụ',
      type: 'Part-time',
      location: 'Hồ Chí Minh',
      description: 'Giữ gìn vệ sinh khu vực làm việc, đảm bảo không gian sạch sẽ.',
      iconKey: 'tool',
    },
    {
      title: 'Runner (Phục Vụ Bếp)',
      type: 'Part-time',
      location: 'Hồ Chí Minh',
      description: 'Hỗ trợ vận chuyển món ăn từ bếp ra khu vực phục vụ.',
      iconKey: 'shop',
    },
    {
      title: 'Thiết Kế 3D - AR Artist',
      type: 'Full-time',
      location: 'Hồ Chí Minh',
      description: 'Thiết kế mô hình 3D món ăn và hiệu ứng AR ấn tượng cho trải nghiệm khách hàng.',
      iconKey: 'code',
    },
  ],
  applicationForm: {
    nationalityOptions: ['Việt Nam', 'Nhật Bản', 'Khác'],
    experienceOptions: ['Chưa có kinh nghiệm', 'Dưới 1 năm', '1-2 năm', 'Trên 2 năm'],
    referralOptions: ['Website Sakura', 'Facebook', 'LinkedIn', 'Bạn bè giới thiệu', 'Khác'],
    uploadFormats: 'PDF, DOC, DOCX (Tối đa 5MB)',
    fields: {
      fullName: { label: 'Họ và tên *', placeholder: 'Nhập họ và tên', requiredMessage: 'Vui lòng nhập họ và tên' },
      email: { label: 'Email *', placeholder: 'example@email.com', requiredMessage: 'Vui lòng nhập email', invalidMessage: 'Email không hợp lệ' },
      phone: { label: 'Số điện thoại *', placeholder: '0901 234 567', requiredMessage: 'Vui lòng nhập số điện thoại' },
      birthDate: { label: 'Ngày sinh', placeholder: 'DD/MM/YYYY' },
      address: { label: 'Địa chỉ', placeholder: 'Nhập địa chỉ hiện tại' },
      nationality: { label: 'Quốc tịch', placeholder: 'Chọn quốc tịch' },
      linkedIn: { label: 'LinkedIn (nếu có)', placeholder: 'https://linkedin.com/in/yourprofile' },
      position: { label: 'Vị trí ứng tuyển *', placeholder: 'Chọn vị trí', requiredMessage: 'Vui lòng chọn vị trí ứng tuyển' },
      workType: { label: 'Loại hình công việc *', requiredMessage: 'Vui lòng chọn loại hình công việc' },
      experience: { label: 'Kinh nghiệm làm việc *', placeholder: 'Chọn kinh nghiệm', requiredMessage: 'Vui lòng chọn kinh nghiệm' },
      expectedSalary: { label: 'Mức lương mong muốn', placeholder: 'Nhập mức lương mong muốn' },
      availableStartDate: { label: 'Ngày có thể bắt đầu', placeholder: 'DD/MM/YYYY' },
      referralSource: { label: 'Nguồn thông tin bạn biết đến vị trí này *', placeholder: 'Chọn nguồn', requiredMessage: 'Vui lòng chọn nguồn thông tin' },
      resume: { label: 'CV / Resume *', requiredMessage: 'Vui lòng tải lên CV / Resume' },
      introductionLetter: { label: 'Thư giới thiệu (nếu có)' },
      coverLetter: { placeholder: 'Nhập thư ngỏ của bạn...' },
    },
  },
  ui: {
    jobsTitle: 'Các Vị Trí Đang Tuyển Dụng',
    jobsDescription: 'Khám phá các cơ hội nghề nghiệp hấp dẫn và trở thành một phần của hành trình đổi mới cùng Sakura.',
    showAllJobsLabel: 'Xem tất cả vị trí tuyển dụng',
    collapseJobsLabel: 'Thu gọn vị trí tuyển dụng',
    applyButtonLabel: 'Ứng Tuyển Ngay',
    compactApplyButtonLabel: 'Ứng tuyển',
    jobDescriptionLabel: 'Mô tả công việc:',
    jobRequirementsLabel: 'Yêu cầu:',
    jobBenefitsLabel: 'Quyền lợi:',
    hotlineLabel: 'Hotline',
    applicationSuccessMessage: 'Đã ứng tuyển thành công',
    applicationErrorMessage: 'Gửi ứng tuyển thất bại. Vui lòng thử lại.',
    modalEyebrow: 'Ứng tuyển vị trí',
    modalFallbackTitle: 'Vị trí tuyển dụng',
    personalInfoTitle: 'Thông tin cá nhân',
    applicationInfoTitle: 'Thông tin ứng tuyển',
    applicationFilesTitle: 'Hồ sơ ứng tuyển',
    coverLetterTitle: 'Thư ngỏ (tùy chọn)',
    noteTitle: 'Lưu ý',
    dragUploadText: 'Kéo thả file vào đây hoặc',
    chooseFileLabel: 'Chọn file',
    submitApplicationLabel: 'Gửi Ứng Tuyển',
  },
}

const JOB_ICON_MAP = {
  code: <CodeOutlined />,
  'customer-service': <CustomerServiceOutlined />,
  experiment: <ExperimentOutlined />,
  home: <HomeOutlined />,
  laptop: <LaptopOutlined />,
  notification: <NotificationOutlined />,
  shop: <ShopOutlined />,
  tool: <ToolOutlined />,
  wallet: <WalletOutlined />,
}

export default function CareerPage() {
  const [form] = Form.useForm()
  const pageContent = useStaticPageContent('career', defaultCareerContent)
  const hero = pageContent.hero || defaultCareerContent.hero
  const application = pageContent.application || defaultCareerContent.application
  const featuredJobs = pageContent.featuredJobs || defaultCareerContent.featuredJobs
  const extraJobs = pageContent.extraJobs || defaultCareerContent.extraJobs
  const applicationForm = pageContent.applicationForm || defaultCareerContent.applicationForm
  const ui = { ...defaultCareerContent.ui, ...(pageContent.ui || {}) }
  const [showAllJobs, setShowAllJobs] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openApplyModal = (job) => {
    setSelectedJob(job)
    setIsApplyModalOpen(true)
    form.setFieldsValue({
      position: job.title,
      workType: job.type.toLowerCase().includes('part') ? 'part-time' : 'full-time',
    })
  }

  const closeApplyModal = () => {
    setIsApplyModalOpen(false)
    setSelectedJob(null)
    form.resetFields()
  }

  const handleApplySubmit = async (values) => {
    const payload = new FormData()
    const resumeFile = values.resume?.[0]?.originFileObj
    const introductionFile = values.introductionLetter?.[0]?.originFileObj

    Object.entries({
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      birthDate: values.birthDate?.format('YYYY-MM-DD'),
      address: values.address,
      nationality: values.nationality,
      linkedIn: values.linkedIn,
      position: values.position,
      workType: values.workType,
      experience: values.experience,
      expectedSalary: values.expectedSalary,
      availableStartDate: values.availableStartDate?.format('YYYY-MM-DD'),
      referralSource: values.referralSource,
      coverLetter: values.coverLetter,
    }).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        payload.append(key, value)
      }
    })

    if (resumeFile) payload.append('resume', resumeFile)
    if (introductionFile) payload.append('introductionLetter', introductionFile)

    try {
      setIsSubmitting(true)
      await submitCareerApplication(payload)
      message.success(ui.applicationSuccessMessage)
      closeApplyModal()
    } catch (error) {
      message.error(error?.message || ui.applicationErrorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#fffafa] text-[#111827]">
      <section className="relative min-h-[360px] overflow-hidden md:min-h-[430px]">
        <img
          src={hero.backgroundImage}
          alt="Không gian Sakura Restaurant"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/68" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/78 to-white/20" />
        <div className="relative z-10 mx-auto flex min-h-[360px] max-w-7xl flex-col justify-center px-5 pt-8 text-center md:min-h-[430px] md:px-8 xl:px-10">
          <div className="mx-auto mb-5 flex items-center gap-4">
            <span className="h-0.5 w-12 bg-[#d8001e]" />
            <Text className="!text-xs !font-extrabold !uppercase !tracking-[0.16em] !text-[#d8001e] md:!text-sm">
              {hero.eyebrow}
            </Text>
            <span className="h-0.5 w-12 bg-[#d8001e]" />
          </div>
          <Title level={1} className="!mb-4 !text-3xl !font-black !uppercase !leading-tight !tracking-tight !text-[#090b16] md:!text-5xl">
            {hero.title}
          </Title>
          <Text className="!block !text-base !font-semibold !text-slate-700 md:!text-lg">
            {hero.subtitle}
          </Text>
          <Paragraph className="!mx-auto !mt-6 !mb-0 !max-w-3xl !text-sm !leading-7 !text-slate-600 md:!text-base">
            {hero.description}
          </Paragraph>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16 xl:px-10">
        <div className="text-center">
          <Title level={2} className="!mb-3 !text-2xl !font-black !uppercase !text-[#111827] md:!text-3xl">
            {ui.jobsTitle}
          </Title>
          <Paragraph className="!mx-auto !mb-0 !max-w-2xl !text-sm !leading-6 !text-slate-500">
            {ui.jobsDescription}
          </Paragraph>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {featuredJobs.map((job) => (
            <FeaturedJobCard key={job.title} job={job} onApply={openApplyModal} ui={ui} />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            size="large"
            onClick={() => setShowAllJobs((current) => !current)}
            className="!h-12 !rounded-lg !border-[#ffb8c1] !px-7 !font-extrabold !text-[#d8001e] hover:!border-[#d8001e] hover:!bg-[#fff1f3] hover:!text-[#b00018]"
            icon={showAllJobs ? <UpOutlined /> : <DownOutlined />}
            iconPosition="end"
          >
            {showAllJobs ? ui.collapseJobsLabel : ui.showAllJobsLabel}
          </Button>
        </div>

        {showAllJobs ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {extraJobs.map((job) => (
              <CompactJobCard key={job.title} job={job} onApply={openApplyModal} ui={ui} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="border-t border-[#f4d9de] bg-gradient-to-b from-[#fff8f9] to-[#fdebed] px-5 py-12 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-[#ffd5dc] bg-white text-xl text-[#d8001e] shadow-[0_10px_24px_rgba(216,0,30,0.08)]">
            <MailOutlined />
          </span>
          <Title level={2} className="!mt-5 !mb-3 !text-2xl !font-black !uppercase !text-[#111827]">
            {application.title}
          </Title>
          <Paragraph className="!mx-auto !mb-6 !max-w-2xl !text-sm !leading-6 !text-slate-600">
            {application.description}
          </Paragraph>
          <div className="mx-auto max-w-2xl rounded-lg border border-[#f5d5da] bg-white px-5 py-5 text-left shadow-[0_12px_30px_rgba(17,24,39,0.06)]">
            <Text className="!font-black !uppercase !tracking-[0.14em] !text-[#d8001e]">
              {application.subjectFormat}
            </Text>
          </div>
          <div className="mt-7 flex flex-col items-center justify-center gap-4 text-sm font-bold text-slate-700 sm:flex-row sm:gap-8">
            <span className="flex items-center gap-2">
              <MailOutlined className="text-[#d8001e]" />
              {application.email}
            </span>
            <span className="flex items-center gap-2">
              <PhoneOutlined className="text-[#d8001e]" />
              {ui.hotlineLabel}: {application.hotline}
            </span>
          </div>
        </div>
      </section>

      <ApplicationModal
        form={form}
        open={isApplyModalOpen}
        selectedJob={selectedJob}
        featuredJobs={featuredJobs}
        extraJobs={extraJobs}
        applicationForm={applicationForm}
        privacyNote={application.privacyNote}
        ui={ui}
        submitting={isSubmitting}
        onCancel={closeApplyModal}
        onFinish={handleApplySubmit}
      />
    </div>
  )
}

function FeaturedJobCard({ job, onApply, ui = defaultCareerContent.ui }) {
  return (
    <Card
      className="h-full !rounded-lg !border-[#eee3e3] !bg-white !shadow-[0_12px_30px_rgba(17,24,39,0.06)] transition-all duration-300 hover:!-translate-y-1 hover:!border-[#ffc7cf] hover:!shadow-[0_18px_38px_rgba(216,0,30,0.10)]"
      bodyStyle={{ padding: 24 }}
    >
      <Tag className="!mb-5 !rounded-full !border-[#ffd5dc] !bg-[#fff1f3] !px-3 !py-1 !text-xs !font-bold !text-[#d8001e]">
        {job.type}
      </Tag>
      <div className="mb-4 flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fff1f3] text-2xl text-[#d8001e]">
          {JOB_ICON_MAP[job.iconKey] || <CustomerServiceOutlined />}
        </span>
        <Title level={3} className="!mb-0 !text-lg !font-black !leading-snug !text-[#111827]">
          {job.title}
        </Title>
      </div>
      <JobSection title={ui.jobDescriptionLabel} items={job.highlights} />
      <JobSection title={ui.jobRequirementsLabel} items={job.goodFit} />
      <JobSection title={ui.jobBenefitsLabel} items={job.benefits} />
      <Button
        type="text"
        onClick={() => onApply(job)}
        className="!mt-3 !h-11 !w-full !justify-center !rounded-lg !bg-[#fff7f8] !font-extrabold !text-[#d8001e] hover:!bg-[#fff1f3] hover:!text-[#b00018]"
        icon={<ArrowRightOutlined />}
        iconPosition="end"
      >
        {ui.applyButtonLabel}
      </Button>
    </Card>
  )
}

function JobSection({ title, items }) {
  return (
    <div className="mb-5">
      <Text className="!block !text-sm !font-black !text-[#111827]">{title}</Text>
      <ul className="mt-3 space-y-2 pl-0 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d8001e]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CompactJobCard({ job, onApply, ui = defaultCareerContent.ui }) {
  return (
    <Card
      className="h-full !rounded-xl !border-[#eee3e3] !bg-white !shadow-[0_10px_28px_rgba(17,24,39,0.05)] transition-all duration-300 hover:!-translate-y-1 hover:!border-[#ffc7cf] hover:!shadow-[0_18px_38px_rgba(216,0,30,0.10)]"
      bodyStyle={{ padding: 24 }}
    >
      <div className="flex gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center text-3xl text-[#ef2d3d]">
          {JOB_ICON_MAP[job.iconKey] || <ShopOutlined />}
        </span>
        <div className="min-w-0">
          <Title level={3} className="!mb-1 !text-lg !font-black !leading-snug !text-[#111827]">
            {job.title}
          </Title>
          <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold text-slate-500">
            <span>{job.type}</span>
            <span className="text-[#ef2d3d]">•</span>
            <span>{job.location}</span>
          </div>
          <Paragraph className="!mb-4 !text-sm !leading-6 !text-slate-600">{job.description}</Paragraph>
          <Button
            type="text"
            onClick={() => onApply(job)}
            className="!h-auto !p-0 !font-black !text-[#ef2d3d] hover:!bg-transparent hover:!text-[#b00018]"
            icon={<ArrowRightOutlined />}
            iconPosition="end"
          >
            {ui.compactApplyButtonLabel}
          </Button>
        </div>
      </div>
    </Card>
  )
}

const uploadValueFromEvent = (event) => {
  if (Array.isArray(event)) return event
  return event?.fileList?.slice(-1) || []
}

const uploadProps = {
  beforeUpload: () => false,
  maxCount: 1,
  accept: '.pdf,.doc,.docx',
}

function ApplicationModal({
  form,
  open,
  selectedJob,
  featuredJobs,
  extraJobs,
  applicationForm,
  privacyNote,
  ui,
  submitting,
  onCancel,
  onFinish,
}) {
  const positionOptions = [...featuredJobs, ...extraJobs].map((job) => ({
    value: job.title,
    label: job.title,
  }))
  const fieldContent = {
    ...(defaultCareerContent.applicationForm.fields || {}),
    ...(applicationForm.fields || {}),
  }
  const getField = (key) => fieldContent[key] || {}

  return (
    <Modal
      open={open}
      footer={null}
      width={900}
      centered
      onCancel={onCancel}
      destroyOnHidden
      className="career-application-modal"
    >
      <div className="px-1 py-3 sm:px-4">
        <div className="mb-7 text-center">
          <Text className="!text-sm !font-black !uppercase !tracking-[0.12em] !text-[#d8001e]">
            {ui.modalEyebrow}
          </Text>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#fff1f3] text-xl text-[#d8001e]">
              {JOB_ICON_MAP[selectedJob?.iconKey] || <CustomerServiceOutlined />}
            </span>
            <Title level={2} className="!mb-0 !text-xl !font-black !text-[#d8001e] md:!text-2xl">
              {selectedJob?.title || ui.modalFallbackTitle}
            </Title>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="career-application-form"
          requiredMark={false}
        >
          <SectionTitle>{ui.personalInfoTitle}</SectionTitle>
          <div className="grid gap-x-6 md:grid-cols-2">
            <Form.Item name="fullName" label={getField('fullName').label} rules={[{ required: true, message: getField('fullName').requiredMessage }]}>
              <Input placeholder={getField('fullName').placeholder} />
            </Form.Item>
            <Form.Item name="email" label={getField('email').label} rules={[{ required: true, message: getField('email').requiredMessage }, { type: 'email', message: getField('email').invalidMessage }]}>
              <Input placeholder={getField('email').placeholder} />
            </Form.Item>
            <Form.Item name="phone" label={getField('phone').label} rules={[{ required: true, message: getField('phone').requiredMessage }]}>
              <Input placeholder={getField('phone').placeholder} />
            </Form.Item>
            <Form.Item name="birthDate" label={getField('birthDate').label}>
              <DatePicker className="!w-full" format="DD/MM/YYYY" placeholder={getField('birthDate').placeholder} />
            </Form.Item>
            <Form.Item name="address" label={getField('address').label} className="md:col-span-2">
              <Input placeholder={getField('address').placeholder} />
            </Form.Item>
            <Form.Item name="nationality" label={getField('nationality').label}>
              <Select
                placeholder={getField('nationality').placeholder}
                options={applicationForm.nationalityOptions.map((value) => ({ value, label: value }))}
              />
            </Form.Item>
            <Form.Item name="linkedIn" label={getField('linkedIn').label}>
              <Input placeholder={getField('linkedIn').placeholder} />
            </Form.Item>
          </div>

          <SectionTitle>{ui.applicationInfoTitle}</SectionTitle>
          <div className="grid gap-x-6 md:grid-cols-2">
            <Form.Item name="position" label={getField('position').label} rules={[{ required: true, message: getField('position').requiredMessage }]}>
              <Select placeholder={getField('position').placeholder} options={positionOptions} />
            </Form.Item>
            <Form.Item name="workType" label={getField('workType').label} rules={[{ required: true, message: getField('workType').requiredMessage }]}>
              <Radio.Group>
                <Radio value="full-time">Full-time</Radio>
                <Radio value="part-time">Part-time</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="experience" label={getField('experience').label} rules={[{ required: true, message: getField('experience').requiredMessage }]}>
              <Select
                placeholder={getField('experience').placeholder}
                options={applicationForm.experienceOptions.map((value) => ({ value, label: value }))}
              />
            </Form.Item>
            <Form.Item name="expectedSalary" label={getField('expectedSalary').label}>
              <Input placeholder={getField('expectedSalary').placeholder} />
            </Form.Item>
            <Form.Item name="availableStartDate" label={getField('availableStartDate').label}>
              <DatePicker className="!w-full" format="DD/MM/YYYY" placeholder={getField('availableStartDate').placeholder} />
            </Form.Item>
            <Form.Item name="referralSource" label={getField('referralSource').label} rules={[{ required: true, message: getField('referralSource').requiredMessage }]}>
              <Select
                placeholder={getField('referralSource').placeholder}
                options={applicationForm.referralOptions.map((value) => ({ value, label: value }))}
              />
            </Form.Item>
          </div>

          <SectionTitle>{ui.applicationFilesTitle}</SectionTitle>
          <div className="grid gap-6 md:grid-cols-2">
            <Form.Item
              name="resume"
              label={getField('resume').label}
              valuePropName="fileList"
              getValueFromEvent={uploadValueFromEvent}
              rules={[{ required: true, message: getField('resume').requiredMessage }]}
            >
              <Upload.Dragger {...uploadProps}>
                <UploadOutlined className="!text-2xl !text-[#d8001e]" />
                <Text className="!mt-3 !block !font-bold !text-slate-700">{ui.dragUploadText}</Text>
                <Button className="!mt-3 !h-9 !rounded-full !border-0 !bg-[#fff1f3] !px-5 !font-bold !text-[#d8001e]">
                  {ui.chooseFileLabel}
                </Button>
                <Paragraph className="!mt-3 !mb-0 !text-xs !text-slate-500">
                  Định dạng: {applicationForm.uploadFormats}
                </Paragraph>
              </Upload.Dragger>
            </Form.Item>

            <Form.Item
              name="introductionLetter"
              label={getField('introductionLetter').label}
              valuePropName="fileList"
              getValueFromEvent={uploadValueFromEvent}
            >
              <Upload.Dragger {...uploadProps}>
                <UploadOutlined className="!text-2xl !text-[#d8001e]" />
                <Text className="!mt-3 !block !font-bold !text-slate-700">{ui.dragUploadText}</Text>
                <Button className="!mt-3 !h-9 !rounded-full !border-0 !bg-[#fff1f3] !px-5 !font-bold !text-[#d8001e]">
                  {ui.chooseFileLabel}
                </Button>
                <Paragraph className="!mt-3 !mb-0 !text-xs !text-slate-500">
                  Định dạng: {applicationForm.uploadFormats}
                </Paragraph>
              </Upload.Dragger>
            </Form.Item>
          </div>

          <SectionTitle>{ui.coverLetterTitle}</SectionTitle>
          <Form.Item name="coverLetter">
            <Input.TextArea
              rows={5}
              maxLength={1000}
              showCount
              placeholder={getField('coverLetter').placeholder}
            />
          </Form.Item>

          <div className="mb-7 flex items-center gap-4 rounded-lg border border-[#ffd5dc] bg-[#fff7f8] px-5 py-4">
            <div className="min-w-0 flex-1">
              <Text className="!block !font-black !uppercase !text-[#d8001e]">{ui.noteTitle}</Text>
              <Paragraph className="!mb-0 !mt-2 !text-sm !leading-6 !text-slate-600">
                {privacyNote}
              </Paragraph>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              htmlType="submit"
              type="primary"
              loading={submitting}
              icon={<SendOutlined />}
              iconPosition="end"
              className="!h-12 !min-w-[260px] !rounded-lg !border-0 !bg-[#d8001e] !px-8 !font-black !text-white !shadow-[0_14px_28px_rgba(216,0,30,0.22)] hover:!bg-[#b00018]"
            >
              {ui.submitApplicationLabel}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  )
}

function SectionTitle({ children }) {
  return (
    <div className="mb-5 mt-7 first:mt-0">
      <Text className="!text-sm !font-black !uppercase !text-[#d8001e]">{children}</Text>
    </div>
  )
}
