import { useEffect, useState } from 'react'
import { groupService } from '../services/group.service'
import { communityService } from '../services/community.service'

export function useCommunityGroups() {
  const [groups, setGroups] = useState([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [activeGroup, setActiveGroup] = useState(null)
  const [loadingActive, setLoadingActive] = useState(false)
  const [activeMembers, setActiveMembers] = useState([])

  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [postsHasMore, setPostsHasMore] = useState(false)
  const [postsPage, setPostsPage] = useState(1)

  const [feedPosts, setFeedPosts] = useState([])
  const [feedLoading, setFeedLoading] = useState(false)
  const [feedHasMore, setFeedHasMore] = useState(false)
  const [feedPage, setFeedPage] = useState(1)

  const loadGroupPosts = async (groupId, page = 1) => {
    if (!groupId) return
    setPostsLoading(true)
    try {
      const res = await communityService.getPosts({ groupId, page, limit: 5 })
      const raw = res?.data ?? res ?? {}
      let list = []
      if (Array.isArray(raw)) {
        list = raw
      } else if (Array.isArray(raw.data)) {
        list = raw.data
      } else if (Array.isArray(raw.posts)) {
        list = raw.posts
      } else if (Array.isArray(raw.data?.items)) {
        list = raw.data.items
      } else {
        list = []
      }

      const meta =
        raw.meta?.pagination ||
        raw.meta ||
        raw.data?.meta?.pagination ||
        raw.data?.meta ||
        {}
      setPosts((prev) => (page === 1 ? list : [...prev, ...list]))
      const totalPages = meta.totalPages ?? (list.length < 5 ? page : page + 1)
      setPostsHasMore(page < totalPages)
      setPostsPage(page)
    } catch {
      if (page === 1) setPosts([])
      setPostsHasMore(false)
    } finally {
      setPostsLoading(false)
    }
  }

  const loadFeedPosts = async (page = 1) => {
    setFeedLoading(true)
    try {
      const res = await communityService.getPosts({ page, limit: 5 })
      const raw = res?.data ?? res ?? {}
      let list = []
      if (Array.isArray(raw)) {
        list = raw
      } else if (Array.isArray(raw.data)) {
        list = raw.data
      } else if (Array.isArray(raw.posts)) {
        list = raw.posts
      } else if (Array.isArray(raw.data?.items)) {
        list = raw.data.items
      } else {
        list = []
      }

      // Chỉ lấy bài viết thuộc community group (có groupId)
      list = list.filter((p) => p && (p.groupId || p.group?.id || p.group?._id))

      const meta =
        raw.meta?.pagination ||
        raw.meta ||
        raw.data?.meta?.pagination ||
        raw.data?.meta ||
        {}
      setFeedPosts((prev) => (page === 1 ? list : [...prev, ...list]))
      const totalPages = meta.totalPages ?? (list.length < 5 ? page : page + 1)
      setFeedHasMore(page < totalPages)
      setFeedPage(page)
    } catch {
      if (page === 1) setFeedPosts([])
      setFeedHasMore(false)
    } finally {
      setFeedLoading(false)
    }
  }

  const loadGroupDetail = async (groupId) => {
    if (!groupId) return
    setLoadingActive(true)
    try {
      const res = await groupService.detail(groupId)
      const g = res?.data?.data?.group || res?.data?.group || res?.data || null
      if (g) setActiveGroup(g)

      try {
        const memRes = await groupService.members(groupId, { limit: 8 })
        const memList = memRes?.data?.data || memRes?.data?.members || memRes?.data || []
        const avatars = memList
          .map((m) => ({
            id: m.user?.id || m.userId || m.user?._id,
            avatar: m.user?.avatar || m.avatar,
            name: m.user?.name || m.name,
          }))
          .filter((m) => m.id && m.avatar)
        setActiveMembers(avatars)
      } catch {
        setActiveMembers([])
      }

      // Load first page of posts for this group
      await loadGroupPosts(groupId, 1)
    } catch {
      // keep previous activeGroup on error
    } finally {
      setLoadingActive(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await groupService.list({ limit: 50 })
        const list = res?.data?.data || res?.data || []
        if (!cancelled) {
          setGroups(list)
        }
      } catch {
        if (!cancelled) setGroups([])
      } finally {
        if (!cancelled) setLoadingGroups(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const loadMorePosts = () => {
    if (!activeGroup || postsLoading || !postsHasMore) return
    const gid = activeGroup.id || activeGroup._id
    if (!gid) return
    loadGroupPosts(gid, postsPage + 1)
  }

  const loadMoreFeedPosts = () => {
    if (feedLoading || !feedHasMore) return
    loadFeedPosts(feedPage + 1)
  }

  const handlePostReactionUpdate = (postId, patch) => {
    setPosts((prev) =>
      prev.map((p) => {
        const id = p?.id ?? p?._id
        if (String(id) !== String(postId)) return p
        return {
          ...p,
          liked: patch.liked,
          userReaction: patch.userReaction,
          likeCount: patch.likeCount ?? p.likeCount,
          reactionCounts: patch.reactionCounts ?? p.reactionCounts,
        }
      })
    )
  }

  const handlePostFromModal = (newPost) => {
    if (!newPost) return
    setPosts((prev) => [newPost, ...prev])
  }

  return {
    groups,
    loadingGroups,
    activeGroup,
    loadingActive,
    activeMembers,
    loadGroupDetail,
    posts,
    postsLoading,
    postsHasMore,
    loadMorePosts,
    handlePostReactionUpdate,
    handlePostFromModal,
    feedPosts,
    feedLoading,
    feedHasMore,
    loadFeedPosts,
    loadMoreFeedPosts,
  }
}

