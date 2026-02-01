import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { getAuthStorage } from '../utils/auth'
import { userService } from '../services'
import { ROUTES } from '../constants'
import {
  mockUserProfile,
  mockGoals,
  mockProfileFriends,
  mockProfileSkillStats,
  mockProfileAchievements,
} from '../raw'

const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDct5nPGH4oUnT_R2ZEnIFsmXozuCVn0_7PHkBfjAJDt2O13SVHKAalMfsBcAN1rqU58_yGdfL4-h-b-iDFSF16gOGEvLpu4Zg1aMZ7N_jubkhCEyr_0rHedluAuAMXtkJ6MjKYAnf7Cd4yBz70n-7m3ioWoDVIGL9QfkbrRoc3DEqoVPw6ELm_fp2qEp_anJJxTGC1GZ-y_SWU_6dsfkmec8mke5r0ZWzrrSfb3v2IJCqrFUciY2aVMAhEjQRYMskwmbSEeOKysQ1C'

function formatDateForInput(date) {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function ProfilePage() {
  const { t } = useTranslation()
  const { user, setAuth, logout } = useAuth()

  const displayName = user?.name ?? mockUserProfile.name
  const displayLevel = user?.level ?? mockUserProfile.level
  const displayXp = Number(user?.xp ?? mockUserProfile.xp) || 0
  const displayXpMax = Number(user?.xpMax ?? mockUserProfile.xpMax ?? 500) || 500
  const displayAvatar = user?.avatar ?? mockUserProfile.avatar ?? DEFAULT_AVATAR
  const xpPercent = displayXpMax ? Math.min(100, Math.round((displayXp / displayXpMax) * 100)) : 0

  const [form, setForm] = useState({
    name: '',
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
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarSaving, setAvatarSaving] = useState(false)
  const [avatarError, setAvatarError] = useState('')

  useEffect(() => {
    const name = user?.name ?? mockUserProfile.name
    const phone = user?.phone ?? ''
    const bio = user?.bio ?? ''
    const address = user?.address ?? ''
    const dateOfBirth = formatDateForInput(user?.dateOfBirth)
    const gender = user?.gender ?? ''
    const next = { name, phone, bio, address, dateOfBirth, gender }
    setForm(next)
    setInitialForm(next)
  }, [user])

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
    setAvatarUrl(user?.avatar ?? '')
    setAvatarError('')
    setShowAvatarModal(true)
  }

  const handleSaveAvatar = async () => {
    const url = (avatarUrl || '').trim()
    if (!url) {
      setAvatarError(t('profile.avatarUrlRequired'))
      return
    }
    setAvatarSaving(true)
    setAvatarError('')
    try {
      const res = await userService.updateProfile({ avatar: url })
      if (res?.success !== false && res?.data?.user) {
        const updatedUser = res.data.user
        setAuth({ user: updatedUser })
        getAuthStorage().setItem('user', JSON.stringify(updatedUser))
        setShowAvatarModal(false)
      }
      setMessage({ type: 'success', text: res?.message || t('profile.saveSuccess') })
    } catch (err) {
      setAvatarError(err?.data?.message || err?.message || t('profile.saveFailed'))
    } finally {
      setAvatarSaving(false)
    }
  }

  const filteredFriends = mockProfileFriends.filter(
    (f) =>
      !friendSearch.trim() ||
      f.name.toLowerCase().includes(friendSearch.toLowerCase())
  )

  const goalsDone = mockGoals.filter((g) => g.done).length
  const goalsTotal = mockGoals.length

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left: Avatar + Level + Friends */}
        <div className="lg:col-span-4 flex flex-col gap-6">
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
              <h3 className="font-bold dark:text-white">{t('profile.friends', { count: mockProfileFriends.length })}</h3>
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
              {filteredFriends.map((friend) => (
                <div key={friend.name} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img alt="" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 object-cover" src={friend.avatar} />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-card-dark rounded-full ${
                          friend.online ? 'bg-green-500' : 'bg-slate-400'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold dark:text-slate-200 group-hover:text-primary transition-colors">{friend.name}</p>
                      <p className="text-[10px] text-slate-500">{friend.level}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-xl">chat_bubble</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal đổi avatar */}
        {showAvatarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowAvatarModal(false)}>
            <div className="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-border-dark shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">photo_camera</span>
                {t('profile.avatarModalTitle')}
              </h3>
              <input
                type="url"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 dark:text-white mb-2"
                placeholder={t('profile.avatarUrlPlaceholder')}
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
              {avatarUrl.trim() && (
                <div className="mb-4 flex justify-center">
                  <img src={avatarUrl.trim()} alt="" className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 dark:border-border-dark" onError={(e) => { e.target.style.display = 'none' }} />
                </div>
              )}
              {avatarError && <p className="text-sm text-red-500 dark:text-red-400 mb-2">{avatarError}</p>}
              <div className="flex gap-3 justify-end">
                <button type="button" className="px-4 py-2 rounded-lg border border-slate-200 dark:border-border-dark font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setShowAvatarModal(false)}>
                  {t('profile.cancel')}
                </button>
                <button type="button" className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-60" onClick={handleSaveAvatar} disabled={avatarSaving}>
                  {avatarSaving ? t('profile.saving') : t('profile.avatarSave')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right: Edit form */}
        <div className="lg:col-span-8 bg-white dark:bg-card-dark rounded-2xl p-8 border border-slate-200 dark:border-border-dark">
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

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-border-dark font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={handleCancel}
            >
              {t('profile.cancel')}
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
            {mockProfileSkillStats.map((item) => (
              <div
                key={item.labelKey}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-border-dark"
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${item.iconColor}`}>{item.icon}</span>
                  <span className="text-sm font-medium">{t(item.labelKey)}</span>
                </div>
                <span className="font-bold">{item.xp}</span>
              </div>
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
            {mockGoals.map((goal) => (
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
            {mockProfileAchievements.map((a) => (
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
          className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-border-dark font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all w-full sm:w-auto"
          onClick={() => {}}
        >
          <span className="material-symbols-outlined">lock_reset</span>
          {t('profile.changePassword')}
        </button>
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all w-full sm:w-auto justify-center"
        >
          <span className="material-symbols-outlined">dashboard</span>
          {t('profile.backToDashboard')}
        </Link>
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
