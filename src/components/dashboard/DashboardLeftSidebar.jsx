import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants'
import { DEFAULT_AVATAR } from '../../constants/ui'
import { DashboardCard } from '../ui/DashboardCard'
import { DashboardSectionHeader } from '../ui/DashboardSectionHeader'

/**
 * Left sidebar: profile card, weekly stats, today goals, study groups, featured lessons, ongoing challenge.
 */
export function DashboardLeftSidebar({
  displayAvatar,
  displayName,
  profileProgress,
  weeklyStatsOpen,
  setWeeklyStatsOpen,
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
            <h2 className="font-bold text-lg">{displayName}</h2>
            <p className="text-primary text-sm font-medium">{t('dashboard.level')} {profileProgress.level} · {t('dashboard.learner')}</p>
          </div>
        </div>
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span>{t('dashboard.xpProgress')}</span>
            <span>{Math.min(100, Math.round((profileProgress.currentXp / profileProgress.xpToNextLevel) * 100))}%</span>
          </div>
          <div className="h-2 w-full bg-[#325a67] rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(100, (profileProgress.currentXp / profileProgress.xpToNextLevel) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-[#92bbc9]">{profileProgress.currentXp.toLocaleString()}/{profileProgress.xpToNextLevel.toLocaleString()} XP {t('dashboard.xpToLevel')} {profileProgress.level + 1}</p>
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
              <span className="material-symbols-outlined text-slate-500 dark:text-[#92bbc9]">
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
                  <span className="text-sm font-medium">{t(label)}</span>
                </div>
                <span className="font-bold text-sm">
                  {value} <span className={`text-[10px] ml-1 ${changeColor}`}>{change}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </DashboardCard>

      <DashboardCard className="p-5">
        <DashboardSectionHeader
          icon="target"
          title={t('dashboard.todayGoals')}
          rightSlot={
            <span className="text-[10px] text-primary">
              2/3 {t('dashboard.completed')}
            </span>
          }
          className="mb-4"
        />
        <div className="space-y-1">
          {raw.goals.map(({ done, labelKey }) => (
            <label key={labelKey} className="flex items-center gap-3 py-2 cursor-pointer group">
              <input
                type="checkbox"
                defaultChecked={done}
                className="rounded border-primary text-primary focus:ring-primary/20 bg-transparent"
              />
              <span className={`text-sm ${done ? 'line-through text-[#92bbc9]' : ''}`}>{t(labelKey)}</span>
            </label>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard className="p-5">
        <DashboardSectionHeader
          icon="groups"
          title={
            <button
              type="button"
              onClick={studyGroups.openStudyGroupsModal}
              className="text-left hover:underline"
            >
              {t('dashboard.studyGroups')}
            </button>
          }
          className="mb-4"
        />
        {studyGroups.groupConversationsLoading ? (
          <div className="py-6 flex justify-center">
            <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
          </div>
        ) : (
          <div className={`space-y-4 overflow-y-auto pr-1 custom-scrollbar ${groupsList.length > 5 ? 'max-h-[200px]' : ''}`}>
            {groupsList.map((item, idx) => {
              if (isApiGroups) {
                const convId = item.id ?? item._id
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
                        <p className="font-bold line-clamp-1">{name}</p>
                        {membersLabel && <p className="text-[#92bbc9]">{membersLabel}</p>}
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
                    <p className="font-bold line-clamp-1">{g.title}</p>
                    <p className="text-[#92bbc9]">{g.members}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {(studyGroups.groupConversations.length === 0 && !studyGroups.groupConversationsLoading && (!raw.suggestedGroups || raw.suggestedGroups.length === 0)) && (
          <p className="text-xs text-slate-500 dark:text-[#92bbc9] py-2 text-center">{t('dashboard.noStudyGroups')}</p>
        )}
      </DashboardCard>

      <DashboardCard className="p-5">
        <DashboardSectionHeader
          icon="menu_book"
          title={t('dashboard.featuredLessons')}
          className="mb-4"
        />
        <div className="space-y-4">
          {raw.featuredLessons.map(({ title, icon, skill, level, to, learners }) => (
            <Link key={title} to={to} className="block group">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-semibold group-hover:text-primary transition-colors">{title}</h4>
                <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-500 text-[9px] font-bold rounded uppercase shrink-0 ml-2">
                  {level}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 dark:text-[#92bbc9]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    {icon === 'menu_book' ? 'menu_book' : icon === 'headset' ? 'headset' : 'edit_note'}
                  </span>
                  {t(`skills.${skill.toLowerCase()}`)}
                </span>
                <span>• {learners} {t('dashboard.views')}</span>
              </div>
            </Link>
          ))}
        </div>
        <Link
          to="/lesson"
          className="block w-full mt-4 py-2 text-xs font-bold text-primary hover:underline text-center"
        >
          {t('dashboard.viewAllLessons')}
        </Link>
      </DashboardCard>

      <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-5 border border-primary/20">
        <h3 className="font-bold text-sm text-primary mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg fill-icon">emoji_events</span>
          {t('dashboard.ongoingChallenge')}
        </h3>
        <div className="space-y-3">
          <div className="text-xs">
            <p className="font-semibold">Vua Từ Vựng Tuần 48</p>
            <div className="flex items-center justify-between mt-1 text-[#92bbc9]">
              <span>Kết thúc sau: 2 ngày</span>
              <span>Top 5%</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
