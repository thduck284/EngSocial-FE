import { useTranslation } from 'react-i18next'
import { authService } from '../../../services'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi'
    i18n.changeLanguage(newLang)
    localStorage.setItem('language', newLang)
    sessionStorage.setItem('language', newLang)

    // Sync to DB when user is logged in (token có thể ở localStorage hoặc sessionStorage)
    if (localStorage.getItem('authToken') || sessionStorage.getItem('authToken')) {
      try {
        await authService.updatePreferences({ language: newLang })
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          user.preferences = { ...user.preferences, language: newLang }
          localStorage.setItem('user', JSON.stringify(user))
          sessionStorage.setItem('user', JSON.stringify(user))
        }
      } catch (_) {}
    }
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-2 py-0.5 rounded-xl bg-white dark:bg-card-dark text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary border border-slate-100 dark:border-white/5 transition-all shadow-lg shadow-slate-200/40 dark:shadow-none active:scale-95 group"
      aria-label="Chuyển ngôn ngữ"
    >
      <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">translate</span>
      <span className="uppercase font-black text-[10px] tracking-[0.2em]">{i18n.language === 'vi' ? 'VI' : 'EN'}</span>
    </button>

  )
}
