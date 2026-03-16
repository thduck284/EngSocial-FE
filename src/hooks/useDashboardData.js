import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { rawService, communityService, userService, leaderboardService } from '../services'
import { getDefaultSkillStats, normalizeProfileProgress, normalizeSkillStatsFromStats, normalizeWeeklyLeaderboard } from '../utils/dashboard'

/**
 * Dashboard data: raw (featured lessons, goals, suggested groups, skill stats),
 * profile progress (level, XP), posts feed, and create-post modal.
 */
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
  const [profileProgress, setProfileProgress] = useState({ level: 1, currentXp: 0, xpToNextLevel: 500 })
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState({ list: [], currentUser: null })
  const [weeklyLeaderboardLoading, setWeeklyLeaderboardLoading] = useState(true)

  useEffect(() => {
    rawService.getDashboard()
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
    userService.getStats()
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

  // Initial load: 5 posts from backend
  useEffect(() => {
    setPostsLoading(true)
    setPostsPage(1)
    setHasMorePosts(true)
    communityService.getPosts({ limit: POSTS_PAGE_SIZE, page: 1 })
      .then((res) => {
        // API returns { data: posts[], meta: { pagination } }
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
    communityService.getPosts({ limit: POSTS_PAGE_SIZE, page: nextPage })
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
    leaderboardService.getWeekly()
      .then((res) => setWeeklyLeaderboard(normalizeWeeklyLeaderboard(res, user?.id ?? user?._id)))
      .catch(() => setWeeklyLeaderboard({ list: [], currentUser: null }))
      .finally(() => setWeeklyLeaderboardLoading(false))
  }, [user?.id, user?._id])

  /** Refetch first page so new post appears with same shape as feed (author, images, mentions, etc.) */
  const refetchPosts = () => {
    communityService.getPosts({ limit: POSTS_PAGE_SIZE, page: 1 })
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

  /** Update post reaction state in feed after setReaction/toggleLike API. */
  const updatePostReaction = (postId, { liked, userReaction = null, likeCount: nextCount, reactionCounts }) => {
    setPosts((prev) =>
      prev.map((p) => {
        const id = p?.id ?? p?._id
        if (id !== postId) return p
        const current = Number(p.likeCount) || 0
        const count = typeof nextCount === 'number' ? nextCount : (liked ? current + (p.liked ? 0 : 1) : Math.max(0, current - 1))
        const next = { ...p, liked: Boolean(liked), userReaction: userReaction ?? undefined, likeCount: count }
        if (reactionCounts && typeof reactionCounts === 'object') next.reactionCounts = reactionCounts
        return next
      })
    )
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
    weeklyLeaderboard,
    weeklyLeaderboardLoading,
  }
}
