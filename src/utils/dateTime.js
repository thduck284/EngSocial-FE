/**
 * Format seconds as MM:SS (e.g. for audio duration/countdown)
 */
export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0))
  const mins = Math.floor(s / 60)
  const secs = s % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Compute relative time buckets (shared by formatPostTime and formatConversationTime).
 * @returns {{ diffM, diffH, diffD, d, now }}
 */
function getRelativeTimeParts(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  return {
    d,
    now,
    diffM: Math.floor(diffMs / 60000),
    diffH: Math.floor(diffMs / 3600000),
    diffD: Math.floor(diffMs / 86400000),
  }
}

function getStoredLanguage() {
  const saved = localStorage.getItem('language') || sessionStorage.getItem('language')
  return saved === 'vi' || saved === 'en' ? saved : 'vi'
}

/**
 * Relative time for posts (e.g. "5 phút trước")
 */
export function formatPostTime(dateStr, lang = getStoredLanguage()) {
  const p = getRelativeTimeParts(dateStr)
  if (!p) return ''
  const { d, diffM, diffH, diffD } = p
  const isEn = lang === 'en'
  if (diffM < 1) return isEn ? 'Just now' : 'Vừa xong'
  if (diffM < 60) return isEn ? `${diffM} minutes ago` : `${diffM} phút trước`
  if (diffH < 24) return isEn ? `${diffH} hours ago` : `${diffH} giờ trước`
  if (diffD < 7) return isEn ? `${diffD} days ago` : `${diffD} ngày trước`
  return d.toLocaleDateString(isEn ? 'en-US' : 'vi-VN')
}

/**
 * Relative time for conversation list (e.g. "5 ph", "Hôm qua", "14:30")
 */
export function formatConversationTime(dateStr) {
  const p = getRelativeTimeParts(dateStr)
  if (!p) return ''
  const { d, diffM, diffH, diffD } = p
  const lang = getStoredLanguage()
  const isEn = lang === 'en'
  if (diffM < 1) return isEn ? 'Just now' : 'Vừa xong'
  if (diffM < 60) return isEn ? `${diffM} min` : `${diffM} ph`
  if (diffH < 24) return d.toLocaleTimeString(isEn ? 'en-US' : 'vi-VN', { hour: '2-digit', minute: '2-digit' })
  if (diffD === 1) return isEn ? 'Yesterday' : 'Hôm qua'
  if (diffD < 7) return isEn ? `${diffD} days` : `${diffD} ngày`
  return d.toLocaleDateString(isEn ? 'en-US' : 'vi-VN')
}
