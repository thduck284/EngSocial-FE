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
  maxHeightClass = 'max-h-[260px]',
}) {
  const { i18n } = useTranslation()
  const lng = i18n.language

  if (!(items || []).length) {
    return (
      <div
        className="rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-border-dark bg-slate-50/50 dark:bg-background-dark/30 px-10 py-16 text-center shadow-inner"
      >
        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-gray-600 mb-4">emoji_events</span>
        <div className="text-sm font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
          {t?.('achievementsPage.emptyList') || 'No achievements yet'}
        </div>
      </div>
    )
  }

  return (
    <div
      className="space-y-2.5 h-full overflow-y-auto pr-2 custom-scrollbar no-scrollbar"
    >
      {(items || []).map((a) => {
        const prog = getAchievementProgressState(a, t)
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            className={`w-full text-left p-3 rounded-2xl border-2 transition-all duration-300 relative group/item overflow-hidden ${activeId === a.id
                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10 scale-[1.01] z-10'
                : 'border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-background-dark/50 hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 hover:shadow-md'
              }`}
          >
            <div className="flex items-center gap-3.5 w-full min-w-0 relative z-10">
              <div className="shrink-0 relative">
                {a.unlocked && (a.badgeImage || a.badgeIcon) ? (
                  a.badgeImage ? (
                    <img
                      src={a.badgeImage}
                      alt=""
                      className="size-9 rounded-xl object-cover border-2 border-amber-400/30 shadow-md"
                    />
                  ) : (
                    <div className="size-9 rounded-xl bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
                      <span className="material-symbols-outlined text-lg text-amber-500 dark:text-amber-400">
                        {a.badgeIcon || 'military_tech'}
                      </span>
                    </div>
                  )
                ) : (
                  <div className="size-9 rounded-xl bg-slate-200 dark:bg-white/5 flex items-center justify-center border border-slate-300 dark:border-white/10">
                    <span className="material-symbols-outlined text-lg text-slate-400 dark:text-gray-600">
                      {a.icon || 'emoji_events'}
                    </span>
                  </div>
                )}
                {a.unlocked && (
                  <div className="absolute -right-1.5 -top-1.5 size-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-card-dark text-white shadow-md animate-in zoom-in duration-300">
                    <span className="material-symbols-outlined text-[10px] font-black">check</span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className={`text-sm font-bold uppercase tracking-tight truncate ${activeId === a.id ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                  {pickAchievementName(a, lng)}
                </div>
                <div className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest truncate mt-0.5">
                  {getAchievementHowToPreview(a, lng, t)}
                </div>
              </div>

              <span
                className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg border-2 ${activeId === a.id ? 'border-primary/20 bg-primary/5 text-primary' : (RARITY_CLASS[(a.rarity || 'common').toLowerCase()] || RARITY_CLASS.common)} shadow-sm`}
              >
                {t?.(`achievementsPage.rarity.${a.rarity}`, {
                  defaultValue: a.rarity,
                })}
              </span>
            </div>

            {prog.show && (
              <div className="w-full min-w-0 flex flex-col gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-white/5 relative z-10">
                <div className="flex w-full min-w-0 justify-between items-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500">
                  <span className="tabular-nums">
                    {t?.('achievementsPage.progressFraction', {
                      current: prog.current,
                      goal: prog.goal,
                      defaultValue: `${prog.current} / ${prog.goal}`,
                    })}
                  </span>
                  {prog.completed ? (
                    <span className="text-emerald-500 font-bold inline-flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      {t?.('achievementsPage.progressComplete', { defaultValue: 'DONE' })}
                    </span>
                  ) : (
                    <span className="text-slate-500 font-bold">{Math.round(prog.percent)}%</span>
                  )}
                </div>
                <div
                  className="relative h-2.5 w-full min-w-0 overflow-hidden rounded-full bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-white/5 p-0.5 shadow-inner"
                  role="progressbar"
                  aria-valuenow={prog.rawProgress}
                  aria-valuemin={0}
                  aria-valuemax={prog.goal}
                >
                  <div
                    className={`absolute left-0.5 top-0.5 bottom-0.5 rounded-full transition-all duration-700 ease-out shadow-md ${prog.completed ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-primary shadow-primary/40'}`}
                    style={{
                      width: `calc(${prog.percent}% - 4px)`,
                      minWidth: prog.percent > 0 ? '6px' : undefined,
                    }}
                  />
                </div>
                {prog.milestonesLine && (
                  <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 tracking-widest uppercase italic">
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

