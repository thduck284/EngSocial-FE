import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { vocabularyService } from '../services/vocabulary.service'
import { getRecentVocabEntriesLocal, subscribeVocabRecent } from '../utils/vocabularyRecentTopics'

/**
 * Danh sách chủ đề / custom gần đây kèm hình thức luyện.
 * Đã đăng nhập: ưu tiên dữ liệu server; vẫn đồng bộ local khi ghi.
 */
export function useVocabularyRecent() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [serverItems, setServerItems] = useState(null)
  const [tick, setTick] = useState(0)

  const bump = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => subscribeVocabRecent(bump), [bump])

  useEffect(() => {
    if (!isAuthenticated) {
      setServerItems(null)
      return
    }
    let cancelled = false
    vocabularyService
      .getRecent()
      .then((res) => {
        if (cancelled) return
        if (res?.success && Array.isArray(res?.data?.items)) {
          setServerItems(res.data.items)
        } else {
          setServerItems([])
        }
      })
      .catch(() => {
        if (!cancelled) setServerItems(null)
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, location.pathname, tick])

  const items = useMemo(() => {
    if (isAuthenticated && serverItems != null) {
      return serverItems.map((x) => ({
        topicId: String(x.topicId),
        practiceMode: x.practiceMode,
        deck: x.deck ?? null,
        visitedAt: x.visitedAt,
      }))
    }
    return getRecentVocabEntriesLocal()
  }, [isAuthenticated, serverItems, tick])

  return { items }
}
