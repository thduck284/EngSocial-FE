import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { questsService, challengesService } from '../services'
import { ROUTES } from '../constants'

const TAB_QUESTS = 'quests'
const TAB_CHALLENGES = 'challenges'

const TYPE_LABELS = {
  daily: 'quests.daily',
  weekly: 'quests.weekly',
  one_time: 'quests.oneTime',
}

const TYPE_COLORS = {
  daily: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  weekly: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  one_time: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  monthly: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  special: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

const CHALLENGE_TYPE_LABELS = {
  daily: 'quests.daily',
  weekly: 'quests.weekly',
  monthly: 'quests.monthly',
  special: 'quests.oneTime',
}

function formatTarget(quest, t) {
  const v = quest.targetValue
  if (quest.targetType === 'lesson') return `${v} ${v === 1 ? t('quests.lesson') : t('quests.lessons')}`
  if (quest.targetType === 'practice_skill') return `${v} ${t('quests.practice')}`
  if (quest.targetType === 'both') return `${v} ${t('quests.lessonOrPractice')}`
  return `${v} ${t('quests.lessons')}`
}

/** Join URL for quest: lesson -> /lesson; practice_skill: skill "all" or empty -> reading, else specific skill. */
function getQuestJoinTo(quest) {
  if (!quest) return ROUTES.LESSON
  const t = quest.targetType
  if (t === 'lesson') return ROUTES.LESSON
  if (t === 'practice_skill') {
    const s = (quest.skill || 'all').toLowerCase()
    if (s === 'all' || s === '') return ROUTES.SKILLS.READING
    if (s === 'listening') return ROUTES.SKILLS.LISTENING
    if (s === 'writing') return ROUTES.SKILLS.WRITING
    return ROUTES.SKILLS.READING
  }
  return ROUTES.LESSON
}

/** Challenge Join always goes to practice (skills); URL depends on challenge.skill: all -> reading, else that skill. */
function getChallengeJoinTo(challenge) {
  if (!challenge) return ROUTES.SKILLS.READING
  const s = (challenge.skill || 'all').toLowerCase()
  if (s === 'all' || s === '') return ROUTES.SKILLS.READING
  if (s === 'listening') return ROUTES.SKILLS.LISTENING
  if (s === 'writing') return ROUTES.SKILLS.WRITING
  return ROUTES.SKILLS.READING
}

export function QuestsPage() {
  const { t } = useTranslation()
  const { isModerator, isAdmin } = useAuth()
  const canAddQuest = isModerator || isAdmin
  const [tab, setTab] = useState(TAB_QUESTS)
  const [quests, setQuests] = useState([])
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [challengesLoading, setChallengesLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deletingChallengeId, setDeletingChallengeId] = useState(null)
  const [filterType, setFilterType] = useState('all')

  const TYPE_ORDER = { one_time: 0, daily: 1, weekly: 2 }

  const loadQuests = () => {
    setLoading(true)
    questsService
      .getQuests({ status: 'active' })
      .then((res) => setQuests(res?.data || []))
      .catch(() => setQuests([]))
      .finally(() => setLoading(false))
  }

  const questsByType = useMemo(() => {
    const order = ['one_time', 'daily', 'weekly']
    const grouped = { one_time: [], daily: [], weekly: [] }
    quests.forEach((q) => {
      if (grouped[q.type]) grouped[q.type].push(q)
    })
    let groups = order.map((type) => ({ type, list: grouped[type] || [] })).filter((g) => g.list.length > 0)
    if (filterType !== 'all') {
      groups = groups.filter((g) => g.type === filterType)
    }
    return groups
  }, [quests, filterType])

  const loadChallenges = () => {
    setChallengesLoading(true)
    const params = { status: 'active', limit: 50 }
    if (filterType !== 'all') {
      // BE dùng 'special' cho one-time challenges
      if (filterType === 'one_time') params.type = 'special'
      else params.type = filterType
    }
    challengesService
      .getChallenges(params)
      .then((res) => {
        const list = res?.data?.data ?? res?.data ?? []
        setChallenges(Array.isArray(list) ? list : [])
      })
      .catch(() => setChallenges([]))
      .finally(() => setChallengesLoading(false))
  }

  const challengesByType = useMemo(() => {
    const order = ['special', 'daily', 'weekly', 'monthly']
    const grouped = { daily: [], weekly: [], monthly: [], special: [] }
    challenges.forEach((c) => {
      const type = c.type && grouped[c.type] ? c.type : 'daily'
      grouped[type].push(c)
    })
    return order.map((type) => ({ type, list: grouped[type] || [] })).filter((g) => g.list.length > 0)
  }, [challenges])

  useEffect(() => {
    loadQuests()
  }, [])

  useEffect(() => {
    if (tab === TAB_CHALLENGES) loadChallenges()
  }, [tab, filterType])

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

  const handleDeleteChallenge = async (challenge) => {
    if (!challenge?.id) return
    if (!window.confirm(t('quests.confirmDelete', { title: challenge.title || challenge.titleVi }))) return
    setDeletingChallengeId(challenge.id)
    try {
      await challengesService.delete(challenge.id)
      loadChallenges()
    } catch {
      setDeletingChallengeId(null)
    } finally {
      setDeletingChallengeId(null)
    }
  }

  const formatChallengeDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <main className="max-w-[1440px] mx-auto p-6 flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div />
        <div className="flex items-center gap-3">
          {canAddQuest && tab === TAB_QUESTS && (
            <Link
              to={ROUTES.MANAGE_QUESTS}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-xl text-sm transition-all shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              {t('quests.addQuestBtn')}
            </Link>
          )}
          {canAddQuest && tab === TAB_CHALLENGES && (
            <Link
              to={ROUTES.MANAGE_CHALLENGES}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-xl text-sm transition-all shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              {t('quests.addChallengeBtn')}
            </Link>
          )}
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0 mt-2">
        <aside className="flex flex-col gap-3 shrink-0 w-40">
          <button
            type="button"
            onClick={() => setTab(TAB_QUESTS)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${tab === TAB_QUESTS ? 'bg-primary text-background-dark' : 'bg-card-dark text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            {t('quests.tabQuests')}
          </button>
          <button
            type="button"
            onClick={() => setTab(TAB_CHALLENGES)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${tab === TAB_CHALLENGES ? 'bg-primary text-background-dark' : 'bg-card-dark text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            {t('quests.tabChallenges')}
          </button>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="mt-1 w-full min-w-[10rem] shrink-0 bg-card-dark border border-border-dark rounded-xl px-3 py-2 text-xs text-gray-300 outline-none focus:ring-2 focus:ring-primary"
            style={{ width: '10rem' }}
          >
            <option value="all">Tất cả</option>
            <option value="one_time">One-time</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          <p className="mt-1 text-[10px] text-gray-500 leading-snug">
            {tab === TAB_QUESTS ? t('quests.filterTipQuests') : t('quests.filterTipChallenges')}
          </p>
        </aside>
        <div className="flex-1 min-w-0 w-full overflow-hidden">
      {tab === TAB_QUESTS && loading && (
        <div className="flex justify-center py-16">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      )}

      {tab === TAB_QUESTS && !loading && quests.length > 0 && (
        <div className="space-y-6">
          {questsByType.map(({ type, list }) => (
            <section key={type}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {t(TYPE_LABELS[type] || 'quests.daily')}
              </h2>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-1 flex-nowrap">
                {list.map((quest) => (
                  <div
                    key={quest.id || quest.title}
                    className="bg-card-dark rounded-xl p-5 border border-border-dark hover:border-primary/50 transition-all flex-shrink-0 flex flex-col w-[360px] max-w-[360px]"
                    style={{ boxSizing: 'border-box' }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3 min-h-[28px] shrink-0">
                      <span
                        style={{ width: '6rem', minWidth: '6rem', flexShrink: 0 }}
                        className={`inline-block text-center px-2 py-1 text-[10px] font-bold rounded border ${
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
                    <div className="mb-3 min-h-[32px]">
                      {quest.description && <p className="text-xs text-gray-400 line-clamp-2">{quest.description}</p>}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-border-dark">
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <span className="material-symbols-outlined text-sm">flag</span>
                        <span>{formatTarget(quest, t)}</span>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        {canAddQuest && (
                          <>
                            <Link to={`/manage/quests/${quest.id}`} className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-primary transition-colors" title={t('quests.edit')}>
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </Link>
                            <button type="button" onClick={() => handleDelete(quest)} disabled={deletingId === quest.id} className="p-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50" title={t('quests.delete')}>
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </>
                        )}
                        {quest.targetType !== 'both' && (
                          <Link
                            to={getQuestJoinTo(quest)}
                            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-background-dark text-sm font-semibold transition-colors"
                          >
                            {t('buttons.join')}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === TAB_QUESTS && !loading && quests.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <span className="material-symbols-outlined text-5xl mb-4 block opacity-50">flag</span>
          <p>{t('quests.empty')}</p>
        </div>
      )}

      {tab === TAB_CHALLENGES && challengesLoading && (
        <div className="flex justify-center py-16">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      )}

      {tab === TAB_CHALLENGES && !challengesLoading && challenges.length > 0 && (
        <div className="space-y-6">
          {challengesByType.map(({ type, list }) => (
            <section key={type}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {t(CHALLENGE_TYPE_LABELS[type] || 'quests.weekly')}
              </h2>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-1 flex-nowrap">
                {list.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="bg-card-dark rounded-xl p-5 border border-border-dark hover:border-primary/50 transition-all flex-shrink-0 flex flex-col w-[360px] max-w-[360px]"
                    style={{ boxSizing: 'border-box' }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3 min-h-[28px] shrink-0">
                      <span style={{ width: '6rem', minWidth: '6rem', flexShrink: 0 }} className={`inline-block text-center px-2 py-1 text-[10px] font-bold rounded border ${TYPE_COLORS[challenge.type] || 'bg-gray-600 text-gray-300 border-gray-500/20'}`}>
                        {t(CHALLENGE_TYPE_LABELS[challenge.type] || 'quests.weekly')}
                      </span>
                      <span className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                        <span className="material-symbols-outlined text-base fill-icon">star</span>
                        +{challenge.xpReward ?? 0} XP
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-primary text-xl">{challenge.icon || 'emoji_events'}</span>
                      <h3 className="font-bold text-white">{challenge.title || challenge.titleVi}</h3>
                    </div>
                    <div className="mb-3 min-h-[32px]">
                      {(challenge.description || challenge.descriptionVi) && (
                        <p className="text-xs text-gray-400 line-clamp-2">{challenge.description || challenge.descriptionVi}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {formatChallengeDate(challenge.startDate)} – {formatChallengeDate(challenge.endDate)}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-border-dark">
                      <span className="text-xs text-gray-400">
                        {t('quests.participantsCount', { count: challenge.participantCount ?? 0 })}
                      </span>
                      <div className="flex items-center gap-1">
                        {canAddQuest && (
                          <>
                            <Link to={`${ROUTES.MANAGE_CHALLENGES}/${challenge.id}`} className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-primary transition-colors" title={t('quests.edit')}>
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </Link>
                            <button type="button" onClick={() => handleDeleteChallenge(challenge)} disabled={deletingChallengeId === challenge.id} className="p-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50" title={t('quests.delete')}>
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </>
                        )}
                        <Link
                          to={getChallengeJoinTo(challenge)}
                          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-background-dark text-sm font-semibold transition-colors"
                        >
                          {t('buttons.join')}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === TAB_CHALLENGES && !challengesLoading && challenges.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <span className="material-symbols-outlined text-5xl mb-4 block opacity-50">emoji_events</span>
          <p>{t('quests.challengesEmpty')}</p>
        </div>
      )}
        </div>
      </div>
    </main>
  )
}
