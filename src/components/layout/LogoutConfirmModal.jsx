import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

/**
 * @param {{ open: boolean, onCancel: () => void, onConfirm: () => void }} props
 */
export function LogoutConfirmModal({ open, onCancel, onConfirm }) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border-dark bg-card-dark shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="logout-confirm-title" className="text-lg font-bold text-white mb-2">
          {t('header.logoutConfirmTitle')}
        </h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">{t('header.logoutConfirmMessage')}</p>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-border-dark text-sm font-semibold text-gray-300 hover:bg-white/5 transition-colors"
          >
            {t('header.logoutConfirmCancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl bg-red-500/15 border border-red-500/35 text-sm font-bold text-red-400 hover:bg-red-500/25 transition-colors"
          >
            {t('header.logout')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
