import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const lessonsService = {
  getLessons: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return apiClient.get(`${API_ENDPOINTS.LESSONS.LIST}${params ? `?${params}` : ''}`)
  },
  getMyProgress: async (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiClient.get(`${API_ENDPOINTS.LESSONS.MY_PROGRESS}${q ? `?${q}` : ''}`)
  },
  getById: (id) => apiClient.get(API_ENDPOINTS.LESSONS.DETAIL(id)),
  create: (body) => apiClient.post(API_ENDPOINTS.LESSONS.LIST, body),
  update: (id, body) => apiClient.put(API_ENDPOINTS.LESSONS.DETAIL(id), body),
  delete: (id) => apiClient.delete(API_ENDPOINTS.LESSONS.DETAIL(id)),
  getReadingContent: (id) => apiClient.get(API_ENDPOINTS.LESSONS.READING_CONTENT(id || 'demo')),
  getListeningContent: (id) => apiClient.get(API_ENDPOINTS.LESSONS.LISTENING_CONTENT(id || 'demo')),
  getWritingContent: (id) => apiClient.get(API_ENDPOINTS.LESSONS.WRITING_CONTENT(id || '')),
  getProgress: (id) => apiClient.get(API_ENDPOINTS.LESSONS.PROGRESS(id)),
  updateProgress: (id, body) => apiClient.patch(API_ENDPOINTS.LESSONS.PROGRESS(id), body),
  addNote: (id, body) => apiClient.post(API_ENDPOINTS.LESSONS.NOTES(id), body),
  complete: (id) => apiClient.post(API_ENDPOINTS.LESSONS.COMPLETE(id)),
}
