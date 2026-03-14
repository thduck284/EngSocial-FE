import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const challengesService = {
  getChallenges: async (params = {}) => {
    const q = new URLSearchParams()
    if (params.status) q.set('status', params.status)
    if (params.type) q.set('type', params.type)
    if (params.skill) q.set('skill', params.skill)
    if (params.page != null) q.set('page', String(params.page))
    if (params.limit != null) q.set('limit', String(params.limit))
    const query = q.toString()
    return apiClient.get(API_ENDPOINTS.CHALLENGES.LIST + (query ? `?${query}` : ''))
  },
  joinChallenge: async (id) => {
    return apiClient.post(API_ENDPOINTS.CHALLENGES.JOIN(id))
  },
  getLeaderboard: async (id) => {
    return apiClient.get(API_ENDPOINTS.CHALLENGES.LEADERBOARD(id))
  },
  getById: (id) => apiClient.get(API_ENDPOINTS.CHALLENGES.DETAIL(id)),
  update: (id, body) => apiClient.put(API_ENDPOINTS.CHALLENGES.DETAIL(id), body),
  delete: (id) => apiClient.delete(API_ENDPOINTS.CHALLENGES.DETAIL(id)),
}
