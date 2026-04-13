import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { lessonsService } from '../services'
import { addVocabNote } from '../utils/vocabularyUserStorage'

/**
 * Hook for Reading Lesson page: content, quiz state, notes, countdown, vocab, pagination.
 * @param {string} id - Lesson ID from route
 * @param {Function} t - i18n t function
 * @returns {Object} All state and handlers for ReadingLessonPage
 */
export function useReadingLesson(id, t) {
  const navigate = useNavigate()
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  /** Store answer per question index: { 0: 'A', 1: 'true', ... } */
  const [answers, setAnswers] = useState({})
  const [countdownSeconds, setCountdownSeconds] = useState(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteSavedMessage, setNoteSavedMessage] = useState('')
  const [editingPage, setEditingPage] = useState(false)
  const [pageInput, setPageInput] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [showIncompleteModal, setShowIncompleteModal] = useState(false)
  const [completingLesson, setCompletingLesson] = useState(false)
  const [completeMessage, setCompleteMessage] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [vocabIndex, setVocabIndex] = useState(0)
  const [showVocabTable, setShowVocabTable] = useState(false)
  const [passageLang, setPassageLang] = useState('en')
  const [highlightOn, setHighlightOn] = useState(false)
  /** Mốc mở bài (giây) để gửi timeSpent khi nộp — backend cộng vào UserSkillStats (đổi sang phút) */
  const lessonOpenedAtMs = useRef(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    // Fetch lesson content
    lessonsService
      .getReadingContent(id)
      .then((res) => {
        const data = res?.data || null
        lessonOpenedAtMs.current = Date.now()
        setContent(data)
        const est = data?.content?.estimatedTime || data?.estimatedTime || 15
        setCountdownSeconds(est * 60)
      })
      .catch(() => setContent(null))
      .finally(() => setLoading(false))

    // Load existing notes for this lesson from backend
    lessonsService
      .getProgress(id)
      .then((res) => {
        // Confirmation that progress exists
      })
      .catch((err) => console.error('Failed to load reading lesson progress:', err))
  }, [id])

  const vocabularyList = content?.vocabulary || []
  const questions = content?.questions || []
  const mockReadingContent = content?.content || {}
  const mockReadingLeaderboard = content?.leaderboard || []
  const totalQuestions = questions.length || 1
  const question = questions[currentQuestion]
  const questionOptions =
    question?.options?.length > 0
      ? question.options
      : question?.type === 'true_false'
        ? [
            { value: 'true', text: t('readingLesson.trueLabel') },
            { value: 'false', text: t('readingLesson.falseLabel') },
          ]
        : []
  const answeredCount = totalQuestions > 0
    ? questions.filter((_, i) => {
        const a = answers[i]
        return a != null && String(a).trim() !== ''
      }).length
    : 0
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0
  const currentPage = currentQuestion + 1
  const totalPages = totalQuestions
  const showPrevPages = currentPage > 2
  const showNextPages = currentPage < totalPages
  /** Current question's selected value; synced with answers[currentQuestion] */
  const selectedAnswer = answers[currentQuestion] ?? ''
  const setSelectedAnswer = (value) =>
    setAnswers((prev) => ({ ...prev, [currentQuestion]: value }))

  useEffect(() => {
    if (vocabularyList.length > 0 && vocabIndex >= vocabularyList.length) setVocabIndex(0)
  }, [vocabularyList.length, vocabIndex])

  useEffect(() => {
    if (countdownSeconds == null || countdownSeconds <= 0) return
    const interval = setInterval(() => setCountdownSeconds((s) => (s <= 0 ? 0 : s - 1)), 1000)
    return () => clearInterval(interval)
  }, [countdownSeconds])

  useEffect(() => {
    setShowHint(false)
  }, [currentQuestion])

  const handleSaveNote = () => {
    if (!id || (!noteTitle.trim() && !noteContent.trim())) return
    setNoteSaving(true)
    setNoteSavedMessage('')

    // 1. Save to local storage (match /lesson behavior)
    addVocabNote({
      title: noteTitle || `${content?.content?.title || 'Reading Note'}`,
      content: noteContent
    })

    // 2. Save to backend for cross-device sync
    lessonsService
      .addNote(id, { title: noteTitle, content: noteContent })
      .then(() => {
        setNoteSavedMessage(t('readingLesson.noteSaved'))
        setNoteTitle('')
        setNoteContent('')
        setTimeout(() => setNoteSavedMessage(''), 2500)
      })
      .catch((err) => {
        console.error('Failed to save reading note to backend:', err)
        // Still show success since it saved locally
        setNoteSavedMessage(t('readingLesson.noteSaved'))
        setNoteTitle('')
        setNoteContent('')
        setTimeout(() => setNoteSavedMessage(''), 2500)
      })
      .finally(() => setNoteSaving(false))
  }

  const handleComplete = () => {
    if (!id) return
    const allAnswered =
      totalQuestions === 0 ||
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
        : 0

    lessonsService
      .submit(id, { answers: answersPayload, timeSpent: elapsedSec })
      .then((res) => {
        const xp = res?.data?.xpEarnedThisAttempt ?? 0
        setCompleteMessage(
          xp > 0 ? t('readingLesson.completeSuccess', { xp }) : t('readingLesson.completeSuccessShort')
        )
        const redirectTo = `/lesson/reading/${id}/result`
        setTimeout(() => {
          setCompleteMessage('')
          navigate(redirectTo)
        }, 3000)
      })
      .catch(() => setCompleteMessage(t('readingLesson.completeFailed')))
      .finally(() => setCompletingLesson(false))
  }

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) setCurrentQuestion((q) => q + 1)
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion((q) => q - 1)
  }

  const handleSubmit = () => {
    handleComplete()
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

  const closeIncompleteModal = () => {
    setShowIncompleteModal(false)
  }

  return {
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
    setCurrentQuestion,
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
    setEditingPage,
    pageInput,
    setPageInput,
    showHint,
    setShowHint,
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
  }
}
