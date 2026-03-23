import { useEffect } from 'react'
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

export function ProfilePage() {
  const {
    t,
    navigate,
    user,
    raw,
    profileSkillStats,
    profileFriends,
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
    goalsDone,
    goalsTotal,
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
        {/* Left: Avatar + Level + Friends (+ optional stats when on Posts tab) */}
        <div className="lg:w-[calc(100%/3)] lg:shrink-0">
          <div
            className={`flex flex-col gap-6 ${
              profileTab === 'posts' ? 'lg:sticky lg:top-24' : ''
            }`}
          >
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
            loading={profileFriendsLoading}
            friendSearch={friendSearch}
            setFriendSearch={setFriendSearch}
            onlineUserIds={onlineUserIds}
            navigate={navigate}
          />

          {profileTab === 'posts' && (
            <ProfileLeftStatsSection
              t={t}
              profileSkillStats={profileSkillStats}
              raw={raw}
              goalsDone={goalsDone}
              goalsTotal={goalsTotal}
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
        <div className="lg:flex-[1_1_0%] lg:min-w-[800px] w-full bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden">
          <nav className="flex pt-2 border-b border-slate-200 dark:border-border-dark">
            {[
              { id: 'personalInfo', key: 'tabPersonalInfo' },
              { id: 'skills', key: 'mySkills' },
              { id: 'posts', key: 'tabPosts' },
              { id: 'photos', key: 'tabPhotos' },
              { id: 'video', key: 'tabVideo' },
            ].map(({ id, key }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleTabChange(id)}
                className={`shrink-0 w-[160px] py-5 text-base font-medium border-b-2 transition-colors text-center ${
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
            <ProfilePersonalInfoForm
              t={t}
              form={form}
              saving={saving}
              message={message}
              onChange={handleChange}
              onCancel={handleCancel}
              onSave={handleSave}
            />
          )}

          {profileTab === 'posts' && (
            <ProfilePostsList
              posts={profilePosts}
              loading={profilePostsLoading}
              error={profilePostsError}
            />
          )}

          {profileTab === 'skills' && <ProfileSkillsTab t={t} />}

          {profileTab === 'photos' && (
            <ProfilePhotosGrid
              photos={profilePhotos}
              loading={profilePhotosLoading}
              error={profilePhotosError}
              hasMore={profilePhotosHasMore}
              loadMore={loadMoreProfilePhotos}
            />
          )}

          {profileTab === 'video' && (
            <ProfileVideosGrid
              videos={profileVideos}
              loading={profileVideosLoading}
              error={profileVideosError}
              hasMore={profileVideosHasMore}
              loadMore={loadMoreProfileVideos}
            />
          )}
          </div>
        </div>
      </div>

      {/* Skill Stats, Daily Goals, Achievements (bottom row) */}
      {profileTab !== 'posts' && (
        <ProfileBottomStatsSection
          t={t}
          profileSkillStats={profileSkillStats}
          raw={raw}
          goalsDone={goalsDone}
          goalsTotal={goalsTotal}
        />
      )}

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
