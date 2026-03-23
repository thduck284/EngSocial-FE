import { useState, useEffect, useMemo, useRef } from 'react'
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
      .catch(() => {})
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
      .getPosts({ limit: POSTS_PAGE_SIZE, page: 1 })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : []
        const pagination = res?.meta?.pagination ?? res?.pagination ?? {}
        setPosts(list)
        setHasMorePosts(Boolean(pagination.hasNextPage))
      })
      .catch(() => {
        setPosts([])
        setHasMorePosts(false)
      })
      .finally(() => setPostsLoading(false))
  }, [])

  const loadMorePosts = () => {
    if (postsLoadingMore || !hasMorePosts) return
    const nextPage = postsPage + 1
    setPostsLoadingMore(true)
    communityService
      .getPosts({ limit: POSTS_PAGE_SIZE, page: nextPage })
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
      .getPosts({ limit: POSTS_PAGE_SIZE, page: 1 })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : []
        const pagination = res?.meta?.pagination ?? res?.pagination ?? {}
        setPosts(list)
        setPostsPage(1)
        setHasMorePosts(Boolean(pagination.hasNextPage))
      })
      .catch(() => {})
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
        if (String(id) !== String(postId)) return p
        return { ...p, ...(updated || {}) }
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
    postsLoadingMore,
    hasMorePosts,
    loadMorePosts,
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

const OFFLINE_DELAY_MS = 2500

export function useDashboardSocket(user, setGroupConversations) {
  const [onlineUserIds, setOnlineUserIds] = useState(new Set())
  const socketRef = useRef(null)
  const fallbackTriedRef = useRef(false)
  const pendingOfflineRef = useRef({})

  useEffect(() => {
    if (!SOCKET_ENABLED || !user) return
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
        setOnlineUserIds((prev) => new Set([...prev, userId]))
        setGroupConversations((prev) =>
          prev.map((c) =>
            Array.isArray(c.members) &&
            c.members.some((m) => String(m?.userId) === userId)
              ? { ...c, online: true }
              : c
          )
        )
      })
      socket.on('conversation:userOffline', (payload) => {
        const userId = payload?.userId != null ? String(payload.userId) : null
        if (!userId) return
        if (pending[userId]) return
        pending[userId] = setTimeout(() => {
          delete pending[userId]
          setOnlineUserIds((prev) => {
            const next = new Set(prev)
            next.delete(userId)
            return next
          })
          setGroupConversations((prev) =>
            prev.map((c) =>
              Array.isArray(c.members) &&
              c.members.some((m) => String(m?.userId) === userId)
                ? { ...c, online: false }
                : c
            )
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
  }, [user, setGroupConversations])

  return { onlineUserIds }
}

// ─── useDashboardFriends ───────────────────────────────────────────────────────

export function useDashboardFriends(onlineUserIds) {
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
        setOnlineFriends(Array.isArray(list) ? list : [])
      })
      .catch(() => setOnlineFriends([]))
  }, [])

  const loadFriendTabData = (tab) => {
    setFriendTabLoading(true)
    if (tab === 'suggestions') {
      friendsService
        .getSuggestions({ limit: 10 })
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
        .getSentRequests({ limit: 10 })
        .then((res) => {
          const list = res?.data?.data ?? res?.data ?? []
          setSentRequestsList(Array.isArray(list) ? list : [])
        })
        .catch(() => setSentRequestsList([]))
        .finally(() => setFriendTabLoading(false))
    } else {
      friendsService
        .getPendingRequests({ limit: 10 })
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
    const list =
      friendsFilterTab === 'all'
        ? [...onlineFriends]
        : onlineFriends.filter((item) => {
            const u = item?.user || item
            const id = u?.id ?? u?._id
            return id != null && onlineUserIds.has(String(id))
          })
    if (friendsFilterTab !== 'all') return list
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
    return list.sort((a, b) => {
      const uA = a?.user || a
      const uB = b?.user || b
      const idA = uA?.id ?? uA?._id
      const idB = uB?.id ?? uB?._id
      const onlineA = idA != null && onlineUserIds.has(String(idA))
      const onlineB = idB != null && onlineUserIds.has(String(idB))
      if (onlineA && !onlineB) return -1
      if (!onlineA && onlineB) return 1
      return getActiveTime(b) - getActiveTime(a)
    })
  }, [friendsFilterTab, onlineFriends, onlineUserIds])

  return {
    onlineFriends,
    friendsFilterTab,
    setFriendsFilterTab,
    friendTab,
    setFriendTab,
    suggestionsList,
    sentRequestsList,
    receivedRequestsList,
    friendTabLoading,
    loadFriendTabData,
    displayedFriendsList,
    friendSelectOpen,
    setFriendSelectOpen,
    friendSelectRef,
  }
}

// ─── useStudyGroups ────────────────────────────────────────────────────────────

export function useStudyGroups() {
  const [groupConversations, setGroupConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [showStudyGroupsModal, setShowStudyGroupsModal] = useState(false)

  const loadGroupConversations = () => {
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
        const groups = list.filter(
          (c) => c.isGroup === true || c.type === 'group'
        )
        setGroupConversations(groups)
      })
      .catch(() => setGroupConversations([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadGroupConversations()
  }, [])

  const openStudyGroupsModal = () => setShowStudyGroupsModal(true)

  return {
    groupConversations,
    setGroupConversations,
    groupConversationsLoading: loading,
    loadGroupConversations,
    showStudyGroupsModal,
    setShowStudyGroupsModal,
    openStudyGroupsModal,
  }
}
