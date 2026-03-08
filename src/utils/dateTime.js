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

/**
 * Relative time for posts (e.g. "5 phút trước")
 */
export function formatPostTime(dateStr) {
  const p = getRelativeTimeParts(dateStr)
  if (!p) return ''
  const { d, diffM, diffH, diffD } = p
  if (diffM < 1) return 'Vừa xong'
  if (diffM < 60) return `${diffM} phút trước`
  if (diffH < 24) return `${diffH} giờ trước`
  if (diffD < 7) return `${diffD} ngày trước`
  return d.toLocaleDateString()
}

/**
 * Relative time for conversation list (e.g. "5 ph", "Hôm qua", "14:30")
 */
export function formatConversationTime(dateStr) {
  const p = getRelativeTimeParts(dateStr)
  if (!p) return ''
  const { d, diffM, diffH, diffD } = p
  if (diffM < 1) return 'Vừa xong'
  if (diffM < 60) return `${diffM} ph`
  if (diffH < 24) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  if (diffD === 1) return 'Hôm qua'
  if (diffD < 7) return `${diffD} ngày`
  return d.toLocaleDateString('vi-VN')
}
