import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../components/ui/common/LanguageSwitcher'
import { useVerifyEmail } from '../hooks'
import { ROUTES } from '../constants'

const inputBase = 'w-full bg-slate-800/50 border text-white rounded-xl pl-10 pr-4 py-3 focus:ring-0 input-glow transition-all placeholder-slate-600'
const inputError = 'border-red-500/50'
const inputNormal = 'border-slate-700 focus:border-primary'

export function VerifyEmailPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const emailFromQuery = searchParams.get('email') || ''
  const {
    email,
    setEmail,
    loading,
    resendLoading,
    error,
    success,
    resent,
    fieldErrors,
    verifyWithToken,
    handleResend,
  } = useVerifyEmail(token, emailFromQuery, t)

  useEffect(() => {
    if (token) verifyWithToken(token)
  }, [token, verifyWithToken])

  if (token && loading) {
    return (
      <div className="bg-textured text-slate-100 min-h-screen flex items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>
        <div className="max-w-md w-full bg-card-dark rounded-2xl overflow-hidden shadow-2xl border border-slate-800 p-8 md:p-12 text-center">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl mb-4">progress_activity</span>
          <p className="text-slate-400">{t('verifyEmail.verifying')}</p>
        </div>
      </div>
    )
  }

  if (token && success) {
    return (
      <div className="bg-textured text-slate-100 min-h-screen flex items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>
        <div className="max-w-md w-full bg-card-dark rounded-2xl overflow-hidden shadow-2xl border border-slate-800 p-8 md:p-12 text-center">
          <div className="rounded-xl bg-primary/10 border border-primary/30 text-primary px-4 py-3 text-sm mb-6">
            {t('verifyEmail.success')}
          </div>
          <p className="text-slate-400 text-sm">{t('verifyEmail.redirecting')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-textured text-slate-100 min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      <div className="max-w-md w-full bg-card-dark rounded-2xl overflow-hidden shadow-2xl border border-slate-800 p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 text-primary mb-4">
            <span className="material-symbols-outlined text-3xl">mark_email_unread</span>
          </div>
          <h2 className="text-2xl font-bold mb-3">{t('verifyEmail.title')}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{t('verifyEmail.description')}</p>
        </div>

        {token && error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {resent && (
          <div className="rounded-xl bg-primary/10 border border-primary/30 text-primary px-4 py-3 text-sm mb-6">
            {t('verifyEmail.resent')}
          </div>
        )}

        {!resent && (
          <form className="space-y-6" onSubmit={handleResend}>
            {error && !token && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2" htmlFor="email">
                {t('verifyEmail.yourEmail')}
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-3 text-slate-500 group-focus-within:text-primary transition-colors text-xl">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder={t('verifyEmail.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={resendLoading}
                  className={`${inputBase} ${fieldErrors.email ? inputError : inputNormal}`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 text-sm text-red-400">{fieldErrors.email}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={resendLoading}
              className="w-full py-3.5 bg-primary hover:brightness-110 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-primary/20 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resendLoading ? t('auth.processing') : t('verifyEmail.resend')}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-primary font-medium transition-colors group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            {t('verifyEmail.backToLogin')}
          </Link>
        </div>
      </div>
      <div className="fixed -top-20 -left-20 size-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed -bottom-20 -right-20 size-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  )
}
