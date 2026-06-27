import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { lessonsService } from '../../services'
import { buildStudentLessonResultUrl } from '../../utils/lessonResultLinks'
import { formatTimeSpentDuration } from '../../utils/dateTime'

const selectClass =
  'w-full bg-background-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-shadow appearance-none cursor-pointer bg-[length:1rem] bg-[right_0.65rem_center] bg-no-repeat pr-9'

function formatDt(iso, locale) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function statusLabel(status, t) {
  if (status === 'completed') return t('manageLessons.resultStatusCompleted')
  if (status === 'under_review') return t('manageLessons.resultStatusReview')
  return t('manageLessons.resultStatusProgress')
}

export function ManageLessonResultsFlow({ lesson, onBack }) {
  const { t, i18n } = useTranslation()
  const lessonId = lesson?.id ?? lesson?._id
  const lessonSkill = lesson?.skill || 'reading'
  const isWriting = lessonSkill === 'writing'

  const [view, setView] = useState('students')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [lessonDetail, setLessonDetail] = useState(lesson)
  const [activeStudent, setActiveStudent] = useState(null)

  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [gradingAttempt, setGradingAttempt] = useState(null)
  const [gradeScore, setGradeScore] = useState('')
  const [gradeFeedback, setGradeFeedback] = useState('')
  const [gradingSubmitting, setGradingSubmitting] = useState(false)
  const [gradingAiLoading, setGradingAiLoading] = useState(false)

  const loadResults = useCallback(async () => {
    if (!lessonId) return
    setLoading(true)
    try {
      const [res, detailRes] = await Promise.all([
        lessonsService.getAllResults(lessonId, { limit: 500 }),
        lessonsService.getById(lessonId).catch(() => null),
      ])
      setResults(Array.isArray(res?.data) ? res.data : [])
      if (detailRes?.data) setLessonDetail(detailRes.data)
    } catch (e) {
      console.error(e)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    loadResults()
  }, [loadResults])

  const studentGroups = useMemo(() => {
    const map = new Map()
    for (const r of results) {
      const uid = r.user?.id || r.user?._id
      if (!uid) continue
      if (!map.has(String(uid))) {
        map.set(String(uid), { user: r.user, attempts: [] })
      }
      map.get(String(uid)).attempts.push(r)
    }
    return Array.from(map.values())
      .map((g) => {
        const attempts = [...g.attempts].sort((a, b) => (b.attemptNo || 0) - (a.attemptNo || 0))
        const bestScore = Math.max(...attempts.map((a) => Number(a.score) || 0), 0)
        const latest = attempts[0]
        const hasReview = attempts.some((a) => a.status === 'under_review')
        const status = hasReview ? 'under_review' : latest?.status || 'completed'
        return {
          user: g.user,
          attempts,
          attemptCount: attempts.length,
          bestScore,
          maxScore: latest?.maxScore || 100,
          latestAt: latest?.completedAt,
          status,
        }
      })
      .sort((a, b) => new Date(b.latestAt || 0).getTime() - new Date(a.latestAt || 0).getTime())
  }, [results])

  useEffect(() => {
    if (view !== 'attempts' || !activeStudent?.user) return
    const uid = String(activeStudent.user.id || activeStudent.user._id)
    const updated = studentGroups.find((g) => String(g.user?.id || g.user?._id) === uid)
    if (updated) setActiveStudent(updated)
  }, [studentGroups, view, activeStudent?.user])

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return studentGroups.filter((g) => {
      if (statusFilter !== 'all' && g.status !== statusFilter) return false
      if (!q) return true
      const hay = [g.user?.name, g.user?.email].filter(Boolean).join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [studentGroups, statusFilter, searchQuery])

  const filteredAttempts = useMemo(() => {
    if (!activeStudent) return []
    const q = searchQuery.trim().toLowerCase()
    return activeStudent.attempts.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      if (!q) return true
      return String(a.attemptNo || '').includes(q)
    })
  }, [activeStudent, statusFilter, searchQuery])

  const openStudent = (group) => {
    setActiveStudent(group)
    setView('attempts')
    setStatusFilter('all')
    setSearchQuery('')
  }

  const backToStudents = () => {
    setView('students')
    setActiveStudent(null)
    setStatusFilter('all')
    setSearchQuery('')
  }

  const openResultDetail = (attempt) => {
    const url = buildStudentLessonResultUrl(
      {
        ...lessonDetail,
        skill: lessonSkill,
        category: lessonDetail?.category ?? lesson?.category,
      },
      attempt,
    )
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  const openGrading = (attempt) => {
    setGradingAttempt(attempt)
    setGradeScore(String(attempt.score ?? attempt.submission?.score ?? ''))
    setGradeFeedback(attempt.submission?.feedback ?? '')
  }

  const onUseAIResult = () => {
    if (!gradingAttempt?.submission) return
    setGradeScore(String(gradingAttempt.submission.aiScore ?? ''))
    setGradeFeedback(gradingAttempt.submission.aiFeedback ?? '')
  }

  const handleGradeWithAi = async () => {
    if (!gradingAttempt || !lessonId) return
    const userId = gradingAttempt.user?.id || gradingAttempt.user?._id
    setGradingAiLoading(true)
    try {
      const res = await lessonsService.aiGradeWriting(lessonId, userId, {
        attemptNo: gradingAttempt.attemptNo,
      })
      const sub = res?.data?.submission
      if (sub) {
        setGradingAttempt((prev) => ({ ...prev, submission: { ...prev.submission, ...sub } }))
        setGradeScore(String(sub.aiScore ?? ''))
        setGradeFeedback(sub.aiFeedback ?? '')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setGradingAiLoading(false)
    }
  }

  const onSubmitGrade = async () => {
    if (!gradingAttempt || !lessonId) return
    const userId = gradingAttempt.user?.id || gradingAttempt.user?._id
    setGradingSubmitting(true)
    try {
      await lessonsService.gradeWriting(lessonId, userId, {
        score: Number(gradeScore),
        feedback: gradeFeedback,
        attemptNo: gradingAttempt.attemptNo,
      })
      await loadResults()
      setGradingAttempt(null)
    } catch (e) {
      console.error(e)
    } finally {
      setGradingSubmitting(false)
    }
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setSearchQuery('')
  }

  const hasActiveFilters = statusFilter !== 'all' || searchQuery.trim() !== ''

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <button
            type="button"
            onClick={view === 'attempts' ? backToStudents : onBack}
            className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-border-dark text-gray-300 text-xs font-bold hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            {view === 'attempts' ? t('manageLessons.backToStudents') : t('manageLessons.backToLessonList')}
          </button>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white truncate">{lessonDetail?.title || lesson?.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {view === 'students'
                ? t('manageLessons.resultsStudentsSubtitle')
                : t('manageLessons.resultsAttemptsSubtitle', { name: activeStudent?.user?.name || '' })}
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border border-primary/30 text-primary bg-primary/10 capitalize shrink-0">
          {lessonSkill}
        </span>
      </div>

      <div className="rounded-xl border border-border-dark bg-card-dark/80 backdrop-blur-sm p-4 md:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-border-dark">
          <div className="flex items-center gap-2 text-white">
            <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
              <span className="material-symbols-outlined text-[22px]">filter_alt</span>
            </span>
            <p className="text-sm font-bold">{t('manageLessons.resultsFiltersHeading')}</p>
          </div>
          {hasActiveFilters ? (
            <button type="button" onClick={clearFilters} className="text-xs font-bold text-primary hover:underline self-start">
              {t('manageLessons.clearFilters')}
            </button>
          ) : null}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('manageLessons.resultsFilterStatus')}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={selectClass}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              }}
            >
              <option value="all">{t('skills.all')}</option>
              <option value="completed">{t('manageLessons.resultStatusCompleted')}</option>
              <option value="under_review">{t('manageLessons.resultStatusReview')}</option>
              <option value="in_progress">{t('manageLessons.resultStatusProgress')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              {view === 'students' ? t('manageLessons.resultsFilterStudent') : t('manageLessons.resultsFilterAttempt')}
            </label>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={view === 'students' ? t('manageLessons.resultsSearchStudent') : t('manageLessons.resultsSearchAttempt')}
              className="w-full bg-background-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border-dark bg-card-dark overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-gray-500">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
            </div>
          ) : view === 'students' ? (
            <table className="w-full text-sm text-left min-w-[640px]">
              <thead className="border-b border-border-dark bg-black/20">
                <tr>
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase">{t('staffDashboard.colUser')}</th>
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase text-center">{t('manageLessons.colAttempts')}</th>
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase text-center">{t('staffDashboard.colScore')}</th>
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase">{t('manageLessons.colStatus')}</th>
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase text-right">{t('staffDashboard.colCompletedAt')}</th>
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase text-right">{t('manageLessons.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark/50">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      {t('staffDashboard.noResults')}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((g) => {
                    const uid = g.user?.id || g.user?._id
                    return (
                      <tr key={uid} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/20 shrink-0">
                              {g.user?.avatar ? (
                                <img src={g.user.avatar} alt="" className="size-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-primary">{g.user?.name?.[0]}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate">{g.user?.name}</p>
                              <p className="text-[10px] text-gray-500 truncate">{g.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-300">{g.attemptCount}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-black text-primary">{g.bestScore}/{g.maxScore}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-400">{statusLabel(g.status, t)}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-gray-500">{formatDt(g.latestAt, i18n.language)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openStudent(g)}
                            className="text-xs font-bold text-primary hover:underline"
                          >
                            {t('manageLessons.viewAttemptHistory')}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm text-left min-w-[640px]">
              <thead className="border-b border-border-dark bg-black/20">
                <tr>
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase">{t('manageLessons.colAttempt')}</th>
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase text-center">{t('staffDashboard.colScore')}</th>
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase">{t('manageLessons.colStatus')}</th>
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase text-center">{t('manageLessons.colTimeSpent')}</th>
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase text-right">{t('staffDashboard.colCompletedAt')}</th>
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase text-right">{t('manageLessons.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark/50">
                {filteredAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      {t('staffDashboard.noResults')}
                    </td>
                  </tr>
                ) : (
                  filteredAttempts.map((a) => (
                    <tr key={a.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white font-medium">
                        {t('manageLessons.attemptNo', { n: a.attemptNo || 1 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {a.status === 'under_review' ? (
                          <span className="text-xs text-amber-400 font-bold">—</span>
                        ) : (
                          <span className="font-black text-primary">{a.score}/{a.maxScore || 100}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{statusLabel(a.status, t)}</td>
                      <td className="px-4 py-3 text-center text-xs text-gray-400 whitespace-nowrap">
                        {formatTimeSpentDuration(a.timeSpent, t)}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-500">{formatDt(a.completedAt, i18n.language)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openResultDetail(a)}
                            className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-primary transition-colors"
                            title={t('manageLessons.viewResultDetail')}
                          >
                            <span className="material-symbols-outlined text-lg">open_in_new</span>
                          </button>
                          {isWriting ? (
                            <button
                              type="button"
                              onClick={() => openGrading(a)}
                              className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-amber-400 transition-colors"
                              title={
                                a.status === 'under_review'
                                  ? t('manageLessons.gradePanelTitle')
                                  : t('manageLessons.regradeTooltip')
                              }
                            >
                              <span className="material-symbols-outlined text-lg">grading</span>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {gradingAttempt ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-card-dark border border-border-dark w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[95vh]">
            <div className="flex-1 p-6 border-r border-border-dark overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 overflow-hidden">
                  {gradingAttempt.user?.avatar ? (
                    <img src={gradingAttempt.user.avatar} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="font-bold text-primary">{gradingAttempt.user?.name?.[0]}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white">{gradingAttempt.user?.name}</h4>
                  <p className="text-[10px] text-gray-500 uppercase">
                    {t('manageLessons.attemptNo', { n: gradingAttempt.attemptNo || 1 })} · {lessonSkill}
                  </p>
                </div>
              </div>

              {isWriting ? (
                <div className="space-y-4">
                  <div className="bg-background-dark/50 rounded-xl p-4 border border-border-dark">
                    <h5 className="text-[11px] font-bold text-emerald-500 uppercase mb-2">{t('manageLessons.promptLabel')}</h5>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{lessonDetail?.content?.prompt || '—'}</p>
                  </div>
                  <div className="bg-background-dark/50 rounded-xl p-4 border border-border-dark">
                    <h5 className="text-[11px] font-bold text-gray-500 uppercase mb-2">{t('manageLessons.submissionLabel')}</h5>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{gradingAttempt.submission?.content || '—'}</p>
                  </div>
                  {gradingAttempt.submission?.aiFeedback ? (
                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                      <p className="text-[11px] font-bold text-primary mb-2">
                        AI ({gradingAttempt.submission?.aiScore}/100)
                      </p>
                      <p className="text-xs text-gray-400 italic">{gradingAttempt.submission.aiFeedback}</p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold text-gray-500 uppercase">{t('manageLessons.quizAnswersLabel')}</h5>
                  {(gradingAttempt.answers || []).length === 0 ? (
                    <p className="text-sm text-gray-500">{t('manageLessons.noQuizAnswers')}</p>
                  ) : (
                    (gradingAttempt.answers || []).map((ans, idx) => (
                      <div
                        key={ans.questionId || idx}
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          ans.isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
                        }`}
                      >
                        <p className="text-[10px] text-gray-500 mb-1">{t('manageLessons.questionNo', { n: (ans.questionIndex ?? idx) + 1 })}</p>
                        <p className="text-gray-200 break-words">{String(ans.answer ?? '—')}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="w-full md:w-[340px] p-6 bg-background-dark/30 flex flex-col shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-white">{t('manageLessons.gradePanelTitle')}</h4>
                {isWriting ? (
                  <button
                    type="button"
                    onClick={handleGradeWithAi}
                    disabled={gradingAiLoading}
                    className="text-[10px] font-bold text-emerald-400 hover:underline disabled:opacity-50"
                  >
                    {gradingAiLoading ? '...' : t('manageLessons.aiGradeBtn')}
                  </button>
                ) : null}
              </div>
              {isWriting && gradingAttempt.submission?.aiScore != null ? (
                <button type="button" onClick={onUseAIResult} className="text-[10px] text-gray-500 hover:text-primary self-end mb-3">
                  {t('manageLessons.useAiGrade')}
                </button>
              ) : null}

              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    {t('manageLessons.scoreLabel')} (0–{gradingAttempt.maxScore || 100})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={gradingAttempt.maxScore || 100}
                    value={gradeScore}
                    onChange={(e) => setGradeScore(e.target.value)}
                    className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-lg font-black text-primary outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {isWriting ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('manageLessons.feedbackLabel')}</label>
                    <textarea
                      value={gradeFeedback}
                      onChange={(e) => setGradeFeedback(e.target.value)}
                      className="w-full min-h-[120px] bg-background-dark border border-border-dark rounded-xl p-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                ) : null}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setGradingAttempt(null)}
                  className="flex-1 py-3 border border-border-dark rounded-xl text-gray-400 text-xs font-bold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={onSubmitGrade}
                  disabled={gradingSubmitting || gradeScore === ''}
                  className="flex-[2] py-3 bg-primary text-background-dark rounded-xl font-black text-xs disabled:opacity-50"
                >
                  {gradingSubmitting ? '...' : t('manageLessons.saveGrade')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
