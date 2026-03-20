'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

type Screen = 'landing' | 'chat' | 'summary'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Summary {
  headline: string
  cognitive_style: string
  values_pattern: string
  open_question: string
}

const INITIAL_BOT_MESSAGE = `בוא נעשה משהו קצת שונה.
אשאל אותך ארבעה תרחישים. אחרי כל אחד — שאלה אחת.
אין נכון ואין לא נכון.
בסוף אציע לך שתי הצעות על מה ששמעתי — ואתה תגיד לי אם הן מרגישות נכון.
מוכן?`

// ---- Logo Component ----
function Logo({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="#1BAED9" />
      <polygon points="40,18 58,50 22,50" fill="#E3001B" />
      <text x="40" y="68" textAnchor="middle" fill="white" fontSize="9" fontFamily="Heebo" fontWeight="600">מנהיגות נבחרת</text>
    </svg>
  )
}

// ---- Landing Screen ----
function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-white">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
        <Logo size={88} />
        <div>
          <h1 className="text-3xl font-bold text-[#1BAED9] mb-3 leading-tight">
            הפרסונה הפוליטית שלי
          </h1>
          <p className="text-gray-500 text-base leading-relaxed">
            שיחה קצרה שמנכיחה מחשבות שלא ידעת שיש לך
          </p>
        </div>
        <button
          onClick={onStart}
          className="w-full bg-[#1BAED9] hover:bg-[#1599c0] text-white font-semibold text-lg py-4 px-8 rounded-2xl transition-colors duration-200 shadow-md hover:shadow-lg mt-2"
        >
          בואי נתחיל
        </button>
        <p className="text-gray-400 text-sm">כ-8 דקות • אין תשובות נכונות</p>
      </div>
    </div>
  )
}

// ---- Typing Indicator ----
function TypingIndicator() {
  return (
    <div className="flex items-end gap-1 px-4 py-3 bg-[#E8F7FC] rounded-2xl rounded-tr-sm w-fit max-w-xs">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  )
}

// ---- Chat Screen ----
function ChatScreen({
  messages,
  input,
  setInput,
  isLoading,
  onSend,
  onEnd,
}: {
  messages: Message[]
  input: string
  setInput: (v: string) => void
  isLoading: boolean
  onSend: () => void
  onEnd: () => void
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const userCount = messages.filter(m => m.role === 'user').length
  const showEnd = userCount >= 4

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Auto-resize
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <Logo size={36} />
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-800">הפרסונה הפוליטית שלי</h2>
          <p className="text-xs text-gray-400">שיחה אישית ופרטית</p>
        </div>
        {showEnd && (
          <button
            onClick={onEnd}
            className="text-xs text-gray-400 hover:text-[#1BAED9] border border-gray-200 hover:border-[#1BAED9] rounded-xl px-3 py-1.5 transition-colors"
          >
            סיים שיחה
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 chat-scroll flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`
                max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed message-text
                ${msg.role === 'assistant'
                  ? 'bg-[#E8F7FC] text-gray-800 rounded-tl-sm'
                  : 'bg-white border border-[#1BAED9] text-gray-800 rounded-tr-sm'
                }
              `}
            >
              {msg.content || (msg.role === 'assistant' && isLoading ? '' : msg.content)}
            </div>
          </div>
        ))}

        {/* Typing indicator — shown when loading and last message is not empty assistant */}
        {isLoading && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-end">
            <TypingIndicator />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 shadow-sm">
        {showEnd && (
          <p className="text-xs text-center text-gray-400 mb-2">
            השיחה הגיעה לנקודה מעניינת.{' '}
            <button onClick={onEnd} className="text-[#1BAED9] hover:underline">
              לחצי כאן לסיכום
            </button>
          </p>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="כתוב את תשובתך..."
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#1BAED9] disabled:bg-gray-50 disabled:text-gray-400 leading-relaxed max-h-[120px] overflow-y-auto"
            style={{ direction: 'rtl' }}
          />
          <button
            onClick={onSend}
            disabled={isLoading || !input.trim()}
            className="bg-[#1BAED9] hover:bg-[#1599c0] disabled:bg-gray-200 text-white rounded-2xl p-3 transition-colors flex-shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Summary Screen ----
function SummaryScreen({
  summary,
  isLoading,
  onReset,
}: {
  summary: Summary | null
  isLoading: boolean
  onReset: () => void
}) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-8 px-4">
      {/* Print version (hidden on screen, visible in print) */}
      <div className="print-summary fixed inset-0 bg-white p-8" id="print-area">
        <div style={{ direction: 'rtl', fontFamily: 'Heebo, sans-serif' }}>
          <h1 style={{ color: '#1BAED9', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            הפרסונה הפוליטית שלי
          </h1>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '24px' }}>מנהיגות נבחרת</p>
          {summary && (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1a1a1a' }}>
                {summary.headline}
              </h2>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontWeight: '600', color: '#1BAED9', marginBottom: '6px' }}>סגנון קוגניטיבי</p>
                <p style={{ color: '#333', lineHeight: '1.6' }}>{summary.cognitive_style}</p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontWeight: '600', color: '#1BAED9', marginBottom: '6px' }}>דפוס ערכי</p>
                <p style={{ color: '#333', lineHeight: '1.6' }}>{summary.values_pattern}</p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontWeight: '600', color: '#1BAED9', marginBottom: '6px' }}>שאלה לקחת הביתה</p>
                <p style={{ color: '#333', lineHeight: '1.6', fontStyle: 'italic' }}>{summary.open_question}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Screen version */}
      <div className="w-full max-w-sm no-print">
        <div className="flex items-center gap-3 mb-6">
          <Logo size={44} />
          <div>
            <h1 className="text-lg font-bold text-[#1BAED9]">הפרסונה הפוליטית שלך</h1>
            <p className="text-xs text-gray-400">מנהיגות נבחרת</p>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex gap-1">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
              <p className="text-gray-400 text-sm">מעבד את השיחה...</p>
            </div>
          </div>
        ) : summary ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Headline */}
            <div className="bg-[#1BAED9] px-6 py-5">
              <p className="text-white text-xs font-medium mb-1 opacity-80">הכותרת שלך</p>
              <h2 className="text-white text-xl font-bold leading-tight">{summary.headline}</h2>
            </div>

            {/* Cards */}
            <div className="p-5 flex flex-col gap-5">
              <SummarySection
                title="סגנון קוגניטיבי"
                content={summary.cognitive_style}
                icon="🧭"
              />
              <div className="h-px bg-gray-100" />
              <SummarySection
                title="דפוס ערכי"
                content={summary.values_pattern}
                icon="⚖️"
              />
              <div className="h-px bg-gray-100" />
              <SummarySection
                title="שאלה לקחת הביתה"
                content={summary.open_question}
                icon="💡"
                italic
              />
            </div>
          </div>
        ) : null}

        {/* Buttons */}
        <div className="flex flex-col gap-3 mt-5">
          <button
            onClick={handlePrint}
            disabled={isLoading || !summary}
            className="w-full bg-[#1BAED9] hover:bg-[#1599c0] disabled:bg-gray-200 text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="8 17 12 21 16 17" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" />
            </svg>
            הורד סיכום
          </button>
          <button
            onClick={onReset}
            className="w-full border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 font-medium py-3 rounded-2xl transition-colors"
          >
            שיחה חדשה
          </button>
        </div>
      </div>
    </div>
  )
}

