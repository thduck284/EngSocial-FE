import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { lessonsService } from '../services'
import { getLessonLink } from '../utils/lesson'
import { fetchLessonProgressForResult, isModLessonResultView } from '../utils/lessonResultLinks'

export function WritingLessonResultPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const isModView = isModLessonResultView(searchParams)
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState({})
  const [progress, setProgress] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    if (!id) {
      setError(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    
    Promise.all([
      lessonsService.getWritingContent(id),
      fetchLessonProgressForResult(id, searchParams, lessonsService),
    ])
      .then(([contentRes, progressRes]) => {
        const fullContent = contentRes?.data || contentRes || {}
        // Flatten the data for easier access
        setInfo({
          ...fullContent,
          ...(fullContent.content || {})
        })
        setProgress(progressRes?.data || progressRes || {})
      })
      .catch((err) => {
        console.error('Failed to load writing result:', err)
        setError(true)
      })
      .finally(() => setLoading(false))
  }, [id, searchParams])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <p className="text-red-400 mb-4">{t('lessonResult.writingLoadError') || 'Unable to load writing result data.'}</p>
      </div>
    )
  }

  const submission = progress?.submission || {}
  const status = progress?.status || 'under_review'
  const isCompleted = status === 'completed'
  const score = progress?.score ?? submission.score ?? 0
  const maxScore = progress?.maxScore ?? 100
  const xpEarned = isCompleted ? (progress?.xpEarned ?? 0) : 0
  const viewAttemptNo = progress?.viewAttemptNo ?? null
  const writingAttempts = (Array.isArray(progress?.attemptHistory) ? progress.attemptHistory : [])
    .filter((a) => a.type === 'writing')
    .sort((a, b) => (a.attemptNo || 0) - (b.attemptNo || 0))

  const handleAttemptChange = (newAttemptNo) => {
    const next = new URLSearchParams(searchParams)
    next.set('attemptNo', String(newAttemptNo))
    setSearchParams(next, { replace: true })
  }

  const humanGraded = submission.humanGraded === true
  const teacherFeedback = String(submission.feedback || '').trim()
  const aiFeedback = String(submission.aiFeedback || progress?.aiFeedback || '').trim()
  const aiScore = submission.aiScore ?? progress?.aiScore ?? null
  const aiStrengths = Array.isArray(submission.aiStrengths) ? submission.aiStrengths : []
  const aiImprovements = Array.isArray(submission.aiImprovements) ? submission.aiImprovements : []
  const aiGrammarErrors = Array.isArray(submission.aiGrammarErrors) ? submission.aiGrammarErrors : []
  const aiBreakdown = submission.aiBreakdown || null
  const hasAiData = Boolean(aiFeedback || aiScore != null || aiStrengths.length || aiImprovements.length)
  const hasTeacherFeedback = Boolean(teacherFeedback)
  const showAiReference = hasAiData
  const showTeacherFeedback = humanGraded || (isCompleted && hasTeacherFeedback)

  const detailUrl = getLessonLink({
    id: info.id || id,
    slug: info.slug,
    skill: info.skill || 'writing',
    category:
      info.category === 'practice' || location.pathname.startsWith('/practice')
        ? 'practice'
        : 'lesson',
  })

  const handleAiGrade = async () => {
    const gradeUserId = searchParams.get('userId') || user?.id
    if (aiLoading || !gradeUserId) return
    setAiLoading(true)
    try {
      const body = {}
      const attemptNo = searchParams.get('attemptNo') || progress?.viewAttemptNo
      if (attemptNo) body.attemptNo = Number(attemptNo)
      await lessonsService.aiGradeWriting(id, gradeUserId, body)
      const refetchParams = new URLSearchParams(searchParams)
      if (attemptNo && !refetchParams.get('attemptNo')) {
        refetchParams.set('attemptNo', String(attemptNo))
      }
      const progressRes = await fetchLessonProgressForResult(id, refetchParams, lessonsService)
      setProgress(progressRes?.data || progressRes || {})
    } catch (err) {
      console.error('Failed to trigger AI grading:', err)
    } finally {
      setAiLoading(false)
    }
  }

  const breakdownItems = aiBreakdown
    ? [
        { label: 'Task Response', key: 'taskResponse' },
        { label: 'Coherence', key: 'coherence' },
        { label: 'Lexical', key: 'lexical' },
        { label: 'Grammar', key: 'grammar' },
      ]
    : []

  return (
    <main className="max-w-[1440px] mx-auto grid grid-cols-12 gap-10 pt-4 px-6 pb-10 lg:pt-4 lg:px-10 lg:pb-10 animate-in fade-in duration-700">
      {isModView ? (
        <div className="col-span-12 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">visibility</span>
          {t('lessonResult.modViewBanner')}
        </div>
      ) : null}
      {/* Sidebar - Summary */}
      <aside className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6">
        <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark p-6 shadow-xl sticky top-4 flex flex-col gap-6 overflow-hidden">
          <div className="flex flex-col gap-2 relative z-10">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{t('lessonResult.writingTitle') || 'Writing Result'}</h1>
            <p className="text-sm text-slate-500 dark:text-gray-400 truncate">
              {info.title}
            </p>
            {writingAttempts.length > 1 ? (
              <div className="mt-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-1 block">
                  {t('manageLessons.colAttempt')}
                </label>
                <select
                  value={viewAttemptNo ?? writingAttempts[writingAttempts.length - 1]?.attemptNo ?? ''}
                  onChange={(e) => handleAttemptChange(Number(e.target.value))}
                  className="w-full text-sm rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-background-dark px-3 py-2 text-slate-800 dark:text-slate-200"
                >
                  {writingAttempts.map((a) => (
                    <option key={a.attemptNo} value={a.attemptNo}>
                      {t('manageLessons.attemptNo', { n: a.attemptNo })}
                      {a.score != null ? ` — ${a.score}/${a.maxScore ?? maxScore}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : viewAttemptNo ? (
              <p className="text-xs font-semibold text-primary">
                {t('manageLessons.attemptNo', { n: viewAttemptNo })}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 relative z-10">
            {/* Status Card */}
            <div className={`bg-slate-50 dark:bg-background-dark rounded-xl p-5 border border-slate-200 dark:border-border-dark relative overflow-hidden group/status`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'} transition-all`} />
              <p className="text-slate-500 dark:text-gray-400 text-xs font-bold mb-2">{t('lessonHistory.colStatus')}</p>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-lg ${isCompleted ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {isCompleted ? 'check_circle' : 'hourglass_empty'}
                </span>
                <p className={`text-sm font-bold ${isCompleted ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {isCompleted ? t('lessonHistory.statusCompleted') : t('lessonHistory.statusUnderReview')}
                </p>
              </div>
            </div>

            {/* Score Card (Only if completed) */}
            {isCompleted && (
              <div className="bg-slate-50 dark:bg-background-dark rounded-xl p-5 border border-slate-200 dark:border-border-dark relative overflow-hidden group/score">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary transition-all" />
                <p className="text-slate-500 dark:text-gray-400 text-xs font-bold mb-2">{t('lessonResult.scoreLabel')}</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-slate-900 dark:text-white text-3xl font-bold">{score}/{maxScore}</p>
                  <span className="text-primary text-[10px] font-bold">PTS</span>
                </div>
              </div>
            )}

            {/* XP Card */}
            <div className="bg-slate-50 dark:bg-background-dark rounded-xl p-5 border border-slate-200 dark:border-border-dark relative overflow-hidden group/xp">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 transition-all" />
              <p className="text-slate-500 dark:text-gray-400 text-xs font-bold mb-2">{t('lessonResult.xpEarned')}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-slate-900 dark:text-white text-3xl font-bold">+{xpEarned || 0} XP</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2 relative z-10">
          {!isModView && !isCompleted ? (
            <button
              type="button"
              onClick={() => navigate(detailUrl)}
              className="w-full py-2 bg-slate-900 dark:bg-white/5 hover:bg-primary text-white dark:text-slate-400 hover:dark:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-transparent flex items-center justify-center gap-2 group/btn shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-sm group-hover/btn:rotate-180 transition-transform duration-500">refresh</span>
              {t('lessonResult.retry')}
            </button>
          ) : null}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-6">
        {/* The Prompt */}
        <section className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-xl animate-in slide-in-from-top-4 duration-500">
          <div className="p-4 bg-slate-50 dark:bg-background-dark/50 border-b border-slate-200 dark:border-border-dark flex items-center gap-3">
             <span className="material-symbols-outlined text-primary">description</span>
             <h3 className="text-slate-900 dark:text-white font-bold text-sm">{t('writingLesson.prompt')}</h3>
          </div>
          <div className="p-5">
            <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">{info.prompt}</p>
          </div>
        </section>

        {/* User Submission */}
        <section className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-xl animate-in slide-in-from-top-4 duration-500 delay-100">
          <div className="p-4 bg-slate-50 dark:bg-background-dark/50 border-b border-slate-200 dark:border-border-dark flex items-center justify-between">
             <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">edit_square</span>
                <h3 className="text-slate-900 dark:text-white font-bold text-sm">{t('writingLesson.yourWriting')}</h3>
             </div>
             <span className="text-xs font-bold text-slate-500 dark:text-gray-400 bg-white dark:bg-card-dark px-3 py-1 rounded-md border border-slate-200 dark:border-border-dark">
               {submission.wordCount || 0} WORDS
             </span>
          </div>
          <div className="p-6 bg-slate-50/50 dark:bg-background-dark/20">
            <div className="text-slate-800 dark:text-slate-200 text-base leading-relaxed whitespace-pre-wrap font-serif">
              {submission.content || '—'}
            </div>
            {submission.submittedAt && (
              <div className="mt-8 pt-4 border-t border-slate-200 dark:border-border-dark text-xs text-slate-400 flex justify-between font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {t('writingLesson.submittedAt') || 'Submitted at'}: {new Date(submission.submittedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Feedback — giáo viên & AI */}
        <section className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-xl animate-in slide-in-from-bottom-4 duration-500 delay-150">
          <div className="p-4 bg-slate-50 dark:bg-background-dark/50 border-b border-slate-200 dark:border-border-dark flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">reviews</span>
              <h3 className="text-slate-900 dark:text-white font-bold text-sm">{t('lessonResult.feedbackSection')}</h3>
            </div>
            {!isModView && !hasAiData && submission.content ? (
              <button
                type="button"
                onClick={handleAiGrade}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-primary/40 text-primary hover:bg-primary/10 disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-base ${aiLoading ? 'animate-spin' : ''}`}>
                  {aiLoading ? 'progress_activity' : 'psychology'}
                </span>
                {aiLoading ? t('writingLesson.aiGrading') : t('writingLesson.aiRegrade')}
              </button>
            ) : null}
          </div>

          <div className="p-5 space-y-5">
            {!showTeacherFeedback && !showAiReference ? (
              <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
                {t('lessonResult.feedbackPending')}
              </p>
            ) : null}

            {showTeacherFeedback ? (
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-lg">school</span>
                  <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {t('writingLesson.modFeedback')}
                  </h4>
                  {humanGraded && submission.humanGradedAt ? (
                    <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 ml-auto">
                      {new Date(submission.humanGradedAt).toLocaleString()}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-emerald-800 dark:text-emerald-200 whitespace-pre-wrap leading-relaxed">
                  {teacherFeedback || t('lessonResult.feedbackPending')}
                </p>
              </div>
            ) : null}

            {showAiReference ? (
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-50/80 dark:bg-indigo-500/5 p-4 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-500 text-lg">psychology</span>
                  <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                    {t('writingLesson.aiFeedbackTitle')}
                  </h4>
                  {aiScore != null ? (
                    <span className="ml-auto text-xs font-black text-indigo-600 dark:text-indigo-300 bg-white dark:bg-card-dark px-2.5 py-1 rounded-lg border border-indigo-500/20">
                      {t('writingLesson.aiScore')}: {aiScore}/100
                    </span>
                  ) : null}
                </div>

                {aiBreakdown && breakdownItems.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {breakdownItems.map(({ label, key }) => {
                      const val = aiBreakdown[key]
                      if (val == null) return null
                      const pct = typeof val === 'number' ? (val / 25) * 100 : 0
                      return (
                        <div key={key} className="bg-white/70 dark:bg-background-dark/60 rounded-lg p-2.5 border border-indigo-500/10">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-slate-500 dark:text-gray-500 font-semibold uppercase">{label}</span>
                            <span className="font-black text-indigo-600 dark:text-indigo-300">{val}/25</span>
                          </div>
                          <div className="h-1 bg-slate-200 dark:bg-border-dark rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-indigo-500"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : null}

                {aiFeedback ? (
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {aiFeedback}
                  </p>
                ) : null}

                {aiStrengths.length ? (
                  <div>
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1.5">
                      {t('writingLesson.aiStrengths')}
                    </p>
                    <ul className="text-sm text-slate-600 dark:text-gray-400 space-y-1 list-disc pl-4">
                      {aiStrengths.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {aiImprovements.length ? (
                  <div>
                    <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase mb-1.5">
                      {t('writingLesson.aiImprovements')}
                    </p>
                    <ul className="text-sm text-slate-600 dark:text-gray-400 space-y-1 list-disc pl-4">
                      {aiImprovements.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {aiGrammarErrors.length ? (
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-gray-500 uppercase mb-2">
                      {t('writingLesson.grammarFixes')}
                    </p>
                    <div className="space-y-2">
                      {aiGrammarErrors.map((err, i) => (
                        <div
                          key={i}
                          className="text-xs bg-white/80 dark:bg-background-dark/50 rounded-lg p-3 border border-slate-200 dark:border-border-dark"
                        >
                          <p className="text-red-500/90 line-through">{err.original}</p>
                          <p className="text-emerald-600 dark:text-emerald-400 font-medium mt-1">{err.correction}</p>
                          {err.explanation ? (
                            <p className="text-slate-500 dark:text-gray-500 mt-1 italic">{err.explanation}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {!humanGraded ? (
                  <p className="text-[11px] text-slate-500 dark:text-gray-500 italic border-t border-indigo-500/10 pt-3">
                    {t('writingLesson.aiDisclaimer')}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        {/* Sample Answer */}
        {info.sampleAnswer && (
          <section className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-xl animate-in slide-in-from-bottom-4 duration-500 delay-300">
            <details className="group/details">
              <summary className="flex cursor-pointer items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-background-dark transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-500">emoji_objects</span>
                  <h3 className="text-slate-900 dark:text-white text-sm font-bold">{t('writingLesson.showSample')}</h3>
                </div>
                <span className="material-symbols-outlined text-slate-400 transition-transform duration-300 group-open/details:rotate-180">expand_more</span>
              </summary>
              <div className="p-5 pt-4 text-slate-600 dark:text-gray-400 text-sm border-t border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark/20 italic whitespace-pre-wrap leading-relaxed">
                {info.sampleAnswer}
              </div>
            </details>
          </section>
        )}
      </div>
    </main>
  )
}
