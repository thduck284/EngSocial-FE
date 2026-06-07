import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lessonsService } from '../services'
import { fetchLessonProgressForResult, isModLessonResultView } from '../utils/lessonResultLinks'

/**
 * Trang kết quả làm bài Reading: điểm số, đoạn đọc, chi tiết từng câu (đáp án user, đáp án đúng, giải thích).
 */
export function ReadingLessonResultPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isModView = isModLessonResultView(searchParams)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lessonTitle, setLessonTitle] = useState('')
  const [passageText, setPassageText] = useState('')
  const [translationVi, setTranslationVi] = useState('')
  const [passageLang, setPassageLang] = useState('en') // en | vi
  const [score, setScore] = useState(0)
  const [maxScore, setMaxScore] = useState(10)
  const [xpEarned, setXpEarned] = useState(0)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])

  useEffect(() => {
    if (!id) {
      setError(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    Promise.all([
      lessonsService.getReadingContent(id),
      fetchLessonProgressForResult(id, searchParams, lessonsService),
    ])
      .then(([contentRes, progressRes]) => {
        const content = contentRes?.data || contentRes
        const progress = progressRes?.data || progressRes
        const lessonContent = content?.content || {}
        const qList = content?.questions || []
        setLessonTitle(lessonContent?.title || content?.title || '')
        setMaxScore(qList.length || 10)
        setPassageText(lessonContent?.text || '')
        setTranslationVi(lessonContent?.translationVi || '')

        const progressData = progress?.data ?? progress
        const status = progressData?.status
        const savedScore = progressData?.score
        const savedMax = progressData?.maxScore
        const attempts = Array.isArray(progressData?.attemptHistory) ? progressData.attemptHistory : []
        const latestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null

        const savedAnswers = progressData?.answers || latestAttempt?.answers || []
        const progressPercent = progressData?.progress
        const viewAttempt = progressData?.viewAttemptNo
          ? attempts.find((a) => a.attemptNo === progressData.viewAttemptNo)
          : latestAttempt

        if (status === 'completed' || savedAnswers.length > 0) {
          if (savedScore != null) setScore(savedScore)
          else if (savedAnswers.length > 0) setScore(savedAnswers.filter((a) => a.isCorrect).length)
          else if (typeof progressPercent === 'number') setScore(Math.round((progressPercent / 100) * (qList.length || 10)))
          if (savedMax != null) setMaxScore(savedMax)
          setAnswers(savedAnswers)
        } else {
          setScore(0)
          setAnswers([])
        }

        const xp = viewAttempt?.xpEarned ?? progressData?.xpEarned ?? progressData?.xpEarnedThisAttempt ?? 0
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
  }, [id, searchParams])

  const progressPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const displayXp = progressPercent >= 80 ? (xpEarned || 0) : 0
  const getAnswerForQuestion = (index) => answers.find((a) => a.questionIndex === index || a.questionId === questions[index]?.id) || answers[index]

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
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <main className="max-w-[1200px] mx-auto grid grid-cols-12 gap-6 pt-4 px-4 pb-10 animate-in fade-in duration-700">
      {isModView ? (
        <div className="col-span-12 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">visibility</span>
          {t('lessonResult.modViewBanner')}
        </div>
      ) : null}
      {/* Sidebar - Summary */}
      <aside className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-4">
        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark p-5 shadow-lg shadow-slate-100 dark:shadow-none sticky top-4 flex flex-col gap-5 overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl" />
          
          <div className="flex flex-col gap-2 relative z-10">
            <h1 className="text-base font-bold text-slate-800 dark:text-white tracking-wider leading-none uppercase">{t('lessonResult.title')}</h1>
            <p className="text-[10px] text-slate-500 dark:text-gray-400 font-bold leading-relaxed">
              {t('lessonResult.subtitle')} <span className="text-primary font-bold italic">"{lessonTitle}"</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 relative z-10">
            {/* Score Card */}
            <div className="bg-slate-50 dark:bg-background-dark/40 rounded-xl p-4 border border-slate-100 dark:border-white/5 relative overflow-hidden group/score shadow-inner">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary transition-all group-hover/score:w-1.5" />
              <p className="text-slate-400 dark:text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-1.5">{t('lessonResult.scoreLabel')}</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-slate-800 dark:text-white text-xl font-bold">{score}/{maxScore}</p>
                <span className="text-emerald-500 text-[9px] font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded shadow-sm border border-emerald-500/10 shrink-0">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-card-dark h-1.5 rounded-full mt-3 shadow-inner">
                <div
                  className="bg-gradient-to-r from-primary to-cyan-400 h-full rounded-full shadow-[0_0_8px_rgba(19,182,236,0.4)] transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* XP Card */}
            <div className="bg-slate-50 dark:bg-background-dark/40 rounded-xl p-4 border border-slate-100 dark:border-white/5 relative overflow-hidden group/xp shadow-inner">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 transition-all group-hover/xp:w-1.5" />
              <p className="text-slate-400 dark:text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-1.5">{t('lessonResult.xpEarned')}</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-slate-800 dark:text-white text-xl font-bold tracking-tight">+{displayXp} XP</p>
                {displayXp > 0 && (
                  <span className="text-amber-500 text-[9px] font-bold uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded shadow-sm border border-amber-500/10 flex items-center gap-1 shrink-0 animate-pulse">
                    <span className="material-symbols-outlined text-[10px]">bolt</span>
                    {t('lessonResult.bonus')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Question Index */}
          <div className="space-y-4 relative z-10">
            <p className="text-slate-400 dark:text-gray-500 text-[9px] font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary/50">navigation</span>
              {t('lessonResult.questionDetails')}
            </p>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, idx) => {
                const userAnswer = getAnswerForQuestion(idx)
                const userValue = userAnswer?.answer ?? userAnswer?.userAnswer
                const isCorrect = userAnswer?.isCorrect ?? (userValue != null && String(userValue).trim() === String(q.correctAnswer).trim())
                
                return (
                  <button
                    key={idx}
                    onClick={() => scrollToQuestion(idx)}
                    className={`size-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all border shrink-0 hover:scale-105 active:scale-95 ${
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

          {!isModView ? (
            <div className="flex flex-col gap-3 mt-2 relative z-10">
              <button
                type="button"
                onClick={() => navigate(`/lesson/reading/${id}`)}
                className="w-full py-2 bg-slate-900 dark:bg-white/5 hover:bg-primary text-white dark:text-slate-400 hover:dark:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-transparent flex items-center justify-center gap-2 group/btn shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined text-sm group-hover/btn:rotate-180 transition-transform duration-500">refresh</span>
                {t('lessonResult.retry')}
              </button>
            </div>
          ) : null}
        </div>
      </aside>

      {/* Main Content */}
      <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-6">
        {passageText && (
          <section className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-md shadow-slate-100 dark:shadow-none animate-in slide-in-from-top-8 duration-700">
            <details className="group" open>
              <summary className="flex cursor-pointer items-center justify-between p-5 list-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20">
                    <span className="material-symbols-outlined text-xl">menu_book</span>
                  </div>
                  <h3 className="text-slate-800 dark:text-white text-base font-bold uppercase tracking-wider">{t('lessonResult.passageTitle')}</h3>
                </div>
                <div className="flex items-center gap-3">
                  {translationVi && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setPassageLang(prev => (prev === 'en' ? 'vi' : 'en'))
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white active:scale-95 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-xs">translate</span>
                      {passageLang === 'en' ? 'Dịch Tiếng Việt' : 'Xem Tiếng Anh'}
                    </button>
                  )}
                  <span className="material-symbols-outlined text-slate-300 dark:text-gray-700 text-xl transition-transform duration-500 group-open:rotate-180">expand_more</span>
                </div>
              </summary>
              <div className="p-6 pt-1 text-slate-600 dark:text-slate-300 leading-relaxed text-sm font-medium space-y-2 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-background-dark/20 selection:bg-primary/20">
                {(passageLang === 'vi' && translationVi ? translationVi : passageText)
                  .split('\n\n')
                  .filter(Boolean)
                  .map((p, i) => (
                    <p key={i} className={`mb-3 last:mb-0 ${passageLang === 'vi' ? 'italic text-slate-500 dark:text-gray-400 opacity-90' : ''}`}>{p}</p>
                  ))}
              </div>
            </details>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">fact_check</span>
              {t('lessonResult.questionDetails')}
            </h2>
            <span className="bg-white dark:bg-card-dark text-slate-400 dark:text-gray-500 text-[9px] font-bold px-3 py-1.5 rounded-full border border-slate-200 dark:border-border-dark uppercase tracking-wider shadow-sm">
              {t('lessonResult.showingQuestions', { count: questions.length, total: questions.length })}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {questions.map((q, index) => {
              const userAnswer = getAnswerForQuestion(index)
              const userValue = userAnswer?.answer ?? userAnswer?.userAnswer
              const isCorrect = userAnswer?.isCorrect ?? (userValue != null && String(userValue).trim() === String(q.correctAnswer).trim())
              const correctText = q.options?.find((o) => o.value === q.correctAnswer)?.text || q.correctAnswer
              const userText = q.options?.find((o) => o.value === userValue)?.text || userValue

              return (
                <div
                  key={q.id || index}
                  id={`question-card-${index}`}
                  className={`bg-white dark:bg-card-dark border rounded-xl p-5 flex flex-col gap-4 shadow-md shadow-slate-100 dark:shadow-none transition-all hover:border-primary/40 group animate-in slide-in-from-right-8 duration-500 ${!isCorrect ? 'border-l-4 border-l-rose-500 dark:border-l-rose-500' : 'border-slate-200 dark:border-border-dark'}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 dark:text-gray-500 font-black uppercase text-[11px] tracking-wider flex items-center gap-2">
                      <span className="size-2 rounded-full bg-primary" />
                      {t('lessonResult.questionNum', { num: index + 1 })}
                    </span>
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all group-hover:scale-105 ${
                        isCorrect ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' : 'bg-rose-500/5 border-rose-500/10 text-rose-500'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">{isCorrect ? 'check_circle' : 'cancel'}</span>
                      {isCorrect ? t('lessonResult.correct') : t('lessonResult.incorrect')}
                    </div>
                  </div>
                  
                  <p className="text-slate-800 dark:text-white text-sm font-black leading-relaxed">{q.question}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg border transition-colors shadow-inner ${!isCorrect ? 'bg-rose-500/5 border-rose-500/10' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5'}`}>
                      <p className="text-slate-400 dark:text-gray-500 text-[9px] font-bold uppercase tracking-wider mb-1">{t('lessonResult.yourAnswer')}</p>
                      <p className={`text-sm font-bold ${!isCorrect ? 'line-through decoration-rose-500/50 text-slate-400' : 'text-slate-800 dark:text-white'}`}>{userText || '—'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10 shadow-inner">
                      <p className="text-emerald-500/70 text-[9px] font-bold uppercase tracking-wider mb-1">{t('lessonResult.correctAnswer')}</p>
                      <p className="text-emerald-500 text-sm font-bold">{correctText || '—'}</p>
                    </div>
                  </div>
                  
                  {q.explanation && (
                    <details className="group/exp">
                      <summary className="flex items-center gap-2 text-primary font-bold text-[10px] cursor-pointer list-none hover:bg-primary/5 transition-all uppercase tracking-wider p-2 -mx-2 rounded-lg active:scale-95">
                        <span className="material-symbols-outlined text-base transition-transform group-open/exp:rotate-90">info</span>
                        {t('lessonResult.viewExplanation')}
                      </summary>
                      <div className="mt-2 p-4 bg-primary/5 rounded-lg border-l-4 border-primary text-xs font-bold leading-relaxed italic shadow-inner animate-in slide-in-from-top-4 duration-300 text-slate-500 dark:text-gray-400">
                        {q.explanation}
                      </div>
                    </details>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
