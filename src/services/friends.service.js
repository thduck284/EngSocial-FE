import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const friendsService = {
  search: async (params = {}) => {
    const { q = '', page = 1, limit = 20, friendFilter = 'all' } = params
    const searchParams = new URLSearchParams()
    if (q) searchParams.set('q', q)
    searchParams.set('page', page)
    searchParams.set('limit', limit)
    searchParams.set('friendFilter', friendFilter)
    return apiClient.get(`${API_ENDPOINTS.FRIENDS.SEARCH}?${searchParams.toString()}`)
  },

  sendRequest: (userId) => apiClient.post(API_ENDPOINTS.FRIENDS.REQUEST(userId)),

  cancelRequest: (friendshipId) => apiClient.delete(API_ENDPOINTS.FRIENDS.REQUEST_DELETE(friendshipId)),

  getList: (params = {}) => {
    const searchParams = new URLSearchParams(params).toString()
    return apiClient.get(`${API_ENDPOINTS.FRIENDS.LIST}${searchParams ? `?${searchParams}` : ''}`)
  },

  getPendingRequests: (params = {}) => {
    const searchParams = new URLSearchParams(params).toString()
    return apiClient.get(`${API_ENDPOINTS.FRIENDS.PENDING_REQUESTS}${searchParams ? `?${searchParams}` : ''}`)
  },

  getSentRequests: (params = {}) => {
    const searchParams = new URLSearchParams(params).toString()
    return apiClient.get(`${API_ENDPOINTS.FRIENDS.SENT_REQUESTS}${searchParams ? `?${searchParams}` : ''}`)
  },

  acceptRequest: (friendshipId) => apiClient.patch(API_ENDPOINTS.FRIENDS.REQUEST_ACCEPT(friendshipId)),

  removeFriend: (userId) => apiClient.delete(API_ENDPOINTS.FRIENDS.REMOVE(userId)),
}
