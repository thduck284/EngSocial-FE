import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

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
