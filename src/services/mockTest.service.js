import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const mockTestService = {
  recordSession: async (payload) => {
    return apiClient.post(API_ENDPOINTS.MOCK_TESTS.RECORD, payload)
  },
  getMyHistory: async (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiClient.get(`${API_ENDPOINTS.MOCK_TESTS.MY_HISTORY}${q ? `?${q}` : ''}`)
  },
  getUserSessions: async (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiClient.get(`${API_ENDPOINTS.MOCK_TESTS.MY_HISTORY}${q ? `?${q}` : ''}`)
  },
  getSessionDetail: async (id) => {
    return apiClient.get(`${API_ENDPOINTS.MOCK_TESTS.ROOT}/session/${id}`)
  },
  getUserResults: async (userId, params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiClient.get(`${API_ENDPOINTS.MOCK_TESTS.getUserResults(userId)}${q ? `?${q}` : ''}`)
  }
}
