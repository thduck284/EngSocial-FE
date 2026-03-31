import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { communityService, userService, rawService, friendsService } from '../services'
import { useAuth } from '../context/AuthContext'
import { getAuthStorage } from '../utils/auth'
import { useDashboardSocket, useStudyGroups } from '../hooks'
import {
  formatDateForInput,
  normalizeFriendsFromResponse,
  sortFriendsByOnlineAndLastActive,
} from '../utils/profile'
import { getDefaultSkillStats, normalizeSkillStatsFromStats } from '../utils/dashboard'
import { DEFAULT_AVATAR } from '../constants/ui'

function mergeMediaByPostAndUrl(prev, incoming) {
  const seen = new Set(prev.map((p) => `${String(p.postId ?? '')}::${p.url}`))
  const out = [...prev]
  for (const p of incoming) {
    const k = `${String(p.postId ?? '')}::${p.url}`
    if (!seen.has(k)) {
      seen.add(k)
      out.push(p)
    }
  }
  return out
}

/**
 * Load posts for a given user (profile page).
 * Reusable for own profile and other user's profile.
 */
export function useProfilePosts(userId, { enabled = true, pageSize = 20 } = {}) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!enabled || !userId) return

    let cancelled = false
    setLoading(true)
    setError('')

    communityService
      .getPosts({ authorId: userId, page: 1, limit: pageSize })
      .then((res) => {
        if (cancelled) return
        const raw = res?.data ?? res ?? {}
        let list = []
        if (Array.isArray(raw)) list = raw
        else if (Array.isArray(raw.data)) list = raw.data
        else if (Array.isArray(raw.posts)) list = raw.posts
        else if (Array.isArray(raw.data?.items)) list = raw.data.items
        else list = []
        setPosts(list)
      })
      .catch((err) => {
        if (cancelled) return
        setPosts([])
        setError(err?.message || '')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId, enabled, pageSize])

  return { posts, loading, error }
}

/**
 * Load photos (images) from user's posts with simple infinite scroll.
 * Returns photos in pages of `pageSize` images; when reaching bottom, call `loadMore`.
 */
