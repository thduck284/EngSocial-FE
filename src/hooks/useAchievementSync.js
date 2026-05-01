import { useCallback, useEffect } from 'react'
import { userService } from '../services/user.service'
import { getVocabNotes, getCustomVocabWords } from '../utils/vocabularyUserStorage'

/**
 * Hook to sync client-side achievement metrics (like vocabulary counts) to the backend.
 * This is needed because some metrics are currently stored in LocalStorage for simplicity.
 */
export function useAchievementSync() {
  const sync = useCallback(async () => {
    try {
      const notes = getVocabNotes()
      const words = getCustomVocabWords()
      
      await userService.syncAchievementStats({
        vocabularyNotesCount: notes.length,
        customWordsCount: words.length
      })
    } catch (error) {
      console.warn('[achievementSync] Failed to sync stats:', error?.message)
    }
  }, [])

  return { sync }
}

/**
 * Component-level auto-sync: syncs on mount and provides the sync function.
 */
export function useAutoAchievementSync() {
  const { sync } = useAchievementSync()
  
  useEffect(() => {
    sync()
  }, [sync])
  
  return { sync }
}
