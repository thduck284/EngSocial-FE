import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher'
import { useResetPassword } from '../hooks'
import { ROUTES } from '../constants'

const inputBase = 'w-full bg-slate-800/50 border text-white rounded-xl pl-10 pr-4 py-3 focus:ring-0 input-glow transition-all placeholder-slate-600'
const inputError = 'border-red-500/50'
const inputNormal = 'border-slate-700 focus:border-primary'

export function ResetPasswordPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    loading,
    error,
    success,
    fieldErrors,
    handleSubmit,
    newPwdErr,
    confirmErr,
  } = useResetPassword(token, t)

  if (!token) {
    return (
      <div className="bg-textured text-slate-100 min-h-screen flex items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>
        <div className="max-w-md w-full bg-card-dark rounded-2xl overflow-hidden shadow-2xl border border-slate-800 p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold mb-3">{t('resetPassword.title')}</h2>
          <p className="text-slate-400 text-sm mb-6">{t('resetPassword.noToken')}</p>
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            {t('forgotPassword.title')}
          </Link>
          <div className="mt-8 pt-6 border-t border-slate-800">
            <Link to={ROUTES.LOGIN} className="text-sm text-slate-400 hover:text-primary">
              {t('resetPassword.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-textured text-slate-100 min-h-screen flex items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>
        <div className="max-w-md w-full bg-card-dark rounded-2xl overflow-hidden shadow-2xl border border-slate-800 p-8 md:p-12 text-center">
          <div className="rounded-xl bg-primary/10 border border-primary/30 text-primary px-4 py-3 text-sm mb-6">
            {t('resetPassword.success')}
          </div>
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-2 py-3 px-6 bg-primary text-slate-950 font-bold rounded-xl hover:brightness-110 transition-all"
          >
            {t('resetPassword.backToLogin')}
          </Link>
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
          <h2 className="text-2xl font-bold mb-3">{t('resetPassword.title')}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{t('resetPassword.description')}</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2" htmlFor="newPassword">
              {t('resetPassword.newPassword')}
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-500 group-focus-within:text-primary transition-colors text-xl">
                lock
              </span>
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                className={`${inputBase} ${newPwdErr ? inputError : inputNormal}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-primary"
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {fieldErrors.newPassword && (
              <p className="mt-1.5 text-sm text-red-400">{fieldErrors.newPassword}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2" htmlFor="confirmPassword">
              {t('resetPassword.confirmPassword')}
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-500 group-focus-within:text-primary transition-colors text-xl">
                lock
              </span>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className={`${inputBase} ${confirmErr ? inputError : inputNormal}`}
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1.5 text-sm text-red-400">{fieldErrors.confirmPassword}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary hover:brightness-110 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-primary/20 text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.processing') : t('resetPassword.submit')}
          </button>
        </form>
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-primary font-medium transition-colors group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            {t('resetPassword.backToLogin')}
          </Link>
        </div>
      </div>
      <div className="fixed -top-20 -left-20 size-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed -bottom-20 -right-20 size-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  )
}
