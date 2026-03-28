// Post-related utility helpers (formatting, mapping, etc.)

/**
 * Total reactions for post summary: uses likeCount when valid, and falls back to
 * summing reactionCounts so UI stays correct if Post.likeCount is out of sync or missing.
 */
export function getPostReactionTotal(post) {
  const raw = Number(post?.likeCount)
  const fromField = Number.isFinite(raw) && raw >= 0 ? raw : 0
  const rc = post?.reactionCounts
  if (rc && typeof rc === 'object' && !Array.isArray(rc)) {
    const sum = Object.values(rc).reduce((acc, v) => acc + (Number(v) || 0), 0)
    return Math.max(fromField, sum)
  }
  return fromField
}

/** Label for post visibility in feed headers (API uses lowercase e.g. "group"). */
export function getPostVisibilityLabel(visibility, t) {
  if (visibility == null || visibility === '') return '—'
  const v = String(visibility).toLowerCase()
  if (v === 'public') return t('dashboard.public') || 'Public'
  if (v === 'friends') return t('dashboard.friendsOnly') || 'Friends only'
  if (v === 'private' || v === 'onlyme') return t('dashboard.privateOnly') || 'Only me'
  if (v === 'group') return t('dashboard.visibilityGroup') || 'Group'
  const s = String(visibility)
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

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

