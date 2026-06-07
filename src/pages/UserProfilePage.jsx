import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useDashboardSocket, useStudyGroups } from '../hooks'
import { ROUTES } from '../constants'
import { DEFAULT_AVATAR } from '../constants/ui'
import { userService, friendsService, reportService } from '../services'
import { useProfilePosts, useProfilePhotos, useProfileVideos } from '../hooks/useProfile'
import { ProfilePostsList } from '../components/profile/ProfilePostsList'
import { ProfilePhotosGrid } from '../components/profile/ProfilePhotosGrid'
import { ProfileVideosGrid } from '../components/profile/ProfileVideosGrid'
import { ProfileSkillsTab } from '../components/profile/ProfileSkillsTab'
import { ProfileFriendsListModal } from '../components/profile/ProfileFriendsListModal'
import { ReportContentModal } from '../components/ui/common/ReportContentModal'
import { normalizeFriendsFromResponse, sortFriendsByOnlineAndLastActive } from '../utils/profile'
import { ProfileLeftStatsSection } from '../components/profile/ProfileLeftStatsSection'
import { ProfileAchievementsCard } from '../components/profile/ProfileAchievementsCard'
import { useProfileAchievements } from '../hooks/useProfileAchievements'
import { flatAchievementItemsFromApiList } from '../hooks/useAchievementsCatalog'
import { getDefaultSkillStats, normalizeSkillStatsFromStats } from '../utils/dashboard'

function formatJoinedAt(createdAt) {
  if (!createdAt) return ''
  const d = new Date(createdAt)
  return d.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
}

function mapApiProfileToState(data) {
  if (!data) return null
  return {
    id: data.id,
    name: data.name,
    email: data.email ?? '',
    avatar: data.avatar,
    bio: data.bio,
    phone: data.phone ?? '',
    address: data.address ?? '',
    dateOfBirth: data.dateOfBirth ?? '',
    gender: data.gender ?? '',
    level: data.level ?? 1,
    xp: data.xp ?? 0,
    totalXp: data.totalXp ?? 0,
    xpMax: data.xpMax,
    xpPercent: data.xpPercent ?? 0,
    mutualFriendsCount: data.mutualFriendsCount ?? 0,
    friendsCount: data.friendsCount ?? 0,
    friendStatus: data.friendStatus ?? 'none',
    friendshipId: data.friendshipId,
    pendingSentByMe: data.pendingSentByMe,
    blockedByMe: data.blockedByMe ?? false,
    joinedAt: formatJoinedAt(data.createdAt),
    profileSkills: data.profileSkills || { skills: {}, goals: [], activeView: 'bars', updatedAt: null },
    skills: Array.isArray(data.skills) ? data.skills : [],
    achievements: data.achievements || data.badges || data.badgeList || data.userAchievements || data.profileAchievements || data.unlockedBadges || data.achieved || data.earned || [],
    friends: Array.isArray(data.friends) ? data.friends : [],
    mutualFriends: Array.isArray(data.mutualFriends) ? data.mutualFriends : [],
  }
}

