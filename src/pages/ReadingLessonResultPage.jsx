import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../constants'
import { lessonsService } from '../services'

/**
 * Trang kết quả làm bài Reading: điểm số, đoạn đọc, chi tiết từng câu (đáp án user, đáp án đúng, giải thích).
 * Data: lấy từ getReadingContent + getProgress; khi backend có API result thì chuyển sang gọi API đó.
 */
export function ReadingLessonResultPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lessonTitle, setLessonTitle] = useState('')
  const [passageText, setPassageText] = useState('')
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
      lessonsService.getProgress(id),
    ])
      .then(([contentRes, progressRes]) => {
        const content = contentRes?.data || contentRes
        const progress = progressRes?.data || progressRes
        const lessonContent = content?.content || {}
        const qList = content?.questions || []
        setLessonTitle(lessonContent?.title || content?.title || '')
        setMaxScore(qList.length || 10)
        setPassageText(lessonContent?.text || '')

        const progressData = progress?.data ?? progress
        const status = progressData?.status
        const savedScore = progressData?.score
        const savedMax = progressData?.maxScore
        const savedAnswers = progressData?.answers || []
        const progressPercent = progressData?.progress

        if (status === 'completed') {
          if (savedScore != null) setScore(savedScore)
          else if (savedAnswers.length > 0) setScore(savedAnswers.filter((a) => a.isCorrect).length)
          else if (typeof progressPercent === 'number') setScore(Math.round((progressPercent / 100) * (qList.length || 10)))
          if (savedMax != null) setMaxScore(savedMax)
          setAnswers(savedAnswers)
        }
        const xp = progressData?.xpEarned ?? lessonContent?.xpReward ?? content?.xpReward
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
  const displayXp = xpEarned || 50
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
        <Link to={ROUTES.LESSON} className="text-primary hover:underline">{t('lessonResult.backToList')}</Link>
      </div>
    )
  }

  return (
    <main className="px-6 md:px-8 lg:px-10 py-8 flex flex-col max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-white text-3xl md:text-4xl font-black tracking-tight">{t('lessonResult.title')}</h1>
        <p className="text-gray-400 text-base md:text-lg">
          {t('lessonResult.subtitle')} <span className="text-primary font-semibold italic">&quot;{lessonTitle}&quot;</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="flex flex-col gap-3 rounded-xl p-6 md:p-8 bg-card-dark border border-border-dark shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary transition-all group-hover:w-2" />
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">{t('lessonResult.scoreLabel')}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-white text-3xl md:text-4xl font-black">{score}/{maxScore}</p>
            <span className="text-green-500 text-sm font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-background-dark h-1.5 rounded-full mt-2">
            <div
              className="bg-primary h-full rounded-full shadow-glow transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-xl p-6 md:p-8 bg-card-dark border border-border-dark shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary transition-all group-hover:w-2" />
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">{t('lessonResult.completedLabel')}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-white text-3xl md:text-4xl font-black">{progressPercent}%</p>
          </div>
          <div className="w-full bg-background-dark h-1.5 rounded-full mt-2">
            <div
              className="bg-primary h-full rounded-full shadow-glow transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-xl p-6 md:p-8 bg-card-dark border border-border-dark shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500 transition-all group-hover:w-2" />
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">{t('lessonResult.xpEarned')}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-white text-3xl md:text-4xl font-black">+{displayXp} XP</p>
            <span className="text-green-500 text-sm font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">bolt</span>
              {t('lessonResult.bonus')}
            </span>
          </div>
          <div className="flex gap-1 mt-2">
            <span className="size-2 rounded-full bg-green-500 animate-pulse" />
            <span className="size-2 rounded-full bg-green-500/40" />
            <span className="size-2 rounded-full bg-green-500/20" />
          </div>
        </div>
      </div>

      {passageText && (
        <section className="mb-10">
          <details className="group bg-card-dark/40 border border-border-dark rounded-xl overflow-hidden transition-all duration-300" open>
            <summary className="flex cursor-pointer items-center justify-between p-6 list-none hover:bg-card-dark/60 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">menu_book</span>
                <h3 className="text-white text-lg font-bold">{t('lessonResult.passageTitle')}</h3>
              </div>
              <span className="material-symbols-outlined text-white transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <div className="p-6 pt-0 text-gray-400 leading-relaxed text-base italic border-t border-border-dark/30 bg-card-dark/20">
              {passageText}
            </div>
          </details>
        </section>
      )}

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white text-2xl font-bold">{t('lessonResult.questionDetails')}</h2>
          <span className="text-gray-400 text-sm">{t('lessonResult.showingQuestions', { count: questions.length, total: questions.length })}</span>
        </div>

        {questions.map((q, index) => {
          const userAnswer = getAnswerForQuestion(index)
          const userValue = userAnswer?.answer ?? userAnswer?.userAnswer
          const isCorrect = userAnswer?.isCorrect ?? (userValue != null && String(userValue).trim() === String(q.correctAnswer).trim())
          const correctText = q.options?.find((o) => o.value === q.correctAnswer)?.text || q.correctAnswer
          const userText = q.options?.find((o) => o.value === userValue)?.text || userValue

          return (
            <div
              key={q.id || index}
              className={`bg-card-dark border rounded-xl p-6 flex flex-col gap-4 shadow-sm ${!isCorrect ? 'border-l-4 border-l-red-500' : 'border-border-dark'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-primary font-bold uppercase text-xs tracking-widest">{t('lessonResult.questionNum', { num: index + 1 })}</span>
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                    isCorrect ? 'bg-green-500/10 border border-green-500/30 text-green-500' : 'bg-red-500/10 border border-red-500/30 text-red-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{isCorrect ? 'check_circle' : 'cancel'}</span>
                  {isCorrect ? t('lessonResult.correct') : t('lessonResult.incorrect')}
                </div>
              </div>
              <p className="text-white text-lg font-medium">{q.question}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${!isCorrect ? 'bg-red-500/10 border-red-500/20' : 'bg-background-dark/50 border-border-dark'}`}>
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1">{t('lessonResult.yourAnswer')}</p>
                  <p className={`text-white font-medium ${!isCorrect ? 'line-through decoration-red-500/50' : ''}`}>{userText || '—'}</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <p className="text-green-500/90 text-xs font-bold uppercase mb-1">{t('lessonResult.correctAnswer')}</p>
                  <p className="text-white font-medium">{correctText || '—'}</p>
                </div>
              </div>
              {q.explanation && (
                <details className="group mt-2">
                  <summary className="flex items-center gap-2 text-primary font-bold text-sm cursor-pointer list-none hover:opacity-80 transition-colors">
                    <span className="material-symbols-outlined text-sm">info</span>
                    {t('lessonResult.viewExplanation')}
                  </summary>
                  <div className="mt-3 p-4 bg-primary/5 rounded-lg border-l-4 border-primary text-gray-400 text-sm leading-relaxed">
                    {q.explanation}
                  </div>
                </details>
              )}
            </div>
          )
        })}
      </section>

      <div className="mt-12 mb-20 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => navigate(`/lesson/reading/${id}`)}
          className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-card-dark text-white text-base font-bold transition-all hover:bg-gray-700 active:scale-95 border border-border-dark"
        >
          <span className="material-symbols-outlined mr-2">refresh</span>
          {t('lessonResult.retry')}
        </button>
        <Link
          to={ROUTES.LESSON}
          className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-primary text-white text-base font-bold shadow-lg shadow-primary/25 transition-all hover:brightness-110 active:scale-95"
        >
          <span className="material-symbols-outlined mr-2">view_list</span>
          {t('lessonResult.backToList')}
        </Link>
      </div>
    </main>
  )
}
