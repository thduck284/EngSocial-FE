import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants'
import { DEFAULT_AVATAR } from '../../constants/ui'
import { DashboardCard } from './DashboardCard'
import { DashboardSectionHeader } from './DashboardSectionHeader'

/**
 * Left sidebar: profile card, weekly stats, today goals, study groups, featured lessons, ongoing challenge.
 */
export function DashboardLeftSidebar({
  displayAvatar,
  displayName,
  profileProgress,
  weeklyStatsOpen,
  setWeeklyStatsOpen,
  studyGroupsOpen,
  setStudyGroupsOpen,
  featuredLessonsOpen,
  setFeaturedLessonsOpen,
  weeklyLeaderboardOpen,
  setWeeklyLeaderboardOpen,
  weeklyLeaderboard = { list: [], currentUser: null },
  weeklyLeaderboardLoading = false,
  raw,
  studyGroups,
}) {
  const { t } = useTranslation()
  const groupsList = studyGroups.groupConversations.length > 0 ? studyGroups.groupConversations : raw.suggestedGroups
  const isApiGroups = studyGroups.groupConversations.length > 0

  return (
    <aside className="col-span-12 lg:col-span-3 space-y-6">
      <DashboardCard className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <img src={displayAvatar} alt="" className="size-14 rounded-full object-cover" />
          <div>
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">{displayName}</h2>
            <p className="text-primary text-sm font-medium">{t('dashboard.level')} {profileProgress.level} · {t('dashboard.learner')}</p>
          </div>
        </div>
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-200">
            <span>{t('dashboard.xpProgress')}</span>
            <span>{Math.min(100, Math.round((profileProgress.currentXp / profileProgress.xpToNextLevel) * 100))}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-[#325a67] rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all shadow-[0_0_8px_rgba(19,182,236,0.4)]"
              style={{ width: `${Math.min(100, (profileProgress.currentXp / profileProgress.xpToNextLevel) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-[#92bbc9]">{profileProgress.currentXp.toLocaleString()}/{profileProgress.xpToNextLevel.toLocaleString()} XP {t('dashboard.xpToLevel')} {profileProgress.level + 1}</p>
        </div>
        <Link
          to="/profile"
          className="block w-full py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all rounded-lg font-bold text-sm text-center"
        >
          {t('dashboard.viewFullProfile')}
        </Link>
      </DashboardCard>

      <DashboardCard className="p-5">
        <button
          type="button"
          onClick={() => setWeeklyStatsOpen((o) => !o)}
          className="w-full text-left"
        >
          <DashboardSectionHeader
            icon="query_stats"
            title={t('dashboard.weeklyStats')}
            rightSlot={
              <span className="material-symbols-outlined text-slate-400 dark:text-[#92bbc9]">
                {weeklyStatsOpen ? 'expand_less' : 'expand_more'}
              </span>
            }
          />
        </button>
        {weeklyStatsOpen && (
          <div className="grid grid-cols-1 gap-3 mt-4">
            {raw.skillStats.map(({ icon, label, value, change, changeColor, to }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#233f48] rounded-lg hover:bg-slate-100 dark:hover:bg-[#325a67] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${changeColor || 'text-primary'}`}>
                    {icon}
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t(label)}</span>
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {value} <span className={`text-[10px] ml-1 ${changeColor}`}>{change}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </DashboardCard>


      <DashboardCard className="p-5">
        <button
          type="button"
          onClick={() => setStudyGroupsOpen((o) => !o)}
          className="w-full text-left"
        >
          <DashboardSectionHeader
            icon="groups"
            title={t('dashboard.studyGroups')}
            rightSlot={
              <span className="material-symbols-outlined text-slate-400 dark:text-[#92bbc9]">
                {studyGroupsOpen ? 'expand_less' : 'expand_more'}
              </span>
            }
          />
        </button>
        {studyGroupsOpen && (
          <>
        {studyGroups.groupConversationsLoading ? (
          <div className="py-6 flex justify-center mt-4">
            <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
          </div>
        ) : (
          <div className={`space-y-4 overflow-y-auto pr-1 custom-scrollbar mt-4 ${groupsList.length > 5 ? 'max-h-[200px]' : ''}`}>
            {groupsList.map((item, idx) => {
              if (isApiGroups) {
                const convId = item.id || item._id
                const name = item.name || t('dashboard.studyGroups')
                const avatar = item.avatar || (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
                const membersLabel = item.memberCount != null ? `${item.memberCount} ${t('dashboard.members')}` : ''
                const isGroupOnline = item.online === true
                return (
                  <div key={convId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#233f48] transition-colors group">
                    <Link to={ROUTES.MESSAGES_CONVERSATION(convId)} className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <img src={avatar} alt="" className="size-10 rounded-lg object-cover" />
                        {isGroupOnline && (
                          <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#111e22]" title={t('userProfile.online')} />
                        )}
                      </div>
                      <div className="text-xs min-w-0">
                        <p className="font-bold line-clamp-1 text-slate-900 dark:text-white">{name}</p>
                        {membersLabel && <p className="text-slate-500 dark:text-[#92bbc9]">{membersLabel}</p>}
                      </div>
                    </Link>
                    <Link
                      to={ROUTES.MESSAGES_CONVERSATION(convId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors shrink-0"
                      title={t('messages.title')}
                    >
                      <span className="material-symbols-outlined text-lg">chat_bubble</span>
                    </Link>
                  </div>
                )
              }
              const g = item
              return (
                <div key={g.title || idx} className="flex items-start gap-3">
                  <div className={`size-10 rounded-lg ${g.color || 'bg-primary/20'} flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-white">{g.icon || 'groups'}</span>
                  </div>
                  <div className="text-xs min-w-0">
                    <p className="font-bold line-clamp-1 text-slate-900 dark:text-white">{g.title}</p>
                    <p className="text-slate-500 dark:text-[#92bbc9]">{g.members}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {(studyGroups.groupConversations.length === 0 && !studyGroups.groupConversationsLoading && (!raw.suggestedGroups || raw.suggestedGroups.length === 0)) && (
          <p className="text-xs text-slate-500 dark:text-[#92bbc9] py-2 text-center mt-4">{t('dashboard.noStudyGroups')}</p>
        )}
        {groupsList.length > 0 && (
          <button
            type="button"
            onClick={studyGroups.openStudyGroupsModal}
            className="block w-full mt-4 py-2 text-xs font-bold text-primary hover:underline text-center"
          >
            {t('community.viewAll')}
          </button>
        )}
          </>
        )}
      </DashboardCard>

      <DashboardCard className="p-5">
        <button
          type="button"
          onClick={() => setFeaturedLessonsOpen((o) => !o)}
          className="w-full text-left"
        >
          <DashboardSectionHeader
            icon="menu_book"
            title={t('dashboard.featuredLessons')}
            rightSlot={
              <span className="material-symbols-outlined text-slate-400 dark:text-[#92bbc9]">
                {featuredLessonsOpen ? 'expand_less' : 'expand_more'}
              </span>
            }
          />
        </button>
        {featuredLessonsOpen && (
          <>
        <div className="space-y-4 mt-4">
          {raw.featuredLessons.map((lesson) => {
            const skill = lesson.skill?.toLowerCase() || 'reading'
            const category = lesson.category === 'practice' ? 'practice' : 'lesson'
            const to = `/${category}/${skill}/${lesson.slug}`
            const icon = skill === 'reading' ? 'menu_book' : skill === 'listening' ? 'headset' : 'edit_note'
            const learners = lesson.completionCount || 0

            return (
              <Link key={lesson.id || lesson.slug} to={to} className="block group">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors line-clamp-2">
                    {lesson.title}
                  </h4>
                  <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-500 text-[9px] font-bold rounded uppercase shrink-0 ml-2">
                    {lesson.level}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 dark:text-[#92bbc9]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      {icon}
                    </span>
                    {t(`skills.${skill}`)}
                  </span>
                  <span>• {learners.toLocaleString()} {t('dashboard.views')}</span>
                </div>
              </Link>
            )
          })}
        </div>
        <Link
          to="/lesson"
          className="block w-full mt-4 py-2 text-xs font-bold text-primary hover:underline text-center"
        >
          {t('dashboard.viewAllLessons')}
        </Link>
          </>
        )}
      </DashboardCard>

      <DashboardCard className="p-5">
        <button
          type="button"
          onClick={() => setWeeklyLeaderboardOpen((o) => !o)}
          className="w-full text-left"
        >
          <DashboardSectionHeader
            icon="military_tech"
            title={t('dashboard.weeklyLeaderboard')}
            rightSlot={
              <span className="material-symbols-outlined text-slate-400 dark:text-[#92bbc9]">
                {weeklyLeaderboardOpen ? 'expand_less' : 'expand_more'}
              </span>
            }
          />
        </button>
        {weeklyLeaderboardOpen && (
          <>
            {weeklyLeaderboardLoading ? (
              <div className="flex justify-center py-6 mt-4">
                <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
              </div>
            ) : (
              <>
                {(weeklyLeaderboard.list || []).length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-[#92bbc9] py-4 text-center mt-4">{t('dashboard.noLeaderboardData')}</p>
                ) : (
                  <div className="space-y-3 mt-4">
                    {(weeklyLeaderboard.list || []).slice(0, 3).map((entry, index) => (
                      <div
                        key={entry.userId ?? entry.id ?? `lb-${index}-${entry.rank}`}
                        className={`flex items-center justify-between ${entry.rank === 1 ? 'p-2 bg-yellow-500/5 rounded-lg border border-yellow-500/10' : 'px-2 py-1'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`font-bold w-4 text-xs shrink-0 ${entry.rank === 1 ? 'text-yellow-500' : 'text-slate-400 dark:text-[#92bbc9]'}`}>
                            {entry.rank}
                          </span>
                          <img
                            src={entry.avatar || DEFAULT_AVATAR}
                            alt=""
                            className="size-8 rounded-full object-cover bg-slate-200 dark:bg-[#233f48] shrink-0"
                          />
                          <span className={`text-xs truncate max-w-[100px] text-slate-700 dark:text-slate-200 ${entry.rank === 1 ? 'font-bold' : 'font-medium'}`}>
                            {entry.name || 'User'}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white shrink-0">
                          {entry.xp != null ? `${Number(entry.xp).toLocaleString()} XP` : '0 XP'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {weeklyLeaderboard.currentUser && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#325a67]">
                    <div className="flex items-center justify-between px-2 text-primary font-bold">
                      <div className="flex items-center gap-3">
                        <span className="w-4 text-xs">{weeklyLeaderboard.currentUser.rank}</span>
                        <span className="text-xs">{t('dashboard.yourRank')}</span>
                      </div>
                      <span className="text-xs">{Number(weeklyLeaderboard.currentUser.xp ?? 0).toLocaleString()} XP</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </DashboardCard>


    </aside>
  )
}
