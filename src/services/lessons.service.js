import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const lessonsService = {
  getTopics: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return apiClient.get(`${API_ENDPOINTS.LESSONS.TOPICS}${params ? `?${params}` : ''}`)
  },
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
  addNote: (id, body) => apiClient.post(API_ENDPOINTS.LESSONS.NOTES(id), body),
  submit: (id, body) => apiClient.post(API_ENDPOINTS.LESSONS.SUBMIT(id), body),
  submitWriting: (id, body) => apiClient.post(API_ENDPOINTS.LESSONS.SUBMIT_WRITING(id), body),
  complete: (id) => apiClient.post(API_ENDPOINTS.LESSONS.COMPLETE(id)),
  getReviews: (id, params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiClient.get(`${API_ENDPOINTS.LESSONS.REVIEWS(id)}${q ? `?${q}` : ''}`)
  },
  addReview: (id, body) => apiClient.post(API_ENDPOINTS.LESSONS.REVIEWS(id), body),
  getAllResults: (id, params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiClient.get(`${API_ENDPOINTS.LESSONS.DETAIL(id)}/all-results${q ? `?${q}` : ''}`)
  },
  getUserProgressByMod: (targetUserId, params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiClient.get(`${API_ENDPOINTS.LESSONS.USER_PROGRESS(targetUserId)}${q ? `?${q}` : ''}`)
  },

  gradeWriting: (id, userId, body) => apiClient.post(`${API_ENDPOINTS.LESSONS.DETAIL(id)}/grade/${userId}`, body),
  aiGradeWriting: (id, userId) => apiClient.post(API_ENDPOINTS.LESSONS.AI_GRADE(id, userId)),
}
