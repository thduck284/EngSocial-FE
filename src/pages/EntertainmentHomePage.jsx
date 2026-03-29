import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ENTERTAINMENT_GAMES } from '../constants/entertainmentGames'

export function EntertainmentHomePage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border-dark bg-card-dark overflow-hidden">
        <div className="px-4 py-3 border-b border-border-dark">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">sports_esports</span>
            {t('enter.gameListTitle')}
          </h2>
          <p className="text-xs text-gray-500 mt-1">{t('enter.gameListHint')}</p>
        </div>
        <ul className="divide-y divide-border-dark">
          {ENTERTAINMENT_GAMES.map((g) => (
            <li key={g.slug}>
              <Link
                to={g.path}
                className="flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors group"
              >
                <span className="material-symbols-outlined text-3xl text-primary shrink-0 group-hover:scale-105 transition-transform">
                  {g.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white group-hover:text-primary transition-colors">
                    {t(g.titleKey)}
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{t(g.descKey)}</p>
                </div>
                <span className="material-symbols-outlined text-gray-500 group-hover:text-primary shrink-0">
                  chevron_right
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
