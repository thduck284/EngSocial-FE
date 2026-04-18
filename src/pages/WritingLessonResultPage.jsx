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
    <main className="max-w-[1440px] mx-auto grid grid-cols-12 gap-6 p-4 md:p-6 lg:p-8">
      {/* Left Sidebar */}
      <aside className="col-span-12 lg:col-span-3 space-y-5">
        <div className="bg-card-dark rounded-2xl p-6 border border-border-dark shadow-xl flex flex-col gap-5 sticky top-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-white text-2xl font-black tracking-tight">{t('lessonResult.writingTitle') || 'Writing Result'}</h1>
            <p className="text-gray-400 text-xs leading-relaxed italic">
              &quot;{info.title}&quot;
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Status Card */}
            <div className={`bg-background-dark/30 rounded-xl p-5 border border-border-dark relative overflow-hidden group`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'} transition-all`} />
              <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-1.5">{t('lessonHistory.colStatus')}</p>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-lg ${isCompleted ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {isCompleted ? 'check_circle' : 'hourglass_empty'}
                </span>
                <p className={`text-sm font-black uppercase tracking-wider ${isCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isCompleted ? t('lessonHistory.statusCompleted') : t('lessonHistory.statusUnderReview')}
                </p>
              </div>
            </div>

            {/* Score Card (Only if completed) */}
            {isCompleted && (
              <div className="bg-background-dark/30 rounded-xl p-5 border border-border-dark relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-1.5">{t('lessonResult.scoreLabel')}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-white text-3xl font-black">{score}/{maxScore}</p>
                  <span className="text-primary text-xs font-bold">PTS</span>
                </div>
              </div>
            )}

            {/* XP Card */}
            <div className="bg-background-dark/30 rounded-xl p-5 border border-border-dark relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
              <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-1.5">{t('lessonResult.xpEarned')}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-white text-3xl font-black">+{xpEarned || 0} XP</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-2">
            {!isCompleted && (
              <button
                type="button"
                onClick={() => navigate(`/lesson/writing/${id}`)}
                className="w-full cursor-pointer flex items-center justify-center rounded-xl h-11 bg-card-dark text-white text-xs font-bold transition-all hover:bg-gray-700 active:scale-95 border border-border-dark group"
              >
                <span className="material-symbols-outlined mr-2 text-sm group-hover:rotate-180 transition-transform">edit</span>
                {t('lessonResult.editWriting') || 'Edit Submission'}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="col-span-12 lg:col-span-9 space-y-6">
        {/* The Prompt */}
        <section className="bg-card-dark rounded-2xl border border-border-dark overflow-hidden shadow-xl">
          <div className="p-4 bg-background-dark/50 border-b border-border-dark flex items-center gap-3">
             <span className="material-symbols-outlined text-primary">description</span>
             <h3 className="text-white font-bold text-sm tracking-tight">{t('writingLesson.prompt')}</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{info.prompt}</p>
          </div>
        </section>

        {/* User Submission */}
        <section className="bg-card-dark rounded-2xl border border-border-dark overflow-hidden shadow-xl">
          <div className="p-4 bg-background-dark/50 border-b border-border-dark flex items-center justify-between">
             <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">edit_square</span>
                <h3 className="text-white font-bold text-sm tracking-tight">{t('writingLesson.yourWriting')}</h3>
             </div>
             <span className="text-[10px] font-bold text-gray-500 bg-background-dark px-2.5 py-1 rounded-full border border-border-dark">
               {submission.wordCount || 0} WORDS
             </span>
          </div>
          <div className="p-8 bg-background-dark/10">
            <div className="text-gray-200 text-base leading-relaxed whitespace-pre-wrap font-serif">
              {submission.content || '—'}
            </div>
            {submission.submittedAt && (
              <div className="mt-8 pt-6 border-t border-border-dark/30 text-[10px] text-gray-500 flex justify-between uppercase tracking-tighter">
                <span>{t('writingLesson.submittedAt') || 'Submitted at'}: {new Date(submission.submittedAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </section>

        {/* Teacher Feedback */}
        {feedback && (
          <section className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-2">
            <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/10 flex items-center gap-3">
               <span className="material-symbols-outlined text-emerald-400">rate_review</span>
               <h3 className="text-emerald-400 font-bold text-sm tracking-tight">{t('writingLesson.modFeedback') || "Teacher's Feedback"}</h3>
            </div>
            <div className="p-6">
              <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap italic">
                {feedback}
              </div>
            </div>
          </section>
        )}



        {/* Sample Answer */}
        {info.sampleAnswer && (
          <section className="bg-card-dark rounded-2xl border border-border-dark overflow-hidden shadow-xl opacity-80 hover:opacity-100 transition-opacity">
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between p-4 list-none hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-yellow-500 text-xl">emoji_objects</span>
                  </div>
                  <h3 className="text-white text-sm font-bold">{t('writingLesson.showSample')}</h3>
                </div>
                <span className="material-symbols-outlined text-gray-500 transition-transform duration-300 group-open:rotate-180">expand_more</span>
              </summary>
              <div className="p-7 pt-2 text-gray-400 leading-relaxed text-sm border-t border-border-dark/30 bg-background-dark/20">
                {info.sampleAnswer}
              </div>
            </details>
          </section>
        )}
      </div>
    </main>
  )
}
