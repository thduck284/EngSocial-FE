import { useTranslation } from 'react-i18next'
import { RARITY_CLASS } from '../../utils/rarityStyles'
import {
  getAchievementHowToPreview,
  getAchievementProgressState,
  pickAchievementBadgeName,
  pickAchievementName,
} from '../../utils/achievementI18n.js'

export function AchievementDetails({
  t,
  achievement,
  category,
  onGoToLink,
  onEdit,
  onDelete,
  canManage = false,
}) {
  const { i18n, t: tHook } = useTranslation()
  const lng = i18n.language
  const tr = typeof t === 'function' ? t : tHook
  const prog = achievement ? getAchievementProgressState(achievement, tr) : { show: false }
  if (!achievement) {
    if (category?.title) {
      const empty = !(category.items && category.items.length)
      return (
        <div className="space-y-4 h-full flex flex-col justify-center items-center text-center px-6 animate-in fade-in duration-500">
          <div className="size-16 bg-slate-50 dark:bg-card-dark rounded-full flex items-center justify-center border border-dashed border-slate-200 dark:border-border-dark mb-4">
            <span className="material-symbols-outlined text-3xl text-slate-200 dark:text-gray-700">emoji_events</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              {category.title}
            </h3>
            {category.description ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto italic">
                &quot;{category.description}&quot;
              </p>
            ) : null}
          </div>
          <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10 text-primary font-bold text-xs">
            {empty && (t?.('achievementsPage.emptyCategory') || 'No achievements in this category yet.')}
          </div>
        </div>
      )
    }
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-gray-600 text-xs animate-in fade-in duration-500">
        <span className="material-symbols-outlined text-4xl mb-3 opacity-20">ads_click</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-border-dark relative">
        <div className="size-12 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark flex items-center justify-center shadow-sm shrink-0 relative overflow-hidden group">
          {achievement.unlocked && (achievement.badgeImage || achievement.badgeIcon) ? (
            achievement.badgeImage ? (
              <img
                src={achievement.badgeImage}
                alt=""
                className="w-full h-full object-cover relative z-10 transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <span className="material-symbols-outlined text-3xl text-amber-500 dark:text-amber-400 relative z-10">
                {achievement.badgeIcon || 'military_tech'}
              </span>
            )
          ) : (
            <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-gray-700 relative z-10">
              {achievement.icon || 'emoji_events'}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap gap-2">
             <span className="inline-flex items-center rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark px-2.5 py-0.5 text-[10px] font-bold text-slate-500 dark:text-gray-400">
              {t?.('achievementsPage.rarityLabel', { defaultValue: 'Rarity' })}
              :{' '}
              <span className={`ml-1.5 ${RARITY_CLASS[(achievement.rarity || 'common').toLowerCase()] || 'text-slate-900 dark:text-white'}`}>
                {t?.(`achievementsPage.rarity.${achievement.rarity}`, {
                  defaultValue: achievement.rarity,
                })}
              </span>
            </span>
            {achievement.unlocked && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                {t?.('achievementsPage.progressComplete', { defaultValue: 'Unlocked' })}
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
            {pickAchievementName(achievement, lng)}
          </h3>
        </div>

        {!achievement.link?.to && (
          <div className="sm:absolute top-0 right-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-[10px] font-bold text-slate-400 dark:text-gray-600 mt-2 sm:mt-0">
            <span className="material-symbols-outlined text-[12px]">info</span>
            {t?.('achievementsPage.noGuide', { defaultValue: 'No guide available' })}
          </div>
        )}
      </div>

      {/* Progress Card */}
      {prog.show && (
        <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark/40 p-4 w-full min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary">analytics</span>
              {t?.('achievementsPage.progressTitle', { defaultValue: 'Challenge progress' })}
            </h4>
            {prog.completed && (
              <div className="text-emerald-500 font-bold inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {tr?.('achievementsPage.progressComplete', { defaultValue: 'Completed' })}
              </div>
            )}
          </div>
          
          <div className="flex w-full min-w-0 flex-col gap-1.5">
            <div className="flex w-full min-w-0 justify-between items-baseline gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <span className="tabular-nums">
                {tr?.('achievementsPage.progressFraction', {
                  current: prog.current,
                  goal: prog.goal,
                  defaultValue: `${prog.current} / ${prog.goal}`,
                })}
              </span>
              <span className="text-primary">{Math.round(prog.percent)}%</span>
            </div>
            <div
              className="relative h-1.5 w-full min-w-0 overflow-hidden rounded-full bg-slate-200 dark:bg-background-dark border border-slate-200 dark:border-border-dark"
              role="progressbar"
              aria-valuenow={prog.rawProgress}
              aria-valuemin={0}
              aria-valuemax={prog.goal}
            >
              <div
                className={`absolute left-0 top-0 bottom-0 rounded-full transition-all duration-700 ease-out ${prog.completed ? 'bg-emerald-500' : 'bg-primary'}`}
                style={{
                  width: `${prog.percent}%`,
                  minWidth: prog.percent > 0 ? '4px' : undefined,
                }}
              />
            </div>
            {prog.milestonesLine && (
              <p className="text-[10px] text-slate-400 dark:text-gray-500 italic flex items-center gap-1.5">
                <span className="size-1 rounded-full bg-primary" />
                {prog.milestonesLine}
              </p>
            )}
          </div>
        </div>
      )}

      {/* How to Complete Card */}
      <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark p-4 shadow-sm">
        <h4 className="text-xs font-bold text-slate-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-primary">auto_stories</span>
          {t?.('achievementsPage.howTo', { defaultValue: 'How to complete' })}
        </h4>
        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-background-dark/30 p-4 rounded-xl border border-slate-100 dark:border-border-dark italic">
          &quot;{getAchievementHowToPreview(achievement, lng, t)}&quot;
        </p>
      </div>

      {/* Rewards Section */}
      <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark p-4 shadow-sm">
        <h4 className="text-xs font-bold text-slate-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-amber-500">card_giftcard</span>
          {t?.('achievementsPage.rewardsTitle', { defaultValue: 'Rewards' })}
        </h4>

        {/* Per-milestone rewards breakdown */}
        {Array.isArray(achievement.requirement?.milestones) && achievement.requirement.milestones.length > 0 ? (
          <ul className="space-y-3">
            {achievement.requirement.milestones
              .slice()
              .sort((a, b) => Number(a.value) - Number(b.value))
              .map((m) => {
                const mVal = Number(m.value)
                const reached = (achievement.progress ?? 0) >= mVal
                const rt = m.rewardType || 'exp'
                const xp = Number(m.xpReward || 0)
                const badgeName = lng && !String(lng).toLowerCase().startsWith('en')
                  ? (m.badgeName || m.badgeNameEn || '')
                  : (m.badgeNameEn || m.badgeName || '')
                const label = lng && !String(lng).toLowerCase().startsWith('en')
                  ? (m.vi || m.en || '')
                  : (m.en || m.vi || '')
                return (
                  <li
                    key={mVal}
                    className={`rounded-xl border px-3 py-2.5 flex items-start gap-3 transition-colors ${
                      reached
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark/30'
                    }`}
                  >
                    <div className={`size-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${reached ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-border-dark text-slate-300 dark:text-gray-700'}`}>
                      <span className="material-symbols-outlined text-base">
                        {reached ? 'done_all' : 'lock'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${reached ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-gray-500'}`}>
                        {label || `${mVal} ${achievement.requirement?.type?.replace(/_/g, ' ') || ''}`}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {(rt === 'exp' || rt === 'both') && xp > 0 && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border flex items-center gap-1 ${reached ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-border-dark text-slate-400 dark:text-gray-600'}`}>
                            <span className="material-symbols-outlined text-xs">bolt</span>
                            +{xp} XP
                          </span>
                        )}
                        {(rt === 'badge' || rt === 'both') && badgeName && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border flex items-center gap-1 ${reached ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-border-dark text-slate-400 dark:text-gray-600'}`}>
                            <span className="material-symbols-outlined text-sm">
                              {m.badgeIcon || 'military_tech'}
                            </span>
                            {badgeName}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
          </ul>
        ) : (
          /* Fallback: flat rewards list */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(achievement.rewards || []).slice(0, 5).map((r) => (
              <div key={r} className="flex items-center gap-2 bg-slate-50 dark:bg-background-dark/30 p-2.5 rounded-lg border border-slate-100 dark:border-border-dark">
                <span className="material-symbols-outlined text-emerald-500 bg-emerald-500/10 p-1 rounded-md text-sm">verified</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{r}</span>
              </div>
            ))}
            {!(achievement.rewards?.length) && (
              <div className="col-span-full py-4 text-center bg-slate-50 dark:bg-background-dark/30 rounded-xl border border-dashed border-slate-200 dark:border-border-dark text-xs text-slate-400 dark:text-gray-600">
                {t?.('achievementsPage.noRewards', { defaultValue: 'No specific rewards data available' })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {achievement.link?.to && (
          <button
            type="button"
            onClick={() => onGoToLink?.(achievement.link)}
            className="w-full rounded-lg bg-primary hover:brightness-110 px-4 py-2.5 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 group"
          >
            {achievement.link?.label || t?.('buttons.next', { defaultValue: 'Go to Action' })}
            <span className="material-symbols-outlined text-base group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </button>
        )}

        {canManage && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(achievement)}
              className="w-full rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-400/20 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">edit_note</span>
              {t?.('achievementsPage.edit', { defaultValue: 'Edit' })}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="w-full rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-400/20 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">delete_forever</span>
              {t?.('achievementsPage.delete', { defaultValue: 'Remove' })}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

