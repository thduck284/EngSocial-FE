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
    xpPercent: 0,
    mutualFriendsCount: data.mutualFriendsCount ?? 0,
    friendsCount: data.friendsCount ?? 0,
    friendStatus: data.friendStatus ?? 'none',
    friendshipId: data.friendshipId,
    pendingSentByMe: data.pendingSentByMe,
    blockedByMe: data.blockedByMe ?? false,
    joinedAt: formatJoinedAt(data.createdAt),
    profileSkills: data.profileSkills || { skills: {}, goals: [], activeView: 'bars', updatedAt: null },
    skills: Array.isArray(data.skills) ? data.skills : [],
    achievements: [],
    friends: Array.isArray(data.friends) ? data.friends : [],
  }
}

export function UserProfilePage() {
  const { t } = useTranslation()
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
        setProfile((prev) => (prev ? { ...prev, blockedByMe: true } : prev))
      })
      .catch(() => refetchProfile())
      .finally(() => setBlockActionLoading(false))
  }, [userId, blockActionLoading, refetchProfile])

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
    setLoading(true)
    userService
      .getUserProfile(userId)
      .then((res) => setProfile(mapApiProfileToState(res?.data)))
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
  const xpPercent = profile.xpPercent ?? (profile.xpMax ? Math.round((profile.xp / profile.xpMax) * 100) : 0)

  return (
    <main className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Profile card & Friends */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent" />
            <div className="relative mb-6 z-10">
              <div className="size-40 rounded-full border-4 border-white dark:border-card-dark shadow-2xl overflow-hidden ring-4 ring-primary/20">
                <img alt={profile.name} className="w-full h-full rounded-full object-cover" src={displayAvatar} />
              </div>
              {(() => {
                const isOnline = Boolean(userId && onlineUserIds && onlineUserIds.has(String(userId)))
                return (
                  <div
                    className={`absolute bottom-3 right-3 size-6 rounded-full border-4 border-white dark:border-card-dark shadow-lg ${isOnline ? 'bg-green-500' : 'bg-slate-300 dark:bg-gray-600'}`}
                    title={isOnline ? t('userProfile.online') : t('profile.offline')}
                  >
                    <div className={`w-full h-full rounded-full ${isOnline ? 'animate-pulse bg-green-400' : ''}`} />
                  </div>
                )
              })()}
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight relative z-10">{profile.name}</h1>
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
                {t('userProfile.levelLabel', { level: profile.level })}
              </span>
              <span className="text-slate-300 dark:text-gray-700 font-black">•</span>
              <span className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{profile.xp} XP</span>
            </div>
            
            <div className="w-full mb-8 bg-slate-50 dark:bg-background-dark/50 p-6 rounded-3xl border border-slate-100 dark:border-white/5 relative z-10">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-slate-400 dark:text-gray-500">
                <span>{t('userProfile.levelProgress')}</span>
                <span className="text-primary">{xpPercent}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-card-dark rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-1000 shadow-[0_0_10px_rgba(19,182,236,0.5)]" style={{ width: `${xpPercent}%` }} />
              </div>
              <p className="text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest mt-4 italic">{t('userProfile.levelUpSoon')}</p>
            </div>

            {profile.mutualFriendsCount > 0 && (
              <div className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest flex items-center justify-center gap-2 mb-8 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-100 dark:border-white/5 relative z-10">
                <span className="material-symbols-outlined text-base text-primary">group</span>
                {t('userProfile.mutualFriends', { count: profile.mutualFriendsCount })}
              </div>
            )}

            <div className="w-full flex flex-col gap-3 relative z-10">
              <div className="flex gap-3">
                {profile.friendStatus === 'connected' && (
                  <>
                    <button
                      type="button"
                      disabled={profile.blockedByMe}
                      onClick={handleMessage}
                      className="flex-1 bg-primary hover:brightness-110 disabled:opacity-50 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-xl">chat</span>
                      {t('userProfile.sendMessage')}
                    </button>
                    <div className="relative shrink-0" ref={friendsMenuRef}>
                      <button
                        type="button"
                        onClick={() => setFriendsMenuOpen((o) => !o)}
                        className="size-14 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-white rounded-2xl font-bold flex items-center justify-center transition-all border border-slate-200 dark:border-white/10"
                        aria-expanded={friendsMenuOpen}
                      >
                        <span className="material-symbols-outlined transition-transform duration-300" style={{ transform: friendsMenuOpen ? 'rotate(180deg)' : 'none' }}>expand_more</span>
                      </button>
                      {friendsMenuOpen && (
                        <div className="absolute right-0 top-full z-20 mt-3 py-2 rounded-[1.5rem] border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark shadow-2xl min-w-[200px] animate-in fade-in zoom-in-95 duration-200">
                          <button
                            type="button"
                            disabled={friendActionLoading}
                            onClick={handleRemoveFriend}
                            className="w-full flex items-center gap-3 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-left text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-60 transition-colors"
                          >
                            <span className="material-symbols-outlined text-xl text-rose-500">person_remove</span>
                            {t('userProfile.removeFriend')}
                          </button>
                          <div className="h-px bg-slate-100 dark:bg-white/5 mx-2 my-1" />
                          {profile.blockedByMe ? (
                            <button
                              type="button"
                              disabled={blockActionLoading}
                              onClick={handleUnblock}
                              className="w-full flex items-center gap-3 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-left text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-60 transition-colors"
                            >
                              <span className="material-symbols-outlined text-xl text-primary">block</span>
                              {t('messages.unblock')}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={blockActionLoading}
                              onClick={handleBlock}
                              className="w-full flex items-center gap-3 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-left text-rose-500 hover:bg-rose-500/10 disabled:opacity-60 transition-colors"
                            >
                              <span className="material-symbols-outlined text-xl">block</span>
                              {t('userProfile.block')}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
                {profile.friendStatus === 'none' && (
                  <>
                    <button
                      type="button"
                      disabled={friendActionLoading}
                      onClick={handleAddFriend}
                      className="flex-1 bg-primary hover:brightness-110 disabled:opacity-60 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                      {friendActionLoading ? (
                        <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-xl">person_add</span>
                      )}
                      {t('userProfile.addFriend')}
                    </button>
                    <button
                      type="button"
                      disabled={profile.blockedByMe}
                      onClick={handleMessage}
                      className="flex-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 disabled:opacity-50 text-slate-600 dark:text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 border border-slate-200 dark:border-white/10"
                    >
                      <span className="material-symbols-outlined text-xl">chat</span>
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
                      className="flex-1 bg-amber-500 hover:brightness-110 disabled:opacity-60 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                    >
                      {friendActionLoading ? (
                        <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-xl">person_remove</span>
                      )}
                      {t('userProfile.cancelRequest')}
                    </button>
                    <button
                      type="button"
                      disabled={profile.blockedByMe}
                      onClick={handleMessage}
                      className="flex-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 disabled:opacity-50 text-slate-600 dark:text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 border border-slate-200 dark:border-white/10"
                    >
                      <span className="material-symbols-outlined text-xl">chat</span>
                      {t('userProfile.sendMessage')}
                    </button>
                  </>
                )}
                {profile.friendStatus === 'pending' && !profile.pendingSentByMe && (
                  <div className="flex-1 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-gray-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 cursor-default border border-slate-100 dark:border-white/5">
                    <span className="material-symbols-outlined text-xl">schedule</span>
                    {t('userProfile.pendingRequest')}
                  </div>
                )}
              </div>
              {viewerId && userId && String(viewerId) !== String(userId) ? (
                <button
                  type="button"
                  onClick={() => setShowReportUserModal(true)}
                  className="w-full text-slate-400 dark:text-gray-600 hover:text-rose-500 py-3 text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  <span className="material-symbols-outlined text-sm">report</span>
                  {t('userProfile.report')}
                </button>
              ) : null}
            </div>
          </div>

          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none">
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
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                {t('userProfile.friendsCount', { count: profile.friendsCount })}
              </h3>
              <button
                type="button"
                onClick={() => setFriendsModalOpen(true)}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
              >
                {t('userProfile.viewAllFriends')}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {profile.friends.slice(0, 6).map((friend) => (
                <Link
                  key={friend.id}
                  to={`/profile/${friend.id}`}
                  className="flex flex-col items-center gap-3 text-center group"
                >
                  <div className="size-16 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm group-hover:scale-105 transition-transform group-hover:shadow-lg group-hover:shadow-primary/10">
                    <img alt="" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" src={friend.avatar} />
                  </div>
                  <span className="text-[9px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest truncate w-full group-hover:text-primary transition-colors">{friend.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tabs & Content */}
        <div className="lg:col-span-8 lg:flex-1 min-w-0 bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col">
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
              className={`flex-1 flex items-center justify-center gap-3 px-4 py-6 text-[10px] font-black uppercase tracking-widest transition-all relative group/tab ${
                activeTab === key
                  ? 'text-primary'
                  : 'text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'
              }`}
            >
              <span className={`material-symbols-outlined text-xl transition-transform group-hover/tab:scale-110 ${activeTab === key ? 'text-primary' : 'text-slate-300 dark:text-gray-700'}`}>
                {icon}
              </span>
              {t(label)}
              {activeTab === key && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_-4px_10px_rgba(19,182,236,0.5)]" />
              )}
              </button>
            ))}
          </nav>

          <div className="p-10 w-full flex-1 flex flex-col space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            {activeTab === 'about' && (
              <>
                <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2rem] p-8 shadow-inner">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">person</span>
                    {t('userProfile.bioTitle')}
                  </h3>
                  <p className="text-sm font-medium text-slate-600 dark:text-gray-300 leading-relaxed mb-8 px-2">
                    {profile.bio || t('userProfile.noBio')}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest border-t border-slate-200 dark:border-white/5 pt-6">
                    <span className="material-symbols-outlined text-base">calendar_month</span>
                    {t('userProfile.joinedSince', { date: profile.joinedAt })}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2rem] p-8 shadow-inner">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-[0.2em]">
                      <span className="material-symbols-outlined text-amber-500">emoji_events</span>
                      {t('userProfile.achievements')}
                    </h3>
                    <Link to={userId ? `${ROUTES.PROFILE_USER(userId)}/achievements` : '#'} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                      {t('userProfile.seeAllAchievements')}
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-10 px-2">
                    {profile.achievements.length > 0 ? (
                      profile.achievements.map((a) => (
                        <div key={a.id} className="flex flex-col items-center text-center gap-3 group cursor-pointer">
                          <div className={`size-20 rounded-full border-2 flex items-center justify-center shadow-lg transition-all group-hover:scale-110 group-hover:-translate-y-1 ${a.boxClass}`}>
                            <span className={`material-symbols-outlined text-4xl ${a.iconClass}`}>{a.icon}</span>
                          </div>
                          <span className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors">{a.title}</span>
                        </div>
                      ))
                    ) : (
                      <div className="w-full flex flex-col items-center justify-center py-10 opacity-40">
                        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-gray-700">workspace_premium</span>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-600 mt-4">{t('userProfile.noAchievements') || 'No achievements yet'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'personalInfo' && (
              <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2rem] p-10 shadow-inner">
                <h3 className="text-xs font-black text-slate-900 dark:text-white mb-10 uppercase tracking-[0.2em] flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">badge</span>
                  {t('userProfile.personalInfoTitle')}
                </h3>
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
                  const labelClass = 'text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2'
                  const valueClass = 'text-sm font-bold text-slate-700 dark:text-white px-1'
                  const emptyClass = 'text-sm font-bold text-slate-300 dark:text-gray-700 italic px-1'
                  
                  const InfoItem = ({ label, value, icon, isEmpty, colSpan = 1 }) => (
                    <div className={`space-y-2 ${colSpan === 2 ? 'md:col-span-2' : ''}`}>
                      <div className={labelClass}>
                        <span className="material-symbols-outlined text-sm text-primary/50">{icon}</span>
                        {label}
                      </div>
                      <div className={isEmpty ? emptyClass : valueClass}>{value || '—'}</div>
                    </div>
                  )

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                      <InfoItem label={t('profile.displayName')} value={name} icon="person" isEmpty={!name} />
                      <InfoItem label={t('auth.email')} value={email} icon="mail" isEmpty={!email} />
                      <InfoItem label={t('profile.phone')} value={phone} icon="call" isEmpty={!phone} />
                      <InfoItem label={t('auth.gender')} value={genderLabel} icon="wc" isEmpty={!gender} />
                      <InfoItem label={t('profile.address')} value={address} icon="location_on" isEmpty={!address} colSpan={2} />
                      <InfoItem label={t('auth.dateOfBirth')} value={formatDoB(dateOfBirth)} icon="cake" isEmpty={!dateOfBirth} />
                      <InfoItem label={t('userProfile.joinedAt')} value={profile.joinedAt} icon="event" isEmpty={!profile.joinedAt} />
                    </div>
                  )
                })()}
              </div>
            )}

            {activeTab === 'skills' && <ProfileSkillsTab readOnly initialData={profile?.profileSkills} />}

            {activeTab === 'posts' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProfilePostsList
                  posts={userPosts}
                  loading={userPostsLoading}
                  error={userPostsError}
                />
              </div>
            )}

            {activeTab === 'photos' && (
              <ProfilePhotosGrid
                photos={userPhotos}
                loading={userPhotosLoading}
                error={userPhotosError}
                hasMore={userPhotosHasMore}
                loadMore={loadMoreUserPhotos}
              />
            )}

            {activeTab === 'video' && (
              <ProfileVideosGrid
                videos={userVideos}
                loading={userVideosLoading}
                error={userVideosError}
                hasMore={userVideosHasMore}
                loadMore={loadMoreUserVideos}
              />
            )}
          </div>
        </div>
      </div>
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
