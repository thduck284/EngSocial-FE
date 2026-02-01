import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher'
import { authService } from '../services'
import { validateEmail } from '../validators'
import { ROUTES } from '../constants'

const inputBase = 'w-full bg-slate-800/50 border text-white rounded-xl pl-10 pr-4 py-3 focus:ring-0 input-glow transition-all placeholder-slate-600'
const inputError = 'border-red-500/50'
const inputNormal = 'border-slate-700 focus:border-primary'

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const emailErr = validateEmail(email)
    if (emailErr) {
      setFieldErrors({
        email: emailErr.params ? t(emailErr.key, emailErr.params) : t(emailErr.key),
      })
      return
    }

    setLoading(true)
    try {
      const res = await authService.forgotPassword(email.trim().toLowerCase())
      setSuccess(true)
      setError('')
      setFieldErrors({})
    } catch (err) {
      const msg = err?.message ?? err?.data?.message ?? t('forgotPassword.error')
      setError(msg)
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  const hasError = fieldErrors.email
  const showSuccess = success && !error

  return (
    <div className="bg-textured text-slate-100 min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      <div className="max-w-md w-full bg-card-dark rounded-2xl overflow-hidden shadow-2xl border border-slate-800 p-8 md:p-12">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 text-primary mb-2">
            <div className="size-12">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path
                  d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">EngSocial</h1>
          </div>
        </div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-3">{t('forgotPassword.title')}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {t('forgotPassword.description')}
          </p>
        </div>

        {showSuccess ? (
          <div className="rounded-xl bg-primary/10 border border-primary/30 text-primary px-4 py-3 text-sm mb-6">
            {t('forgotPassword.success')}
          </div>
        ) : null}
        {!showSuccess && (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2" htmlFor="email">
                {t('forgotPassword.yourEmail')}
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-3 text-slate-500 group-focus-within:text-primary transition-colors text-xl">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder={t('forgotPassword.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className={`${inputBase} ${hasError ? inputError : inputNormal}`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 text-sm text-red-400">{fieldErrors.email}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary hover:brightness-110 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-primary/20 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.processing') : t('forgotPassword.sendCode')}
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
            {t('forgotPassword.backToLogin')}
          </Link>
        </div>
      </div>
      <div className="fixed -top-20 -left-20 size-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed -bottom-20 -right-20 size-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  )
}
