import { DEFAULT_AVATAR } from '../constants/ui'

/**
 * Format date for HTML input[type="date"] (YYYY-MM-DD)
 */
export function formatDateForInput(date) {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

// --- Friends helpers (normalized here for reuse) ---

export function normalizeFriendsFromResponse(res) {
  const list = res?.data?.data ?? res?.data ?? []
  const arr = Array.isArray(list) ? list : []
  return arr.map((item) => {
    const u = item?.user ?? item
    const id = u?.id ?? u?._id ?? item?.userId
    const name = u?.name ?? item?.name ?? 'User'
    const avatar =
      u?.avatar ??
      item?.avatar ??
      (name
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
            name
          )}&background=13b6ec&color=fff`
        : DEFAULT_AVATAR)
    const level = u?.level ?? item?.level ?? 1
    const lastActiveAt =
      u?.lastActiveAt ??
      u?.lastSeen ??
      u?.lastActiveDate ??
      item?.lastActiveAt ??
      item?.updatedAt ??
      item?.createdAt ??
      null

    return { id, name, avatar, level, online: false, lastActiveAt }
  })
}

export function sortFriendsByOnlineAndLastActive(friends, onlineUserIds) {
  return [...friends].sort((a, b) => {
    const idA = a.id != null ? String(a.id) : null
    const idB = b.id != null ? String(b.id) : null
    const onlineA = idA && onlineUserIds && onlineUserIds.has(idA)
    const onlineB = idB && onlineUserIds && onlineUserIds.has(idB)
    if (onlineA && !onlineB) return -1
    if (!onlineA && onlineB) return 1
    const timeA = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0
    const timeB = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0
    return timeB - timeA
  })
}

export function getFriendActivityLabel(friend, isOnline, t) {
  if (isOnline) return t('messages.activeNow')
  if (!friend.lastActiveAt) return `${t('dashboard.level')} ${friend.level}`
  const diffMs = Date.now() - new Date(friend.lastActiveAt).getTime()
  const diffM = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)
  if (diffM < 1) return t('messages.activeNow')
  if (diffM < 60) return t('messages.activeMinutesAgo', { count: diffM })
  if (diffH < 24) return t('messages.activeHoursAgo', { count: diffH })
  return t('messages.activeDaysAgo', { count: diffD })
}

