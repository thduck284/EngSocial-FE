import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useReadingLesson } from '../hooks/useReadingLesson'
import { formatTime } from '../utils/dateTime'

export function ReadingLessonPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [rightBarOpen, setRightBarOpen] = useState(false)

  // Default: keep right panel closed when entering/reloading a lesson.
  useEffect(() => {
    setRightBarOpen(false)
  }, [id])
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
    noteCategory,
    setNoteCategory,
    noteSaving,
    noteSavedMessage,
    handleSaveNote,
    editingPage,
    pageInput,
    setPageInput,
    showHint,
    setShowHint,
    completingLesson,
    completeMessage,
    handleComplete,
    saveDraftMessage,
    handleSaveDraft,
    vocabIndex,
    setVocabIndex,
    showVocabTable,
    setShowVocabTable,
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
        <Link to="/lesson?skill=reading" className="mt-4 text-primary hover:underline">{t('readingLesson.back')}</Link>
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
              {t('readingLesson.level')} {mockReadingContent.level}
            </span>
            <div className="flex items-center text-yellow-500">
              <span className="material-symbols-outlined text-sm mr-1">star</span>
              <span className="text-xs font-bold">{mockReadingContent.xpReward} XP</span>
            </div>
          </div>
          <h2 className="text-lg font-bold mb-4 text-white leading-tight">{mockReadingContent.title}</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="material-symbols-outlined text-lg text-primary">topic</span>
              <span>{mockReadingContent.topic}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="material-symbols-outlined text-lg text-primary">schedule</span>
              <span>{mockReadingContent.time}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="material-symbols-outlined text-lg text-primary">quiz</span>
              <span>{t('readingLesson.questionCountShort', { count: totalQuestions })}</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border-dark">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-gray-400">{t('readingLesson.progress')}</span>
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
              <h3 className="font-bold text-sm">{t('readingLesson.notebook')}</h3>
            </div>
            <select
              value={noteCategory}
              onChange={(e) => setNoteCategory(e.target.value)}
              className="bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white min-w-[120px]"
            >
              <option value="grammar">{t('readingLesson.noteCategoryGrammar')}</option>
              <option value="vocab">{t('readingLesson.noteCategoryVocab')}</option>
              <option value="idea">{t('readingLesson.noteCategoryIdea')}</option>
            </select>
          </div>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="w-full bg-background-dark border border-border-dark rounded-xl p-3 text-sm focus:ring-primary focus:border-primary placeholder:text-gray-500 text-white mb-3"
            placeholder={t('readingLesson.noteTitlePlaceholder')}
          />
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="w-full bg-background-dark border border-border-dark rounded-xl p-3 text-sm focus:ring-primary focus:border-primary placeholder:text-gray-500 text-white"
            placeholder={t('readingLesson.notePlaceholder')}
            rows={3}
          />
          {noteSavedMessage && <p className="text-xs text-emerald-400 mb-2">{noteSavedMessage}</p>}
          <button
            type="button"
            onClick={handleSaveNote}
            disabled={noteSaving}
            className="w-full py-2 bg-background-dark hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-all border border-border-dark disabled:opacity-60"
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
          <p className="text-xs leading-relaxed text-gray-400 italic">
            &quot;{t('readingLesson.tipText')}&quot;
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col gap-6 overflow-hidden">
        <div className="bg-card-dark rounded-2xl border border-border-dark overflow-hidden flex flex-col flex-1 shadow-2xl">
          {/* Toolbar: chuyển đổi Vi/En đoạn văn + bật/tắt highlight */}
          <div className="p-4 border-b border-border-dark flex justify-between items-center bg-background-dark/50">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPassageLang((prev) => (prev === 'en' ? 'vi' : 'en'))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                  passageLang === 'vi'
                    ? 'bg-primary/30 text-primary border-primary/50'
                    : 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/30'
                }`}
                title={passageLang === 'en' ? t('readingLesson.translateToVi') : t('readingLesson.switchToEn')}
              >
                <span className="material-symbols-outlined text-sm">translate</span>
                {passageLang === 'en' ? t('readingLesson.translatePassageVi') : t('readingLesson.passageOriginalEn')}
              </button>
              <button
                type="button"
                onClick={() => setHighlightOn((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                  highlightOn
                    ? 'bg-emerald-500/30 text-emerald-400 border-emerald-500/50'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/30'
                }`}
                title={highlightOn ? t('readingLesson.highlightTitleOn') : t('readingLesson.highlightTitleOff')}
              >
                <span className="material-symbols-outlined text-sm">ink_highlighter</span>
                {highlightOn ? t('readingLesson.highlightOn') : t('readingLesson.highlight')}
              </button>
            </div>
            <div className="flex items-center gap-4 text-gray-400">
              <span className="material-symbols-outlined hover:text-primary cursor-pointer text-xl">text_increase</span>
              <span className="material-symbols-outlined hover:text-primary cursor-pointer text-xl">bookmark_border</span>
            </div>
          </div>

          {/* Split View: Reading Text and Questions */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden divide-x divide-border-dark">
            {/* Reading Text */}
            <div className="overflow-y-auto custom-scrollbar p-6 bg-background-dark/30">
              {mockReadingContent.thumbnail && (
                <img
                  alt={mockReadingContent.title}
                  className="w-full h-32 object-cover rounded-xl mb-6 shadow-lg"
                  src={mockReadingContent.thumbnail}
                />
              )}
              <div className="prose prose-invert max-w-none prose-sm sm:prose-base">
                {(passageLang === 'vi' && mockReadingContent.translationVi
                  ? mockReadingContent.translationVi
                  : mockReadingContent.text || ''
                )
                  .split('\n\n')
                  .filter(Boolean)
                  .map((paragraph, idx) => (
                    <p key={idx} className="text-white leading-relaxed mb-6">
                      {paragraph.split(/\s+/).filter(Boolean).map((word, wordIdx) => {
                        const wordClean = word.replace(/[.,!?;:]/g, '')
                        const isHighlighted = highlightOn && vocabularyList.some(
                          (v) => v.word && wordClean.toLowerCase() === v.word.toLowerCase()
                        )
                        return (
                          <span
                            key={wordIdx}
                            className={
                              isHighlighted
                                ? 'bg-primary/30 border-b-2 border-primary px-1 cursor-pointer text-white font-medium'
                                : ''
                            }
                          >
                            {word}{' '}
                          </span>
                        )
                      })}
                    </p>
                  ))}
              </div>
              {passageLang === 'vi' && !mockReadingContent.translationVi && (mockReadingContent.text || '').trim() && (
                <p className="text-xs text-gray-500 italic mt-2">{t('readingLesson.noTranslation')}</p>
              )}
              {/* Bảng từ vựng Anh – Việt (expandable) */}
              {vocabularyList.length > 0 && (
                <div className="mt-6 border-t border-border-dark pt-4">
                  <button
                    type="button"
                    onClick={() => setShowVocabTable((v) => !v)}
                    className="flex items-center justify-between w-full py-2 text-left text-sm font-semibold text-primary hover:bg-primary/5 rounded-lg px-2 -mx-2"
                  >
                    <span>{t('readingLesson.vocabTableTitle')}</span>
                    <span className={`material-symbols-outlined transition-transform ${showVocabTable ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  {showVocabTable && (
                    <div className="mt-2 overflow-x-auto rounded-xl border border-border-dark">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-background-dark/80 border-b border-border-dark">
                            <th className="py-2 px-3 text-left font-bold text-gray-400">{t('readingLesson.english')}</th>
                            <th className="py-2 px-3 text-left font-bold text-gray-400">{t('readingLesson.vietnamese')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vocabularyList.map((v, i) => (
                            <tr key={i} className="border-b border-border-dark/50 last:border-0">
                              <td className="py-2 px-3 text-white font-medium">{v.word || '—'}</td>
                              <td className="py-2 px-3 text-gray-400">{v.meaning || v.meaningVi || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Questions */}
            <div className="overflow-y-auto custom-scrollbar p-6 bg-card-dark/50">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('readingLesson.progress')}</span>
                  <h3 className="text-base font-bold text-white">
                    {t('readingLesson.questionCount', { current: currentQuestion + 1, total: totalQuestions })}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  {completeMessage && <span className="text-xs text-emerald-400">{completeMessage}</span>}
                  <button
                    type="button"
                    onClick={() => setShowHint((v) => !v)}
                    title={t('readingLesson.hint')}
                    className={`p-1.5 rounded-lg border transition-all ${showHint ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'border-border-dark text-gray-500 hover:text-amber-400 hover:border-amber-500/30'}`}
                  >
                    <span className="material-symbols-outlined text-lg">lightbulb</span>
                  </button>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${(countdownSeconds ?? 1) <= 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    <span className="material-symbols-outlined text-lg">timer</span>
                    <span>{countdownSeconds != null ? formatTime(Math.max(0, countdownSeconds)) : '--:--'}</span>
                    {(countdownSeconds ?? 1) <= 0 && <span className="text-[10px] ml-1">{t('readingLesson.timeUp')}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={completingLesson}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {completingLesson ? '...' : t('readingLesson.complete')}
                  </button>
                </div>
              </div>
              <div className="mb-8">
                <p className="text-base font-semibold text-white mb-6">{question?.question || t('readingLesson.chooseAnswer')}</p>
                <div className="space-y-3">
                  {questionOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`group flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedAnswer === opt.value
                          ? 'border-emerald-400 bg-emerald-500/10'
                          : 'border-border-dark hover:bg-background-dark hover:border-primary'
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
                      <span className={`ml-4 text-sm ${selectedAnswer === opt.value ? 'text-primary font-bold' : 'text-gray-400 group-hover:text-white'}`}>
                        {opt.text}
                      </span>
                    </label>
                  ))}
                </div>
                {showHint && question?.explanation && (
                  <p className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 italic">{question.explanation}</p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="p-4 bg-background-dark border-t border-border-dark flex flex-wrap justify-between items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-border-dark text-gray-400 hover:bg-card-dark hover:text-white transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              {t('readingLesson.previous')}
            </button>

            {/* Pagination */}
            <div className="flex items-center gap-2 flex-1 justify-center">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-card-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>

              {/* Previous pages */}
              {showPrevPages && (
                <>
                  <button
                    type="button"
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-card-dark transition-all"
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="text-gray-500 text-xs">...</span>}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-card-dark transition-all"
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
                  max={totalPages}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyDown={handlePageInputKeyDown}
                  onBlur={() => {
                    handlePageChange(pageInput)
                  }}
                  className="w-12 px-2 py-2 rounded-lg text-xs font-bold text-center bg-card-dark border border-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  onClick={startEditingPage}
                  className="px-4 py-2 rounded-lg text-xs font-black bg-primary text-white hover:brightness-110 transition-all min-w-[3rem]"
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
                    className="px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-card-dark transition-all"
                  >
                    {currentPage + 1}
                  </button>
                  {currentPage + 1 < totalPages - 1 && <span className="text-gray-500 text-xs">...</span>}
                  {currentPage + 1 < totalPages && (
                    <button
                      type="button"
                      onClick={() => handlePageChange(totalPages)}
                      className="px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-card-dark transition-all"
                    >
                      {totalPages}
                    </button>
                  )}
                </>
              )}

              <span className="text-gray-500 text-xs mx-1">/ {totalPages}</span>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-card-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>

            <div className="flex gap-2 shrink-0 items-center flex-wrap">
              {saveDraftMessage && <span className="text-xs text-emerald-400">{saveDraftMessage}</span>}
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-border-dark text-gray-400 hover:bg-card-dark hover:text-white transition-all whitespace-nowrap"
              >
                {t('readingLesson.saveDraft')}
              </button>
              <button
                type="button"
                onClick={handleComplete}
                disabled={completingLesson}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary/20 text-primary border border-primary/40 hover:bg-primary hover:text-white transition-all whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {completingLesson ? '...' : t('readingLesson.complete')}
              </button>
              {currentQuestion < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  {t('readingLesson.next')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/20 transition-all whitespace-nowrap"
                >
                  {t('readingLesson.submit')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - ~200px, can shrink */}
      {rightBarOpen ? (
      <aside className="w-full lg:w-[300px] lg:min-w-[240px] lg:shrink lg:basis-[300px] space-y-6 overflow-y-auto custom-scrollbar pr-2 pb-6 relative">
        <div className="sticky top-0 z-10 flex justify-end mb-2">
          <button
            type="button"
            onClick={() => setRightBarOpen(false)}
            className="p-2 rounded-lg bg-card-dark border border-border-dark text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
            title={t('readingLesson.closeRightBar')}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        {/* Vocabulary Card - one word at a time with prev/next */}
        {vocabularyList.length > 0 && (
          <div className="bg-card-dark rounded-2xl border border-border-dark shadow-xl overflow-hidden">
            <div className="p-4 bg-background-dark border-b border-border-dark flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">{t('readingLesson.vocabFromReading')}</h3>
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
                  className="p-2 rounded-lg bg-background-dark border border-border-dark text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title={t('readingLesson.prevWord')}
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
                  className="p-2 rounded-lg bg-background-dark border border-border-dark text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title={t('readingLesson.nextWord')}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t('readingLesson.meaning')}</span>
                  <p className="text-sm font-medium text-white">{vocabularyList[vocabIndex]?.meaning || vocabularyList[vocabIndex]?.meaningVi || '—'}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button type="button" className="flex-1 py-2 rounded-lg bg-background-dark border border-border-dark text-[10px] font-bold hover:bg-gray-700 transition-colors">
                  {t('readingLesson.known')}
                </button>
                <button type="button" className="flex-1 py-2 rounded-lg bg-primary text-white text-[10px] font-bold hover:brightness-110 transition-colors shadow-md">
                  {t('readingLesson.saveFlashcard')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Card */}
        <div className="bg-card-dark rounded-2xl p-5 border border-border-dark shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-sm text-white">{t('readingLesson.leaderboardTitle')}</h3>
            <span className="material-symbols-outlined text-yellow-500">emoji_events</span>
          </div>
          <div className="space-y-4">
            {mockReadingLeaderboard.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center justify-between group p-2 rounded-xl hover:bg-background-dark transition-all ${
                  user.rank === 1 ? 'bg-yellow-500/10 border border-yellow-500/20' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 text-center font-black text-xs ${
                      user.rank === 1 ? 'text-yellow-500' : user.rank === 2 ? 'text-slate-500' : 'text-orange-400'
                    }`}
                  >
                    {user.rank}
                  </span>
                  <div className="relative">
                    <img
                      alt={user.name}
                      className={`w-9 h-9 rounded-full object-cover ${
                        user.rank === 1 ? 'ring-2 ring-yellow-500/30' : 'border border-border-dark'
                      }`}
                      src={user.avatar}
                    />
                    {user.rank === 1 && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-500 rounded-full flex items-center justify-center border border-card-dark">
                        <span className="material-symbols-outlined text-[8px] text-white fill-icon">grade</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className="text-[9px] text-gray-400">{user.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black ${user.rank === 1 ? 'text-primary' : 'text-gray-400'}`}>{user.xp}</p>
                  <p className="text-[9px] text-gray-400">XP</p>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="w-full mt-5 py-2 rounded-lg border border-border-dark text-[10px] font-bold text-gray-400 hover:bg-background-dark hover:text-white transition-all"
          >
            {t('readingLesson.viewFullLeaderboard')}
          </button>
        </div>
      </aside>
      ) : (
        <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-20">
          <button
            type="button"
            onClick={() => setRightBarOpen(true)}
            className="p-2.5 rounded-l-lg bg-card-dark border border-border-dark border-r-0 text-gray-400 hover:text-primary hover:bg-gray-700 transition-all shadow-lg"
            title={t('readingLesson.openRightBar')}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
        </div>
      )}
    </main>
  )
}
