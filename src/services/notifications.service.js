import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const notificationsService = {
  getNotifications: async (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiClient.get(`${API_ENDPOINTS.NOTIFICATIONS.LIST}${q ? `?${q}` : ''}`)
  },

  getUnreadCount: async () => {
    return apiClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT)
  },

  markAsRead: async (id) => {
    return apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id))
  },

  markAllAsRead: async () => {
    return apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
  },
}
