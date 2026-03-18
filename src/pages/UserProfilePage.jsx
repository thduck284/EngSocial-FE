import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useDashboardSocket } from '../hooks'
import { ROUTES } from '../constants'
import { DEFAULT_AVATAR } from '../constants/ui'
import { userService, friendsService } from '../services'

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
    skills: Array.isArray(data.skills) ? data.skills : [],
    achievements: [],
    friends: Array.isArray(data.friends) ? data.friends : [],
  }
}

export function UserProfilePage() {
  const { t } = useTranslation()
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { onlineUserIds } = useDashboardSocket(currentUser, () => {})

  const [activeTab, setActiveTab] = useState('about')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [friendActionLoading, setFriendActionLoading] = useState(false)
  const [blockActionLoading, setBlockActionLoading] = useState(false)
  const [friendsMenuOpen, setFriendsMenuOpen] = useState(false)
  const friendsMenuRef = useRef(null)

  const refetchProfile = useCallback(() => {
    if (!userId) return
    userService.getUserProfile(userId).then((res) => setProfile(mapApiProfileToState(res?.data))).catch(() => setProfile(null))
  }, [userId])

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
    <main className="max-w-[1200px] mx-auto px-4 lg:px-10 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Profile card & Friends */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card-dark border border-border-dark rounded-xl p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="size-32 rounded-full border-4 border-primary p-1 overflow-hidden">
                <img alt={profile.name} className="w-full h-full rounded-full object-cover" src={displayAvatar} />
              </div>
              {(() => {
                const isOnline = Boolean(userId && onlineUserIds && onlineUserIds.has(String(userId)))
                return (
                  <span
                    className={`absolute bottom-1 right-1 size-5 rounded-full border-4 border-card-dark ${isOnline ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-500'}`}
                    title={isOnline ? t('userProfile.online') : t('profile.offline')}
                  />
                )
              })()}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{profile.name}</h1>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">{t('userProfile.levelLabel', { level: profile.level })}</span>
              <span>•</span>
              <span>{profile.xp} XP</span>
            </div>
            <div className="w-full mb-2">
              <div className="flex justify-between text-xs mb-1 text-gray-400 font-medium">
                <span>{t('userProfile.levelProgress')}</span>
                <span>{xpPercent}%</span>
              </div>
              <div className="h-2 w-full bg-background-dark rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-6">{t('userProfile.levelUpSoon')}</p>
            {profile.mutualFriendsCount > 0 && (
              <div className="text-sm text-gray-400 flex items-center gap-1 mb-6">
                <span className="material-symbols-outlined text-sm">group</span>
                {t('userProfile.mutualFriends', { count: profile.mutualFriendsCount })}
              </div>
            )}
            <div className="w-full flex flex-col gap-3">
              <div className="flex gap-2">
                {profile.friendStatus === 'connected' && (
                  <>
                    <button
                      type="button"
                      disabled={profile.blockedByMe}
                      onClick={handleMessage}
                      className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">chat</span>
                      {t('userProfile.sendMessage')}
                    </button>
                    <div className="relative shrink-0" ref={friendsMenuRef}>
                      <button
                        type="button"
                        onClick={() => setFriendsMenuOpen((o) => !o)}
                        className="w-11 h-[42px] bg-border-dark hover:bg-border-dark/70 text-white rounded-lg font-bold flex items-center justify-center"
                        aria-expanded={friendsMenuOpen}
                      >
                        <span className="material-symbols-outlined">expand_more</span>
                      </button>
                      {friendsMenuOpen && (
                        <div className="absolute right-0 left-0 top-full z-10 mt-1 py-1 rounded-lg border border-border-dark bg-card-dark shadow-xl min-w-[160px]">
                          <button
                            type="button"
                            disabled={friendActionLoading}
                            onClick={handleRemoveFriend}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left text-gray-200 hover:bg-white/5 disabled:opacity-60"
                          >
                            <span className="material-symbols-outlined text-lg">person_remove</span>
                            {t('userProfile.removeFriend')}
                          </button>
                          {profile.blockedByMe ? (
                            <button
                              type="button"
                              disabled={blockActionLoading}
                              onClick={handleUnblock}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left text-gray-200 hover:bg-white/5 disabled:opacity-60"
                            >
                              <span className="material-symbols-outlined text-lg">block</span>
                              {t('messages.unblock')}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={blockActionLoading}
                              onClick={handleBlock}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left text-red-400 hover:bg-red-500/10 disabled:opacity-60"
                            >
                              <span className="material-symbols-outlined text-lg">block</span>
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
                      className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                    >
                      {friendActionLoading ? (
                        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-lg">person_add</span>
                      )}
                      {t('userProfile.addFriend')}
                    </button>
                    <button
                      type="button"
                      disabled={profile.blockedByMe}
                      onClick={handleMessage}
                      className="flex-1 bg-border-dark hover:bg-border-dark/70 disabled:opacity-50 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">chat</span>
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
                      className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                    >
                      {friendActionLoading ? (
                        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-lg">person_remove</span>
                      )}
                      {t('userProfile.cancelRequest')}
                    </button>
                    <button
                      type="button"
                      disabled={profile.blockedByMe}
                      onClick={handleMessage}
                      className="flex-1 bg-border-dark hover:bg-border-dark/70 disabled:opacity-50 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">chat</span>
                      {t('userProfile.sendMessage')}
                    </button>
                  </>
                )}
                {profile.friendStatus === 'pending' && !profile.pendingSentByMe && (
                  <span className="flex-1 bg-border-dark text-gray-400 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 cursor-default">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                    {t('userProfile.pendingRequest')}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="w-full text-gray-500 hover:text-red-400 py-2 text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">report</span>
                {t('userProfile.report')}
              </button>
            </div>
          </div>

          <div className="bg-card-dark border border-border-dark rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white">{t('userProfile.friendsCount', { count: profile.friendsCount })}</h3>
              <Link to={userId ? `${ROUTES.PROFILE_USER(userId)}/friends` : '#'} className="text-xs text-primary font-medium hover:underline">
                {t('userProfile.viewAllFriends')}
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {profile.friends.slice(0, 6).map((friend) => (
                <Link
                  key={friend.id}
                  to={`/profile/${friend.id}`}
                  className="flex flex-col items-center gap-1 text-center group"
                >
                  <div className="size-14 rounded-lg bg-background-dark overflow-hidden">
                    <img alt="" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" src={friend.avatar} />
                  </div>
                  <span className="text-[10px] text-gray-400 truncate w-full">{friend.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tabs & Content - giống profile cá nhân: tab 201px, card min-w bọc hết */}
        <div className="lg:col-span-8 lg:flex-[1_1_0%] lg:min-w-[755px] w-full bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden">
          <nav className="flex pt-2 border-b border-slate-200 dark:border-border-dark">
            {[
              { key: 'about', label: 'userProfile.tabAbout' },
              { key: 'personalInfo', label: 'userProfile.tabPersonalInfo' },
              { key: 'posts', label: 'userProfile.tabPosts' },
              { key: 'photos', label: 'userProfile.tabPhotos' },
              { key: 'video', label: 'userProfile.tabVideo' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`shrink-0 w-[151px] py-5 text-base font-medium border-b-2 transition-colors text-center ${
                  activeTab === key
                    ? 'text-primary border-primary'
                    : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {t(label)}
              </button>
            ))}
          </nav>

          <div className="p-8 w-full min-w-[32rem] flex flex-col space-y-6">
            {activeTab === 'about' && (
              <>
                <div className="bg-card-dark border border-border-dark rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">person</span>
                    {t('userProfile.bioTitle')}
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {profile.bio || t('userProfile.noBio')}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="material-symbols-outlined text-sm">calendar_month</span>
                    {t('userProfile.joinedSince', { date: profile.joinedAt })}
                  </div>
                </div>

                <div className="bg-card-dark border border-border-dark rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">trending_up</span>
                    {t('userProfile.mySkills')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {profile.skills.length === 0 ? (
                      <p className="text-gray-400 col-span-full">{t('userProfile.noSkillStats')}</p>
                    ) : (
                      profile.skills.map((skill) => (
                        <div key={skill.key} className="p-4 bg-background-dark/50 rounded-xl border border-border-dark">
                          <div className="text-xs text-gray-500 uppercase font-bold mb-1">{t(skill.labelKey)}</div>
                          <div className="text-2xl font-black text-primary mb-2">{t('userProfile.levelLabel', { level: skill.level })}</div>
                          <div className="h-1 w-full bg-border-dark rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all" style={{ width: `${skill.percent}%` }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-card-dark border border-border-dark rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-yellow-500">emoji_events</span>
                      {t('userProfile.achievements')}
                    </h3>
                    <Link to={userId ? `${ROUTES.PROFILE_USER(userId)}/achievements` : '#'} className="text-xs text-primary font-medium hover:underline">
                      {t('userProfile.seeAllAchievements')}
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-8">
                    {profile.achievements.map((a) => (
                      <div key={a.id} className="flex flex-col items-center text-center gap-2 group cursor-pointer">
                        <div className={`size-16 rounded-full border flex items-center justify-center group-hover:scale-110 transition-transform ${a.boxClass}`}>
                          <span className={`material-symbols-outlined text-3xl ${a.iconClass}`}>{a.icon}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-300">{a.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'personalInfo' && (
              <div className="bg-card-dark border border-border-dark rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
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
                  const emptyClass = 'text-gray-500 dark:text-gray-500'
                  const valueClass = 'text-slate-800 dark:text-white'
                  const Value = ({ children, isEmpty }) => (
                    <div className={isEmpty ? emptyClass : valueClass}>{children || '—'}</div>
                  )
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('profile.displayName')}</div>
                        <Value isEmpty={!name}>{name}</Value>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('auth.email')}</div>
                        <Value isEmpty={!email}>{email}</Value>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('profile.phone')}</div>
                        <Value isEmpty={!phone}>{phone}</Value>
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('profile.bio')}</div>
                        <div className={!bio ? emptyClass : valueClass}>{bio ? <span className="whitespace-pre-wrap">{bio}</span> : '—'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('profile.address')}</div>
                        <Value isEmpty={!address}>{address}</Value>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('auth.dateOfBirth')}</div>
                        <Value isEmpty={!dateOfBirth}>{formatDoB(dateOfBirth)}</Value>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('auth.gender')}</div>
                        <Value isEmpty={!gender}>{genderLabel}</Value>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="bg-card-dark border border-border-dark rounded-xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-500">article</span>
                <p className="text-gray-400 mt-2">{t('userProfile.noPosts')}</p>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="bg-card-dark border border-border-dark rounded-xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-500">photo_library</span>
                <p className="text-gray-400 mt-2">{t('userProfile.noPhotos')}</p>
              </div>
            )}

            {activeTab === 'video' && (
              <div className="bg-card-dark border border-border-dark rounded-xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-500">videocam</span>
                <p className="text-gray-400 mt-2">{t('userProfile.noVideos')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
