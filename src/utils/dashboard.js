import { ROUTES } from '../constants'

/**
 * Default skill stats for Weekly Stats when API fails or returns empty.
 */
export function getDefaultSkillStats() {
  return [
    { icon: 'menu_book', label: 'skills.reading', value: '0 XP', change: '', changeColor: 'text-blue-400', to: ROUTES.SKILLS?.READING || '/skills/reading' },
    { icon: 'headset', label: 'skills.listening', value: '0 XP', change: '', changeColor: 'text-orange-400', to: ROUTES.SKILLS?.LISTENING || '/skills/listening' },
    { icon: 'edit_note', label: 'skills.writing', value: '0 XP', change: '', changeColor: 'text-emerald-400', to: ROUTES.SKILLS?.WRITING || '/skills/writing' },
  ]
}

const SKILLS_CONFIG = [
  { skill: 'reading', icon: 'menu_book', labelKey: 'skills.reading', to: ROUTES.SKILLS?.READING || '/skills/reading', changeColor: 'text-emerald-400' },
  { skill: 'listening', icon: 'headset', labelKey: 'skills.listening', to: ROUTES.SKILLS?.LISTENING || '/skills/listening', changeColor: 'text-orange-400' },
  { skill: 'writing', icon: 'edit_note', labelKey: 'skills.writing', to: ROUTES.SKILLS?.WRITING || '/skills/writing', changeColor: 'text-emerald-400' },
]

/**
 * Normalize profile progress from /user/stats response.
 * @param {Object} data - API response data
 * @returns {{ level: number, currentXp: number, xpToNextLevel: number }}
 */
export function normalizeProfileProgress(data) {
  const level = Math.max(1, parseInt(data?.level ?? data?.currentLevel ?? 1, 10) || 1)
  const currentXp = parseInt(data?.currentXp ?? data?.xpInLevel ?? data?.xp ?? 0, 10) || 0
  const xpToNextLevel = Math.max(1, parseInt(data?.xpToNextLevel ?? data?.xpForNextLevel ?? data?.xpToLevel ?? 500, 10) || 500)
  return { level, currentXp, xpToNextLevel }
}

/**
 * Normalize skill stats (Weekly Stats) from /user/stats response.
 * @param {Object} data - API response data
 * @param {Array} defaultStats - Fallback when parsing fails
 * @returns {Array<{ icon, label, value, change, changeColor, to }>}
 */
export function normalizeSkillStatsFromStats(data, defaultStats) {
  if (!data || typeof data !== 'object') return defaultStats
  const xpBySkill = data.weeklyXp ?? data.xp ?? data.skills ?? data
  return SKILLS_CONFIG.map(({ skill, icon, labelKey, to, changeColor }) => {
    const xp = xpBySkill[skill] ?? xpBySkill[`${skill}Xp`] ?? (Array.isArray(data.skillStats) ? data.skillStats.find((s) => (s.skill || s.type) === skill)?.xp : undefined) ?? 0
    const num = typeof xp === 'number' ? xp : parseInt(String(xp).replace(/\D/g, ''), 10) || 0
    const value = `${num.toLocaleString()} XP`
    const change = (xpBySkill[`${skill}Change`] ?? data[`${skill}Change`]) ?? ''
    return { icon, label: labelKey, value, change, changeColor, to }
  })
}

/**
 * Normalize weekly leaderboard from API response.
 * Backend returns { data: { leaderboard: { entries: [{ rank, userId, name, avatar, xp }] } } }.
 * If currentUserId provided, finds that user in entries for currentUser.
 * @param {Object} res - API response (res.data = payload)
 * @param {string} [currentUserId] - Current user id to set currentUser from entries
 * @returns {{ list: Array<{ id, rank, name, avatar, xp }>, currentUser: { rank, xp } | null }}
 */
export function normalizeWeeklyLeaderboard(res, currentUserId) {
  const data = res?.data ?? res
  const leaderboard = data?.leaderboard ?? data
  const rawList = leaderboard?.entries ?? data?.list ?? data?.data ?? (Array.isArray(data) ? data : [])
  const list = (Array.isArray(rawList) ? rawList : []).map((item, index) => {
    const u = item?.user ?? item
    const rank = item?.rank ?? index + 1
    const xp = typeof item?.xp === 'number' ? item.xp : parseInt(String(item?.xp ?? 0).replace(/\D/g, ''), 10) || 0
    const name = u?.name ?? item?.name ?? 'User'
    const avatar = u?.avatar ?? item?.avatar ?? (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=13b6ec&color=fff` : '')
    const id = u?.id ?? u?._id ?? item?.userId ?? item?.id
    return { id, rank, name, avatar, xp }
  })
  let currentUser = data?.currentUser ?? data?.me ?? (data?.currentUserRank != null ? { rank: data.currentUserRank, xp: data.currentUserXp ?? 0 } : null)
  if (!currentUser && currentUserId != null && list.length > 0) {
    const me = list.find((e) => String(e.id) === String(currentUserId))
    if (me) currentUser = { rank: me.rank, xp: me.xp }
  }
  if (currentUser && (currentUser.rank == null || currentUser.xp == null))
    currentUser = { rank: currentUser.rank ?? 0, xp: typeof currentUser.xp === 'number' ? currentUser.xp : parseInt(String(currentUser.xp ?? 0).replace(/\D/g, ''), 10) || 0 }
  return { list, currentUser }
}
