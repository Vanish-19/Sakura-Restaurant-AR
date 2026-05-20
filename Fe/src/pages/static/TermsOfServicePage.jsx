import {
  AuditOutlined,
  BankOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  MailOutlined,
  PhoneOutlined,
  StopOutlined,
  SyncOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Card, Typography } from 'antd'
import { useMemo } from 'react'
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
  tocTitle: 'MỤC LỤC',
  supportTitle: 'Cần hỗ trợ?',
  supportText: 'Nếu bạn có bất kỳ câu hỏi nào về Điều khoản dịch vụ, vui lòng liên hệ với chúng tôi.',
  supportButtonLabel: 'Liên hệ ngay',
  contentMoreLabel: 'Xem tất cả điều khoản chi tiết bên dưới',
}

const SECTION_ICON_MAP = {
  audit: <AuditOutlined />,
  bank: <BankOutlined />,
  'close-circle': <CloseCircleOutlined />,
  'credit-card': <CreditCardOutlined />,
  database: <DatabaseOutlined />,
  'file-done': <FileDoneOutlined />,
  'file-text': <FileTextOutlined />,
  mail: <MailOutlined />,
  phone: <PhoneOutlined />,
  stop: <StopOutlined />,
  sync: <SyncOutlined />,
  user: <UserOutlined />,
  warning: <ExclamationCircleOutlined />,
}

