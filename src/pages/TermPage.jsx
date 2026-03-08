import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher'

export function TermPage() {
  const { t } = useTranslation()

  return (
    <div className="bg-textured text-slate-100 min-h-screen">
      <div className="scroll-indicator fixed top-0 left-0 h-1 bg-primary z-[100] w-[30%]" />
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-3 text-primary">
            <div className="size-10">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path
                  d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight">EngSocial</span>
          </Link>
          <nav className="flex items-center gap-6">
            <LanguageSwitcher />
            <Link to="/login" className="text-slate-400 hover:text-primary text-sm font-medium transition-colors">
              {t('auth.login')}
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-primary text-slate-950 font-bold rounded-xl text-sm hover:brightness-110 transition-all"
            >
              {t('auth.register')}
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-12 prose-custom">
        <h1 className="text-4xl font-bold mb-8">{t('term.title')}</h1>
        <h2 className="text-2xl font-bold text-white mb-4 mt-12 flex items-center gap-3">{t('term.section1')}</h2>
        <p className="text-slate-400 leading-relaxed mb-4">
          {t('term.section1Desc')}
        </p>
        <h2 className="text-2xl font-bold text-white mb-4 mt-12 flex items-center gap-3">{t('term.section2')}</h2>
        <p className="text-slate-400 leading-relaxed mb-4">
          {t('term.section2Desc')}
        </p>
        <ul className="list-disc list-outside ml-5 text-slate-400 space-y-2 mb-6">
          <li>{t('term.item1')}</li>
          <li>{t('term.item2')}</li>
          <li>{t('term.item3')}</li>
        </ul>
        <h2 className="text-2xl font-bold text-white mb-4 mt-12 flex items-center gap-3">{t('term.section3')}</h2>
        <p className="text-slate-400 leading-relaxed mb-4">
          {t('term.section3Desc')}
        </p>
        <div className="mt-12 pt-8 border-t border-slate-800">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            {t('term.backToRegister')}
          </Link>
        </div>
      </main>
    </div>
  )
}
