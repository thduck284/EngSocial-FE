import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { questsService, challengesService } from '../services'
import { ROUTES } from '../constants'
import { buildPeriodicQuestDisplay } from '../utils/periodicQuestDisplay.js'
import { useAuth } from '../context/AuthContext'

const TAB_QUESTS = 'quests'
const TAB_CHALLENGES = 'challenges'

const TYPE_LABELS = {
  daily: 'quests.daily',
  weekly: 'quests.weekly',
  monthly: 'quests.monthly',
  one_time: 'quests.oneTime',
}

const TYPE_COLORS = {
  daily: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  weekly: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  one_time: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  monthly: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  special: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

const CHALLENGE_WINDOW_BADGE_CLASS =
  'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'

function getTargetBounds(quest) {
  const c = quest.condition || {}
  const lo = Number(c.targetMin ?? c.target ?? quest.targetValue ?? 1)
  const hiRaw = Number(c.targetMax ?? c.target ?? lo)
  const min = Math.min(lo, Number.isFinite(hiRaw) ? hiRaw : lo)
  const max = Math.max(lo, Number.isFinite(hiRaw) ? hiRaw : lo)
  return { min, max, isRange: min !== max }
}

function countPartLabel(quest, progress) {
  const { min, max, isRange } = getTargetBounds(quest)
  const boundsStr = isRange ? `${min}–${max}` : `${min}`
  if (
    progress
    && Number.isFinite(progress.currentCount)
    && Number.isFinite(progress.effectiveTarget)
  ) {
    /** Chỉ hiện tiến độ / mục tiêu đã roll; không lặp (3–8) vì effectiveTarget đã đủ ý nghĩa */
    return `${progress.currentCount}/${progress.effectiveTarget}`
  }
  return boundsStr
}

function formatTarget(quest, t, progress) {
  const part = countPartLabel(quest, progress)
  const category = (quest.condition?.filters?.category || 'all').toLowerCase()
  const minScorePercent = Number(quest.condition?.filters?.minScorePercent ?? 0)
  if (category === 'friends') return `${part} ${t('quests.targetLabelFriends')}`
  if (category === 'vocabulary_notes') return `${part} ${t('quests.targetLabelVocabularyNotes')}`
  if (category === 'community_post') return `${part} ${t('quests.targetLabelCommunityPosts')}`
  if (category === 'login_streak') return `${part} ${t('quests.targetLabelLoginStreak')}`
  if (category === 'online_time') return `${part} ${t('quests.targetLabelOnlineTime')}`
  if (category === 'lesson' && minScorePercent >= 100) {
    return `${part} ${t('quests.lessons')} (100%)`
  }
  if (category === 'practice') {
    const target = Number(progress?.effectiveTarget ?? quest.condition?.target ?? 0)
    const label =
      target === 1 ? t('quests.practiceSession_one') : t('quests.practiceSession_other')
    return `${part} ${label}`
  }
  if (category === 'all') return `${part} ${t('quests.lessonOrPractice')}`
  const single = getTargetBounds(quest).min === 1
  return `${part} ${single ? t('quests.lesson') : t('quests.lessons')}`
}

/** Icon Material cho dòng mục tiêu / fallback tiêu đề khi pool trả về `flag` chung chung */
function periodicQuestCategoryIcon(quest) {
  const category = (quest.condition?.filters?.category || 'all').toLowerCase()
  const map = {
    lesson: 'menu_book',
    practice: 'fitness_center',
    all: 'sync_alt',
    friends: 'group_add',
    vocabulary_notes: 'note_alt',
    community_post: 'forum',
    login_streak: 'local_fire_department',
    online_time: 'timer',
  }
  return map[category] || 'flag'
}

/** Phần trăm hoàn thành (0–100) theo currentCount / effectiveTarget; quest đã completed → 100. */
function periodicQuestProgressPercent(quest, progressFromMap) {
  if (quest.completed) return 100
  const up = quest.userProgress ?? progressFromMap ?? {}
  const target = Number(up.effectiveTarget ?? quest.condition?.target ?? 0)
  const cur = Number(up.currentCount ?? 0)
  if (!Number.isFinite(target) || target <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((cur / target) * 100)))
}

