import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import vi from '../locales/vi.json'
import en from '../locales/en.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    lng: (() => {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          if (user.preferences?.language === 'vi' || user.preferences?.language === 'en') {
            return user.preferences.language
          }
        } catch (_) {}
      }
      const saved = localStorage.getItem('language') || sessionStorage.getItem('language')
      return saved === 'vi' || saved === 'en' ? saved : 'vi'
    })(),
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  })

export default i18n