export default function TermsOfServicePage() {
  const pageContent = useStaticPageContent('terms-of-service', defaultTermsContent)
  const hero = pageContent.hero || defaultTermsContent.hero
  const sections = useMemo(
    () =>
      Array.isArray(pageContent.sections)
        ? pageContent.sections.map((section) => ({
            ...section,
            icon: SECTION_ICON_MAP[section.iconKey] || <FileDoneOutlined />,
          }))
        : [],
    [pageContent.sections],
  )

  return (
    <LegalDocumentLayout
      sections={sections}
      title={hero.title}
      subtitle={hero.subtitle}
      updatedLabel={hero.eyebrow}
      backgroundImage={hero.backgroundImage}
      tocTitle={pageContent.tocTitle || defaultTermsContent.tocTitle}
      supportTitle={pageContent.supportTitle || defaultTermsContent.supportTitle}
      supportText={pageContent.supportText || defaultTermsContent.supportText}
      supportButtonLabel={pageContent.supportButtonLabel || defaultTermsContent.supportButtonLabel}
      contentMoreLabel={pageContent.contentMoreLabel || defaultTermsContent.contentMoreLabel}
    >
      {({ registerSection, visibleContentIds }) => (
        <>
          {visibleContentIds.has('acceptance') ? (
          <LegalSection id="acceptance" section={sections[0]} registerSection={registerSection} className="pb-12">
            {(pageContent.acceptanceParagraphs || []).map((paragraph) => (
              <Paragraph key={paragraph} className="!text-base !leading-8 !text-slate-700">
                {paragraph}
              </Paragraph>
            ))}
            <Card className="!mt-6 !rounded-lg !border-[#ffd5dc] !bg-[#fff7f8] !shadow-none" bodyStyle={{ padding: 22 }}>
              <Text className="!block !font-extrabold !uppercase !text-[#d8001e]">{pageContent.acceptanceNoticeTitle}</Text>
              <Paragraph className="!mt-2 !mb-0 !text-sm !leading-7 !text-slate-700">
                {pageContent.acceptanceNotice}
              </Paragraph>
            </Card>
          </LegalSection>
          ) : null}

          {visibleContentIds.has('service-rules') ? (
          <LegalSection id="service-rules" section={sections[1]} registerSection={registerSection}>
            <Paragraph className="!text-base !leading-8 !text-slate-700">
              {pageContent.serviceRulesIntro}
            </Paragraph>
            <BulletList items={pageContent.serviceRules || []} />
          </LegalSection>
          ) : null}

          {visibleContentIds.has('account') ? (
          <LegalSection id="account" section={sections[2]} registerSection={registerSection}>
            <BulletList items={pageContent.accountItems || []} />
          </LegalSection>
          ) : null}

          {visibleContentIds.has('booking') ? (
          <LegalSection id="booking" section={sections[3]} registerSection={registerSection}>
            <div className="grid gap-5 md:grid-cols-2">
              {(pageContent.bookingCards || []).map((item) => (
                <InfoCard key={item.title} {...item} icon={SECTION_ICON_MAP[item.iconKey] || <BankOutlined />} />
              ))}
            </div>
          </LegalSection>
          ) : null}

          {visibleContentIds.has('payment') ? (
          <LegalSection id="payment" section={sections[4]} registerSection={registerSection}>
            <div className="grid gap-5 md:grid-cols-3">
              {(pageContent.paymentCards || []).map((item) => (
                <InfoCard key={item.title} {...item} icon={SECTION_ICON_MAP[item.iconKey] || <CreditCardOutlined />} />
              ))}
            </div>
          </LegalSection>
          ) : null}

          {visibleContentIds.has('responsibilities') ? (
          <LegalSection id="responsibilities" section={sections[5]} registerSection={registerSection}>
            <div className="grid overflow-hidden rounded-lg border border-[#ffd5dc] md:grid-cols-2">
              <div className="bg-[#fff7f8] p-5">
                <Text className="!font-extrabold !text-[#d8001e]">{pageContent.responsibilities?.restaurant?.title}</Text>
                <BulletList compact items={pageContent.responsibilities?.restaurant?.items || []} />
              </div>
              <div className="p-5">
                <Text className="!font-extrabold !text-[#1C1C1E]">{pageContent.responsibilities?.user?.title}</Text>
                <BulletList compact items={pageContent.responsibilities?.user?.items || []} />
              </div>
            </div>
          </LegalSection>
          ) : null}

          {visibleContentIds.has('content') ? (
          <LegalSection id="content" section={sections[6]} registerSection={registerSection}>
            {(pageContent.contentParagraphs || []).map((paragraph) => (
              <Paragraph key={paragraph} className="!text-base !leading-8 !text-slate-700">
                {paragraph}
              </Paragraph>
            ))}
          </LegalSection>
          ) : null}

          {visibleContentIds.has('limitation') ? (
          <LegalSection id="limitation" section={sections[7]} registerSection={registerSection}>
            <BulletList items={pageContent.limitationItems || []} />
          </LegalSection>
          ) : null}

          {visibleContentIds.has('changes') ? (
          <LegalSection id="changes" section={sections[8]} registerSection={registerSection}>
            {(pageContent.changesParagraphs || []).map((paragraph) => (
              <Paragraph key={paragraph} className="!text-base !leading-8 !text-slate-700">
                {paragraph}
              </Paragraph>
            ))}
          </LegalSection>
          ) : null}

          {visibleContentIds.has('termination') ? (
          <LegalSection id="termination" section={sections[9]} registerSection={registerSection}>
            {(pageContent.terminationParagraphs || []).map((paragraph) => (
              <Paragraph key={paragraph} className="!text-base !leading-8 !text-slate-700">
                {paragraph}
              </Paragraph>
            ))}
          </LegalSection>
          ) : null}

          {visibleContentIds.has('contact') ? (
          <LegalSection id="contact" section={sections[10]} registerSection={registerSection} isLast>
            <Paragraph className="!text-base !leading-8 !text-slate-700">
              {pageContent.contactIntro}
            </Paragraph>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {(pageContent.contactMethods || []).map((item) => (
                <div key={item.text} className="flex items-center gap-3 rounded-lg bg-[#fff1f3] px-5 py-4 font-bold text-[#8B0000]">
                  {SECTION_ICON_MAP[item.iconKey] || <MailOutlined />}
                  {item.text}
                </div>
              ))}
            </div>
          </LegalSection>
          ) : null}
        </>
      )}
    </LegalDocumentLayout>
  )
}

function LegalSection({ id, section, registerSection, children, className = 'py-12', isLast = false }) {
  return (
    <section
      id={id}
      ref={(node) => {
        registerSection(id, node)
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
