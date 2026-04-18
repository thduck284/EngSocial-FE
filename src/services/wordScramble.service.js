import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'

function buildQuery(params = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== '') q.set(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const wordScrambleService = {
  /** Lấy ngẫu nhiên một từ cho game (không cần token) */
  getNext: (params = {}) => apiClient.get(`${API_ENDPOINTS.WORD_SCRAMBLE.NEXT}${buildQuery(params)}`),

  /** Danh sách (moderator/admin) */
  listWords: (params = {}) => apiClient.get(`${API_ENDPOINTS.WORD_SCRAMBLE.WORDS}${buildQuery(params)}`),

  createWord: (body) => apiClient.post(API_ENDPOINTS.WORD_SCRAMBLE.WORDS, body),

  /** Dán nguyên nội dung file .tsv (có dòng header word, meaning, …) */
  importTsv: (tsv) => apiClient.post(API_ENDPOINTS.WORD_SCRAMBLE.WORDS_IMPORT_TSV, { tsv }),

  updateWord: (id, body) => apiClient.patch(API_ENDPOINTS.WORD_SCRAMBLE.WORD(id), body),

  deleteWord: (id) => apiClient.delete(API_ENDPOINTS.WORD_SCRAMBLE.WORD(id)),

  deleteAllWords: () => apiClient.delete(API_ENDPOINTS.WORD_SCRAMBLE.WORDS_ALL),

  getResults: (roomCode) => apiClient.get(API_ENDPOINTS.WORD_SCRAMBLE.RESULTS(roomCode)),
}
