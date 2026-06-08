import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../constants'
import { LanguageSwitcher } from '../components/ui/common/LanguageSwitcher'
import { useAuth } from '../context/AuthContext'

export const HELP_CONTACT = {
  email: 'support@engsocial.vn',
  hotline: '+84 28 3822 1234',
  hotlineTel: '+842838221234',
  hoursKey: 'helpPage.hours',
  webUrl: 'https://engsocial-fe.onrender.com/help',
}

const FAQ_KEYS = ['account', 'lesson', 'practice', 'quest', 'report', 'technical']

const SUPPORT_EMAIL_SUBJECT = 'EngSocial Support'
const SUPPORT_EMAIL_HREF = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(HELP_CONTACT.email)}&su=${encodeURIComponent(SUPPORT_EMAIL_SUBJECT)}`

function linkifySupportEmail(text) {
  const email = HELP_CONTACT.email
  const raw = String(text ?? '')
  if (!raw.includes(email)) return raw

  const parts = raw.split(email)
  return parts.map((part, idx) => (
    <span key={idx}>
      {part}
      {idx < parts.length - 1 && (
        <a
          href={SUPPORT_EMAIL_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-semibold hover:underline break-all"
        >
          {email}
        </a>
      )}
    </span>
  ))
}

function FaqStepList({ faqKey, t }) {
  const steps = t(`helpPage.faq.${faqKey}.steps`, { returnObjects: true })
  if (!Array.isArray(steps)) return null

  return (
    <ol className="list-none space-y-2.5 m-0 p-0">
      {steps.map((step, idx) => (
        <li key={idx} className="flex gap-3 items-start">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-[11px] font-bold mt-0.5">
            {idx + 1}
          </span>
          <span className="flex-1 min-w-0 leading-relaxed">{linkifySupportEmail(step)}</span>
        </li>
      ))}
    </ol>
  )
}

function HelpLogoLink() {
  return (
    <Link to={ROUTES.HOME} className="flex items-center gap-3 text-primary">
      <div className="size-10">
        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">EngSocial</span>
    </Link>
  )
}

/**
 * Trang trợ giúp & liên hệ — public tại /help (link từ email, thông báo hệ thống).
 */
export function HelpPage() {
  const { t } = useTranslation()
  const { canAccessApp } = useAuth()

  const quickLinks = [
    { to: ROUTES.LESSON, icon: 'menu_book', labelKey: 'header.lessons' },
    { to: ROUTES.SKILLS.READING, icon: 'fitness_center', labelKey: 'header.practice' },
    { to: ROUTES.QUESTS, icon: 'flag', labelKey: 'header.quests' },
    { to: ROUTES.SETTINGS, icon: 'settings', labelKey: 'header.settings' },
  ]

  const body = (
    <div className="max-w-4xl mx-auto px-4 py-10 pb-16">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
          <span className="material-symbols-outlined text-sm">support_agent</span>
          {t('helpPage.badge')}
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          {t('helpPage.title')}
        </h1>
        <p className="text-slate-600 dark:text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">
          {t('helpPage.subtitle')}
        </p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">quiz</span>
            {t('helpPage.faqTitle')}
          </h2>
          <div className="space-y-3">
            {FAQ_KEYS.map((key) => (
              <details
                key={key}
                className="group rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none font-semibold text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <span>{t(`helpPage.faq.${key}.q`)}</span>
                  <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform shrink-0">
                    expand_more
                  </span>
                </summary>
                <div className="px-5 pb-4 text-sm text-slate-600 dark:text-gray-400 border-t border-slate-100 dark:border-border-dark pt-3">
                  <FaqStepList faqKey={key} t={t} />
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-6 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-white to-white dark:from-primary/15 dark:via-card-dark dark:to-card-dark p-6 shadow-lg shadow-primary/5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">contact_support</span>
              {t('helpPage.contactTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-5">{t('helpPage.contactSubtitle')}</p>

            <ul className="space-y-4">
              <li>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{t('helpPage.emailLabel')}</p>
                <a
                  href={SUPPORT_EMAIL_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline break-all"
                >
                  <span className="material-symbols-outlined text-base">mail</span>
                  {HELP_CONTACT.email}
                </a>
                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-gray-500">{t('helpPage.emailHint')}</p>
              </li>
              <li>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{t('helpPage.hotlineLabel')}</p>
                <a
                  href={`tel:${HELP_CONTACT.hotlineTel}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-primary">call</span>
                  {HELP_CONTACT.hotline}
                </a>
              </li>
              <li>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{t('helpPage.hoursLabel')}</p>
                <p className="text-sm text-slate-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-primary shrink-0 mt-0.5">schedule</span>
                  {t('helpPage.hours')}
                </p>
              </li>
              <li>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{t('helpPage.webLabel')}</p>
                <a
                  href={HELP_CONTACT.webUrl}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline break-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="material-symbols-outlined text-base">language</span>
                  {HELP_CONTACT.webUrl}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {canAccessApp && (
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">link</span>
            {t('helpPage.quickLinksTitle')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickLinks.map(({ to, icon, labelKey }) => (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark hover:border-primary/40 hover:bg-primary/5 transition-all text-center"
              >
                <span className="material-symbols-outlined text-2xl text-primary">{icon}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-gray-300">{t(labelKey)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-border-dark">
        <Link
          to={canAccessApp ? ROUTES.HOME : ROUTES.LOGIN}
          className="inline-flex items-center gap-2 text-primary font-semibold hover:underline text-sm"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          {canAccessApp ? t('helpPage.backHome') : t('helpPage.backLogin')}
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-border-dark bg-white/90 dark:bg-background-dark/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <HelpLogoLink />
          <nav className="flex items-center gap-4">
            <LanguageSwitcher />
            {canAccessApp ? (
              <Link
                to={ROUTES.HOME}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:brightness-110 transition-all"
              >
                {t('helpPage.goToApp')}
              </Link>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">
                  {t('auth.login')}
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:brightness-110 transition-all"
                >
                  {t('auth.register')}
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      {body}
    </div>
  )
}
