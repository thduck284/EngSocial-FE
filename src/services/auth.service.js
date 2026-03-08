import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

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
