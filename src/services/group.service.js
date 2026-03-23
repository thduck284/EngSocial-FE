import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const groupService = {
  list: async (params = {}) => {
    const search = new URLSearchParams(params).toString()
    return apiClient.get(`${API_ENDPOINTS.GROUPS.LIST}${search ? `?${search}` : ''}`)
  },

  detail: async (id) => {
    return apiClient.get(API_ENDPOINTS.GROUPS.DETAIL(id))
  },

  create: async (payload) => {
    return apiClient.post(API_ENDPOINTS.GROUPS.CREATE, payload)
  },

  join: async (id) => {
    return apiClient.post(API_ENDPOINTS.GROUPS.JOIN(id))
  },

  leave: async (id) => {
    return apiClient.post(API_ENDPOINTS.GROUPS.LEAVE(id))
  },

  members: async (id, params = {}) => {
    const search = new URLSearchParams(params).toString()
    return apiClient.get(`${API_ENDPOINTS.GROUPS.MEMBERS(id)}${search ? `?${search}` : ''}`)
  },

  addMembers: async (id, userIds = []) => {
    return apiClient.post(API_ENDPOINTS.GROUPS.ADD_MEMBERS(id), { userIds })
  },
}

