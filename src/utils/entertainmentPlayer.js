import { DEFAULT_AVATAR } from '../constants/ui'

export function avatarForPlayer(player) {
  if (player?.avatar) return player.avatar
  const n = player?.name || '?'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=7c3aed&color=fff`
}

export function slotsToGamePlayers(slots) {
  if (!Array.isArray(slots)) return []
  return slots.filter(Boolean).map((s) => ({
    userId: s.userId,
    name: s.name || '',
    avatar: s.avatar || '',
    score: s.score ?? 0,
    streak: s.streak ?? 0,
    maxStreak: s.maxStreak ?? 0,
    correctCount: s.correctCount ?? 0,
    isOut: !!s.isOut,
  }))
}

export { DEFAULT_AVATAR }
