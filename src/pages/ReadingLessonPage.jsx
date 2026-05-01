import { useEffect, useState } from 'react'
import { Link, useParams, useLocation, useBlocker } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useReadingLesson } from '../hooks/useReadingLesson'
import { formatTime } from '../utils/dateTime'
import { AlertModal } from '../components/ui/common/AlertModal'
import { MockTestSidebar } from '../components/layout/MockTestSidebar'

export function ReadingLessonPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const location = useLocation()
  const isPractice = location.pathname.startsWith('/practice/')
  const backLink = isPractice ? '/practice/reading' : '/lesson?skill=reading'

  const [rightBarOpen, setRightBarOpen] = useState(false)

  const [isMockTest, setIsMockTest] = useState(false)

  const {
    content,
    loading,
    vocabularyList,
    questions,
    mockReadingContent,
    mockReadingLeaderboard,
    totalQuestions,
    question,
    questionOptions,
    progress,
    currentQuestion,
    selectedAnswer,
    setSelectedAnswer,
    countdownSeconds,
    noteTitle,
    setNoteTitle,
    noteContent,
    setNoteContent,
    noteSaving,
    noteSavedMessage,
    handleSaveNote,
    editingPage,
    pageInput,
    setPageInput,
    showHint,
    setShowHint,
    showIncompleteModal,
    closeIncompleteModal,
    completingLesson,
    completeMessage,
    showConfirmModal,
    setShowConfirmModal,
    handleComplete,
    handleConfirmComplete,
    vocabIndex,
    setVocabIndex,
    showVocabTable,
    setShowVocabTable,
    answers,
    passageLang,
    setPassageLang,
    highlightOn,
    setHighlightOn,
    handleNext,
    handlePrevious,
    handleSubmit,
    handlePageChange,
    handlePageInputKeyDown,
    startEditingPage,
    currentPage,
    totalPages,
    showPrevPages,
    showNextPages,
  } = useReadingLesson(id, t)

  useEffect(() => {
    const data = localStorage.getItem('engsocial_mock_test')
    if (data) {
      const parsed = JSON.parse(data)
      // Check if current lesson ID or slug is in the mock test lessons
      const isInTest = parsed.lessons.some(l => l.id === id || l.slug === id)
      setIsMockTest(isInTest)
    } else {
      setIsMockTest(false)
    }
  }, [id, content])

  // Default: keep right panel closed when entering/reloading a lesson.
  useEffect(() => {
    setRightBarOpen(isMockTest) // Auto-open right bar in mock test
  }, [id, isMockTest])

  useEffect(() => {
    if (location.state?.questionIdx !== undefined && content) {
      handlePageChange(location.state.questionIdx + 1)
    }
  }, [location.state?.questionIdx, content])

  // Navigation Blocker
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [blockedLocation, setBlockedLocation] = useState(null)

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => {
      if (completingLesson) return false
      if (currentLocation.pathname === nextLocation.pathname) return false
      
      const inMockTest = !!localStorage.getItem('engsocial_mock_test')

      // Allow navigation between lessons if in Mock Test or going to result
      if (nextLocation.pathname.includes('/result') || nextLocation.pathname.includes('/mock-test') || (inMockTest && nextLocation.pathname.includes('/study'))) {
        return false
      }
      
      return true
    }
  )

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowExitConfirm(true)
    }
  }, [blocker.state])

  const handleConfirmExit = () => {
    setShowExitConfirm(false)
    blocker.proceed()
  }

  const handleCancelExit = () => {
    setShowExitConfirm(false)
    blocker.reset()
  }

  // Prevent browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!completingLesson) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [completingLesson])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    )
  }
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <span className="material-symbols-outlined text-5xl mb-4">error</span>
        <p>{t('readingLesson.loadError')}</p>
        <Link to={backLink} className="mt-4 text-primary hover:underline">{t('readingLesson.back')}</Link>
      </div>
    )
  }

  return (
    <>
      <main className="max-w-[1600px] mx-auto px-6 pt-4 pb-10 flex flex-col lg:flex-row gap-10 min-h-[calc(100vh-64px)]">
      {/* Left Sidebar - Hidden in Mock Test */}
      {!isMockTest && (
      <aside className="w-full lg:w-80 lg:shrink-0 space-y-10 overflow-y-auto no-scrollbar pb-10">
        {/* Lesson Info Card */}
        <div className="bg-white dark:bg-card-dark rounded-[2.5rem] p-8 border border-slate-200 dark:border-border-dark shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="flex justify-between items-start mb-6 relative z-10">
            <span className="bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
              {t('readingLesson.level')} {mockReadingContent.level}
            </span>
            <div className="flex items-center text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 shadow-sm">
              <span className="material-symbols-outlined text-sm mr-1.5">star</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{mockReadingContent.xpReward} XP</span>
            </div>
          </div>
          <h2 className="text-xl font-black mb-6 text-slate-900 dark:text-white leading-tight uppercase tracking-tight relative z-10">{mockReadingContent.title}</h2>
          <div className="space-y-4 relative z-10">
            {[
              { icon: 'topic', text: mockReadingContent.topic },
              { icon: 'schedule', text: mockReadingContent.time },
              { icon: 'quiz', text: t('readingLesson.questionCountShort', { count: totalQuestions }) },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 transition-all hover:translate-x-1">
                <span className="material-symbols-outlined text-lg text-primary">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 relative z-10">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-3">
              <span className="text-slate-400 dark:text-gray-500">{t('readingLesson.progress')}</span>
              <span className="text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-background-dark rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-primary to-cyan-400 h-3 rounded-full shadow-[0_0_15px_rgba(19,182,236,0.5)] transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Notes Card */}
        <div className="bg-white dark:bg-card-dark rounded-[2.5rem] p-8 border border-slate-200 dark:border-border-dark shadow-2xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary text-2xl">note_alt</span>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">{t('readingLesson.notebook')}</h3>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-white/5 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-slate-400 dark:placeholder:text-gray-600 text-slate-700 dark:text-white transition-all shadow-inner"
              placeholder={t('readingLesson.noteTitlePlaceholder')}
            />
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-white/5 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-slate-400 dark:placeholder:text-gray-600 text-slate-700 dark:text-white transition-all shadow-inner resize-none"
              placeholder={t('readingLesson.notePlaceholder')}
              rows={4}
            />
            {noteSavedMessage && <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse px-2">{noteSavedMessage}</p>}
            <button
              type="button"
              onClick={handleSaveNote}
              disabled={noteSaving}
              className="w-full py-4 bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 shadow-xl shadow-slate-900/10"
            >
              {noteSaving ? '...' : t('readingLesson.saveNote')}
            </button>
          </div>
        </div>

        {/* Study Tip Card */}
        <div className="bg-primary/5 dark:bg-primary/10 border-2 border-primary/20 rounded-[2rem] p-8 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 size-20 bg-primary/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <span className="material-symbols-outlined text-primary text-2xl">lightbulb</span>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">{t('readingLesson.tipTitle')}</h3>
          </div>
          <p className="text-[11px] font-bold leading-relaxed text-slate-600 dark:text-gray-400 italic relative z-10">
            &quot;{t('readingLesson.tipText')}&quot;
          </p>
        </div>
      </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col gap-10 overflow-hidden">
        <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark overflow-hidden flex flex-col flex-1 shadow-2xl shadow-slate-200/50 dark:shadow-none">
          {/* Toolbar */}
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-background-dark/30">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPassageLang((prev) => (prev === 'en' ? 'vi' : 'en'))}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 active:scale-95 ${
                  passageLang === 'vi'
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                    : 'bg-white dark:bg-white/5 text-primary border-primary/20 hover:bg-primary/5'
                }`}
              >
                <span className="material-symbols-outlined text-base">translate</span>
                {passageLang === 'en' ? t('readingLesson.translatePassageVi') : t('readingLesson.passageOriginalEn')}
              </button>
              <button
                type="button"
                onClick={() => setHighlightOn((prev) => !prev)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 active:scale-95 ${
                  highlightOn
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30'
                    : 'bg-white dark:bg-white/5 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/5'
                }`}
              >
                <span className="material-symbols-outlined text-base">ink_highlighter</span>
                {highlightOn ? t('readingLesson.highlightOn') : t('readingLesson.highlight')}
              </button>
            </div>
            <div className="flex items-center gap-6 text-slate-300 dark:text-gray-700">
              <span className="material-symbols-outlined hover:text-primary cursor-pointer text-2xl transition-colors">text_increase</span>
              <span className="material-symbols-outlined hover:text-primary cursor-pointer text-2xl transition-colors">bookmark_border</span>
            </div>
          </div>

          {/* Split View */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden divide-x-2 divide-slate-100 dark:divide-white/5">
            {/* Reading Text */}
            <div className="overflow-y-auto no-scrollbar p-10 bg-slate-50/30 dark:bg-background-dark/30">
              {mockReadingContent.thumbnail && (
                <div className="relative mb-10 group">
                  <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-40 transition-opacity" />
                  <img
                    alt={mockReadingContent.title}
                    className="w-full h-48 object-cover rounded-3xl relative z-10 shadow-2xl transition-transform group-hover:scale-[1.02]"
                    src={mockReadingContent.thumbnail}
                  />
                </div>
              )}
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {(passageLang === 'vi' && mockReadingContent.translationVi
                  ? mockReadingContent.translationVi
                  : mockReadingContent.text || ''
                )
                  .split(/\r?\n/)
                  .map((paragraph, idx) => (
                    <p key={idx} className="text-slate-800 dark:text-slate-200 leading-relaxed mb-6 text-lg font-medium selection:bg-primary/30">
                      {paragraph.trim() ? (
                        paragraph.split(/\s+/).filter(Boolean).map((word, wordIdx) => {
                          const wordClean = word.replace(/[.,!?;:]/g, '')
                          const isHighlighted = highlightOn && vocabularyList.some(
                            (v) => v.word && wordClean.toLowerCase() === v.word.toLowerCase()
                          )
                          return (
                            <span
                              key={wordIdx}
                              className={
                                isHighlighted
                                  ? 'bg-primary/20 dark:bg-primary/30 border-b-2 border-primary px-1 cursor-pointer text-slate-900 dark:text-white font-black hover:bg-primary/40 transition-all rounded-sm'
                                  : ''
                              }
                            >
                              {word}{' '}
                            </span>
                          )
                        })
                      ) : (
                        <span className="block h-4" />
                      )}
                    </p>
                  ))}
              </div>
              {passageLang === 'vi' && !mockReadingContent.translationVi && (mockReadingContent.text || '').trim() && (
                <p className="text-[10px] font-black text-slate-400 dark:text-gray-600 italic mt-8 uppercase tracking-widest">{t('readingLesson.noTranslation')}</p>
              )}
              
              {/* Bảng từ vựng */}
              {vocabularyList.length > 0 && (
                <div className="mt-12 border-t-2 border-slate-100 dark:border-white/5 pt-8">
                  <button
                    type="button"
                    onClick={() => setShowVocabTable((v) => !v)}
                    className="flex items-center justify-between w-full py-4 text-left group"
                  >
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white group-hover:text-primary transition-colors">{t('readingLesson.vocabTableTitle')}</span>
                    <span className={`material-symbols-outlined text-slate-300 dark:text-gray-700 transition-all ${showVocabTable ? 'rotate-180 text-primary' : 'group-hover:text-primary'}`}>expand_more</span>
                  </button>
                  {showVocabTable && (
                    <div className="mt-6 overflow-hidden rounded-[2rem] border-2 border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-top-4 duration-300">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-white/5 border-b-2 border-slate-100 dark:border-white/5">
                            <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">{t('readingLesson.english')}</th>
                            <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">{t('readingLesson.vietnamese')}</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-transparent">
                          {vocabularyList.map((v, i) => (
                            <tr key={i} className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-primary/5 transition-colors group">
                              <td className="py-4 px-6 text-sm font-black text-slate-700 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors">{v.word || '—'}</td>
                              <td className="py-4 px-6 text-sm font-medium text-slate-500 dark:text-gray-400">{v.meaning || v.meaningVi || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Questions Section */}
            <div className="overflow-y-auto no-scrollbar p-10 bg-white dark:bg-card-dark/50">
              <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1 block">{t('readingLesson.progress')}</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {t('readingLesson.questionCount', { current: currentQuestion + 1, total: totalQuestions })}
                  </h3>
                </div>
                  <div className="flex items-center gap-3">
                    {!isMockTest && (
                      <button
                        type="button"
                        onClick={() => setShowHint((v) => !v)}
                        className={`size-12 inline-flex items-center justify-center rounded-2xl border-2 transition-all active:scale-95 ${showHint ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/30' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-300 dark:text-gray-600 hover:border-amber-500/30 hover:text-amber-500'}`}
                      >
                        <span className="material-symbols-outlined text-2xl">lightbulb</span>
                      </button>
                    )}
                    {!isMockTest && (
                      <div className={`h-12 inline-flex items-center gap-3 px-5 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest ${(countdownSeconds ?? 1) <= 0 ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/30' : 'bg-white dark:bg-white/5 text-rose-500 border-rose-500/20'}`}>
                        <span className="material-symbols-outlined text-xl">timer</span>
                        <span>{countdownSeconds != null ? formatTime(Math.max(0, countdownSeconds)) : '--:--'}</span>
                      </div>
                    )}
                    {!isMockTest && (
                      <button
                        type="button"
                        onClick={handleComplete}
                        disabled={completingLesson}
                        className="h-12 px-6 inline-flex items-center justify-center rounded-2xl text-[10px] font-black uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110 disabled:opacity-50 transition-all active:scale-95"
                      >
                        {completingLesson ? '...' : t('readingLesson.submit')}
                      </button>
                    )}
                  </div>
              </div>

              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <p className="text-lg font-black text-slate-900 dark:text-white mb-10 leading-snug">{question?.question || t('readingLesson.chooseAnswer')}</p>
                <div className="space-y-4">
                  {questionOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`group flex items-center p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all active:scale-[0.98] ${
                        selectedAnswer === opt.value
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5 ring-4 ring-primary/10'
                          : 'border-slate-100 dark:border-white/5 hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="answer"
                          value={opt.value}
                          checked={selectedAnswer === opt.value}
                          onChange={(e) => setSelectedAnswer(e.target.value)}
                          className="peer appearance-none size-6 rounded-full border-2 border-slate-200 dark:border-white/10 checked:border-primary transition-all"
                        />
                        <div className="absolute size-3 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className={`ml-6 text-sm font-bold transition-colors ${selectedAnswer === opt.value ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                        {opt.text}
                      </span>
                    </label>
                  ))}
                </div>
                {showHint && question?.explanation && (
                  <div className="mt-8 p-6 rounded-[1.5rem] bg-amber-500/5 border-2 border-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-400 italic animate-in zoom-in-95 duration-300">
                    <span className="material-symbols-outlined text-base align-bottom mr-2">info</span>
                    {question.explanation}
                  </div>
                )}
                
                {/* Embedded Navigation */}
                <div className="mt-12 pt-10 border-t-2 border-slate-100 dark:border-white/5 flex flex-wrap justify-between items-center gap-6">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-3 disabled:opacity-30 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    {t('readingLesson.previous')}
                  </button>

                  <div className="flex gap-4 items-center">
                    {currentQuestion < totalQuestions - 1 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-primary text-white hover:brightness-110 shadow-xl shadow-primary/20 transition-all flex items-center gap-3 active:scale-95"
                      >
                        {t('readingLesson.next')} <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </button>
                    ) : !isMockTest && (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-primary text-white hover:brightness-110 shadow-xl shadow-primary/20 transition-all active:scale-95"
                      >
                        {t('readingLesson.submit')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="p-6 bg-slate-50 dark:bg-background-dark border-t-2 border-slate-100 dark:border-white/5 flex justify-center items-center gap-6 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="size-10 rounded-xl text-slate-400 dark:text-gray-600 hover:text-primary hover:bg-white dark:hover:bg-white/5 transition-all disabled:opacity-20 flex items-center justify-center border-2 border-transparent"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              <div className="flex items-center gap-2">
                {showPrevPages && (
                  <>
                    <button
                      type="button"
                      onClick={() => handlePageChange(1)}
                      className="size-10 rounded-xl text-[10px] font-black text-slate-400 dark:text-gray-500 hover:bg-white dark:hover:bg-white/5 transition-all border-2 border-transparent"
                    >
                      1
                    </button>
                    {currentPage > 4 && <span className="text-slate-300 dark:text-gray-700 text-xs font-black">•••</span>}
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="size-10 rounded-xl text-[10px] font-black text-slate-400 dark:text-gray-500 hover:bg-white dark:hover:bg-white/5 transition-all border-2 border-transparent"
                    >
                      {currentPage - 1}
                    </button>
                  </>
                )}

                {editingPage ? (
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyDown={handlePageInputKeyDown}
                    onBlur={() => handlePageChange(pageInput)}
                    className="w-14 h-10 rounded-xl text-xs font-black text-center bg-white dark:bg-card-dark border-2 border-primary text-primary focus:outline-none shadow-lg shadow-primary/10"
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={startEditingPage}
                    className="size-12 rounded-2xl text-xs font-black bg-primary text-white shadow-lg shadow-primary/20 scale-110 relative z-10"
                  >
                    {currentPage}
                  </button>
                )}

                {showNextPages && (
                  <>
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="size-10 rounded-xl text-[10px] font-black text-slate-400 dark:text-gray-500 hover:bg-white dark:hover:bg-white/5 transition-all border-2 border-transparent"
                    >
                      {currentPage + 1}
                    </button>
                    {currentPage + 1 < totalPages - 1 && <span className="text-slate-300 dark:text-gray-700 text-xs font-black">•••</span>}
                    {currentPage + 1 < totalPages && (
                      <button
                        type="button"
                        onClick={() => handlePageChange(totalPages)}
                        className="size-10 rounded-xl text-[10px] font-black text-slate-400 dark:text-gray-500 hover:bg-white dark:hover:bg-white/5 transition-all border-2 border-transparent"
                      >
                        {totalPages}
                      </button>
                    )}
                  </>
                )}
              </div>

              <span className="text-slate-300 dark:text-gray-700 text-[10px] font-black uppercase tracking-widest px-2">/ {totalPages}</span>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="size-10 rounded-xl text-slate-400 dark:text-gray-600 hover:text-primary hover:bg-white dark:hover:bg-white/5 transition-all disabled:opacity-20 flex items-center justify-center border-2 border-transparent"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

        {rightBarOpen ? (
          <aside className="w-full lg:w-[360px] lg:shrink-0 space-y-10 lg:overflow-visible relative pb-10">
            <div className="sticky top-0 z-10 flex justify-end mb-4">
              <button
                type="button"
                onClick={() => setRightBarOpen(false)}
                className="size-12 rounded-2xl bg-white dark:bg-card-dark border-2 border-slate-100 dark:border-white/10 text-slate-400 dark:text-gray-500 hover:text-primary hover:border-primary transition-all shadow-xl active:scale-95"
                title={t('readingLesson.closeRightBar')}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            {isMockTest ? (
              <MockTestSidebar currentAnswers={answers} currentLessonId={id} />
            ) : (
              <div className="space-y-10">
                {/* Question Navigation Card */}
                {questions.length > 0 && (
                  <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="size-2 rounded-full bg-primary" />
                        {t('readingLesson.questionNav') || 'Navigation'}
                      </h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                        {currentQuestion + 1} / {totalQuestions}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      {questions.map((q, idx) => {
                        const isAnswered = answers[idx] != null && String(answers[idx]).trim() !== '';
                        const isCurrent = currentQuestion === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handlePageChange(idx + 1)}
                            className={`h-11 rounded-xl text-[10px] font-black transition-all flex items-center justify-center border-2 uppercase tracking-widest active:scale-90 ${
                              isCurrent
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-105'
                                : isAnswered
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20'
                                : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-gray-500 border-slate-100 dark:border-white/5 hover:border-primary/30'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Vocabulary Card */}
                {vocabularyList.length > 0 && (
                  <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                    <div className="p-6 bg-slate-50 dark:bg-background-dark/30 border-b-2 border-slate-100 dark:border-white/5 flex justify-between items-center">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">{t('readingLesson.vocabFromReading')}</h3>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        {Math.min(vocabIndex + 1, vocabularyList.length)} / {vocabularyList.length}
                      </span>
                    </div>
                    <div className="p-8">
                      <div className="flex items-center justify-between gap-4 mb-8">
                        <button
                          type="button"
                          onClick={() => setVocabIndex((i) => Math.max(0, i - 1))}
                          disabled={vocabIndex === 0}
                          className="size-11 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-primary hover:bg-primary/10 disabled:opacity-20 transition-all flex items-center justify-center"
                          title={t('readingLesson.prevWord')}
                        >
                          <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <div className="flex-1 text-center min-w-0">
                          <h4 className="text-2xl font-black text-primary truncate uppercase tracking-tight" title={vocabularyList[vocabIndex]?.word}>
                            {vocabularyList[vocabIndex]?.word || '—'}
                          </h4>
                          <span className="text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-[0.2em] mt-1 block">{vocabularyList[vocabIndex]?.phonetic || ''}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setVocabIndex((i) => Math.min(vocabularyList.length - 1, i + 1))}
                          disabled={vocabIndex >= vocabularyList.length - 1}
                          className="size-11 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-primary hover:bg-primary/10 disabled:opacity-20 transition-all flex items-center justify-center"
                          title={t('readingLesson.nextWord')}
                        >
                          <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                      </div>
                      <div className="space-y-6 bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                        <div>
                          <span className="block text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2">{t('readingLesson.meaning')}</span>
                          <p className="text-sm font-bold text-slate-700 dark:text-white leading-relaxed">{vocabularyList[vocabIndex]?.meaning || vocabularyList[vocabIndex]?.meaningVi || '—'}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-8">
                        <button type="button" className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 transition-all active:scale-95">
                          {t('readingLesson.known')}
                        </button>
                        <button type="button" className="flex-1 py-4 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-primary/20 transition-all active:scale-95">
                          {t('readingLesson.saveFlashcard')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>
        ) : (
          <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-20">
            <button
              type="button"
              onClick={() => setRightBarOpen(true)}
              className="size-12 rounded-l-2xl bg-white dark:bg-card-dark border-2 border-slate-100 dark:border-white/10 border-r-0 text-slate-400 dark:text-gray-500 hover:text-primary hover:border-primary transition-all shadow-xl active:scale-95"
              title={t('readingLesson.openRightBar')}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          </div>
        )}

      </main>
      <AlertModal
        open={showIncompleteModal}
        title=""
        message={t('readingLesson.pleaseAnswerAll')}
        confirmText="OK"
        onClose={closeIncompleteModal}
      />

      <AlertModal
        open={showConfirmModal}
        title={t('readingLesson.submit')}
        message={t('writingLesson.confirmSubmit')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmComplete}
      />

      <AlertModal
        open={showExitConfirm}
        title={t('common.confirmExit') || 'Confirm Exit'}
        message={t('common.confirmExitMessage') || 'Are you sure you want to leave? Your progress may not be saved.'}
        confirmText={t('common.confirm') || 'Yes, leave'}
        cancelText={t('common.cancel') || 'Cancel'}
        onClose={handleCancelExit}
        onConfirm={handleConfirmExit}
        type="warning"
      />
    </>
  )
}
