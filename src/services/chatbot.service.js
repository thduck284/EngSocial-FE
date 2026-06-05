import { apiClient } from '../utils/api'
import { API_ENDPOINTS, buildApiUrl } from '../constants'
import { detectMessageLanguage } from '../utils/detectMessageLanguage'

function looksLikeNgrokOrHtmlError(s) {
  if (!s || typeof s !== 'string') return false
  return (
    /<!DOCTYPE\s*html/i.test(s) ||
    /assets\.ngrok\.com/i.test(s) ||
    /ngrok-free\.(app|dev)/i.test(s) ||
    /\[Lỗi\s*\d+\]:/.test(s)
  )
}

function friendlyChatUpstreamError() {
  return 'Không kết nối được tới máy chủ chat (ngrok/Kaggle): tunnel có thể đã tắt hoặc URL CHAT_BOT_APP trên backend sai. Chạy lại notebook và cập nhật CHAT_BOT_APP trong .env.'
}

function streamAuthHeaders() {
  const token =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      : null
  const language =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('language') || sessionStorage.getItem('language') || 'vi'
      : 'vi'
  return {
    'Content-Type': 'application/json',
    Accept: 'text/plain, */*',
    ...(token && { Authorization: `Bearer ${token}` }),
    'Accept-Language': language === 'en' ? 'en' : 'vi',
  }
}

export const chatbotService = {
  getConversations: async () => {
    return apiClient.get(API_ENDPOINTS.CHATBOT.CONVERSATIONS)
  },
  getMessages: async (conversationId) => {
    return apiClient.get(API_ENDPOINTS.CHATBOT.MESSAGES(conversationId))
  },
  deleteConversation: async (conversationId) => {
    return apiClient.delete(API_ENDPOINTS.CHATBOT.CONVERSATION(conversationId))
  },
  /**
   * @param {string|null|undefined} conversationId - null/undefined để tạo hội thoại mới
   * @param {string} message
   * @param {{ skill?: string, lessonId?: string }} [opts]
   */
  sendMessage: async (conversationId, message, opts = {}) => {
    return apiClient.post(API_ENDPOINTS.CHATBOT.SEND_CHAT, {
      conversationId: conversationId || null,
      message,
      skill: opts.skill || 'general',
      replyLanguage: detectMessageLanguage(message),
      ...(opts.lessonId && { lessonId: opts.lessonId }),
    })
  },

  /**
   * POST /chatbot/chat/stream — dòng đầu JSON meta, phần còn lại là text stream.
   * @param {(chunk: string, full: string) => void} onChunk
   * @param {(meta: { conversationId: string, userMessage: object }) => void} [onMeta]
   */
  sendMessageStream: async (conversationId, message, opts = {}, onChunk, onMeta) => {
    const url = buildApiUrl(API_ENDPOINTS.CHATBOT.SEND_CHAT_STREAM)
    const res = await fetch(url, {
      method: 'POST',
      headers: streamAuthHeaders(),
      body: JSON.stringify({
        conversationId: conversationId || null,
        message,
        skill: opts.skill || 'general',
        replyLanguage: detectMessageLanguage(message),
        ...(opts.lessonId && { lessonId: opts.lessonId }),
      }),
    })
    if (!res.ok) {
      let msg = `HTTP ${res.status}`
      try {
        const j = await res.json()
        msg = j?.message || msg
      } catch {
        try {
          msg = (await res.text()) || msg
        } catch {
          /* */
        }
      }
      if (looksLikeNgrokOrHtmlError(String(msg))) {
        msg = friendlyChatUpstreamError()
      }
      throw new Error(typeof msg === 'string' && msg.length > 280 ? `${msg.slice(0, 280)}…` : msg)
    }
    if (!res.body) throw new Error('No response body')
    const reader = res.body.getReader()
    const dec = new TextDecoder()
    let pending = ''
    let sawMeta = false
    let outConvId = null
    let assistant = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      pending += dec.decode(value, { stream: true })
      if (!sawMeta) {
        const nl = pending.indexOf('\n')
        if (nl === -1) continue
        const firstLine = pending.slice(0, nl)
        pending = pending.slice(nl + 1)
        try {
          const o = JSON.parse(firstLine)
          if (o?.type === 'meta') {
            outConvId = o.conversationId || null
            onMeta?.(o)
          } else {
            pending = `${firstLine}\n${pending}`
          }
        } catch {
          if (looksLikeNgrokOrHtmlError(firstLine)) {
            throw new Error(friendlyChatUpstreamError())
          }
          pending = `${firstLine}\n${pending}`
        }
        sawMeta = true
      }
      if (pending.length && onChunk) {
        assistant += pending
        onChunk(pending, assistant)
        pending = ''
      }
    }
    if (pending.length && onChunk) {
      assistant += pending
      onChunk(pending, assistant)
    }
    if (looksLikeNgrokOrHtmlError(assistant)) {
      assistant = friendlyChatUpstreamError()
      if (onChunk) onChunk('', assistant)
    }
    return { conversationId: outConvId, fullText: assistant }
  },
}
