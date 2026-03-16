import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { userService } from '../services'

const RARITY_CLASS = {
  common: 'border-slate-500/50 bg-slate-500/10 text-slate-300',
  uncommon: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
  rare: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
  epic: 'border-purple-500/50 bg-purple-500/10 text-purple-300',
  legendary: 'border-amber-500/50 bg-amber-500/10 text-amber-300',
}

export function AchievementsPage() {
  const { t, i18n } = useTranslation()
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userService
      .getAchievements()
      .then((res) => {
        const list = res?.data?.achievements ?? res?.data ?? []
        setAchievements(Array.isArray(list) ? list : [])
      })
      .catch(() => setAchievements([]))
      .finally(() => setLoading(false))
  }, [])

  const isVi = i18n.language?.startsWith('vi')
  const name = (a) => (isVi && a.nameVi ? a.nameVi : a.name) || a.key
  const desc = (a) => (isVi && a.descriptionVi ? a.descriptionVi : a.description) || ''

  return (
    <main className="max-w-[1200px] mx-auto px-4 lg:px-10 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">{t('header.achievements')}</h1>
      <p className="text-gray-400 text-sm mb-8">{t('achievementsPage.subtitle', { defaultValue: 'Unlock badges by completing lessons and challenges.' })}</p>

      {loading && (
        <div className="flex justify-center py-16">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      )}

      {!loading && achievements.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <span className="material-symbols-outlined text-5xl mb-4 block opacity-50">emoji_events</span>
          <p>{t('achievementsPage.noAchievements', { defaultValue: 'No achievements yet.' })}</p>
        </div>
      )}

      {!loading && achievements.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl border p-5 flex flex-col transition-all ${
                a.unlocked ? RARITY_CLASS[a.rarity] || RARITY_CLASS.common : 'border-border-dark bg-card-dark opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`size-14 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    a.unlocked ? 'border-current' : 'border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <span className={`material-symbols-outlined text-3xl ${a.unlocked ? 'text-current' : 'text-gray-500'}`}>
                    {a.icon || 'emoji_events'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-white truncate">{name(a)}</h3>
                  <span className="text-xs font-medium uppercase tracking-wide">
                    {t(`achievementsPage.rarity.${a.rarity}`, { defaultValue: a.rarity })}
                  </span>
                </div>
              </div>
              {desc(a) && <p className="text-sm text-gray-400 line-clamp-2 mb-3">{desc(a)}</p>}
              <div className="mt-auto flex items-center justify-between gap-2 text-xs">
                {a.xpReward > 0 && (
                  <span className="text-yellow-500 font-semibold">+{a.xpReward} XP</span>
                )}
                {a.unlocked ? (
                  <span className="text-gray-500">{t('achievementsPage.unlocked', { defaultValue: 'Unlocked' })}</span>
                ) : (
                  <span className="text-gray-500">{t('achievementsPage.locked', { defaultValue: 'Locked' })}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
