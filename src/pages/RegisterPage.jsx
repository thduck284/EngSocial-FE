import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthLayout } from '../components/layout/AuthLayout'
import { useRegister } from '../hooks'

const inputBase = 'w-full bg-slate-800/50 border text-white rounded-xl pl-10 pr-4 py-2.5 focus:ring-0 input-glow transition-all placeholder-slate-600'
const inputError = 'border-red-500/50'
const inputNormal = 'border-slate-700 focus:border-primary'

const REGISTER_LEFT_ITEMS = [
  { icon: 'map', titleKey: 'auth.registerLeft.roadmap', descKey: 'auth.registerLeft.roadmapDesc' },
  { icon: 'public', titleKey: 'auth.registerLeft.community', descKey: 'auth.registerLeft.communityDesc' },
  { icon: 'school', titleKey: 'auth.registerLeft.lessons', descKey: 'auth.registerLeft.lessonsDesc' },
  { icon: 'analytics', titleKey: 'auth.registerLeft.tracking', descKey: 'auth.registerLeft.trackingDesc' },
]

export function RegisterPage() {
  const { t } = useTranslation()
  const {
    fullName,
    email,
    password,
    confirmPassword,
    showPassword,
    agreeTerms,
    loading,
    error,
    fieldErrors,
    updateField,
    handleSubmit,
    toggleShowPassword,
  } = useRegister()

  const field = (name) => (fieldErrors[name] ? inputError : inputNormal)

  const registerLeftContent = (
    <>
      <h2 className="text-4xl font-bold leading-tight mb-8">{t('auth.registerLeft.title')}</h2>
      <div className="space-y-6">
        {REGISTER_LEFT_ITEMS.map(({ icon, titleKey, descKey }) => (
          <div key={icon} className="flex items-center gap-4 group">
            <span className="material-symbols-outlined text-primary bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
              {icon}
            </span>
            <div>
              <span className="block text-base font-semibold text-slate-200">{t(titleKey)}</span>
              <span className="text-sm text-slate-400">{t(descKey)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )

  return (
    <AuthLayout leftContent={registerLeftContent}>
      <div className="mb-8 text-center md:text-left max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">{t('auth.createAccount')}</h2>
        <p className="text-slate-400 text-sm">{t('auth.startJourney')}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <button type="button" className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl transition-colors text-sm">
          <img alt="Google" className="w-5 h-5" src="https://www.google.com/favicon.ico" />
          {t('auth.continueWithGoogle')}
        </button>
        <button type="button" className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold rounded-xl transition-colors text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          {t('auth.continueWithFacebook')}
        </button>
      </div>
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card-dark px-3 text-slate-500">{t('auth.orRegisterWithEmail')}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
          <span className="material-symbols-outlined text-lg shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="fullname">{t('auth.fullName')}</label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 group-focus-within:text-primary transition-colors text-xl">person</span>
            <input id="fullname" type="text" placeholder={t('auth.fullNamePlaceholder')} value={fullName} onChange={(e) => updateField('fullName', e.target.value)} className={`${inputBase} ${field('fullName')}`} />
          </div>
          {fieldErrors.fullName && <p className="mt-1 text-xs text-red-400">{fieldErrors.fullName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="email">{t('auth.emailAddress')}</label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 group-focus-within:text-primary transition-colors text-xl">alternate_email</span>
            <input id="email" type="email" placeholder={t('auth.emailPlaceholder')} value={email} onChange={(e) => updateField('email', e.target.value)} className={`${inputBase} ${field('email')}`} />
          </div>
          {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="password">{t('auth.password')}</label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 group-focus-within:text-primary transition-colors text-xl">lock</span>
            <input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => updateField('password', e.target.value)} className={`${inputBase} pr-10 ${field('password')}`} />
            <button type="button" onClick={toggleShowPassword} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
              <span className="material-symbols-outlined text-xl">visibility</span>
            </button>
          </div>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4].map((i) => <div key={i} className={`h-1 w-1/4 rounded transition-all ${i <= 2 ? 'bg-primary' : 'bg-slate-700'}`} />)}
          </div>
          {fieldErrors.password ? <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p> : <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">{t('auth.passwordStrength')}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="confirm-password">{t('auth.confirmPassword')}</label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 group-focus-within:text-primary transition-colors text-xl">shield_lock</span>
            <input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} className={`${inputBase} ${field('confirmPassword')}`} />
          </div>
          {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-400">{fieldErrors.confirmPassword}</p>}
        </div>
        <div className="flex items-start gap-2 py-2">
          <input id="terms" type="checkbox" checked={agreeTerms} onChange={(e) => updateField('agreeTerms', e.target.checked)} className={`mt-0.5 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary/20 ${fieldErrors.agreeTerms ? 'ring-1 ring-red-500/50' : ''}`} />
          <label className="text-xs text-slate-400 cursor-pointer leading-relaxed" htmlFor="terms">
            {t('auth.termsAgree')} <Link to="/term" className="text-primary hover:underline">{t('auth.terms')}</Link> {t('auth.and')} <Link to="/term" className="text-primary hover:underline">{t('auth.privacy')}</Link> {t('auth.termsSuffix')}
          </label>
          {fieldErrors.agreeTerms && <p className="mt-1 text-xs text-red-400 block">{fieldErrors.agreeTerms}</p>}
        </div>
        <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-primary/20 text-base">
          {loading ? <span className="flex items-center justify-center gap-2"><span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>{t('auth.processing')}</span> : t('auth.registerNow')}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-800 text-center">
        <p className="text-sm text-slate-400">
          {t('auth.haveAccount')} <Link to="/login" className="text-primary font-bold hover:underline">{t('auth.loginNow')}</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
