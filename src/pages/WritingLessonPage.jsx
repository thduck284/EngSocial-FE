import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lessonsService } from '../services'
import { addVocabNote } from '../utils/vocabularyUserStorage'
import { formatTime } from '../utils/dateTime'
import { AlertModal } from '../components/ui/common/AlertModal'

export function WritingLessonPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [content, setContent] = useState(null)
  const isPractice = location.pathname.startsWith('/practice/')
  const backLink = isPractice ? '/practice/writing' : '/lesson?skill=writing'
  const [loading, setLoading] = useState(true)
  const [userText, setUserText] = useState('')
  const [showSample, setShowSample] = useState(false)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteSavedMessage, setNoteSavedMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showIncompleteModal, setShowIncompleteModal] = useState(false)
  const [completeMessage, setCompleteMessage] = useState('')
  const [rightBarOpen, setRightBarOpen] = useState(false)
  const [countdownSeconds, setCountdownSeconds] = useState(null)
  const lessonOpenedAtMs = useRef(null)

  useEffect(() => {
    setRightBarOpen(false)
  }, [id])

  const handleSaveNote = () => {
    if (!id || (!noteTitle.trim() && !noteContent.trim())) return
    setNoteSaving(true)
    setNoteSavedMessage('')

    // 1. Save to local storage (match /lesson behavior)
    addVocabNote({
      title: noteTitle || `${info?.title || 'Writing Note'}`,
      content: noteContent
    })

    // 2. Save to backend
    lessonsService
      .addNote(id, { title: noteTitle, content: noteContent })
      .then(() => {
        setNoteSavedMessage(t('writingLesson.noteSaved'))
        setNoteTitle('')
        setNoteContent('')
        setTimeout(() => setNoteSavedMessage(''), 2500)
      })
      .catch((err) => {
        console.error('Failed to save writing note to backend:', err)
        // Still show success locally
        setNoteSavedMessage(t('writingLesson.noteSaved'))
        setNoteTitle('')
        setNoteContent('')
        setTimeout(() => setNoteSavedMessage(''), 2500)
      })
      .finally(() => setNoteSaving(false))
  }

  useEffect(() => {
    setLoading(true)
    // Fetch content
    lessonsService
      .getWritingContent(id)
      .then((res) => {
        const data = res?.data || null
        lessonOpenedAtMs.current = Date.now()
        setContent(data)
        const estStr = data?.content?.time || '20m'
        const estNum = parseInt(estStr, 10) || 20
        setCountdownSeconds(estNum * 60)
      })
      .catch(() => setContent(null))
      .finally(() => setLoading(false))

    // Load progress
    lessonsService
      .getProgress(id)
      .then((res) => {
        // Confirmation that progress exists
      })
      .catch((err) => console.error('Failed to load writing progress:', err))
  }, [id])

  const info = content?.content || {}
  const wordLimit = info.wordLimit || { min: 100, max: 150 }
  const wordCount = (userText.trim() && userText.trim().split(/\s+/).length) || 0
  const inRange = wordCount >= (wordLimit.min || 0) && wordCount <= (wordLimit.max || 999)

  const handleSubmit = () => {
    if (!id || !userText.trim()) return
    if (!inRange) {
      setShowIncompleteModal(true)
      return
    }
    setShowConfirmSubmitModal(true)
  }

  const handleConfirmSubmit = () => {
    setShowConfirmSubmitModal(false)
    setSubmitting(true)
    setSubmitMessage('')
    setCompleteMessage('')
    
    const elapsedSec =
      lessonOpenedAtMs.current != null
        ? Math.max(0, Math.floor((Date.now() - lessonOpenedAtMs.current) / 1000))
        : 0

    lessonsService
      .submitWriting(id, { content: userText, wordCount, timeSpent: elapsedSec })
      .then((res) => {
        setCompleteMessage(t('writingLesson.submitSuccess'))
        setShowSuccessModal(true)
      })
      .catch(() => setSubmitMessage(t('writingLesson.submitFailed')))
      .finally(() => setSubmitting(false))
  }

  useEffect(() => {
    if (countdownSeconds == null || countdownSeconds <= 0) return
    const interval = setInterval(() => setCountdownSeconds((s) => (s <= 0 ? 0 : s - 1)), 1000)
    return () => clearInterval(interval)
  }, [countdownSeconds])

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
        <p>{t('writingLesson.loadError')}</p>
        <Link to={backLink} className="mt-4 text-primary hover:underline">
          {t('writingLesson.back')}
        </Link>
      </div>
    )
  }

  return (
    <main className="max-w-[1600px] mx-auto px-6 py-6 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-64px)]">
      {/* Left Sidebar - ~200px, can shrink */}
      <aside className="w-full lg:w-[300px] lg:min-w-[240px] lg:shrink lg:basis-[300px] space-y-6 overflow-y-auto pr-2 pb-6 custom-scrollbar">
        <div className="bg-card-dark rounded-2xl p-6 border border-border-dark shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">
              {t('writingLesson.level')} {info.level}
            </span>
            <div className="flex items-center text-yellow-500">
              <span className="material-symbols-outlined text-sm mr-1">star</span>
              <span className="text-xs font-bold">{info.xpReward || 50} {t('writingLesson.xpReward')}</span>
            </div>
          </div>
          <h2 className="text-lg font-bold mb-4 text-white leading-tight">{info.title}</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="material-symbols-outlined text-lg text-primary">topic</span>
              <span>{t('writingLesson.topic')}: {info.topic || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="material-symbols-outlined text-lg text-primary">schedule</span>
              <span>
                {t('writingLesson.time')}: {info.time?.endsWith('m') ? `${info.time.slice(0, -1)} ${t('writingLesson.minutes')}` : info.time}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="material-symbols-outlined text-lg text-primary">edit_note</span>
              <span>
                {wordLimit.min}–{wordLimit.max} {t('writingLesson.words')}
              </span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border-dark">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-gray-400">{t('writingLesson.wordCount')}</span>
              <span className={inRange ? 'text-emerald-400' : 'text-gray-400'}>
                {wordCount} / {wordLimit.min}–{wordLimit.max} {t('writingLesson.words')}
              </span>
            </div>
            <div className="w-full bg-background-dark rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${inRange ? 'bg-emerald-500' : 'bg-primary'}`}
                style={{
                  width: `${Math.min(100, (wordCount / (wordLimit.max || 150)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-card-dark rounded-2xl p-5 border border-border-dark shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">note_alt</span>
            <h3 className="font-bold text-sm">{t('writingLesson.notebook')}</h3>
          </div>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="w-full bg-background-dark border border-border-dark rounded-xl p-3 text-sm focus:ring-primary focus:border-primary placeholder:text-gray-500 text-white mb-3"
            placeholder={t('writingLesson.noteTitlePlaceholder')}
          />
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="w-full bg-background-dark border border-border-dark rounded-xl p-3 text-sm focus:ring-primary focus:border-primary placeholder:text-gray-500 text-white"
            placeholder={t('writingLesson.notePlaceholder')}
            rows={3}
          />
          {noteSavedMessage && <p className="text-xs text-emerald-400 mt-2 mb-1">{noteSavedMessage}</p>}
          <button
            type="button"
            onClick={handleSaveNote}
            disabled={noteSaving}
            className="mt-3 w-full py-2 bg-background-dark hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-all border border-border-dark disabled:opacity-60"
          >
            {noteSaving ? '...' : t('writingLesson.saveNote')}
          </button>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">lightbulb</span>
            <h3 className="font-bold text-primary text-sm">{t('writingLesson.tipTitle')}</h3>
          </div>
          <p className="text-xs leading-relaxed text-gray-400 italic">
            &quot;{t('writingLesson.tipText')}&quot;
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-6 overflow-hidden">
        <div className="bg-card-dark rounded-2xl border border-border-dark overflow-hidden flex flex-col flex-1 shadow-2xl">
          <div className="p-4 border-b border-border-dark flex justify-between items-center bg-background-dark/50">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('writingLesson.prompt')}</span>
            </div>
            <div className="flex items-center gap-3">
              {completeMessage && (
                <span className="text-xs text-emerald-400 font-bold animate-pulse">{completeMessage}</span>
              )}
              <div className={`h-9 inline-flex items-center gap-2 px-3 rounded-lg border font-mono font-bold text-sm ${(countdownSeconds ?? 1) <= 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                <span className="material-symbols-outlined text-base">timer</span>
                <span>{countdownSeconds != null ? formatTime(Math.max(0, countdownSeconds)) : '--:--'}</span>
                {(countdownSeconds ?? 1) <= 0 && <span className="text-[10px] ml-1">{t('writingLesson.timeUp')}</span>}
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="h-9 px-4 inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? '...' : t('writingLesson.submit')}
              </button>
            </div>
          </div>

          <div className="p-6 border-b border-border-dark bg-background-dark/20">
            <p className="text-white leading-relaxed whitespace-pre-wrap">{info.prompt || t('writingLesson.noPrompt')}</p>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-400">{t('writingLesson.yourWriting')}</label>
              <span className={`text-sm font-bold ${inRange ? 'text-emerald-400' : 'text-gray-400'}`}>
                {wordCount} {t('writingLesson.words')}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`h-9 inline-flex items-center gap-2 px-3 rounded-lg border font-mono font-bold text-sm ${(countdownSeconds ?? 1) <= 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  <span className="material-symbols-outlined text-base">timer</span>
                  <span>{countdownSeconds != null ? formatTime(Math.max(0, countdownSeconds)) : '--:--'}</span>
                  {(countdownSeconds ?? 1) <= 0 && <span className="text-[10px] ml-1">{t('writingLesson.timeUp')}</span>}
                </div>
              </div>
            </div>
            <textarea
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              className="w-full flex-1 min-h-[280px] bg-background-dark border border-border-dark rounded-xl p-4 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary focus:border-primary resize-none custom-scrollbar"
              placeholder={t('writingLesson.textareaPlaceholder')}
            />

            {info.sampleAnswer && (
              <div className="mt-6 border-t border-border-dark pt-6">
                <button
                  type="button"
                  onClick={() => setShowSample((s) => !s)}
                  className="flex items-center gap-2 text-primary hover:underline text-sm font-bold mb-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showSample ? 'expand_less' : 'expand_more'}
                  </span>
                  {showSample ? t('writingLesson.hideSample') : t('writingLesson.showSample')}
                </button>
                {showSample && (
                  <div className="bg-background-dark/80 rounded-xl p-4 border border-border-dark">
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {info.sampleAnswer}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(backLink)}
                className="px-4 py-2 border border-border-dark rounded-xl text-gray-400 hover:bg-white/5 text-sm font-medium"
              >
                {t('writingLesson.back')}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl text-sm transition-all"
              >
                {submitting ? t('writingLesson.submitting') : t('writingLesson.submit')}
              </button>
            </div>
            {submitMessage && <p className="mt-3 text-sm text-gray-300">{submitMessage}</p>}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Toggleable */}
      {rightBarOpen ? (
        <aside className="w-full lg:w-[300px] lg:min-w-[240px] lg:shrink lg:basis-[300px] space-y-6 overflow-y-auto custom-scrollbar pr-2 pb-6 relative">
          <div className="sticky top-0 z-10 flex justify-end mb-2">
            <button
              type="button"
              onClick={() => setRightBarOpen(false)}
              className="p-2 rounded-lg bg-card-dark border border-border-dark text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
              title={t('writingLesson.closeRightBar')}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          {info.vocabulary && info.vocabulary.length > 0 && (
            <div className="bg-card-dark rounded-2xl p-5 border border-border-dark shadow-lg">
              <h3 className="font-bold text-sm text-gray-400 mb-3">{t('writingLesson.suggestedVocab')}</h3>
              <ul className="space-y-4">
                {info.vocabulary.map((v, i) => (
                  <li key={i} className="text-sm">
                    <p className="text-primary font-bold">{v.word}</p>
                    {v.phonetic && <p className="text-gray-500 text-[10px] italic">{v.phonetic}</p>}
                    {v.meaning && <p className="text-gray-400 text-xs mt-1 leading-relaxed">{v.meaning}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      ) : (
        <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-20">
          <button
            type="button"
            onClick={() => setRightBarOpen(true)}
            className="p-2.5 rounded-l-lg bg-card-dark border border-border-dark border-r-0 text-gray-400 hover:text-primary hover:bg-gray-700 transition-all shadow-lg"
            title={t('writingLesson.openRightBar')}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
        </div>
      )}

      <AlertModal
        open={showConfirmSubmitModal}
        title={t('writingLesson.submit')}
        message={t('writingLesson.confirmSubmit')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        onClose={() => setShowConfirmSubmitModal(false)}
        onConfirm={handleConfirmSubmit}
      />

      <AlertModal
        open={showSuccessModal}
        title={t('writingLesson.submitSuccessTitle')}
        message={t('writingLesson.submitSuccessMessage')}
        confirmText={t('common.ok')}
        onClose={() => {
          setShowSuccessModal(false)
          navigate(`/lesson/writing/${id}/result`)
        }}
      />

      <AlertModal
        open={showIncompleteModal}
        title=""
        message={t('writingLesson.invalidWordCount')}
        confirmText="OK"
        onClose={() => setShowIncompleteModal(false)}
      />
    </main>
  )
}
