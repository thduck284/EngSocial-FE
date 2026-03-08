import { useTranslation } from 'react-i18next'

export function AchievementsPage() {
  const { t } = useTranslation()
  return (
    <main className="max-w-[1440px] mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-2">{t('header.achievements')}</h1>
      <p className="text-gray-400 text-sm">Coming soon...</p>
    </main>
  )
}
