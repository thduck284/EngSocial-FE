import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { lessonsService } from '../services'
import { SPEED_OPTIONS } from '../constants/lessons'
import { formatTime } from '../utils/dateTime'

/**
 * Hook for Listening Lesson page: content, audio playback, quiz state, notes, countdown, vocab, pagination.
 * @param {string} id - Lesson ID from route
 * @param {Function} t - i18n t function
 * @returns {Object} All state and handlers including audioRef for <audio>
 */
export function useListeningLesson(id, t) {
  const audioRef = useRef(null)

  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(75)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showTranscript, setShowTranscript] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteCategory, setNoteCategory] = useState('grammar')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteSavedMessage, setNoteSavedMessage] = useState('')
  const [completingLesson, setCompletingLesson] = useState(false)
  const [completeMessage, setCompleteMessage] = useState('')
  const [saveDraftMessage, setSaveDraftMessage] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [editingPage, setEditingPage] = useState(false)
  const [pageInput, setPageInput] = useState('')
  const [countdownSeconds, setCountdownSeconds] = useState(null)
  const [vocabIndex, setVocabIndex] = useState(0)
  const [showVocabTable, setShowVocabTable] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    lessonsService
      .getListeningContent(id)
      .then((res) => {
        const data = res?.data || null
        setContent(data)
        if (data?.duration) setDuration(data.duration)
        if (data?.totalQuestions) setCurrentQuestion(0)
        const initialCountdown = (data?.estimatedTime || 5) * 60
        setCountdownSeconds(initialCountdown)
      })
      .catch(() => setContent(null))
      .finally(() => setLoading(false))
  }, [id])

  const vocabularyList = content?.vocabulary || []
  const lessonChapters = content?.chapters || []
  const vocabCard = content?.vocabCard || {}
  const leaderboard = content?.leaderboard || []
  const questions = content?.questions || []
  const totalQuestions = Math.max(1, content?.totalQuestions || questions.length)
  const currentQ = questions[currentQuestion]
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
    if (!id) return
    setNoteSaving(true)
    setNoteSavedMessage('')
    lessonsService
      .addNote(id, { title: noteTitle, content: noteContent, category: noteCategory })
      .then(() => {
        setNoteSavedMessage(t('listeningLesson.noteSaved'))
        setNoteTitle('')
        setNoteContent('')
        setTimeout(() => setNoteSavedMessage(''), 2500)
      })
      .catch(() => setNoteSavedMessage(''))
      .finally(() => setNoteSaving(false))
  }

  const handleComplete = () => {
    if (!id) return
    setCompletingLesson(true)
    setCompleteMessage('')
    lessonsService
      .complete(id)
      .then((res) => {
        const xp = res?.data?.xpEarned
        setCompleteMessage(
          xp != null ? t('listeningLesson.completeSuccess', { xp }) : t('listeningLesson.completeSuccessShort')
        )
        const fromPractice = location.pathname.startsWith('/practice/')
        const redirectTo = fromPractice ? '/practice' : '/lesson'
        setTimeout(() => {
          setCompleteMessage('')
          navigate(redirectTo)
        }, 3000)
      })
      .catch(() => setCompleteMessage(t('listeningLesson.completeFailed')))
      .finally(() => setCompletingLesson(false))
  }

  const handleSaveDraft = () => {
    if (!id) return
    lessonsService
      .updateProgress(id, { status: 'in_progress' })
      .then(() => {
        setSaveDraftMessage(t('listeningLesson.saveDraftSuccess'))
        setTimeout(() => setSaveDraftMessage(''), 2500)
      })
      .catch(() => {})
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
      setSelectedAnswer('')
    }
  }

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((q) => q + 1)
      setSelectedAnswer('')
    }
  }

  const handlePageChange = (newPage) => {
    const page = parseInt(newPage, 10)
    if (!Number.isNaN(page) && page >= 1 && page <= totalQuestions) {
      setCurrentQuestion(page - 1)
      setSelectedAnswer('')
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
  }
}
