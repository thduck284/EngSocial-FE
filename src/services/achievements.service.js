import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const achievementsService = {
  /** Get all achievements (admin/catalog view) */
  getAll: () => apiClient.get(API_ENDPOINTS.ACHIEVEMENTS.LIST),
  
  /** Get single achievement detail */
  getById: (id) => apiClient.get(API_ENDPOINTS.ACHIEVEMENTS.DETAIL(id)),
  
  /** Create new achievement */
  create: (data) => apiClient.post(API_ENDPOINTS.ACHIEVEMENTS.CREATE, data),
  
  /** Update achievement */
  update: (id, data) => apiClient.put(API_ENDPOINTS.ACHIEVEMENTS.UPDATE(id), data),
  
  /** Delete achievement */
  delete: (id) => apiClient.delete(API_ENDPOINTS.ACHIEVEMENTS.DELETE(id)),
}
