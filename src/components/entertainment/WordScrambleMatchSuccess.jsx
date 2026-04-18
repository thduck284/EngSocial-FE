import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DEFAULT_AVATAR } from '../../constants/ui'

export function WordScrambleMatchSuccess({ players = [], onComplete }) {
  const { t } = useTranslation()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <div className="flex flex-col items-center justify-center p-6 ws-fade-rise text-center">
      <div className="mb-8">
        <div className="size-20 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500/50 animate-bounce">
          <span className="material-symbols-outlined text-4xl text-emerald-400">check_circle</span>
        </div>
      </div>

      <h2 className="ws-font-display ws-hero-gradient text-3xl sm:text-4xl font-black mb-2">
        {t('enter.game.matchFoundTitle') || 'Match Found!'}
      </h2>
      <p className="text-slate-400 mb-10 text-sm">
        {t('enter.game.matchStartingIn', { n: countdown }) || `Game starts in ${countdown}s...`}
      </p>

      <div className="flex flex-wrap justify-center gap-6 max-w-4xl">
        {players.filter(Boolean).map((p, idx) => (
          <div key={`${p.userId}-${idx}`} className="flex flex-col items-center gap-3 ws-fade-rise" style={{ animationDelay: `${idx * 150}ms` }}>
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-md animate-pulse" />
              <img
                src={p.avatar || DEFAULT_AVATAR}
                alt={p.name}
                className="size-20 rounded-full border-4 border-slate-800 object-cover relative z-10 shadow-2xl"
                onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR }}
              />
              <div className="absolute -bottom-1 -right-1 z-20 size-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-slate-900">
                <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
              </div>
            </div>
            <p className="text-sm font-bold text-white max-w-[100px] truncate">{p.name}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000 ease-linear"
          style={{ width: `${(3 - countdown) * 33.3}%` }}
        />
      </div>
    </div>
  )
}