export function useProfilePhotos(userId, { pageSize = 5 } = {}) {
  const [allPhotos, setAllPhotos] = useState([]) // flat list of { url, postId }
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const [postsPage, setPostsPage] = useState(1)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const postsPageRef = useRef(1)
  const fetchInFlightRef = useRef(false)

  useEffect(() => {
    // reset when user changes
    setAllPhotos([])
    setVisibleCount(pageSize)
    setPostsPage(1)
    postsPageRef.current = 1
    fetchInFlightRef.current = false
    setHasMorePosts(true)
    setError('')
    setLoading(false)
  }, [userId, pageSize])

  // Load first page automatically when userId is available
  useEffect(() => {
    if (!userId) return
    // only auto-load when we haven't loaded anything yet
    if (allPhotos.length > 0 || !hasMorePosts || loading) return
    // fire and forget
    // eslint-disable-next-line no-void
    void fetchNextPostsPage()
  }, [userId, allPhotos.length, hasMorePosts, loading])

  const fetchNextPostsPage = async () => {
    if (!userId || !hasMorePosts) return []
    if (fetchInFlightRef.current) return []
    fetchInFlightRef.current = true
    const currentPage = postsPageRef.current
    setLoading(true)
    setError('')
    try {
      const res = await communityService.getPosts({
        authorId: userId,
        page: currentPage,
        limit: 10,
      })
      const raw = res?.data ?? res ?? {}
      let list = []
      if (Array.isArray(raw)) list = raw
      else if (Array.isArray(raw.data)) list = raw.data
      else if (Array.isArray(raw.posts)) list = raw.posts
      else if (Array.isArray(raw.data?.items)) list = raw.data.items

      if (!Array.isArray(list) || list.length === 0) {
        setHasMorePosts(false)
        return []
      }

      const photosFromPosts = list.flatMap((post) => {
        // Photos tab only shows images from original posts,
        // not from shared/reposted posts.
        if (post?.sharedPostId || post?.sharedPost) return []
        const postId = post?.id ?? post?._id
        const images = Array.isArray(post?.images) ? post.images : []
        return images
          .filter((url) => typeof url === 'string' && url.trim())
          .map((url) => ({ url, postId }))
      })

      postsPageRef.current = currentPage + 1
      setPostsPage(postsPageRef.current)
      setHasMorePosts(list.length === 10)
      if (photosFromPosts.length) {
        setAllPhotos((prev) => mergeMediaByPostAndUrl(prev, photosFromPosts))
      }
      return photosFromPosts
    } catch (err) {
      setError(err?.message || 'Failed to load photos')
      return []
    } finally {
      fetchInFlightRef.current = false
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (loading) return

    // If we already have hidden photos buffered, just reveal more
    if (visibleCount < allPhotos.length) {
      setVisibleCount((prev) => prev + pageSize)
      return
    }

    if (!hasMorePosts) return

    const newPhotos = await fetchNextPostsPage()
    if (newPhotos.length > 0) {
      setVisibleCount((prev) => prev + pageSize)
    }
  }

  const visiblePhotos = allPhotos.slice(0, visibleCount)
  const hasMore =
    visibleCount < allPhotos.length || (hasMorePosts && allPhotos.length === 0)

  return {
    photos: visiblePhotos,
    loading,
    error,
    hasMore,
    loadMore,
  }
}

/**
 * Load videos from user's original posts with infinite scroll.
 * Excludes shared/reposted posts.
 */
export function useProfileVideos(userId, { pageSize = 5 } = {}) {
  const [allVideos, setAllVideos] = useState([]) // flat list of { url, postId }
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const [postsPage, setPostsPage] = useState(1)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const postsPageRef = useRef(1)
  const fetchInFlightRef = useRef(false)

  useEffect(() => {
    setAllVideos([])
    setVisibleCount(pageSize)
    setPostsPage(1)
    postsPageRef.current = 1
    fetchInFlightRef.current = false
    setHasMorePosts(true)
    setError('')
    setLoading(false)
  }, [userId, pageSize])

  useEffect(() => {
    if (!userId) return
    if (allVideos.length > 0 || !hasMorePosts || loading) return
    // eslint-disable-next-line no-void
    void fetchNextPostsPage()
  }, [userId, allVideos.length, hasMorePosts, loading])

  const fetchNextPostsPage = async () => {
    if (!userId || !hasMorePosts) return []
    if (fetchInFlightRef.current) return []
    fetchInFlightRef.current = true
    const currentPage = postsPageRef.current
    setLoading(true)
    setError('')
    try {
      const res = await communityService.getPosts({
        authorId: userId,
        page: currentPage,
        limit: 10,
      })
      const raw = res?.data ?? res ?? {}
      let list = []
      if (Array.isArray(raw)) list = raw
      else if (Array.isArray(raw.data)) list = raw.data
      else if (Array.isArray(raw.posts)) list = raw.posts
      else if (Array.isArray(raw.data?.items)) list = raw.data.items

      if (!Array.isArray(list) || list.length === 0) {
        setHasMorePosts(false)
        return []
      }

      const videosFromPosts = list.flatMap((post) => {
        if (post?.sharedPostId || post?.sharedPost) return []
        const postId = post?.id ?? post?._id
        const video = typeof post?.video === 'string' ? post.video.trim() : ''
        return video ? [{ url: video, postId }] : []
      })

      postsPageRef.current = currentPage + 1
      setPostsPage(postsPageRef.current)
      setHasMorePosts(list.length === 10)
      if (videosFromPosts.length) {
        setAllVideos((prev) => mergeMediaByPostAndUrl(prev, videosFromPosts))
      }
      return videosFromPosts
    } catch (err) {
      setError(err?.message || 'Failed to load videos')
      return []
    } finally {
      fetchInFlightRef.current = false
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (loading) return
    if (visibleCount < allVideos.length) {
      setVisibleCount((prev) => prev + pageSize)
      return
    }
    if (!hasMorePosts) return
    const newVideos = await fetchNextPostsPage()
    if (newVideos.length > 0) {
      setVisibleCount((prev) => prev + pageSize)
    }
  }

  const visibleVideos = allVideos.slice(0, visibleCount)
  const hasMore =
    visibleCount < allVideos.length || (hasMorePosts && allVideos.length === 0)

  return {
    videos: visibleVideos,
    loading,
    error,
    hasMore,
    loadMore,
  }
}

/**
 * Full logic for ProfilePage (own profile).
 * Uses `useProfilePosts` internally and shares state/handlers to the component.
 */
export function useProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, setAuth, logout } = useAuth()

  const [raw, setRaw] = useState({
    userProfile: { name: '', level: 1, xp: 0, xpMax: 500, avatar: '' },
    goals: [],
    profileAchievements: [],
  })

  const defaultSkillStats = getDefaultSkillStats()
  const [profileSkillStats, setProfileSkillStats] = useState(defaultSkillStats)
  const [profileSkillDetails, setProfileSkillDetails] = useState([])
  const [profileFriends, setProfileFriends] = useState([])
  const [profileFriendsLoading, setProfileFriendsLoading] = useState(true)
  const [onlineUserIds, setOnlineUserIds] = useState(new Set())
  const studyGroups = useStudyGroups(setOnlineUserIds)
  useDashboardSocket(user, studyGroups.setConversations, undefined, setOnlineUserIds)

  useEffect(() => {
    setProfileFriendsLoading(true)
    friendsService
      .getList({ limit: 100 })
      .then((res) => setProfileFriends(normalizeFriendsFromResponse(res)))
      .catch(() => setProfileFriends([]))
      .finally(() => setProfileFriendsLoading(false))
  }, [])

  useEffect(() => {
    rawService
      .getDashboard()
      .then((res) => {
        const d = res?.data || {}
        setRaw((prev) => ({
          userProfile: d.userProfile || prev.userProfile,
          goals: d.goals || [],
          profileAchievements: d.profileAchievements || [],
        }))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    userService
      .getStats()
      .then((res) => {
        const data = res?.data || res || {}
        const list = normalizeSkillStatsFromStats(data, defaultSkillStats)
        setProfileSkillStats(list)
        const details = Array.isArray(data?.skillStats) ? data.skillStats : []
        setProfileSkillDetails(details)
      })
      .catch(() => {
        setProfileSkillStats(defaultSkillStats)
        setProfileSkillDetails([])
      })
  }, [defaultSkillStats])

  const profile = raw.userProfile
  const displayName = user?.name ?? profile.name
  const displayLevel = user?.level ?? profile.level
  const displayXp = Number(user?.xp ?? profile.xp) || 0
  const displayXpMax = Number(user?.xpMax ?? profile.xpMax ?? 500) || 500
  const displayAvatar = user?.avatar ?? profile.avatar ?? DEFAULT_AVATAR
  const xpPercent = displayXpMax ? Math.min(100, Math.round((displayXp / displayXpMax) * 100)) : 0

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    address: '',
    dateOfBirth: '',
    gender: '',
  })
  const [initialForm, setInitialForm] = useState(form)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [friendSearch, setFriendSearch] = useState('')
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarSaving, setAvatarSaving] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [profileTab, setProfileTab] = useState('personalInfo')

  useEffect(() => {
    const name = user?.name ?? raw.userProfile?.name ?? ''
    const email = user?.email ?? ''
    const phone = user?.phone ?? ''
    const bio = user?.bio ?? ''
    const address = user?.address ?? ''
    const dateOfBirth = formatDateForInput(user?.dateOfBirth)
    const gender = user?.gender ?? ''
    const next = { name, email, phone, bio, address, dateOfBirth, gender }
    setForm(next)
    setInitialForm(next)
  }, [user, raw.userProfile?.name])

  const userId = user?.id || user?._id
  const {
    posts: profilePosts,
    loading: profilePostsLoading,
    error: profilePostsError,
  } = useProfilePosts(userId, { enabled: profileTab === 'posts', pageSize: 20 })

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setMessage({ type: '', text: '' })
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const payload = {
        name: form.name,
        ...(form.phone !== undefined && { phone: form.phone }),
        ...(form.bio !== undefined && { bio: form.bio }),
        ...(form.address !== undefined && { address: form.address }),
        ...(form.dateOfBirth && { dateOfBirth: form.dateOfBirth }),
        ...(form.gender && { gender: form.gender }),
      }
      const res = await userService.updateProfile(payload)
      if (res?.success !== false && res?.data?.user) {
        const updatedUser = res.data.user
        setAuth({ user: updatedUser })
        setInitialForm(form)
        getAuthStorage().setItem('user', JSON.stringify(updatedUser))
      }
      setMessage({ type: 'success', text: res?.message || t('profile.saveSuccess') })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.data?.message || err?.message || t('profile.saveFailed'),
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm(initialForm)
    setMessage({ type: '', text: '' })
  }

  const handleLogout = () => {
    logout()
  }

  const openAvatarModal = () => {
    setAvatarFile(null)
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return ''
    })
    setAvatarError('')
    setShowAvatarModal(true)
  }

  const closeAvatarModal = () => {
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return ''
    })
    setShowAvatarModal(false)
  }

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowed.includes(file.type)) {
      setAvatarError(t('profile.avatarInvalidType'))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(t('profile.avatarTooLarge'))
      return
    }
    setAvatarError('')
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setAvatarFile(file)
  }

  const handleSaveAvatar = async () => {
    if (!avatarFile) {
      setAvatarError(t('profile.avatarChooseRequired'))
      return
    }
    setAvatarSaving(true)
    setAvatarError('')
    try {
      const res = await userService.uploadAvatar(avatarFile)
      if (res?.success !== false && res?.data?.user) {
        const updatedUser = res.data.user
        setAuth({ user: updatedUser })
        getAuthStorage().setItem('user', JSON.stringify(updatedUser))
        closeAvatarModal()
      }
      setMessage({ type: 'success', text: res?.message || t('profile.saveSuccess') })
    } catch (err) {
      setAvatarError(err?.data?.message || err?.message || t('profile.saveFailed'))
    } finally {
      setAvatarSaving(false)
    }
  }

  const listWithStatus = useMemo(() => {
    return profileFriends.map((f) => {
      const id = String(f.id ?? f._id ?? '')
      const isSocketOnline = onlineUserIds.has(id)
      const isApiOnline = f.online === true
      const isConvOnline = studyGroups.allConversations.some((c) => {
        if (c.isGroup) return false
        const other = c.participants?.find((p) => String(p._id ?? p.id ?? '') === id)
        return other && other.online === true
      })
      const isOnline = isSocketOnline || isApiOnline || isConvOnline
      return { ...f, isOnline }
    })
  }, [profileFriends, onlineUserIds, studyGroups.allConversations])

  const sortedProfileFriends = useMemo(
    () => sortFriendsByOnlineAndLastActive(listWithStatus, onlineUserIds),
    [listWithStatus, onlineUserIds]
  )

  const filteredFriends = useMemo(() => {
    return listWithStatus.filter(
      (f) =>
        !friendSearch.trim() ||
        (f.name && f.name.toLowerCase().includes(friendSearch.toLowerCase()))
    )
  }, [listWithStatus, friendSearch])

  const goalsDone = raw.goals.filter((g) => g.done).length
  const goalsTotal = raw.goals.length

  return {
    t,
    navigate,
    user,
    raw,
    profileSkillStats,
    profileFriends,
    sortedProfileFriends,
    profileFriendsLoading,
    onlineUserIds,
    displayName,
    displayLevel,
    displayXp,
    displayXpMax,
    displayAvatar,
    xpPercent,
    form,
    initialForm,
    saving,
    message,
    friendSearch,
    setFriendSearch,
    showAvatarModal,
    avatarPreview,
    avatarSaving,
    avatarError,
    profileTab,
    profilePosts,
    profilePostsLoading,
    profilePostsError,
    filteredFriends,
    goalsDone,
    goalsTotal,
    profileSkillDetails,
    handleChange,
    handleSave,
    handleCancel,
    handleLogout,
    openAvatarModal,
    closeAvatarModal,
    handleAvatarFileChange,
    handleSaveAvatar,
    setProfileTab,
  }
}

