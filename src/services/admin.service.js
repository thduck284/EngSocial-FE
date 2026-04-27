import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const adminService = {
  getSystemStats: () => apiClient.get(API_ENDPOINTS.ADMIN.STATS),

  getUserById: (userId) => apiClient.get(API_ENDPOINTS.ADMIN.USER_DETAIL(userId)),

  updateUser: (userId, payload) => apiClient.patch(API_ENDPOINTS.ADMIN.USER_DETAIL(userId), payload),

  setUserPassword: (userId, password) =>
    apiClient.post(API_ENDPOINTS.ADMIN.USER_PASSWORD(userId), { password }),

  deleteUser: (userId) => apiClient.delete(API_ENDPOINTS.ADMIN.USER_DETAIL(userId)),

  getUsers: (params = {}) => {
    const q = new URLSearchParams()
    if (params.page != null) q.set('page', String(params.page))
    if (params.limit != null) q.set('limit', String(params.limit))
    if (params.search) q.set('search', params.search)
    if (params.role) q.set('role', params.role)
    if (params.status) q.set('status', params.status)
    const qs = q.toString()
    return apiClient.get(`${API_ENDPOINTS.ADMIN.USERS}${qs ? `?${qs}` : ''}`)
  },

  updateUserRole: (userId, role) =>
    apiClient.patch(API_ENDPOINTS.ADMIN.USER_ROLE(userId), { role }),

  updateUserStatus: (userId, status) =>
    apiClient.patch(API_ENDPOINTS.ADMIN.USER_STATUS(userId), { status }),

  getReports: (params = {}) => {
    const q = new URLSearchParams()
    if (params.page != null) q.set('page', String(params.page))
    if (params.limit != null) q.set('limit', String(params.limit))
    if (params.status) q.set('status', params.status)
    if (params.targetType) q.set('targetType', params.targetType)
    const qs = q.toString()
    return apiClient.get(`${API_ENDPOINTS.ADMIN.REPORTS}${qs ? `?${qs}` : ''}`)
  },

  updateReportStatus: (reportId, status) =>
    apiClient.patch(API_ENDPOINTS.ADMIN.REPORT_STATUS(reportId), { status }),
}
