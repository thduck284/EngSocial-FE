import { RARITY_CLASS } from '../../utils/rarityStyles'

export function AchievementsList({
  t,
  items,
  activeId,
  onSelect,
  maxHeightClass = 'max-h-[260px]',
}) {
  return (
    <div
      className={`space-y-2 ${maxHeightClass} overflow-y-auto pr-1 custom-scroll-thin`}
    >
      {(items || []).map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onSelect(a.id)}
          className={`w-full text-left px-3 py-2.5 rounded-xl border flex items-center gap-3 backdrop-blur transition-all duration-150 ${
            activeId === a.id
              ? 'border-emerald-400/70 bg-emerald-500/15 shadow-[0_0_25px_rgba(52,211,153,0.55)] scale-[1.01]'
              : 'border-slate-800 bg-slate-900/70 hover:border-slate-500/80 hover:bg-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-xl text-emerald-300">
            {a.icon || 'emoji_events'}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-50 truncate">
              {a.name}
            </div>
            <div className="text-[11px] text-slate-400 truncate">{a.howTo}</div>
          </div>
          <span
            className={`ml-auto text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border ${
              RARITY_CLASS[a.rarity] || RARITY_CLASS.common
            }`}
          >
            {t?.(`achievementsPage.rarity.${a.rarity}`, {
              defaultValue: a.rarity,
            })}
          </span>
        </button>
      ))}
    </div>
  )
}

