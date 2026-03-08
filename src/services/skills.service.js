import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const skillsService = {
  getReadingLessons: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return apiClient.get(`${API_ENDPOINTS.SKILLS.READING.LIST}?${params}`)
  },
  getReadingLesson: async (id) => {
    return apiClient.get(API_ENDPOINTS.SKILLS.READING.DETAIL(id))
  },
  submitReading: async (id, answers) => {
    return apiClient.post(API_ENDPOINTS.SKILLS.READING.SUBMIT(id), { answers })
  },

  getListeningLessons: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return apiClient.get(`${API_ENDPOINTS.SKILLS.LISTENING.LIST}?${params}`)
  },
  getListeningLesson: async (id) => {
    return apiClient.get(API_ENDPOINTS.SKILLS.LISTENING.DETAIL(id))
  },
  submitListening: async (id, answers) => {
    return apiClient.post(API_ENDPOINTS.SKILLS.LISTENING.SUBMIT(id), { answers })
  },

  getWritingLessons: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return apiClient.get(`${API_ENDPOINTS.SKILLS.WRITING.LIST}?${params}`)
  },
  getWritingLesson: async (id) => {
    return apiClient.get(API_ENDPOINTS.SKILLS.WRITING.DETAIL(id))
  },
  submitWriting: async (id, content) => {
    return apiClient.post(API_ENDPOINTS.SKILLS.WRITING.SUBMIT(id), { content })
  },
}
