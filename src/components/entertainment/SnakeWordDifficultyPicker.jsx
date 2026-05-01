import { useTranslation } from 'react-i18next'

/** @param {{ onSelect: (d: 'easy' | 'medium' | 'hard') => void, onBack: () => void, backLabelKey?: string }} props */
export function SnakeWordDifficultyPicker({
  onSelect,
  onBack,
  backLabelKey = 'enter.game.backPickMode',
}) {
  const { t } = useTranslation()
  const levels = ['easy', 'medium', 'hard']
  const delays = ['60ms', '160ms', '260ms']
  const icons = {
    easy: 'sentiment_satisfied',
    medium: 'balance',
    hard: 'local_fire_department',
  }
  const iconColors = {
    easy: 'text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.45)]',
    medium: 'text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]',
    hard: 'text-rose-400 drop-shadow-[0_0_12px_rgba(251,113,133,0.5)]',
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 justify-center gap-6 py-4">
      <button type="button" onClick={onBack} className="ws-link-back self-start px-1 mb-1">
        <span className="material-symbols-outlined text-xl">arrow_back</span>
        {t(backLabelKey)}
      </button>
      <div className="text-center space-y-2 px-2">
        <h2 className="ws-font-display ws-hero-gradient text-2xl sm:text-4xl font-bold">{t('enter.game.pickDiffTitle')}</h2>
        <p className="text-sm text-slate-400/90 max-w-lg mx-auto">{t('enter.game.pickDiffHint')}</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 max-w-5xl mx-auto w-full px-1">
        {levels.map((id, idx) => (
          <button
            key={id}
            type="button"
            className="ws-choice-card"
            style={{ animationDelay: delays[idx] }}
            onClick={() => onSelect(id)}
          >
            <span className={`material-symbols-outlined text-5xl ${iconColors[id]}`}>{icons[id]}</span>
            <span className="ws-font-display text-lg text-white font-bold">
              {t(`enter.game.diff${id.charAt(0).toUpperCase() + id.slice(1)}Title`)}
            </span>
            <span className="text-sm text-slate-400 leading-snug">
              {t(`enter.game.diff${id.charAt(0).toUpperCase() + id.slice(1)}Desc`)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
