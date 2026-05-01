import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../constants'
import { lessonsService } from '../services'

/**
 * Trang kết quả làm bài Listening: điểm số, chi tiết từng câu (đáp án user, đáp án đúng, giải thích).
 */
export function ListeningLessonResultPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lessonTitle, setLessonTitle] = useState('')
  const [score, setScore] = useState(0)
  const [maxScore, setMaxScore] = useState(10)
  const [xpEarned, setXpEarned] = useState(0)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [audioUrl, setAudioUrl] = useState('')
  const [transcript, setTranscript] = useState('')

  useEffect(() => {
    if (!id) {
      setError(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    Promise.all([
      lessonsService.getListeningContent(id),
      lessonsService.getProgress(id),
    ])
      .then(([contentRes, progressRes]) => {
        const content = contentRes?.data || contentRes
        const progress = progressRes?.data || progressRes
        const lessonContent = content?.content || {}
        const qList = content?.questions || []
        setLessonTitle(lessonContent?.title || content?.title || '')
        setMaxScore(qList.length || 10)
        setAudioUrl(lessonContent?.audioUrl || content?.audioUrl || '')
        setTranscript(lessonContent?.transcript || content?.transcript || '')

        const progressData = progress?.data ?? progress
        const status = progressData?.status
        const savedScore = progressData?.score
        const savedMax = progressData?.maxScore
        const attempts = Array.isArray(progressData?.attemptHistory) ? progressData.attemptHistory : []
        const latestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null

        const savedAnswers = progressData?.answers || latestAttempt?.answers || []
        const progressPercent = progressData?.progress

        if (status === 'completed') {
          if (savedScore != null) setScore(savedScore)
          else if (savedAnswers.length > 0) setScore(savedAnswers.filter((a) => a.isCorrect).length)
          else if (typeof progressPercent === 'number') setScore(Math.round((progressPercent / 100) * (qList.length || 10)))
          if (savedMax != null) setMaxScore(savedMax)
          setAnswers(savedAnswers)
        } else {
          setScore(0)
          setAnswers([])
        }

        const xp = latestAttempt?.xpEarned ?? progressData?.xpEarnedThisAttempt ?? 0
        if (xp != null) setXpEarned(xp)
        setQuestions(
          qList.map((q, i) => ({
            id: q.id || `q${i}`,
            question: q.question || '',
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || '',
          }))
        )
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  const progressPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const displayXp = progressPercent >= 80 ? (xpEarned || 0) : 0
  const getAnswerForQuestion = (index) => answers.find((a) => a.questionId === String(questions[index]?.id) || a.questionIndex === index)

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
        <p className="text-red-400 mb-4">{t('lessonResult.loadError')}</p>
      </div>
    )
  }

  const scrollToQuestion = (idx) => {
    const el = document.getElementById(`question-card-${idx}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <main className="max-w-[1440px] mx-auto grid grid-cols-12 gap-10 pt-4 px-6 pb-10 lg:pt-4 lg:px-10 lg:pb-10 animate-in fade-in duration-700">
      {/* Sidebar - Summary */}
      <aside className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-8">
        <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none sticky top-4 flex flex-col gap-10 overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <div className="flex flex-col gap-4 relative z-10">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">{t('lessonResult.title')}</h1>
            <p className="text-[11px] text-slate-500 dark:text-gray-400 font-bold leading-relaxed italic opacity-80">
               "{lessonTitle}"
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 relative z-10">
            {/* Score Card */}
            <div className="bg-slate-50 dark:bg-background-dark/40 rounded-[2rem] p-8 border border-slate-100 dark:border-white/5 relative overflow-hidden group/score shadow-inner">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary transition-all group-hover/score:w-2" />
              <p className="text-slate-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{t('lessonResult.scoreLabel')}</p>
              <div className="flex items-baseline gap-3">
                <p className="text-slate-900 dark:text-white text-5xl font-black">{score}/{maxScore}</p>
                <span className="text-emerald-500 text-[11px] font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-card-dark h-2 rounded-full mt-6 shadow-inner">
                <div
                  className="bg-gradient-to-r from-primary to-cyan-400 h-full rounded-full shadow-[0_0_12px_rgba(19,182,236,0.5)] transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* XP Card */}
            <div className="bg-slate-50 dark:bg-background-dark/40 rounded-[2rem] p-8 border border-slate-100 dark:border-white/5 relative overflow-hidden group/xp shadow-inner">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 transition-all group-hover/xp:w-2" />
              <p className="text-slate-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{t('lessonResult.xpEarned')}</p>
              <div className="flex items-baseline gap-3">
                <p className="text-slate-900 dark:text-white text-5xl font-black tracking-tight">+{displayXp} XP</p>
              </div>
            </div>
          </div>

          {/* Question Index */}
          <div className="space-y-6 relative z-10">
            <p className="text-slate-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="material-symbols-outlined text-base text-primary/50">navigation</span>
              {t('lessonResult.questionDetails')}
            </p>
            <div className="flex flex-wrap gap-3">
              {questions.map((q, idx) => {
                const userAnswer = getAnswerForQuestion(idx)
                const isCorrect = userAnswer?.isCorrect
                return (
                  <button
                    key={idx}
                    onClick={() => scrollToQuestion(idx)}
                    className={`size-10 rounded-xl flex items-center justify-center text-[11px] font-black transition-all border-2 shrink-0 hover:scale-110 active:scale-90 ${
                      isCorrect 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white'
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-4 relative z-10">
            <button
              type="button"
              onClick={() => navigate(`/lesson/listening/${id}`)}
              className="w-full py-5 bg-slate-900 dark:bg-white/5 hover:bg-primary text-white dark:text-slate-400 hover:dark:text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-transparent flex items-center justify-center gap-4 group/btn shadow-xl shadow-slate-900/10 active:scale-95"
            >
              <span className="material-symbols-outlined text-lg group-hover/btn:rotate-180 transition-transform duration-500">refresh</span>
              {t('lessonResult.retry')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-10">
        {/* Audio Player Section */}
        {audioUrl && (
          <section className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none p-8 flex flex-col md:flex-row items-center gap-8 group animate-in slide-in-from-top-8 duration-700">
            <div className={`size-24 rounded-3xl bg-primary text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
              <span className="material-symbols-outlined text-4xl animate-pulse">headset</span>
            </div>
            <div className="flex-1 w-full space-y-4">
              <div>
                <h3 className="text-slate-900 dark:text-white font-black text-xl uppercase tracking-tight">{t('listeningLesson.audioTitle') || 'Listening Material'}</h3>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] mt-2">{t('listeningLesson.audioSubtitle') || 'Listen again to improve your understanding'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-background-dark/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
                <audio 
                  src={audioUrl} 
                  controls 
                  className="w-full h-10 rounded-lg custom-audio-player"
                />
              </div>
            </div>
          </section>
        )}

        {/* Transcript Section */}
        {transcript && (
          <section className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none animate-in slide-in-from-top-8 duration-700">
            <details className="group/trans">
              <summary className="flex cursor-pointer items-center justify-between p-8 list-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="size-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20">
                    <span className="material-symbols-outlined text-3xl">description</span>
                  </div>
                  <h3 className="text-slate-900 dark:text-white text-xl font-black uppercase tracking-tight">{t('listeningLesson.transcript') || 'Transcript'}</h3>
                </div>
                <span className="material-symbols-outlined text-slate-300 dark:text-gray-700 text-3xl transition-transform duration-500 group-open/trans:rotate-180">expand_more</span>
              </summary>
              <div className="p-10 pt-4 text-slate-600 dark:text-gray-300 leading-relaxed text-lg font-medium whitespace-pre-wrap border-t-2 border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-background-dark/20 italic selection:bg-primary/20">
                {transcript}
              </div>
            </details>
          </section>
        )}

        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-4xl">fact_check</span>
            {t('lessonResult.questionDetails')}
          </h2>
        </div>

        <div className="flex flex-col gap-8">
          {questions.map((q, index) => {
            const userAnswer = getAnswerForQuestion(index)
            const isCorrect = userAnswer?.isCorrect
            const correctText = q.options?.find((o) => o.value === q.correctAnswer)?.text || q.correctAnswer
            const userText = q.options?.find((o) => o.value === (userAnswer?.answer ?? userAnswer?.userAnswer))?.text || (userAnswer?.answer ?? userAnswer?.userAnswer)

            return (
              <div
                key={q.id || index}
                id={`question-card-${index}`}
                className={`bg-white dark:bg-card-dark border-2 rounded-[2.5rem] p-10 flex flex-col gap-8 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all hover:border-primary/40 group animate-in slide-in-from-right-8 duration-500 ${!isCorrect ? 'border-l-8 border-l-rose-500 dark:border-l-rose-500' : 'border-slate-200 dark:border-border-dark'}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-gray-500 font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-3">
                    <span className="size-2 rounded-full bg-primary" />
                    {t('lessonResult.questionNum', { num: index + 1 })}
                  </span>
                  <div className={`flex items-center gap-2.5 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all group-hover:scale-105 ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/5 border-rose-500/20 text-rose-500'}`}>
                    <span className="material-symbols-outlined text-base">{isCorrect ? 'check_circle' : 'cancel'}</span>
                    {isCorrect ? t('lessonResult.correct') : t('lessonResult.incorrect')}
                  </div>
                </div>
                
                <p className="text-slate-900 dark:text-white text-2xl font-black leading-tight uppercase tracking-tight">{q.question}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-8 rounded-[2rem] border-2 transition-colors shadow-inner ${!isCorrect ? 'bg-rose-500/5 border-rose-500/20' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5'}`}>
                    <p className="text-slate-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{t('lessonResult.yourAnswer')}</p>
                    <p className={`text-lg font-black uppercase tracking-tight ${!isCorrect ? 'line-through decoration-rose-500/50 text-slate-400' : 'text-slate-900 dark:text-white'}`}>{userText || '—'}</p>
                  </div>
                  <div className="p-8 rounded-[2rem] bg-emerald-500/5 border-2 border-emerald-500/20 shadow-inner">
                    <p className="text-emerald-500/70 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{t('lessonResult.correctAnswer')}</p>
                    <p className="text-emerald-500 text-lg font-black uppercase tracking-tight">{correctText || '—'}</p>
                  </div>
                </div>
                
                {q.explanation && (
                  <details className="group/exp">
                    <summary className="flex items-center gap-3 text-primary font-black text-[11px] cursor-pointer list-none hover:bg-primary/5 transition-all uppercase tracking-[0.2em] p-4 -mx-4 rounded-2xl active:scale-95">
                      <span className="material-symbols-outlined text-xl transition-transform group-open/exp:rotate-90">info</span>
                      {t('lessonResult.viewExplanation')}
                    </summary>
                    <div className="mt-4 p-8 bg-primary/5 rounded-[2rem] border-l-8 border-primary text-slate-600 dark:text-gray-400 text-sm font-bold leading-relaxed italic shadow-inner animate-in slide-in-from-top-4 duration-300">
                      {q.explanation}
                    </div>
                  </details>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
