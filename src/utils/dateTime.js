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
 * Relative time for posts (e.g. "5 phút trước")
 */
export function formatPostTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffM = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)
  if (diffM < 1) return 'Vừa xong'
  if (diffM < 60) return `${diffM} phút trước`
  if (diffH < 24) return `${diffH} giờ trước`
  if (diffD < 7) return `${diffD} ngày trước`
  return d.toLocaleDateString()
}
