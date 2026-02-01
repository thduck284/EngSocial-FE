import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi'
    i18n.changeLanguage(newLang)
    localStorage.setItem('language', newLang)
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
