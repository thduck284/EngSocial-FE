import { Link, useParams, useLocation, useBlocker } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useListeningLesson } from '../hooks/useListeningLesson'
import { useEffect, useState } from 'react'
import { AlertModal } from '../components/ui/common/AlertModal'
import { MockTestSidebar } from '../components/layout/MockTestSidebar'

export function ListeningLessonPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const location = useLocation()

  const [rightBarOpen, setRightBarOpen] = useState(false)
  const [isMockTest, setIsMockTest] = useState(false)
  
  const {
    audioRef,
    content,
    loading,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    playbackSpeed,
    cycleSpeed,
    showTranscript,
    setShowTranscript,
    vocabularyList,
    lessonChapters,
    vocabCard,
    leaderboard,
    questions,
    totalQuestions,
    currentQ,
    questionOptions,
    progress,
    accentLabel,
    currentQuestion,
    answers,
    selectedAnswer,
    setSelectedAnswer,
    noteTitle,
    setNoteTitle,
    noteContent,
    setNoteContent,
    noteSaving,
    noteSavedMessage,
    handleSaveNote,
    completingLesson,
    completeMessage,
    showConfirmModal,
    setShowConfirmModal,
    showIncompleteModal,
    setShowIncompleteModal,
    handleComplete,
    handleConfirmComplete,
    showHint,
    setShowHint,
    editingPage,
    pageInput,
    setPageInput,
    countdownSeconds,
    vocabIndex,
    setVocabIndex,
    showVocabTable,
    setShowVocabTable,
    handlePlayPause,
    handleSeek,
    handleRewind10,
    handleForward10,
    handlePrevious,
    handleNext,
    handlePageChange,
    handlePageInputKeyDown,
    startEditingPage,
    currentPage,
    totalPages,
    showPrevPages,
    showNextPages,
    formatTime,
  } = useListeningLesson(id, t)

  useEffect(() => {
    const data = localStorage.getItem('engsocial_mock_test')
    if (data) {
      const parsed = JSON.parse(data)
      const isInTest = parsed.lessons.some(l => l.id === id || l.slug === id)
      setIsMockTest(isInTest)
    } else {
      setIsMockTest(false)
    }
  }, [id, content])

  useEffect(() => {
    // Default: keep right panel closed when entering/reloading a lesson.
    setRightBarOpen(isMockTest)
  }, [id, isMockTest])

  const isPractice = location.pathname.startsWith('/practice/')
  const backLink = isPractice ? '/practice/listening' : '/lesson?skill=listening'

  useEffect(() => {
    if (location.state?.questionIdx !== undefined && content) {
      handlePageChange(location.state.questionIdx + 1)
    }
  }, [location.state?.questionIdx, content])

  // Navigation Blocker
  const [showExitConfirm, setShowExitConfirm] = useState(false)
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
        <p>{t('listeningLesson.loadError')}</p>
        <Link to={backLink} className="mt-4 text-primary hover:underline">{t('listeningLesson.back')}</Link>
      </div>
    )
  }

  return (
    <>
      <main className="max-w-[1600px] mx-auto px-6 pt-2 pb-6 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-64px)]">
      {/* Left Sidebar - Hidden in Mock Test */}
      {!isMockTest && (
      <aside className="w-full lg:w-[300px] lg:min-w-[240px] lg:shrink lg:basis-[300px] space-y-6 overflow-y-auto pr-2 pb-6 custom-scrollbar">
        {/* Lesson Info Card */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-border-dark shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">
              {t('listeningLesson.level')} {content?.level || 'A1'}
            </span>
            <div className="flex items-center text-yellow-500">
              <span className="material-symbols-outlined text-sm mr-1">star</span>
              <span className="text-xs font-bold">{content?.xpReward ?? 50} XP</span>
            </div>
          </div>
          <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white leading-tight">{content?.title || ''}</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-lg text-primary">topic</span>
              <span>{content?.topic || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-lg text-primary">schedule</span>
              <span>{content?.time || (content?.estimatedTime ? `${content.estimatedTime}m` : '—')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-lg text-primary">quiz</span>
              <span>{t('listeningLesson.questionCountShort', { count: totalQuestions })}</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-border-dark">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-slate-500 dark:text-gray-400">{t('listeningLesson.progress')}</span>
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
            <h3 className="font-bold text-sm">{t('listeningLesson.notebook')}</h3>
          </div>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl p-3 text-sm focus:ring-primary focus:border-primary placeholder:text-gray-500 text-slate-900 dark:text-white mb-3"
            placeholder={t('listeningLesson.noteTitlePlaceholder')}
          />
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl p-3 text-sm focus:ring-primary focus:border-primary placeholder:text-gray-500 text-slate-900 dark:text-white"
            placeholder={t('listeningLesson.notePlaceholder')}
            rows={3}
          />
          {noteSavedMessage && <p className="text-xs text-emerald-400 mb-2">{noteSavedMessage}</p>}
          <button
            type="button"
            onClick={handleSaveNote}
            disabled={noteSaving}
            className="w-full py-2 bg-slate-50 dark:bg-background-dark hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-border-dark disabled:opacity-60"
          >
            {noteSaving ? '...' : t('listeningLesson.saveNote')}
          </button>
        </div>

        {/* Study Tip Card */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">lightbulb</span>
            <h3 className="font-bold text-primary text-sm">{t('listeningLesson.tipTitle')}</h3>
          </div>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-gray-400 italic">
            &quot;{t('listeningLesson.tipText')}&quot;
          </p>
        </div>
      </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-6 overflow-hidden">
        {/* Audio Player Card */}
        <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-2xl">
          {content?.audioUrl && <audio ref={audioRef} src={content.audioUrl} />}
          <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
            <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark">
              {content?.thumbnail ? (
                <img alt="" className="w-full h-full object-cover" src={content.thumbnail} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-gray-500">
                  <span className="material-symbols-outlined text-5xl">headset</span>
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  {t('listeningLesson.level')} {content?.level || '—'}
                </span>
                {accentLabel && (
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">flag</span> {accentLabel} {t('listeningLesson.accent')}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">{content?.title || t('listeningLesson.fallbackTitle')}</h1>
              <p className="text-xs text-slate-500 dark:text-gray-400 mb-4 flex items-center justify-center md:justify-start gap-2">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {duration > 0 ? `${Math.floor(duration / 60)} ${t('listeningLesson.minutes')} ${duration % 60} ${t('listeningLesson.seconds')}` : (content?.estimatedTime ? `${content.estimatedTime} ${t('listeningLesson.minutes')}` : content?.time || '—')}
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 w-10">{formatTime(currentTime)}</span>
                  <div
                    className="flex-1 h-1.5 bg-slate-50 dark:bg-background-dark rounded-full relative overflow-hidden group cursor-pointer"
                    onClick={handleSeek}
                    onKeyDown={(e) => e.key === 'Enter' && handleSeek(e)}
                    role="progressbar"
                    tabIndex={0}
                    aria-valuenow={currentTime}
                    aria-valuemin={0}
                    aria-valuemax={duration || 1}
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 w-10 text-right">{formatTime(duration || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      onClick={handleRewind10}
                    >
                      <span className="material-symbols-outlined">replay_10</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePlayPause}
                      className="w-12 h-12 bg-primary text-background-dark rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
                    >
                      <span className={`material-symbols-outlined text-3xl ${isPlaying ? '' : 'fill-icon'}`}>
                        {isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      onClick={handleForward10}
                    >
                      <span className="material-symbols-outlined">forward_10</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 group">
                      <span className="material-symbols-outlined text-slate-500 dark:text-gray-400 text-lg">volume_up</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-20 h-1.5 bg-slate-50 dark:bg-background-dark rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
                        title={t('listeningLesson.volume')}
                      />
                    </div>
                    <button
                      type="button"
                      className="text-xs font-bold text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-border-dark px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-background-dark hover:text-slate-900 dark:hover:text-white transition-colors min-w-[3rem]"
                      onClick={cycleSpeed}
                      title={t('listeningLesson.playbackSpeed')}
                    >
                      {playbackSpeed.toFixed(1)}x
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-border-dark bg-slate-50/50 dark:bg-background-dark/30">
            <button
              type="button"
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full p-3 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">subtitles</span> {t('listeningLesson.viewTranscript')}
              </span>
              <span className={`material-symbols-outlined transition-transform ${showTranscript ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            {showTranscript && (
              <div className="p-4 border-t border-slate-200 dark:border-border-dark max-h-60 overflow-y-auto">
                <p className="text-sm text-slate-900 dark:text-white leading-snug whitespace-pre-wrap">{content?.transcript || '—'}</p>
              </div>
            )}
            {vocabularyList.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setShowVocabTable(!showVocabTable)}
                  className="w-full p-3 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors border-t border-slate-200 dark:border-border-dark"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">translate</span>
                    {t('listeningLesson.vocabTableTitle')}
                  </span>
                  <span className={`material-symbols-outlined transition-transform ${showVocabTable ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {showVocabTable && (
                  <div className="border-t border-slate-200 dark:border-border-dark overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-border-dark">
                          <tr>
                            <th className="text-left py-2.5 px-3 text-xs font-bold text-primary uppercase">{t('listeningLesson.english')}</th>
                            <th className="text-left py-2.5 px-3 text-xs font-bold text-primary uppercase">{t('listeningLesson.vietnamese')}</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-900 dark:text-white">
                          {vocabularyList.map((v, i) => (
                            <tr key={i} className="border-b border-border-dark/50 hover:bg-background-dark/30">
                              <td className="py-2 px-3 font-medium">{v.word || '—'}</td>
                              <td className="py-2 px-3 text-slate-500 dark:text-gray-400">{v.meaning || v.meaningVi || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Quiz Card */}
        <div className="flex-1 bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden flex flex-col shadow-2xl">
          <div className="p-4 border-b border-slate-200 dark:border-border-dark flex justify-between items-center bg-slate-50/50 dark:bg-background-dark/50">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">{t('listeningLesson.progress')}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('listeningLesson.questionCount', { current: currentQuestion + 1, total: totalQuestions })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {completeMessage && (
                <span className="text-xs text-emerald-400">{completeMessage}</span>
              )}
              {!isMockTest && (
                <button
                  type="button"
                  onClick={() => setShowHint((v) => !v)}
                  title={t('listeningLesson.hint')}
                  className={`h-9 w-9 inline-flex items-center justify-center rounded-lg border transition-all ${showHint ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'border-slate-200 dark:border-border-dark text-slate-400 dark:text-gray-500 hover:text-amber-400 hover:border-amber-500/30'}`}
                >
                  <span className="material-symbols-outlined text-lg">lightbulb</span>
                </button>
              )}
              {!isMockTest && (
                <div className={`h-9 inline-flex items-center gap-2 px-3 rounded-lg border font-mono font-bold text-sm ${(countdownSeconds ?? 1) <= 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
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
                  className="h-9 px-4 inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {completingLesson ? '...' : t('readingLesson.submit')}
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden divide-x divide-border-dark">
            {/* Instructions */}
            <div className="overflow-y-auto custom-scrollbar p-6 bg-slate-50/50 dark:bg-background-dark/20">
              <h4 className="text-xs font-bold text-primary uppercase mb-4">{t('listeningLesson.instructions')}</h4>
              <p className="text-sm text-slate-900 dark:text-white leading-relaxed mb-6">
                {content?.description || t('listeningLesson.instructionsDefault')}
              </p>
              {content?.transcript && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark italic text-xs text-slate-500 dark:text-gray-400 leading-relaxed max-h-32 overflow-y-auto">
                  {content.transcript.slice(0, 200)}{content.transcript.length > 200 ? '…' : ''}
                </div>
              )}
            </div>

            {/* Questions */}
            <div className="overflow-y-auto custom-scrollbar p-6 bg-white/50 dark:bg-card-dark/30">
              <div className="mb-8">
                <p className="text-base font-semibold text-slate-900 dark:text-white mb-6">
                  {currentQ?.question || t('listeningLesson.chooseAnswer')}
                </p>
                <div className="space-y-3">
                  {questionOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`group flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedAnswer === opt.value
                          ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                          : 'border-slate-200 dark:border-border-dark hover:bg-slate-100 dark:hover:bg-background-dark hover:border-primary transition-colors'
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={opt.value}
                        checked={selectedAnswer === opt.value}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        className="w-4 h-4 text-primary bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark focus:ring-primary"
                      />
                      <span
                        className={`ml-4 text-sm transition-colors ${
                          selectedAnswer === opt.value ? 'text-primary font-bold' : 'text-slate-500 dark:text-gray-400 group-hover:text-white'
                        }`}
                      >
                        {opt.text}
                      </span>
                    </label>
                  ))}
                {showHint && currentQ?.explanation && (
                  <p className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 italic">{currentQ.explanation}</p>
                )}

                {/* Embedded Navigation */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-border-dark flex flex-wrap justify-between items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-border-dark text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-card-dark hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span> {t('listeningLesson.previous')}
                  </button>



                  <div className="flex gap-2 shrink-0 items-center flex-wrap">
                    {currentQuestion < totalQuestions - 1 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 whitespace-nowrap"
                      >
                        {t('listeningLesson.next')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    ) : !isMockTest && (
                      <button
                        type="button"
                        onClick={handleComplete}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/20 transition-all whitespace-nowrap"
                      >
                        {t('readingLesson.submit')}
                      </button>
                    )}
                  </div>
                </div>

                </div>
              </div>
            </div>
          </div>
        </div>
          
          {/* Navigation Footer for Pagination */}
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
                  onBlur={() => {
                    handlePageChange(pageInput)
                  }}
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
                  {currentPage + 1 < totalQuestions - 1 && <span className="text-slate-400 dark:text-gray-500 text-xs shrink-0">...</span>}
                  {currentPage + 1 < totalQuestions && (
                    <button
                      type="button"
                      onClick={() => handlePageChange(totalQuestions)}
                      className="px-2.5 py-2 rounded-lg text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-card-dark transition-all shrink-0"
                    >
                      {totalQuestions}
                    </button>
                  )}
                </>
              )}

              <span className="text-slate-400 dark:text-gray-500 text-xs mx-1 shrink-0">/ {totalQuestions}</span>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalQuestions}
                className="px-2 py-2 rounded-lg text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-card-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
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
            title={t('listeningLesson.closeRightBar') || 'Close right panel'}
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
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-gray-400">{t('listeningLesson.questionNav') || 'Navigation'}</h3>
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
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-gray-400">{t('listeningLesson.vocabHeard')}</h3>
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
                      title={t('listeningLesson.prevWord')}
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
                      title={t('listeningLesson.nextWord')}
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase mb-1">{t('listeningLesson.meaning')}</span>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{vocabularyList[vocabIndex]?.meaning || vocabularyList[vocabIndex]?.meaningVi || '—'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-5">
                    <button
                      type="button"
                      className="flex-1 py-2 rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-[10px] font-bold hover:bg-border-dark transition-colors"
                    >
                      {t('listeningLesson.known')}
                    </button>
                    <button
                      type="button"
                      className="flex-1 py-2 rounded-lg bg-primary text-white text-[10px] font-bold hover:brightness-110 transition-colors shadow-md"
                    >
                      {t('listeningLesson.saveFlashcard')}
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
            className="p-2.5 rounded-l-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark border-r-0 text-slate-500 dark:text-gray-400 hover:text-primary hover:bg-slate-200 dark:hover:bg-gray-700 transition-all shadow-lg"
            title={t('listeningLesson.openRightBar') || 'Open right panel'}
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
        onClose={() => setShowIncompleteModal(false)}
      />

      <AlertModal
        open={showConfirmModal}
        title={t('listeningLesson.submit')}
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
