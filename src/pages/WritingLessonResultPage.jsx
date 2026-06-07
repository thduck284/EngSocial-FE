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
  const [searchParams] = useSearchParams()
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
  const score = progress?.score ?? 0
  const maxScore = progress?.maxScore ?? 100
  const xpEarned = isCompleted ? (progress?.xpEarned ?? 0) : 0
  
  const feedback = submission.feedback || ''
  const aiFeedback = submission.aiFeedback || ''
  const aiScore = submission.aiScore || 0

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
    if (aiLoading || !user?.id) return
    setAiLoading(true)
    try {
      const res = await lessonsService.aiGradeWriting(id, user.id)
      const newProgress = res?.data || res || {}
      setProgress(newProgress)
    } catch (err) {
      console.error('Failed to trigger AI grading:', err)
    } finally {
      setAiLoading(false)
    }
  }

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

        {/* Teacher Feedback */}
        {feedback && (
          <section className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-2xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="p-4 border-b border-emerald-500/10 flex items-center gap-3">
               <span className="material-symbols-outlined text-emerald-500">rate_review</span>
               <h3 className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{t('writingLesson.modFeedback') || "Teacher's Feedback"}</h3>
            </div>
            <div className="p-5">
              <div className="text-emerald-700 dark:text-emerald-300 text-sm whitespace-pre-wrap italic">
                {feedback}
              </div>
            </div>
          </section>
        )}

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
