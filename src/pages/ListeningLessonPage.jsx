import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useListeningLesson } from '../hooks/useListeningLesson'

export function ListeningLessonPage() {
  const { t } = useTranslation()
  const { id } = useParams()
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
    selectedAnswer,
    setSelectedAnswer,
    noteTitle,
    setNoteTitle,
    noteContent,
    setNoteContent,
    noteCategory,
    setNoteCategory,
    noteSaving,
    noteSavedMessage,
    handleSaveNote,
    completingLesson,
    completeMessage,
    handleComplete,
    saveDraftMessage,
    handleSaveDraft,
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
        <p>{t('listeningLesson.loadError')}</p>
        <Link to="/lesson?skill=listening" className="mt-4 text-primary hover:underline">{t('listeningLesson.back')}</Link>
      </div>
    )
  }

  return (
    <main className="max-w-[1600px] mx-auto px-6 py-6 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-64px)]">
      {/* Left Sidebar - ~200px, can shrink */}
      <aside className="w-full lg:w-[300px] lg:min-w-[240px] lg:shrink lg:basis-[300px] space-y-6 overflow-y-auto pr-2 pb-6 custom-scrollbar">
        {/* Lesson Info Card */}
        <div className="bg-card-dark rounded-2xl p-6 border border-border-dark shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">
              {t('listeningLesson.level')} {content?.level || 'A1'}
            </span>
            <div className="flex items-center text-yellow-500">
              <span className="material-symbols-outlined text-sm mr-1">star</span>
              <span className="text-xs font-bold">{content?.xpReward ?? 50} XP</span>
            </div>
          </div>
          <h2 className="text-lg font-bold mb-4 text-white leading-tight">{content?.title || ''}</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="material-symbols-outlined text-lg text-primary">topic</span>
              <span>{content?.topic || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="material-symbols-outlined text-lg text-primary">schedule</span>
              <span>{content?.time || (content?.estimatedTime ? `${content.estimatedTime}m` : '—')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="material-symbols-outlined text-lg text-primary">quiz</span>
              <span>{t('listeningLesson.questionCountShort', { count: totalQuestions })}</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border-dark">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-gray-400">{t('listeningLesson.progress')}</span>
              <span className="text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-background-dark rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full shadow-[0_0_10px_rgba(19,182,236,0.4)] transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Notes Card */}
        <div className="bg-card-dark rounded-2xl p-5 border border-border-dark shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">note_alt</span>
              <h3 className="font-bold text-sm">{t('listeningLesson.notebook')}</h3>
            </div>
            <select
              value={noteCategory}
              onChange={(e) => setNoteCategory(e.target.value)}
              className="bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white min-w-[120px]"
            >
              <option value="grammar">{t('listeningLesson.noteCategoryGrammar')}</option>
              <option value="vocab">{t('listeningLesson.noteCategoryVocab')}</option>
              <option value="idea">{t('listeningLesson.noteCategoryIdea')}</option>
            </select>
          </div>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="w-full bg-background-dark border border-border-dark rounded-xl p-3 text-sm focus:ring-primary focus:border-primary placeholder:text-gray-500 text-white mb-3"
            placeholder={t('listeningLesson.noteTitlePlaceholder')}
          />
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="w-full bg-background-dark border border-border-dark rounded-xl p-3 text-sm focus:ring-primary focus:border-primary placeholder:text-gray-500 text-white"
            placeholder={t('listeningLesson.notePlaceholder')}
            rows={3}
          />
          {noteSavedMessage && <p className="text-xs text-emerald-400 mb-2">{noteSavedMessage}</p>}
          <button
            type="button"
            onClick={handleSaveNote}
            disabled={noteSaving}
            className="w-full py-2 bg-background-dark hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-all border border-border-dark disabled:opacity-60"
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
          <p className="text-xs leading-relaxed text-gray-400 italic">
            &quot;{t('listeningLesson.tipText')}&quot;
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-6 overflow-hidden">
        {/* Audio Player Card */}
        <div className="bg-card-dark rounded-3xl border border-border-dark overflow-hidden shadow-2xl">
          {content?.audioUrl && <audio ref={audioRef} src={content.audioUrl} />}
          <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
            <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg border border-border-dark bg-background-dark">
              {content?.thumbnail ? (
                <img alt="" className="w-full h-full object-cover" src={content.thumbnail} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
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
              <h1 className="text-xl font-extrabold text-white mb-1">{content?.title || t('listeningLesson.fallbackTitle')}</h1>
              <p className="text-xs text-gray-400 mb-4 flex items-center justify-center md:justify-start gap-2">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {duration > 0 ? `${Math.floor(duration / 60)} ${t('listeningLesson.minutes')} ${duration % 60} ${t('listeningLesson.seconds')}` : (content?.estimatedTime ? `${content.estimatedTime} ${t('listeningLesson.minutes')}` : content?.time || '—')}
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-gray-400 w-10">{formatTime(currentTime)}</span>
                  <div
                    className="flex-1 h-1.5 bg-background-dark rounded-full relative overflow-hidden group cursor-pointer"
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
                  <span className="text-[10px] font-mono text-gray-400 w-10 text-right">{formatTime(duration || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-white transition-colors"
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
                      className="text-gray-400 hover:text-white transition-colors"
                      onClick={handleForward10}
                    >
                      <span className="material-symbols-outlined">forward_10</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 group">
                      <span className="material-symbols-outlined text-gray-400 text-lg">volume_up</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-20 h-1.5 bg-background-dark rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
                        title={t('listeningLesson.volume')}
                      />
                    </div>
                    <button
                      type="button"
                      className="text-xs font-bold text-gray-400 border border-border-dark px-2 py-1 rounded hover:bg-background-dark hover:text-white transition-colors min-w-[3rem]"
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
          <div className="border-t border-border-dark bg-background-dark/30">
            <button
              type="button"
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full p-3 flex items-center justify-between text-xs font-bold text-gray-400 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">subtitles</span> {t('listeningLesson.viewTranscript')}
              </span>
              <span className={`material-symbols-outlined transition-transform ${showTranscript ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            {showTranscript && (
              <div className="p-4 border-t border-border-dark max-h-60 overflow-y-auto">
                <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{content?.transcript || '—'}</p>
              </div>
            )}
            {vocabularyList.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setShowVocabTable(!showVocabTable)}
                  className="w-full p-3 flex items-center justify-between text-xs font-bold text-gray-400 hover:text-white transition-colors border-t border-border-dark"
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
                  <div className="border-t border-border-dark overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-card-dark border-b border-border-dark">
                          <tr>
                            <th className="text-left py-2.5 px-3 text-xs font-bold text-primary uppercase">{t('listeningLesson.english')}</th>
                            <th className="text-left py-2.5 px-3 text-xs font-bold text-primary uppercase">{t('listeningLesson.vietnamese')}</th>
                          </tr>
                        </thead>
                        <tbody className="text-white">
                          {vocabularyList.map((v, i) => (
                            <tr key={i} className="border-b border-border-dark/50 hover:bg-background-dark/30">
                              <td className="py-2 px-3 font-medium">{v.word || '—'}</td>
                              <td className="py-2 px-3 text-gray-400">{v.meaning || v.meaningVi || '—'}</td>
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
        <div className="flex-1 bg-card-dark rounded-2xl border border-border-dark overflow-hidden flex flex-col shadow-2xl">
          <div className="p-4 border-b border-border-dark flex justify-between items-center bg-background-dark/50">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('listeningLesson.progress')}</span>
                <span className="text-sm font-bold text-white">
                  {t('listeningLesson.questionCount', { current: currentQuestion + 1, total: totalQuestions })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {completeMessage && (
                <span className="text-xs text-emerald-400">{completeMessage}</span>
              )}
              <button
                type="button"
                onClick={() => setShowHint((v) => !v)}
                title={t('listeningLesson.hint')}
                className={`p-1.5 rounded-lg border transition-all ${showHint ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'border-border-dark text-gray-500 hover:text-amber-400 hover:border-amber-500/30'}`}
              >
                <span className="material-symbols-outlined text-lg">lightbulb</span>
              </button>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${(countdownSeconds ?? 1) <= 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                <span className="material-symbols-outlined text-lg">timer</span>
                <span>{countdownSeconds != null ? formatTime(Math.max(0, countdownSeconds)) : '--:--'}</span>
                {(countdownSeconds ?? 1) <= 0 && <span className="text-[10px] ml-1">{t('listeningLesson.timeUp')}</span>}
              </div>
              <button
                type="button"
                onClick={handleComplete}
                disabled={completingLesson}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {completingLesson ? '...' : t('listeningLesson.complete')}
              </button>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden divide-x divide-border-dark">
            {/* Instructions */}
            <div className="overflow-y-auto custom-scrollbar p-6 bg-background-dark/20">
              <h4 className="text-xs font-bold text-primary uppercase mb-4">{t('listeningLesson.instructions')}</h4>
              <p className="text-sm text-white leading-relaxed mb-6">
                {content?.description || t('listeningLesson.instructionsDefault')}
              </p>
              {content?.transcript && (
                <div className="p-4 rounded-xl bg-background-dark border border-border-dark italic text-xs text-gray-400 leading-relaxed max-h-32 overflow-y-auto">
                  {content.transcript.slice(0, 200)}{content.transcript.length > 200 ? '…' : ''}
                </div>
              )}
            </div>

            {/* Questions */}
            <div className="overflow-y-auto custom-scrollbar p-6 bg-card-dark/30">
              <div className="mb-8">
                <p className="text-base font-semibold text-white mb-6">
                  {currentQ?.question || t('listeningLesson.chooseAnswer')}
                </p>
                <div className="space-y-3">
                  {questionOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`group flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedAnswer === opt.value
                          ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                          : 'border-border-dark hover:bg-background-dark hover:border-primary transition-colors'
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={opt.value}
                        checked={selectedAnswer === opt.value}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        className="w-4 h-4 text-primary bg-background-dark border-border-dark focus:ring-primary"
                      />
                      <span
                        className={`ml-4 text-sm transition-colors ${
                          selectedAnswer === opt.value ? 'text-primary font-bold' : 'text-gray-400 group-hover:text-white'
                        }`}
                      >
                        {opt.text}
                      </span>
                    </label>
                  ))}
                {showHint && currentQ?.explanation && (
                  <p className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 italic">{currentQ.explanation}</p>
                )}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-background-dark border-t border-border-dark flex flex-wrap justify-between items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-border-dark text-gray-400 hover:bg-card-dark hover:text-white transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span> {t('listeningLesson.previous')}
            </button>

            {/* Pagination */}
            <div className="flex items-center gap-1.5 flex-1 justify-center min-w-0 max-w-full overflow-x-auto">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-card-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>

              {/* Previous pages */}
              {showPrevPages && (
                <>
                  <button
                    type="button"
                    onClick={() => handlePageChange(1)}
                    className="px-2.5 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-card-dark transition-all shrink-0"
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="text-gray-500 text-xs shrink-0">...</span>}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-2.5 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-card-dark transition-all shrink-0"
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
                  className="w-12 px-1 py-2 rounded-lg text-xs font-bold text-center bg-card-dark border border-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary shrink-0"
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
                    className="px-2.5 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-card-dark transition-all shrink-0"
                  >
                    {currentPage + 1}
                  </button>
                  {currentPage + 1 < totalQuestions - 1 && <span className="text-gray-500 text-xs shrink-0">...</span>}
                  {currentPage + 1 < totalQuestions && (
                    <button
                      type="button"
                      onClick={() => handlePageChange(totalQuestions)}
                      className="px-2.5 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-card-dark transition-all shrink-0"
                    >
                      {totalQuestions}
                    </button>
                  )}
                </>
              )}

              <span className="text-gray-500 text-xs mx-1 shrink-0">/ {totalQuestions}</span>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalQuestions}
                className="px-2 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-card-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>

            <div className="flex gap-2 shrink-0 items-center flex-wrap">
              {saveDraftMessage && (
                <span className="text-xs text-emerald-400">{saveDraftMessage}</span>
              )}
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-border-dark text-gray-400 hover:bg-card-dark hover:text-white transition-all whitespace-nowrap"
              >
                {t('listeningLesson.saveDraft')}
              </button>
              <button
                type="button"
                onClick={handleComplete}
                disabled={completingLesson}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary/20 text-primary border border-primary/40 hover:bg-primary hover:text-white transition-all whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {completingLesson ? '...' : t('listeningLesson.complete')}
              </button>
              {currentQuestion < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  {t('listeningLesson.next')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/20 transition-all whitespace-nowrap"
                >
                  {t('listeningLesson.submit')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - ~200px, can shrink */}
      <aside className="w-full lg:w-[300px] lg:min-w-[240px] lg:shrink lg:basis-[300px] space-y-6 overflow-y-auto custom-scrollbar pr-2 pb-6">
        {/* Vocabulary Card */}
        {vocabularyList.length > 0 && (
        <div className="bg-card-dark rounded-2xl border border-border-dark shadow-xl overflow-hidden group">
          <div className="p-4 bg-background-dark border-b border-border-dark flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">{t('listeningLesson.vocabHeard')}</h3>
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
                className="p-2 rounded-lg bg-background-dark border border-border-dark text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title={t('listeningLesson.prevWord')}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div className="flex-1 text-center min-w-0">
                <h4 className="text-lg font-black text-primary truncate" title={vocabularyList[vocabIndex]?.word}>
                  {vocabularyList[vocabIndex]?.word || '—'}
                </h4>
                <span className="text-[10px] font-medium text-gray-400">{vocabularyList[vocabIndex]?.phonetic || ''}</span>
              </div>
              <button
                type="button"
                onClick={() => setVocabIndex((i) => Math.min(vocabularyList.length - 1, i + 1))}
                disabled={vocabIndex >= vocabularyList.length - 1}
                className="p-2 rounded-lg bg-background-dark border border-border-dark text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title={t('listeningLesson.nextWord')}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t('listeningLesson.meaning')}</span>
                <p className="text-sm font-medium text-white">{vocabularyList[vocabIndex]?.meaning || vocabularyList[vocabIndex]?.meaningVi || '—'}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                className="flex-1 py-2 rounded-lg bg-background-dark border border-border-dark text-[10px] font-bold hover:bg-border-dark transition-colors"
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

        {/* Leaderboard Card */}
        <div className="bg-card-dark rounded-2xl p-5 border border-border-dark shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-sm text-white">{t('listeningLesson.leaderboardTitle')}</h3>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-emerald-400">GLOBAL</span>
              <span className="material-symbols-outlined text-yellow-500 text-sm">emoji_events</span>
            </div>
          </div>
          <div className="space-y-4">
            {leaderboard.map((user) => (
              <div
                key={user.rank}
                className="flex items-center justify-between group p-2 rounded-xl hover:bg-background-dark transition-all border border-transparent hover:border-border-dark"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 text-center font-black text-xs ${
                      user.rank === 1 ? 'text-yellow-500' : user.rank === 2 ? 'text-slate-400' : 'text-orange-400'
                    }`}
                  >
                    {user.rank}
                  </div>
                  <div className="relative">
                    <img
                      alt={user.name}
                      className={`w-9 h-9 rounded-full object-cover ${
                        user.rank === 1 ? 'ring-2 ring-yellow-500/30' : 'border border-border-dark'
                      }`}
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoJVZd231Jj0nw9lqgafh4jkbW38dyp3wO7CD2w6ZgqlP4engdDDADo_ShgW2zb967D4cmMcs3McvEtFOp1PJtMbsgWDmx-iMw2emE6xCW7b3wEWTHwfXNoresSNSjToIirGen0V_IOVJDM8qR1cjUSxBytGiii5OWXxaivUDo5YVrPPZweVOkwew7tqhhmaRv-crwkmUkwhIWb-VSB_25TwEKRw1oru0tL2M3b528uhP-Il2eUmJ7ZIzw8fSRpkb5GHqvwqstCV4"
                    />
                    {user.rank === 1 && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-500 rounded-full flex items-center justify-center border border-card-dark">
                        <span className="material-symbols-outlined text-[8px] text-white fill-icon">grade</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className={`text-[9px] ${user.rank === 1 ? 'text-emerald-400 font-medium' : 'text-gray-400'}`}>
                      {user.rank === 1 ? t('listeningLesson.xpToday') : t('listeningLesson.levelLearner', { level: 20 + user.rank })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black ${user.rank === 1 ? 'text-primary' : 'text-gray-400'}`}>
                    {user.rank === 1 ? '4,280' : user.rank === 2 ? '3,950' : '3,820'}
                  </p>
                  <p className="text-[9px] text-gray-400 uppercase">XP</p>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="w-full mt-5 py-2 rounded-lg border border-border-dark text-[10px] font-bold text-gray-400 hover:bg-background-dark hover:text-white transition-all uppercase tracking-widest"
          >
            {t('listeningLesson.viewFullLeaderboard')}
          </button>
        </div>
      </aside>
    </main>
  )
}
