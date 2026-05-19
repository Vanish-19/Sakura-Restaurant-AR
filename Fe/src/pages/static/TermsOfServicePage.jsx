import {
  AuditOutlined,
  BankOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  SyncOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Card, Typography } from 'antd'
import LegalDocumentLayout, {
  LegalIconParagraph,
  LegalSectionHeading,
} from '../../components/templates/static/LegalDocumentLayout.jsx'
import useStaticPageContent from '../../hooks/useStaticPageContent.js'

const { Paragraph, Text } = Typography

const defaultTermsContent = {
  hero: {
    eyebrow: 'Last updated: October 2023',
    title: 'ĐIỀU KHOẢN DỊCH VỤ',
    subtitle: '(TERMS OF SERVICE) - Sakura Restaurant',
    backgroundImage: '/headbgPrivacy.png',
  },
}

const sections = [
  { id: 'acceptance', number: '01.', title: 'Chấp Thuận Điều Khoản', icon: <FileDoneOutlined /> },
  { id: 'service-rules', number: '02.', title: 'Quy Định Sử Dụng Dịch Vụ', icon: <DatabaseOutlined /> },
  { id: 'account', number: '03.', title: 'Tài Khoản Người Dùng', icon: <UserOutlined /> },
  { id: 'booking', number: '04.', title: 'Đặt Bàn & Hủy Đặt Bàn', icon: <BankOutlined /> },
  { id: 'payment', number: '05.', title: 'Thanh Toán & Hoàn Tiền', icon: <CreditCardOutlined /> },
  { id: 'responsibilities', number: '06.', title: 'Quyền & Trách Nhiệm', icon: <AuditOutlined /> },
  { id: 'content', number: '07.', title: 'Nội Dung Người Dùng', icon: <FileTextOutlined /> },
  { id: 'limitation', number: '08.', title: 'Giới Hạn Trách Nhiệm', icon: <ExclamationCircleOutlined /> },
  { id: 'changes', number: '09.', title: 'Thay Đổi Điều Khoản', icon: <SyncOutlined /> },
  { id: 'termination', number: '10.', title: 'Chấm Dứt Dịch Vụ', icon: <StopOutlined /> },
  { id: 'contact', number: '11.', title: 'Liên Hệ', icon: <MailOutlined /> },
]

const ruleItems = [
  'Sử dụng dịch vụ đúng mục đích và theo đúng quy định của pháp luật.',
  'Không sử dụng dịch vụ cho mục đích kỹ thuật phá hoại hoặc gây hại nào.',
  'Không can thiệp, làm gián đoạn hoặc gây ảnh hưởng đến hoạt động của hệ thống.',
  'Không sao chép, khai thác hoặc phân phối trái phép nội dung, hình ảnh, dữ liệu món ăn và mô hình 3D.',
]

const accountItems = [
  'Bạn có thể cần tạo tài khoản để sử dụng một số tính năng như lưu lịch sử đặt bàn, đơn hàng hoặc tuỳ chọn trải nghiệm AR.',
  'Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động xảy ra trong tài khoản của mình.',
  'Vui lòng thông báo ngay cho chúng tôi nếu phát hiện bất kỳ hoạt động trái phép nào.',
]

const bookingCards = [
  {
    icon: <BankOutlined />,
    title: 'Đặt Bàn',
    text: 'Bạn có thể đặt bàn thông qua website/ứng dụng. Thông tin đặt bàn cần chính xác và đầy đủ để nhà hàng chuẩn bị phục vụ.',
  },
  {
    icon: <CloseCircleOutlined />,
    title: 'Hủy Đặt Bàn',
    text: 'Bạn có thể hủy đặt bàn theo chính sách của nhà hàng. Một số khung giờ cao điểm hoặc đặt cọc có thể áp dụng phí hủy.',
  },
]

const paymentCards = [
  {
    icon: <CreditCardOutlined />,
    title: 'Thanh Toán',
    text: 'Thanh toán có thể được thực hiện bằng tiền mặt, chuyển khoản hoặc cổng thanh toán được hỗ trợ.',
  },
  {
    icon: <SyncOutlined />,
    title: 'Hoàn Tiền',
    text: 'Chính sách hoàn tiền áp dụng theo từng trường hợp cụ thể và sẽ được thông báo khi đặt dịch vụ.',
  },
  {
    icon: <ExclamationCircleOutlined />,
    title: 'Sự Cố Thanh Toán',
    text: 'Nếu giao dịch phát sinh lỗi, vui lòng liên hệ bộ phận hỗ trợ để được xử lý.',
  },
]

