import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

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
