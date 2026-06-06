/**
 * Utils for Messages page: mapping API data, rendering text with links, right-bar extraction.
 * Thời gian: dùng formatConversationTime từ utils/dateTime.js.
 */

export const URL_REGEX = /https?:\/\/[^\s<>"']+/gi

// Re-export để code cũ import từ messages vẫn chạy; logic thật nằm ở dateTime.js
export { formatConversationTime } from './dateTime'

/**
 * Split text into parts (text | link) for rendering. Links open in new tab.
 * @param {string} text
 * @param {function} renderLink - (key, url) => ReactNode; renderText - (key, value) => ReactNode
 * @returns {Array} array of { key, type: 'text'|'link', value }
 */
export function parseTextWithLinks(text) {
  if (!text || typeof text !== 'string') return []
  const parts = []
  let lastIndex = 0
  let match
  const re = new RegExp(URL_REGEX.source, 'gi')
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ key: `t-${lastIndex}`, type: 'text', value: text.slice(lastIndex, match.index) })
    parts.push({ key: `l-${match.index}`, type: 'link', value: match[0] })
    lastIndex = re.lastIndex
  }
  if (lastIndex < text.length) parts.push({ key: `t-${lastIndex}`, type: 'text', value: text.slice(lastIndex) })
  return parts
}

/** First http(s) URL in text, trailing punctuation trimmed. */
export function extractFirstUrl(text) {
  if (!text || typeof text !== 'string') return null
  const re = new RegExp(URL_REGEX.source, 'i')
  const match = text.match(re)
  if (!match?.[0]) return null
  return match[0].replace(/[.,);!?]+$/g, '')
}

/**
 * Map API message list to UI shape.
 */
export function mapApiMessagesToUi(apiMessages, currentUserId, otherUserId) {
  if (!Array.isArray(apiMessages)) return []
  const myId = String(currentUserId || '')
  const otherId = otherUserId != null ? String(otherUserId) : null
  return apiMessages.map((m) => {
    const fromMe = String(m.senderId) === myId
    const readBy = Array.isArray(m.readBy) ? m.readBy : []
    const read = fromMe ? (otherId != null && readBy.includes(otherId)) : readBy.includes(myId)
    const attachments = Array.isArray(m.attachments) && m.attachments.length
      ? m.attachments
      : m.attachment?.url
        ? [{ url: m.attachment.url, name: m.attachment.name, type: m.attachment.type }]
        : []
    return {
      id: m.id,
      fromMe,
      text: m.content || '',
      time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
      read,
      readBy: readBy,
      attachments,
      reactions: Array.isArray(m.reactions) ? m.reactions : [],
      createdAt: m.createdAt || null,
      isSystem: m.messageType === 'system',
    }
  })
}

/**
 * Normalize last message text for list display (e.g. [2 file] -> "File đính kèm" via t).
 */
export function normalizeLastMessageText(text) {
  if (!text || typeof text !== 'string') return ''
  const trimmed = String(text).trim()
  if (/^\[\d+\s*file\]$/i.test(trimmed)) return null // caller replaces with t('messages.attachedFile')
  return trimmed
}

export function isAttachedFilePlaceholder(text) {
  return (text === 'Attached file(s)' || text === 'File đính kèm') || /^\[\d+\s*file\]$/i.test(String(text || '').trim())
}

/**
 * Extract media (image/video) from messages for right sidebar.
 */
export function extractRightBarMedia(messages) {
  if (!Array.isArray(messages)) return []
  return [...messages]
    .reverse()
    .flatMap((m) =>
      (m.attachments || [])
        .filter((a) => a.type?.startsWith('image/') || a.type?.startsWith('video/'))
        .map((a) => ({ ...a, messageId: m.id }))
    )
}

/**
 * Extract non-media attachments for right sidebar.
 */
export function extractRightBarFiles(messages) {
  if (!Array.isArray(messages)) return []
  return [...messages]
    .reverse()
    .flatMap((m) =>
      (m.attachments || [])
        .filter((a) => a.type && !a.type.startsWith('image/') && !a.type.startsWith('video/'))
        .map((a) => ({ ...a, messageId: m.id }))
    )
}

/**
 * Extract URLs from message text for right sidebar.
 */
export function extractRightBarLinks(messages) {
  if (!Array.isArray(messages)) return []
  return [...messages]
    .reverse()
    .flatMap((m) => {
      const raw = (m.text ?? m.content ?? '').trim()
      const urls = (raw && raw.match(URL_REGEX)) || []
      return urls.map((u) => ({
        url: (u || '').replace(/[.,;:)\]\s]+$/, '').trim(),
        messageId: m.id,
      }))
    })
    .filter((item) => item.url && item.url.length > 10)
}

export const RIGHT_BAR_MEDIA_INITIAL = 9
export const RIGHT_BAR_FILES_INITIAL = 3
export const RIGHT_BAR_LINKS_INITIAL = 5
