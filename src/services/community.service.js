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
  /** Toggle like on a post. Returns { data: { liked: boolean, userReaction?: string } }. */
  toggleLike: async (id) => {
    return apiClient.post(API_ENDPOINTS.COMMUNITY.LIKE_POST(id))
  },
  /** Set post reaction (emoji). Returns { data: { liked: boolean, userReaction: string | null } }. */
  setReaction: async (id, reaction) => {
    return apiClient.post(API_ENDPOINTS.COMMUNITY.REACTION_POST(id), { reaction })
  },
  /** Get list of reactions for a post (for reactions modal). */
  getPostReactions: async (id) => {
    return apiClient.get(API_ENDPOINTS.COMMUNITY.POST_REACTIONS(id))
  },
  getComments: async (postId, { parentId, page, limit } = {}) => {
    const params = new URLSearchParams()
    if (parentId) params.set('parentId', parentId)
    if (page != null) params.set('page', String(page))
    if (limit != null) params.set('limit', String(limit))
    const qs = params.toString()
    return apiClient.get(`${API_ENDPOINTS.COMMUNITY.COMMENT_POST(postId)}${qs ? `?${qs}` : ''}`)
  },
  commentPost: async (postId, payload) => {
    return apiClient.post(API_ENDPOINTS.COMMUNITY.COMMENT_POST(postId), payload)
  },
  setCommentReaction: async (commentId, reaction) => {
    return apiClient.post(`/community/comments/${commentId}/reaction`, { reaction })
  },
  getCommentReactions: async (commentId) => {
    return apiClient.get(`/community/comments/${commentId}/reactions`)
  },
}
