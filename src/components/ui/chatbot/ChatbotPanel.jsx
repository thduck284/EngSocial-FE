import { useRef, useEffect, useState, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { chatbotService } from '../../../services'

function formatMsgTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}

function mapApiMessage(m) {
  return {
    id: m.id,
    type: m.role === 'user' ? 'user' : 'ai',
    text: m.content || '',
    time: formatMsgTime(m.createdAt),
  }
}

/** Escape rồi render **bold**, _italic_, xuống dòng — an toàn cho XSS. */
function formatBotRichText(raw) {
  if (raw == null || raw === '') return ''
  const d = document.createElement('div')
  d.textContent = String(raw)
  let h = d.innerHTML
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
  h = h.replace(/_([^_\n]+)_/g, '<em class="text-gray-300 not-italic">$1</em>')
  h = h.replace(/\n/g, '<br />')
  h = h.replace(/<br \/>•/g, '<br /><span class="text-violet-400 mr-1 select-none" aria-hidden>•</span>')
  h = h.replace(/<br \/>▸/g, '<br /><span class="text-sky-400 mr-1 select-none" aria-hidden>▸</span>')
  return `<div class="space-y-1">${h}</div>`
}

function TypingIndicator({ label }) {
  return (
    <span className="inline-flex items-center gap-2 text-gray-400 text-sm">
      <span>{label}</span>
      <span className="inline-flex gap-1" aria-hidden>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/80 animate-pulse" style={{ animationDelay: '0ms' }} />
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/80 animate-pulse" style={{ animationDelay: '200ms' }} />
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/80 animate-pulse" style={{ animationDelay: '400ms' }} />
      </span>
    </span>
  )
}

export function ChatbotPanel({ open, onClose, onMinimize }) {
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const { t } = useTranslation()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loadingList, setLoadingList] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const streamAiIdRef = useRef(null)

  const loadConversations = useCallback(async () => {
    setLoadingList(true)
    setError('')
    try {
      const res = await chatbotService.getConversations()
      const raw = Array.isArray(res?.data) ? res.data : res?.data?.conversations || []
      const convs = raw.map((c) => ({
        id: c.id,
        preview: c.preview || c.title || 'Chat',
        time: formatMsgTime(c.lastMessageAt),
        active: false,
      }))
      setConversations(convs)
      setActiveId((prev) => {
        if (prev && convs.some((x) => x.id === prev)) return prev
        return convs[0]?.id ?? null
      })
    } catch (e) {
      setConversations([])
      setActiveId(null)
      setError(e?.message || t('chatbot.loadError', 'Không tải được danh sách.'))
    } finally {
      setLoadingList(false)
    }
  }, [t])

  const loadMessages = useCallback(
    async (conversationId) => {
      if (!conversationId) {
        setMessages([])
        return
      }
      setLoadingMessages(true)
      setError('')
      try {
        const res = await chatbotService.getMessages(conversationId)
        const list = res?.data?.messages || []
        setMessages(list.map(mapApiMessage))
      } catch (e) {
        setMessages([])
        setError(e?.message || t('chatbot.loadError', 'Không tải được tin nhắn.'))
      } finally {
        setLoadingMessages(false)
      }
    },
    [t],
  )

  useEffect(() => {
    if (open) {
      loadConversations()
    }
  }, [open, loadConversations])

  useEffect(() => {
    if (open && activeId) {
      loadMessages(activeId)
    } else if (open && !activeId) {
      setMessages([])
    }
  }, [open, activeId, loadMessages])

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [open, messages])

  const handleSend = async () => {
    const text = inputRef.current?.value?.trim()
    if (!text || sending) return
    inputRef.current.value = ''
    setSending(true)
    setError('')
    const optimisticId = `local-${Date.now()}`
    const optimistic = { id: optimisticId, type: 'user', text, time: '' }
    setMessages((prev) => [...prev, optimistic])
    const streamAiId = `ai-stream-${Date.now()}`
    streamAiIdRef.current = streamAiId
    try {
      await chatbotService.sendMessageStream(
        activeId,
        text,
        { skill: 'general' },
        (_chunk, full) => {
          setMessages((prev) => {
            const i = prev.findIndex((m) => m.id === streamAiId)
            if (i === -1) return prev
            const next = [...prev]
            next[i] = {
              ...next[i],
              text: full,
              typing: false,
            }
            return next
          })
        },
        (meta) => {
          const newConvId = meta?.conversationId
          const um = mapApiMessage(meta.userMessage)
          flushSync(() => {
            if (newConvId) setActiveId(newConvId)
            setMessages((prev) => {
              const rest = prev.filter((m) => m.id !== optimisticId)
              return [
                ...rest,
                um,
                {
                  id: streamAiId,
                  type: 'ai',
                  text: '',
                  typing: true,
                  time: '',
                },
              ]
            })
          })
        },
      )
      setMessages((prev) => {
        const i = prev.findIndex((m) => m.id === streamAiId)
        if (i === -1) return prev
        const next = [...prev]
        next[i] = {
          ...next[i],
          time: formatMsgTime(new Date().toISOString()),
          typing: false,
        }
        return next
      })
      await loadConversations()
    } catch (e) {
      setMessages((prev) => {
        const streamAi = prev.find((m) => m.id === streamAiIdRef.current)
        if (streamAi && streamAi.text && String(streamAi.text).trim().length > 0) {
          return prev.map((m) =>
            m.id === streamAiIdRef.current ? { ...m, typing: false } : m
          ).filter((m) => m.id !== optimisticId)
        }
        return prev.filter((m) => m.id !== optimisticId && m.id !== streamAiIdRef.current)
      })
      setError(e?.message || t('chatbot.sendError', 'Gửi thất bại.'))
    } finally {
      streamAiIdRef.current = null
      setSending(false)
      inputRef.current?.focus()
    }
  }

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
            {loadingList && (
              <p className="text-[10px] text-gray-500 px-3 py-2">…</p>
            )}
            {!loadingList && conversations.length === 0 && (
              <p className="text-[10px] text-gray-500 px-3 py-2">{t('chatbot.noConversations', 'Chưa có cuộc trò chuyện')}</p>
            )}
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
            <button
              type="button"
              onClick={() => {
                setActiveId(null)
                setMessages([])
              }}
              className="w-full text-left px-3 py-2 mx-1.5 mt-2 text-[10px] text-primary hover:underline"
            >
              + {t('chatbot.newChat', 'Chat mới')}
            </button>
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

        {error && (
          <div className="px-3 py-2 text-[11px] text-red-300 bg-red-950/40 border-b border-red-900/50 shrink-0">
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0">
          {loadingMessages && (
            <p className="text-xs text-gray-400">{t('chatbot.loading', 'Đang tải…')}</p>
          )}
          {!loadingMessages && messages.length === 0 && !error && (
            <p className="text-xs text-gray-400">{t('chatbot.emptyThread', 'Nhập tin nhắn bên dưới.')}</p>
          )}
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
                {msg.type === 'ai' && msg.typing && !(msg.text && String(msg.text).length) ? (
                  <TypingIndicator label={t('chatbot.typing', 'Đang soạn')} />
                ) : msg.type === 'ai' ? (
                  <div
                    className="chatbot-md text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatBotRichText(msg.text) }}
                  />
                ) : (
                  <p className="text-sm leading-snug whitespace-pre-wrap">{msg.text}</p>
                )}
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
              disabled={sending}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="size-10 rounded-full bg-primary flex items-center justify-center text-white hover:brightness-110 transition-all shrink-0 disabled:opacity-50"
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
