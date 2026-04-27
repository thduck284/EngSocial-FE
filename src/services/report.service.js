import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const reportService = {
  /**
   * @param {{ targetType: 'post' | 'message' | 'conversation' | 'user', targetId: string, reason: string, details?: string }} payload
   */
  submitReport: (payload) => apiClient.post(API_ENDPOINTS.REPORTS.CREATE, payload),
}
