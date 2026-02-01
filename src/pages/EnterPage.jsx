import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SKILL_TABS, SKILL_STATS_CONFIG, mockGames, mockFriendsOnline } from '../raw'
import { ROUTES } from '../constants'

export function EnterPage() {
  const { t } = useTranslation()
  return (
    <main className="max-w-[1440px] mx-auto grid grid-cols-12 gap-6 p-6">
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-card-dark rounded-xl p-5 border border-border-dark">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span>
              {t('skills.skillStats')}
            </h3>
            <div className="space-y-4">
              {SKILL_STATS_CONFIG.map(({ icon, color, label, key }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${color}`}>{icon}</span>
                    <span className="text-sm">{t(label)}</span>
                  </div>
                  <span className="text-sm font-bold">{key === 'reading' ? '1,240' : key === 'listening' ? '850' : '420'} XP</span>
                </div>
              ))}
              <div className="pt-4 border-t border-border-dark flex justify-between items-center text-xs text-gray-400">
                <span>{t('skills.weeklyTime')}: <strong className="text-white">5h 20m</strong></span>
                <span>{t('skills.done')}: <strong className="text-white">12/15</strong></span>
              </div>
            </div>
          </div>
        </aside>
        <section className="col-span-12 lg:col-span-6 space-y-6">
          <div className="bg-card-dark p-1 rounded-xl flex border border-border-dark">
            {SKILL_TABS.map(({ to, icon, label, key }) => (
              <Link
                key={to}
                to={to}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  key === 'enter'
                    ? 'bg-background-dark border border-border-dark text-primary font-bold'
                    : 'hover:bg-gray-700 text-gray-400'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{icon}</span>
                {t(label)}
              </Link>
            ))}
          </div>
          <div className="bg-gradient-to-r from-indigo-900/40 to-primary/20 border border-primary/30 rounded-xl p-5 relative overflow-hidden">
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-primary text-background-dark text-[10px] font-bold rounded">
                    {t('enter.weeklyChallenge')}
                  </span>
                  <span className="text-xs text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">timer</span> 02d 15h 45m
                  </span>
                </div>
                <h4 className="font-bold text-lg text-white">Vocabulary Arena Championship</h4>
                <p className="text-xs text-gray-300">
                  Compete in a 5-minute word battle to climb the leaderboard. Reward: 2000 XP &quot;Word Master&quot; Badge.
                </p>
                <button className="mt-2 px-6 py-2 bg-primary text-background-dark font-bold text-sm rounded-lg hover:brightness-110">
                  {t('buttons.playNow')}
                </button>
              </div>
              <span className="material-symbols-outlined text-7xl text-primary/20">workspace_premium</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockGames.map(({ icon, title, type, difficulty, desc, playing, badge, rating, color }) => (
              <div
                key={title}
                className="bg-card-dark rounded-xl border border-border-dark overflow-hidden group hover:border-primary/50 transition-all"
              >
                <div className="h-32 bg-indigo-950/50 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  <div className="relative z-10 text-center">
                    <span className={`material-symbols-outlined ${icon === 'spellcheck' ? 'text-primary' : 'text-purple-400'} text-5xl group-hover:scale-110 transition-transform`}>
                      {icon}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] font-medium">
                    <span className="material-symbols-outlined text-xs text-primary">diversity_3</span>
                    Solo/Multi
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors">{title}</h5>
                    <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] font-bold rounded">
                      {difficulty}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/20">
                    {type}
                  </span>
                  <p className="text-xs text-gray-400 line-clamp-2">{desc}</p>
                  <div className="flex flex-wrap gap-2 py-2">
                    <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">groups</span> {playing} {t('enter.playing')}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">military_tech</span> Rank: {badge}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border-dark">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-yellow-500 text-sm fill-icon">star</span>
                      <span className="text-[10px] font-bold">Avg: {rating}</span>
                    </div>
                    <button className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-background-dark font-bold text-xs rounded transition-all">
                      {t('buttons.playNow')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-card-dark rounded-xl p-5 border border-border-dark">
            <h3 className="font-bold text-sm mb-4 flex items-center justify-between">
              {t('enter.friendsOnline')}
              <span className="size-2 bg-green-500 rounded-full animate-pulse" />
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-slate-600 border border-primary relative" />
                <div className="text-xs">
                  <p className="font-bold">Alex T.</p>
                  <p className="text-gray-400">Playing: Word Battle</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
  )
}
