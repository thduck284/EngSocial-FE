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
    <main className="max-w-[1440px] mx-auto grid grid-cols-12 gap-6 p-4 md:p-6 lg:p-8">
      {/* Sidebar Trái */}
      <aside className="col-span-12 lg:col-span-3 space-y-5">
        <div className="bg-card-dark rounded-2xl p-6 border border-border-dark shadow-xl flex flex-col gap-5 sticky top-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-white text-2xl font-black tracking-tight">{t('lessonResult.title')}</h1>
            <p className="text-gray-400 text-xs leading-relaxed italic">
               "{lessonTitle}"
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="bg-background-dark/30 rounded-xl p-5 border border-border-dark relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-1.5">{t('lessonResult.scoreLabel')}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-white text-3xl font-black">{score}/{maxScore}</p>
                <span className="text-green-500 text-[10px] font-bold">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-background-dark h-1 rounded-full mt-3">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-background-dark/30 rounded-xl p-5 border border-border-dark relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
              <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-1.5">{t('lessonResult.xpEarned')}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-white text-3xl font-black">+{displayXp} XP</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">list_alt</span>
              {t('lessonResult.questionDetails')}
            </p>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, idx) => {
                const userAnswer = getAnswerForQuestion(idx)
                const isCorrect = userAnswer?.isCorrect
                return (
                  <button
                    key={idx}
                    onClick={() => scrollToQuestion(idx)}
                    className={`size-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all border shrink-0 ${
                      isCorrect 
                        ? 'bg-green-500/10 border-green-500/30 text-green-500' 
                        : 'bg-red-500/10 border-red-500/30 text-red-500'
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-2">
            <button
              type="button"
              onClick={() => navigate(`/lesson/listening/${id}`)}
              className="w-full cursor-pointer flex items-center justify-center rounded-xl h-11 bg-card-dark text-white text-xs font-bold transition-all hover:bg-gray-700 active:scale-95 border border-border-dark"
            >
              <span className="material-symbols-outlined mr-2 text-sm">refresh</span>
              {t('lessonResult.retry')}
            </button>
          </div>
        </div>
      </aside>

      {/* Nội dung chính */}
      <div className="col-span-12 lg:col-span-9 space-y-6">
        {/* Audio Player Section */}
        {audioUrl && (
          <section className="bg-card-dark rounded-3xl border border-border-dark overflow-hidden shadow-xl p-6 flex flex-col md:flex-row items-center gap-6">
            <div className={`size-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined text-primary text-4xl animate-pulse">headset</span>
            </div>
            <div className="flex-1 w-full space-y-3">
              <div>
                <h3 className="text-white font-bold text-lg">{t('listeningLesson.audioTitle') || 'Listening Material'}</h3>
                <p className="text-xs text-gray-500">{t('listeningLesson.audioSubtitle') || 'Listen again to improve your understanding'}</p>
              </div>
              <audio 
                src={audioUrl} 
                controls 
                className="w-full h-10 rounded-lg custom-audio-player"
              />
            </div>
          </section>
        )}

        {/* Transcript Section */}
        {transcript && (
          <section className="bg-card-dark rounded-3xl border border-border-dark overflow-hidden shadow-xl">
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between p-5 list-none hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">description</span>
                  </div>
                  <h3 className="text-white text-sm font-bold">{t('listeningLesson.transcript') || 'Transcript'}</h3>
                </div>
                <span className="material-symbols-outlined text-gray-500 transition-transform duration-300 group-open:rotate-180">expand_more</span>
              </summary>
              <div className="p-8 pt-2 text-gray-300 leading-relaxed text-sm whitespace-pre-wrap border-t border-border-dark/30 bg-background-dark/20 italic">
                {transcript}
              </div>
            </details>
          </section>
        )}

        <div className="flex items-center justify-between px-1 pt-4">
          <h2 className="text-white text-xl font-black tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">fact_check</span>
            {t('lessonResult.questionDetails')}
          </h2>
        </div>

        <div className="flex flex-col gap-5">
          {questions.map((q, index) => {
            const userAnswer = getAnswerForQuestion(index)
            const isCorrect = userAnswer?.isCorrect
            const correctText = q.options?.find((o) => o.value === q.correctAnswer)?.text || q.correctAnswer
            const userText = q.options?.find((o) => o.value === (userAnswer?.answer ?? userAnswer?.userAnswer))?.text || (userAnswer?.answer ?? userAnswer?.userAnswer)

            return (
              <div
                key={q.id || index}
                id={`question-card-${index}`}
                className={`bg-card-dark border rounded-2xl p-7 flex flex-col gap-5 shadow-lg border-border-dark ${!isCorrect ? 'border-l-4 border-l-red-500' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-primary font-black uppercase text-[9px] tracking-widest">{t('lessonResult.questionNum', { num: index + 1 })}</span>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${isCorrect ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    <span className="material-symbols-outlined text-xs">{isCorrect ? 'check_circle' : 'cancel'}</span>
                    {isCorrect ? t('lessonResult.correct') : t('lessonResult.incorrect')}
                  </div>
                </div>
                
                <p className="text-white text-lg font-bold">{q.question}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className={`p-4 rounded-xl border ${!isCorrect ? 'bg-red-500/5 border-red-500/20' : 'bg-background-dark/50 border-border-dark'}`}>
                    <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-1">{t('lessonResult.yourAnswer')}</p>
                    <p className={`text-white text-sm font-bold ${!isCorrect ? 'line-through decoration-red-500/30 text-gray-500' : ''}`}>{userText || '—'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                    <p className="text-green-500/70 text-[9px] font-bold uppercase tracking-widest mb-1">{t('lessonResult.correctAnswer')}</p>
                    <p className="text-white text-sm font-bold">{correctText || '—'}</p>
                  </div>
                </div>
                
                {q.explanation && (
                  <details className="group">
                    <summary className="flex items-center gap-1.5 text-primary font-black text-[10px] cursor-pointer list-none uppercase tracking-widest">
                      <span className="material-symbols-outlined text-base">info</span>
                      {t('lessonResult.viewExplanation')}
                    </summary>
                    <div className="mt-3 p-5 bg-primary/5 rounded-xl border-l-[3px] border-primary text-gray-400 text-xs italic">
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
