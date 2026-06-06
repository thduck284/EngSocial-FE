import { Link } from 'react-router-dom'
import { ProfileAchievementsCard } from './ProfileAchievementsCard'

export function ProfileLeftStatsSection({
  t,
  profileSkillStats,
  achievementItems,
  achievementsLoading,
}) {
  return (
    <>
      <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-slate-200 dark:border-border-dark shadow-sm">
        <h4 className="text-sm font-bold mb-3 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">analytics</span>
          {t('profile.skillStats')}
        </h4>
        <div className="space-y-2">
          {profileSkillStats.map(({ icon, label, value, change, changeColor, to }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-border-dark hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`material-symbols-outlined text-lg shrink-0 ${changeColor || 'text-primary'}`}>
                  {icon}
                </span>
                <span className="text-xs font-medium truncate">{t(label)}</span>
              </div>
              <span className="font-bold text-xs shrink-0 ml-2">
                {value}{' '}
                {change && (
                  <span className={`text-[9px] ml-1 ${changeColor}`}>{change}</span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </div>


      <ProfileAchievementsCard
        t={t}
        items={achievementItems}
        loading={achievementsLoading}
      />
    </>
  )
}

