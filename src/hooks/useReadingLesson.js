import { useState, useEffect } from 'react'
import { lessonsService } from '../services'

/**
 * Hook for Reading Lesson page: content, quiz state, notes, countdown, vocab, pagination.
 * @param {string} id - Lesson ID from route
 * @param {Function} t - i18n t function
 * @returns {Object} All state and handlers for ReadingLessonPage
 */
export function useReadingLesson(id, t) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [countdownSeconds, setCountdownSeconds] = useState(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteCategory, setNoteCategory] = useState('grammar')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteSavedMessage, setNoteSavedMessage] = useState('')
  const [editingPage, setEditingPage] = useState(false)
  const [pageInput, setPageInput] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [completingLesson, setCompletingLesson] = useState(false)
  const [completeMessage, setCompleteMessage] = useState('')
  const [saveDraftMessage, setSaveDraftMessage] = useState('')
  const [vocabIndex, setVocabIndex] = useState(0)
  const [showVocabTable, setShowVocabTable] = useState(false)
  const [passageLang, setPassageLang] = useState('en')
  const [highlightOn, setHighlightOn] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    lessonsService
      .getReadingContent(id)
      .then((res) => {
        const data = res?.data || null
        setContent(data)
        const est = data?.content?.estimatedTime || 15
        setCountdownSeconds(est * 60)
      })
      .catch(() => setContent(null))
      .finally(() => setLoading(false))
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
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0
  const currentPage = currentQuestion + 1
  const totalPages = totalQuestions
  const showPrevPages = currentPage > 3
  const showNextPages = currentPage < totalPages - 2

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
    if (!id) return
    setNoteSaving(true)
    setNoteSavedMessage('')
    lessonsService
      .addNote(id, { title: noteTitle, content: noteContent, category: noteCategory })
      .then(() => {
        setNoteSavedMessage(t('readingLesson.noteSaved'))
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
          xp != null ? t('readingLesson.completeSuccess', { xp }) : t('readingLesson.completeSuccessShort')
        )
        setTimeout(() => setCompleteMessage(''), 3000)
      })
      .catch(() => setCompleteMessage(t('readingLesson.completeFailed')))
      .finally(() => setCompletingLesson(false))
  }

  const handleSaveDraft = () => {
    if (!id) return
    lessonsService
      .updateProgress(id, { status: 'in_progress' })
      .then(() => {
        setSaveDraftMessage(t('readingLesson.saveDraftSuccess'))
        setTimeout(() => setSaveDraftMessage(''), 2500)
      })
      .catch(() => {})
  }

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((q) => q + 1)
      setSelectedAnswer('')
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((q) => q - 1)
      setSelectedAnswer('')
    }
  }

  const handleSubmit = () => {
    // TODO: Submit answers
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
    noteCategory,
    setNoteCategory,
    noteSaving,
    noteSavedMessage,
    handleSaveNote,
    editingPage,
    setEditingPage,
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
  }
}
