import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lessonsService, mockTestService } from '../../services'
import { formatTime } from '../../utils/dateTime'
import { AlertModal } from '../ui/common/AlertModal'

export function MockTestSidebar({ currentAnswers, currentLessonId }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [mockTestData, setMockTestData] = useState(null)
  const [allAnswers, setAllAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem('engsocial_mock_test')
    if (data) {
      const parsed = JSON.parse(data)
      setMockTestData(parsed)
      
      // Calculate remaining time
      const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000)
      const remaining = Math.max(0, parsed.totalDurationSec - elapsed)
      setTimeLeft(remaining)
    }
    const savedAnswers = localStorage.getItem('engsocial_mock_test_answers')
    if (savedAnswers) {
      setAllAnswers(JSON.parse(savedAnswers))
    }
  }, [])

  // Global Timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft])

  // Sync current questions' answers to global mock test answers in localStorage
  useEffect(() => {
    if (currentLessonId && currentAnswers) {
      setAllAnswers(prev => {
        const next = { ...prev, [currentLessonId]: currentAnswers }
        localStorage.setItem('engsocial_mock_test_answers', JSON.stringify(next))
        return next
      })
    }
  }, [currentAnswers, currentLessonId])

  if (!mockTestData) return null

  const handleNavigateToLesson = (lessonId, skill, questionIdx = 0) => {
    navigate(`/practice/${skill}/${lessonId}/study`, { state: { questionIdx } })
  }

  const handleConfirmSubmit = async () => {
    setShowSubmitConfirm(false)
    setSubmitting(true)

    try {
      const lessons = mockTestData.lessons
      
      // 1. Submit each part individually
      await Promise.all(lessons.map(async (lesson) => {
        const answers = allAnswers[lesson.id] || {}
        if (lesson.skill === 'writing') {
          const content = answers[0] || ''
          return lessonsService.submitWriting(lesson.id, {
            content,
            wordCount: content.trim().split(/\s+/).filter(Boolean).length,
            isMockTest: true
          })
        }
        
        // For Reading/Listening, convert answers object to expected payload array
        const answersPayload = Object.entries(answers).map(([key, val]) => ({
          questionIndex: parseInt(key, 10),
          answer: val
        }))
        
        return lessonsService.submit(lesson.id, { answers: answersPayload, isMockTest: true })
      }))

      // 2. Record the overall Mock Test Session in the new model
      const res = await mockTestService.recordSession({
        lessons: lessons.map(l => ({
          lessonId: l.id || l._id,
          skill: l.skill,
          title: l.title
        }))
      })

      // localStorage.removeItem('engsocial_mock_test')
      // localStorage.removeItem('engsocial_mock_test_answers')
      
      if (res?.data?._id) {
        navigate(`/practice/mock-test/result/${res.data._id}`)
      } else {
        navigate('/practice/mock-test')
      }
    } catch (err) {
      console.error('Mock test submission failed:', err)
      // alert(t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmQuit = () => {
    setShowQuitConfirm(false)
    localStorage.removeItem('engsocial_mock_test')
    localStorage.removeItem('engsocial_mock_test_answers')
    navigate('/practice/mock-test')
  }

  return (
    <aside className="w-full lg:w-[320px] lg:min-w-[280px] lg:shrink lg:basis-[320px] lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
      <div className="bg-card-dark rounded-2xl border border-border-dark shadow-xl overflow-hidden flex flex-col h-full">
        {/* Global Timer Section - Pinned */}
        <div className={`p-6 border-b border-border-dark text-center space-y-2 shrink-0 ${timeLeft <= 60 ? 'bg-red-500/10' : 'bg-primary/5'}`}>
          <div className="flex items-center justify-center gap-2 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">schedule</span>
            {t('mockTest.totalTimeRemaining') || 'Total Time Remaining'}
          </div>
          <div className={`text-3xl font-mono font-black ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {timeLeft != null ? formatTime(timeLeft) : '--:--'}
          </div>
        </div>

        <div className="p-5 border-b border-border-dark bg-background-dark/30 shrink-0">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            {t('skills.mockTest')}
          </h3>
          <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">
            {mockTestData.lessons.length} {t('mockTest.parts')}
          </p>
        </div>

        {/* Scrollable middle section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8">
          {mockTestData.lessons.map((lesson, partIdx) => {
            const isWriting = lesson.skill === 'writing'
            const isCurrent = lesson.id === id || lesson.id === currentLessonId
            const lessonAnswers = allAnswers[lesson.id] || {}
            const totalQ = isWriting ? 1 : (lesson.totalQuestions || 0)
            const hasStartedWriting = isWriting && (lessonAnswers && Object.keys(lessonAnswers).length > 0)
            
            return (
              <div key={lesson.id} className="space-y-3">
                <div 
                  className={`flex items-center justify-between ${isWriting ? 'cursor-pointer hover:opacity-80 transition-all' : ''}`}
                  onClick={() => isWriting && handleNavigateToLesson(lesson.id, lesson.skill)}
                >
                  <div className="flex flex-col gap-0.5">
                    <h4 className={`text-[11px] font-black uppercase tracking-wider ${isCurrent ? 'text-primary' : 'text-gray-400'}`}>
                      {t('mockTest.part')} {partIdx + 1}: {lesson.title}
                    </h4>
                    {isWriting && hasStartedWriting && (
                      <span className="text-[9px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">check_circle</span>
                        {t('buttons.selected') || 'Completed'}
                      </span>
                    )}
                  </div>
                  <span className={`material-symbols-outlined text-xs ${isCurrent ? 'text-primary' : 'text-gray-500'}`}>
                    {lesson.skill === 'reading' ? 'menu_book' : lesson.skill === 'listening' ? 'headphones' : 'edit_note'}
                  </span>
                </div>

                {!isWriting && (
                  <div className="grid grid-cols-6 gap-1.5">
                    {Array.from({ length: totalQ }).map((_, qIdx) => {
                      const hasAnswer = lessonAnswers[qIdx] != null && String(lessonAnswers[qIdx]).trim() !== ''
                      
                      return (
                        <button
                          key={qIdx}
                          onClick={() => handleNavigateToLesson(lesson.id, lesson.skill, qIdx)}
                          className={`size-8 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-center ${
                            isCurrent && hasAnswer 
                              ? 'bg-primary/20 text-primary border-primary/40' 
                              : hasAnswer
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : isCurrent
                              ? 'bg-background-dark text-white border-white/10 hover:border-primary/50'
                              : 'bg-background-dark/50 text-gray-600 border-transparent hover:border-white/10'
                          } ${isCurrent ? 'ring-1 ring-primary/20' : ''}`}
                        >
                          {qIdx + 1}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Action Buttons - Pinned Footer */}
        <div className="p-4 border-t border-border-dark bg-background-dark/50 space-y-3 shrink-0">
          <button 
            onClick={() => setShowSubmitConfirm(true)}
            disabled={submitting}
            className="w-full py-4 bg-primary hover:brightness-110 text-background-dark rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={`material-symbols-outlined text-lg ${submitting ? 'animate-spin' : ''}`}>
              {submitting ? 'progress_activity' : 'check_circle'}
            </span>
            {submitting ? t('common.loading') : (t('mockTest.submitAll') || 'Finish & Submit All')}
          </button>
          
          <button 
            onClick={() => setShowQuitConfirm(true)}
            disabled={submitting}
            className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-lg">cancel</span>
            {t('mockTest.quitTest') || 'Quit Test'}
          </button>
        </div>
      </div>

      <AlertModal
        open={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={handleConfirmSubmit}
        title={t('mockTest.submitAll')}
        message={t('writingLesson.confirmSubmit') || 'Finish & Submit All?'}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
      />

      <AlertModal
        open={showQuitConfirm}
        onClose={() => setShowQuitConfirm(false)}
        onConfirm={handleConfirmQuit}
        title={t('mockTest.quitTest')}
        message={t('mockTest.confirmQuit')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        type="warning"
      />
    </aside>
  )
}
