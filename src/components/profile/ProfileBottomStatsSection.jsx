import { Link } from 'react-router-dom'
import { ProfileAchievementsCard } from './ProfileAchievementsCard'

export function ProfileBottomStatsSection({
  t,
  profileSkillStats,
  achievementItems,
  achievementsLoading,
}) {
  return (
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
                <span className={`material-symbols-outlined ${changeColor || 'text-primary'}`}>
                  {icon}
                </span>
                <span className="text-sm font-medium">{t(label)}</span>
              </div>
              <span className="font-bold text-sm">
                {value}{' '}
                {change && (
                  <span className={`text-[10px] ml-1 ${changeColor}`}>{change}</span>
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
    </div>
  )
}

