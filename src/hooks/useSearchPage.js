import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { friendsService, communityService } from '../services'

/**
 * Hook for Search page: URL params (q, tab), filters, friends search API, apply/clear filters.
 * @returns {Object} All state and handlers for SearchPage
 */
export function useSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const tab = searchParams.get('tab') || 'posts'

  const [searchInput, setSearchInput] = useState(q)
  useEffect(() => {
    setSearchInput(q)
  }, [q])

  const [timeFilter, setTimeFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('newest')
  const [contentType, setContentType] = useState('all')
  const [hasComments, setHasComments] = useState(false)
  const [hasLikes, setHasLikes] = useState(false)
  const [savedOnly, setSavedOnly] = useState(false)
  const [friendFilter, setFriendFilter] = useState(searchParams.get('friendFilter') || 'all')
  const [communityFilter, setCommunityFilter] = useState(searchParams.get('communityFilter') || 'all')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    if (tab === 'friends') setFriendFilter(searchParams.get('friendFilter') || 'all')
  }, [tab, searchParams])
  useEffect(() => {
    if (tab === 'community') setCommunityFilter(searchParams.get('communityFilter') || 'all')
  }, [tab, searchParams])

  const [friendsResult, setFriendsResult] = useState([])
  const [friendsLoading, setFriendsLoading] = useState(false)
  const [friendsError, setFriendsError] = useState(null)
  const [friendsPagination, setFriendsPagination] = useState(null)

  // Posts search state
  const [postsResult, setPostsResult] = useState([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [postsError, setPostsError] = useState(null)
  const [postsPagination, setPostsPagination] = useState(null)

  const fetchFriendsSearch = useCallback(async () => {
    if (tab !== 'friends') return
    setFriendsLoading(true)
    setFriendsError(null)
    try {
      const res = await friendsService.search({
        q: q.trim(),
        page: 1,
        limit: 20,
        friendFilter: friendFilter || 'all',
      })
      setFriendsResult(res?.data ?? [])
      setFriendsPagination(res?.meta?.pagination ?? null)
    } catch (err) {
      setFriendsError(err?.message ?? err?.data?.message ?? 'search.friendSearchError')
      setFriendsResult([])
      setFriendsPagination(null)
    } finally {
      setFriendsLoading(false)
    }
  }, [tab, q, friendFilter])

  useEffect(() => {
    fetchFriendsSearch()
  }, [fetchFriendsSearch])

  const fetchPostsSearch = useCallback(async () => {
    if (tab !== 'posts') return
    const term = q.trim()
    if (!term) {
      setPostsResult([])
      setPostsPagination(null)
      setPostsError(null)
      return
    }
    setPostsLoading(true)
    setPostsError(null)
    try {
      // Gửi q + phân trang lên backend, còn lại filter xử lý phía frontend
      const res = await communityService.getPosts({
        q: term,
        page: 1,
        limit: 50,
      })
      const data = Array.isArray(res?.data) ? res.data : res?.data?.data ?? []
      const list = Array.isArray(data) ? data : []
      const pagination = res?.meta?.pagination ?? res?.pagination ?? null
      setPostsResult(list)
      setPostsPagination(pagination)
    } catch (err) {
      setPostsError(err?.message ?? 'search.loadError')
      setPostsResult([])
      setPostsPagination(null)
    } finally {
      setPostsLoading(false)
    }
  }, [
    tab,
    q,
    timeFilter,
    sort,
    contentType,
    dateFrom,
    dateTo,
    hasComments,
    hasLikes,
    savedOnly,
  ])

  useEffect(() => {
    fetchPostsSearch()
  }, [fetchPostsSearch])

  // Apply all post filters on frontend để chắc chắn hoạt động, kể cả khi backend chưa hỗ trợ
  const filteredPosts = useMemo(() => {
    if (!Array.isArray(postsResult)) return []
    return postsResult
      .filter((post) => {
        if (!post) return false
        const createdAt = post.createdAt ? new Date(post.createdAt) : null
        const now = new Date()

        // timeFilter
        if (timeFilter === 'today' && createdAt) {
          const isToday =
            createdAt.toDateString() === now.toDateString()
        if (!isToday) return false
        } else if (timeFilter === 'week' && createdAt) {
          const diffDays =
            (now.getTime() - createdAt.getTime()) / 86400000
          if (diffDays > 7) return false
        } else if (timeFilter === 'month' && createdAt) {
          const diffDays =
            (now.getTime() - createdAt.getTime()) / 86400000
          if (diffDays > 31) return false
        }

        // dateFrom / dateTo
        if (dateFrom) {
          const from = new Date(dateFrom)
          if (createdAt && createdAt < from) return false
        }
        if (dateTo) {
          const to = new Date(dateTo)
          // include the whole end day
          to.setHours(23, 59, 59, 999)
          if (createdAt && createdAt > to) return false
        }

        // contentType
        const hasImage =
          Array.isArray(post.images) && post.images.length > 0
        const hasVideo =
          typeof post.video === 'string' && post.video.trim().length > 0
        const hasOnlyText = !hasImage && !hasVideo
        if (contentType === 'image' && !hasImage) return false
        if (contentType === 'video' && !hasVideo) return false
        if (contentType === 'text' && !hasOnlyText) return false

        // interactions
        const likeCount = Number(post.likeCount || 0)
        const commentCount = Number(post.commentCount || 0)
        if (hasComments && commentCount <= 0) return false
        if (hasLikes && likeCount <= 0) return false

        if (savedOnly && !post.saved) return false

        return true
      })
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return db - da // newest first
      })
  }, [
    postsResult,
    timeFilter,
    dateFrom,
    dateTo,
    contentType,
    hasComments,
    hasLikes,
    savedOnly,
  ])

  const handleSendFriendRequest = useCallback(async (userId) => {
    try {
      const res = await friendsService.sendRequest(userId)
      const friendshipId = res?.data?.friendship?.id
      setFriendsResult((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, friendStatus: 'pending', pendingSentByMe: true, friendshipId: friendshipId || u.friendshipId }
            : u
        )
      )
    } catch (_) {}
  }, [])

  const handleCancelFriendRequest = useCallback(async (friendshipId) => {
    try {
      await friendsService.cancelRequest(friendshipId)
      setFriendsResult((prev) =>
        prev.map((u) =>
          u.friendshipId === friendshipId
            ? { ...u, friendStatus: 'none', friendshipId: undefined, pendingSentByMe: undefined }
            : u
        )
      )
    } catch (_) {}
  }, [])

  const handleSearchSubmit = useCallback(
    (e) => {
      e?.preventDefault?.()
      const term = (searchInput || '').trim()
      if (term) setSearchParams({ q: term, tab })
    },
    [searchInput, tab, setSearchParams]
  )

  const setTab = useCallback(
    (newTab) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set('tab', newTab)
        return next
      })
    },
    [setSearchParams]
  )

  const applyFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (tab === 'posts') {
        if (timeFilter !== 'all') next.set('time', timeFilter)
        else next.delete('time')
        next.set('sort', sort)
        if (contentType !== 'all') next.set('contentType', contentType)
        else next.delete('contentType')
        if (dateFrom) next.set('dateFrom', dateFrom)
        else next.delete('dateFrom')
        if (dateTo) next.set('dateTo', dateTo)
        else next.delete('dateTo')
        if (hasComments) next.set('hasComments', '1')
        else next.delete('hasComments')
        if (hasLikes) next.set('hasLikes', '1')
        else next.delete('hasLikes')
        if (savedOnly) next.set('saved', '1')
        else next.delete('saved')
      } else if (tab === 'friends') {
        next.set('friendFilter', friendFilter)
      } else if (tab === 'community') {
        next.set('communityFilter', communityFilter)
      }
      return next
    })
    setShowMobileFilters(false)
  }, [
    tab,
    timeFilter,
    sort,
    contentType,
    dateFrom,
    dateTo,
    hasComments,
    hasLikes,
    savedOnly,
    friendFilter,
    communityFilter,
    setSearchParams,
  ])

  const clearFilters = useCallback(() => {
    if (tab === 'posts') {
      setTimeFilter('all')
      setDateFrom('')
      setDateTo('')
      setSort('newest')
      setContentType('all')
      setHasComments(false)
      setHasLikes(false)
      setSavedOnly(false)
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        ;['time', 'sort', 'contentType', 'dateFrom', 'dateTo', 'hasComments', 'hasLikes', 'saved'].forEach((k) =>
          next.delete(k)
        )
        return next
      })
    } else if (tab === 'friends') {
      setFriendFilter('all')
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('friendFilter')
        return next
      })
    } else if (tab === 'community') {
      setCommunityFilter('all')
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('communityFilter')
        return next
      })
    }
    setShowMobileFilters(false)
  }, [tab, setSearchParams])

  return {
    q,
    tab,
    searchInput,
    setSearchInput,
    timeFilter,
    setTimeFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    sort,
    setSort,
    contentType,
    setContentType,
    hasComments,
    setHasComments,
    hasLikes,
    setHasLikes,
    savedOnly,
    setSavedOnly,
    friendFilter,
    setFriendFilter,
    communityFilter,
    setCommunityFilter,
    showMobileFilters,
    setShowMobileFilters,
    friendsResult,
    friendsLoading,
    friendsError,
    friendsPagination,
    postsResult,
    filteredPosts,
    postsLoading,
    postsError,
    postsPagination,
    handleSearchSubmit,
    setTab,
    applyFilters,
    clearFilters,
    handleSendFriendRequest,
    handleCancelFriendRequest,
  }
}
