import { useTranslation } from 'react-i18next'

export function WordScrambleMatching({ onCancel }) {
  const { t } = useTranslation()

  return (
    <div className="ws-matching flex flex-col items-center justify-center p-4">
      <div className="ws-matching__container">
        <div className="ws-matching__spinner" />
        <div className="ws-matching__spinner ws-matching__spinner--inner" />
        <div className="ws-matching__orb" />
      </div>
      
      <div className="ws-matching__text mt-8 text-center">
        <h2 className="ws-matching__title ws-hero-gradient">
          {t('enter.game.matchingTitle')}
        </h2>
        <p className="ws-matching__status">
          {t('enter.game.matchingStatus')}
        </p>

        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="ws-chip-btn mt-6 opacity-70 hover:opacity-100 transition-opacity"
          >
            {t('enter.game.cancelMatching') || 'Hủy tìm trận'}
          </button>
        )}
      </div>

      <div className="mt-8 flex gap-2">
        <span className="size-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="size-2 rounded-full bg-fuchsia-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="size-2 rounded-full bg-pink-400 animate-bounce" />
      </div>
    </div>
  )
}
