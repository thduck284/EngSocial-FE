import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../constants'

export function StaffEntertainmentHomePage() {
  const { t } = useTranslation()
  const { userId } = useParams()

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <span className="material-symbols-outlined text-3xl">sports_esports</span>
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white">{t('staffDashboard.navEntertainment')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('staffDashboard.entertainmentHubSubtitle')}</p>
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-8">{t('staffDashboard.entertainmentHubHint')}</p>
      <ul className="space-y-3">
        <li>
          <Link
            to={ROUTES.MANAGE_WORD_SCRAMBLE(userId)}
            className="flex items-center gap-4 p-4 rounded-2xl bg-card-dark border border-border-dark hover:border-primary/40 hover:bg-white/[0.03] transition-all group"
          >
            <span className="material-symbols-outlined text-3xl text-primary shrink-0">sort_by_alpha</span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white group-hover:text-primary transition-colors">{t('staffDashboard.navWordScramble')}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t('staffDashboard.cardWordScrambleDesc')}</p>
            </div>
            <span className="material-symbols-outlined text-gray-500 group-hover:text-primary">chevron_right</span>
          </Link>
        </li>
        <li>
          <Link
            to={ROUTES.SKILLS.ENTERTAINMENT}
            className="flex items-center gap-4 p-4 rounded-2xl bg-card-dark/50 border border-border-dark/80 hover:border-white/20 transition-all text-sm text-gray-400"
          >
            <span className="material-symbols-outlined text-xl text-gray-500">open_in_new</span>
            <span>{t('staffDashboard.openEntertainmentInApp')}</span>
          </Link>
        </li>
      </ul>
    </div>
  )
}
