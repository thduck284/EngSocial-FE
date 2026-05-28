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
        <div className="space-y-6 h-full flex flex-col justify-center items-center text-center px-8 animate-in fade-in duration-500">
          <div className="size-24 bg-slate-50 dark:bg-card-dark rounded-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-border-dark shadow-inner mb-6">
            <span className="material-symbols-outlined text-4xl text-slate-200 dark:text-gray-700">emoji_events</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2">
              {category.title}
            </h3>
            {category.description ? (
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto italic">
                &quot;{category.description}&quot;
              </p>
            ) : null}
          </div>
          <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 text-primary font-bold text-[10px] uppercase tracking-widest shadow-sm">
            {empty && (t?.('achievementsPage.emptyCategory') || 'No achievements in this category yet.')}
          </div>
        </div>
      )
    }
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-gray-600 font-bold text-[11px] uppercase tracking-[0.2em] animate-in fade-in duration-500">
        <span className="material-symbols-outlined text-5xl mb-4 opacity-20">ads_click</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-5 border-b border-slate-100 dark:border-white/5 relative">
        <div className="size-16 rounded-2xl bg-white dark:bg-card-dark border-2 border-slate-200 dark:border-white/10 flex items-center justify-center shadow-xl shadow-slate-200/50 dark:shadow-none shrink-0 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-transparent to-transparent opacity-50" />
          {achievement.unlocked && (achievement.badgeImage || achievement.badgeIcon) ? (
            achievement.badgeImage ? (
              <img
                src={achievement.badgeImage}
                alt=""
                className="w-full h-full object-cover relative z-10 transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <span className="material-symbols-outlined text-4xl text-amber-500 dark:text-amber-400 relative z-10 drop-shadow-lg">
                {achievement.badgeIcon || 'military_tech'}
              </span>
            )
          ) : (
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-gray-700 relative z-10">
              {achievement.icon || 'emoji_events'}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2.5">
             <span className="inline-flex items-center rounded-lg bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 shadow-inner">
              {t?.('achievementsPage.rarityLabel', { defaultValue: 'Rarity' })}
              :{' '}
              <span className={`ml-2 ${RARITY_CLASS[(achievement.rarity || 'common').toLowerCase()] || 'text-slate-900 dark:text-white'}`}>
                {t?.(`achievementsPage.rarity.${achievement.rarity}`, {
                  defaultValue: achievement.rarity,
                })}
              </span>
            </span>
            {achievement.unlocked && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500 shadow-sm">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                {t?.('achievementsPage.progressComplete', { defaultValue: 'UNLOCKED' })}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight uppercase leading-tight">
            {pickAchievementName(achievement, lng)}
          </h3>
        </div>

        {!achievement.link?.to && (
          <div className="sm:absolute top-0 right-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600 shadow-inner mt-2 sm:mt-0">
            <span className="material-symbols-outlined text-[14px]">info</span>
            {t?.('achievementsPage.noGuide', { defaultValue: 'NO GUIDE AVAILABLE' })}
          </div>
        )}
      </div>

      {/* Progress Card */}
      {prog.show && (
        <div className="rounded-[1.5rem] border border-slate-200 dark:border-border-dark bg-slate-50/50 dark:bg-background-dark/40 p-4 w-full min-w-0 shadow-inner relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 size-32 bg-primary/5 rounded-full blur-3xl" />
          <div className="flex items-center justify-between mb-5 relative z-10">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-primary">analytics</span>
              {t?.('achievementsPage.progressTitle', { defaultValue: 'CHALLENGE PROGRESS' })}
            </h4>
            {prog.completed && (
              <div className="text-emerald-500 font-bold inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest bg-white dark:bg-card-dark px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-lg relative z-10">
                <span className="material-symbols-outlined text-base">check_circle</span>
                {tr?.('achievementsPage.progressComplete', { defaultValue: 'MISSION COMPLETED' })}
              </div>
            )}
          </div>
          
          <div className="flex w-full min-w-0 flex-col gap-2 relative z-10">
            <div className="flex w-full min-w-0 justify-between items-baseline gap-2 text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
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
              className="relative h-3 w-full min-w-0 overflow-hidden rounded-full bg-slate-200 dark:bg-background-dark border border-slate-100 dark:border-white/5 p-0.5 shadow-inner"
              role="progressbar"
              aria-valuenow={prog.rawProgress}
              aria-valuemin={0}
              aria-valuemax={prog.goal}
            >
              <div
                className={`absolute left-0.5 top-0.5 bottom-0.5 rounded-full transition-all duration-1000 ease-out shadow-lg ${prog.completed ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-primary shadow-primary/40'}`}
                style={{
                  width: `calc(${prog.percent}% - 4px)`,
                  minWidth: prog.percent > 0 ? '8px' : undefined,
                }}
              />
            </div>
            {prog.milestonesLine && (
              <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest italic flex items-center gap-2">
                <span className="size-1 rounded-full bg-primary" />
                {prog.milestonesLine}
              </p>
            )}
          </div>
        </div>
      )}

      {/* How to Complete Card */}
      <div className="rounded-[1.5rem] border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark p-4 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-primary">auto_stories</span>
          {t?.('achievementsPage.howTo', { defaultValue: 'HOW TO COMPLETE' })}
        </h4>
        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-background-dark/30 p-5 rounded-2xl border border-slate-100 dark:border-white/5 italic">
          &quot;{getAchievementHowToPreview(achievement, lng, t)}&quot;
        </p>
      </div>

      {/* Rewards Section */}
      <div className="rounded-[1.5rem] border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark p-4 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-amber-500">card_giftcard</span>
          {t?.('achievementsPage.rewardsTitle', { defaultValue: 'COLLECTIBLE REWARDS' })}
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
                    className={`rounded-xl border-2 px-4 py-3.5 flex items-start gap-4 transition-all duration-300 ${
                      reached
                        ? 'border-emerald-500/30 bg-emerald-500/5 shadow-lg shadow-emerald-500/5'
                        : 'border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-background-dark/30'
                    }`}
                  >
                    <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 border-2 transition-colors ${reached ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-300 dark:text-gray-700'}`}>
                      <span className="material-symbols-outlined text-lg font-bold">
                        {reached ? 'done_all' : 'lock'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold uppercase tracking-tight ${reached ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-gray-500'}`}>
                        {label || `${mVal} ${achievement.requirement?.type?.replace(/_/g, ' ') || ''}`}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(rt === 'exp' || rt === 'both') && xp > 0 && (
                          <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-widest border-2 flex items-center gap-1.5 ${reached ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-gray-600'}`}>
                            <span className="material-symbols-outlined text-sm">bolt</span>
                            +{xp} XP
                          </span>
                        )}
                        {(rt === 'badge' || rt === 'both') && badgeName && (
                          <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-widest border-2 flex items-center gap-1.5 ${reached ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-gray-600'}`}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(achievement.rewards || []).slice(0, 5).map((r) => (
              <div key={r} className="flex items-center gap-3 bg-slate-50 dark:bg-background-dark/30 p-3.5 rounded-xl border border-slate-100 dark:border-white/5">
                <span className="material-symbols-outlined text-emerald-500 bg-emerald-500/10 p-1.5 rounded-lg text-base">verified</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest truncate">{r}</span>
              </div>
            ))}
            {!(achievement.rewards?.length) && (
              <div className="col-span-full py-6 text-center bg-slate-50 dark:bg-background-dark/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-border-dark text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest">
                {t?.('achievementsPage.noRewards', { defaultValue: 'No specific rewards data available' })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {achievement.link?.to && (
          <button
            type="button"
            onClick={() => onGoToLink?.(achievement.link)}
            className="w-full rounded-[1.5rem] bg-primary hover:brightness-110 px-6 py-3.5 text-xs font-bold text-white uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2.5 group active:scale-95"
          >
            {achievement.link?.label || t?.('buttons.next', { defaultValue: 'Go to Action' })}
            <span className="material-symbols-outlined text-lg group-hover:translate-x-1.5 transition-transform">
              arrow_forward
            </span>
          </button>
        )}

        {canManage && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onEdit?.(achievement)}
              className="w-full rounded-[1.5rem] border border-amber-400/20 bg-amber-400/10 px-3 py-2.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest hover:bg-amber-400/20 transition-all flex items-center justify-center gap-2.5 active:scale-95 shadow-md shadow-amber-400/5"
            >
              <span className="material-symbols-outlined text-base">edit_note</span>
              {t?.('achievementsPage.edit', { defaultValue: 'EDIT' })}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="w-full rounded-[1.5rem] border border-rose-400/20 bg-rose-400/10 px-3 py-2.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest hover:bg-rose-400/20 transition-all flex items-center justify-center gap-2.5 active:scale-95 shadow-md shadow-rose-400/5"
            >
              <span className="material-symbols-outlined text-base">delete_forever</span>
              {t?.('achievementsPage.delete', { defaultValue: 'REMOVE' })}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

