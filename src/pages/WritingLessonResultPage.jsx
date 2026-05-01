import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants'
import { lessonsService } from '../services'

export function WritingLessonResultPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
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
      lessonsService.getProgress(id),
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
  }, [id])

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
      {/* Sidebar - Summary */}
      <aside className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-8">
        <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none sticky top-4 flex flex-col gap-10 overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <div className="flex flex-col gap-4 relative z-10">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">{t('lessonResult.writingTitle') || 'Writing Result'}</h1>
            <p className="text-[11px] text-slate-500 dark:text-gray-400 font-bold leading-relaxed italic opacity-80">
              &quot;{info.title}&quot;
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 relative z-10">
            {/* Status Card */}
            <div className={`bg-slate-50 dark:bg-background-dark/40 rounded-[2rem] p-8 border border-slate-100 dark:border-white/5 relative overflow-hidden group/status shadow-inner`}>
              <div className={`absolute top-0 left-0 w-1.5 h-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'} transition-all group-hover/status:w-2`} />
              <p className="text-slate-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{t('lessonHistory.colStatus')}</p>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-2xl ${isCompleted ? 'text-emerald-500' : 'text-amber-500'} animate-pulse`}>
                  {isCompleted ? 'check_circle' : 'hourglass_empty'}
                </span>
                <p className={`text-[11px] font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {isCompleted ? t('lessonHistory.statusCompleted') : t('lessonHistory.statusUnderReview')}
                </p>
              </div>
            </div>

            {/* Score Card (Only if completed) */}
            {isCompleted && (
              <div className="bg-slate-50 dark:bg-background-dark/40 rounded-[2rem] p-8 border border-slate-100 dark:border-white/5 relative overflow-hidden group/score shadow-inner">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary transition-all group-hover/score:w-2" />
                <p className="text-slate-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{t('lessonResult.scoreLabel')}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-slate-900 dark:text-white text-5xl font-black">{score}/{maxScore}</p>
                  <span className="text-primary text-[10px] font-black uppercase tracking-widest">PTS</span>
                </div>
              </div>
            )}

            {/* XP Card */}
            <div className="bg-slate-50 dark:bg-background-dark/40 rounded-[2rem] p-8 border border-slate-100 dark:border-white/5 relative overflow-hidden group/xp shadow-inner">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 transition-all group-hover/xp:w-2" />
              <p className="text-slate-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{t('lessonResult.xpEarned')}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-slate-900 dark:text-white text-5xl font-black tracking-tight">+{xpEarned || 0} XP</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-4 relative z-10">
            {!isCompleted && (
              <button
                type="button"
                onClick={() => navigate(`/lesson/writing/${id}`)}
                className="w-full py-5 bg-slate-900 dark:bg-white/5 hover:bg-primary text-white dark:text-slate-400 hover:dark:text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-transparent flex items-center justify-center gap-4 group/btn shadow-xl shadow-slate-900/10 active:scale-95"
              >
                <span className="material-symbols-outlined text-lg group-hover/btn:rotate-12 transition-transform duration-300">edit</span>
                {t('lessonResult.editWriting') || 'Edit Submission'}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-10">
        {/* The Prompt */}
        <section className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none animate-in slide-in-from-top-8 duration-700">
          <div className="p-8 bg-slate-50 dark:bg-background-dark/50 border-b border-slate-100 dark:border-white/5 flex items-center gap-6">
             <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
               <span className="material-symbols-outlined text-2xl">description</span>
             </div>
             <h3 className="text-slate-900 dark:text-white font-black text-lg uppercase tracking-tight">{t('writingLesson.prompt')}</h3>
          </div>
          <div className="p-10">
            <p className="text-slate-600 dark:text-slate-300 text-lg font-medium leading-relaxed whitespace-pre-wrap selection:bg-primary/20">{info.prompt}</p>
          </div>
        </section>

        {/* User Submission */}
        <section className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none animate-in slide-in-from-top-8 duration-700 delay-100">
          <div className="p-8 bg-slate-50 dark:bg-background-dark/50 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-6">
                <div className="size-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <span className="material-symbols-outlined text-2xl">edit_square</span>
                </div>
                <h3 className="text-slate-900 dark:text-white font-black text-lg uppercase tracking-tight">{t('writingLesson.yourWriting')}</h3>
             </div>
             <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 bg-white dark:bg-card-dark px-5 py-2.5 rounded-full border border-slate-100 dark:border-white/5 shadow-inner uppercase tracking-widest">
               {submission.wordCount || 0} WORDS
             </span>
          </div>
          <div className="p-12 bg-slate-50/30 dark:bg-background-dark/10">
            <div className="text-slate-800 dark:text-slate-200 text-xl leading-relaxed whitespace-pre-wrap font-serif selection:bg-emerald-500/20">
              {submission.content || '—'}
            </div>
            {submission.submittedAt && (
              <div className="mt-12 pt-8 border-t-2 border-slate-100 dark:border-white/5 text-[10px] text-slate-400 dark:text-gray-500 flex justify-between uppercase tracking-[0.2em] font-black">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">schedule</span>
                  {t('writingLesson.submittedAt') || 'Submitted at'}: {new Date(submission.submittedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Teacher Feedback */}
        {feedback && (
          <section className="bg-emerald-500/5 border-2 border-emerald-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-500/10 animate-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="p-8 bg-emerald-500/10 border-b border-emerald-500/10 flex items-center gap-6">
               <div className="size-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                 <span className="material-symbols-outlined text-2xl">rate_review</span>
               </div>
               <h3 className="text-emerald-500 font-black text-lg uppercase tracking-tight">{t('writingLesson.modFeedback') || "Teacher's Feedback"}</h3>
            </div>
            <div className="p-10">
              <div className="text-emerald-600 dark:text-emerald-400 text-lg leading-relaxed whitespace-pre-wrap italic font-bold border-l-8 border-emerald-500/20 pl-8">
                {feedback}
              </div>
            </div>
          </section>
        )}

        {/* Sample Answer */}
        {info.sampleAnswer && (
          <section className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none opacity-90 hover:opacity-100 transition-all group/sample animate-in slide-in-from-bottom-8 duration-700 delay-300">
            <details className="group/details">
              <summary className="flex cursor-pointer items-center justify-between p-8 list-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="size-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xl shadow-amber-500/30 transition-transform group-hover/sample:scale-110 group-hover/sample:rotate-3">
                    <span className="material-symbols-outlined text-3xl">emoji_objects</span>
                  </div>
                  <h3 className="text-slate-900 dark:text-white text-xl font-black uppercase tracking-tight">{t('writingLesson.showSample')}</h3>
                </div>
                <span className="material-symbols-outlined text-slate-300 dark:text-gray-700 text-3xl transition-transform duration-500 group-open/details:rotate-180">expand_more</span>
              </summary>
              <div className="p-10 pt-4 text-slate-500 dark:text-gray-400 leading-relaxed text-lg font-medium border-t-2 border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-background-dark/20 italic selection:bg-amber-500/20">
                {info.sampleAnswer}
              </div>
            </details>
          </section>
        )}
      </div>
    </main>
  )
}
