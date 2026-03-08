import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { lessonsService } from '../services'
import { sortLessonsByLevelThenSkill } from '../utils/lesson'

/**
 * Hook for lessons list page: fetch lessons with filters, pagination, and filter setters.
 * @param {Object} options - { skillFilter, topicFilter, levelFilter, page }
 * @returns {Object} lessons, loading, pagination, setSkill, setTopic, setLevel, handleDeleteLesson, deletingId
 */
export function useLessonsList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const skillFilter = searchParams.get('skill') || 'all'
  const topicFilter = searchParams.get('topic') || 'all'
  const levelFilter = searchParams.get('level') || 'all'

  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ perPage: 10, total: 0, totalPages: 0 })
  const [deletingId, setDeletingId] = useState(null)

  const prevFilters = useRef({ skillFilter, topicFilter, levelFilter })
  useEffect(() => {
    if (
      prevFilters.current.skillFilter !== skillFilter ||
      prevFilters.current.topicFilter !== topicFilter ||
      prevFilters.current.levelFilter !== levelFilter
    ) {
      prevFilters.current = { skillFilter, topicFilter, levelFilter }
      setPage(1)
      return
    }
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
        if (meta) setPagination((p) => ({ ...p, perPage: meta.perPage, total: meta.total, totalPages: meta.totalPages }))
      })
      .catch((err) => {
        setLessons([])
        setError(err?.message || 'Failed to load lessons')
      })
      .finally(() => setLoading(false))
  }, [skillFilter, topicFilter, levelFilter, page, pagination.perPage])

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
