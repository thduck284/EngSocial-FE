import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { lessonsService, practicesService, rawService } from '../services'
import { sortLessonsByLevelThenSkill, } from '../utils/lesson'
import { practiceToCard } from '../utils/practice'

// ─── useLessonsList ────────────────────────────────────────────────────────────

export function useLessonsList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const skillFilter = searchParams.get('skill') || 'all'
  const topicFilter = searchParams.get('topic') || 'all'
  const levelFilter = searchParams.get('level') || 'all'

  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    perPage: 10,
    total: 0,
    totalPages: 0,
  })
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const filters = { status: 'published', page, limit: 10, category: 'lesson' }
    if (skillFilter && skillFilter !== 'all') filters.skill = skillFilter
    if (topicFilter && topicFilter !== 'all') filters.topic = topicFilter
    if (levelFilter && levelFilter !== 'all') filters.level = levelFilter

    setError(null)
    setLoading(true)
    lessonsService
      .getLessons(filters)
      .then((res) => {
        const data = res?.data || []
        const meta = res?.meta?.pagination
        const list = data.length > 0 ? sortLessonsByLevelThenSkill(data) : []
        setLessons(list)
        if (meta) {
          setPagination((p) => ({
            ...p,
            perPage: meta.perPage,
            total: meta.total,
            totalPages: meta.totalPages,
          }))
        }
      })
      .catch((err) => {
        setLessons([])
        setError(err?.message || 'Failed to load lessons')
      })
      .finally(() => setLoading(false))
  }, [skillFilter, topicFilter, levelFilter, page])

  const setSkill = (key) => {
    setPage(1)
    const params = {}
    if (key !== 'all') params.skill = key
    if (topicFilter !== 'all') params.topic = topicFilter
    if (levelFilter !== 'all') params.level = levelFilter
    setSearchParams(params)
  }

  const setTopic = (key) => {
    setPage(1)
    const params = {}
    if (skillFilter !== 'all') params.skill = skillFilter
    if (key !== 'all') params.topic = key
    if (levelFilter !== 'all') params.level = levelFilter
    setSearchParams(params)
  }

  const setLevel = (key) => {
    setPage(1)
    const params = {}
    if (skillFilter !== 'all') params.skill = skillFilter
    if (topicFilter !== 'all') params.topic = topicFilter
    if (key !== 'all') params.level = key
    setSearchParams(params)
  }

  const handleDeleteLesson = async (lesson, confirmMessage, onDone) => {
    if (!lesson?.id) return
    if (!window.confirm(confirmMessage)) return
    setDeletingId(lesson.id)
    try {
      await lessonsService.delete(lesson.id)
      setLessons((prev) => prev.filter((l) => l.id !== lesson.id))
      onDone?.()
    } catch (e) {
      console.error(e)
    } finally {
      setDeletingId(null)
    }
  }

  return {
    skillFilter,
    topicFilter,
    levelFilter,
    lessons,
    loading,
    error,
    page,
    setPage,
    pagination,
    setSkill,
    setTopic,
    setLevel,
    setLessons,
    handleDeleteLesson,
    deletingId,
  }
}

// ─── useSkillPractices ────────────────────────────────────────────────────────

export function useSkillPractices(skill, t) {
  const [practices, setPractices] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    perPage: 6,
    total: 0,
    totalPages: 0,
  })
  const [deletingId, setDeletingId] = useState(null)
  const [rawData, setRawData] = useState({
    friendsOnline: {},
    achievementsBySkill: {},
    hotGames: [],
    filters: [],
    challenge: {},
    cards: [],
  })
  const [filterLevel, setFilterLevel] = useState('')
  const [filterTopic, setFilterTopic] = useState('')
  const [appliedLevel, setAppliedLevel] = useState('')
  const [appliedTopic, setAppliedTopic] = useState('')

  useEffect(() => {
    practicesService
      .getFallback(skill)
      .then((res) => {
        const d = res?.data || {}
        setRawData((prev) => ({
          ...prev,
          filters: d.filters || [],
          challenge: d.challenge || {},
          cards: d.cards || [],
        }))
      })
      .catch(() => {})

    rawService
      .getFriends()
      .then((res) => {
        const d = res?.data || {}
        setRawData((prev) => ({
          ...prev,
          friendsOnline: d.friendsOnline || {},
          achievementsBySkill: d.achievementsBySkill || {},
        }))
      })
      .catch(() => {})

    rawService
      .getGames()
      .then((res) => {
        const d = res?.data || {}
        setRawData((prev) => ({ ...prev, hotGames: d.hotGames || [] }))
      })
      .catch(() => {})
  }, [skill])

  useEffect(() => {
    setPage(1)
  }, [skill])

  const handleApplyFilters = () => {
    setAppliedLevel(filterLevel)
    setAppliedTopic(filterTopic)
    setPage(1)
  }

  const handleResetFilters = () => {
    setFilterLevel('')
    setFilterTopic('')
    setAppliedLevel('')
    setAppliedTopic('')
    setPage(1)
  }

  const handleDeletePractice = async (card) => {
    if (!card?.id) return
    if (!window.confirm(t('skills.confirmDeletePractice', { title: card.title }))) return
    setDeletingId(card.id)
    try {
      await lessonsService.delete(card.id)
      setPractices((prev) => prev.filter((p) => p.id !== card.id))
    } catch (e) {
      console.error(e)
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    setLoading(true)
    const params = { skill, status: 'published', page, limit: 6 }
    if (appliedLevel) params.level = appliedLevel
    if (appliedTopic) params.topic = appliedTopic
    practicesService
      .getPractices(params)
      .then((res) => {
        const data = Array.isArray(res?.data) ? res.data : res?.data?.data ?? []
        const meta = res?.meta?.pagination ?? res?.data?.meta?.pagination
        setPractices(data)
        if (meta) {
          setPagination({
            perPage: meta.perPage,
            total: meta.total,
            totalPages: meta.totalPages,
          })
        } else {
          setPagination((prev) => ({
            ...prev,
            total: data.length,
            totalPages: data.length > 0 ? 1 : 0,
          }))
        }
      })
      .catch((err) => {
        console.error('getPractices error', err)
        setPractices([])
      })
      .finally(() => setLoading(false))
  }, [skill, page, appliedLevel, appliedTopic])

  const fallbackCards = rawData.cards
  const cards =
    practices.length > 0 ? practices.map((p) => practiceToCard(p, skill)) : fallbackCards

  return {
    practices,
    setPractices,
    loading,
    page,
    setPage,
    pagination,
    filterLevel,
    setFilterLevel,
    filterTopic,
    setFilterTopic,
    appliedLevel,
    appliedTopic,
    handleApplyFilters,
    handleResetFilters,
    handleDeletePractice,
    deletingId,
    rawData,
    cards,
  }
}
