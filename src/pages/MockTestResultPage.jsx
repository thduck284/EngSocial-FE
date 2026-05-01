import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { mockTestService } from '../services'
import { ROUTES, SKILLS } from '../constants'

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
        // Cleanup active mock test session once results are loaded
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
      <div className="max-w-[1200px] mx-auto px-6 py-12 text-center space-y-4">
        <h2 className="text-2xl font-black text-white uppercase">{t('common.error')}</h2>
        <p className="text-gray-500">{t('lessonResult.loadError')}</p>
        <Link 
          to="/practice/mock-test" 
          className="inline-block px-8 py-3 bg-primary text-background-dark font-black rounded-xl"
        >
          {t('manageLessons.back')}
        </Link>
      </div>
    )
  }

  const scorePercentage = Math.round((session.overallScore / (session.maxTotalScore || 1)) * 100)

  // Sort results: Listening -> Reading -> Writing
  const SKILL_ORDER = { listening: 1, reading: 2, writing: 3 }
  const sortedResults = [...(session.lessonResults || [])].sort((a, b) => {
    const orderA = SKILL_ORDER[a.lessonId?.skill] || 99
    const orderB = SKILL_ORDER[b.lessonId?.skill] || 99
    return orderA - orderB
  })

  return (
    <main className="max-w-[1440px] mx-auto grid grid-cols-12 gap-10 pt-4 px-6 pb-10 lg:pt-4 lg:px-10 lg:pb-10 animate-in fade-in duration-700">
      {/* Sidebar - Overall Summary */}
      <aside className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-8">
        <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none sticky top-4 flex flex-col gap-10 overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
          
          <div className="flex items-center gap-6 relative z-10">
            <button 
              onClick={() => navigate('/practice/mock-test')}
              className="size-14 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center text-slate-400 dark:text-gray-500 transition-all border border-slate-100 dark:border-white/5 shrink-0 shadow-inner active:scale-90"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">{t('lessonResult.title')}</h1>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-3 bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-block">{t('skills.mockTest')}</p>
            </div>
          </div>

          <div className="space-y-10 relative z-10">
            {/* Score Display */}
            <div className="text-center p-10 bg-slate-50 dark:bg-background-dark/40 rounded-[2.5rem] border border-slate-100 dark:border-white/5 overflow-hidden relative shadow-inner group/score">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/score:opacity-100 transition-opacity" />
              <div className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] mb-6">{t('lessonResult.scoreLabel')}</div>
              <div className="flex items-baseline justify-center gap-3 relative z-10">
                <span className="text-7xl font-black text-slate-900 dark:text-white drop-shadow-2xl">{session.overallScore}</span>
                <span className="text-xl font-bold text-slate-400 dark:text-gray-600 tracking-widest uppercase">/ {session.maxTotalScore}</span>
              </div>
              
              <div className="mt-10 space-y-4 relative z-10">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                  <span className="text-slate-400 dark:text-gray-500">{t('lessonResult.percentage')}</span>
                  <span className="text-primary font-black">{scorePercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-card-dark h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-primary to-cyan-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(19,182,236,0.5)]"
                    style={{ width: `${scorePercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Session Info */}
            <div className="space-y-2 px-2">
              <div className="flex items-center justify-between py-6 border-b border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-[0.2em]">{t('manageLessons.status')}</span>
                <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-2xl border-2 transition-all ${
                  session.status === 'graded' 
                    ? 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20' 
                    : 'text-amber-500 bg-amber-500/5 border-amber-500/20 shadow-lg shadow-amber-500/10'
                }`}>
                  {session.status === 'graded' ? t('manageLessons.statusGraded') : t('manageLessons.statusCompleted')}
                </span>
              </div>
              <div className="flex items-center justify-between py-6 border-b border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-[0.2em]">{t('manageLessons.date')}</span>
                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <span className="material-symbols-outlined text-lg text-primary/50">event</span>
                  <span className="text-[11px] font-black uppercase tracking-widest">{new Date(session.completedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - Parts breakdown */}
      <section className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-12">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-6">
            <span className="size-16 rounded-[1.5rem] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30">
              <span className="material-symbols-outlined text-3xl">analytics</span>
            </span>
            {t('mockTest.parts')}
          </h2>
          <div className="flex flex-col items-end">
             <span className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-[0.3em] bg-white dark:bg-card-dark px-6 py-3 rounded-full border border-slate-100 dark:border-white/5 shadow-xl">
              {sortedResults.length} {t('lessonHistory.categoryLesson')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 pb-32">
          {sortedResults.map((result, idx) => {
            const skillInfo = SKILLS[result.lessonId?.skill] || {}
            const isWriting = result.lessonId?.skill === 'writing'
            const lessonIdStr = result.lessonId?._id || result.lessonId?.id || ''
            
            return (
              <div 
                key={result._id} 
                className="bg-white dark:bg-card-dark rounded-[3rem] border border-slate-200 dark:border-border-dark overflow-hidden flex flex-col shadow-2xl shadow-slate-200/50 dark:shadow-none hover:border-primary/50 transition-all hover:-translate-y-2 group animate-in slide-in-from-bottom-8 duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Part Header */}
                <div className="p-10 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-background-dark/30 flex justify-between items-center relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-24 h-24 ${skillInfo.color?.replace('text-', 'bg-') || 'bg-primary'} opacity-5 rounded-full -mr-12 -mt-12 blur-2xl transition-opacity group-hover:opacity-10`} />
                  <div className="flex items-center gap-6 relative z-10">
                    <div className={`size-16 rounded-[1.5rem] flex items-center justify-center ${skillInfo.color?.replace('text-', 'bg-') || 'bg-primary'}/10 border border-slate-200 dark:border-white/5 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                      <span className={`material-symbols-outlined text-3xl ${skillInfo.color || 'text-primary'}`}>
                        {skillInfo.icon}
                      </span>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-slate-300 dark:bg-gray-700" />
                        {t(`skills.${result.lessonId?.skill}`)}
                      </div>
                      <div className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                        {t('mockTest.tablePart')} {idx + 1}
                      </div>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1.5 justify-end tracking-tighter">
                      {isWriting 
                        ? (result.score ?? result.submission?.aiScore ?? 0) 
                        : (result.score ?? 0)
                      }
                      <span className="text-sm font-black text-slate-300 dark:text-gray-700 tracking-widest uppercase">/ {result.maxScore || (isWriting ? 100 : 0)}</span>
                    </div>
                    <div className="text-[9px] text-slate-400 dark:text-gray-600 font-black uppercase tracking-[0.3em] mt-2 italic">{t('lessonResult.scoreLabel')}</div>
                  </div>
                </div>

                {/* Part Body */}
                <div className="p-10 flex-1 space-y-10">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                    {result.lessonId?.title}
                  </h3>

                  {/* Question Dots */}
                  {!isWriting && result.answers && (
                    <div className="space-y-6">
                       <p className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="material-symbols-outlined text-base text-primary/50">checklist</span>
                        {t('lessonResult.questionDetails')}
                       </p>
                       <div className="flex flex-wrap gap-3">
                        {result.answers.map((ans, aIdx) => (
                          <div 
                            key={aIdx} 
                            className={`size-4 rounded-full border-2 transition-all hover:scale-125 hover:shadow-xl ${
                              ans.isCorrect 
                                ? 'bg-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                                : 'bg-rose-500 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                            }`}
                            title={ans.isCorrect ? 'Correct' : 'Incorrect'}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {isWriting && result.feedback && (
                    <div className="bg-slate-50 dark:bg-white/5 rounded-[2rem] p-8 border border-slate-100 dark:border-white/5 space-y-6 relative overflow-hidden shadow-inner group/feedback">
                      <div className="absolute -right-6 -bottom-6 size-24 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover/feedback:opacity-100 transition-opacity" />
                      <div className="flex items-center gap-4 text-[10px] font-black text-primary uppercase tracking-[0.2em] relative z-10">
                        <span className="material-symbols-outlined text-2xl">chat_bubble</span>
                        {t('writingLesson.modFeedback')}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed italic font-bold relative z-10 pl-2 border-l-4 border-primary/20">
                        &quot;{result.feedback}&quot;
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-10 pb-10 mt-auto">
                  <Link
                    to={`/practice/${result.lessonId?.skill}/${lessonIdStr}/result`}
                    className="w-full py-5 bg-slate-900 dark:bg-white/5 hover:bg-primary text-white dark:text-slate-400 hover:dark:text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-transparent flex items-center justify-center gap-4 group/btn shadow-xl shadow-slate-900/10 active:scale-95"
                  >
                    {t('mockTest.viewDetails') || 'Xem chi tiết'}
                    <span className="material-symbols-outlined text-xl group-hover/btn:translate-x-2 transition-transform duration-300">arrow_forward</span>
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
