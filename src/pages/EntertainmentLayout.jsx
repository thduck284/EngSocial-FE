import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ROUTES, SKILL_TABS, SKILLS } from '../constants'
import { DEFAULT_AVATAR } from '../constants/ui'
import { useAuth } from '../context/AuthContext'
import { useDashboardSocket, useDashboardFriends, useStudyGroups } from '../hooks'
import { rawService } from '../services/raw.service'
import { challengesService } from '../services/challenges.service'
import { userService } from '../services'
import { ENTERTAINMENT_GAMES } from '../constants/entertainmentGames'

export function EntertainmentLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const isVi = i18n.language?.startsWith('vi')

  const [onlineUserIds, setOnlineUserIds] = useState(new Set())
  const { allConversations, setConversations } = useStudyGroups(setOnlineUserIds)
  const { friendsFilterTab, setFriendsFilterTab, displayedFriendsList, setOnlineFriends } =
    useDashboardFriends(onlineUserIds, setOnlineUserIds, allConversations)
  useDashboardSocket(user, setConversations, setOnlineFriends, setOnlineUserIds)

  const onlineCount = displayedFriendsList.filter((item) => item.isOnline).length

  const [rawData, setRawData] = useState({ challenge: null })
  const [userStats, setUserStats] = useState(null)

  useEffect(() => {
    challengesService
      .getChallenges({ status: 'active', limit: 1 })
      .then((res) => {
        const activeChallenge = res?.data?.data?.[0] || null
        setRawData({ challenge: activeChallenge })
      })
      .catch(() => {})

    userService.getStats()
      .then((res) => setUserStats(res?.data))
      .catch(() => {})
  }, [])

  const skillStatsMap = (userStats?.skillStats || []).reduce((acc, cur) => {
    acc[cur.key] = cur
    return acc
  }, {})

  // Tổng hợp toàn bộ kỹ năng (giống /practice nhưng sum tất cả)
  const totalDone = (userStats?.skillStats || []).reduce((sum, s) => sum + (s.lessonsCompleted || 0), 0)
  const totalWeeklyMinsRaw = (userStats?.skillStats || []).reduce((sum, s) => sum + (s.weeklyTimeSpent || 0), 0)

  const challenge = rawData.challenge || null
  const challengeTitle = challenge
    ? (isVi ? (challenge.titleVi || challenge.title) : (challenge.titleEn || challenge.title))
    : t('enter.bannerTitle')
  const challengeDesc = challenge
    ? (isVi ? (challenge.descriptionVi || challenge.description) : (challenge.descriptionEn || challenge.description))
    : t('enter.bannerPickGame')

  // Weekly time - format giống /practice
  const formatTimeVal = (val) => Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })
  const weeklyTimeStr = totalWeeklyMinsRaw >= 60
    ? `${Math.floor(totalWeeklyMinsRaw / 60)}h ${formatTimeVal(totalWeeklyMinsRaw % 60)}m`
    : `${formatTimeVal(totalWeeklyMinsRaw)}m`

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
            {ENTERTAINMENT_GAMES.map((g, idx) => (
              <div key={g.slug} className="flex items-center justify-between gap-2 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`size-10 rounded-xl shrink-0 ${idx === 0 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400'} flex items-center justify-center relative overflow-hidden border border-white/5`}>
                    <img src={g.image} alt={t(g.titleKey)} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-60 transition-opacity" />
                    <span className="material-symbols-outlined text-[18px] relative z-10">{g.icon}</span>
                  </div>
                  <div className="text-[11px] min-w-0">
                    <p className="font-bold truncate text-white group-hover:text-cyan-400 transition-colors">{t(g.titleKey)}</p>
                    <p className="text-gray-400 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Global MMO
                    </p>
                  </div>
                </div>
                <Link
                  to={g.path}
                  className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold rounded-lg hover:bg-primary hover:text-background-dark transition-all shrink-0"
                >
                  {t('buttons.join' || 'Play')}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Tip of the Day */}
        {(() => {
          const tips = isVi ? [
            { icon: 'school', text: 'Chơi game học tiếng Anh mỗi ngày giúp bạn ghi nhớ từ vựng qua hành động thực tế — não bộ học nhanh hơn khi có cảm xúc!' },
            { icon: 'repeat', text: 'Lặp lại là chìa khóa! Gặp một từ mới trong game, hãy cố tình tìm lại nó lần sau để khắc sâu vào trí nhớ dài hạn.' },
            { icon: 'translate', text: 'Khi thấy từ mới, hãy nhẩm câu ví dụ bằng tiếng Anh — không chỉ dịch nghĩa, mà đặt từ vào ngữ cảnh thực tế.' },
            { icon: 'volume_up', text: 'Sau khi chơi, hãy đọc to các từ vừa học. Kết hợp nghe + nhìn + nói giúp ghi nhớ từ gấp 3 lần so với chỉ đọc thầm.' },
            { icon: 'psychology', text: 'Các game chữ luyện tư duy nhận dạng hình dạng từ — kỹ năng quan trọng giúp bạn đọc tiếng Anh nhanh hơn trong tương lai.' },
            { icon: 'emoji_objects', text: 'Thua một từ không sao! Hãy ghi từ đó ra và xem lại sau. Sai lầm là cơ hội học hiệu quả nhất.' },
          ] : [
            { icon: 'school', text: 'Playing English word games daily builds vocabulary through action — your brain learns faster when emotions are involved!' },
            { icon: 'repeat', text: 'Repetition is key! When you see a new word in a game, intentionally hunt for it again next round to lock it into long-term memory.' },
            { icon: 'translate', text: 'When you spot a new word, mentally form an example sentence — context beats translation every time.' },
            { icon: 'volume_up', text: 'After playing, say the words you learned out loud. Hearing + seeing + speaking boosts retention 3x compared to reading alone.' },
            { icon: 'psychology', text: 'Word games train letter-pattern recognition — a key skill that makes you a faster English reader in the long run.' },
            { icon: 'emoji_objects', text: 'Missing a word is fine! Write it down and review later. Mistakes are the most effective learning opportunities.' },
          ]
          const tip = tips[Math.floor(Date.now() / 86400000) % tips.length]
          return (
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-xl p-4 border border-amber-500/20">
              <h3 className="font-bold text-xs mb-2 flex items-center gap-1.5 text-amber-400">
                <span className="material-symbols-outlined text-[16px]">tips_and_updates</span>
                {isVi ? 'Mẹo hôm nay' : 'Tip of the Day'}
              </h3>
              <div className="flex gap-2">
                <span className="material-symbols-outlined text-amber-400/60 text-[20px] shrink-0 mt-0.5">{tip.icon}</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">{tip.text}</p>
              </div>
            </div>
          )
        })()}
      </aside>

      <section className="col-span-12 lg:col-span-6 space-y-6">
        <div className="relative rounded-2xl overflow-hidden border border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 via-slate-900/80 to-fuchsia-900/40" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[60px] rounded-full" />
          <div className="relative z-10 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-primary text-background-dark text-[10px] font-black rounded-lg uppercase tracking-[0.15em] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">emoji_events</span>
                {challenge?.type ? `${challenge.type} Challenge` : t('enter.weeklyChallenge')}
              </span>
              {challenge?.endDate && (
                <span className="px-2.5 py-1 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {new Date(challenge.endDate).toLocaleDateString(isVi ? 'vi-VN' : 'en-US')}
                </span>
              )}
            </div>
            <h4 className="font-black text-xl text-white mb-1 leading-tight">{challengeTitle}</h4>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed line-clamp-2">{challengeDesc}</p>
            <div className="flex flex-wrap gap-4 mb-5">
              {(challenge?.xpReward > 0) && (
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-yellow-400 text-[18px]">bolt</span>
                  <span className="text-sm font-bold text-yellow-400">{challenge.xpReward} XP</span>
                </div>
              )}
              {(challenge?.participantCount > 0) && (
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">group</span>
                  <span className="text-sm text-slate-300">{challenge.participantCount} {isVi ? 'người tham gia' : 'participants'}</span>
                </div>
              )}
              {(challenge?.requirement?.target > 0) && (
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-cyan-400 text-[18px]">flag</span>
                  <span className="text-sm text-slate-300">{isVi ? 'Mục tiêu' : 'Goal'}: {challenge.requirement.target} {challenge.requirement.type}</span>
                </div>
              )}
            </div>
            <Link
              to={ROUTES.CHALLENGE || '/challenge'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-primary text-background-dark hover:brightness-110 hover:scale-105 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              {isVi ? 'Xem tất cả thử thách' : 'View all challenges'}
            </Link>
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
            {Object.entries(SKILLS).map(([key, { icon, label, color }]) => {
              const stat = skillStatsMap[key] || {}
              const xp = (stat.totalXpEarned || 0).toLocaleString()
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${color}`}>{icon}</span>
                    <span className="text-sm">{t(label)}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{xp} XP</span>
                </div>
              )
            })}
            <div className="pt-3 border-t border-border-dark flex justify-between items-center text-xs text-gray-400">
              <span>{t('skills.weeklyTime')}: <strong className="text-white">{weeklyTimeStr}</strong></span>
              <span>{t('skills.done')}: <strong className="text-white">{totalDone}</strong></span>
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
