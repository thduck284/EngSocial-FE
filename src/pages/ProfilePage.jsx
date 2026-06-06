import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../constants'
import { ProfilePostsList } from '../components/profile/ProfilePostsList'
import { ProfileAvatarCard } from '../components/profile/ProfileAvatarCard'
import { ProfileFriendsCard } from '../components/profile/ProfileFriendsCard'
import { ProfileLeftStatsSection } from '../components/profile/ProfileLeftStatsSection'
import { ProfileBottomStatsSection } from '../components/profile/ProfileBottomStatsSection'
import { ProfileAvatarModal } from '../components/profile/ProfileAvatarModal'
import { ProfilePersonalInfoForm } from '../components/profile/ProfilePersonalInfoForm'
import { ProfilePhotosGrid } from '../components/profile/ProfilePhotosGrid'
import { ProfileVideosGrid } from '../components/profile/ProfileVideosGrid'
import { ProfileSkillsTab } from '../components/profile/ProfileSkillsTab'
import { useProfilePage, useProfilePhotos, useProfileVideos } from '../hooks/useProfile'
import { useProfileAchievements } from '../hooks/useProfileAchievements'
import { LogoutConfirmModal } from '../components/layout/LogoutConfirmModal'

export function ProfilePage() {
  const {
    t,
    navigate,
    user,
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
    handleChange,
    handleSave,
    handleCancel,
    handleLogout,
    openAvatarModal,
    closeAvatarModal,
    handleAvatarFileChange,
    handleSaveAvatar,
    setProfileTab,
  } = useProfilePage()

  const { items: profileAchievementItems, loading: profileAchievementsLoading } =
    useProfileAchievements()

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const activeOnlineCount = (sortedProfileFriends || []).filter(f => f.isOnline).length

  const location = useLocation()
  // Đồng bộ tab với URL: /profile, /profile/personalInfo, /profile/skills, /profile/posts, /profile/photos, /profile/video
  useEffect(() => {
    const path = location.pathname || ''
    if (path.endsWith('/personalInfo') && profileTab !== 'personalInfo') {
      setProfileTab('personalInfo')
    } else if (path.endsWith('/skills') && profileTab !== 'skills') {
      setProfileTab('skills')
    } else if (path.endsWith('/posts') && profileTab !== 'posts') {
      setProfileTab('posts')
    } else if (path.endsWith('/photos') && profileTab !== 'photos') {
      setProfileTab('photos')
    } else if (path.endsWith('/video') && profileTab !== 'video') {
      setProfileTab('video')
    } else if ((path === '/profile' || path.endsWith('/profile')) && profileTab !== 'personalInfo') {
      setProfileTab('personalInfo')
    }
  }, [location.pathname, profileTab, setProfileTab])

  const handleTabChange = (id) => {
    setProfileTab(id)
    let target = '/profile'
    if (id === 'personalInfo') target = '/profile/personalInfo'
    else if (id === 'skills') target = '/profile/skills'
    else if (id === 'posts') target = '/profile/posts'
    else if (id === 'photos') target = '/profile/photos'
    else if (id === 'video') target = '/profile/video'
    navigate(target)
  }

  const {
    photos: profilePhotos,
    loading: profilePhotosLoading,
    error: profilePhotosError,
    hasMore: profilePhotosHasMore,
    loadMore: loadMoreProfilePhotos,
  } = useProfilePhotos(user?.id || user?._id, { pageSize: 5 })
  const {
    videos: profileVideos,
    loading: profileVideosLoading,
    error: profileVideosError,
    hasMore: profileVideosHasMore,
    loadMore: loadMoreProfileVideos,
  } = useProfileVideos(user?.id || user?._id, { pageSize: 5 })

  return (
    <main className="max-w-[1440px] mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left: Avatar + Level + Friends (+ optional stats when on Posts tab) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col gap-4">
            <ProfileAvatarCard
              t={t}
              displayName={displayName}
              displayLevel={displayLevel}
              displayXp={displayXp}
              displayXpMax={displayXpMax}
              displayAvatar={displayAvatar}
              xpPercent={xpPercent}
              onOpenAvatarModal={openAvatarModal}
            />

            <ProfileFriendsCard
              t={t}
              friends={filteredFriends}
              allFriends={sortedProfileFriends}
              loading={profileFriendsLoading}
              friendSearch={friendSearch}
              setFriendSearch={setFriendSearch}
              onlineCount={activeOnlineCount}
              onlineUserIds={onlineUserIds}
              navigate={navigate}
            />

            {profileTab === 'posts' && (
              <ProfileLeftStatsSection
                t={t}
                profileSkillStats={profileSkillStats}
                achievementItems={profileAchievementItems}
                achievementsLoading={profileAchievementsLoading}
              />
            )}
          </div>
        </div>

        {/* Modal đổi avatar */}
        <ProfileAvatarModal
          t={t}
          show={showAvatarModal}
          avatarPreview={avatarPreview}
          avatarError={avatarError}
          avatarSaving={avatarSaving}
          onClose={closeAvatarModal}
          onFileChange={handleAvatarFileChange}
          onSave={handleSaveAvatar}
        />

        {/* Right: Tabs + content */}
        <div className="lg:col-span-9 min-w-0 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm flex flex-col">
          <nav className="flex w-full border-b border-slate-100 dark:border-white/5 overflow-x-auto no-scrollbar">
            {[
              { id: 'personalInfo', key: 'tabPersonalInfo', icon: 'badge' },
              { id: 'skills', key: 'mySkills', icon: 'psychology' },
              { id: 'posts', key: 'tabPosts', icon: 'article' },
              { id: 'photos', key: 'tabPhotos', icon: 'photo_library' },
              { id: 'video', key: 'tabVideo', icon: 'movie' },
            ].map(({ id, key, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleTabChange(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-bold transition-all relative group/tab shrink-0 ${
                  profileTab === id
                    ? 'text-primary'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300'
                }`}
              >
                <span className={`material-symbols-outlined text-base transition-transform group-hover/tab:scale-110 ${profileTab === id ? 'text-primary' : 'text-slate-400 dark:text-gray-600'}`}>
                  {icon}
                </span>
                {t(`profile.${key}`)}
                {profileTab === id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </nav>
          <div className="p-5 w-full flex-1 flex flex-col space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            {profileTab === 'personalInfo' && (
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
                <ProfilePersonalInfoForm
                  t={t}
                  form={form}
                  saving={saving}
                  message={message}
                  onChange={handleChange}
                  onCancel={handleCancel}
                  onSave={handleSave}
                />
              </div>
            )}

            {profileTab === 'skills' && (
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
                <ProfileSkillsTab />
              </div>
            )}

            {profileTab === 'posts' && (
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">article</span>
                  {t('profile.tabPosts')}
                </h3>
                <ProfilePostsList
                  posts={profilePosts}
                  loading={profilePostsLoading}
                  error={profilePostsError}
                />
              </div>
            )}

            {profileTab === 'photos' && (
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">photo_library</span>
                  {t('profile.tabPhotos')}
                </h3>
                <ProfilePhotosGrid
                  photos={profilePhotos}
                  loading={profilePhotosLoading}
                  error={profilePhotosError}
                  hasMore={profilePhotosHasMore}
                  loadMore={loadMoreProfilePhotos}
                />
              </div>
            )}

            {profileTab === 'video' && (
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">movie</span>
                  {t('profile.tabVideo')}
                </h3>
                <ProfileVideosGrid
                  videos={profileVideos}
                  loading={profileVideosLoading}
                  error={profileVideosError}
                  hasMore={profileVideosHasMore}
                  loadMore={loadMoreProfileVideos}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skill Stats, Daily Goals, Achievements (bottom row) */}
      {profileTab !== 'posts' && (
        <ProfileBottomStatsSection
          t={t}
          profileSkillStats={profileSkillStats}
          achievementItems={profileAchievementItems}
          achievementsLoading={profileAchievementsLoading}
        />
      )}

      {/* Actions */}
      <div className="flex items-center justify-center pt-8 border-t border-slate-100 dark:border-white/5">
        <button
          type="button"
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 text-xs font-bold text-rose-500 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 transition-all active:scale-95"
          onClick={() => setLogoutConfirmOpen(true)}
        >
          <span className="material-symbols-outlined">logout</span>
          {t('header.logout')}
        </button>
      </div>

      <LogoutConfirmModal
        open={logoutConfirmOpen}
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={() => {
          setLogoutConfirmOpen(false)
          handleLogout()
        }}
      />
    </main>
  )
}
