import { useTranslation } from 'react-i18next'

const PLAYER_COUNTS = [2, 4, 6, 8]

/** @param {{ onSelect: (n: number) => void, onBack: () => void, backLabelKey?: string }} props */
export function WordScramblePlayerCountPicker({
  onSelect,
  onBack,
  backLabelKey = 'enter.game.backPickMode',
}) {
  const { t } = useTranslation()
  const counts = PLAYER_COUNTS

  return (
    <div className="flex flex-col flex-1 min-h-0 justify-center gap-6 py-4">
      <button type="button" onClick={onBack} className="ws-link-back self-start px-1 mb-1">
        <span className="material-symbols-outlined text-xl">arrow_back</span>
        {t(backLabelKey)}
      </button>
      <div className="text-center space-y-2 px-2">
        <h2 className="ws-font-display ws-hero-gradient text-2xl sm:text-4xl font-bold">{t('enter.game.pickPlayersTitle')}</h2>
        <p className="text-sm text-slate-400/90 max-w-lg mx-auto leading-relaxed">{t('enter.game.pickPlayersHint')}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto w-full px-1 sm:max-w-2xl">
        {counts.map((n, idx) => (
          <button
            key={n}
            type="button"
            className="ws-choice-card py-6 sm:py-8"
            style={{ animationDelay: `${60 + idx * 45}ms` }}
            onClick={() => onSelect(n)}
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
