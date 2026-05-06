import { useCallback, useEffect, useState } from 'react'
import { groupService } from '../services/group.service'
import { communityService } from '../services/community.service'

export function useCommunityGroups() {
  const [groups, setGroups] = useState([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [activeGroup, setActiveGroup] = useState(null)
  const [loadingActive, setLoadingActive] = useState(false)
  const [activeMembers, setActiveMembers] = useState([])
  const [myGroupMembership, setMyGroupMembership] = useState(null)

  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [postsHasMore, setPostsHasMore] = useState(false)
  const [postsPage, setPostsPage] = useState(1)
  const [postsSearch, setPostsSearch] = useState('')

  const [feedPosts, setFeedPosts] = useState([])
  const [feedLoading, setFeedLoading] = useState(false)
  const [feedHasMore, setFeedHasMore] = useState(false)
  const [feedPage, setFeedPage] = useState(1)
  const [feedSort, setFeedSort] = useState('latest')
  const [feedSearch, setFeedSearch] = useState('')
  
  const [discoverGroups, setDiscoverGroups] = useState([])
  const [loadingDiscover, setLoadingDiscover] = useState(false)

  const loadGroupPosts = async (groupId, page = 1, search = '') => {
    if (!groupId) return
    setPostsLoading(true)
    if (page === 1) setPostsSearch(search)
    try {
      const res = await communityService.getPosts({ groupId, page, limit: 5, search })
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

  const loadFeedPosts = async (page = 1, sort = 'latest', search = '') => {
    setFeedLoading(true)
    if (page === 1) {
      setFeedSort(sort)
      setFeedSearch(search)
    }
    try {
      // Tăng limit để tăng khả năng lấy được bài viết nhóm sau khi filter ở FE (hoặc nếu BE hỗ trợ scope: 'groups')
      const res = await communityService.getPosts({ page, limit: 12, scope: 'groups', sort, search })
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

      // Lọc các bài viết thực sự thuộc về một nhóm
      const filteredList = list.filter((p) => p && (p.groupId || p.group?.id || p.group?._id))

      const meta =
        raw.meta?.pagination ||
        raw.meta ||
        raw.data?.meta?.pagination ||
        raw.data?.meta ||
        {}
      
      setFeedPosts((prev) => (page === 1 ? filteredList : [...prev, ...filteredList]))
      
      const hasNext = meta.hasNextPage ?? (list.length >= 12)
      setFeedHasMore(hasNext)
      setFeedPage(page)

      // Nếu trang hiện tại không có bài viết nào phù hợp sau khi lọc,
      // nhưng BE vẫn báo còn trang tiếp theo, tự động load thêm trang mới.
      if (filteredList.length === 0 && hasNext && page < 5) { // Giới hạn page < 5 để tránh loop vô tận nếu dữ liệu rác nhiều
        loadFeedPosts(page + 1, sort, search)
      }
    } catch (err) {
      console.error('Community Feed Error:', err)
      if (page === 1) setFeedPosts([])
      setFeedHasMore(false)
    } finally {
      setFeedLoading(false)
    }
  }

  const loadDiscoverGroups = async () => {
    setLoadingDiscover(true)
    try {
      const res = await groupService.list({ limit: 30, discovery: true })
      const raw = res?.data
      if (Array.isArray(raw)) {
        setDiscoverGroups(raw)
      } else if (Array.isArray(raw?.data)) {
        setDiscoverGroups(raw.data)
      } else {
        setDiscoverGroups([])
      }
    } catch {
      setDiscoverGroups([])
    } finally {
      setLoadingDiscover(false)
    }
  }

  const fetchJoinedGroupsList = useCallback(async () => {
    const res = await groupService.listMine({ limit: 50 })
    const raw = res?.data
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw?.data)) return raw.data
    return []
  }, [])

  const loadGroupDetail = async (groupId) => {
    if (!groupId) return
    setLoadingActive(true)
    setMyGroupMembership(null)
    try {
      const res = await groupService.detail(groupId)
      const g = res?.data?.data?.group || res?.data?.group || res?.data || null
      if (g) {
        setActiveGroup(g)
        setGroups((prev) =>
          prev.map((x) => {
            const xid = x?.id ?? x?._id
            if (!xid || String(xid) !== String(groupId)) return x
            return {
              ...x,
              name: g.name,
              description: g.description,
              icon: g.icon,
              type: g.type,
              memberCount: g.memberCount ?? x.memberCount,
            }
          })
        )
      }

      try {
        const mineRes = await groupService.myMembership(groupId)
        const minePayload = mineRes?.data ?? mineRes
        const m = minePayload?.membership ?? minePayload?.data?.membership
        setMyGroupMembership(m && typeof m === 'object' ? m : null)
      } catch {
        setMyGroupMembership(null)
      }

      try {
        // Lấy dư để sau khi loại user hiện tại vẫn đủ tối đa 8 avatar (kể cả người chưa có ảnh)
        const memRes = await groupService.members(groupId, { limit: 16 })
        const memList = memRes?.data?.data || memRes?.data?.members || memRes?.data || []
        const avatars = memList
          .map((m) => ({
            id: m.user?.id || m.userId || m.user?._id,
            avatar: m.user?.avatar || m.avatar || null,
            name: m.user?.name || m.name,
          }))
          .filter((m) => m.id)
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
        const list = await fetchJoinedGroupsList()
        if (!cancelled) setGroups(list)
      } catch {
        if (!cancelled) setGroups([])
      } finally {
        if (!cancelled) setLoadingGroups(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [fetchJoinedGroupsList])

  const loadMorePosts = () => {
    if (!activeGroup || postsLoading || !postsHasMore) return
    const gid = activeGroup.id || activeGroup._id
    if (!gid) return
    loadGroupPosts(gid, postsPage + 1, postsSearch)
  }

  const loadMoreFeedPosts = () => {
    if (feedLoading || !feedHasMore) return
    loadFeedPosts(feedPage + 1, feedSort, feedSearch)
  }

  const handlePostReactionUpdate = (postId, patch) => {
    const updater = (prev) =>
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
    setPosts(updater)
    setFeedPosts(updater)
  }

  const applyPostUpdate = (list = [], postId, updated = {}) =>
    list.map((p) => {
      const id = p?.id ?? p?._id
      const sharedId = p?.sharedPost?.id ?? p?.sharedPost?._id

      if (String(id) === String(postId)) return { ...p, ...(updated || {}) }

      if (sharedId && String(sharedId) === String(postId)) {
        return {
          ...p,
          sharedPost: {
            ...(p.sharedPost || {}),
            ...(updated || {}),
          },
        }
      }

      return p
    })

  const handlePostUpdate = (postId, updated = {}) => {
    if (!postId) return
    setPosts((prev) => applyPostUpdate(prev, postId, updated))
    setFeedPosts((prev) => applyPostUpdate(prev, postId, updated))
  }

  const handlePostDelete = (postId) => {
    if (!postId) return
    setPosts((prev) => prev.filter((p) => String(p?.id ?? p?._id) !== String(postId)))
    setFeedPosts((prev) => prev.filter((p) => String(p?.id ?? p?._id) !== String(postId)))
  }

  const handlePostFromModal = (newPost) => {
    if (!newPost) return
    setPosts((prev) => [newPost, ...prev])
  }

  const leaveCommunityGroup = useCallback(async (groupId) => {
    if (!groupId) throw new Error('Invalid group')
    await groupService.leave(groupId)
    let clearedActive = false
    setActiveGroup((prev) => {
      const pid = prev?.id ?? prev?._id
      if (pid && String(pid) === String(groupId)) {
        clearedActive = true
        return null
      }
      return prev
    })
    if (clearedActive) {
      setActiveMembers([])
      setMyGroupMembership(null)
      setPosts([])
      setPostsHasMore(false)
      setPostsPage(1)
    }
    try {
      const list = await fetchJoinedGroupsList()
      setGroups(list)
    } catch {
      setGroups((prev) => prev.filter((g) => String(g.id ?? g._id) !== String(groupId)))
    }
  }, [fetchJoinedGroupsList])

  const joinCommunityGroup = useCallback(
    async (groupId) => {
      if (!groupId) throw new Error('Invalid group')
      const res = await groupService.join(groupId)
      const member = res?.data?.member ?? res?.member
      setMyGroupMembership({
        status: member?.status || 'pending',
        role: member?.role || 'member',
        invitedBy: member?.invitedBy ?? null,
      })
      const list = await fetchJoinedGroupsList()
      setGroups(list)
      return { pending: true }
    },
    [fetchJoinedGroupsList]
  )

  const withdrawPendingJoinRequest = useCallback(async (groupId) => {
    if (!groupId) return
    await groupService.leave(groupId)
    setMyGroupMembership(null)
  }, [])

  const acceptGroupInvite = useCallback(
    async (groupId) => {
      if (!groupId) return
      await groupService.acceptGroupInvite(groupId)
      try {
        const list = await fetchJoinedGroupsList()
        setGroups(list)
      } catch {
        /* ignore */
      }
      await loadGroupDetail(groupId)
    },
    [fetchJoinedGroupsList]
  )

  const declineGroupInvite = useCallback(async (groupId) => {
    if (!groupId) return
    await groupService.declineGroupInvite(groupId)
    setMyGroupMembership(null)
  }, [])

  const handleJoinRequestApproved = useCallback((payload) => {
    const { groupId, userPreview } = payload || {}
    if (!groupId || !userPreview?.id) return
    const gid = String(groupId)
    const uid = String(userPreview.id)
    setActiveGroup((prev) => {
      const pid = prev?.id ?? prev?._id
      if (!pid || String(pid) !== gid) return prev
      const c = prev.memberCount
      if (typeof c !== 'number') return prev
      return { ...prev, memberCount: c + 1 }
    })
    setActiveMembers((prev) => {
      if (prev.some((m) => String(m.id) === uid)) return prev
      const next = [
        ...prev,
        {
          id: userPreview.id,
          name: userPreview.name,
          avatar: userPreview.avatar ?? null,
        },
      ]
      return next.slice(0, 24)
    })
    setGroups((prev) =>
      prev.map((g) => {
        const id = g.id ?? g._id
        if (String(id) !== gid) return g
        const c = g.memberCount
        if (typeof c !== 'number') return g
        return { ...g, memberCount: c + 1 }
      })
    )
  }, [])

  const handleMemberRemovedFromGroup = useCallback((removedUserId, groupId) => {
    if (!removedUserId || !groupId) return
    const gid = String(groupId)
    const rid = String(removedUserId)
    setActiveGroup((prev) => {
      const pid = prev?.id ?? prev?._id
      if (!pid || String(pid) !== gid) return prev
      const c = prev.memberCount
      if (typeof c !== 'number') return prev
      return { ...prev, memberCount: Math.max(0, c - 1) }
    })
    setActiveMembers((prev) => prev.filter((m) => String(m.id) !== rid))
    setGroups((prev) =>
      prev.map((g) => {
        const id = g.id ?? g._id
        if (String(id) !== gid) return g
        const c = g.memberCount
        if (typeof c !== 'number') return g
        return { ...g, memberCount: Math.max(0, c - 1) }
      })
    )
  }, [])

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
    handlePostUpdate,
    handlePostDelete,
    handlePostFromModal,
    feedPosts,
    feedLoading,
    feedHasMore,
    feedSort,
    feedSearch,
    loadFeedPosts,
    loadMoreFeedPosts,
    postsSearch,
    loadGroupPosts,
    discoverGroups,
    loadingDiscover,
    loadDiscoverGroups,
    leaveCommunityGroup,
    joinCommunityGroup,
    handleMemberRemovedFromGroup,
    handleJoinRequestApproved,
    myGroupMembership,
    acceptGroupInvite,
    declineGroupInvite,
    withdrawPendingJoinRequest,
  }
}

