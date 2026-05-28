import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { lessonsService } from '../services'
import { addVocabNote } from '../utils/vocabularyUserStorage'
import { SPEED_OPTIONS } from '../constants/lessons'
import { formatTime } from '../utils/dateTime'

/**
 * Hook for Listening Lesson page: content, audio playback, quiz state, notes, countdown, vocab, pagination.
 * @param {string} id - Lesson ID from route
 * @param {Function} t - i18n t function
 * @returns {Object} All state and handlers including audioRef for <audio>
 */
export function useListeningLesson(id, t) {
  const navigate = useNavigate()
  const location = useLocation()
  const audioRef = useRef(null)
  const lessonOpenedAtMs = useRef(null)

  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(75)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showTranscript, setShowTranscript] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteSavedMessage, setNoteSavedMessage] = useState('')
  const [completingLesson, setCompletingLesson] = useState(false)
  const [completeMessage, setCompleteMessage] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showIncompleteModal, setShowIncompleteModal] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [editingPage, setEditingPage] = useState(false)
  const [pageInput, setPageInput] = useState('')
  const [countdownSeconds, setCountdownSeconds] = useState(null)
  const [vocabIndex, setVocabIndex] = useState(0)
  const [showVocabTable, setShowVocabTable] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    // Reset all per-lesson state when id changes
    setAnswers({})
    setCurrentQuestion(0)
    setShowHint(false)
    setCompleteMessage('')
    setShowConfirmModal(false)
    setShowIncompleteModal(false)
    // Fetch lesson content
    lessonsService
      .getListeningContent(id)
      .then((res) => {
        const data = res?.data || null
        lessonOpenedAtMs.current = Date.now()
        setContent(data)
        if (data?.duration) setDuration(data.duration)
        if (data?.totalQuestions) setCurrentQuestion(0)
        const initialCountdown = (data?.content?.estimatedTime || data?.estimatedTime || 15) * 60
        setCountdownSeconds(initialCountdown)
      })
      .catch(() => setContent(null))
      .finally(() => setLoading(false))

    // Load existing notes for this lesson from backend
    lessonsService
      .getProgress(id)
      .then((res) => {
        const notes = res?.data?.notes || []
        // Optional: show most recent note in fields?
        // Usually, LessonPage sidebar notes are for "new" entry, 
        // but confirmation is good.
      })
      .catch((err) => console.error('Failed to load lesson progress:', err))
  }, [id])

  const vocabularyList = content?.vocabulary || []
  const lessonChapters = content?.chapters || []
  const vocabCard = content?.vocabCard || {}
  const leaderboard = content?.leaderboard || []
  const questions = content?.questions || []
  const totalQuestions = Math.max(1, content?.totalQuestions || questions.length)
  const currentQ = questions[currentQuestion]
  const selectedAnswer = answers[currentQuestion] ?? ''
  const setSelectedAnswer = (value) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: value }))
  }
  const questionOptions =
    currentQ?.options?.length > 0
      ? currentQ.options
      : currentQ?.type === 'true_false'
        ? [
            { value: 'true', text: t('listeningLesson.trueLabel') || 'True' },
            { value: 'false', text: t('listeningLesson.falseLabel') || 'False' },
          ]
        : content?.quizOptions || []
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0
  const accentLabel = content?.accent ? content.accent.charAt(0).toUpperCase() + content.accent.slice(1) : ''
  const currentPage = currentQuestion + 1
  const totalPages = totalQuestions
  const showPrevPages = currentPage > 2
  const showNextPages = currentPage < totalPages

  useEffect(() => {
    if (countdownSeconds == null || countdownSeconds <= 0) return
    const interval = setInterval(() => setCountdownSeconds((s) => (s <= 0 ? 0 : s - 1)), 1000)
    return () => clearInterval(interval)
  }, [countdownSeconds])

  useEffect(() => {
    const el = audioRef.current
    if (el) el.playbackRate = playbackSpeed
  }, [playbackSpeed, content?.audioUrl])

  useEffect(() => {
    const el = audioRef.current
    if (el) el.volume = volume / 100
  }, [volume, content?.audioUrl])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onTimeUpdate = () => setCurrentTime(Math.floor(el.currentTime))
    const onDurationChange = () => setDuration(Math.floor(el.duration))
    const onEnded = () => setIsPlaying(false)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    el.addEventListener('timeupdate', onTimeUpdate)
    el.addEventListener('durationchange', onDurationChange)
    el.addEventListener('ended', onEnded)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate)
      el.removeEventListener('durationchange', onDurationChange)
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
    }
  }, [content?.audioUrl])

  useEffect(() => {
    if (vocabularyList.length > 0 && vocabIndex >= vocabularyList.length) setVocabIndex(0)
  }, [vocabularyList.length, vocabIndex])

  useEffect(() => {
    setShowHint(false)
  }, [currentQuestion])

  const handleSaveNote = () => {
    if (!id || (!noteTitle.trim() && !noteContent.trim())) return
    setNoteSaving(true)
    setNoteSavedMessage('')

    // 1. Save to local storage (like in /lesson) so it shows up in "Words & Notes"
    addVocabNote({ 
      title: noteTitle || `${content?.content?.title || 'Listening Note'}`, 
      content: noteContent 
    })

    // 2. Save to backend for cross-device persistence
    lessonsService
      .addNote(id, { title: noteTitle, content: noteContent })
      .then(() => {
        setNoteSavedMessage(t('listeningLesson.noteSaved'))
        setNoteTitle('')
        setNoteContent('')
        setTimeout(() => setNoteSavedMessage(''), 2500)
      })
      .catch((err) => {
        console.error('Failed to save note to backend:', err)
        // Still show success since it saved locally
        setNoteSavedMessage(t('listeningLesson.noteSaved'))
        setNoteTitle('')
        setNoteContent('')
        setTimeout(() => setNoteSavedMessage(''), 2500)
      })
      .finally(() => setNoteSaving(false))
  }

  const handleComplete = () => {
    if (!id) return
    const allAnswered =
      questions.length === 0 ||
      questions.every((_, i) => {
        const a = answers[i]
        return a != null && String(a).trim() !== ''
      })
    if (!allAnswered) {
      setShowIncompleteModal(true)
      return
    }
    setShowConfirmModal(true)
  }

  const handleConfirmComplete = () => {
    setShowConfirmModal(false)
    setCompletingLesson(true)
    setCompleteMessage('')
    
    const answersPayload = questions.map((q, i) => ({
      questionId: String(q?.id ?? i + 1),
      questionIndex: i,
      answer: answers[i],
    }))
    
    const elapsedSec =
      lessonOpenedAtMs.current != null
        ? Math.max(0, Math.floor((Date.now() - lessonOpenedAtMs.current) / 1000))
        : currentTime || 0

    lessonsService
      .submit(id, { answers: answersPayload, timeSpent: elapsedSec })
      .then((res) => {
        const xp = res?.data?.xpEarnedThisAttempt ?? 0
        setCompleteMessage(
          xp > 0 ? t('listeningLesson.completeSuccess', { xp }) : t('listeningLesson.completeSuccessShort')
        )
        const type = location.pathname.startsWith('/practice/') ? 'practice' : 'lesson'
        const redirectTo = `/${type}/listening/${id}/result`
        setTimeout(() => {
          setCompleteMessage('')
          navigate(redirectTo)
        }, 3000)
      })
      .catch(() => setCompleteMessage(t('listeningLesson.completeFailed')))
      .finally(() => setCompletingLesson(false))
  }

  const cycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(playbackSpeed)
    setPlaybackSpeed(SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length])
  }

  const handlePlayPause = () => {
    const el = audioRef.current
    if (!el) return
    if (isPlaying) {
      el.pause()
    } else {
      el.play().catch(() => {})
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e) => {
    const el = audioRef.current
    if (!el || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    const time = Math.max(0, Math.min(duration, Math.floor(pct * duration)))
    el.currentTime = time
    setCurrentTime(time)
  }

  const handleRewind10 = () => {
    const el = audioRef.current
    if (el) {
      el.currentTime = Math.max(0, currentTime - 10)
      setCurrentTime((prev) => Math.max(0, prev - 10))
    }
  }

  const handleForward10 = () => {
    const el = audioRef.current
    if (el) {
      el.currentTime = Math.min(duration, currentTime + 10)
      setCurrentTime((prev) => Math.min(duration, prev + 10))
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((q) => q - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((q) => q + 1)
    }
  }

  const handlePageChange = (newPage) => {
    const page = parseInt(newPage, 10)
    if (!Number.isNaN(page) && page >= 1 && page <= totalQuestions) {
      setCurrentQuestion(page - 1)
      setEditingPage(false)
    }
  }

  const handlePageInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handlePageChange(pageInput)
    } else if (e.key === 'Escape') {
      setEditingPage(false)
      setPageInput('')
    }
  }

  const startEditingPage = () => {
    setPageInput((currentQuestion + 1).toString())
    setEditingPage(true)
  }

  return {
    audioRef,
    content,
    loading,
    isPlaying,
    setIsPlaying,
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
    setCurrentQuestion,
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
  }
}
