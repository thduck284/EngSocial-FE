import { useTranslation } from 'react-i18next'

/** @param {{ onSelect: (mode: 'solo' | 'multi') => void }} props */
export function WordScrambleModePicker({ onSelect }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col flex-1 min-h-0 justify-center gap-8 py-4 ws-fade-rise">
      <div className="text-center space-y-2 px-2">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-cyan-300/80 ws-subtle-pulse">
          Word Scramble Arena
        </p>
        <h2 className="ws-font-display ws-hero-gradient text-2xl sm:text-4xl font-bold leading-tight">
          {t('enter.game.pickModeTitle')}
        </h2>
        <p className="text-sm text-slate-400/90 max-w-md mx-auto leading-relaxed">{t('enter.game.pickModeHint')}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto w-full px-1">
        <button
          type="button"
          className="ws-choice-card"
          style={{ animationDelay: '90ms' }}
          onClick={() => onSelect('solo')}
        >
          <span className="material-symbols-outlined text-5xl text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
            person
          </span>
          <span className="ws-font-display text-xl text-white font-bold tracking-wide">{t('enter.game.modeSoloTitle')}</span>
          <span className="text-sm text-slate-400 leading-snug">{t('enter.game.modeSoloDesc')}</span>
        </button>
        <button
          type="button"
          className="ws-choice-card"
          style={{ animationDelay: '200ms' }}
          onClick={() => onSelect('multi')}
        >
          <span className="material-symbols-outlined text-5xl text-fuchsia-300 drop-shadow-[0_0_12px_rgba(217,70,239,0.45)]">
            groups
          </span>
          <span className="ws-font-display text-xl text-white font-bold tracking-wide">{t('enter.game.modeMultiTitle')}</span>
          <span className="text-sm text-slate-400 leading-snug">{t('enter.game.modeMultiDesc')}</span>
        </button>
      </div>
    </div>
  )
}
