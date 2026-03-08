import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const communityService = {
  getPosts: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return apiClient.get(`${API_ENDPOINTS.COMMUNITY.POSTS}?${params}`)
  },
  getPost: async (id) => {
    return apiClient.get(API_ENDPOINTS.COMMUNITY.POST_DETAIL(id))
  },
  createPost: async (postData) => {
    return apiClient.post(API_ENDPOINTS.COMMUNITY.CREATE_POST, postData)
  },
  likePost: async (id) => {
    return apiClient.post(API_ENDPOINTS.COMMUNITY.LIKE_POST(id))
  },
  commentPost: async (id, comment) => {
    return apiClient.post(API_ENDPOINTS.COMMUNITY.COMMENT_POST(id), { comment })
  },
}
