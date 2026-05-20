import React, { useEffect, useRef, useState } from 'react'
import { Avatar, Button, Card, Input, Tag } from 'antd'
import {
  CloseOutlined,
  ExpandAltOutlined,
  MessageOutlined,
  RedoOutlined,
  SendOutlined,
  ShrinkOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { sendChatMessage } from '../../services/chatApi.js'

const DEFAULT_SUGGESTIONS = [
  {
    label: 'Món bán chạy',
    prompt: 'Giúp tôi xem các món bán chạy nhất.',
  },
  {
    label: 'Món cho 2 người',
    prompt: 'Gợi ý giúp tôi các món phù hợp cho 2 người.',
  },
  {
    label: 'Hướng dẫn AR',
    prompt: 'Hướng dẫn tôi cách xem AR món ăn.',
  },
  {
    label: 'Giờ mở cửa',
    prompt: 'Nhà hàng mở cửa khi nào?',
  },
]

function buildWelcomeMessage() {
  return {
    id: `welcome-${Date.now()}`,
    text: 'Xin chào! Mình có thể gợi ý món, hướng dẫn xem AR, hỗ trợ đặt bàn và giải đáp thông tin nhà hàng theo đúng thực đơn hiện có của Sakura.',
    sender: 'ai',
    suggestions: DEFAULT_SUGGESTIONS,
    actions: [
      { type: 'navigate', label: 'Xem thực đơn', path: '/' },
      { type: 'navigate', label: 'Trải nghiệm AR', path: '/ar' },
    ],
    cards: [],
  }
}

function getSuggestionLabel(suggestion) {
  if (typeof suggestion === 'string') return suggestion.trim()
  return String(suggestion?.label || suggestion?.prompt || '').trim()
}

function getSuggestionPrompt(suggestion) {
  if (typeof suggestion === 'object' && suggestion?.prompt) {
    return String(suggestion.prompt).trim()
  }

  return getSuggestionLabel(suggestion)
}

function getLatestAssistantMessageId(messages) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.sender === 'ai') return messages[index].id
  }
  return null
}

function HeaderIconButton({ icon, title, onClick }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-white/18"
    >
      {icon}
    </button>
  )
}

