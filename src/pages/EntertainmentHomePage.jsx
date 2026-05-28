import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ENTERTAINMENT_GAMES } from '../constants/entertainmentGames'

export function EntertainmentHomePage() {
  const { t } = useTranslation()

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
            className="group relative rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 overflow-hidden hover:border-cyan-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20 flex flex-col h-[360px]"
          >
            {/* Image Section */}
            <div className="relative h-[240px] w-full overflow-hidden shrink-0">
               <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 animate-pulse" /> {/* Placeholder while loading */}
               <img 
                 src={g.image} 
                 alt={t(g.titleKey)} 
                 className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-1000 ease-out"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-white/20 dark:via-slate-900/40 to-transparent" />
               <div className="absolute top-5 left-5 bg-white/80 dark:bg-black/60 backdrop-blur-md border border-slate-200 dark:border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
                 <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-lg animate-pulse">public</span>
                 <span className="text-[10px] font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase">Global MMO</span>
               </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-1 px-8 pb-8 relative z-10 -mt-12">
               <div className="flex items-end justify-between mb-3">
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors drop-shadow-sm">
                    {t(g.titleKey)}
                  </h2>
                  <div className="size-16 rounded-2xl bg-cyan-500 text-white flex items-center justify-center transition-all shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 group-hover:scale-110 group-active:scale-95 border border-white/20">
                     <span className="material-symbols-outlined text-4xl ml-1">play_arrow</span>
                  </div>
               </div>
               <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 pr-12 font-medium">
                 {t(g.descKey)}
               </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
