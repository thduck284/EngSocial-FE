import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const vocabularyService = {
  getRecent: () => apiClient.get(API_ENDPOINTS.VOCABULARY.RECENT),
  recordRecent: (body) => apiClient.post(API_ENDPOINTS.VOCABULARY.RECORD_RECENT, body),
}
