import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Global achievement unlock toast.
 * Listens for window 'achievement:unlocked' events and shows an animated toast.
 * Mount this once near the app root (e.g., in App.jsx or DashboardPage.jsx).
 */
export function AchievementUnlockedToast() {
  const { t } = useTranslation()
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    const handler = (e) => {
      const payload = e.detail
      if (!payload) return
      const id = `ach-${Date.now()}-${Math.random()}`
      setToasts((prev) => [...prev.slice(-2), { id, ...payload }]) // max 3 at a time
      // Auto-dismiss after 5s
      setTimeout(() => dismiss(id), 5000)
    }
    window.addEventListener('achievement:unlocked', handler)
    return () => window.removeEventListener('achievement:unlocked', handler)
  }, [dismiss])

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 min-w-[280px] max-w-[340px] rounded-2xl border border-amber-400/40 bg-gradient-to-br from-slate-900 via-slate-950 to-black shadow-2xl px-4 py-3 animate-slide-up"
          style={{ animation: 'slideUpFadeIn 0.35s ease-out' }}
        >
          {/* Badge icon/image */}
          <div className="shrink-0 size-12 rounded-full border-2 border-amber-400/60 bg-amber-500/15 flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.4)]">
            {toast.badgeImage ? (
              <img src={toast.badgeImage} alt="" className="size-9 rounded-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-2xl text-amber-300">
                {toast.badgeIcon || 'emoji_events'}
              </span>
            )}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-400 mb-0.5">
              {t('achievementsPage.unlockedLabel', { defaultValue: '🎉 Achievement Unlocked!' })}
            </p>
            <p className="text-sm font-bold text-white truncate">
              {toast.milestoneName || toast.achievementName || ''}
            </p>
            {toast.xpReward > 0 && (
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                +{toast.xpReward} XP
              </p>
            )}
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className="shrink-0 size-6 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}

      <style>{`
        @keyframes slideUpFadeIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
