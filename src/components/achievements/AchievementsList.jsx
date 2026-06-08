import { useTranslation } from 'react-i18next'
import { RARITY_CLASS } from '../../utils/rarityStyles'
import {
  getAchievementHowToPreview,
  getAchievementProgressState,
  pickAchievementName,
} from '../../utils/achievementI18n.js'

export function AchievementsList({
  t,
  items,
  activeId,
  onSelect,
}) {
  const { i18n } = useTranslation()
  const lng = i18n.language

  if (!(items || []).length) {
    return (
      <div
        className="rounded-xl border border-dashed border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark/30 px-6 py-12 text-center"
      >
        <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-gray-600 mb-3">emoji_events</span>
        <div className="text-xs font-bold text-slate-400 dark:text-gray-500">
          {t?.('achievementsPage.emptyList') || 'No achievements yet'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2.5 pb-1">
      {(items || []).map((a) => {
        const prog = getAchievementProgressState(a, t)
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            className={`w-full text-left p-3 rounded-xl border transition-all duration-200 relative group/item overflow-hidden ${activeId === a.id
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark hover:border-primary/40 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
          >
            <div className="flex items-center gap-3.5 w-full min-w-0 relative z-10">
              <div className="shrink-0 relative">
                {a.unlocked && (a.badgeImage || a.badgeIcon) ? (
                  a.badgeImage ? (
                    <img
                      src={a.badgeImage}
                      alt=""
                      className="size-8 rounded-lg object-cover border border-amber-400/30"
                    />
                  ) : (
                    <div className="size-8 rounded-lg bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
                      <span className="material-symbols-outlined text-base text-amber-500 dark:text-amber-400">
                        {a.badgeIcon || 'military_tech'}
                      </span>
                    </div>
                  )
                ) : (
                  <div className="size-8 rounded-lg bg-slate-200 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-border-dark">
                    <span className="material-symbols-outlined text-base text-slate-400 dark:text-gray-600">
                      {a.icon || 'emoji_events'}
                    </span>
                  </div>
                )}
                {a.unlocked && (
                  <div className="absolute -right-1 -top-1 size-4 bg-emerald-500 rounded-full flex items-center justify-center border border-white dark:border-card-dark text-white">
                    <span className="material-symbols-outlined text-[9px] font-bold">check</span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className={`text-xs font-bold truncate ${activeId === a.id ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                  {pickAchievementName(a, lng)}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-gray-400 truncate mt-0.5">
                  {getAchievementHowToPreview(a, lng, t)}
                </div>
              </div>

              <span
                className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-md border ${activeId === a.id ? 'border-primary/20 bg-primary/5 text-primary' : (RARITY_CLASS[(a.rarity || 'common').toLowerCase()] || RARITY_CLASS.common)}`}
              >
                {t?.(`achievementsPage.rarity.${a.rarity}`, {
                  defaultValue: a.rarity,
                })}
              </span>
            </div>

            {prog.show && (
              <div className="w-full min-w-0 flex flex-col gap-1 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-border-dark relative z-10">
                <div className="flex w-full min-w-0 justify-between items-center text-[10px] font-semibold text-slate-500 dark:text-gray-400">
                  <span className="tabular-nums">
                    {t?.('achievementsPage.progressFraction', {
                      current: prog.current,
                      goal: prog.goal,
                      defaultValue: `${prog.current} / ${prog.goal}`,
                    })}
                  </span>
                  {prog.completed ? (
                    <span className="text-emerald-500 font-bold inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      {t?.('achievementsPage.progressComplete', { defaultValue: 'DONE' })}
                    </span>
                  ) : (
                    <span className="text-slate-500 font-bold">{Math.round(prog.percent)}%</span>
                  )}
                </div>
                <div
                  className="relative h-1.5 w-full min-w-0 overflow-hidden rounded-full bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark"
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
                  <p className="text-[10px] text-slate-400 dark:text-gray-500 italic">
                    {prog.milestonesLine}
                  </p>
                )}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

