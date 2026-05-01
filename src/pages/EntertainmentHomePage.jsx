import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ENTERTAINMENT_GAMES } from '../constants/entertainmentGames'

export function EntertainmentHomePage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="flex flex-col items-center justify-center text-center py-6 mb-2">
         <div className="inline-flex items-center justify-center size-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(34,211,238,0.4)] mb-4">
            <span className="material-symbols-outlined text-3xl text-white">sports_esports</span>
         </div>
         <h1 className="text-3xl font-black text-white tracking-tight mb-2">Multiplayer Arena</h1>
         <p className="text-slate-400 max-w-md">{t('enter.gameListHint')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto px-4 pb-8">
        {ENTERTAINMENT_GAMES.map((g) => (
          <Link
            key={g.slug}
            to={g.path}
            className="group relative rounded-[2rem] border border-white/10 bg-slate-900/50 overflow-hidden hover:border-cyan-500/50 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(34,211,238,0.3)] flex flex-col h-[340px]"
          >
            {/* Image Section */}
            <div className="relative h-[220px] w-full overflow-hidden shrink-0">
               <div className="absolute inset-0 bg-slate-800 animate-pulse" /> {/* Placeholder while loading */}
               <img 
                 src={g.image} 
                 alt={t(g.titleKey)} 
                 className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
               <div className="absolute top-5 left-5 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
                 <span className="material-symbols-outlined text-cyan-400 text-[18px] animate-pulse">public</span>
                 <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">Global MMO</span>
               </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-1 px-6 pb-6 relative z-10 -mt-10">
               <div className="flex items-end justify-between mb-2">
                  <h2 className="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors drop-shadow-md">
                    {t(g.titleKey)}
                  </h2>
                  <div className="size-14 rounded-2xl bg-cyan-500/20 backdrop-blur-md flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(34,211,238,0)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] group-active:scale-95 border border-white/5">
                     <span className="material-symbols-outlined text-3xl ml-1">play_arrow</span>
                  </div>
               </div>
               <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 pr-16">
                 {t(g.descKey)}
               </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
