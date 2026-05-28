import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const questsService = {
  getQuests: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return apiClient.get(`${API_ENDPOINTS.QUESTS.LIST}${params ? `?${params}` : ''}`)
  },
  getMyProgress: (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return apiClient.get(`${API_ENDPOINTS.QUESTS.MY_PROGRESS}${params ? `?${params}` : ''}`)
  },
  getMyPeriodic: () => apiClient.get(API_ENDPOINTS.QUESTS.MY_PERIOD),
  getPool: () => apiClient.get(API_ENDPOINTS.QUESTS.POOL),
  getPoolById: (poolId) => apiClient.get(API_ENDPOINTS.QUESTS.POOL_DETAIL(poolId)),
  createPool: (body) => apiClient.post(API_ENDPOINTS.QUESTS.POOL, body),
  updatePool: (poolId, body) => apiClient.put(API_ENDPOINTS.QUESTS.POOL_DETAIL(poolId), body),
  deletePool: (poolId) => apiClient.delete(API_ENDPOINTS.QUESTS.POOL_DETAIL(poolId)),
  getById: (id) => apiClient.get(API_ENDPOINTS.QUESTS.DETAIL(id)),
  create: (body) => apiClient.post(API_ENDPOINTS.QUESTS.LIST, body),
  update: (id, body) => apiClient.put(API_ENDPOINTS.QUESTS.DETAIL(id), body),
  delete: (id) => apiClient.delete(API_ENDPOINTS.QUESTS.DETAIL(id)),
}
