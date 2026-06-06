import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { lessonsService, practicesService, rawService } from '../services'
import { sortLessonsByLevelThenSkill, } from '../utils/lesson'
import { practiceToCard } from '../utils/practice'
import { isGuestSession } from '../utils/guestAuth'

// ─── useLessonsList ────────────────────────────────────────────────────────────

export function useLessonsList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const skillFilter = searchParams.get('skill') || 'all'
  const topicFilter = searchParams.get('topic') || 'all'
  const levelFilter = searchParams.get('level') || 'all'
  const titleFilter = searchParams.get('title') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)

  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    perPage: 10,
    total: 0,
    totalPages: 0,
  })
  const [deletingId, setDeletingId] = useState(null)
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set())
  const [topicOptions, setTopicOptions] = useState([])

  useEffect(() => {
    const params = { status: 'published', category: 'lesson' }
    if (skillFilter && skillFilter !== 'all') params.skill = skillFilter
    lessonsService
      .getTopics(params)
      .then((res) => setTopicOptions(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setTopicOptions([]))
  }, [skillFilter])

  useEffect(() => {
    const filters = { status: 'published', page, limit: 10, category: 'lesson' }
    if (skillFilter && skillFilter !== 'all') filters.skill = skillFilter
    if (topicFilter && topicFilter !== 'all') filters.topic = topicFilter
    if (levelFilter && levelFilter !== 'all') filters.level = levelFilter
    if (titleFilter) filters.title = titleFilter

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
          setPagination({
            perPage: meta.perPage,
            total: meta.total,
            totalPages: meta.totalPages,
          })
          if (meta.totalPages > 0 && page > meta.totalPages) {
            setSearchParams((prev) => {
              const params = Object.fromEntries(prev.entries())
              if (meta.totalPages <= 1) delete params.page
              else params.page = String(meta.totalPages)
              return params
            })
          }
        } else {
          setPagination({ perPage: 10, total: 0, totalPages: 0 })
        }
      })
      .catch((err) => {
        setLessons([])
        setError(err?.message || 'Failed to load lessons')
      })
      .finally(() => setLoading(false))
  }, [skillFilter, topicFilter, levelFilter, titleFilter, page, setSearchParams])

  const goToPage = (next) => {
    const target = Math.max(1, typeof next === 'function' ? next(page) : next)
    setSearchParams((prev) => {
      const params = Object.fromEntries(prev.entries())
      if (target <= 1) delete params.page
      else params.page = String(target)
      return params
    })
  }

  const resetFiltersPage = (params) => {
    delete params.page
    return params
  }

  useEffect(() => {
    if (isGuestSession()) {
      setCompletedLessonIds(new Set())
      return
    }
    const params = { status: 'completed', category: 'lesson', page: 1, limit: 200 }
    if (skillFilter && skillFilter !== 'all') params.skill = skillFilter
    lessonsService
      .getMyProgress(params)
      .then((res) => {
        const list = res?.data?.data ?? res?.data ?? []
        const isPerfectResult = (item) => {
          const progress = Number(item?.progress)
          if (Number.isFinite(progress)) return progress >= 100
          const score = Number(item?.score)
          const maxScore = Number(item?.maxScore)
          return Number.isFinite(score) && Number.isFinite(maxScore) && maxScore > 0 && score >= maxScore * 0.8
        }
        const ids = new Set(
          (Array.isArray(list) ? list : [])
            .filter((item) => isPerfectResult(item))
            .map((item) => item?.lesson?.id || item?.lessonId)
            .filter(Boolean)
            .map(String)
        )
        setCompletedLessonIds(ids)
      })
      .catch(() => setCompletedLessonIds(new Set()))
  }, [skillFilter])

  const setSkill = (key) => {
    const params = resetFiltersPage(Object.fromEntries(searchParams.entries()))
    if (key === 'all') delete params.skill
    else params.skill = key
    setSearchParams(params)
  }

  const setTopic = (key) => {
    const params = resetFiltersPage(Object.fromEntries(searchParams.entries()))
    if (key === 'all') delete params.topic
    else params.topic = key
    setSearchParams(params)
  }

  useEffect(() => {
    if (topicFilter === 'all') return
    if (topicOptions.length === 0) return
    if (!topicOptions.includes(topicFilter)) {
      setSearchParams((prev) => {
        const params = resetFiltersPage(Object.fromEntries(prev.entries()))
        delete params.topic
        return params
      })
    }
  }, [topicOptions, topicFilter, setSearchParams])

  const setLevel = (key) => {
    const params = resetFiltersPage(Object.fromEntries(searchParams.entries()))
    if (key === 'all') delete params.level
    else params.level = key
    setSearchParams(params)
  }

  const setTitle = (val) => {
    const params = resetFiltersPage(Object.fromEntries(searchParams.entries()))
    if (!val) delete params.title
    else params.title = val
    setSearchParams(params)
  }

  const handleDeleteLesson = async (lesson, confirmMessage, onDone) => {
    if (!lesson?.id) return
    if (confirmMessage && !window.confirm(confirmMessage)) return
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
    setPage: goToPage,
    pagination,
    setSkill,
    setTopic,
    setLevel,
    setTitle,
    setLessons,
    handleDeleteLesson,
    deletingId,
    completedLessonIds,
    topicOptions,
  }
}