export function UserProfilePage() {
  const { t, i18n } = useTranslation()
  const { userId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user: currentUser } = useAuth()
  const [onlineUserIds, setOnlineUserIds] = useState(new Set())
  const studyGroups = useStudyGroups(setOnlineUserIds)
  useDashboardSocket(currentUser, studyGroups.setConversations, undefined, setOnlineUserIds)

  const [activeTab, setActiveTab] = useState('about')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [friendActionLoading, setFriendActionLoading] = useState(false)
  const [blockActionLoading, setBlockActionLoading] = useState(false)
  const [friendsMenuOpen, setFriendsMenuOpen] = useState(false)
  const [friendsModalOpen, setFriendsModalOpen] = useState(false)
  /** null = đang tải; Set rỗng = đã tải xong (dùng trong modal bạn bè để biết ai đã là bạn / đã gửi lời mời) */
  const [myConnectedFriendIds, setMyConnectedFriendIds] = useState(null)
  const [myPendingSentUserIds, setMyPendingSentUserIds] = useState(null)
  const friendsMenuRef = useRef(null)
  const [showReportUserModal, setShowReportUserModal] = useState(false)
  const [showMutualFriendsModal, setShowMutualFriendsModal] = useState(false)
  const [profileProgress, setProfileProgress] = useState({
    level: 1,
    xp: 0,
    xpMax: 500,
  })

  const viewerId = currentUser?.id || currentUser?._id

  const {
    posts: userPosts,
    loading: userPostsLoading,
    error: userPostsError,
  } = useProfilePosts(userId, { enabled: activeTab === 'posts', pageSize: 20 })

  const {
    photos: userPhotos,
    loading: userPhotosLoading,
    error: userPhotosError,
    hasMore: userPhotosHasMore,
    loadMore: loadMoreUserPhotos,
  } = useProfilePhotos(userId, { pageSize: 5 })
  const {
    videos: userVideos,
    loading: userVideosLoading,
    error: userVideosError,
    hasMore: userVideosHasMore,
    loadMore: loadMoreUserVideos,
  } = useProfileVideos(userId, { pageSize: 5 })

  const { items: fetchedAchievements, loading: userAchievementsLoading } = useProfileAchievements(userId)
  
  const userAchievements = useMemo(() => {
    let list = fetchedAchievements
    if (list.length === 0 && profile?.achievements?.length > 0) {
      list = flatAchievementItemsFromApiList(profile.achievements, t, i18n.language)
    }
    return list
  }, [fetchedAchievements, profile?.achievements, t, i18n.language])
  const [userSkillStats, setUserSkillStats] = useState(getDefaultSkillStats())

  useEffect(() => {
    if (!userId) return
    setUserSkillStats(getDefaultSkillStats()) // Reset on change
    userService.getStats(userId)
      .then(res => {
        const data = res?.data || res || {}
        const list = normalizeSkillStatsFromStats(data, getDefaultSkillStats())
        setUserSkillStats(list)

        // Update level and XP from stats
        setProfileProgress({
          level: Number(data.level || data.currentLevel || 1),
          xp: Number(data.currentXp || data.xpInLevel || data.xp || 0),
          xpMax: Number(data.xpToNextLevel || 500),
        })
        // Update achievements if present in stats
        const statsAchievements = data.achievements || data.profileAchievements || data.userAchievements || []
        if (statsAchievements.length > 0) {
           setProfile(prev => prev ? { ...prev, achievements: statsAchievements } : prev)
        }
      })
      .catch(() => setUserSkillStats(getDefaultSkillStats()))
  }, [userId])

  const refetchProfile = useCallback(() => {
    if (!userId) return
    userService.getUserProfile(userId).then((res) => setProfile(mapApiProfileToState(res?.data))).catch(() => setProfile(null))
  }, [userId])

  useEffect(() => {
    if (!viewerId || !userId) {
      setMyConnectedFriendIds(null)
      setMyPendingSentUserIds(null)
      return
    }
    if (String(viewerId) === String(userId)) return
    let cancelled = false
    setMyConnectedFriendIds(null)
    setMyPendingSentUserIds(null)
    Promise.all([
      friendsService.getList({ limit: 200 }),
      friendsService.getSentRequests({ limit: 100 }),
    ])
      .then(([listRes, sentRes]) => {
        if (cancelled) return
        const friends = normalizeFriendsFromResponse(listRes)
        const connected = new Set(friends.map((f) => String(f.id)))
        const rawSent = sentRes?.data?.data ?? sentRes?.data ?? []
        const sentList = Array.isArray(rawSent) ? rawSent : []
        const pendingSent = new Set(
          sentList
            .map((r) => {
              const to = r?.to || {}
              return String(to?.id ?? to?._id ?? '')
            })
            .filter(Boolean)
        )
        setMyConnectedFriendIds(connected)
        setMyPendingSentUserIds(pendingSent)
      })
      .catch(() => {
        if (!cancelled) {
          setMyConnectedFriendIds(new Set())
          setMyPendingSentUserIds(new Set())
        }
      })
    return () => {
      cancelled = true
    }
  }, [viewerId, userId])

  const handleSendFriendRequestFromModal = useCallback(async (targetUserId) => {
    await friendsService.sendRequest(targetUserId)
    setMyPendingSentUserIds((prev) => {
      const next = new Set(prev ?? [])
      next.add(String(targetUserId))
      return next
    })
  }, [])

  const handleAddFriend = useCallback(() => {
    if (!userId || friendActionLoading) return
    setFriendActionLoading(true)
    friendsService
      .sendRequest(userId)
      .then((res) => {
        const friendship = res?.data?.friendship
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                friendStatus: 'pending',
                pendingSentByMe: true,
                friendshipId: friendship?.id ?? prev.friendshipId,
              }
            : prev
        )
      })
      .catch(() => refetchProfile())
      .finally(() => setFriendActionLoading(false))
  }, [userId, friendActionLoading, refetchProfile])

  const handleCancelRequest = useCallback(() => {
    const friendshipId = profile?.friendshipId
    if (!friendshipId || friendActionLoading) return
    setFriendActionLoading(true)
    friendsService
      .cancelRequest(friendshipId)
      .then(() => {
        setProfile((prev) =>
          prev ? { ...prev, friendStatus: 'none', friendshipId: null, pendingSentByMe: false } : prev
        )
      })
      .catch(() => refetchProfile())
      .finally(() => setFriendActionLoading(false))
  }, [profile?.friendshipId, friendActionLoading, refetchProfile])

  const handleAcceptRequest = useCallback(() => {
    const friendshipId = profile?.friendshipId
    if (!friendshipId || friendActionLoading) return
    setFriendActionLoading(true)
    friendsService
      .acceptRequest(friendshipId)
      .then(() => {
        setProfile((prev) =>
          prev ? { ...prev, friendStatus: 'connected', friendshipId: null, pendingSentByMe: false } : prev
        )
      })
      .catch(() => refetchProfile())
      .finally(() => setFriendActionLoading(false))
  }, [profile?.friendshipId, friendActionLoading, refetchProfile])

  const handleRemoveFriend = useCallback(() => {
    if (!userId || friendActionLoading) return
    setFriendActionLoading(true)
    setFriendsMenuOpen(false)
    friendsService
      .removeFriend(userId)
      .then(() => {
        setProfile((prev) => (prev ? { ...prev, friendStatus: 'none', friendshipId: null, pendingSentByMe: false } : prev))
      })
      .catch(() => refetchProfile())
      .finally(() => setFriendActionLoading(false))
  }, [userId, friendActionLoading, refetchProfile])

  const handleBlock = useCallback(() => {
    if (!userId || blockActionLoading) return
    setBlockActionLoading(true)
    setFriendsMenuOpen(false)
    userService
      .blockUser(userId)
      .then(() => {
        navigate(ROUTES.HOME, { replace: true })
      })
      .catch(() => {
        refetchProfile()
        setBlockActionLoading(false)
      })
  }, [userId, blockActionLoading, refetchProfile, navigate])

  const handleUnblock = useCallback(() => {
    if (!userId || blockActionLoading) return
    setBlockActionLoading(true)
    userService
      .unblockUser(userId)
      .then(() => {
        setProfile((prev) => (prev ? { ...prev, blockedByMe: false } : prev))
      })
      .catch(() => refetchProfile())
      .finally(() => setBlockActionLoading(false))
  }, [userId, blockActionLoading, refetchProfile])

  const handleMessage = useCallback(() => {
    if (!userId || !profile) return
    navigate(`${ROUTES.MESSAGES}?with=${encodeURIComponent(userId)}`, {
      state: { withUser: { id: userId, name: profile.name, avatar: profile.avatar } },
    })
  }, [navigate, userId, profile])

  // Đồng bộ URL -> activeTab cho user profile
  useEffect(() => {
    const path = location.pathname || ''
    if (path.endsWith('/posts') && activeTab !== 'posts') {
      setActiveTab('posts')
    } else if (path.endsWith('/photos') && activeTab !== 'photos') {
      setActiveTab('photos')
    } else if (path.endsWith('/video') && activeTab !== 'video') {
      setActiveTab('video')
    } else if (path.endsWith('/skills') && activeTab !== 'skills') {
      setActiveTab('skills')
    } else if (path.endsWith('/personalInfo') && activeTab !== 'personalInfo') {
      setActiveTab('personalInfo')
    } else if (
      !path.includes('/posts') &&
      !path.includes('/photos') &&
      !path.includes('/video') &&
      !path.endsWith('/personalInfo') &&
      !path.endsWith('/skills') &&
      activeTab !== 'about'
    ) {
      setActiveTab('about')
    }
  }, [location.pathname, activeTab])

  useEffect(() => {
    if (!friendsMenuOpen) return
    const handleClickOutside = (e) => {
      if (friendsMenuRef.current && !friendsMenuRef.current.contains(e.target)) setFriendsMenuOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [friendsMenuOpen])

  useEffect(() => {
    if (!userId) {
      navigate(ROUTES.PROFILE, { replace: true })
      return
    }
    // Nếu đang xem chính mình → redirect về /profile
    if (currentUser?.id === userId || currentUser?._id === userId) {
      navigate(ROUTES.PROFILE, { replace: true })
      return
    }
    setProfile(null) // Reset on change
    setLoading(true)
    userService
      .getUserProfile(userId)
      .then((res) => {
        const data = res?.data
        const mapped = mapApiProfileToState(data)
        if (!mapped) {
          setProfile(null)
          return
        }
        setProfile(mapped)
        if (mapped) {
          setProfileProgress((prev) => ({
            ...prev,
            level: mapped.level,
            xp: mapped.xp,
            xpMax: mapped.xpMax || prev.xpMax,
          }))
          // If profile response already contains achievements, use them
          if (mapped.achievements && mapped.achievements.length > 0) {
            // We can't directly set state in the hook from here easily without refactoring, 
            // but we can ensure useProfileAchievements is robust.
          }
        }
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [userId, currentUser?.id, currentUser?._id, navigate])

  const friendsForModal = useMemo(() => {
    const raw = profile?.friends || []
    return sortFriendsByOnlineAndLastActive(
      raw.map((f) => ({
        id: f.id ?? f._id,
        name: f.name ?? 'User',
        avatar: f.avatar || DEFAULT_AVATAR,
        level: f.level ?? 1,
        lastActiveAt: f.lastActiveAt ?? f.lastSeen ?? f.lastActiveDate ?? null,
      })),
      onlineUserIds
    )
  }, [profile?.friends, onlineUserIds])

  if (loading) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 lg:px-10 py-8 flex items-center justify-center min-h-[50vh]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 lg:px-10 py-8 text-center">
        <span className="material-symbols-outlined text-5xl text-gray-500">person_off</span>
        <p className="mt-4 text-gray-400">{t('userProfile.notFound')}</p>
        <Link to={ROUTES.HOME} className="mt-4 inline-block text-primary hover:underline">{t('header.home')}</Link>
      </main>
    )
  }

  const displayAvatar = profile.avatar || DEFAULT_AVATAR
  const xpPercent = profileProgress.xpMax ? Math.min(100, Math.round((profileProgress.xp / profileProgress.xpMax) * 100)) : 0

  return (
    <main className="max-w-[1440px] mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] gap-6">
        {/* Left: Profile card & Friends */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 flex flex-col items-center text-center shadow-sm relative">
            <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-primary/10 to-transparent rounded-t-xl" />
            <div className="relative mb-4 z-10">
              <div className="size-28 rounded-full border-2 border-white dark:border-card-dark shadow-sm overflow-hidden ring-2 ring-primary/20">
                <img alt={profile.name} className="w-full h-full rounded-full object-cover" src={displayAvatar} />
              </div>
              {(() => {
                const isOnline = Boolean(userId && onlineUserIds && onlineUserIds.has(String(userId)))
                return (
                  <div
                    className={`absolute bottom-1 right-1 size-4 rounded-full border-2 border-white dark:border-card-dark shadow-sm ${isOnline ? 'bg-green-500' : 'bg-slate-300 dark:bg-gray-600'}`}
                    title={isOnline ? t('userProfile.online') : t('profile.offline')}
                  >
                    <div className={`w-full h-full rounded-full ${isOnline ? 'animate-pulse bg-green-400' : ''}`} />
                  </div>
                )
              })()}
            </div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 relative z-10">{profile.name}</h1>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                {t('userProfile.levelLabel', { level: profileProgress.level || 1 })}
              </span>
              <span className="text-slate-300 dark:text-gray-700">•</span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wide">{profileProgress.xp || 0} XP</span>
            </div>
            
            <div className="w-full mb-4 bg-slate-50 dark:bg-background-dark/50 p-4 rounded-xl border border-slate-100 dark:border-white/5 relative z-10">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide mb-2 text-slate-400 dark:text-gray-500">
                <span>{t('userProfile.levelProgress')}</span>
                <span className="text-primary">{xpPercent}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-card-dark rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-1000" style={{ width: `${xpPercent}%` }} />
              </div>
              <p className="text-[10px] font-medium text-slate-400 dark:text-gray-600 mt-2">{t('userProfile.levelUpSoon')}</p>
            </div>

            {profile.mutualFriendsCount > 0 && (
              <button
                type="button"
                onClick={() => setShowMutualFriendsModal(true)}
                className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wide flex items-center justify-center gap-1.5 mb-4 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-100 dark:border-white/5 relative z-10 transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-primary dark:hover:text-primary group mx-auto"
              >
                <span className="material-symbols-outlined text-sm text-primary group-hover:scale-110 transition-transform">group</span>
                {t('userProfile.mutualFriends', { count: profile.mutualFriendsCount })}
              </button>
            )}

            <div className="w-full flex flex-col gap-2 relative z-10">
              <div className="flex gap-2 items-stretch">
                {profile.friendStatus === 'connected' && (
                  <button
                    type="button"
                    disabled={profile.blockedByMe}
                    onClick={handleMessage}
                    className="flex-1 bg-primary hover:brightness-110 disabled:opacity-50 text-white h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    {t('userProfile.sendMessage')}
                  </button>
                )}
                {profile.friendStatus === 'none' && (
                  <>
                    <button
                      type="button"
                      disabled={friendActionLoading}
                      onClick={handleAddFriend}
                      className="flex-1 bg-primary hover:brightness-110 disabled:opacity-60 text-white h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                      {friendActionLoading ? (
                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                      )}
                      {t('userProfile.addFriend')}
                    </button>
                    <button
                      type="button"
                      disabled={profile.blockedByMe}
                      onClick={handleMessage}
                      className="flex-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 disabled:opacity-50 text-slate-700 dark:text-white h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-200 dark:border-white/10"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                      {t('userProfile.sendMessage')}
                    </button>
                  </>
                )}
                {profile.friendStatus === 'pending' && profile.pendingSentByMe && (
                  <>
                    <button
                      type="button"
                      disabled={friendActionLoading}
                      onClick={handleCancelRequest}
                      className="flex-1 bg-amber-500 hover:brightness-110 disabled:opacity-60 text-white h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                      {friendActionLoading ? (
                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">person_remove</span>
                      )}
                      {t('userProfile.cancelRequest')}
                    </button>
                    <button
                      type="button"
                      disabled={profile.blockedByMe}
                      onClick={handleMessage}
                      className="flex-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 disabled:opacity-50 text-slate-700 dark:text-white h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-200 dark:border-white/10"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                      {t('userProfile.sendMessage')}
                    </button>
                  </>
                )}
                {profile.friendStatus === 'pending' && !profile.pendingSentByMe && (
                  <>
                    <button
                      type="button"
                      disabled={friendActionLoading}
                      onClick={handleAcceptRequest}
                      className="flex-1 bg-emerald-500 hover:brightness-110 disabled:opacity-60 text-white h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                      {friendActionLoading ? (
                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      )}
                      {t('userProfile.acceptRequest')}
                    </button>
                    <button
                      type="button"
                      disabled={friendActionLoading}
                      onClick={handleCancelRequest}
                      className="flex-1 bg-slate-100 dark:bg-white/10 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-60 text-slate-700 dark:text-white h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-200 dark:border-white/10"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                      {t('userProfile.declineRequest')}
                    </button>
                  </>
                )}
                
                {viewerId && userId && String(viewerId) !== String(userId) && (
                  <div className="relative shrink-0" ref={friendsMenuRef}>
                    <button
                      type="button"
                      onClick={() => setFriendsMenuOpen((o) => !o)}
                      className="size-10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 rounded-lg flex items-center justify-center transition-all border border-slate-100 dark:border-white/5"
                      aria-expanded={friendsMenuOpen}
                    >
                      <span className="material-symbols-outlined text-[20px] transition-transform duration-300" style={{ transform: friendsMenuOpen ? 'rotate(180deg)' : 'none' }}>expand_more</span>
                    </button>
                    {friendsMenuOpen && (
                      <div className="absolute right-0 top-full z-[100] mt-2 py-1.5 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark shadow-lg min-w-[200px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {profile.friendStatus === 'connected' && (
                          <>
                            <button
                              type="button"
                              disabled={friendActionLoading}
                              onClick={handleRemoveFriend}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-left text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-60 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px] text-rose-500">person_remove</span>
                              {t('userProfile.removeFriend')}
                            </button>
                            <div className="h-px bg-slate-100 dark:bg-white/5 mx-2 my-1" />
                          </>
                        )}
                        {profile.blockedByMe ? (
                          <button
                            type="button"
                            disabled={blockActionLoading}
                            onClick={handleUnblock}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-left text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-60 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px] text-primary">block</span>
                            {t('messages.unblock')}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={blockActionLoading}
                            onClick={handleBlock}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-left text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 disabled:opacity-60 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">block</span>
                            {t('userProfile.block')}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {viewerId && userId && String(viewerId) !== String(userId) ? (
                <button
                  type="button"
                  onClick={() => setShowReportUserModal(true)}
                  className="w-full text-slate-400 dark:text-gray-600 hover:text-rose-500 py-2 text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-colors mt-1"
                >
                  <span className="material-symbols-outlined text-sm">report</span>
                  {t('userProfile.report')}
                </button>
              ) : null}
            </div>

          </div>

          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
            <ProfileFriendsListModal
              t={t}
              show={friendsModalOpen}
              onClose={() => setFriendsModalOpen(false)}
              friends={friendsForModal}
              loading={false}
              onlineUserIds={onlineUserIds}
              navigate={navigate}
              showStrangerAddFriend={Boolean(viewerId && userId && String(viewerId) !== String(userId))}
              viewerUserId={viewerId}
              myConnectedFriendIds={myConnectedFriendIds}
              myPendingSentUserIds={myPendingSentUserIds}
              onSendFriendRequest={handleSendFriendRequestFromModal}
            />
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900 dark:text-white flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                {t('userProfile.friendsCount', { count: profile.friendsCount })}
              </h3>
              <button
                type="button"
                onClick={() => setFriendsModalOpen(true)}
                className="text-xs font-bold text-primary hover:underline"
              >
                {t('userProfile.viewAllFriends')}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {profile.friends.slice(0, 6).map((friend) => (
                <Link
                  key={friend.id}
                  to={`/profile/${friend.id}`}
                  className="flex flex-col items-center gap-2 text-center group"
                >
                  <div className="size-12 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                    <img alt="" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" src={friend.avatar} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide truncate w-full group-hover:text-primary transition-colors">{friend.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tabs & Content */}
        <div className="min-w-0 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm flex flex-col">
          <nav className="flex w-full border-b border-slate-100 dark:border-white/5 overflow-x-auto no-scrollbar">
            {[
              { key: 'about', label: 'userProfile.tabAbout', icon: 'info' },
              { key: 'personalInfo', label: 'userProfile.tabPersonalInfo', icon: 'badge' },
              { key: 'skills', label: 'userProfile.mySkills', icon: 'psychology' },
              { key: 'posts', label: 'userProfile.tabPosts', icon: 'article' },
              { key: 'photos', label: 'userProfile.tabPhotos', icon: 'photo_library' },
              { key: 'video', label: 'userProfile.tabVideo', icon: 'movie' },
            ].map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (!userId) return
                if (key === 'about') {
                  setActiveTab('about')
                  navigate(`/profile/${userId}/about`)
                } else {
                  setActiveTab(key)
                  navigate(`/profile/${userId}/${key}`)
                }
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-bold transition-all relative group/tab shrink-0 ${
                activeTab === key
                  ? 'text-primary'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300'
              }`}
            >
              <span className={`material-symbols-outlined text-base transition-transform group-hover/tab:scale-110 ${activeTab === key ? 'text-primary' : 'text-slate-400 dark:text-gray-600'}`}>
                {icon}
              </span>
              {t(label)}
              {activeTab === key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
              </button>
            ))}
          </nav>

          <div className="p-5 w-full flex-1 flex flex-col space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            {activeTab === 'about' && (
              <>
                <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">person</span>
                    {t('userProfile.bioTitle')}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed mb-4">
                    {profile.bio || t('userProfile.noBio')}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-gray-500 border-t border-slate-100 dark:border-white/5 pt-3">
                    <span className="material-symbols-outlined text-base">calendar_month</span>
                    {t('userProfile.joinedSince', { date: profile.joinedAt })}
                  </div>
                </div>

                <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-lg">emoji_events</span>
                      {t('userProfile.achievements')}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {userAchievementsLoading ? (
                      <div className="flex flex-wrap gap-4 w-full">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                            <div className="size-10 rounded-full bg-slate-200 dark:bg-white/5" />
                            <div className="h-2 w-10 bg-slate-200 dark:bg-white/5 rounded" />
                          </div>
                        ))}
                      </div>
                    ) : (() => {
                      const unlockedWithBadges = userAchievements.filter(a => 
                        a.unlocked && (
                          (Array.isArray(a.earnedBadges) && a.earnedBadges.length > 0) ||
                          (a.badgeName && String(a.badgeName).trim()) ||
                          (a.badgeImage && String(a.badgeImage).trim()) ||
                          (a.badgeIcon && String(a.badgeIcon).trim()) ||
                          a.rewardType === 'badge' || 
                          a.rewardType === 'both'
                        )
                      )
                      if (unlockedWithBadges.length === 0) return (
                        <div className="w-full flex flex-col items-center justify-center py-6 opacity-40">
                          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-gray-700">workspace_premium</span>
                          <p className="text-xs font-bold text-slate-400 dark:text-gray-600 mt-3">{t('userProfile.noAchievements') || 'No achievements yet'}</p>
                        </div>
                      )
                      
                      return unlockedWithBadges.map((a) => {
                        const badges = []
                        if (Array.isArray(a.earnedBadges) && a.earnedBadges.length > 0) {
                          a.earnedBadges.forEach(b => {
                            badges.push({
                              id: b.id || `${a.id}-${b.value}`,
                              name: b.badgeName,
                              image: b.badgeImage,
                              icon: b.badgeIcon || 'military_tech'
                            })
                          })
                        } else {
                          badges.push({
                            id: a.id,
                            name: a.badgeName || a.name,
                            image: a.badgeImage,
                            icon: a.badgeIcon || a.icon || 'military_tech'
                          })
                        }

                        return badges.map(badge => {
                          const img = badge.image && !String(badge.image).startsWith('blob:') ? String(badge.image) : ''
                          return (
                            <div key={badge.id} className="flex flex-col items-center text-center gap-1.5 group cursor-pointer">
                              <div className="size-10 rounded-full border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-slate-900/80 text-amber-200 shadow-sm transition-all group-hover:scale-105 flex items-center justify-center relative overflow-hidden">
                                {img ? (
                                  <img src={img} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-lg">{badge.icon}</span>
                                )}
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 group-hover:text-primary transition-colors line-clamp-1 max-w-[64px]">{badge.name}</span>
                            </div>
                          )
                        })
                      })
                    })()}
                  </div>
                </div>

                <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">analytics</span>
                    {t('profile.skillStats')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {userSkillStats.map(({ icon, label, value, change, changeColor }) => (
                      <div
                        key={label}
                        className="bg-slate-50 dark:bg-background-dark/50 p-4 rounded-lg border border-slate-100 dark:border-border-dark flex flex-col items-center text-center"
                      >
                        <span className={`material-symbols-outlined text-2xl mb-2 ${changeColor || 'text-primary'}`}>
                          {icon}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wide mb-1">{t(label)}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-slate-900 dark:text-white">{value}</span>
                          <span className="text-[10px] font-bold text-slate-400">XP</span>
                        </div>
                        {change && (
                          <span className={`text-[10px] font-bold mt-1 ${changeColor}`}>{change}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'personalInfo' && (
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">badge</span>
                  {t('userProfile.personalInfoTitle')}
                </h3>
                <div className="flex flex-col gap-1 mb-5 text-xs font-medium text-slate-500 dark:text-gray-400">
                  <span>
                    {t('profile.currentLevel')} {profileProgress.level || 1}
                  </span>
                  <span>
                    {Math.max(0, (profileProgress.xpMax || 500) - (profileProgress.xp || 0))} XP {t('profile.toLevel')}{' '}
                    {(profileProgress.level || 1) + 1}
                  </span>
                </div>
                {(() => {
                  const name = profile.name ?? ''
                  const email = profile.email ?? ''
                  const phone = profile.phone ?? ''
                  const bio = profile.bio ?? ''
                  const address = profile.address ?? ''
                  const dateOfBirth = profile.dateOfBirth ?? ''
                  const gender = profile.gender ?? ''
                  const formatDoB = (val) => {
                    if (!val) return ''
                    const d = new Date(val)
                    return Number.isNaN(d.getTime()) ? val : d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  }
                  const genderLabel = gender ? t(`auth.gender${gender.charAt(0).toUpperCase() + gender.slice(1)}`) : ''
                  const labelClass = 'text-xs font-bold text-slate-500 dark:text-gray-500 mb-1 flex items-center gap-1.5'
                  const valueClass = 'text-sm font-medium text-slate-800 dark:text-white'
                  const emptyClass = 'text-sm font-medium text-slate-300 dark:text-gray-600 italic'
                  
                  const InfoItem = ({ label, value, icon, isEmpty, colSpan = 1 }) => (
                    <div className={`space-y-1 ${colSpan === 2 ? 'md:col-span-2' : ''}`}>
                      <div className={labelClass}>
                        <span className="material-symbols-outlined text-sm text-primary/60">{icon}</span>
                        {label}
                      </div>
                      <div className={isEmpty ? emptyClass : valueClass}>{value || '—'}</div>
                    </div>
                  )

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                      <InfoItem label={t('profile.displayName')} value={name} icon="person" isEmpty={!name} />
                      <InfoItem label={t('auth.email')} value={email} icon="mail" isEmpty={!email} />
                      <InfoItem label={t('profile.phone')} value={phone} icon="call" isEmpty={!phone} />
                      <InfoItem label={t('auth.gender')} value={genderLabel} icon="wc" isEmpty={!gender} />
                      <InfoItem label={t('profile.address')} value={address} icon="location_on" isEmpty={!address} colSpan={2} />
                      <InfoItem label={t('auth.dateOfBirth')} value={formatDoB(dateOfBirth)} icon="cake" isEmpty={!dateOfBirth} />
                      <InfoItem label={t('userProfile.joinedSince', { date: profile.joinedAt })} value={profile.joinedAt} icon="event" isEmpty={!profile.joinedAt} />
                    </div>
                  )
                })()}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
                <ProfileSkillsTab readOnly initialData={profile?.profileSkills} />
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">article</span>
                  {t('userProfile.tabPosts')}
                </h3>
                <ProfilePostsList
                  posts={userPosts}
                  loading={userPostsLoading}
                  error={userPostsError}
                />
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">photo_library</span>
                  {t('userProfile.tabPhotos')}
                </h3>
                <ProfilePhotosGrid
                  photos={userPhotos}
                  loading={userPhotosLoading}
                  error={userPhotosError}
                  hasMore={userPhotosHasMore}
                  loadMore={loadMoreUserPhotos}
                />
              </div>
            )}

            {activeTab === 'video' && (
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">movie</span>
                  {t('userProfile.tabVideo')}
                </h3>
                <ProfileVideosGrid
                  videos={userVideos}
                  loading={userVideosLoading}
                  error={userVideosError}
                  hasMore={userVideosHasMore}
                  loadMore={loadMoreUserVideos}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <ProfileFriendsListModal
        t={t}
        show={showMutualFriendsModal}
        onClose={() => setShowMutualFriendsModal(false)}
        friends={profile?.mutualFriends || []}
        loading={false}
        onlineUserIds={onlineUserIds}
        navigate={navigate}
        viewerUserId={viewerId}
        showStrangerAddFriend
        myConnectedFriendIds={myConnectedFriendIds}
        myPendingSentUserIds={myPendingSentUserIds}
        onSendFriendRequest={handleSendFriendRequestFromModal}
      />
      <ReportContentModal
        open={showReportUserModal}
        titleKey="report.titleUser"
        onClose={() => setShowReportUserModal(false)}
        onSubmit={async ({ reason, details }) => {
          await reportService.submitReport({
            targetType: 'user',
            targetId: String(userId),
            reason,
            details,
          })
        }}
      />
    </main>
  )
}
