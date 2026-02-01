/**
 * Apply user's preferred language from user.preferences.language to i18n and localStorage.
 * Call after login when you have user from API so UI and storage stay in sync with DB.
 * @param {{ preferences?: { language?: string } }} user - user object from API
 * @param {{ changeLanguage: (lang: string) => void }} i18n - i18n instance (e.g. from useTranslation())
 */
export function applyUserLanguage(user, i18n) {
  const lang = user?.preferences?.language
  if (lang !== 'vi' && lang !== 'en') return
  i18n.changeLanguage(lang)
  localStorage.setItem('language', lang)
}
