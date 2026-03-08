import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const practicesService = {
  getPractices: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return apiClient.get(`${API_ENDPOINTS.PRACTICES.LIST}${params ? `?${params}` : ''}`)
  },
  getFallback: async (skill = 'reading') => {
    return apiClient.get(`${API_ENDPOINTS.PRACTICES.FALLBACK}?skill=${skill}`)
  },
}