// ─── useSkillPractices ────────────────────────────────────────────────────────

export function useSkillPractices(skill, t) {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const appliedLevel = searchParams.get('level') || ''
  const appliedTopic = searchParams.get('topic') || ''
  const appliedTitle = searchParams.get('title') || ''

  const [practices, setPractices] = useState([])
  const [loading, setLoading] = useState(true)
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
  const [filterLevel, setFilterLevel] = useState(appliedLevel)
  const [filterTopic, setFilterTopic] = useState(appliedTopic)
  const [filterTitle, setFilterTitle] = useState(appliedTitle)
  const [completedPracticeIds, setCompletedPracticeIds] = useState(new Set())
  const [topicOptions, setTopicOptions] = useState([])

  useEffect(() => {
    setFilterLevel(appliedLevel)
    setFilterTopic(appliedTopic)
    setFilterTitle(appliedTitle)
  }, [appliedLevel, appliedTopic, appliedTitle])

  useEffect(() => {
    if (!skill || skill === 'entertainment') {
      setTopicOptions([])
      return
    }
    lessonsService
      .getTopics({ status: 'published', category: 'practice', skill })
      .then((res) => setTopicOptions(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setTopicOptions([]))
  }, [skill])

  useEffect(() => {
    if (!appliedTopic) return
    if (topicOptions.length === 0) return
    if (!topicOptions.includes(appliedTopic)) {
      setSearchParams((prev) => {
        const params = Object.fromEntries(prev.entries())
        delete params.topic
        delete params.page
        return params
      })
      setFilterTopic('')
    }
  }, [topicOptions, appliedTopic, setSearchParams])

  useEffect(() => {
    if (filterTopic && topicOptions.length > 0 && !topicOptions.includes(filterTopic)) {
      setFilterTopic('')
    }
  }, [topicOptions, filterTopic])

  const prevSkillRef = useRef(skill)
  useEffect(() => {
    if (prevSkillRef.current === skill) return
    prevSkillRef.current = skill
    setFilterLevel('')
    setFilterTopic('')
    setFilterTitle('')
    setSearchParams({})
  }, [skill, setSearchParams])

  const goToPage = (next) => {
    const target = Math.max(1, typeof next === 'function' ? next(page) : next)
    setSearchParams((prev) => {
      const params = Object.fromEntries(prev.entries())
      if (target <= 1) delete params.page
      else params.page = String(target)
      return params
    })
  }

  const writeFiltersToUrl = (level, topic, title) => {
    setSearchParams(() => {
      const params = {}
      if (level) params.level = level
      if (topic) params.topic = topic
      if (title) params.title = title
      return params
    })
  }

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
    if (isGuestSession()) {
      setCompletedPracticeIds(new Set())
      return
    }
    const params = { status: 'completed', category: 'practice', skill, page: 1, limit: 200 }
    lessonsService
      .getMyProgress(params)
      .then((res) => {
        const list = res?.data?.data ?? res?.data ?? []
        const isPerfectResult = (item) => {
          const progress = Number(item?.progress)
          if (Number.isFinite(progress)) return progress >= 100
          const score = Number(item?.score)
          const maxScore = Number(item?.maxScore)
          return Number.isFinite(score) && Number.isFinite(maxScore) && maxScore > 0 && score >= maxScore * 0.8
        }
        const ids = new Set(
          (Array.isArray(list) ? list : [])
            .filter((item) => isPerfectResult(item))
            .map((item) => item?.lesson?.id || item?.lessonId)
            .filter(Boolean)
            .map(String)
        )
        setCompletedPracticeIds(ids)
      })
      .catch(() => setCompletedPracticeIds(new Set()))
  }, [skill])

  const handleApplyFilters = () => {
    writeFiltersToUrl(filterLevel, filterTopic, filterTitle)
  }

  const handleResetFilters = () => {
    setFilterLevel('')
    setFilterTopic('')
    setFilterTitle('')
    setSearchParams({})
  }

  const handleDeletePractice = async (card, confirmMessage) => {
    if (!card?.id) return
    if (confirmMessage && !window.confirm(confirmMessage)) return
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
    if (skill === 'entertainment') {
      setLoading(false)
      setPractices([])
      setPagination({ perPage: 6, total: 0, totalPages: 0 })
      return
    }

    setLoading(true)
    const params = { skill, status: 'published', page, limit: 6, category: 'practice' }
    if (appliedLevel) params.level = appliedLevel
    if (appliedTopic) params.topic = appliedTopic
    if (appliedTitle) params.title = appliedTitle
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
          if (meta.totalPages > 0 && page > meta.totalPages) {
            setSearchParams((prev) => {
              const next = Object.fromEntries(prev.entries())
              if (meta.totalPages <= 1) delete next.page
              else next.page = String(meta.totalPages)
              return next
            })
          }
        } else {
          setPagination({
            perPage: 6,
            total: data.length,
            totalPages: data.length > 0 ? 1 : 0,
          })
        }
      })
      .catch((err) => {
        console.error('getPractices error', err)
        setPractices([])
        setPagination({ perPage: 6, total: 0, totalPages: 0 })
      })
      .finally(() => setLoading(false))
  }, [skill, page, appliedLevel, appliedTopic, appliedTitle, setSearchParams])

  const fallbackCards = rawData.cards
  const apiCards =
    practices.length > 0
      ? practices.map((p) => {
          const card = practiceToCard(p, skill)
          return { ...card, isCompleted: completedPracticeIds.has(String(card.id)) }
        })
      : []

  const useFallback =
    skill !== 'entertainment' &&
    !loading &&
    apiCards.length === 0 &&
    pagination.total === 0 &&
    !appliedLevel &&
    !appliedTopic &&
    !appliedTitle &&
    page === 1 &&
    fallbackCards.length > 0

  const cards = useFallback ? fallbackCards : apiCards

  return {
    practices,
    setPractices,
    loading,
    page,
    setPage: goToPage,
    pagination,
    filterLevel,
    setFilterLevel,
    filterTopic,
    setFilterTopic,
    filterTitle,
    setFilterTitle,
    appliedLevel,
    appliedTopic,
    appliedTitle,
    handleApplyFilters,
    handleResetFilters,
    handleDeletePractice,
    deletingId,
    rawData,
    cards,
    completedPracticeIds,
    topicOptions,
  }
}
