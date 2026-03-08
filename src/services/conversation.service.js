import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const conversationService = {
  /**
   * Get or create a direct conversation with another user.
   * @returns { Promise<{ data: { conversation, otherUser, messages } }> }
   */
  getOrCreateWithUser: (otherUserId) =>
    apiClient.get(API_ENDPOINTS.CONVERSATIONS.GET_OR_CREATE_WITH(otherUserId)),

  getList: () => apiClient.get(API_ENDPOINTS.CONVERSATIONS.LIST),

  /** Tổng tin nhắn chưa đọc (trừ hội thoại đã tắt thông báo). */
  getUnreadTotal: () => apiClient.get(API_ENDPOINTS.CONVERSATIONS.UNREAD_TOTAL),

  getMessages: (conversationId) =>
    apiClient.get(API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId)),

  /**
   * Send a message. If files are provided, sends multipart/form-data (content + files).
   * If urlAttachments (e.g. GIF from Giphy) are provided, sends JSON { content, attachments }.
   * @param {string} conversationId
   * @param {string} content
   * @param {File|File[]} [files] - optional file or array of files to attach
   * @param {{ url: string, name?: string, type?: string }[]} [urlAttachments] - optional URL-only attachments (e.g. GIF)
   */
  sendMessage: (conversationId, content, files = null, urlAttachments = null) => {
    const endpoint = API_ENDPOINTS.CONVERSATIONS.SEND_MESSAGE(conversationId)
    const fileList = files == null ? [] : Array.isArray(files) ? files : [files]
    const urlList = urlAttachments == null ? [] : Array.isArray(urlAttachments) ? urlAttachments : [urlAttachments]
    if (fileList.length > 0) {
      const form = new FormData()
      form.append('content', content || '')
      fileList.forEach((file) => form.append('files', file))
      if (urlList.length > 0) form.append('attachments', JSON.stringify(urlList))
      return apiClient.request(endpoint, { method: 'POST', body: form })
    }
    if (urlList.length > 0) {
      return apiClient.post(endpoint, { content: content || '', attachments: urlList })
    }
    return apiClient.post(endpoint, { content: content || '' })
  },

  markAsRead: (conversationId) =>
    apiClient.patch(API_ENDPOINTS.CONVERSATIONS.MARK_READ(conversationId)),

  /**
   * Update a message (chỉ khi người kia chưa xem). Same body as sendMessage: content, files, urlAttachments.
   */
  updateMessage: (conversationId, messageId, content, files = null, urlAttachments = null) => {
    const endpoint = API_ENDPOINTS.CONVERSATIONS.UPDATE_MESSAGE(conversationId, messageId)
    const fileList = files == null ? [] : Array.isArray(files) ? files : [files]
    const urlList = urlAttachments == null ? [] : Array.isArray(urlAttachments) ? urlAttachments : [urlAttachments]
    if (fileList.length > 0) {
      const form = new FormData()
      form.append('content', content || '')
      fileList.forEach((file) => form.append('files', file))
      if (urlList.length > 0) form.append('attachments', JSON.stringify(urlList))
      return apiClient.request(endpoint, { method: 'PATCH', body: form })
    }
    if (urlList.length > 0) {
      return apiClient.request(endpoint, { method: 'PATCH', body: JSON.stringify({ content: content || '', attachments: urlList }) })
    }
    return apiClient.request(endpoint, { method: 'PATCH', body: JSON.stringify({ content: content || '' }) })
  },

  updateSettings: (conversationId, payload) =>
    apiClient.patch(API_ENDPOINTS.CONVERSATIONS.SETTINGS(conversationId), payload),

  reactToMessage: (conversationId, messageId, emoji) =>
    apiClient.put(API_ENDPOINTS.CONVERSATIONS.REACTION(conversationId, messageId), { emoji }),

  deleteMessage: (conversationId, messageId, scope) =>
    apiClient.request(API_ENDPOINTS.CONVERSATIONS.DELETE_MESSAGE(conversationId, messageId), {
      method: 'DELETE',
      body: JSON.stringify({ scope: scope === 'everyone' ? 'everyone' : 'me' }),
    }),

  deleteAllMessagesForMe: (conversationId) =>
    apiClient.post(API_ENDPOINTS.CONVERSATIONS.DELETE_ALL_MESSAGES(conversationId)),
}
