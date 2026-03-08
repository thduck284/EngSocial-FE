/**
 * Check if string is an i18n key (e.g. "search.friendSearchError") for use with t().
 */
export function isTranslationKey(str) {
  return typeof str === 'string' && str.includes('.') && !str.startsWith('http')
}

/**
 * Split text by query and return array of segments for highlighting (query wrapped in bold).
 * @param {string} text
 * @param {string} query
 * @returns {Array<{ type: 'text'|'highlight', value: string }>}
 */
export function highlightQuerySegments(text, query) {
  if (!text || typeof text !== 'string') return [{ type: 'text', value: text || '' }]
  const q = (query || '').trim()
  if (!q) return [{ type: 'text', value: text }]
  const parts = text.split(q)
  const segments = []
  parts.forEach((part, i) => {
    if (part) segments.push({ type: 'text', value: part })
    if (i < parts.length - 1) segments.push({ type: 'highlight', value: q })
  })
  return segments
}
