import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

/**
 * Leaderboard API: weekly, monthly, all-time.
 */
export const leaderboardService = {
  getWeekly: () => apiClient.get(API_ENDPOINTS.LEADERBOARD.WEEKLY),
  getMonthly: () => apiClient.get(API_ENDPOINTS.LEADERBOARD.MONTHLY),
  getAllTime: () => apiClient.get(API_ENDPOINTS.LEADERBOARD.ALL_TIME),
}