export default function TermsOfServicePage() {
  const pageContent = useStaticPageContent('terms-of-service', defaultTermsContent)
  const hero = pageContent.hero || defaultTermsContent.hero

  return (
    <LegalDocumentLayout
      sections={sections}
      title={hero.title}
      subtitle={hero.subtitle}
      updatedLabel={hero.eyebrow}
      backgroundImage={hero.backgroundImage}
      supportTitle="Cần hỗ trợ?"
      supportText="Nếu bạn có bất kỳ câu hỏi nào về Điều khoản dịch vụ, vui lòng liên hệ với chúng tôi."
      contentMoreLabel="Xem tất cả điều khoản chi tiết bên dưới"
    >
      {({ sectionRefs, visibleContentIds }) => (
        <>
          {visibleContentIds.has('acceptance') ? (
          <LegalSection id="acceptance" section={sections[0]} sectionRefs={sectionRefs} className="pb-12">
            <Paragraph className="!text-base !leading-8 !text-slate-700">
              Bằng việc truy cập và sử dụng website, ứng dụng Sakura Restaurant, đặt bàn, gọi món, thanh toán hoặc trải nghiệm các tính năng AR, bạn đồng ý tuân thủ các Điều khoản Dịch vụ này.
            </Paragraph>
            <Card className="!mt-6 !rounded-lg !border-[#ffd5dc] !bg-[#fff7f8] !shadow-none" bodyStyle={{ padding: 22 }}>
              <Text className="!block !font-extrabold !uppercase !text-[#d8001e]">Lưu ý quan trọng</Text>
              <Paragraph className="!mt-2 !mb-0 !text-sm !leading-7 !text-slate-700">
                Chúng tôi có quyền cập nhật, chỉnh sửa các điều khoản này bất cứ lúc nào. Những thay đổi sẽ có hiệu lực ngay khi được đăng tải. Việc tiếp tục sử dụng dịch vụ đồng nghĩa với sự chấp thuận của bạn đối với các thay đổi đó.
              </Paragraph>
            </Card>
          </LegalSection>
          ) : null}

          {visibleContentIds.has('service-rules') ? (
          <LegalSection id="service-rules" section={sections[1]} sectionRefs={sectionRefs}>
            <Paragraph className="!text-base !leading-8 !text-slate-700">
              Sakura Restaurant cung cấp nền tảng đặt bàn, trải nghiệm thực tế tăng cường (AR) và các dịch vụ liên quan cho mục đích cá nhân, phi thương mại. Bạn đồng ý:
            </Paragraph>
            <BulletList items={ruleItems} />
          </LegalSection>
          ) : null}

          {visibleContentIds.has('account') ? (
          <LegalSection id="account" section={sections[2]} sectionRefs={sectionRefs}>
            <BulletList items={accountItems} />
          </LegalSection>
          ) : null}

          {visibleContentIds.has('booking') ? (
          <LegalSection id="booking" section={sections[3]} sectionRefs={sectionRefs}>
            <div className="grid gap-5 md:grid-cols-2">
              {bookingCards.map((item) => (
                <InfoCard key={item.title} {...item} />
              ))}
            </div>
          </LegalSection>
          ) : null}

          {visibleContentIds.has('payment') ? (
          <LegalSection id="payment" section={sections[4]} sectionRefs={sectionRefs}>
            <div className="grid gap-5 md:grid-cols-3">
              {paymentCards.map((item) => (
                <InfoCard key={item.title} {...item} />
              ))}
            </div>
          </LegalSection>
          ) : null}

          {visibleContentIds.has('responsibilities') ? (
          <LegalSection id="responsibilities" section={sections[5]} sectionRefs={sectionRefs}>
            <div className="grid overflow-hidden rounded-lg border border-[#ffd5dc] md:grid-cols-2">
              <div className="bg-[#fff7f8] p-5">
                <Text className="!font-extrabold !text-[#d8001e]">Sakura Restaurant</Text>
                <BulletList compact items={['Cung cấp dịch vụ đúng mô tả.', 'Đảm bảo an toàn thông tin trong quá trình sử dụng dịch vụ.', 'Hỗ trợ khách hàng khi phát sinh sự cố hợp lý.']} />
              </div>
              <div className="p-5">
                <Text className="!font-extrabold !text-[#1C1C1E]">Người Dùng</Text>
                <BulletList compact items={['Cung cấp thông tin chính xác, trung thực.', 'Tuân thủ các điều khoản và quy định của dịch vụ.', 'Không sử dụng dịch vụ để thực hiện hành vi vi phạm pháp luật.']} />
              </div>
            </div>
          </LegalSection>
          ) : null}

          {visibleContentIds.has('content') ? (
          <LegalSection id="content" section={sections[6]} sectionRefs={sectionRefs}>
            <Paragraph className="!text-base !leading-8 !text-slate-700">
              Bất kỳ nội dung nào bạn gửi lên hệ thống, bao gồm đánh giá, bình luận, hình ảnh, yêu cầu hỗ trợ hoặc thông tin đặt bàn, phải hợp pháp, không vi phạm quyền của bên thứ ba và không chứa nội dung xúc phạm, phân biệt đối xử hoặc gây hại.
            </Paragraph>
            <Paragraph className="!text-base !leading-8 !text-slate-700">
              Sakura Restaurant có quyền xóa hoặc hạn chế hiển thị nội dung không phù hợp mà không cần thông báo trước.
            </Paragraph>
          </LegalSection>
          ) : null}

          {visibleContentIds.has('limitation') ? (
          <LegalSection id="limitation" section={sections[7]} sectionRefs={sectionRefs}>
            <BulletList
              items={[
                'Dịch vụ được cung cấp trong trạng thái tốt nhất có thể, nhưng không bảo đảm không bao giờ gián đoạn.',
                'Chúng tôi không chịu trách nhiệm cho sự cố phát sinh từ thiết bị, kết nối mạng hoặc thao tác sai của người dùng.',
                'Sakura Restaurant không chịu trách nhiệm đối với thiệt hại ngoài tầm kiểm soát hợp lý của nhà hàng.',
              ]}
            />
          </LegalSection>
          ) : null}

          {visibleContentIds.has('changes') ? (
          <LegalSection id="changes" section={sections[8]} sectionRefs={sectionRefs}>
            <Paragraph className="!text-base !leading-8 !text-slate-700">
              Chúng tôi có quyền sửa đổi, bổ sung hoặc thay thế bất kỳ phần nào của Điều khoản dịch vụ này. Các thay đổi sẽ được công bố lại trên trang này và ngày cập nhật mới sẽ được hiển thị rõ ràng.
            </Paragraph>
          </LegalSection>
          ) : null}

          {visibleContentIds.has('termination') ? (
          <LegalSection id="termination" section={sections[9]} sectionRefs={sectionRefs}>
            <Paragraph className="!text-base !leading-8 !text-slate-700">
              Chúng tôi có thể tạm ngừng hoặc chấm dứt quyền truy cập của bạn vào dịch vụ bất kỳ lúc nào nếu phát hiện bạn vi phạm các điều khoản hoặc có hành vi gây ảnh hưởng đến hệ thống và người dùng khác.
            </Paragraph>
          </LegalSection>
          ) : null}

          {visibleContentIds.has('contact') ? (
          <LegalSection id="contact" section={sections[10]} sectionRefs={sectionRefs} isLast>
            <Paragraph className="!text-base !leading-8 !text-slate-700">
              Nếu bạn có bất kỳ câu hỏi nào về Điều khoản dịch vụ này, vui lòng liên hệ với chúng tôi qua:
            </Paragraph>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg bg-[#fff1f3] px-5 py-4 font-bold text-[#8B0000]">
                <MailOutlined />
                contact@sakurarestaurant.vn
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-[#fff1f3] px-5 py-4 font-bold text-[#8B0000]">
                <PhoneOutlined />
                1900 xxxx
              </div>
            </div>
          </LegalSection>
          ) : null}
        </>
      )}
    </LegalDocumentLayout>
  )
}

function LegalSection({ id, section, sectionRefs, children, className = 'py-12', isLast = false }) {
  return (
    <section
      id={id}
      ref={(node) => {
        sectionRefs.current[id] = node
      }}
      className={`scroll-mt-28 ${isLast ? 'pt-12 pb-12' : `border-b border-[#eee3e3] ${className}`}`}
    >
      <LegalSectionHeading section={section} />
      {children}
    </section>
  )
}

function BulletList({ items, compact = false }) {
  return (
    <ul className={`${compact ? 'mt-3 space-y-2 text-sm' : 'mt-5 space-y-3 text-base'} pl-0 text-slate-700`}>
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#d8001e]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function InfoCard({ icon, title, text }) {
  return (
    <Card className="!rounded-lg !border-[#eee3e3] !shadow-none" bodyStyle={{ padding: 20 }}>
      <LegalIconParagraph icon={icon} title={title} text={text} />
    </Card>
  )
}