/** Join URL for quest: social → trang tương ứng; lesson → /lesson; practice/all → luyện kỹ năng. */
function getQuestJoinTo(quest) {
  if (!quest) return ROUTES.LESSON
  const category = (quest.condition?.filters?.category || 'all').toLowerCase()
  if (category === 'friends') return ROUTES.FRIENDS
  if (category === 'vocabulary_notes') return `${ROUTES.WORDS_NOTES}/notes`
  if (category === 'community_post') return ROUTES.COMMUNITY
  if (category === 'login_streak' || category === 'online_time') return ROUTES.HOME
  const skill = (quest.condition?.filters?.skill || quest.skill || 'all').toLowerCase()
  if (category === 'practice' || category === 'all') {
    if (skill === 'all' || skill === '') return ROUTES.SKILLS.READING
    if (skill === 'listening') return ROUTES.SKILLS.LISTENING
    if (skill === 'writing') return ROUTES.SKILLS.WRITING
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

function challengeRequirementUnit(t, challenge) {
  const type = challenge.requirement?.type || 'lessons'
  const valid = ['lessons', 'time', 'score', 'streak']
  const k = valid.includes(type) ? type : 'lessons'
  return t(`quests.challengeReq.${k}`)
}

function formatChallengeTargetLine(challenge, t, participation) {
  const target = Math.max(0, Number(participation?.target ?? challenge.requirement?.target ?? 0))
  const unit = challengeRequirementUnit(t, challenge)
  if (participation) {
    const cur = Math.max(0, Number(participation.progress ?? 0))
    return t('quests.challengeProgressFormat', { current: cur, target, unit })
  }
  return t('quests.challengeGoalFormat', { target, unit })
}

function challengeProgressPercent(challenge, participation) {
  if (participation?.completed) return 100
  const target = Number(participation?.target ?? challenge.requirement?.target ?? 0)
  const cur = Number(participation?.progress ?? 0)
  if (!Number.isFinite(target) || target <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((cur / target) * 100)))
}

function challengeRequirementIcon(challenge) {
  const type = challenge.requirement?.type || 'lessons'
  const map = {
    /** lessons = đếm chung bài học + luyện tập */
    lessons: 'sync_alt',
    time: 'timer',
    score: 'grading',
    streak: 'local_fire_department',
  }
  return map[type] || 'emoji_events'
}

function pickChallengeLocaleText(challenge, lang) {
  const isEn = String(lang || '').toLowerCase().startsWith('en')
  const title = isEn
    ? (challenge.titleEn || challenge.title || challenge.titleVi || '')
    : (challenge.titleVi || challenge.title || challenge.titleEn || '')
  const description = isEn
    ? (challenge.descriptionEn || challenge.description || challenge.descriptionVi || '')
    : (challenge.descriptionVi || challenge.description || challenge.descriptionEn || '')
  return { title, description }
}

export function QuestsPage() {
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [tab, setTab] = useState(() => (location.pathname === ROUTES.CHALLENGE ? TAB_CHALLENGES : TAB_QUESTS))
  const [quests, setQuests] = useState([])
  const [questProgressMap, setQuestProgressMap] = useState({})
  const [challenges, setChallenges] = useState([])
  const [challengeParticipationByChallengeId, setChallengeParticipationByChallengeId] = useState({})
  const [loading, setLoading] = useState(true)
  const [challengesLoading, setChallengesLoading] = useState(false)
  const [filterType, setFilterType] = useState('all')

  const loadQuests = useCallback(() => {
    setLoading(true)
    if (!isAuthenticated) {
      setQuests([])
      setQuestProgressMap({})
      setLoading(false)
      return
    }
    questsService
      .getMyPeriodic()
      .then((res) => {
        const inner = res?.data ?? {}
        const list = inner.quests ?? inner.data?.quests ?? []
        const quests = Array.isArray(list) ? list : []
        setQuests(quests)
        const m = {}
        for (const q of quests) {
          if (q.id && q.userProgress) m[q.id] = q.userProgress
        }
        setQuestProgressMap(m)
      })
      .catch(() => {
        setQuests([])
        setQuestProgressMap({})
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const questsByType = useMemo(() => {
    const order = ['daily', 'weekly']
    const grouped = { daily: [], weekly: [] }
    quests.forEach((q) => {
      const type = q.type && grouped[q.type] ? q.type : 'daily'
      grouped[type].push(q)
    })
    let groups = order
      .map((type) => {
        const list = grouped[type] || []
        const listSorted = [...list].sort((a, b) => {
          const ac = a.completed ? 1 : 0
          const bc = b.completed ? 1 : 0
          return ac - bc
        })
        return { type, list: listSorted }
      })
      .filter((g) => g.list.length > 0)
    if (filterType !== 'all') {
      groups = groups.filter((g) => g.type === filterType)
    }
    return groups
  }, [quests, filterType])

  const loadChallenges = useCallback(() => {
    setChallengesLoading(true)
    const listPromise = challengesService.getChallenges({ status: 'active', limit: 50 })
    const minePromise = isAuthenticated ? challengesService.getMine({ limit: 100 }) : Promise.resolve(null)
    Promise.all([
      listPromise.catch(() => null),
      minePromise.catch(() => null),
    ])
      .then(([resList, resMine]) => {
        if (resList) {
          const list = resList?.data?.data ?? resList?.data ?? []
          setChallenges(Array.isArray(list) ? list : [])
        } else {
          setChallenges([])
        }
        const m = {}
        if (resMine) {
          const rows = resMine?.data?.data ?? resMine?.data ?? []
          for (const row of Array.isArray(rows) ? rows : []) {
            const cid = row.challenge?.id ?? row.challengeId
            if (cid)
              m[String(cid)] = {
                progress: row.progress,
                target: row.target,
                completed: row.completed,
              }
          }
        }
        setChallengeParticipationByChallengeId(m)
      })
      .finally(() => setChallengesLoading(false))
  }, [isAuthenticated])

  const challengesSorted = useMemo(() => {
    return [...challenges].sort((a, b) => {
      const endA = new Date(a.endDate).getTime()
      const endB = new Date(b.endDate).getTime()
      return endA - endB
    })
  }, [challenges])

  useEffect(() => {
    loadQuests()
  }, [loadQuests])

  useEffect(() => {
    if (tab === TAB_CHALLENGES) loadChallenges()
  }, [tab, loadChallenges])

  useEffect(() => {
    if (location.pathname === ROUTES.CHALLENGE) {
      setTab(TAB_CHALLENGES)
      return
    }
    if (location.pathname === ROUTES.QUESTS) {
      setTab(TAB_QUESTS)
    }
  }, [location.pathname])

  useEffect(() => {
    if (tab === TAB_QUESTS && filterType === 'one_time') setFilterType('all')
  }, [tab, filterType])

  const formatChallengeDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const locale = i18n.language?.startsWith('en') ? 'en-GB' : 'vi-VN'
    return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <main className="max-w-[1440px] mx-auto p-6 flex flex-col">
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <aside className="flex flex-col gap-3 shrink-0 lg:w-48">
          <Link
            to="/quests"
            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm text-left ${tab === TAB_QUESTS ? 'bg-primary text-white shadow-primary/20' : 'bg-white dark:bg-card-dark text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-border-dark'}`}
          >
            {t('quests.tabQuests')}
          </Link>
          <Link
            to="/challenge"
            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm text-left ${tab === TAB_CHALLENGES ? 'bg-primary text-white shadow-primary/20' : 'bg-white dark:bg-card-dark text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-border-dark'}`}
          >
            {t('quests.tabChallenges')}
          </Link>
          <div className="relative mt-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none"
            >
              {tab === TAB_QUESTS ? (
                <>
                  <option value="all">{t('quests.filterAll')}</option>
                  <option value="daily">{t('quests.daily')}</option>
                  <option value="weekly">{t('quests.weekly')}</option>
                </>
              ) : (
                <option value="all">{t('quests.challengeFilterAll')}</option>
              )}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
              expand_more
            </span>
          </div>
          <p className="mt-2 text-[10px] text-slate-400 dark:text-gray-500 leading-relaxed px-1">
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
        <div className="space-y-8">
          {questsByType.map(({ type, list }) => (
            <section key={type}>
              <div className="flex items-center gap-2 mb-4 px-1">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">
                  {t(TYPE_LABELS[type] || 'quests.daily')}
                </h2>
              </div>
              <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 flex-nowrap">
                {list.map((quest) => {
                  const { title: questTitle, description: questDescription } = buildPeriodicQuestDisplay(quest, t)
                  const progressPct = periodicQuestProgressPercent(
                    quest,
                    questProgressMap[quest.id]
                  )
                  const isDone = Boolean(quest.completed)
                  return (
                  <div
                    key={quest.id || `${quest.type}-${quest.slotIndex}`}
                    className={`bg-white dark:bg-card-dark rounded-2xl p-6 border transition-all flex-shrink-0 flex flex-col w-[340px] shadow-sm hover:shadow-md ${
                      isDone
                        ? 'border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-500/5'
                        : 'border-slate-200 dark:border-border-dark hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-4 shrink-0">
                      <span
                        className={`inline-block text-center px-3 py-1 text-[10px] font-black rounded-lg border shadow-sm ${
                          TYPE_COLORS[quest.type] || 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {t(TYPE_LABELS[quest.type] || 'quests.daily').toUpperCase()}
                      </span>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-tight text-emerald-600 dark:text-emerald-400 shadow-sm">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            {t('quests.periodicDoneBadge')}
                          </span>
                        ) : null}
                        <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500 text-sm font-black">
                          <span className="material-symbols-outlined text-base fill-icon">star</span>
                          +{quest.xpReward} XP
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <span className="material-symbols-outlined text-2xl">
                          {quest.icon && quest.icon !== 'flag' ? quest.icon : periodicQuestCategoryIcon(quest)}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{questTitle}</h3>
                    </div>
                    <div className="mb-4 min-h-[40px]">
                      {questDescription ? <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{questDescription}</p> : null}
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {t('quests.progress')}
                        </span>
                        <span className="text-xs font-black tabular-nums text-primary">
                          {t('quests.progressPercent', { percent: progressPct })}
                        </span>
                      </div>
                      <div
                        className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden shadow-inner"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progressPct}
                        aria-label={t('quests.progress')}
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${
                            isDone ? 'bg-emerald-500' : 'bg-primary'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-border-dark mt-auto">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-gray-300">
                        <span className="material-symbols-outlined text-base text-primary/70">
                          {periodicQuestCategoryIcon(quest)}
                        </span>
                        <span className="truncate">{formatTarget(quest, t, quest.userProgress ?? questProgressMap[quest.id])}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Link
                          to={getQuestJoinTo(quest)}
                          className={`px-5 py-2 rounded-xl text-xs font-black transition-all shadow-sm ${
                            isDone
                              ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-500/20'
                              : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
                          }`}
                        >
                          {isDone ? t('quests.periodicDoneCta') : t('buttons.join')}
                        </Link>
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === TAB_QUESTS && !loading && quests.length === 0 && (
        <div className="text-center py-24 bg-white dark:bg-card-dark rounded-3xl border-2 border-dashed border-slate-200 dark:border-border-dark">
          <div className="size-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:opacity-50">flag</span>
          </div>
          <p className="text-slate-500 dark:text-gray-400 font-bold">{isAuthenticated ? t('quests.empty') : t('quests.periodicLoginHint')}</p>
        </div>
      )}

      {tab === TAB_CHALLENGES && challengesLoading && (
        <div className="flex justify-center py-16">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      )}

      {tab === TAB_CHALLENGES && !challengesLoading && challenges.length > 0 && (
        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4 px-1">
              <div className="h-4 w-1 bg-primary rounded-full" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">
                {t('quests.sectionChallenges')}
              </h2>
            </div>
            <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 flex-nowrap">
              {challengesSorted.map((challenge) => {
                const participation = challengeParticipationByChallengeId[String(challenge.id)]
                const progressPct = challengeProgressPercent(challenge, participation)
                const targetLine = formatChallengeTargetLine(challenge, t, participation)
                const windowLabel = `${formatChallengeDate(challenge.startDate)} – ${formatChallengeDate(challenge.endDate)}`
                const localeText = pickChallengeLocaleText(challenge, i18n.language)
                return (
                  <div
                    key={challenge.id}
                    className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-border-dark hover:border-primary/40 transition-all flex-shrink-0 flex flex-col w-[340px] shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2 mb-4 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black rounded-lg border shadow-sm ${CHALLENGE_WINDOW_BADGE_CLASS.replace('text-emerald-200', 'text-emerald-700 dark:text-emerald-200').replace('bg-emerald-500/10', 'bg-emerald-50 dark:bg-emerald-500/10')}`}
                      >
                        <span className="material-symbols-outlined text-base shrink-0">event</span>
                        <span className="min-w-0">{windowLabel}</span>
                      </span>
                      <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500 text-sm font-black shrink-0">
                        <span className="material-symbols-outlined text-base fill-icon">star</span>
                        +{challenge.xpReward ?? 0} XP
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                        <span className="material-symbols-outlined text-2xl">
                          {challenge.icon || 'emoji_events'}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{localeText.title}</h3>
                    </div>
                    <div className="mb-4 min-h-[40px]">
                      {localeText.description && (
                        <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {localeText.description}
                        </p>
                      )}
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {t('quests.progress')}
                        </span>
                        <span className="text-xs font-black tabular-nums text-primary">
                          {t('quests.progressPercent', { percent: progressPct })}
                        </span>
                      </div>
                      <div
                        className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden shadow-inner"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progressPct}
                        aria-label={t('quests.progress')}
                      >
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500 ease-out shadow-sm"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      {isAuthenticated && !participation ? (
                        <p className="mt-2 text-[10px] text-slate-400 dark:text-gray-500 leading-relaxed italic">
                          {t('quests.challengeProgressJoinHint')}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-border-dark mt-auto">
                      <div className="flex flex-col gap-0.5 min-w-0 text-[11px] font-bold text-slate-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-indigo-500/70 shrink-0">
                            {challengeRequirementIcon(challenge)}
                          </span>
                          <span className="truncate">{targetLine}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium pl-6">
                          {t('quests.participantsCount', { count: challenge.participantCount ?? 0 })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Link
                          to={getChallengeJoinTo(challenge)}
                          className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black transition-all shadow-sm shadow-primary/20"
                        >
                          {t('buttons.join')}
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {tab === TAB_CHALLENGES && !challengesLoading && challenges.length === 0 && (
        <div className="text-center py-24 bg-white dark:bg-card-dark rounded-3xl border-2 border-dashed border-slate-200 dark:border-border-dark">
          <div className="size-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:opacity-50">emoji_events</span>
          </div>
          <p className="text-slate-500 dark:text-gray-400 font-bold">{t('quests.challengesEmpty')}</p>
        </div>
      )}
        </div>
      </div>
    </main>
  )
}

