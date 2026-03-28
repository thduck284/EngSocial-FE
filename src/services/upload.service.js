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

  // Upload one video file for post editing flow.
  uploadVideo: async (file) => {
    const data = await uploadService.uploadMedia(file)
    return { url: data?.url || '' }
  },

  // Upload multiple files and return urls + original names.
  uploadMany: async (files = []) => {
    const list = Array.isArray(files) ? files : []
    const uploaded = await Promise.all(list.map((f) => uploadService.uploadMedia(f)))
    return {
      urls: uploaded.map((item) => item?.url).filter(Boolean),
      fileNames: uploaded.map((item) => item?.name || ''),
    }
  },
}
