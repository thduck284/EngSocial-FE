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
        className={`rounded-xl border border-slate-800/80 bg-slate-950/60 px-4 py-8 text-center text-sm text-slate-400 ${maxHeightClass}`}
      >
        {t?.('achievementsPage.emptyList')}
      </div>
    )
  }

  return (
    <div
      className={`space-y-2 ${maxHeightClass} overflow-y-auto pr-1 custom-scroll-thin`}
    >
      {(items || []).map((a) => {
        const prog = getAchievementProgressState(a, t)
        return (
        <button
          key={a.id}
          type="button"
          onClick={() => onSelect(a.id)}
          className={`w-full text-left px-3 py-2.5 rounded-xl border flex flex-col gap-2 backdrop-blur transition-all duration-150 ${
            activeId === a.id
              ? 'border-emerald-400/70 bg-emerald-500/15 shadow-[0_0_25px_rgba(52,211,153,0.55)] scale-[1.01]'
              : 'border-slate-800 bg-slate-900/70 hover:border-slate-500/80 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-3 w-full min-w-0">
            <span className="material-symbols-outlined text-xl text-emerald-300 shrink-0">
              {a.icon || 'emoji_events'}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-50 truncate">
                {pickAchievementName(a, lng)}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {getAchievementHowToPreview(a, lng, t)}
              </div>
            </div>
            <span
              className={`shrink-0 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border ${
                RARITY_CLASS[a.rarity] || RARITY_CLASS.common
              }`}
            >
              {t?.(`achievementsPage.rarity.${a.rarity}`, {
                defaultValue: a.rarity,
              })}
            </span>
          </div>
          {prog.show ? (
            <div className="w-full min-w-0 flex flex-col gap-1.5">
              <div className="flex w-full min-w-0 justify-between items-baseline gap-2 text-[10px] text-slate-300 leading-none">
                <span className="tabular-nums truncate">
                  {t?.('achievementsPage.progressFraction', {
                    current: prog.current,
                    goal: prog.goal,
                    defaultValue: `${prog.current} / ${prog.goal}`,
                  })}
                </span>
                {prog.completed ? (
                  <span className="text-emerald-400 font-semibold inline-flex items-center gap-0.5 shrink-0 leading-none">
                    <span className="material-symbols-outlined text-[14px] leading-none">
                      check_circle
                    </span>
                    {t?.('achievementsPage.progressComplete', {
                      defaultValue: 'Xong',
                    })}
                  </span>
                ) : null}
              </div>
              <div
                className="relative h-2.5 w-full min-w-0 overflow-hidden rounded-full bg-slate-800 ring-1 ring-inset ring-slate-950/70"
                role="progressbar"
                aria-valuenow={prog.rawProgress}
                aria-valuemin={0}
                aria-valuemax={prog.goal}
              >
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-[width] duration-300 ease-out"
                  style={{
                    width: `${prog.percent}%`,
                    minWidth: prog.percent > 0 ? '4px' : undefined,
                  }}
                />
              </div>
              {prog.milestonesLine ? (
                <p className="text-[10px] text-slate-500 leading-snug tabular-nums">
                  {prog.milestonesLine}
                </p>
              ) : null}
            </div>
          ) : null}
        </button>
        )
      })}
    </div>
  )
}

