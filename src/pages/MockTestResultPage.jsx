import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { mockTestService } from '../services'
import { SKILLS } from '../constants'

export function MockTestResultPage() {
  const { t } = useTranslation()
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadSessionDetail()
  }, [sessionId])

  const loadSessionDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await mockTestService.getSessionDetail(sessionId)
      if (res?.data) {
        setSession(res.data)
        localStorage.removeItem('engsocial_mock_test')
        localStorage.removeItem('engsocial_mock_test_answers')
      } else {
        setError(true)
      }
    } catch (err) {
      console.error('Failed to load mock test session:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-4">
        <p className="text-red-400">{t('lessonResult.loadError')}</p>
        <Link
          to="/practice/mock-test"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg"
        >
          {t('manageLessons.back')}
        </Link>
      </div>
    )
  }

  const scorePercentage = Math.round((session.overallScore / (session.maxTotalScore || 1)) * 100)

  const SKILL_ORDER = { listening: 1, reading: 2, writing: 3 }
  const sortedResults = [...(session.lessonResults || [])].sort((a, b) => {
    const orderA = SKILL_ORDER[a.lessonId?.skill] || 99
    const orderB = SKILL_ORDER[b.lessonId?.skill] || 99
    return orderA - orderB
  })

  return (
    <main className="max-w-[1200px] mx-auto grid grid-cols-12 gap-6 pt-4 px-4 pb-10 animate-in fade-in duration-700">
      {/* Sidebar — tổng quan */}
      <aside className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-4">
        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark p-5 shadow-lg shadow-slate-100 dark:shadow-none sticky top-4 flex flex-col gap-5 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl" />

          <div className="flex items-center gap-3 relative z-10">
            <button
              type="button"
              onClick={() => navigate('/practice/mock-test')}
              className="size-9 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center text-slate-400 dark:text-gray-500 transition-all border border-slate-100 dark:border-white/5 shrink-0 active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-800 dark:text-white uppercase tracking-wider leading-tight">
                {t('lessonResult.title')}
              </h1>
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1">
                {t('skills.mockTest')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 relative z-10">
            <div className="bg-slate-50 dark:bg-background-dark/40 rounded-xl p-4 border border-slate-100 dark:border-white/5 relative overflow-hidden shadow-inner">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <p className="text-slate-400 dark:text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-1.5">
                {t('lessonResult.scoreLabel')}
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-slate-800 dark:text-white text-xl font-bold">
                  {session.overallScore}/{session.maxTotalScore}
                </p>
                <span className="text-emerald-500 text-[9px] font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10 shrink-0">
                  {scorePercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-card-dark h-1.5 rounded-full mt-3 shadow-inner">
                <div
                  className="bg-gradient-to-r from-primary to-cyan-400 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>
            </div>

            <div className="space-y-0 px-1">
              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                <span className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                  {t('manageLessons.status')}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                    session.status === 'graded'
                      ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                  }`}
                >
                  {session.status === 'graded' ? t('manageLessons.statusGraded') : t('manageLessons.statusCompleted')}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                  {t('manageLessons.date')}
                </span>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary/50">event</span>
                  {new Date(session.completedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Nội dung — từng phần thi */}
      <section className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">analytics</span>
            {t('mockTest.parts')}
          </h2>
          <span className="bg-white dark:bg-card-dark text-slate-400 dark:text-gray-500 text-[9px] font-bold px-3 py-1.5 rounded-full border border-slate-200 dark:border-border-dark uppercase tracking-wider shadow-sm">
            {sortedResults.length} {t('lessonHistory.categoryLesson')}
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-8">
          {sortedResults.map((result, idx) => {
            const skillInfo = SKILLS[result.lessonId?.skill] || {}
            const isWriting = result.lessonId?.skill === 'writing'
            const lessonIdStr = result.lessonId?._id || result.lessonId?.id || ''

            return (
              <div
                key={result._id}
                className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden flex flex-col shadow-md shadow-slate-100 dark:shadow-none hover:border-primary/40 transition-colors animate-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-background-dark/30 flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${skillInfo.color?.replace('text-', 'bg-') || 'bg-primary'}/10 border border-slate-200 dark:border-white/5`}
                    >
                      <span className={`material-symbols-outlined text-xl ${skillInfo.color || 'text-primary'}`}>
                        {skillInfo.icon}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
                        {t(`skills.${result.lessonId?.skill}`)}
                      </p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                        {t('mockTest.tablePart')} {idx + 1}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-slate-800 dark:text-white">
                      {result.score ?? 0}
                      <span className="text-xs font-medium text-slate-400 dark:text-gray-500"> / {result.maxScore || 0}</span>
                    </p>
                    <p className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                      {t('lessonResult.scoreLabel')}
                    </p>
                  </div>
                </div>

                <div className="p-4 flex-1 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-snug line-clamp-2">
                    {result.lessonId?.title}
                  </h3>

                  {!isWriting && result.answers?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-primary/50">checklist</span>
                        {t('lessonResult.questionDetails')}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.answers.map((ans, aIdx) => (
                          <span
                            key={aIdx}
                            className={`size-7 rounded-md flex items-center justify-center text-[10px] font-bold border ${
                              ans.isCorrect
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                            }`}
                            title={ans.isCorrect ? t('lessonResult.correct') : t('lessonResult.incorrect')}
                          >
                            {aIdx + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {isWriting && result.feedback && (
                    <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 border border-slate-100 dark:border-white/5 space-y-2">
                      <div className="flex items-center gap-2 text-[9px] font-bold text-primary uppercase tracking-wider">
                        <span className="material-symbols-outlined text-base">chat_bubble</span>
                        {t('writingLesson.modFeedback')}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed pl-2 border-l-2 border-primary/20">
                        {result.feedback}
                      </p>
                    </div>
                  )}
                </div>

                <div className="px-4 pb-4 mt-auto">
                  <Link
                    to={`/practice/${result.lessonId?.skill}/${lessonIdStr}/result`}
                    className="w-full py-2 bg-slate-900 dark:bg-white/5 hover:bg-primary text-white dark:text-slate-400 hover:dark:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-transparent flex items-center justify-center gap-2 group/btn shadow-sm active:scale-95"
                  >
                    {t('mockTest.viewDetails') || 'Xem chi tiết'}
                    <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
