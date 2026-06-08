import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants'
import { LanguageSwitcher, AUTH_TOOLBAR_BTN_CLASS } from '../ui/common/LanguageSwitcher'

export function AuthLayout({ children, leftContent }) {
  const { t } = useTranslation()

  return (
    <div className="bg-textured text-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 bg-card-dark rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <Link
            to={ROUTES.HELP}
            className={AUTH_TOOLBAR_BTN_CLASS}
            aria-label={t('auth.help')}
            title={t('auth.help')}
          >
            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">help</span>
          </Link>
          <LanguageSwitcher buttonClassName={AUTH_TOOLBAR_BTN_CLASS} />
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

export function SocialButtons({
  onGoogle,
  onFacebook,
  facebookDisabled,
  /** Trang đăng ký tự hiển thị divider khác — ẩn dòng "Or login with email" */
  showEmailDivider = true,
}) {
  const { t } = useTranslation()
  return (
    <>
      <div className={`flex flex-col gap-2.5 ${showEmailDivider ? 'mb-6' : 'mb-4'}`}>
        <div className="grid min-w-0 grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onGoogle}
            className="group flex flex-row items-center justify-center gap-1.5 w-full min-w-0 py-1.5 px-2 rounded-xl bg-white text-slate-900 font-semibold text-[13px] sm:text-sm leading-snug text-center border border-slate-200/90 shadow-sm shadow-slate-900/5 hover:bg-slate-50 hover:border-slate-300/90 hover:shadow transition-all"
          >
            <img
              alt=""
              className="size-[1.125rem] sm:size-5 shrink-0 rounded-sm"
              src="https://www.google.com/favicon.ico"
            />
            <span className="min-w-0 text-center break-words [text-wrap:balance]">
              {t('auth.continueWithGoogle')}
            </span>
          </button>
          <button
            type="button"
            disabled={facebookDisabled}
            onClick={facebookDisabled ? undefined : onFacebook}
            className={[
              'flex flex-row items-center justify-center gap-1.5 w-full min-w-0 py-1.5 px-2 rounded-xl text-[13px] sm:text-sm leading-snug text-center transition-all',
              facebookDisabled
                ? 'cursor-not-allowed border border-slate-600/80 bg-slate-800/90 font-semibold text-slate-400 hover:bg-slate-800/90'
                : [
                    'border border-[#1877F2] bg-[#1877F2] font-bold text-white',
                    'shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] shadow-md shadow-black/15',
                    'hover:bg-[#166FE5] hover:border-[#166FE5] active:bg-[#0f5bdc] active:border-[#0f5bdc]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]',
                  ].join(' '),
            ].join(' ')}
          >
            <svg
              className={['size-[1.125rem] sm:size-5 shrink-0', facebookDisabled ? 'text-slate-500' : 'text-white'].join(' ')}
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span
              className={[
                'min-w-0 text-center break-words [text-wrap:balance]',
                facebookDisabled ? 'text-slate-400' : 'text-white',
              ].join(' ')}
            >
              {t('auth.continueWithFacebook')}
            </span>
          </button>
        </div>
      </div>
      {showEmailDivider ? (
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card-dark px-2 text-slate-500">{t('auth.orLoginWith')}</span>
          </div>
        </div>
      ) : null}
    </>
  )
}
