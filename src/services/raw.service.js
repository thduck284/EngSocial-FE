import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const rawService = {
  getDashboard: () => apiClient.get(API_ENDPOINTS.RAW.DASHBOARD),
  getGames: () => apiClient.get(API_ENDPOINTS.RAW.GAMES),
  getFriends: () => apiClient.get(API_ENDPOINTS.RAW.FRIENDS),
  getNotifications: () => apiClient.get(API_ENDPOINTS.RAW.NOTIFICATIONS),
  getChatbot: () => apiClient.get(API_ENDPOINTS.RAW.CHATBOT),
}
