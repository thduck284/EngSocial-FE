/** Giá trị lưu localStorage (ổn định, không phụ thuộc ngôn ngữ UI) */
export const VOCAB_WORD_TYPE_IDS = [
  '',
  'noun',
  'verb',
  'adjective',
  'adverb',
  'preposition',
  'conjunction',
  'pronoun',
  'auxiliary',
  'interjection',
  'phrase',
  'other',
]

/** Chuỗi tiếng Việt cũ (value trong select trước i18n) → id */
export const LEGACY_VI_WORD_TYPE = {
  'Danh từ': 'noun',
  'Động từ': 'verb',
  'Tính từ': 'adjective',
  'Trạng từ': 'adverb',
  'Giới từ': 'preposition',
  'Liên từ': 'conjunction',
  'Đại từ': 'pronoun',
  'Trợ động từ': 'auxiliary',
  'Thán từ': 'interjection',
  'Cụm từ': 'phrase',
  'Khác': 'other',
}

export function normalizeWordTypeId(raw) {
  const s = raw != null ? String(raw).trim() : ''
  if (!s) return ''
  if (LEGACY_VI_WORD_TYPE[s]) return LEGACY_VI_WORD_TYPE[s]
  if (VOCAB_WORD_TYPE_IDS.includes(s)) return s
  return 'other'
}
