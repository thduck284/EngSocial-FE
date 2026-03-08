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

  refreshToken: async (refreshToken) => {
    return apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken })
  },

  forgotPassword: async (email) => {
    return apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
  },

  resetPassword: async (token, newPassword) => {
    return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword })
  },

  getMe: async () => {
    return apiClient.get(API_ENDPOINTS.AUTH.ME)
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
    return authService.getMe()
  },

  updateProfile: async (userData) => {
    return apiClient.patch(API_ENDPOINTS.USER.UPDATE_PROFILE, userData)
  },

  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return apiClient.upload(API_ENDPOINTS.USER.UPLOAD_AVATAR, formData)
  },

  getStats: async () => {
    return apiClient.get(API_ENDPOINTS.USER.STATS)
  },

  getGoals: async () => {
    return apiClient.get(API_ENDPOINTS.USER.GOALS)
  },
}

/**
 * Practices Services (Skill Practice - tách biệt với Lessons)
 */
export const practicesService = {
  getPractices: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return apiClient.get(`${API_ENDPOINTS.PRACTICES.LIST}${params ? `?${params}` : ''}`)
  },
  getFallback: async (skill = 'reading') => {
    return apiClient.get(`${API_ENDPOINTS.PRACTICES.FALLBACK}?skill=${skill}`)
  },
}

/**
 * Raw Services (mock data từ BE)
 */
export const rawService = {
  getDashboard: () => apiClient.get(API_ENDPOINTS.RAW.DASHBOARD),
  getGames: () => apiClient.get(API_ENDPOINTS.RAW.GAMES),
  getFriends: () => apiClient.get(API_ENDPOINTS.RAW.FRIENDS),
  getNotifications: () => apiClient.get(API_ENDPOINTS.RAW.NOTIFICATIONS),
  getChatbot: () => apiClient.get(API_ENDPOINTS.RAW.CHATBOT),
}

/**
 * Quests Services
 */
export const questsService = {
  getQuests: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return apiClient.get(`${API_ENDPOINTS.QUESTS.LIST}${params ? `?${params}` : ''}`)
  },
  getById: (id) => apiClient.get(API_ENDPOINTS.QUESTS.DETAIL(id)),
  create: (body) => apiClient.post(API_ENDPOINTS.QUESTS.LIST, body),
  update: (id, body) => apiClient.put(API_ENDPOINTS.QUESTS.DETAIL(id), body),
  delete: (id) => apiClient.delete(API_ENDPOINTS.QUESTS.DETAIL(id)),
}

/**
 * Lessons Services
 */
export const lessonsService = {
  getLessons: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return apiClient.get(`${API_ENDPOINTS.LESSONS.LIST}${params ? `?${params}` : ''}`)
  },
  getById: (id) => apiClient.get(API_ENDPOINTS.LESSONS.DETAIL(id)),
  create: (body) => apiClient.post(API_ENDPOINTS.LESSONS.LIST, body),
  update: (id, body) => apiClient.put(API_ENDPOINTS.LESSONS.DETAIL(id), body),
  delete: (id) => apiClient.delete(API_ENDPOINTS.LESSONS.DETAIL(id)),
  getReadingContent: (id) => apiClient.get(API_ENDPOINTS.LESSONS.READING_CONTENT(id || 'demo')),
  getListeningContent: (id) => apiClient.get(API_ENDPOINTS.LESSONS.LISTENING_CONTENT(id || 'demo')),
  getWritingContent: (id) => apiClient.get(API_ENDPOINTS.LESSONS.WRITING_CONTENT(id || '')),
  getProgress: (id) => apiClient.get(API_ENDPOINTS.LESSONS.PROGRESS(id)),
  updateProgress: (id, body) => apiClient.patch(API_ENDPOINTS.LESSONS.PROGRESS(id), body),
  addNote: (id, body) => apiClient.post(API_ENDPOINTS.LESSONS.NOTES(id), body),
  complete: (id) => apiClient.post(API_ENDPOINTS.LESSONS.COMPLETE(id)),
}

export const uploadService = {
  uploadAsset: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.upload(API_ENDPOINTS.UPLOAD.ASSET, formData)
    return res?.data?.url
  },

  uploadPostMedia: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.upload(API_ENDPOINTS.UPLOAD.POST_MEDIA, formData)
    return res?.data
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
