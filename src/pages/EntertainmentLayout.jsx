import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ROUTES, SKILL_TABS, SKILLS } from '../constants'
import { DEFAULT_AVATAR } from '../constants/ui'
import { useAuth } from '../context/AuthContext'
import { useDashboardSocket, useDashboardFriends, useStudyGroups } from '../hooks'
import { rawService } from '../services/raw.service'
import { challengesService } from '../services/challenges.service'

export function EntertainmentLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()

  const [onlineUserIds, setOnlineUserIds] = useState(new Set())
  const { allConversations, setConversations } = useStudyGroups(setOnlineUserIds)
  const { friendsFilterTab, setFriendsFilterTab, displayedFriendsList, setOnlineFriends } =
    useDashboardFriends(onlineUserIds, setOnlineUserIds, allConversations)
  useDashboardSocket(user, setConversations, setOnlineFriends, setOnlineUserIds)

  const onlineCount = displayedFriendsList.filter((item) => item.isOnline).length

  const [rawData, setRawData] = useState({
    hotGames: [],
    challenge: null,
  })

  useEffect(() => {
    rawService
      .getGames()
      .then((res) => {
        const d = res?.data || {}
        setRawData((prev) => ({ ...prev, hotGames: d.hotGames || [] }))
      })
      .catch(() => {})
      
    challengesService
      .getChallenges({ status: 'active', limit: 1 })
      .then((res) => {
        const activeChallenge = res?.data?.data?.[0] || null
        if (activeChallenge) {
          setRawData((prev) => ({ ...prev, challenge: activeChallenge }))
        }
      })
      .catch(() => {})
  }, [])

  const challenge = rawData.challenge || { 
    title: t('enter.bannerTitle'), 
    description: t('enter.bannerPickGame'), 
    endDate: null, 
    btn: 'buttons.join',
    type: '' 
  }

  return (
    <main className="max-w-[1440px] mx-auto grid grid-cols-12 gap-6 p-6">
      <aside className="col-span-12 lg:col-span-3 space-y-5 overflow-hidden lg:sticky lg:top-4 self-start max-h-[calc(100vh-64px)] overflow-y-auto">
        <div className="bg-card-dark rounded-xl border border-border-dark overflow-hidden">
          <div className="grid grid-cols-2 gap-1 p-1.5">
            {SKILL_TABS.map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`py-2.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all min-w-0 ${
                  pathname === to || (to === ROUTES.SKILLS.ENTERTAINMENT && pathname.startsWith(`${ROUTES.SKILLS.ENTERTAINMENT}/`))
                    ? 'bg-primary/20 text-primary border border-primary/40 font-semibold'
                    : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-base shrink-0">{icon}</span>
                <span className="truncate">{t(label)}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="bg-card-dark rounded-xl p-5 border border-border-dark">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-400">local_fire_department</span>
            {t('enter.hotGames')}
          </h3>
          <div className="space-y-4">
            {(rawData.hotGames || []).map(({ id, icon, title, playing, bgColor }) => (
              <div key={id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`size-8 rounded shrink-0 ${bgColor || 'bg-indigo-500'} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-white text-sm">{icon || 'spellcheck'}</span>
                  </div>
                  <div className="text-[10px] min-w-0">
                    <p className="font-bold truncate">{title}</p>
                    <p className="text-gray-400">
                      {playing} {t('enter.playing')}
                    </p>
                  </div>
                </div>
                <button
                  className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded hover:bg-primary hover:text-background-dark transition-all shrink-0"
                  type="button"
                >
                  {t('buttons.join')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <section className="col-span-12 lg:col-span-6 space-y-6">
        <div className="bg-gradient-to-r from-fuchsia-900/40 to-primary/20 border border-primary/30 rounded-xl p-5 relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 bg-primary text-background-dark text-[10px] font-bold rounded uppercase tracking-wider">
                  {challenge.type ? `${challenge.type} Challenge` : t('enter.weeklyChallenge')}
                </span>
                {challenge.endDate ? (
                  <span className="text-xs text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">schedule</span> 
                    {new Date(challenge.endDate).toLocaleDateString()}
                  </span>
                ) : null}
              </div>
              <h4 className="font-bold text-lg text-white">{challenge.titleVi || challenge.title}</h4>
              <p className="text-xs text-gray-300">{challenge.descriptionVi || challenge.description || challenge.desc}</p>
              <Link
                to={ROUTES.GAMIFICATION.CHALLENGES || '/gamification'}
                className="mt-2 inline-block px-6 py-2 bg-primary text-background-dark font-bold text-sm rounded-lg hover:brightness-110 transition-all text-center"
              >
                {t(challenge.btn || 'buttons.join')}
              </Link>
            </div>
            <span className="material-symbols-outlined text-7xl text-primary/25 shrink-0 hidden sm:block">sports_esports</span>
          </div>
        </div>

        <Outlet />
      </section>

      <aside className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-4 self-start max-h-[calc(100vh-64px)] overflow-y-auto">
        <div className="bg-card-dark rounded-xl p-5 border border-border-dark">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            {t('skills.skillStats')}
          </h3>
          <div className="space-y-4">
            {Object.entries(SKILLS).map(([key, { icon, label, color }]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${color}`}>{icon}</span>
                  <span className="text-sm">{t(label)}</span>
                </div>
                <span className="text-sm font-bold">
                  {t('skills.stats.xpValue', { count: key === 'reading' ? '1,240' : key === 'listening' ? '850' : '420' })}
                </span>
              </div>
            ))}
            <div className="pt-4 border-t border-border-dark flex justify-between items-center text-xs text-gray-400">
              <span>
                {t('skills.weeklyTime')}: <strong className="text-white">{t('skills.stats.timeValue', { h: 5, m: 20 })}</strong>
              </span>
              <span>
                {t('skills.done')}: <strong className="text-white">{t('skills.stats.doneValue', { completed: 12, total: 15 })}</strong>
              </span>
            </div>
          </div>
        </div>
        <div className="bg-card-dark rounded-xl p-5 border border-border-dark">
          <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">people</span>
            {t('dashboard.friends')}
            {onlineCount > 0 && (
              <span className="text-[10px] font-medium text-green-400 flex items-center gap-0.5" title={t('userProfile.online')}>
                <span className="size-1.5 rounded-full bg-green-500" />
                {onlineCount} {t('userProfile.online')}
              </span>
            )}
            <Link
              to={ROUTES.MESSAGES}
              className="ml-auto p-1 rounded-lg text-gray-400 hover:bg-primary/10 hover:text-primary transition-colors"
              title={t('messages.title')}
            >
              <span className="material-symbols-outlined text-lg">chat_bubble</span>
            </Link>
          </h3>
          <div className="flex gap-1 p-1 bg-gray-700/50 rounded-lg mb-3">
            <button
              type="button"
              onClick={() => setFriendsFilterTab('all')}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${friendsFilterTab === 'all' ? 'bg-white/10 text-primary' : 'text-gray-400 hover:text-white'}`}
            >
              {t('dashboard.all')}
            </button>
            <button
              type="button"
              onClick={() => setFriendsFilterTab('online')}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${friendsFilterTab === 'online' ? 'bg-white/10 text-primary' : 'text-gray-400 hover:text-white'}`}
            >
              {t('userProfile.online')}
            </button>
          </div>
          <div className={`space-y-3 overflow-y-auto pr-1 custom-scrollbar ${displayedFriendsList.length > 5 ? 'max-h-[200px]' : ''}`}>
            {displayedFriendsList.length === 0 ? (
              <p className="text-xs text-gray-400">{t('dashboard.noFriendsOnline')}</p>
            ) : (
              displayedFriendsList.map((item) => {
                const u = item?.user || item
                const id = u?.id ?? u?._id
                const name = u?.name || t('common.user')
                const avatar =
                  u?.avatar ||
                  (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
                const isOnline = item.isOnline
                return (
                  <div key={id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group">
                    <Link to={id ? `/profile/${id}` : '#'} className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <img src={avatar} alt={name} className="size-9 rounded-full object-cover" />
                        {isOnline && (
                          <span
                            className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-card-dark"
                            title={t('userProfile.online')}
                          />
                        )}
                      </div>
                      <span className="text-sm font-medium truncate">{name}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`${ROUTES.MESSAGES}?with=${encodeURIComponent(id)}`, {
                          state: { withUser: { id, name, avatar } },
                        })
                      }
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-primary/10 hover:text-primary transition-colors shrink-0"
                      title={t('messages.title')}
                    >
                      <span className="material-symbols-outlined text-lg">chat_bubble</span>
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </aside>
    </main>
  )
}
