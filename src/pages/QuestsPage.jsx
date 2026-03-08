import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { questsService } from '../services'
import { ROUTES } from '../constants'

const TYPE_LABELS = {
  daily: 'quests.daily',
  weekly: 'quests.weekly',
  one_time: 'quests.oneTime',
}

const TYPE_COLORS = {
  daily: 'bg-primary/10 text-primary border-primary/20',
  weekly: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  one_time: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

function formatTarget(quest, t) {
  const v = quest.targetValue
  if (quest.targetType === 'lesson') return `${v} ${v === 1 ? t('quests.lesson') : t('quests.lessons')}`
  if (quest.targetType === 'practice_skill') return `${v} ${t('quests.practice')}`
  if (quest.targetType === 'both') return `${v} ${t('quests.lessonOrPractice')}`
  return `${v} ${t('quests.lessons')}`
}

export function QuestsPage() {
  const { t } = useTranslation()
  const { isModerator, isAdmin } = useAuth()
  const canAddQuest = isModerator || isAdmin
  const [quests, setQuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const loadQuests = () => {
    setLoading(true)
    questsService
      .getQuests({ status: 'active' })
      .then((res) => setQuests(res?.data || []))
      .catch(() => setQuests([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadQuests()
  }, [])

  const handleDelete = async (quest) => {
    if (!quest?.id) return
    if (!window.confirm(t('quests.confirmDelete', { title: quest.title }))) return
    setDeletingId(quest.id)
    try {
      await questsService.delete(quest.id)
      loadQuests()
    } catch {
      setDeletingId(null)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="max-w-[1440px] mx-auto p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('header.quests')}</h1>
          <p className="text-gray-400 text-sm">{t('quests.subtitle')}</p>
        </div>
        {canAddQuest && (
          <Link to={ROUTES.MANAGE_QUESTS} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-xl text-sm transition-all shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Thêm quest
          </Link>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      )}

      {!loading && quests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quests.map((quest) => (
            <div
              key={quest.id || quest.title}
              className="bg-card-dark rounded-xl p-5 border border-border-dark hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`px-2 py-1 text-[10px] font-bold rounded border ${
                    TYPE_COLORS[quest.type] || 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {t(TYPE_LABELS[quest.type] || 'quests.daily')}
                </span>
                <span className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                  <span className="material-symbols-outlined text-base fill-icon">star</span>
                  +{quest.xpReward} XP
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-xl">{quest.icon || 'flag'}</span>
                <h3 className="font-bold text-white">{quest.title}</h3>
              </div>
              {quest.description && (
                <p className="text-xs text-gray-400 mb-4 line-clamp-2">{quest.description}</p>
              )}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border-dark">
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <span className="material-symbols-outlined text-sm">flag</span>
                  <span>{formatTarget(quest, t)}</span>
                </div>
                {canAddQuest && (
                  <div className="flex items-center gap-1 ml-auto">
                    <Link to={`/manage/quests/${quest.id}`} className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-primary transition-colors" title="Sửa">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </Link>
                    <button type="button" onClick={() => handleDelete(quest)} disabled={deletingId === quest.id} className="p-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50" title={t('quests.delete')}>
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && quests.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <span className="material-symbols-outlined text-5xl mb-4 block opacity-50">flag</span>
          <p>{t('quests.empty')}</p>
        </div>
      )}
    </main>
  )
}
