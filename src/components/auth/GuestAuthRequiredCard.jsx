import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants'

export function GuestAuthRequiredCard() {
  const { t } = useTranslation()
  const location = useLocation()
  const authState = { from: location }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="w-full max-w-lg bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-border-dark shadow-xl p-10 text-center">
        <div className="mx-auto mb-6 size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-primary">person_add</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
          {t('auth.guest.cardTitle')}
        </h2>
        <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
          {t('auth.guest.cardMessage')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={ROUTES.LOGIN}
            state={authState}
            className="px-8 py-3 rounded-xl bg-primary text-white hover:brightness-110 text-sm font-bold shadow-lg shadow-primary/25 transition-all"
          >
            {t('auth.login')}
          </Link>
          <Link
            to={ROUTES.REGISTER}
            state={authState}
            className="px-8 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 text-sm font-bold transition-all"
          >
            {t('auth.registerNow')}
          </Link>
        </div>
      </div>
    </div>
  )
}
