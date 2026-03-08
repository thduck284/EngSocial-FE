import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const chatbotService = {
  getConversations: async () => {
    return apiClient.get(API_ENDPOINTS.CHATBOT.CONVERSATIONS)
  },
  getMessages: async (conversationId) => {
    return apiClient.get(API_ENDPOINTS.CHATBOT.MESSAGES(conversationId))
  },
  sendMessage: async (conversationId, message) => {
    return apiClient.post(API_ENDPOINTS.CHATBOT.SEND_MESSAGE(conversationId), { message })
  },
  createConversation: async () => {
    return apiClient.post(API_ENDPOINTS.CHATBOT.CREATE_CONVERSATION)
  },
}
