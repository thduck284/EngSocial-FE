import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { ROUTES } from '../../constants'
import {
  pickAchievementBadgeName,
  pickAchievementName,
} from '../../utils/achievementI18n.js'

function achievementHasBadgeReward(a) {
  const rt = a?.rewardType || 'exp'
  return rt === 'badge' || rt === 'both'
}

export function ProfileAchievementsCard({ t, items, loading }) {
  const { i18n } = useTranslation()
  const lng = i18n.language

  const completedBadges = useMemo(() => {
    return (items || []).filter((a) => a?.completed && achievementHasBadgeReward(a))
  }, [items])

  return (
    <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-border-dark">
      <h4 className="font-bold mb-4 dark:text-white flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">military_tech</span>
        {t('profile.earnedBadges')}
      </h4>

      {loading ? (
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="size-12 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200/80 dark:border-border-dark"
            />
          ))}
        </div>
      ) : completedBadges.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-1">
          {t('profile.earnedBadgesEmpty')}
        </p>
      ) : (
        <ul className="flex flex-wrap gap-3 list-none p-0 m-0">
          {completedBadges.map((a) => {
            const tip =
              pickAchievementBadgeName(a, lng) || pickAchievementName(a, lng) || ''
            const img =
              a.badgeImage && !String(a.badgeImage).startsWith('blob:')
                ? String(a.badgeImage)
                : ''
            const icon = String(a.badgeIcon || '').trim() || 'military_tech'
            return (
              <li key={a.id}>
                <Link
                  to={ROUTES.ACHIEVEMENTS}
                  title={tip}
                  aria-label={tip}
                  className="group flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-slate-900/80 text-amber-200 shadow-md ring-2 ring-transparent transition-all hover:border-amber-300 hover:ring-amber-400/30 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      className="size-9 rounded-full object-cover border border-amber-400/30"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[26px] leading-none group-hover:scale-110 transition-transform">
                      {icon}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <Link
        to={ROUTES.ACHIEVEMENTS}
        className="mt-4 flex w-full items-center justify-center py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors"
      >
        {t('profile.seeAllBadges')}
      </Link>
    </div>
  )
}