export default function ChatbotWidget() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [conversationId, setConversationId] = useState('')
  const [messages, setMessages] = useState([buildWelcomeMessage()])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const isAdminPage = location.pathname.startsWith('/admin')
  const latestAssistantMessageId = getLatestAssistantMessageId(messages)
  const hasUserMessages = messages.some((message) => message.sender === 'user')

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isLoading, isOpen, messages])

  useEffect(() => {
    if (!isExpanded || typeof document === 'undefined') return undefined

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    return () => {
      body.style.overflow = previousOverflow
    }
  }, [isExpanded])

  if (isAdminPage) return null

  const resetConversation = () => {
    setConversationId('')
    setInputValue('')
    setIsLoading(false)
    setMessages([buildWelcomeMessage()])
  }

  const pushAssistantMessage = (payload) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `ai-${Date.now()}`,
        text:
          payload?.reply ||
          'Mình chưa nhận được phản hồi từ máy chủ, bạn thử lại sau ít phút hoặc dùng các nút điều hướng bên dưới nhé.',
        sender: 'ai',
        suggestions: Array.isArray(payload?.suggestions) ? payload.suggestions : [],
        actions: Array.isArray(payload?.actions) ? payload.actions : [],
        cards: Array.isArray(payload?.cards) ? payload.cards : [],
      },
    ])
  }

  const handleSend = async (rawMessage = inputValue) => {
    const nextMessage = String(rawMessage || '').trim()
    if (!nextMessage || isLoading) return

    setInputValue('')
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        text: nextMessage,
        sender: 'user',
        suggestions: [],
        actions: [],
        cards: [],
      },
    ])
    setIsLoading(true)

    try {
      const res = await sendChatMessage({
        message: nextMessage,
        conversationId,
        currentPath: `${location.pathname}${location.search || ''}`,
      })

      if (res?.success) {
        if (res.conversationId) setConversationId(res.conversationId)
        pushAssistantMessage(res)
      } else {
        pushAssistantMessage({
          reply: 'Mình chưa lấy được phản hồi đầy đủ, nhưng bạn vẫn có thể xem thực đơn, AR hoặc liên hệ nhà hàng ngay từ các nút bên dưới.',
          suggestions: [],
          actions: [
            { type: 'navigate', label: 'Xem thực đơn', path: '/' },
            { type: 'navigate', label: 'Liên hệ', path: '/contact' },
          ],
        })
      }
    } catch {
      pushAssistantMessage({
        reply: 'Kết nối tới máy chủ chatbot đang gián đoạn. Bạn thử lại sau ít phút hoặc dùng nhanh các mục thực đơn, AR và liên hệ nhé.',
        suggestions: [],
        actions: [
          { type: 'navigate', label: 'Xem thực đơn', path: '/' },
          { type: 'navigate', label: 'Liên hệ', path: '/contact' },
        ],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleActionClick = (action) => {
    if (!action) return

    if (action.type === 'navigate' && action.path) {
      navigate(action.path)
      return
    }

    if (action.type === 'prompt') {
      handleSend(action.prompt || action.label)
    }
  }

  const renderCards = (cards, messageId) => {
    if (!cards?.length) return null

    return (
      <div className="mt-3 space-y-2.5">
        {cards.map((card, index) => (
          <div
            key={`${messageId}-card-${index}`}
            className="overflow-hidden rounded-[22px] border border-[#eedccf] bg-[linear-gradient(180deg,#fffefd_0%,#fff8f4_100%)] shadow-[0_14px_28px_rgba(62,28,18,0.06)]"
          >
            {card.imageUrl ? (
              <div className="h-28 w-full overflow-hidden bg-[#f3ece6]">
                <img src={card.imageUrl} alt={card.title} className="h-full w-full object-cover" />
              </div>
            ) : null}

            <div className="p-3.5">
              <p className="m-0 font-[var(--font-heading)] text-lg leading-none text-[#241512]">{card.title}</p>
              {card?.subtitle ? (
                <p className="m-0 mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a13d2f]">
                  {card.subtitle}
                </p>
              ) : null}
              <p className="mt-2 mb-0 text-xs leading-5 text-[#6b5148]">{card.description}</p>

              {card.badges?.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {card.badges.map((badge) => (
                    <Tag
                      key={`${card.title}-${badge}`}
                      className="!m-0 !rounded-full !border-[#e7d3c5] !bg-white/90 !px-2 !py-0.5 !text-[10px] !font-semibold !uppercase !tracking-[0.12em] !text-[#7f241f]"
                    >
                      {badge}
                    </Tag>
                  ))}
                </div>
              ) : null}

              {card.actions?.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {card.actions.map((action) => (
                    <Button
                      key={`${card.title}-${action.label}`}
                      size="small"
                      onClick={() => handleActionClick(action)}
                      className="!rounded-full !border-[#e6c4b9] !bg-white !text-[11px] !font-semibold !text-[#7f241f] hover:!border-[#bf5c48] hover:!text-[#8b0000]"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderMessageControls = (message) => {
    if (message.sender !== 'ai') return null
    if (message.id !== latestAssistantMessageId) return null

    return (
      <>
        {renderCards(message.cards, message.id)}

        {message.actions?.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.actions.map((action) => (
              <Button
                key={`${message.id}-${action.label}`}
                size="small"
                type="default"
                onClick={() => handleActionClick(action)}
                className="!rounded-full !border-[#e7cbc2] !bg-[#fffdfa] !text-[11px] !font-semibold !text-[#8b0000] hover:!border-[#c46754] hover:!text-[#8b0000]"
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}

        {message.suggestions?.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggestions.map((suggestion) => {
              const suggestionLabel = getSuggestionLabel(suggestion)
              const suggestionPrompt = getSuggestionPrompt(suggestion)

              return (
              <button
                key={`${message.id}-${suggestionLabel}`}
                type="button"
                onClick={() => handleSend(suggestionPrompt)}
                className="rounded-full border border-dashed border-[#dfc0b4] bg-[#fffaf6] px-3 py-1.5 text-[11px] font-semibold text-[#8f3126] transition-colors hover:border-[#b94939] hover:bg-[#fff2ea] hover:text-[#8b0000]"
                disabled={isLoading}
              >
                {suggestionLabel}
              </button>
              )
            })}
          </div>
        ) : null}
      </>
    )
  }

  const shellClassName = isExpanded
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-[#130b08]/45 p-4 backdrop-blur-[2px]'
    : 'fixed bottom-5 right-5 z-50'

  const cardStyle = isExpanded
    ? {
        width: 'min(820px, calc(100vw - 32px))',
        height: 'min(86vh, 900px)',
        display: 'flex',
        flexDirection: 'column',
      }
    : {
        width: 'min(420px, calc(100vw - 24px))',
        height: 'min(74vh, 660px)',
        display: 'flex',
        flexDirection: 'column',
      }

  return (
    <>
      {isOpen ? (
        <div className={shellClassName}>
          <Card
            className="overflow-hidden !rounded-[30px] !border-0 shadow-[0_30px_80px_rgba(28,13,8,0.22)]"
            bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
            style={cardStyle}
          >
            <div className="shrink-0 border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,221,185,0.22),transparent_34%),linear-gradient(135deg,#5f0009_0%,#8b0000_40%,#bd1f17_72%,#e87041_100%)] px-4 py-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0.08))] ring-1 ring-white/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                    <MessageOutlined className="text-[22px] text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="m-0 truncate font-[var(--font-heading)] text-[24px] font-semibold leading-none text-white">
                        Sakura Assistant
                      </h4>
                    </div>

                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <HeaderIconButton
                    icon={<RedoOutlined />}
                    title="Làm mới hội thoại"
                    onClick={resetConversation}
                  />
                  <HeaderIconButton
                    icon={isExpanded ? <ShrinkOutlined /> : <ExpandAltOutlined />}
                    title={isExpanded ? 'Thu nhỏ cửa sổ chat' : 'Phóng to cửa sổ chat'}
                    onClick={() => setIsExpanded((prev) => !prev)}
                  />
                  <HeaderIconButton
                    icon={<CloseOutlined />}
                    title="Đóng chatbot"
                    onClick={() => {
                      setIsExpanded(false)
                      setIsOpen(false)
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              className="chatbot-widget__scroll flex-1 overflow-y-auto bg-[linear-gradient(180deg,#fbf4ef_0%,#fffdfb_18%,#fffaf8_100%)] px-4 py-4"
              style={{
                minHeight: 0,
                scrollbarGutter: 'stable',
                overscrollBehavior: 'contain',
              }}
            >


              <div className="flex flex-col gap-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'ai' ? (
                      <Avatar
                        icon={<MessageOutlined />}
                        size="small"
                        className="mt-1 shrink-0 border border-[#ead7c9] bg-[#fff6ef] !text-[#8b0000]"
                      />
                    ) : null}

                    <div className={message.sender === 'user' ? 'max-w-[82%]' : 'max-w-[86%]'}>
                      <div
                        className={`rounded-2xl p-3 ${
                          message.sender === 'user'
                            ? 'rounded-tr-none bg-[linear-gradient(135deg,#6f0914_0%,#a01020_55%,#d64133_100%)] text-white shadow-[0_14px_30px_rgba(128,15,23,0.2)]'
                            : 'rounded-tl-none border border-[#eadfd7] bg-white text-[#2f241f] shadow-[0_10px_20px_rgba(33,18,11,0.05)]'
                        }`}
                        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '14px', lineHeight: 1.75 }}
                      >
                        {message.text}
                      </div>

                      {renderMessageControls(message)}
                    </div>
                  </div>
                ))}

                {isLoading ? (
                  <div className="flex gap-2 justify-start">
                    <Avatar
                      icon={<MessageOutlined />}
                      size="small"
                      className="mt-1 shrink-0 border border-[#ead7c9] bg-[#fff6ef] !text-[#8b0000]"
                    />
                    <div className="rounded-2xl rounded-tl-none border border-[#eadfd7] bg-white p-3 shadow-[0_10px_20px_rgba(33,18,11,0.05)]">
                      <div className="flex h-5 items-center gap-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-[#c87563]" />
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-[#c87563]"
                          style={{ animationDelay: '0.2s' }}
                        />
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-[#c87563]"
                          style={{ animationDelay: '0.4s' }}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 border-t border-[#ece3de] bg-[linear-gradient(180deg,#fffdfa_0%,#fff7f2_100%)] p-4">
              {hasUserMessages ? (
                <p className="mb-2 text-[11px] font-medium tracking-[0.01em] text-[#7c665b]">
                  Hỏi về món ăn, AR, đặt bàn, thanh toán hoặc bài viết.
                </p>
              ) : null}

              <div className="flex items-end gap-2">
                <Input
                  placeholder="Nhập câu hỏi về món ăn hoặc nhà hàng..."
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onPressEnter={() => handleSend()}
                  disabled={isLoading}
                  className="rounded-full"
                  size="large"
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<SendOutlined />}
                  onClick={() => handleSend()}
                  loading={isLoading}
                  className="!h-12 !w-12 !min-w-12 !border-0 !bg-[linear-gradient(135deg,#7a0614_0%,#bd1f17_72%,#e05f35_100%)] shadow-[0_14px_30px_rgba(139,0,0,0.24)]"
                />
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {!isOpen ? (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3">
          <div className="hidden rounded-full border border-[#ead6c9] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,247,241,0.98))] px-4 py-2 text-sm shadow-[0_14px_30px_rgba(31,17,11,0.09)] backdrop-blur md:block">
            <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9b5e4d]">Sakura Concierge</p>
            <p className="m-0 text-sm font-semibold text-[#6d201a]">Hỏi món, AR, đặt bàn</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(true)
              setIsExpanded(false)
            }}
            className="group relative flex h-[68px] w-[68px] items-center justify-center rounded-[24px] border border-white/25 bg-[radial-gradient(circle_at_30%_30%,rgba(255,236,214,0.35),transparent_28%),linear-gradient(145deg,#64000d_0%,#98061c_55%,#de4d31_100%)] shadow-[0_20px_42px_rgba(139,0,0,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_54px_rgba(139,0,0,0.34)]"
          >
            <span className="absolute inset-0 rounded-[24px] bg-white/8 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#ffe0a6] shadow-[0_0_0_4px_rgba(255,255,255,0.12)]" />
            <MessageOutlined className="relative z-10 text-[28px] text-white" />
          </button>
        </div>
      ) : null}
    </>
  )
}
