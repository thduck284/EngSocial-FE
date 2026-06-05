import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants'

export function GuestAuthModal({ open, onClose }) {
  const { t } = useTranslation()
  const location = useLocation()

  if (!open) return null

  const authState = { from: location }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-card-dark rounded-3xl shadow-2xl w-full max-w-md p-8 border border-slate-200 dark:border-border-dark animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-3xl text-primary">lock</span>
          <h3 className="text-slate-900 dark:text-white text-xl font-black tracking-tight">
            {t('auth.guest.modalTitle')}
          </h3>
        </div>
        <p className="text-slate-500 dark:text-gray-400 text-sm mb-8 leading-relaxed font-medium">
          {t('auth.guest.modalMessage')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={ROUTES.LOGIN}
            state={authState}
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl bg-primary text-white hover:brightness-110 text-sm font-bold text-center shadow-lg shadow-primary/25 transition-all"
          >
            {t('auth.login')}
          </Link>
          <Link
            to={ROUTES.REGISTER}
            state={authState}
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 text-sm font-bold text-center transition-all"
          >
            {t('auth.register')}
          </Link>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          {t('auth.guest.close')}
        </button>
      </div>
    </div>
  )
}
