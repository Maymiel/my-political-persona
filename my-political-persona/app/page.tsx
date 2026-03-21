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
  archetype_name: string
  archetype_subtitle: string
  driver_hebrew: string
  axis_x: number
  axis_y: number
  promise: string
  shadow: string
  key_quote: string
}

const INITIAL_MESSAGE = `בוא נעשה משהו קצת שונה.
ארבעה תרחישים. אחרי כל אחד — שאלה או שתיים.
אין נכון ואין לא נכון.
בסוף אציע לך מה שאני שומע — ואתה תגיד לי אם זה נוחת.
מוכן?`

function Logo({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="40" fill="#1BAED9" />
      <polygon points="40,18 58,50 22,50" fill="#E3001B" />
      <text x="40" y="68" textAnchor="middle" fill="white" fontSize="9" fontFamily="Heebo" fontWeight="600">
        מנהיגות נבחרת
      </text>
    </svg>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-1 px-4 py-3 bg-[#E8F7FC] rounded-2xl rounded-tr-sm w-fit">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block w-2 h-2 bg-[#1BAED9] rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

function AxisBar({ value, leftLabel, rightLabel, color }: { value: number; leftLabel: string; rightLabel: string; color: string }) {
  const pct = ((value - 1) / 4) * 80 + 10
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full relative">
        <div
          className="absolute w-4 h-4 rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 shadow-sm"
          style={{ left: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-white" dir="rtl">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
        <Logo size={88} />
        <div>
          <h1 className="text-3xl font-bold text-[#1BAED9] mb-3 leading-tight">הפרסונה הפוליטית שלי</h1>
          <p className="text-gray-500 text-base leading-relaxed">
            שיחה של כ-10 דקות שחושפת את הדפוס שמנהל אותך בזירה הציבורית
          </p>
        </div>
        <button
          onClick={onStart}
          className="w-full bg-[#1BAED9] hover:bg-[#1599c0] text-white font-semibold text-lg py-4 px-8 rounded-2xl transition-colors duration-200 shadow-md"
        >
          בואי נתחיל
        </button>
        <p className="text-gray-400 text-sm">כ-10 דקות • אין תשובות נכונות</p>
      </div>
    </div>
  )
}

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
  const userCount = messages.filter((m) => m.role === 'user').length

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 max-w-lg mx-auto" dir="rtl">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <Logo size={36} />
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-800">הפרסונה הפוליטית שלי</h2>
          <p className="text-xs text-gray-400">מנהיגות נבחרת</p>
        </div>
        {userCount >= 8 && (
          <button
            onClick={onEnd}
            disabled={isLoading}
            className="text-xs text-white bg-[#1BAED9] hover:bg-[#1599c0] rounded-xl px-3 py-1.5 transition-colors"
          >
            לסיכום
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'assistant'
                  ? 'bg-[#E8F7FC] text-gray-800 rounded-tl-sm'
                  : 'bg-white border border-[#1BAED9] text-gray-800 rounded-tr-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-end">
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 shadow-sm">
        {userCount >= 8 && (
          <p className="text-xs text-center text-gray-400 mb-2">
            השיחה הגיעה לעומק.{' '}
            <button onClick={onEnd} className="text-[#1BAED9] hover:underline">
              לחץ כאן לפרופיל שלך
            </button>
          </p>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="כתוב את תשובתך..."
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#1BAED9] disabled:bg-gray-50 leading-relaxed max-h-[120px] overflow-y-auto"
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

function SummaryScreen({
  summary,
  isLoading,
  onReset,
}: {
  summary: Summary | null
  isLoading: boolean
  onReset: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4" dir="rtl">
      <div className="w-full max-w-sm">
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
              <TypingIndicator />
              <p className="text-gray-400 text-sm">בונה את הפרופיל שלך...</p>
            </div>
          </div>
        ) : summary ? (
          <div className="flex flex-col gap-4">

            {/* Archetype Header */}
            {summary.archetype_name && (
              <div className="bg-[#1BAED9] rounded-3xl px-6 py-5 text-white">
                <p className="text-xs font-medium opacity-70 mb-1">הארכיטיפ הפוליטי שלך</p>
                <h2 className="text-3xl font-bold mb-1">{summary.archetype_name}</h2>
                <p className="text-sm opacity-90 mb-3">{summary.archetype_subtitle}</p>
                <div className="pt-3 border-t border-white/20">
                  <p className="text-xs opacity-70">מנוע עומק: {summary.driver_hebrew}</p>
                </div>
              </div>
            )}

            {/* Axes */}
            {summary.archetype_name && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-[#1BAED9] font-semibold text-sm mb-4">📍 מיקום על הצירים</p>
                <div className="flex flex-col gap-4">
                  <AxisBar
                    value={summary.axis_x}
                    leftLabel="שייכות"
                    rightLabel="עצמאות"
                    color="#1BAED9"
                  />
                  <AxisBar
                    value={summary.axis_y}
                    leftLabel="יציבות"
                    rightLabel="שינוי"
                    color="#E3001B"
                  />
                </div>
              </div>
            )}

            {/* Promise */}
            {summary.promise && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-[#1BAED9] font-semibold text-sm mb-2">🎯 ההבטחה הפוליטית שלך</p>
                <p className="text-gray-700 text-sm leading-relaxed italic">"{summary.promise}"</p>
              </div>
            )}

            {/* Personal profile */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-[#1BAED9] font-semibold text-sm mb-3">🧠 מה אני שומע</p>
              <p className="text-gray-800 text-sm font-medium leading-relaxed mb-3">{summary.headline}</p>
              {summary.cognitive_style && (
                <div className="mb-2">
                  <p className="text-xs text-gray-400 mb-1">סגנון חשיבה</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{summary.cognitive_style}</p>
                </div>
              )}
              {summary.values_pattern && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">דפוס ערכים</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{summary.values_pattern}</p>
                </div>
              )}
            </div>

            {/* Shadow */}
            {summary.shadow && (
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <p className="text-amber-700 font-semibold text-sm mb-2">⚠️ הצל שלך</p>
                <p className="text-amber-800 text-sm leading-relaxed">{summary.shadow}</p>
              </div>
            )}

            {/* Open question */}
            {summary.open_question && (
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                <p className="text-gray-400 text-xs mb-2">שאלה שנשארת פתוחה</p>
                <p className="text-gray-700 text-sm italic leading-relaxed">{summary.open_question}</p>
              </div>
            )}

            {/* Key quote */}
            {summary.key_quote && (
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                <p className="text-gray-400 text-xs mb-2">מה שאמרת שסימן אותך</p>
                <p className="text-gray-700 text-sm italic leading-relaxed">"{summary.key_quote}"</p>
              </div>
            )}

            <button
              onClick={onReset}
              className="w-full border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 font-medium py-3 rounded-2xl transition-colors"
            >
              שיחה חדשה
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: INITIAL_MESSAGE },
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

      if (!response.ok || !response.body) throw new Error('Network error')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let content = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        content += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content }
          return updated
        })
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: 'מצטערת, הייתה שגיאה. נסי שוב.' }
        return updated
      })
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages])

  const generateSummary = useCallback(async () => {
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
        headline: 'לא ניתן לייצר סיכום כרגע',
        cognitive_style: '',
        values_pattern: '',
        open_question: '',
        archetype_name: '',
        archetype_subtitle: '',
        driver_hebrew: '',
        axis_x: 3,
        axis_y: 3,
        promise: '',
        shadow: '',
        key_quote: '',
      })
    } finally {
      setIsSummaryLoading(false)
    }
  }, [messages])

  const handleReset = () => {
    setScreen('landing')
    setMessages([{ role: 'assistant', content: INITIAL_MESSAGE }])
    setInput('')
    setSummary(null)
  }

  if (screen === 'landing') return <LandingScreen onStart={() => setScreen('chat')} />
  if (screen === 'chat')
    return (
      <ChatScreen
        messages={messages}
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        onSend={sendMessage}
        onEnd={generateSummary}
      />
    )
  return <SummaryScreen summary={summary} isLoading={isSummaryLoading} onReset={handleReset} />
}
