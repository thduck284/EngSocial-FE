import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthLayout, SocialButtons } from '../components/layout/AuthLayout'
import { isFacebookSdkBlockedOnHttp } from '../utils/socialAuth'
import { useRegister } from '../hooks'
import { getPasswordStrengthMeta } from '../utils/passwordStrength'
import { getDobMaxIsoDateLocal, getDobMinIsoDateLocal } from '../utils/dobBounds'

const inputBase =
  'w-full bg-slate-800/50 border text-white rounded-xl pl-10 pr-4 py-2.5 focus:ring-0 input-glow transition-all placeholder-slate-600'
const inputError = 'border-red-500/50'
const inputNormal = 'border-slate-700 focus:border-primary'

function PasswordStrengthMeter({ value, fieldError, t }) {
  const { bars, hintKey } = getPasswordStrengthMeta(value)
  return (
    <>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded transition-all ${i <= bars ? 'bg-primary' : 'bg-slate-700'}`}
          />
        ))}
      </div>
      {fieldError ? (
        <p className="mt-1 text-xs text-red-400">{fieldError}</p>
      ) : (
        <div className="mt-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{t('auth.passwordStrength')}</p>
          {hintKey ? <p className="text-xs text-slate-400 mt-0.5">{t(hintKey)}</p> : null}
        </div>
      )}
    </>
  )
}

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
    gender,
    dateOfBirth,
    showPassword,
    showConfirmPassword,
    agreeTerms,
    loading,
    error,
    fieldErrors,
    updateField,
    handleSubmit,
    startSocialRegister,
    toggleShowPassword,
    toggleShowConfirmPassword,
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
      <div className="w-full max-w-md sm:max-w-lg mx-auto">
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl font-bold mb-2">{t('auth.createAccount')}</h2>
        <p className="text-slate-400 text-sm">{t('auth.startJourney')}</p>
      </div>
      <SocialButtons
        showEmailDivider={false}
        onGoogle={() => startSocialRegister('google')}
        onFacebook={() => startSocialRegister('facebook')}
        facebookDisabled={isFacebookSdkBlockedOnHttp()}
      />
      {error && (
        <div className="mt-4 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
          <span className="material-symbols-outlined text-lg shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card-dark px-3 text-slate-500">{t('auth.orRegisterWithEmail')}</span>
        </div>
      </div>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="gender">{t('auth.gender')}</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 group-focus-within:text-primary transition-colors text-xl pointer-events-none">person</span>
              <select
                id="gender"
                value={gender}
                onChange={(e) => updateField('gender', e.target.value)}
                className={`${inputBase} ${field('gender')} appearance-none pr-10`}
              >
                <option value="">{t('auth.genderPlaceholder')}</option>
                <option value="male">{t('auth.genderMale')}</option>
                <option value="female">{t('auth.genderFemale')}</option>
                <option value="other">{t('auth.genderOther')}</option>
              </select>
            </div>
            {fieldErrors.gender && <p className="mt-1 text-xs text-red-400">{fieldErrors.gender}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="dateOfBirth">{t('auth.dateOfBirth')}</label>
            <div className="relative group">
              <input
                id="dateOfBirth"
                type="date"
                min={getDobMinIsoDateLocal()}
                max={getDobMaxIsoDateLocal()}
                value={dateOfBirth}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
                className={`register-dob-input ${inputBase} ${field('dateOfBirth')} !pl-4 [color-scheme:dark]`}
              />
            </div>
            {fieldErrors.dateOfBirth && <p className="mt-1 text-xs text-red-400">{fieldErrors.dateOfBirth}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="password">{t('auth.password')}</label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 group-focus-within:text-primary transition-colors text-xl">lock</span>
            <input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => updateField('password', e.target.value)} className={`${inputBase} pr-10 ${field('password')}`} />
            <button type="button" onClick={toggleShowPassword} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
              <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
          <PasswordStrengthMeter value={password} fieldError={fieldErrors.password} t={t} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="confirm-password">{t('auth.confirmPassword')}</label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 group-focus-within:text-primary transition-colors text-xl">shield_lock</span>
            <input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} className={`${inputBase} pr-10 ${field('confirmPassword')}`} />
            <button type="button" onClick={toggleShowConfirmPassword} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
              <span className="material-symbols-outlined text-xl">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
          <PasswordStrengthMeter value={confirmPassword} fieldError={fieldErrors.confirmPassword} t={t} />
          {!fieldErrors.confirmPassword && password && confirmPassword && password === confirmPassword && (
            <p className="text-xs text-emerald-500/90 mt-1 font-medium">{t('auth.passwordsMatch')}</p>
          )}
        </div>
        <div className="flex items-start gap-2 py-2">
          <input id="terms" type="checkbox" checked={agreeTerms} onChange={(e) => updateField('agreeTerms', e.target.checked)} className={`mt-0.5 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary/20 ${fieldErrors.agreeTerms ? 'ring-1 ring-red-500/50' : ''}`} />
          <label className="text-xs text-slate-400 cursor-pointer leading-relaxed" htmlFor="terms">
            {t('auth.termsAgree')} <Link to="/term" className="text-primary hover:underline">{t('auth.terms')}</Link> {t('auth.and')} <Link to="/term" className="text-primary hover:underline">{t('auth.privacy')}</Link> {t('auth.termsSuffix')}
          </label>
          {fieldErrors.agreeTerms && <p className="mt-1 text-xs text-red-400 block">{fieldErrors.agreeTerms}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
        >
          {loading ? <span className="flex items-center justify-center gap-2"><span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>{t('auth.processing')}</span> : t('auth.registerNow')}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-800 text-center">
        <p className="text-sm text-slate-400">
          {t('auth.haveAccount')} <Link to="/login" className="text-primary font-bold hover:underline">{t('auth.loginNow')}</Link>
        </p>
      </div>
      </div>
    </AuthLayout>
  )
}