import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { getStaffHomeCards } from '../constants'

export function StaffManageHomePage() {
  const { t } = useTranslation()
  const { isAdmin, user } = useAuth()
  const cards = getStaffHomeCards(isAdmin, user?.id)

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{t('staffDashboard.welcomeTitle')}</h1>
      <p className="text-sm text-gray-400 mb-8 max-w-xl">
        {isAdmin ? t('staffDashboard.welcomeSubtitleAdmin') : t('staffDashboard.welcomeSubtitleModerator')}
      </p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <li key={c.to}>
            <Link
              to={c.to}
              className="block p-5 rounded-2xl bg-card-dark border border-border-dark hover:border-primary/40 hover:bg-white/[0.03] transition-all group"
            >
              <span className="material-symbols-outlined text-3xl text-primary mb-3 block group-hover:scale-105 transition-transform">
                {c.icon}
              </span>
              <h2 className="font-bold text-white mb-1 group-hover:text-primary transition-colors">{t(c.labelKey)}</h2>
              <p className="text-xs text-gray-500 leading-relaxed">{t(c.descKey)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
