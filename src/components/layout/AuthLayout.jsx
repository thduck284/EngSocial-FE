import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../ui/common/LanguageSwitcher'

export function AuthLayout({ children, leftContent }) {
  return (
    <div className="bg-textured text-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-card-dark rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative">
        {/* Language switcher - same as dashboard */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>
        {/* Left panel - branding */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-[#111827] to-[#1e3a44] border-r border-slate-800">
          <div className="flex items-center gap-3 text-primary mb-8">
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
          {leftContent}
        </div>
        {/* Right panel - form */}
        <div className="p-8 md:p-12 flex flex-col justify-center pt-14 md:pt-12">{children}</div>
      </div>
      <div className="fixed -top-20 -left-20 size-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed -bottom-20 -right-20 size-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  )
}

export function SocialButtons({ onGoogle, onFacebook }) {
  const { t } = useTranslation()
  return (
    <>
      <div className="grid grid-cols-1 gap-3 mb-6">
        <button
          type="button"
          onClick={onGoogle}
          className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl transition-colors text-sm"
        >
          <img alt="Google" className="w-5 h-5" src="https://www.google.com/favicon.ico" />
          {t('auth.continueWithGoogle')}
        </button>
        <button
          type="button"
          onClick={onFacebook}
          className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold rounded-xl transition-colors text-sm"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          {t('auth.continueWithFacebook')}
        </button>
      </div>
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card-dark px-2 text-slate-500">{t('auth.orLoginWith')}</span>
        </div>
      </div>
    </>
  )
}
