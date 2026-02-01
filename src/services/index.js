import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

/**
 * Authentication Services
 */
export const authService = {
  login: async (email, password) => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password })
  },

  register: async (userData) => {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData)
  },

  logout: async () => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
  },

  refreshToken: async () => {
    return apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN)
  },

  forgotPassword: async (email) => {
    return apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
  },

  resetPassword: async (token, newPassword) => {
    return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword })
  },

  updatePreferences: async (payload) => {
    return apiClient.patch(API_ENDPOINTS.AUTH.PREFERENCES, payload)
  },
}

export { submitRegisterForm, submitLoginForm } from './authForm.service.js'
export {
  validateRegisterForm,
  validateLoginForm,
  validateFullName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateLoginPassword,
  validateAgreeTerms,
  REGISTER_VALIDATION,
} from '../validators/index.js'

/**
 * User Services
 */
export const userService = {
  getProfile: async () => {
    return apiClient.get(API_ENDPOINTS.USER.PROFILE)
  },

  updateProfile: async (userData) => {
    return apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, userData)
  },

  getStats: async () => {
    return apiClient.get(API_ENDPOINTS.USER.STATS)
  },

  getGoals: async () => {
    return apiClient.get(API_ENDPOINTS.USER.GOALS)
  },
}

/**
 * Skills Services
 */
export const skillsService = {
  // Reading
  getReadingLessons: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return apiClient.get(`${API_ENDPOINTS.SKILLS.READING.LIST}?${params}`)
  },

  getReadingLesson: async (id) => {
    return apiClient.get(API_ENDPOINTS.SKILLS.READING.DETAIL(id))
  },

  submitReading: async (id, answers) => {
    return apiClient.post(API_ENDPOINTS.SKILLS.READING.SUBMIT(id), { answers })
  },

  // Listening
  getListeningLessons: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return apiClient.get(`${API_ENDPOINTS.SKILLS.LISTENING.LIST}?${params}`)
  },

  getListeningLesson: async (id) => {
    return apiClient.get(API_ENDPOINTS.SKILLS.LISTENING.DETAIL(id))
  },

  submitListening: async (id, answers) => {
    return apiClient.post(API_ENDPOINTS.SKILLS.LISTENING.SUBMIT(id), { answers })
  },

  // Writing
  getWritingLessons: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return apiClient.get(`${API_ENDPOINTS.SKILLS.WRITING.LIST}?${params}`)
  },

  getWritingLesson: async (id) => {
    return apiClient.get(API_ENDPOINTS.SKILLS.WRITING.DETAIL(id))
  },

  submitWriting: async (id, content) => {
    return apiClient.post(API_ENDPOINTS.SKILLS.WRITING.SUBMIT(id), { content })
  },
}

/**
 * Community Services
 */
export const communityService = {
  getPosts: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return apiClient.get(`${API_ENDPOINTS.COMMUNITY.POSTS}?${params}`)
  },

  getPost: async (id) => {
    return apiClient.get(API_ENDPOINTS.COMMUNITY.POST_DETAIL(id))
  },

  createPost: async (postData) => {
    return apiClient.post(API_ENDPOINTS.COMMUNITY.CREATE_POST, postData)
  },

  likePost: async (id) => {
    return apiClient.post(API_ENDPOINTS.COMMUNITY.LIKE_POST(id))
  },

  commentPost: async (id, comment) => {
    return apiClient.post(API_ENDPOINTS.COMMUNITY.COMMENT_POST(id), { comment })
  },
}

/**
 * Notifications Services
 */
export const notificationsService = {
  getNotifications: async () => {
    return apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST)
  },

  markAsRead: async (id) => {
    return apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id))
  },

  markAllAsRead: async () => {
    return apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
  },
}

/**
 * Challenges Services
 */
export const challengesService = {
  getChallenges: async () => {
    return apiClient.get(API_ENDPOINTS.CHALLENGES.LIST)
  },

  joinChallenge: async (id) => {
    return apiClient.post(API_ENDPOINTS.CHALLENGES.JOIN(id))
  },

  getLeaderboard: async (id) => {
    return apiClient.get(API_ENDPOINTS.CHALLENGES.LEADERBOARD(id))
  },
}

/**
 * Chatbot Services
 */
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
