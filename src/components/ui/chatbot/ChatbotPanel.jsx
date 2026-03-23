import { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { rawService } from '../../../services'

export function ChatbotPanel({ open, onClose, onMinimize }) {
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const { t } = useTranslation()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    if (open) {
      rawService.getChatbot()
        .then((res) => {
          const convs = res?.data?.conversations || []
          const msgs = res?.data?.messages || []
          setConversations(convs)
          setMessages(msgs)
          const active = convs.find((c) => c.active) ?? convs[0]
          setActiveId(active?.id ?? null)
        })
        .catch(() => {
          setConversations([])
          setMessages([])
          setActiveId(null)
        })
    }
  }, [open])

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [open])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40"
        aria-hidden
        onClick={onClose}
      />
      <aside
        className="fixed top-20 right-6 bottom-24 w-full max-w-[560px] bg-[#1e3b4a] rounded-2xl shadow-2xl border border-[#325a67] flex z-50 overflow-hidden"
        role="dialog"
        aria-label="EngSocial AI Assistant"
      >
        {/* Left: conversation list */}
        <div className="w-[160px] shrink-0 border-r border-[#325a67] flex flex-col bg-[#0f2937]/50">
          <div className="p-2 border-b border-[#325a67] shrink-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">{t('chatbot.conversations')}</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
            {conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg mx-1.5 mt-1 transition-colors border-l-2 ${
                  activeId === c.id
                    ? 'bg-primary/10 border-l-primary text-white'
                    : 'border-l-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                <p className="text-xs font-medium leading-snug line-clamp-2">{c.preview}</p>
                <p className="text-[10px] text-gray-500 mt-1">{c.time}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: current chat */}
        <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 p-3 border-b border-[#325a67] shrink-0">
          <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-lg">smart_toy</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-white text-sm leading-tight">{t('chatbot.title')}</h2>
            <p className="text-[10px] text-primary font-medium">{t('chatbot.online')}</p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={onMinimize ?? onClose}
              className="size-7 flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={t('chatbot.minimize')}
            >
              <span className="material-symbols-outlined text-base">remove</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="size-7 flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={t('chatbot.close')}
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {msg.type === 'ai' && (
                <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-lg">smart_toy</span>
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.type === 'user'
                    ? 'bg-[#0096cc] text-white'
                    : 'bg-[#0f2937] text-gray-100 border border-[#325a67]'
                }`}
              >
                <p className="text-sm leading-snug">{msg.text}</p>
                {msg.time && (
                  <p className="text-[10px] text-white/70 mt-1.5 text-right">{msg.time}</p>
                )}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {msg.actions.map((a) => (
                      <button
                        key={a.label}
                        type="button"
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">{a.icon}</span>
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#325a67] shrink-0 bg-[#0f2937]/50">
          <div className="flex items-center gap-2 bg-[#1e3b4a] border border-[#325a67] rounded-full pl-4 pr-2 py-2 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all">
            <input
              ref={inputRef}
              type="text"
              placeholder={t('chatbot.inputPlaceholder')}
              className="flex-1 bg-transparent border-none text-sm text-white placeholder-gray-500 focus:ring-0 outline-none min-w-0"
            />
            <button
              type="button"
              className="size-10 rounded-full bg-primary flex items-center justify-center text-white hover:brightness-110 transition-all shrink-0"
              aria-label={t('chatbot.send')}
            >
              <span className="material-symbols-outlined text-xl fill-icon">send</span>
            </button>
          </div>
        </div>
        </div>
      </aside>
    </>
  )
}
