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
      <main className="max-w-[1600px] mx-auto px-6 pt-4 pb-10 flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-64px)]">
      {/* Left Sidebar - Hidden in Mock Test */}
      {!isMockTest && (
      <aside className="w-full lg:w-[300px] lg:min-w-[240px] lg:shrink lg:basis-[300px] space-y-6 overflow-y-auto pr-2 pb-6 custom-scrollbar">
        {/* Lesson Info Card */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-border-dark shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">
              {t('readingLesson.level')} {mockReadingContent.level}
            </span>
            <div className="flex items-center text-yellow-500">
              <span className="material-symbols-outlined text-sm mr-1">star</span>
              <span className="text-xs font-bold">{mockReadingContent.xpReward} XP</span>
            </div>
          </div>
          <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white leading-tight">{mockReadingContent.title}</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-lg text-primary">topic</span>
              <span>{mockReadingContent.topic}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-lg text-primary">schedule</span>
              <span>{mockReadingContent.time}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-lg text-primary">quiz</span>
              <span>{t('readingLesson.questionCountShort', { count: totalQuestions })}</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-border-dark">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-slate-500 dark:text-gray-400">{t('readingLesson.progress')}</span>
              <span className="text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-50 dark:bg-background-dark rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full shadow-[0_0_10px_rgba(19,182,236,0.4)] transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Notes Card */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-slate-200 dark:border-border-dark shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">note_alt</span>
            <h3 className="font-bold text-sm">{t('readingLesson.notebook')}</h3>
          </div>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl p-3 text-sm focus:ring-primary focus:border-primary placeholder:text-gray-500 text-slate-900 dark:text-white mb-3"
            placeholder={t('readingLesson.noteTitlePlaceholder')}
          />
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl p-3 text-sm focus:ring-primary focus:border-primary placeholder:text-gray-500 text-slate-900 dark:text-white"
            placeholder={t('readingLesson.notePlaceholder')}
            rows={3}
          />
          {noteSavedMessage && <p className="text-xs text-emerald-400 mb-2">{noteSavedMessage}</p>}
          <button
            type="button"
            onClick={handleSaveNote}
            disabled={noteSaving}
            className="w-full py-2 bg-slate-50 dark:bg-background-dark hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-border-dark disabled:opacity-60"
          >
            {noteSaving ? '...' : t('readingLesson.saveNote')}
          </button>
        </div>

        {/* Study Tip Card */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">lightbulb</span>
            <h3 className="font-bold text-primary text-sm">{t('readingLesson.tipTitle')}</h3>
          </div>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-gray-400 italic">
            &quot;{t('readingLesson.tipText')}&quot;
          </p>
        </div>
      </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col gap-10 overflow-hidden">
        <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark overflow-hidden flex flex-col flex-1 shadow-2xl shadow-slate-200/50 dark:shadow-none">
          {/* Toolbar */}
          <div className="py-4 px-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-background-dark/30">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPassageLang((prev) => (prev === 'en' ? 'vi' : 'en'))}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 active:scale-95 ${
                  passageLang === 'vi'
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'bg-white dark:bg-white/5 text-primary border-primary/20 hover:bg-primary/5'
                }`}
              >
                <span className="material-symbols-outlined text-base">translate</span>
                {passageLang === 'en' ? t('readingLesson.translatePassageVi') : t('readingLesson.passageOriginalEn')}
              </button>
              <button
                type="button"
                onClick={() => setHighlightOn((prev) => !prev)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 active:scale-95 ${
                  highlightOn
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                    : 'bg-white dark:bg-white/5 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/5'
                }`}
              >
                <span className="material-symbols-outlined text-base">ink_highlighter</span>
                {highlightOn ? t('readingLesson.highlightOn') : t('readingLesson.highlight')}
              </button>
            </div>
          </div>
 
          {/* Split View */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden divide-x-2 divide-slate-100 dark:divide-white/5">
            {/* Reading Text */}
            <div className="overflow-y-auto custom-scrollbar p-8 bg-slate-50/50 dark:bg-background-dark/20">
              {mockReadingContent.thumbnail && (
                <div className="relative mb-10 group">
                  <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity" />
                  <img
                    alt={mockReadingContent.title}
                    className="w-full h-48 object-cover rounded-[2rem] relative z-10 shadow-2xl transition-transform group-hover:scale-[1.02]"
                    src={mockReadingContent.thumbnail}
                  />
                </div>
              )}
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {(passageLang === 'vi' && mockReadingContent.translationVi
                  ? mockReadingContent.translationVi
                  : mockReadingContent.text || ''
                )
                  .split(/\n\n+/)
                  .map((paragraph, pIdx) => (
                    <p key={pIdx} className="text-slate-800 dark:text-slate-200 leading-relaxed mb-6 text-base selection:bg-primary/30 font-medium">
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
                                    ? 'bg-primary/20 dark:bg-primary/30 border-b-2 border-primary px-1 cursor-pointer text-slate-900 dark:text-white font-black hover:bg-primary/40 transition-all rounded-sm'
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
                <p className="text-[10px] font-black text-slate-400 dark:text-gray-600 italic mt-8 uppercase tracking-widest">{t('readingLesson.noTranslation')}</p>
              )}
              
              {/* Bảng từ vựng */}
              {vocabularyList.length > 0 && (
                <div className="mt-12 border-t border-slate-200 dark:border-border-dark pt-6">
                  <button
                    type="button"
                    onClick={() => setShowVocabTable((v) => !v)}
                    className="flex items-center justify-between w-full py-3 text-left group"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 group-hover:text-primary transition-colors">{t('readingLesson.vocabTableTitle')}</span>
                    <span className={`material-symbols-outlined text-slate-400 dark:text-gray-500 transition-all ${showVocabTable ? 'rotate-180 text-primary' : 'group-hover:text-primary'}`}>expand_more</span>
                  </button>
                  {showVocabTable && (
                    <div className="mt-4 overflow-hidden border border-slate-200 dark:border-border-dark rounded-2xl shadow-inner bg-white dark:bg-card-dark/40 animate-in fade-in slide-in-from-top-4 duration-300">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-slate-50 dark:bg-background-dark/80 border-b border-slate-200 dark:border-border-dark">
                          <tr>
                            <th className="text-left py-3 px-4 text-[10px] font-black text-primary uppercase tracking-wider">{t('readingLesson.english')}</th>
                            <th className="text-left py-3 px-4 text-[10px] font-black text-primary uppercase tracking-wider">{t('readingLesson.vietnamese')}</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-900 dark:text-white">
                          {vocabularyList.map((v, i) => (
                            <tr key={i} className="border-b border-border-dark/50 hover:bg-slate-50/50 dark:hover:bg-background-dark/30">
                              <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">{v.word || '—'}</td>
                              <td className="py-3 px-4 text-slate-500 dark:text-gray-400 font-medium">{v.meaning || v.meaningVi || '—'}</td>
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
            <div className="overflow-y-auto custom-scrollbar p-8 bg-white dark:bg-card-dark/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('readingLesson.progress')}</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {t('readingLesson.questionCount', { current: currentQuestion + 1, total: totalQuestions })}
                    </span>
                  </div>
                    <div className="flex items-center gap-3">
                      {completeMessage && (
                        <span className="text-xs text-emerald-400 font-black">{completeMessage}</span>
                      )}
                      {!isMockTest && (
                        <button
                          type="button"
                          onClick={() => setShowHint((v) => !v)}
                          title={t('readingLesson.hint')}
                          className={`h-10 w-10 inline-flex items-center justify-center rounded-xl border transition-all ${showHint ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-lg shadow-amber-500/10' : 'border-slate-200 dark:border-border-dark text-slate-400 dark:text-gray-500 hover:text-amber-400 hover:border-amber-500/30'}`}
                        >
                          <span className="material-symbols-outlined text-lg">lightbulb</span>
                        </button>
                      )}
                      {!isMockTest && (
                        <div className={`h-10 inline-flex items-center gap-2 px-4 rounded-xl border font-mono font-black text-sm ${(countdownSeconds ?? 1) <= 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          <span className="material-symbols-outlined text-base">timer</span>
                          <span>{countdownSeconds != null ? formatTime(Math.max(0, countdownSeconds)) : '--:--'}</span>
                          {(countdownSeconds ?? 1) <= 0 && <span className="text-[10px] ml-1">{t('readingLesson.timeUp')}</span>}
                        </div>
                      )}
                      {!isMockTest && (
                        <button
                          type="button"
                          onClick={handleComplete}
                          disabled={completingLesson}
                          className="h-10 px-6 inline-flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary/20 text-primary border-2 border-primary/30 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                          {completingLesson ? '...' : t('readingLesson.submit')}
                        </button>
                      )}
                    </div>
                </div>
 
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <p className="text-2xl font-black text-slate-900 dark:text-white mb-8 leading-tight uppercase tracking-tight">
                    {question?.question || t('readingLesson.chooseAnswer')}
                  </p>
                  <div className="space-y-4">
                    {questionOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className={`group flex items-center p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all ${
                          selectedAnswer === opt.value
                            ? 'border-emerald-500 bg-emerald-500/5 shadow-inner'
                            : 'border-slate-200 dark:border-border-dark hover:bg-slate-50 dark:hover:bg-background-dark/40 hover:border-primary transition-colors'
                        }`}
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={opt.value}
                          checked={selectedAnswer === opt.value}
                          onChange={(e) => setSelectedAnswer(e.target.value)}
                          className="w-4 h-4 text-emerald-500 bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark focus:ring-emerald-500"
                        />
                        <span
                          className={`ml-4 text-base transition-colors ${
                            selectedAnswer === opt.value ? 'text-slate-900 dark:text-white font-black' : 'text-slate-500 dark:text-gray-400 font-bold group-hover:text-slate-800 dark:group-hover:text-white'
                          }`}
                        >
                          {opt.text}
                        </span>
                      </label>
                    ))}
                  </div>
                  {showHint && question?.explanation && (
                    <div className="mt-6 p-6 rounded-[1.5rem] bg-amber-500/10 border-2 border-amber-500/20 text-sm text-amber-600 dark:text-amber-400 font-bold italic leading-relaxed shadow-inner">
                      {question.explanation}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Embedded Navigation */}
              <div className="mt-12 pt-6 border-t border-slate-200 dark:border-border-dark flex flex-wrap justify-between items-center gap-4 min-w-0">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 border-slate-200 dark:border-border-dark text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-card-dark hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span> {t('readingLesson.previous')}
                </button>
 
                <div className="flex gap-2 shrink-0 items-center flex-wrap">
                  {currentQuestion < totalQuestions - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider bg-primary text-white border-2 border-transparent hover:brightness-110 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 whitespace-nowrap active:scale-95"
                    >
                      {t('readingLesson.next')} <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                  ) : !isMockTest && (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white border-2 border-transparent hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all whitespace-nowrap active:scale-95"
                    >
                      {t('readingLesson.submit')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 bg-slate-50 dark:bg-background-dark border-t border-slate-200 dark:border-border-dark flex flex-wrap justify-center items-center gap-3 min-w-0">
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
      <aside className="w-full lg:w-[320px] lg:min-w-[280px] lg:shrink lg:basis-[320px] space-y-6 lg:overflow-visible pr-2 pb-6 relative">
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
          <div className="space-y-6">
            {/* Question Navigation Card */}
            {questions.length > 0 && (
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark shadow-xl overflow-hidden p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-gray-400">{t('readingLesson.questionNav') || 'Navigation'}</h3>
                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                    {currentQuestion + 1} / {totalQuestions}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isAnswered = answers[idx] != null && String(answers[idx]).trim() !== '';
                    const isCurrent = currentQuestion === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePageChange(idx + 1)}
                        className={`h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center border ${
                          isCurrent
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                            : isAnswered
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-slate-50 dark:bg-background-dark text-slate-500 dark:text-gray-400 border-slate-200 dark:border-border-dark hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-gray-500'
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
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark shadow-xl overflow-hidden group">
                <div className="p-4 bg-slate-50 dark:bg-background-dark border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-gray-400">{t('readingLesson.vocabFromReading')}</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    {Math.min(vocabIndex + 1, vocabularyList.length)} / {vocabularyList.length}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setVocabIndex((i) => Math.max(0, i - 1))}
                      disabled={vocabIndex === 0}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      title={t('readingLesson.prevWord')}
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <div className="flex-1 text-center min-w-0">
                      <h4 className="text-lg font-black text-primary truncate" title={vocabularyList[vocabIndex]?.word}>
                        {vocabularyList[vocabIndex]?.word || '—'}
                      </h4>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-gray-400">{vocabularyList[vocabIndex]?.phonetic || ''}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVocabIndex((i) => Math.min(vocabularyList.length - 1, i + 1))}
                      disabled={vocabIndex >= vocabularyList.length - 1}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      title={t('readingLesson.nextWord')}
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase mb-1">{t('readingLesson.meaning')}</span>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{vocabularyList[vocabIndex]?.meaning || vocabularyList[vocabIndex]?.meaningVi || '—'}</p>
                    </div>
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
