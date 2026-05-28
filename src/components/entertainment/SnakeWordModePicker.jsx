import { useTranslation } from 'react-i18next'

/** @param {{ onSelect: (mode: 'solo' | 'multi-quick' | 'multi-private') => void }} props */
export function SnakeWordModePicker({ onSelect }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col flex-1 min-h-0 justify-center gap-8 py-4 ws-fade-rise">
      <div className="text-center space-y-2 px-2">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-cyan-300/80 ws-subtle-pulse">
          Snake Word Arena
        </p>
        <h2 className="ws-font-display ws-hero-gradient text-2xl sm:text-4xl font-bold leading-tight">
          {t('enter.game.pickModeTitle')}
        </h2>
        <p className="text-sm text-slate-400/90 max-w-lg mx-auto leading-relaxed">{t('enter.game.pickModeHint')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto w-full px-1">
        {/* SOLO MODE */}
        <button
          type="button"
          className="ws-choice-card"
          style={{ animationDelay: '90ms' }}
          onClick={() => onSelect('solo')}
        >
          <span className="material-symbols-outlined text-5xl text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
            person
          </span>
          <h3 className="ws-font-display text-xl text-white font-bold tracking-wide">{t('enter.game.modeSoloTitle')}</h3>
          <p className="text-sm text-slate-400 leading-snug">{t('enter.game.modeSoloDesc')}</p>
        </button>

        {/* QUICK MATCH (AI) */}
        <button
          type="button"
          className="ws-choice-card border-fuchsia-500/20 hover:border-fuchsia-400/40"
          style={{ animationDelay: '200ms' }}
          onClick={() => onSelect('multi-quick')}
        >
          <span className="material-symbols-outlined text-5xl text-fuchsia-300 drop-shadow-[0_0_12px_rgba(217,70,239,0.45)]">
            bolt
          </span>
          <h3 className="ws-font-display text-xl text-white font-bold tracking-wide">{t('enter.game.modeQuickTitle')}</h3>
          <p className="text-sm text-slate-400 leading-snug">{t('enter.game.modeQuickDesc')}</p>
          <span className="absolute -top-2 -right-2 bg-fuchsia-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold shadow-lg shadow-fuchsia-500/20">
            AI MATCH
          </span>
        </button>

        {/* PRIVATE ROOM (LOBBY) */}
        <button
          type="button"
          className="ws-choice-card border-indigo-500/20 hover:border-indigo-400/40"
          style={{ animationDelay: '310ms' }}
          onClick={() => onSelect('multi-private')}
        >
          <span className="material-symbols-outlined text-5xl text-indigo-300 drop-shadow-[0_0_12px_rgba(129,140,248,0.45)]">
            meeting_room
          </span>
          <h3 className="ws-font-display text-xl text-white font-bold tracking-wide">{t('enter.game.modePrivateTitle')}</h3>
          <p className="text-sm text-slate-400 leading-snug">{t('enter.game.modePrivateDesc')}</p>
        </button>
      </div>
    </div>
  )
}
