import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

export const uploadService = {
  uploadAsset: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.upload(API_ENDPOINTS.UPLOAD.ASSET, formData)
    return res?.data?.url
  },

  uploadMedia: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.upload(API_ENDPOINTS.UPLOAD.POST_MEDIA, formData)
    return res?.data
  },

  // Backward-compatible alias (old naming).
  uploadPostMedia: async (file) => {
    return uploadService.uploadMedia(file)
  },
}
