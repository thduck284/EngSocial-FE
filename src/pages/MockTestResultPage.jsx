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
    <main className="max-w-[1440px] mx-auto grid grid-cols-12 gap-8 p-6 lg:p-8">
      {/* Sidebar - Overall Summary */}
      <aside className="col-span-12 lg:col-span-3 space-y-6">
        <div className="bg-card-dark rounded-3xl border border-border-dark p-6 shadow-2xl sticky top-24 flex flex-col gap-6 overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/practice/mock-test')}
              className="size-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-gray-400 transition-colors border border-border-dark shrink-0"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none uppercase">{t('lessonResult.title')}</h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{t('skills.mockTest')}</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border-dark/30">
            {/* Score Display */}
            <div className="text-center p-6 bg-background-dark/40 rounded-2xl border border-white/5 overflow-hidden relative">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">{t('lessonResult.scoreLabel')}</div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-black text-white">{session.overallScore}</span>
                <span className="text-gray-500 font-bold">/ {session.maxTotalScore}</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase text-gray-400">
                <span>{t('lessonResult.percentage')}</span>
                <span className="text-primary">{scorePercentage}%</span>
              </div>
              <div className="w-full bg-background-dark/50 h-2 rounded-full mt-2 overflow-hidden border border-white/5">
                <div 
                  className="bg-primary h-full transition-all duration-1000 shadow-[0_0_12px_rgba(19,182,236,0.5)]"
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>
            </div>

            {/* Session Info */}
            <div className="space-y-3 px-1">
              <div className="flex items-center justify-between py-2 border-b border-border-dark/20">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t('manageLessons.status')}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${
                  session.status === 'graded' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'
                }`}>
                  {session.status === 'graded' ? t('manageLessons.statusGraded') : t('manageLessons.statusCompleted')}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border-dark/20">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t('manageLessons.date')}</span>
                <span className="text-[10px] text-gray-300 font-bold">{new Date(session.completedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - Parts breakdown */}
      <section className="col-span-12 lg:col-span-9 space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">list_alt</span>
            {t('mockTest.parts')}
          </h2>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-card-dark px-3 py-1 rounded-full border border-border-dark">
            {sortedResults.length} {t('lessonHistory.categoryLesson')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedResults.map((result, idx) => {
            const skillInfo = SKILLS[result.lessonId?.skill] || {}
            const isWriting = result.lessonId?.skill === 'writing'
            const lessonIdStr = result.lessonId?._id || result.lessonId?.id || ''
            
            return (
              <div 
                key={result._id} 
                className="bg-card-dark rounded-3xl border border-border-dark overflow-hidden flex flex-col shadow-lg hover:border-primary/30 transition-all hover:translate-y-[-2px] group"
              >
                {/* Part Header */}
                <div className="p-5 border-b border-border-dark/50 bg-background-dark/30 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-xl flex items-center justify-center ${skillInfo.color?.replace('text-', 'bg-') || 'bg-primary'}/10`}>
                      <span className={`material-symbols-outlined ${skillInfo.color || 'text-primary'}`}>
                        {skillInfo.icon}
                      </span>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">
                        {t(`skills.${result.lessonId?.skill}`)}
                      </div>
                      <div className="text-xs font-bold text-white group-hover:text-primary transition-colors">
                        Part {idx + 1}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-white">{result.score ?? 0}/{result.maxScore}</div>
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">{t('lessonResult.scoreLabel')}</div>
                  </div>
                </div>

                {/* Part Body */}
                <div className="p-6 flex-1 space-y-5">
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {result.lessonId?.title}
                  </h3>

                  {/* Question Dots for Reading/Listening */}
                  {!isWriting && result.answers && (
                    <div className="space-y-2">
                       <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{t('lessonResult.questionDetails')}</p>
                       <div className="flex flex-wrap gap-2">
                        {result.answers.map((ans, aIdx) => (
                          <div 
                            key={aIdx} 
                            className={`size-2.5 rounded-full ${ans.isCorrect ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]'}`}
                            title={ans.isCorrect ? 'Correct' : 'Incorrect'}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {isWriting && result.feedback && (
                    <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                        <span className="material-symbols-outlined text-sm">comment</span>
                        {t('writingLesson.modFeedback')}
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed italic line-clamp-4">
                        &quot;{result.feedback}&quot;
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-6 pb-6 mt-auto">
                  <Link
                    to={`/practice/${result.lessonId?.skill}/${lessonIdStr}/result`}
                    className="w-full py-3.5 bg-white/5 hover:bg-primary hover:text-background-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    {t('mockTest.viewDetails') || 'Xem chi tiết'}
                    <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
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