function SummarySection({
  title,
  content,
  icon,
  italic = false,
}: {
  title: string
  content: string
  icon: string
  italic?: boolean
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{icon}</span>
        <p className="text-[#1BAED9] font-semibold text-sm">{title}</p>
      </div>
      <p className={`text-gray-700 text-sm leading-relaxed ${italic ? 'italic' : ''}`}>
        {content}
      </p>
    </div>
  )
}

// ---- Main Page ----
export default function HomePage() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: INITIAL_BOT_MESSAGE },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages([...newMessages, { role: 'assistant', content: '' }])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!response.ok) throw new Error('Network response was not ok')
      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantContent += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantContent }
          return updated
        })
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'מצטער, הייתה שגיאה טכנית. נסה שוב.',
        }
        return updated
      })
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages])

  const endConversation = useCallback(async () => {
    setScreen('summary')
    setIsSummaryLoading(true)

    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      })
      const data = await response.json()
      setSummary(data)
    } catch {
      setSummary({
        headline: 'מנהיג עם קומפס ערכי ברור',
        cognitive_style: 'לא ניתן לטעון את הסיכום. נסה שוב.',
        values_pattern: 'לא ניתן לטעון את הסיכום. נסה שוב.',
        open_question: 'השיחה שלך נשמרה.',
      })
    } finally {
      setIsSummaryLoading(false)
    }
  }, [messages])

  const handleReset = () => {
    setScreen('landing')
    setMessages([{ role: 'assistant', content: INITIAL_BOT_MESSAGE }])
    setInput('')
    setSummary(null)
  }

  if (screen === 'landing') {
    return <LandingScreen onStart={() => setScreen('chat')} />
  }

  if (screen === 'chat') {
    return (
      <ChatScreen
        messages={messages}
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        onSend={sendMessage}
        onEnd={endConversation}
      />
    )
  }

  return (
    <SummaryScreen
      summary={summary}
      isLoading={isSummaryLoading}
      onReset={handleReset}
    />
  )
}
