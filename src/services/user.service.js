import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'
import { authService } from './auth.service.js'

export const userService = {
  getProfile: async () => {
    return authService.getMe()
  },

  getUserProfile: async (userId) => {
    return apiClient.get(API_ENDPOINTS.USER.PROFILE_BY_ID(userId))
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

  getSkillsProfile: async () => {
    return apiClient.get(API_ENDPOINTS.USER.SKILLS_PROFILE)
  },

  updateSkillsProfile: async (payload) => {
    return apiClient.patch(API_ENDPOINTS.USER.SKILLS_PROFILE, payload)
  },

  getGoals: async () => {
    return apiClient.get(API_ENDPOINTS.USER.GOALS)
  },

  getAchievements: async () => {
    return apiClient.get(API_ENDPOINTS.USER.ACHIEVEMENTS)
  },
  
  syncAchievementStats: (payload) => apiClient.put(API_ENDPOINTS.USER.SYNC_ACHIEVEMENT_STATS, payload),

  blockUser: (userId) => apiClient.post(API_ENDPOINTS.USER.BLOCK(userId)),
  unblockUser: (userId) => apiClient.request(API_ENDPOINTS.USER.UNBLOCK(userId), { method: 'DELETE' }),

  changePassword: (data) => apiClient.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, data),

  requestEmailChange: (newEmail) => apiClient.post(API_ENDPOINTS.USER.CHANGE_EMAIL_REQUEST, { newEmail }),

  confirmEmailChange: (otp) => apiClient.post(API_ENDPOINTS.USER.CHANGE_EMAIL_CONFIRM, { otp }),

  requestDeleteAccount: () => apiClient.post(API_ENDPOINTS.USER.DELETE_ACCOUNT_REQUEST),

  confirmDeleteAccount: (otp) => apiClient.post(API_ENDPOINTS.USER.DELETE_ACCOUNT_CONFIRM, { otp }),
}


