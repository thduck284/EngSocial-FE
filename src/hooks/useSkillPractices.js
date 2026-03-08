import { useState, useEffect } from 'react'
import { practicesService, rawService, lessonsService } from '../services'
import { practiceToCard } from '../utils/practice'

/**
 * Hook for Skill Practice page: practices list, filters, pagination, raw dashboard data, delete.
 * @param {string} skill - 'reading' | 'listening' | 'writing' from route
 * @param {Function} t - i18n t function
 * @returns {Object} practices, cards, loading, page, setPage, pagination, filters, handleApplyFilters, handleResetFilters, handleDeletePractice, deletingId, rawData
 */
export function useSkillPractices(skill, t) {
  const [practices, setPractices] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ perPage: 6, total: 0, totalPages: 0 })
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
  const cards = practices.length > 0 ? practices.map((p) => practiceToCard(p, skill)) : fallbackCards

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
