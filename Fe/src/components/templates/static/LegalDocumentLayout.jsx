import { CustomerServiceOutlined, DownOutlined, UpOutlined } from '@ant-design/icons'
import { Button, Card, Typography } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'

const { Paragraph, Text, Title } = Typography

export function LegalSectionHeading({ section }) {
  return (
    <div className="mb-7 flex items-center gap-5">
      <Text className="!text-3xl !font-black !text-[#d8001e]">{section.number}</Text>
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#fff1f3] text-2xl text-[#d8001e]">
        {section.icon}
      </span>
      <Title level={2} className="!mb-0 !text-2xl !font-extrabold !text-[#1C1C1E] md:!text-3xl">
        {section.title}
      </Title>
    </div>
  )
}

export function LegalIconParagraph({ icon, title, text }) {
  return (
    <div className="flex gap-5">
      <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fff1f3] text-lg text-[#d8001e]">
        {icon}
      </span>
      <div>
        <Text className="!font-extrabold !text-[#1C1C1E]">{title}</Text>
        <Paragraph className="!mt-1 !mb-0 !text-base !leading-8 !text-slate-700">{text}</Paragraph>
      </div>
    </div>
  )
}

export default function LegalDocumentLayout({
  sections,
  title,
  subtitle,
  updatedLabel = 'Last updated: October 2023',
  backgroundImage = '/headbgPrivacy.png',
  supportTitle = 'Bạn có thắc mắc?',
  supportText = 'Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn.',
  contentMoreLabel = 'Xem tất cả nội dung chi tiết bên dưới',
  children,
}) {
  const sectionRefs = useRef({})
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '')
  const [isContentExpanded, setIsContentExpanded] = useState(false)
  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections])
  const visibleContentIds = useMemo(
    () => new Set((isContentExpanded ? sections : sections.slice(0, 6)).map((section) => section.id)),
    [isContentExpanded, sections],
  )
  const canExpandContent = sections.length > 6

  useEffect(() => {
    const updateActiveSection = () => {
      const viewportMarker = window.innerHeight * 0.42
      let nextActive = activeSection
      let bestVisible = { id: activeSection, ratio: 0 }

      sectionIds.forEach((id) => {
        const element = sectionRefs.current[id]
        if (!element) return

        const rect = element.getBoundingClientRect()
        const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
        const visibleRatio = Math.max(0, visibleHeight) / Math.max(rect.height, 1)

        if (rect.top <= viewportMarker && rect.bottom >= viewportMarker) {
          nextActive = id
        }

        if (visibleRatio > bestVisible.ratio) {
          bestVisible = { id, ratio: visibleRatio }
        }
      })

      setActiveSection(nextActive || bestVisible.id)
    }

    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)

    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [activeSection, sectionIds])

  const jumpToSection = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const toggleContent = () => {
    if (isContentExpanded) {
      setIsContentExpanded(false)
      window.setTimeout(() => {
        const sixthSectionId = sections[5]?.id
        if (sixthSectionId) {
          sectionRefs.current[sixthSectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 0)
      return
    }

    setIsContentExpanded(true)
  }

  return (
    <div className="bg-[#fffafa] text-[#1C1C1E]">
      <section className="relative min-h-[360px] overflow-hidden md:min-h-[430px]">
        <img
          src={backgroundImage}
          alt="Không gian Sakura Restaurant"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/66" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/92 via-white/70 to-white/32" />
        <div className="relative z-10 mx-auto flex min-h-[360px] max-w-7xl flex-col justify-center px-5 pt-8 md:min-h-[430px] md:px-8 xl:px-10">
          <div className="mb-5 flex items-center gap-4">
            <span className="h-0.5 w-12 bg-[#d8001e]" />
            <Text className="!text-sm !font-extrabold !uppercase !tracking-[0.08em] !text-[#d8001e]">
              {updatedLabel}
            </Text>
          </div>
          <Title level={1} className="!mb-4 !max-w-4xl !text-3xl !font-extrabold !leading-tight !tracking-tight !text-[#090b16] md:!text-4xl xl:!text-5xl">
            {title}
          </Title>
          <Text className="!text-lg !font-bold !text-slate-700">{subtitle}</Text>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-16 grid max-w-7xl gap-0 px-5 pb-16 md:-mt-24 md:grid-cols-12 md:px-8 xl:-mt-28 xl:px-10">
        <aside className="md:col-span-3">
          <div className="sticky top-24 z-20 rounded-t-3xl border border-[#eee3e3] bg-white/95 p-5 shadow-[0_18px_46px_rgba(17,24,39,0.08)] backdrop-blur md:min-h-[calc(100vh-7rem)] md:rounded-l-3xl md:rounded-r-none">
            <Title level={2} className="!mb-7 !text-lg !font-extrabold !text-[#1C1C1E]">
              MỤC LỤC
            </Title>

            <nav className="relative flex gap-3 overflow-x-auto pb-2 md:block md:overflow-visible md:pb-0">
              <div className="absolute left-[23px] top-4 hidden h-[calc(100%-2rem)] w-px bg-slate-200 md:block" />
              {sections.map((section) => {
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => jumpToSection(section.id)}
                    className={[
                      'relative flex min-w-[230px] items-center gap-4 rounded-xl px-2 py-3 text-left transition-all duration-300 md:min-w-0',
                      isActive ? 'text-[#d8001e]' : 'text-[#4A4A4A] hover:text-[#900020]',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border bg-white text-lg transition-all duration-300',
                        isActive
                          ? 'border-[#ffd5dc] bg-[#fff1f3] text-[#d8001e] shadow-[0_8px_18px_rgba(216,0,30,0.12)]'
                          : 'border-slate-200 text-[#4A4A4A]',
                      ].join(' ')}
                    >
                      {section.icon}
                    </span>
                    {isActive ? (
                      <span className="absolute left-[-5px] top-1/2 hidden h-9 w-1 -translate-y-1/2 rounded-full bg-[#d8001e] md:block" />
                    ) : null}
                    <span className="text-sm font-extrabold">{section.number} {section.title}</span>
                  </button>
                )
              })}
            </nav>

            <Card className="!mt-10 hidden !rounded-xl !border-[#ffd9de] !bg-[#fff7f8] !shadow-none md:block" bodyStyle={{ padding: 22 }}>
              <div className="text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fff1f3] text-3xl text-[#d8001e]">
                  <CustomerServiceOutlined />
                </span>
                <Text className="!mt-5 !block !font-extrabold !text-[#1C1C1E]">{supportTitle}</Text>
                <Paragraph className="!mt-4 !text-sm !leading-6 !text-slate-600">{supportText}</Paragraph>
                <Button className="!mt-3 !h-11 !w-full !rounded-lg !border-[#eee3e3] !bg-white !font-bold !text-[#d8001e] hover:!border-[#d8001e] hover:!bg-[#fff1f3]">
                  Liên hệ ngay
                </Button>
              </div>
            </Card>
          </div>
        </aside>

        <main className="md:col-span-9">
          <div className="rounded-b-3xl border border-[#eee3e3] bg-white px-5 py-8 shadow-[0_18px_46px_rgba(17,24,39,0.08)] md:rounded-l-none md:rounded-r-3xl md:border-l-0 md:px-10 md:py-10 xl:px-14">
            {children({ sectionRefs, visibleContentIds, isContentExpanded })}
            {canExpandContent ? (
              <button
                type="button"
                onClick={toggleContent}
                className="mt-14 flex w-full items-center justify-between rounded-xl border border-[#f4d9de] bg-[#fff7f8] px-6 py-4 text-left text-base font-extrabold text-[#d8001e] shadow-[0_8px_18px_rgba(216,0,30,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d8001e] hover:bg-[#fff1f3]"
              >
                <span>{isContentExpanded ? 'Thu gọn nội dung' : contentMoreLabel}</span>
                {isContentExpanded ? <UpOutlined /> : <DownOutlined />}
              </button>
            ) : null}
          </div>
        </main>
      </section>
    </div>
  )
}
