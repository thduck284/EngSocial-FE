import { useState, useCallback, useMemo } from 'react'
import {
  extractRightBarMedia,
  extractRightBarFiles,
  extractRightBarLinks,
  RIGHT_BAR_MEDIA_INITIAL,
  RIGHT_BAR_FILES_INITIAL,
  RIGHT_BAR_LINKS_INITIAL,
} from '../utils/messages'

/**
 * Hook quản lý dữ liệu right bar: search trong chat, media/files/links, load more.
 */
export function useRightBarData(messages) {
  const [rightBarSearchQuery, setRightBarSearchQuery] = useState('')
  const [panelSearchQuery, setPanelSearchQuery] = useState('')
  const [rightBarMediaVisible, setRightBarMediaVisible] = useState(RIGHT_BAR_MEDIA_INITIAL)
  const [rightBarFilesVisible, setRightBarFilesVisible] = useState(RIGHT_BAR_FILES_INITIAL)
  const [rightBarLinksVisible, setRightBarLinksVisible] = useState(RIGHT_BAR_LINKS_INITIAL)
  const [loadMoreMedia, setLoadMoreMedia] = useState(false)
  const [loadMoreFiles, setLoadMoreFiles] = useState(false)
  const [loadMoreLinks, setLoadMoreLinks] = useState(false)

  const rightBarMedia = useMemo(() => extractRightBarMedia(messages), [messages])
  const rightBarFiles = useMemo(() => extractRightBarFiles(messages), [messages])
  const rightBarLinks = useMemo(() => extractRightBarLinks(messages), [messages])

  const searchResultsFromQuery = useCallback((query) => {
    const q = (query || '').trim().toLowerCase()
    if (!q) return []
    return messages
      .filter((msg) => {
        const text = (msg.text || '').toLowerCase()
        const hasTextMatch = text.includes(q)
        const attachmentMatch = (msg.attachments || []).some(
          (a) => (a.name || '').toLowerCase().includes(q) || (a.url || '').toLowerCase().includes(q)
        )
        return hasTextMatch || attachmentMatch
      })
      .map((msg) => ({
        id: msg.id,
        preview: (msg.text || '').trim().slice(0, 80) || (msg.attachments?.length ? `[${msg.attachments.length} file]` : ''),
        time: msg.time || '',
        fromMe: msg.fromMe,
      }))
  }, [messages])

  const rightBarSearchResults = useMemo(() => searchResultsFromQuery(rightBarSearchQuery), [rightBarSearchQuery, searchResultsFromQuery])
  const panelSearchResults = useMemo(() => searchResultsFromQuery(panelSearchQuery), [panelSearchQuery, searchResultsFromQuery])

  const setRightBarMediaVisibleCount = useCallback(() => {
    setLoadMoreMedia(true)
    setTimeout(() => {
      setRightBarMediaVisible((prev) => prev + RIGHT_BAR_MEDIA_INITIAL)
      setLoadMoreMedia(false)
    }, 1000)
  }, [])
  const setRightBarFilesVisibleCount = useCallback(() => {
    setLoadMoreFiles(true)
    setTimeout(() => {
      setRightBarFilesVisible((prev) => prev + RIGHT_BAR_FILES_INITIAL)
      setLoadMoreFiles(false)
    }, 1000)
  }, [])
  const setRightBarLinksVisibleCount = useCallback(() => {
    setLoadMoreLinks(true)
    setTimeout(() => {
      setRightBarLinksVisible((prev) => prev + RIGHT_BAR_LINKS_INITIAL)
      setLoadMoreLinks(false)
    }, 1000)
  }, [])

  const resetOnConversationChange = useCallback(() => {
    setRightBarMediaVisible(RIGHT_BAR_MEDIA_INITIAL)
    setRightBarFilesVisible(RIGHT_BAR_FILES_INITIAL)
    setRightBarLinksVisible(RIGHT_BAR_LINKS_INITIAL)
    setRightBarSearchQuery('')
    setPanelSearchQuery('')
  }, [])

  return {
    rightBarSearchQuery,
    setRightBarSearchQuery,
    panelSearchQuery,
    setPanelSearchQuery,
    rightBarMedia,
    rightBarFiles,
    rightBarLinks,
    rightBarSearchResults,
    panelSearchResults,
    searchResultsFromQuery,
    rightBarMediaVisible,
    rightBarFilesVisible,
    rightBarLinksVisible,
    loadMoreMedia,
    loadMoreFiles,
    loadMoreLinks,
    setRightBarMediaVisibleCount,
    setRightBarFilesVisibleCount,
    setRightBarLinksVisibleCount,
    resetOnConversationChange,
  }
}
