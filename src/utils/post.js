// Post-related utility helpers (formatting, mapping, etc.)

/** Format reaction count for display (e.g. 1600 -> "1,6K", 42 -> "42") */
export function formatReactionCount(n) {
  const num = Number(n) || 0
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace('.', ',')}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace('.', ',')}K`
  return String(num)
}

/**
 * Normalize mentions to array of { id, name?, avatar? } (backend may return populated or raw id).
 */
export function normalizeMentions(mentions) {
  if (!Array.isArray(mentions)) return []
  return mentions
    .map((m) => {
      if (m && typeof m === 'object' && (m.id || m._id)) {
        return { id: String(m.id ?? m._id), name: m.name, avatar: m.avatar }
      }
      if (typeof m === 'string') {
        return { id: m, name: undefined, avatar: undefined }
      }
      return null
    })
    .filter(Boolean)
}

