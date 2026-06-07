import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import {
  rawService,
  communityService,
  userService,
  leaderboardService,
  friendsService,
  conversationService,
} from '../services'
import {
  getDefaultSkillStats,
  normalizeProfileProgress,
  normalizeSkillStatsFromStats,
  normalizeWeeklyLeaderboard,
} from '../utils/dashboard'
import { SOCKET_ENABLED, SOCKET_BASE_URL, SOCKET_FALLBACK_BASE_URL } from '../constants/api'
import { getAuthToken } from '../utils/auth'
import { resolvePostPatch } from '../utils/post'

// ─── useDashboardData ──────────────────────────────────────────────────────────

export function useDashboardData() {
  const { user } = useAuth()
  const defaultSkillStats = getDefaultSkillStats()
  const [raw, setRaw] = useState({
    skillStats: defaultSkillStats,
    featuredLessons: [],
    goals: [],
    suggestedGroups: [],
  })
  const POSTS_PAGE_SIZE = 5
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsLoadingMore, setPostsLoadingMore] = useState(false)
  const [postsPage, setPostsPage] = useState(1)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [feedTab, setFeedTab] = useState('all') // all, following, popular
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [profileProgress, setProfileProgress] = useState({
    level: 1,
    currentXp: 0,
    xpToNextLevel: 500,
  })
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState({
    list: [],
    currentUser: null,
  })
  const [weeklyLeaderboardLoading, setWeeklyLeaderboardLoading] = useState(true)

  useEffect(() => {
    rawService
      .getDashboard()
      .then((res) => {
        const d = res?.data || {}
        setRaw((prev) => ({
          ...prev,
          featuredLessons: d.featuredLessons || [],
          goals: d.goals || [],
          suggestedGroups: d.suggestedGroups || [],
        }))
      })
      .catch(() => { })
  }, [])

  useEffect(() => {
    userService
      .getStats()
      .then((res) => {
        const data = res?.data || res || {}
        setProfileProgress(normalizeProfileProgress(data))
        const list = normalizeSkillStatsFromStats(data, defaultSkillStats)
        setRaw((prev) => ({ ...prev, skillStats: list }))
      })
      .catch(() => {
        setRaw((prev) => ({ ...prev, skillStats: defaultSkillStats }))
      })
  }, [])

  useEffect(() => {
    setPostsLoading(true)
    setPostsPage(1)
    setHasMorePosts(true)
    communityService
      .getPosts({ limit: POSTS_PAGE_SIZE, page: 1, tab: feedTab })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : []
        const pagination = res?.meta?.pagination ?? res?.pagination ?? {}
        setPosts(list)
        setHasMorePosts(Boolean(pagination.hasNextPage))
      })
      .catch((err) => {
        console.error('Failed to fetch posts:', err)
        setPosts([])
        setHasMorePosts(false)
      })
      .finally(() => setPostsLoading(false))
  }, [feedTab])

  const loadMorePosts = () => {
    if (postsLoadingMore || !hasMorePosts) return
    const nextPage = postsPage + 1
    setPostsLoadingMore(true)
    communityService
      .getPosts({ limit: POSTS_PAGE_SIZE, page: nextPage, tab: feedTab })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : []
        const pagination = res?.meta?.pagination ?? res?.pagination ?? {}
        setPosts((prev) => [...prev, ...list])
        setPostsPage(nextPage)
        setHasMorePosts(Boolean(pagination.hasNextPage))
      })
      .catch(() => setHasMorePosts(false))
      .finally(() => setPostsLoadingMore(false))
  }

  useEffect(() => {
    setWeeklyLeaderboardLoading(true)
    leaderboardService
      .getWeekly()
      .then((res) =>
        setWeeklyLeaderboard(
          normalizeWeeklyLeaderboard(res, user?.id ?? user?._id)
        )
      )
      .catch(() => setWeeklyLeaderboard({ list: [], currentUser: null }))
      .finally(() => setWeeklyLeaderboardLoading(false))
  }, [user?.id, user?._id])

  const refetchPosts = () => {
    communityService
      .getPosts({ limit: POSTS_PAGE_SIZE, page: 1, tab: feedTab })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : []
        const pagination = res?.meta?.pagination ?? res?.pagination ?? {}
        setPosts(list)
        setPostsPage(1)
        setHasMorePosts(Boolean(pagination.hasNextPage))
      })
      .catch(() => { })
  }

  const handlePostFromModal = () => {
    refetchPosts()
  }

  const updatePostReaction = (
    postId,
    { liked, userReaction = null, likeCount: nextCount, reactionCounts }
  ) => {
    setPosts((prev) =>
      prev.map((p) => {
        const id = p?.id ?? p?._id
        if (id !== postId) return p
        const current = Number(p.likeCount) || 0
        const count =
          typeof nextCount === 'number'
            ? nextCount
            : liked
              ? current + (p.liked ? 0 : 1)
              : Math.max(0, current - 1)
        const next = {
          ...p,
          liked: Boolean(liked),
          userReaction: userReaction ?? undefined,
          likeCount: count,
        }
        if (reactionCounts && typeof reactionCounts === 'object')
          next.reactionCounts = reactionCounts
        return next
      })
    )
  }

  const updatePostInFeed = (postId, updated = {}) => {
    if (!postId) return
    setPosts((prev) =>
      prev.map((p) => {
        const id = p?.id ?? p?._id
        const sharedId = p?.sharedPost?.id ?? p?.sharedPost?._id

        if (String(id) === String(postId)) {
          return resolvePostPatch(p, updated)
        }

        // Keep shared-post previews in sync immediately after editing original post.
        if (sharedId && String(sharedId) === String(postId)) {
          return {
            ...p,
            sharedPost: resolvePostPatch(p.sharedPost || {}, updated),
          }
        }

        return p
      }),
    )
  }

  const removePostFromFeed = (postId) => {
    if (!postId) return
    setPosts((prev) => prev.filter((p) => String(p?.id ?? p?._id) !== String(postId)))
  }

  return {
    raw,
    posts,
    postsLoading,
    hasMorePosts,
    loadMorePosts,
    feedTab,
    setFeedTab,
    showCreateModal,
    setShowCreateModal,
    profileProgress,
    handlePostFromModal,
    updatePostReaction,
    updatePostInFeed,
    removePostFromFeed,
    weeklyLeaderboard,
    weeklyLeaderboardLoading,
  }
}

