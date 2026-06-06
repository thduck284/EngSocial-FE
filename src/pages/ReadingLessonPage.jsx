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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 dark:text-gray-400">
        <span className="material-symbols-outlined text-5xl mb-4">error</span>
        <p>{t('readingLesson.loadError')}</p>
        <Link to={backLink} className="mt-4 text-primary hover:underline">{t('readingLesson.back')}</Link>
      </div>
    )
  }

  return (
    <>
      <main className="max-w-[1440px] mx-auto px-6 py-6 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-64px)]">
      {/* Left Sidebar - Hidden in Mock Test */}
      {!isMockTest && (
      <aside className="w-full lg:w-[280px] lg:min-w-[240px] lg:shrink lg:basis-[280px] space-y-5 overflow-y-auto pr-2 pb-4 custom-scrollbar">
        {/* Lesson Info Card */}
        <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-slate-200 dark:border-border-dark shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded">
              {t('readingLesson.level')} {mockReadingContent.level}
            </span>
            <div className="flex items-center text-yellow-600 dark:text-yellow-500">
              <span className="material-symbols-outlined text-sm mr-0.5">star</span>
              <span className="text-[10px] font-bold">{mockReadingContent.xpReward} XP</span>
            </div>
          </div>
          <h2 className="text-sm font-bold mb-3 text-slate-900 dark:text-white leading-tight">{mockReadingContent.title}</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-base text-primary">topic</span>
              <span>{mockReadingContent.topic}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-base text-primary">schedule</span>
              <span>{mockReadingContent.time}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-base text-primary">quiz</span>
              <span>{t('readingLesson.questionCountShort', { count: totalQuestions })}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-border-dark">
            <div className="flex justify-between text-[10px] font-bold mb-1.5">
              <span className="text-slate-500 dark:text-gray-400">{t('readingLesson.progress')}</span>
              <span className="text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-50 dark:bg-background-dark rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Notes Card */}
        <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-slate-200 dark:border-border-dark shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-lg">note_alt</span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t('readingLesson.notebook')}</h3>
          </div>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none placeholder:text-slate-400 text-slate-900 dark:text-white mb-2"
            placeholder={t('readingLesson.noteTitlePlaceholder')}
          />
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
            placeholder={t('readingLesson.notePlaceholder')}
            rows={3}
          />
          {noteSavedMessage && <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-2">{noteSavedMessage}</p>}
          <button
            type="button"
            onClick={handleSaveNote}
            disabled={noteSaving}
            className="mt-3 w-full py-2 bg-slate-50 dark:bg-background-dark hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-700 dark:text-white rounded-lg text-xs font-bold transition-all border border-slate-200 dark:border-border-dark disabled:opacity-60"
          >
            {noteSaving ? '...' : t('readingLesson.saveNote')}
          </button>
        </div>

        {/* Study Tip Card */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-lg">lightbulb</span>
            <h3 className="font-bold text-primary text-xs">{t('readingLesson.tipTitle')}</h3>
          </div>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-gray-400 italic">
            &quot;{t('readingLesson.tipText')}&quot;
          </p>
        </div>
      </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col gap-6 overflow-hidden">
        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden flex flex-col flex-1 shadow-sm">
          {/* Toolbar */}
          <div className="py-2.5 px-4 border-b border-slate-200 dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-background-dark/30">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPassageLang((prev) => (prev === 'en' ? 'vi' : 'en'))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border active:scale-95 ${
                  passageLang === 'vi'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white dark:bg-card-dark text-primary border-slate-200 dark:border-border-dark hover:bg-primary/5'
                }`}
              >
                <span className="material-symbols-outlined text-sm">translate</span>
                {passageLang === 'en' ? t('readingLesson.translatePassageVi') : t('readingLesson.passageOriginalEn')}
              </button>
              <button
                type="button"
                onClick={() => setHighlightOn((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border active:scale-95 ${
                  highlightOn
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white dark:bg-card-dark text-emerald-600 dark:text-emerald-400 border-slate-200 dark:border-border-dark hover:bg-emerald-500/5'
                }`}
              >
                <span className="material-symbols-outlined text-sm">ink_highlighter</span>
                {highlightOn ? t('readingLesson.highlightOn') : t('readingLesson.highlight')}
              </button>
            </div>
          </div>

          {/* Split View */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden divide-x divide-slate-200 dark:divide-border-dark">
            {/* Reading Text */}
            <div className="overflow-y-auto custom-scrollbar p-5 bg-slate-50/50 dark:bg-background-dark/20">
              {mockReadingContent.thumbnail && (
                <div className="relative mb-6 group">
                  <img
                    alt={mockReadingContent.title}
                    className="w-full h-32 object-cover rounded-lg shadow-sm transition-transform group-hover:scale-[1.01]"
                    src={mockReadingContent.thumbnail}
                  />
                </div>
              )}
              <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                {(passageLang === 'vi' && mockReadingContent.translationVi
                  ? mockReadingContent.translationVi
                  : mockReadingContent.text || ''
                )
                  .split(/\n\n+/)
                  .map((paragraph, pIdx) => (
                    <p key={pIdx} className="text-slate-800 dark:text-slate-200 leading-relaxed mb-4 text-sm selection:bg-primary/30">
                      {paragraph.split(/\n/).map((line, lIdx) => (
                        <span key={lIdx} className={lIdx > 0 ? 'block mt-1' : ''}>
                          {line.split(/\s+/).filter(Boolean).map((word, wordIdx) => {
                            const wordClean = word.replace(/[.,!?;:]/g, '')
                            const isHighlighted = highlightOn && vocabularyList.some(
                              (v) => v.word && wordClean.toLowerCase() === v.word.toLowerCase()
                            )
                            return (
                              <span
                                key={wordIdx}
                                className={
                                  isHighlighted
                                    ? 'bg-primary/20 dark:bg-primary/30 border-b border-primary px-0.5 cursor-pointer text-slate-900 dark:text-white font-bold hover:bg-primary/40 transition-all rounded-sm'
                                    : 'cursor-pointer hover:bg-primary/10 transition-colors'
                                }
                                onClick={() => handleWordClick(wordClean)}
                              >
                                {word}{' '}
                              </span>
                            )
                          })}
                        </span>
                      ))}
                    </p>
                  ))}
              </div>
              {passageLang === 'vi' && !mockReadingContent.translationVi && (mockReadingContent.text || '').trim() && (
                <p className="text-[10px] text-slate-400 dark:text-gray-500 italic mt-4">{t('readingLesson.noTranslation')}</p>
              )}
              
              {/* Bảng từ vựng */}
              {vocabularyList.length > 0 && (
                <div className="mt-8 border-t border-slate-200 dark:border-border-dark pt-4">
                  <button
                    type="button"
                    onClick={() => setShowVocabTable((v) => !v)}
                    className="flex items-center justify-between w-full py-2 text-left group"
                  >
                    <span className="text-xs font-bold text-slate-500 dark:text-gray-400 group-hover:text-primary transition-colors">{t('readingLesson.vocabTableTitle')}</span>
                    <span className={`material-symbols-outlined text-slate-400 dark:text-gray-500 text-lg transition-all ${showVocabTable ? 'rotate-180 text-primary' : 'group-hover:text-primary'}`}>expand_more</span>
                  </button>
                  {showVocabTable && (
                    <div className="mt-3 overflow-hidden border border-slate-200 dark:border-border-dark rounded-lg bg-white dark:bg-card-dark animate-in fade-in slide-in-from-top-4 duration-300">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-slate-50 dark:bg-background-dark border-b border-slate-200 dark:border-border-dark">
                          <tr>
                            <th className="text-left py-2 px-3 text-[10px] font-bold text-primary uppercase">{t('readingLesson.english')}</th>
                            <th className="text-left py-2 px-3 text-[10px] font-bold text-primary uppercase">{t('readingLesson.vietnamese')}</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-900 dark:text-white">
                          {vocabularyList.map((v, i) => (
                            <tr key={i} className="border-b border-slate-100 dark:border-border-dark hover:bg-slate-50/50 dark:hover:bg-background-dark/30">
                              <td className="py-2 px-3 font-semibold text-slate-800 dark:text-white">{v.word || '—'}</td>
                              <td className="py-2 px-3 text-slate-500 dark:text-gray-400">{v.meaning || v.meaningVi || '—'}</td>
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
            <div className="overflow-y-auto custom-scrollbar p-5 bg-white dark:bg-card-dark">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 uppercase">{t('readingLesson.progress')}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('readingLesson.questionCount', { current: currentQuestion + 1, total: totalQuestions })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {completeMessage && (
                    <span className="text-xs text-emerald-500 dark:text-emerald-400 font-bold">{completeMessage}</span>
                  )}
                  {!isMockTest && (
                    <button
                      type="button"
                      onClick={() => setShowHint((v) => !v)}
                      title={t('readingLesson.hint')}
                      className={`h-8 w-8 inline-flex items-center justify-center rounded-lg border transition-all ${showHint ? 'bg-amber-500/15 text-amber-500 border-amber-500/30' : 'border-slate-200 dark:border-border-dark text-slate-400 dark:text-gray-500 hover:text-amber-500 hover:border-amber-500/30'}`}
                    >
                      <span className="material-symbols-outlined text-base">lightbulb</span>
                    </button>
                  )}
                  {!isMockTest && (
                    <div className={`h-8 inline-flex items-center gap-1.5 px-2.5 rounded-lg border font-mono font-bold text-xs ${(countdownSeconds ?? 1) <= 0 ? 'bg-red-500/15 text-red-500 border-red-500/30' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      <span className="material-symbols-outlined text-sm">timer</span>
                      <span>{countdownSeconds != null ? formatTime(Math.max(0, countdownSeconds)) : '--:--'}</span>
                      {(countdownSeconds ?? 1) <= 0 && <span className="text-[10px] ml-0.5">{t('readingLesson.timeUp')}</span>}
                    </div>
                  )}
                  {!isMockTest && (
                    <button
                      type="button"
                      onClick={handleComplete}
                      disabled={completingLesson}
                      className="h-8 px-3 inline-flex items-center justify-center rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    >
                      {completingLesson ? '...' : t('readingLesson.submit')}
                    </button>
                  )}
                </div>
              </div>

              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-4 leading-snug">
                  {question?.question || t('readingLesson.chooseAnswer')}
                </p>
                <div className="space-y-2.5">
                  {questionOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`group flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedAnswer === opt.value
                          ? 'border-emerald-500 bg-emerald-500/5'
                          : 'border-slate-200 dark:border-border-dark hover:bg-slate-50 dark:hover:bg-background-dark/40 hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={opt.value}
                        checked={selectedAnswer === opt.value}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        className="w-3.5 h-3.5 text-emerald-500 bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark focus:ring-emerald-500"
                      />
                      <span
                        className={`ml-3 text-sm transition-colors ${
                          selectedAnswer === opt.value ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-gray-400 group-hover:text-slate-800 dark:group-hover:text-white'
                        }`}
                      >
                        {opt.text}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap justify-between items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="px-3 py-2 rounded-lg text-xs font-bold border border-slate-200 dark:border-border-dark text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-card-dark hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    {t('readingLesson.previous')}
                  </button>
                  <div className="flex gap-2 shrink-0 items-center flex-wrap">
                    {currentQuestion < totalQuestions - 1 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-3 py-2 rounded-lg text-xs font-bold bg-primary text-white border border-transparent hover:brightness-110 transition-all flex items-center gap-1.5 whitespace-nowrap"
                      >
                        {t('readingLesson.next')}
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    ) : !isMockTest && (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-3 py-2 rounded-lg text-xs font-bold bg-emerald-500 text-white border border-transparent hover:brightness-110 transition-all whitespace-nowrap"
                      >
                        {t('readingLesson.submit')}
                      </button>
                    )}
                  </div>
                </div>

                {showHint && question?.explanation && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 italic leading-relaxed">
                    {question.explanation}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="p-3 bg-slate-50 dark:bg-background-dark border-t border-slate-200 dark:border-border-dark flex flex-wrap justify-center items-center gap-2 min-w-0">
            {/* Pagination */}
            <div className="flex items-center gap-1.5 justify-center min-w-0 max-w-full overflow-x-auto">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-2 rounded-lg text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-card-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>

              {/* Previous pages */}
              {showPrevPages && (
                <>
                  <button
                    type="button"
                    onClick={() => handlePageChange(1)}
                    className="px-2.5 py-2 rounded-lg text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-card-dark transition-all shrink-0"
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="text-slate-400 dark:text-gray-500 text-xs shrink-0">...</span>}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-2.5 py-2 rounded-lg text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-card-dark transition-all shrink-0"
                  >
                    {currentPage - 1}
                  </button>
                </>
              )}

              {/* Current page - editable */}
              {editingPage ? (
                <input
                  type="number"
                  min="1"
                  max={totalQuestions}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyDown={handlePageInputKeyDown}
                  onBlur={() => handlePageChange(pageInput)}
                  className="w-12 px-1 py-2 rounded-lg text-xs font-bold text-center bg-white dark:bg-card-dark border border-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary shrink-0"
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  onClick={startEditingPage}
                  className="px-3 py-2 rounded-lg text-xs font-black bg-primary text-white hover:brightness-110 transition-all min-w-[2.5rem] shrink-0"
                >
                  {currentPage}
                </button>
              )}

              {/* Next pages */}
              {showNextPages && (
                <>
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-2.5 py-2 rounded-lg text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-card-dark transition-all shrink-0"
                  >
                    {currentPage + 1}
                  </button>
                  {currentPage + 1 < totalPages - 1 && <span className="text-slate-400 dark:text-gray-500 text-xs shrink-0">...</span>}
                  {currentPage + 1 < totalPages && (
                    <button
                      type="button"
                      onClick={() => handlePageChange(totalPages)}
                      className="px-2.5 py-2 rounded-lg text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-card-dark transition-all shrink-0"
                    >
                      {totalPages}
                    </button>
                  )}
                </>
              )}

              <span className="text-slate-400 dark:text-gray-500 text-xs mx-1 shrink-0">/ {totalPages}</span>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-2 rounded-lg text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-card-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {rightBarOpen ? (
      <aside className="w-full lg:w-[280px] lg:min-w-[240px] lg:shrink lg:basis-[280px] space-y-5 lg:overflow-visible pr-2 pb-4 relative">
        <div className="sticky top-0 z-10 flex justify-end mb-2">
          <button
            type="button"
            onClick={() => setRightBarOpen(false)}
            className="p-2 rounded-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-gray-700 transition-all"
            title={t('readingLesson.closeRightBar')}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        {isMockTest ? (
          <MockTestSidebar currentAnswers={answers} currentLessonId={id} />
        ) : (
          <div className="space-y-5">
            {/* Question Navigation Card */}
            {questions.length > 0 && (
              <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-xs text-slate-500 dark:text-gray-400">{t('readingLesson.questionNav') || 'Navigation'}</h3>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                    {currentQuestion + 1} / {totalQuestions}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {questions.map((q, idx) => {
                    const isAnswered = answers[idx] != null && String(answers[idx]).trim() !== '';
                    const isCurrent = currentQuestion === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePageChange(idx + 1)}
                        className={`h-8 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center border ${
                          isCurrent
                            ? 'bg-primary text-white border-primary'
                            : isAnswered
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-slate-50 dark:bg-background-dark text-slate-500 dark:text-gray-400 border-slate-200 dark:border-border-dark hover:text-slate-900 dark:hover:text-white'
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
              <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden">
                <div className="p-3 bg-slate-50 dark:bg-background-dark border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                  <h3 className="font-bold text-xs text-slate-500 dark:text-gray-400">{t('readingLesson.vocabFromReading')}</h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    {Math.min(vocabIndex + 1, vocabularyList.length)} / {vocabularyList.length}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setVocabIndex((i) => Math.max(0, i - 1))}
                      disabled={vocabIndex === 0}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      title={t('readingLesson.prevWord')}
                    >
                      <span className="material-symbols-outlined text-lg">chevron_left</span>
                    </button>
                    <div className="flex-1 text-center min-w-0">
                      <h4 className="text-sm font-bold text-primary truncate" title={vocabularyList[vocabIndex]?.word}>
                        {vocabularyList[vocabIndex]?.word || '—'}
                      </h4>
                      <span className="text-[10px] text-slate-500 dark:text-gray-400">{vocabularyList[vocabIndex]?.phonetic || ''}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVocabIndex((i) => Math.min(vocabularyList.length - 1, i + 1))}
                      disabled={vocabIndex >= vocabularyList.length - 1}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      title={t('readingLesson.nextWord')}
                    >
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-500 dark:text-gray-400 uppercase mb-1">{t('readingLesson.meaning')}</span>
                    <p className="text-xs text-slate-900 dark:text-white">{vocabularyList[vocabIndex]?.meaning || vocabularyList[vocabIndex]?.meaningVi || '—'}</p>
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
            className="p-2.5 rounded-l-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark border-r-0 text-slate-500 dark:text-gray-400 hover:text-primary hover:bg-slate-200 dark:hover:bg-gray-700 transition-all shadow-lg"
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
