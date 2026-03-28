import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthLayout, SocialButtons } from '../components/layout/AuthLayout'
import { useLogin } from '../hooks'
import { isFacebookSdkBlockedOnHttp } from '../utils/socialAuth'

const inputBase = 'w-full bg-slate-800/50 border text-white rounded-xl pl-10 pr-4 py-2.5 focus:ring-0 input-glow transition-all placeholder-slate-600'
const inputError = 'border-red-500/50'
const inputNormal = 'border-slate-700 focus:border-primary'

export function LoginPage() {
  const { t } = useTranslation()
  const {
    email,
    password,
    showPassword,
    remember,
    loading,
    error,
    fieldErrors,
    updateField,
    handleSubmit,
    startSocialLogin,
    toggleShowPassword,
  } = useLogin()

  const field = (name) => (fieldErrors[name] ? inputError : inputNormal)

  const loginLeftContent = (
    <>
      <h2 className="text-3xl font-bold leading-tight mb-4">
        {t('auth.loginLeft.title')}
      </h2>
      <p className="text-slate-400 text-lg mb-8">
        {t('auth.loginLeft.subtitle')}
      </p>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">groups</span>
          <span className="text-sm font-medium text-slate-300">{t('auth.loginLeft.community')}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">auto_graph</span>
          <span className="text-sm font-medium text-slate-300">{t('auth.loginLeft.progress')}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">forum</span>
          <span className="text-sm font-medium text-slate-300">{t('auth.loginLeft.practice')}</span>
        </div>
      </div>
    </>
  )

  return (
    <AuthLayout leftContent={loginLeftContent}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">{t('auth.welcomeBack')}</h2>
        <p className="text-slate-400 text-sm">{t('auth.pleaseLogin')}</p>
      </div>
      <SocialButtons
        onGoogle={() => startSocialLogin('google')}
        onFacebook={() => startSocialLogin('facebook')}
        facebookDisabled={isFacebookSdkBlockedOnHttp()}
      />
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
          <span className="material-symbols-outlined text-lg shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="email">
            {t('auth.emailOrUsername')}
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 group-focus-within:text-primary transition-colors text-xl">
              alternate_email
            </span>
            <input
              id="email"
              type="text"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => updateField('email', e.target.value)}
              className={`${inputBase} ${field('email')}`}
              autoComplete="email"
            />
          </div>
          {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>}
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-400" htmlFor="password">
              {t('auth.password')}
            </label>
            <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
              {t('auth.forgotPassword')}
            </Link>
          </div>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 group-focus-within:text-primary transition-colors text-xl">
              lock
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => updateField('password', e.target.value)}
              className={`${inputBase} pr-10 ${field('password')}`}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
            >
              <span className="material-symbols-outlined text-xl">visibility</span>
            </button>
          </div>
          {fieldErrors.password && <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <input
            id="remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => updateField('remember', e.target.checked)}
            className="rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary/20"
          />
          <label className="text-xs text-slate-400 cursor-pointer" htmlFor="remember">
            {t('auth.rememberMe')}
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              {t('auth.processing')}
            </span>
          ) : (
            t('auth.login')
          )}
        </button>
      </form>
      <div className="mt-8 pt-6 border-t border-slate-800 text-center">
        <p className="text-sm text-slate-400">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            {t('auth.registerNow')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
