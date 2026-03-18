import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { getAuthStorage } from '../utils/auth'
import { userService, rawService, friendsService } from '../services'
import { ROUTES } from '../constants'
import { useDashboardSocket } from '../hooks'
import { DEFAULT_AVATAR } from '../constants/ui'
import { formatDateForInput } from '../utils/profile'
import { getDefaultSkillStats, normalizeSkillStatsFromStats } from '../utils/dashboard'

export function ProfilePage() {
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
  const [profileFriends, setProfileFriends] = useState([])
  const [profileFriendsLoading, setProfileFriendsLoading] = useState(true)
  const { onlineUserIds } = useDashboardSocket(user, () => {})

  useEffect(() => {
    setProfileFriendsLoading(true)
    friendsService.getList({ limit: 100 })
      .then((res) => {
        const list = res?.data?.data ?? res?.data ?? []
        const arr = Array.isArray(list) ? list : []
        setProfileFriends(arr.map((item) => {
          const u = item?.user ?? item
          const id = u?.id ?? u?._id ?? item?.userId
          const name = u?.name ?? item?.name ?? 'User'
          const avatar = u?.avatar ?? item?.avatar ?? (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
          const level = u?.level ?? item?.level ?? 1
          const lastActiveAt = u?.lastActiveAt ?? u?.lastSeen ?? u?.lastActiveDate ?? item?.lastActiveAt ?? item?.updatedAt ?? item?.createdAt ?? null
          return { id, name, avatar, level, online: false, lastActiveAt }
        }))
      })
      .catch(() => setProfileFriends([]))
      .finally(() => setProfileFriendsLoading(false))
  }, [])

  useEffect(() => {
    rawService.getDashboard()
      .then((res) => {
        const d = res?.data || {}
        setRaw({
          userProfile: d.userProfile || raw.userProfile,
          goals: d.goals || [],
          profileAchievements: d.profileAchievements || [],
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    userService.getStats()
      .then((res) => {
        const data = res?.data || res || {}
        const list = normalizeSkillStatsFromStats(data, defaultSkillStats)
        setProfileSkillStats(list)
      })
      .catch(() => setProfileSkillStats(defaultSkillStats))
  }, [])

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
      setMessage({ type: 'error', text: err?.data?.message || err?.message || t('profile.saveFailed') })
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

  const filteredFriends = profileFriends
    .filter(
      (f) =>
        !friendSearch.trim() ||
        (f.name && f.name.toLowerCase().includes(friendSearch.toLowerCase()))
    )
    .sort((a, b) => {
      const idA = a.id != null ? String(a.id) : null
      const idB = b.id != null ? String(b.id) : null
      const onlineA = idA && onlineUserIds && onlineUserIds.has(idA)
      const onlineB = idB && onlineUserIds && onlineUserIds.has(idB)
      if (onlineA && !onlineB) return -1
      if (!onlineA && onlineB) return 1
      const timeA = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0
      const timeB = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0
      return timeB - timeA
    })

  const goalsDone = raw.goals.filter((g) => g.done).length
  const goalsTotal = raw.goals.length

  const getFriendActivityLabel = (friend, isOnline) => {
    if (isOnline) return t('messages.activeNow')
    if (!friend.lastActiveAt) return t('dashboard.level') + ' ' + friend.level
    const diffMs = Date.now() - new Date(friend.lastActiveAt).getTime()
    const diffM = Math.floor(diffMs / 60000)
    const diffH = Math.floor(diffMs / 3600000)
    const diffD = Math.floor(diffMs / 86400000)
    if (diffM < 1) return t('messages.activeNow')
    if (diffM < 60) return t('messages.activeMinutesAgo', { count: diffM })
    if (diffH < 24) return t('messages.activeHoursAgo', { count: diffH })
    return t('messages.activeDaysAgo', { count: diffD })
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span className="material-symbols-outlined text-sm">home</span>
        <span>/</span>
        <Link to={ROUTES.HOME} className="hover:text-primary transition-colors">
          {t('header.home')}
        </Link>
        <span>/</span>
        <span className="text-primary font-medium">{t('profile.title')}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Left: Avatar + Level + Friends */}
        <div className="lg:w-[calc(100%/3)] lg:shrink-0 flex flex-col gap-6">
          <div className="bg-white dark:bg-card-dark rounded-2xl p-8 border border-slate-200 dark:border-border-dark flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-40 h-40 rounded-full border-4 border-primary p-1 overflow-hidden">
                <img
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                  src={displayAvatar}
                />
              </div>
              <button
                type="button"
                className="absolute bottom-2 right-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center border-4 border-white dark:border-card-dark shadow hover:bg-primary/90 transition-colors"
                title={t('profile.changeAvatar')}
                onClick={openAvatarModal}
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
              </button>
            </div>
            <h2 className="text-2xl font-bold dark:text-white">{displayName}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
              {t('dashboard.level')} {displayLevel} · <span className="text-primary">{displayXp} XP</span>
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 mb-2 overflow-hidden">
              <div
                className="bg-primary h-4 rounded-full transition-all duration-300"
                style={{
                  width: `${xpPercent}%`,
                  boxShadow: '0 0 10px rgba(19, 182, 236, 0.4)',
                }}
              />
            </div>
            <div className="flex justify-between w-full text-xs text-slate-500 font-medium">
              <span>{t('profile.currentLevel')} {displayLevel}</span>
              <span>{Math.max(0, displayXpMax - displayXp)} XP {t('profile.toLevel')} {displayLevel + 1}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-border-dark">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold dark:text-white">{t('profile.friends', { count: profileFriends.length })}</h3>
              <Link to={ROUTES.FRIENDS} className="text-xs font-semibold text-primary hover:underline">
                {t('buttons.viewAll')}
              </Link>
            </div>
            <div className="relative mb-5">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-slate-200"
                placeholder={t('profile.searchFriends')}
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
              />
            </div>
            <div className="space-y-4 custom-scrollbar max-h-64 overflow-y-auto">
              {profileFriendsLoading ? (
                <div className="flex justify-center py-8">
                  <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
                </div>
              ) : filteredFriends.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">{t('profile.noFriends')}</p>
              ) : (
                filteredFriends.map((friend) => {
                  const friendId = friend.id != null ? String(friend.id) : null
                  const isOnline = Boolean(friendId && onlineUserIds && onlineUserIds.has(friendId))
                  return (
                  <div key={friend.id ?? friend.name ?? ''} className="flex items-center justify-between group">
                    <Link to={friend.id ? `${ROUTES.PROFILE_USER(friend.id)}` : '#'} className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer">
                      <div className="relative shrink-0">
                        <img alt="" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 object-cover" src={friend.avatar || DEFAULT_AVATAR} />
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-card-dark rounded-full ${
                            isOnline ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-500'
                          }`}
                          title={isOnline ? t('userProfile.online') : t('profile.offline')}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold dark:text-slate-200 group-hover:text-primary transition-colors truncate">{friend.name}</p>
                        <p className="text-[10px] text-slate-500">{getFriendActivityLabel(friend, isOnline)}</p>
                      </div>
                    </Link>
                    {friend.id && (
                      <button
                        type="button"
                        onClick={() => navigate(`${ROUTES.MESSAGES}?with=${encodeURIComponent(friend.id)}`, { state: { withUser: { id: friend.id, name: friend.name, avatar: friend.avatar } } })}
                        className="p-2 rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors shrink-0"
                        title={t('messages.title')}
                      >
                        <span className="material-symbols-outlined text-xl">chat_bubble</span>
                      </button>
                    )}
                  </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal đổi avatar */}
        {showAvatarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeAvatarModal}>
            <div className="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-border-dark shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">photo_camera</span>
                {t('profile.avatarModalTitle')}
              </h3>
              <div className="mb-4">
                <label className="block w-full cursor-pointer">
                  <span className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary/50 dark:hover:border-primary/50 transition-colors text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined">image</span>
                    {t('profile.avatarChooseFile')}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="sr-only"
                    onChange={handleAvatarFileChange}
                  />
                </label>
              </div>
              {avatarPreview && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={avatarPreview}
                    alt=""
                    className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 dark:border-border-dark"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
              )}
              {avatarError && <p className="text-sm text-red-500 dark:text-red-400 mb-2">{avatarError}</p>}
              <div className="flex gap-3 justify-end">
                <button type="button" className="px-4 py-2 rounded-lg border border-slate-200 dark:border-border-dark font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={closeAvatarModal}>
                  {t('profile.cancel')}
                </button>
                <button type="button" className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-60" onClick={handleSaveAvatar} disabled={avatarSaving}>
                  {avatarSaving ? t('profile.saving') : t('profile.avatarSave')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right: Tabs + content - min-w-[800px] để bọc hết 4 tab (mỗi tab 200px) */}
        <div className="lg:flex-[1_1_0%] lg:min-w-[800px] w-full bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden">
          <nav className="flex pt-2 border-b border-slate-200 dark:border-border-dark">
            {[
              { id: 'personalInfo', key: 'tabPersonalInfo' },
              { id: 'posts', key: 'tabPosts' },
              { id: 'photos', key: 'tabPhotos' },
              { id: 'video', key: 'tabVideo' },
            ].map(({ id, key }) => (
              <button
                key={id}
                type="button"
                onClick={() => setProfileTab(id)}
                className={`shrink-0 w-[200px] py-5 text-base font-medium border-b-2 transition-colors text-center ${
                  profileTab === id
                    ? 'text-primary border-primary'
                    : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {t(`profile.${key}`)}
              </button>
            ))}
          </nav>
          <div className="p-8 w-full min-w-[32rem] flex flex-col">
          {profileTab === 'personalInfo' && (
          <>
          <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit</span>
            {t('profile.editInfo')}
          </h3>

          {message.text && (
            <div
              className={`mb-4 px-4 py-2 rounded-lg text-sm ${
                message.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('profile.displayName')}</label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('auth.email')}</label>
              <input
                type="email"
                disabled
                className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 text-slate-600 dark:text-slate-400 cursor-not-allowed"
                value={form.email}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('profile.phone')}</label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
                placeholder="0123 456 789"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('profile.bio')}</label>
              <textarea
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white resize-none"
                rows={3}
                placeholder={t('profile.bioPlaceholder')}
                value={form.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('profile.address')}</label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
                placeholder={t('profile.addressPlaceholder')}
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('auth.dateOfBirth')}</label>
                <input
                  type="date"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
                  value={form.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('auth.gender')}</label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white appearance-none"
                  value={form.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <option value="">{t('auth.genderPlaceholder')}</option>
                  <option value="male">{t('auth.genderMale')}</option>
                  <option value="female">{t('auth.genderFemale')}</option>
                  <option value="other">{t('auth.genderOther')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-border-dark font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={handleCancel}
            >
              {t('profile.cancel')}
            </button>
            <button
              type="button"
              className="px-6 py-2.5 rounded-lg border-2 border-slate-200 dark:border-border-dark font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
              onClick={() => {}}
            >
              <span className="material-symbols-outlined text-lg">lock_reset</span>
              {t('profile.changePassword')}
            </button>
            <button
              type="button"
              className="px-8 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-60"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? t('profile.saving') : t('profile.saveChanges')}
            </button>
          </div>
          </>
          )}

          {(profileTab === 'posts' || profileTab === 'photos' || profileTab === 'video') && (
            <div className="w-full min-h-[16rem] flex items-center justify-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                {profileTab === 'posts' && t('profile.tabPosts')}
                {profileTab === 'photos' && t('profile.tabPhotos')}
                {profileTab === 'video' && t('profile.tabVideo')} – {t('profile.comingSoon')}
              </p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Skill Stats, Daily Goals, Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-border-dark">
          <h4 className="font-bold mb-4 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            {t('profile.skillStats')}
          </h4>
          <div className="space-y-4">
            {profileSkillStats.map(({ icon, label, value, change, changeColor, to }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-border-dark hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${changeColor || 'text-primary'}`}>{icon}</span>
                  <span className="text-sm font-medium">{t(label)}</span>
                </div>
                <span className="font-bold text-sm">
                  {value} {change && <span className={`text-[10px] ml-1 ${changeColor}`}>{change}</span>}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-border-dark">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">check_circle</span>
              {t('profile.dailyGoals')}
            </h4>
            <span className="text-xs font-bold text-primary">{goalsDone}/{goalsTotal} {t('dashboard.completed')}</span>
          </div>
          <div className="space-y-4">
            {raw.goals.map((goal) => (
              <label key={goal.labelKey} className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    goal.done ? 'border-primary bg-primary' : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {goal.done && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                </div>
                <span className={`text-sm font-medium ${goal.done ? 'line-through text-slate-400' : 'dark:text-slate-300'}`}>
                  {t(goal.labelKey)}
                </span>
              </label>
            ))}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-border-dark">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">{t('profile.dailyStreak')}</span>
                <span className="font-bold text-orange-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
                  7 {t('profile.days')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-border-dark">
          <h4 className="font-bold mb-4 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">emoji_events</span>
            {t('profile.achievements')}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {raw.profileAchievements.map((a) => (
              <div
                key={a.title}
                className={`p-4 rounded-xl border text-center ${a.bgClass}`}
              >
                <div className={`w-10 h-10 ${a.iconBg} text-white rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <span className="material-symbols-outlined">{a.icon}</span>
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${a.textClass}`}>{a.title}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{a.date}</div>
              </div>
            ))}
          </div>
          <button type="button" className="w-full mt-4 py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors">
            {t('profile.seeAllBadges')}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-slate-200 dark:border-border-dark pt-8">
        <button
          type="button"
          className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-red-100 dark:border-red-900/30 font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all w-full sm:w-auto"
          onClick={handleLogout}
        >
          <span className="material-symbols-outlined">logout</span>
          {t('header.logout')}
        </button>
      </div>
    </main>
  )
}
