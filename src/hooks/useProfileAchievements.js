import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { userService } from '../services'
import { flatAchievementItemsFromApiList } from './useAchievementsCatalog.js'

/**
 * Achievements của user hiện tại (GET /user/achievements), đã map giống trang /achievements.
 */
export function useProfileAchievements(userId) {
  const { t, i18n } = useTranslation()
  const lng = i18n.language
  const [raw, setRaw] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAchievements = () => {
    let cancelled = false
    ;(async () => {
      try {
        // If we're viewing another user, skip this specific fetch as it's often restricted (403).
        // The UserProfilePage will instead rely on the fallback from the main profile response.
        if (userId) {
          if (!cancelled) {
            setRaw([])
            setLoading(false)
          }
          return
        }

        const res = await userService.getAchievements(userId)
        let list =
          res?.data?.data?.achievements ??
          res?.data?.achievements ??
          res?.achievements ??
          (Array.isArray(res?.data) ? res.data : res?.data?.data) ??
          res?.data?.result ??
          res?.result ??
          res?.data?.items ??
          []
        
        // Do not force unlocked: true here, as the API may return all achievements (locked + unlocked)
        // beAchievementToItem will handle the status based on a.unlocked/isUnlocked/completed
        if (!cancelled) setRaw(Array.isArray(list) ? list : [])
      } catch (e) {
        if (!cancelled) {
          setRaw([])
          // For other users, 403 is common if the endpoint is private; we'll rely on the profile fallback
          if (userId && e?.status === 403) {
            setError(null)
          } else {
            setError(e?.message || '')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }

  useEffect(() => {
    setRaw(null) // Clear previous user's data
    const cleanup = fetchAchievements()
    return cleanup
  }, [userId])

  // Re-fetch when a new achievement is unlocked via socket
  useEffect(() => {
    const handler = () => {
      fetchAchievements()
    }
    window.addEventListener('achievement:unlocked', handler)
    return () => window.removeEventListener('achievement:unlocked', handler)
  }, [])

  const items = useMemo(
    () => flatAchievementItemsFromApiList(raw || [], t, lng),
    [raw, t, lng]
  )

  return { items, loading, error }
}
