import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants'
import { DEFAULT_AVATAR } from '../constants/ui'

// Mock data — thay bằng API getUserProfile(userId) khi có backend
const mockUserProfile = (userId) => ({
  id: userId,
  name: 'Nguyen Minh Anh',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPFDojZwagKqQY1FIAwaWUEHBjDloHyeR2NPmd-2M4bykLSIrfH9cr-_TLqvNZJQgwYS5Pg6ApzdFg39A_B3TKk9CiBTYXdnUkNJhn5d5602repqMAuJclOE6QtKH_GcdVgP6_t53bGJKBRKNTNcmT5FnrdlkKuwENYkQgaXWilnEvmG9x9atJBcGHhGESdlaOuUkPC0YMO6Itu34qlXjrl7f59KJtRoC35ZINeX4EUFm8o2te0Ch6NVGMu5aASYD-mT-w3SyZgQ',
  level: 18,
  xp: 5200,
  xpMax: 7000,
  xpPercent: 75,
  mutualFriendsCount: 20,
  friendsCount: 150,
  friendStatus: 'none', // 'none' | 'pending' | 'connected'
  bio: 'Passionate English learner and IELTS 8.0 achiever. Sharing tips and resources for everyone!',
  joinedAt: 'Tháng 3, 2023',
  skills: [
    { key: 'reading', labelKey: 'skills.reading', level: 20, percent: 100 },
    { key: 'listening', labelKey: 'skills.listening', level: 18, percent: 85 },
    { key: 'writing', labelKey: 'skills.writing', level: 15, percent: 60 },
  ],
  achievements: [
    { id: '1', icon: 'wb_sunny', title: 'Early Bird', boxClass: 'bg-yellow-500/10 border-yellow-500/20', iconClass: 'text-yellow-500' },
    { id: '2', icon: 'local_fire_department', title: 'Top Learner', boxClass: 'bg-primary/10 border-primary/20', iconClass: 'text-primary' },
    { id: '3', icon: 'groups', title: 'Social Butterfly', boxClass: 'bg-pink-500/10 border-pink-500/20', iconClass: 'text-pink-500' },
  ],
  friends: [
    { id: 'f1', name: 'Hoàng Nam', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLPmCstom4Q_DC7ORJyWerqypR48cPmsuQ9D6yybvQdf8CpLlqwC6Saq3ZyOHlQ91M1VPJWi3vZKB0Wl1uMAu1ER9ee43upM3d9zEUsnTUnELxs2qypiUP0EHyzcB32LUrhhXzVslcHifCCk7JgHY_CytPMFn3xsyjKCjcxKyi6i7jUzzUqrA0TNtyf1TvNds11hCOvflBJn8hSOupRTy9Sfv965lMF-V936IzVDJ7OCK8jY8ae4V4sLfJc795UFXqBRR29RRZaQ' },
    { id: 'f2', name: 'Lê Thu', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuk8UkytuiASkc423A1ZQV45hJZo9j2NoVxZwRr_GHKabHuONpMAxurp3e_6302RjSrvhwLVjn4WKJ8E2THPpXhlWCJfSqfsUMxS3IAQ2Eog5u-Z8OO9luzgmS14yQFRhxrdnev-e5yIi9SaSzBLvisJqGCNBvhuD_Gjz-vMwt0MM1HY9l7sCZxd0Gvioa6AUJuHOOCABqy2BglxhMJ7QSqAAPqguFUtUAI4pQE3LlU1XtamhC1incGZ-UYEBwOIUZqYRk3n26vw' },
    { id: 'f3', name: 'Minh Tuấn', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEqZrNBtF9O6FvBBs08plk0nGW4s9qoWFPYPknt0BN2aV1Mdw4Rwas4VVzNEy5OUh-2kfJUc08EjfepW5Hh6XLya7x9aMYo7ixGeV3-mPgo87T-knFjjRQ-g-2tyr9enw2Zksbl-29q5RzvFkxP26UAxgi722uSf72y_Ta24zvAKBwLQT7UAm7ETKKZwDdBFmO88HzQfgjlErA012BJYL6tIy_-nOki5OOApNvPdmWe5trTnM05jd5V2hJ7THsd-F_MMq7v2wYKA' },
    { id: 'f4', name: 'Thanh Hà', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJbYDKFBc4nkrfyP6Se_rtPt0A61wpoxLvh4x1lEbCTrFeNcSuAZWztOztyweognDh6jIIwoi4tNgoqJ2j1ngAt8BaQxMFVG3gu1piPcC8aOOn3JEn0ZnHIg9WCEYrwPgNpdTNM8UnTbCiskTwAhN0Sxk_yJWtSH7inVeYuJKQgQl8v8Juhw5Y4sPkdMej-WjSCoTvu9vtnMqWKs4m3jTKdA73ML77NOIG6RYHzKRfvYEVSCBxRmJaUbaE9Dw_-MoFKRhPzFJE3A' },
    { id: 'f5', name: 'Văn Hùng', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqHi65dshd96_sLjWeQZeA0rOnqpLZasWz0VBMLxrKjr3XxoR1XOiivH9efmaBegAq8mKIJ5lFag-lhKuRx_SFTGFl4xJxdIin2s-Qaph6cfsbJJ0noD6WP4SRM4URQKByntERNWxPa56fkJluosnIxeZ1hWIS4hRLga4PeXTftWhX6nmGQrPbOifN0WgjcJx-xNE9m9VYajqR9uDQjAIuRXPi4lRsd1TIg1nyM0udBxt8w5gXsOFT5OqAD8en0pC1RxWLRRT7-A' },
    { id: 'f6', name: 'Mai Anh', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBbMUG47faHUrppTHUU1hkIjz-7yi_fcK4Ek4Wwf8NMqxHVUloMGtdHjEcEy1OGVfODbtMz8kxeuDlaMpTml4_TJJZ3j8mzizudEqezwHoweUiJAHYWTPg7ljQGGMdBAVD_sK6j2TIjD8Uwvjr42eyF-nIACrlZ86Zsf0UdrgYC2cmOhEYHUwrBh6QykDD_lCYpcymJhde8N_gYaaRhBC3J-h6Zv07xRs9Vf-cSz76-xUtnpQK-ZLTefARipACkZ1JKxjAJVQ6wA' },
  ],
})

export function UserProfilePage() {
  const { t } = useTranslation()
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [activeTab, setActiveTab] = useState('about')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

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
    // TODO: gọi API userService.getUserProfile(userId)
    setLoading(true)
    Promise.resolve(mockUserProfile(userId))
      .then((data) => setProfile(data))
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
              <div className="absolute bottom-1 right-1 bg-green-500 size-5 rounded-full border-4 border-card-dark" title={t('userProfile.online')} />
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
                {profile.friendStatus !== 'connected' && (
                  <button
                    type="button"
                    className="flex-1 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    {profile.friendStatus === 'pending' ? t('userProfile.pendingRequest') : t('userProfile.addFriend')}
                  </button>
                )}
                <button
                  type="button"
                  className="flex-1 bg-border-dark hover:bg-border-dark/70 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">chat</span>
                  {t('userProfile.sendMessage')}
                </button>
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

        {/* Right: Tabs & Content */}
        <div className="lg:col-span-8">
          <div className="flex border-b border-border-dark mb-6 overflow-x-auto">
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
                className={`shrink-0 px-4 sm:px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap ${
                  activeTab === key ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {t(label)}
              </button>
            ))}
          </div>

          <div className="space-y-6">
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
                    {profile.skills.map((skill) => (
                      <div key={skill.key} className="p-4 bg-background-dark/50 rounded-xl border border-border-dark">
                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">{t(skill.labelKey)}</div>
                        <div className="text-2xl font-black text-primary mb-2">{t('userProfile.levelLabel', { level: skill.level })}</div>
                        <div className="h-1 w-full bg-border-dark rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all" style={{ width: `${skill.percent}%` }} />
                        </div>
                      </div>
                    ))}
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
                <p className="text-gray-400">{t('userProfile.noPersonalInfo')}</p>
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
