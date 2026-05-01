import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { userService } from '../services'
import { flatAchievementItemsFromApiList } from './useAchievementsCatalog.js'

/**
 * Achievements của user hiện tại (GET /user/achievements), đã map giống trang /achievements.
 */
export function useProfileAchievements() {
  const { t, i18n } = useTranslation()
  const lng = i18n.language
  const [raw, setRaw] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAchievements = () => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await userService.getAchievements()
        const list =
          res?.data?.data?.achievements ??
          res?.data?.achievements ??
          res?.achievements ??
          []
        if (!cancelled) setRaw(Array.isArray(list) ? list : [])
      } catch (e) {
        if (!cancelled) {
          setRaw([])
          setError(e?.message || '')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }

  useEffect(() => {
    const cleanup = fetchAchievements()
    return cleanup
  }, [])

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
