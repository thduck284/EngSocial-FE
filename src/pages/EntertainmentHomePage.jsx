import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ENTERTAINMENT_GAMES } from '../constants/entertainmentGames'
import { useGuestAuthGate } from '../hooks'

export function EntertainmentHomePage() {
  const { t } = useTranslation()
  const { requireAuth, guestModal } = useGuestAuthGate()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
      <div className="flex flex-col items-center justify-center text-center py-10 mb-2">
         <div className="inline-flex items-center justify-center size-20 rounded-[2rem] bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
            <span className="material-symbols-outlined text-4xl text-white">sports_esports</span>
         </div>
         <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Multiplayer Arena</h1>
         <p className="text-slate-500 dark:text-slate-400 max-w-md font-medium text-sm leading-relaxed">{t('enter.gameListHint')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto px-4 pb-12">
        {ENTERTAINMENT_GAMES.map((g) => (
          <Link
            key={g.slug}
            to={g.path}
            onClick={(e) => { if (!requireAuth()) e.preventDefault() }}
            className="group relative rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 overflow-hidden hover:border-cyan-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20 flex flex-col h-[360px]"
          >
            {/* Image Section */}
            <div className="relative h-[240px] w-full overflow-hidden shrink-0">
               <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 animate-pulse" /> {/* Placeholder while loading */}
               <img 
                 src={g.image} 
                 alt={t(g.titleKey)} 
                 className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-white/20 dark:via-slate-900/40 to-transparent" />
               <div className="absolute top-4 left-4 bg-white/80 dark:bg-black/60 backdrop-blur-md border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg">
                  <span className="material-symbols-outlined text-primary text-base animate-pulse">public</span>
                  <span className="text-[9px] font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase">Global MMO</span>
               </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-1 px-6 pb-6 relative z-10 -mt-10">
               <div className="flex items-end justify-between mb-2">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors drop-shadow-sm truncate pr-2">
                     {t(g.titleKey)}
                  </h2>
               </div>
               <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed line-clamp-2">
                  {t(g.descKey)}
               </p>
            </div>
          </Link>
        ))}
      </div>
      {guestModal}
    </div>
  )
}
