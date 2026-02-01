import { useTranslation } from 'react-i18next'
import { authService } from '../../services'

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
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card-dark text-gray-300 hover:bg-gray-700 hover:text-primary transition-all border border-border-dark text-xs font-medium"
      aria-label="Chuyển ngôn ngữ"
    >
      <span className="material-symbols-outlined text-base">translate</span>
      <span className="uppercase font-bold">{i18n.language === 'vi' ? 'VI' : 'EN'}</span>
    </button>
  )
}