// ─── useDashboardSocket ────────────────────────────────────────────────────────

const OFFLINE_DELAY_MS = 0 // Made instant to match study groups behavior

export function useDashboardSocket(user, setConversations, setOnlineFriends, setOnlineUserIds) {
  const socketRef = useRef(null)
  const fallbackTriedRef = useRef(false)
  const pendingOfflineRef = useRef({})
  const settersRef = useRef({ setConversations, setOnlineFriends, setOnlineUserIds })

  useEffect(() => {
    settersRef.current = { setConversations, setOnlineFriends, setOnlineUserIds }
  }, [setConversations, setOnlineFriends, setOnlineUserIds])

  useEffect(() => {
    if (!SOCKET_ENABLED || !user) return
    const userIdForAuth = user.id ?? user._id
    if (!userIdForAuth) return

    const token = getAuthToken()
    if (!token) return
    const opts = { auth: { token }, transports: ['websocket', 'polling'] }
    const pending = pendingOfflineRef.current

    function attachListeners(socket) {
      socket.on('conversation:userOnline', (payload) => {
        const userId = payload?.userId != null ? String(payload.userId) : null
        if (!userId) return

        if (pending[userId]) {
          clearTimeout(pending[userId])
          delete pending[userId]
        }

        // 1. Update the centralized Set
        settersRef.current.setOnlineUserIds?.((prev) => new Set([...prev, userId]))

        // 2. Update Conversations (Group and Direct)
        settersRef.current.setConversations?.((prev) =>
          prev.map((c) => {
            const isGroupMatch = Array.isArray(c.members) &&
              c.members.some((m) => String(m?.userId ?? m?.id ?? '') === userId)
            const isDirectMatch = String(c.otherUserId ?? '') === userId
            return (isGroupMatch || isDirectMatch) ? { ...c, online: true, isOnline: true } : c
          })
        )

        // 3. Update Friends List (check all possible ID locations)
        settersRef.current.setOnlineFriends?.((prev) =>
          prev.map((f) => {
            const u = f?.user || f
            const currentId = String(u?.id ?? u?._id ?? f?.id ?? f?._id ?? '')
            if (currentId === userId) return { ...f, online: true, isOnline: true }
            return f
          })
        )
      })
      socket.on('achievement:unlocked', (payload) => {
        // Dispatch a custom DOM event so any component can show a toast
        window.dispatchEvent(new CustomEvent('achievement:unlocked', { detail: payload }))
      })
      socket.on('conversation:userOffline', (payload) => {
        const userId = payload?.userId != null ? String(payload.userId) : null
        if (!userId) return
        if (pending[userId]) return
        pending[userId] = setTimeout(() => {
          delete pending[userId]
          settersRef.current.setOnlineUserIds?.((prev) => {
            const next = new Set(prev)
            next.delete(userId)
            return next
          })
          settersRef.current.setConversations?.((prev) =>
            prev.map((c) => {
              const isGroupMatch = Array.isArray(c.members) &&
                c.members.some((m) => String(m?.userId ?? m?.id ?? '') === userId)
              const isDirectMatch = String(c.otherUserId ?? '') === userId
              return (isGroupMatch || isDirectMatch) ? { ...c, online: false, isOnline: false } : c
            })
          )
          settersRef.current.setOnlineFriends?.((prev) =>
            prev.map((f) => {
              const u = f?.user || f
              if (String(u?.id ?? u?._id) === userId) return { ...f, online: false, isOnline: false }
              return f
            })
          )
        }, OFFLINE_DELAY_MS)
      })
    }

    let socket = io(SOCKET_BASE_URL, opts)
    socketRef.current = socket
    attachListeners(socket)
    socket.on('connect_error', () => {
      if (!SOCKET_FALLBACK_BASE_URL || fallbackTriedRef.current) return
      fallbackTriedRef.current = true
      socket.removeAllListeners()
      socket.disconnect()
      socket = io(SOCKET_FALLBACK_BASE_URL, opts)
      socketRef.current = socket
      attachListeners(socket)
    })

    return () => {
      Object.values(pending).forEach(clearTimeout)
      Object.keys(pending).forEach((k) => delete pending[k])
      fallbackTriedRef.current = false
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [user?.id, user?._id])

  return {}
}

// ─── useDashboardFriends ───────────────────────────────────────────────────────

export function useDashboardFriends(onlineUserIds, setOnlineUserIds, allConversations = []) {
  const [onlineFriends, setOnlineFriends] = useState([])
  const [friendsFilterTab, setFriendsFilterTab] = useState('all')
  const [friendTab, setFriendTab] = useState('suggestions')
  const [suggestionsList, setSuggestionsList] = useState([])
  const [sentRequestsList, setSentRequestsList] = useState([])
  const [receivedRequestsList, setReceivedRequestsList] = useState([])
  const [friendTabLoading, setFriendTabLoading] = useState(false)
  const [friendSelectOpen, setFriendSelectOpen] = useState(false)
  const friendSelectRef = useRef(null)

  useEffect(() => {
    friendsService
      .getList({ limit: 100 })
      .then((res) => {
        const list = res?.data?.data ?? res?.data ?? []
        const friendsList = Array.isArray(list) ? list : []
        setOnlineFriends(friendsList)

        // Initial populate: if anyone is online from the API, add them to the Set
        if (setOnlineUserIds) {
          const currentlyOnline = friendsList
            .filter(f => (f?.user || f)?.online || (f?.user || f)?.isOnline)
            .map(f => String((f?.user || f).id ?? (f?.user || f)._id))

          if (currentlyOnline.length > 0) {
            setOnlineUserIds(prev => new Set([...prev, ...currentlyOnline]))
          }
        }
      })
      .catch(() => setOnlineFriends([]))
  }, [setOnlineUserIds])

  const loadFriendTabData = (tab) => {
    setFriendTabLoading(true)
    if (tab === 'suggestions') {
      friendsService
        .getSuggestions({ limit: 100 })
        .then((res) => {
          const raw = res?.data?.data ?? res?.data ?? []
          const list = Array.isArray(raw) ? raw : []
          setSuggestionsList(
            list.map((item) =>
              item?.user
                 ? {
                  ...item.user,
                  mutualFriendsCount:
                    item.mutualFriendsCount ?? item.mutualCount,
                }
                : item
            )
          )
        })
        .catch(() => setSuggestionsList([]))
        .finally(() => setFriendTabLoading(false))
    } else if (tab === 'sent') {
      friendsService
        .getSentRequests({ limit: 100 })
        .then((res) => {
          const list = res?.data?.data ?? res?.data ?? []
          setSentRequestsList(Array.isArray(list) ? list : [])
        })
        .catch(() => setSentRequestsList([]))
        .finally(() => setFriendTabLoading(false))
    } else {
      friendsService
        .getPendingRequests({ limit: 100 })
        .then((res) => {
          const list = res?.data?.data ?? res?.data ?? []
          setReceivedRequestsList(Array.isArray(list) ? list : [])
        })
        .catch(() => setReceivedRequestsList([]))
        .finally(() => setFriendTabLoading(false))
    }
  }

  useEffect(() => {
    loadFriendTabData(friendTab)
  }, [friendTab])

  const sendSuggestionRequest = useCallback((userId) => {
    const idStr = String(userId)
    setSuggestionsList((prev) => prev.filter((u) => String(u?.id ?? u?._id) !== idStr))
    return friendsService
      .sendRequest(userId)
      .then(() => {
        friendsService.getSentRequests({ limit: 100 }).then((res) => {
          const list = res?.data?.data ?? res?.data ?? []
          setSentRequestsList(Array.isArray(list) ? list : [])
        })
      })
      .catch(() => loadFriendTabData('suggestions'))
  }, [])

  useEffect(() => {
    if (!friendSelectOpen) return
    const handleClickOutside = (e) => {
      if (friendSelectRef.current && !friendSelectRef.current.contains(e.target))
        setFriendSelectOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [friendSelectOpen])

  const displayedFriendsList = useMemo(() => {
    const listWithStatus = onlineFriends.map((item) => {
      const u = item?.user || item
      const id = u?.id ?? u?._id
      const isSetOnline = id != null && onlineUserIds instanceof Set && onlineUserIds.has(String(id))
      const isItemOnline = item.online === true || u?.online === true || u?.isOnline === true
      const isConvOnline = Array.isArray(allConversations) && allConversations.some(c =>
        String(c.otherUserId) === String(id) && c.online === true
      )
      return { ...item, isOnline: isSetOnline || isItemOnline || isConvOnline }
    })

    const filtered =
      friendsFilterTab === 'all'
        ? listWithStatus
        : listWithStatus.filter((item) => item.isOnline)

    const getActiveTime = (item) => {
      const u = item?.user || item
      const t =
        u?.lastActiveAt ??
        u?.lastSeen ??
        u?.lastActiveDate ??
        item?.lastActiveAt ??
        item?.updatedAt ??
        item?.createdAt ??
        0
      return t ? new Date(t).getTime() : 0
    }

    return [...filtered].sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1
      if (!a.isOnline && b.isOnline) return 1
      return getActiveTime(b) - getActiveTime(a)
    })
  }, [friendsFilterTab, onlineFriends, onlineUserIds, allConversations])

  return useMemo(() => ({
    onlineFriends,
    setOnlineFriends,
    friendsFilterTab,
    setFriendsFilterTab,
    friendTab,
    setFriendTab,
    suggestionsList,
    sentRequestsList,
    receivedRequestsList,
    friendTabLoading,
    loadFriendTabData,
    sendSuggestionRequest,
    displayedFriendsList,
    friendSelectOpen,
    setFriendSelectOpen,
    friendSelectRef,
  }), [
    onlineFriends,
    friendsFilterTab,
    friendTab,
    suggestionsList,
    sentRequestsList,
    receivedRequestsList,
    friendTabLoading,
    displayedFriendsList,
    friendSelectOpen,
    sendSuggestionRequest,
  ])
}

// ─── useStudyGroups ────────────────────────────────────────────────────────────

export function useStudyGroups(setOnlineUserIds) {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [showStudyGroupsModal, setShowStudyGroupsModal] = useState(false)

  const loadConversations = () => {
    setLoading(true)
    conversationService
      .getList()
      .then((res) => {
        const raw = res?.data
        const list = Array.isArray(raw)
          ? raw
          : raw?.data && Array.isArray(raw.data)
            ? raw.data
            : []
        setConversations(list)

        // Populate online users from conversations (especially direct ones)
        if (setOnlineUserIds && list.length > 0) {
          const currentlyOnline = list
            .filter(c => c.online === true || c.isOnline === true)
            .flatMap(c => {
              if (c.otherUserId) return [String(c.otherUserId)]
              if (Array.isArray(c.members)) {
                return c.members
                  .filter(m => m.online === true || m.isOnline === true)
                  .map(m => String(m.userId ?? m.id ?? ''))
              }
              return []
            })
            .filter(id => id && id !== 'undefined')

          if (currentlyOnline.length > 0) {
            setOnlineUserIds(prev => new Set([...prev, ...currentlyOnline]))
          }
        }
      })
      .catch(() => setConversations([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadConversations()
  }, [])

  const openStudyGroupsModal = () => setShowStudyGroupsModal(true)

  const groupConversations = conversations.filter(
    (c) => c.isGroup === true || c.type === 'group'
  )

  return {
    allConversations: conversations,
    setConversations,
    groupConversations,
    groupConversationsLoading: loading,
    loadConversations,
    showStudyGroupsModal,
    setShowStudyGroupsModal,
    openStudyGroupsModal,
  }
}
