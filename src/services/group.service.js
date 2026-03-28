import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const groupService = {
  list: async (params = {}) => {
    const search = new URLSearchParams(params).toString()
    return apiClient.get(`${API_ENDPOINTS.GROUPS.LIST}${search ? `?${search}` : ''}`)
  },

  /** Nhóm user đang tham gia (cần đăng nhập) */
  listMine: async (params = {}) => {
    const search = new URLSearchParams(params).toString()
    return apiClient.get(`${API_ENDPOINTS.GROUPS.MY_GROUPS}${search ? `?${search}` : ''}`)
  },

  detail: async (id) => {
    return apiClient.get(API_ENDPOINTS.GROUPS.DETAIL(id))
  },

  create: async (payload) => {
    return apiClient.post(API_ENDPOINTS.GROUPS.CREATE, payload)
  },

  update: async (id, payload) => {
    return apiClient.patch(API_ENDPOINTS.GROUPS.DETAIL(id), payload)
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

  /** Chủ nhóm / admin: loại thành viên khỏi nhóm */
  removeMember: async (groupId, userId) => {
    return apiClient.delete(API_ENDPOINTS.GROUPS.REMOVE_MEMBER(groupId, userId))
  },

  joinRequests: async (groupId) => {
    return apiClient.get(API_ENDPOINTS.GROUPS.JOIN_REQUESTS(groupId))
  },

  approveJoinRequest: async (groupId, userId) => {
    return apiClient.post(API_ENDPOINTS.GROUPS.APPROVE_JOIN_REQUEST(groupId, userId), {})
  },

  rejectJoinRequest: async (groupId, userId) => {
    return apiClient.post(API_ENDPOINTS.GROUPS.REJECT_JOIN_REQUEST(groupId, userId), {})
  },

  myMembership: async (groupId) => {
    return apiClient.get(API_ENDPOINTS.GROUPS.MY_MEMBERSHIP(groupId))
  },

  acceptGroupInvite: async (groupId) => {
    return apiClient.post(API_ENDPOINTS.GROUPS.INVITE_ACCEPT(groupId), {})
  },

  declineGroupInvite: async (groupId) => {
    return apiClient.post(API_ENDPOINTS.GROUPS.INVITE_DECLINE(groupId), {})
  },
}

