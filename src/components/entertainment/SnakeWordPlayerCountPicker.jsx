import { useTranslation } from 'react-i18next'

const PLAYER_COUNTS = [2, 4, 6, 8]

/** @param {{ onSelect: (n: number) => void, onBack: () => void, backLabelKey?: string, disabled?: boolean }} props */
export function SnakeWordPlayerCountPicker({
  onSelect,
  onBack,
  backLabelKey = 'enter.game.backPickMode',
  disabled = false,
}) {
  const { t } = useTranslation()
  const counts = PLAYER_COUNTS

  return (
    <div className={`flex flex-col flex-1 min-h-0 justify-start py-4 ws-fade-rise ${disabled ? 'opacity-70 pointer-events-none' : ''}`}>
      <div className="text-center space-y-2 px-2 mt-2 sm:mt-4">
        <h2 className="ws-font-display ws-hero-gradient text-xl sm:text-3xl font-bold">{t('enter.game.pickPlayersTitle')}</h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">{t('enter.game.pickPlayersHint')}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto w-full px-1 sm:max-w-2xl mt-4 sm:mt-8">
        {counts.map((n, idx) => (
          <button
            key={n}
            type="button"
            className="ws-choice-card py-6 sm:py-8"
            style={{ animationDelay: `${60 + idx * 45}ms` }}
            onClick={() => onSelect(n)}
            disabled={disabled}
          >
            <span className="material-symbols-outlined text-4xl sm:text-5xl text-fuchsia-300 drop-shadow-[0_0_12px_rgba(217,70,239,0.45)]">
              groups
            </span>
            <span className="ws-font-display text-2xl sm:text-3xl text-white font-bold tracking-wide">{n}</span>
            <span className="text-xs sm:text-sm text-slate-400">{t('enter.game.playersUnit')}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
