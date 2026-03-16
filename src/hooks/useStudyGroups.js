import { useState, useEffect } from 'react'
import { conversationService } from '../services'

/**
 * Study groups: load group conversations from API, modal open state.
 * setGroupConversations is exposed so useDashboardSocket can update online status.
 */
export function useStudyGroups() {
  const [groupConversations, setGroupConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [showStudyGroupsModal, setShowStudyGroupsModal] = useState(false)

  const loadGroupConversations = () => {
    setLoading(true)
    conversationService
      .getList()
      .then((res) => {
        const raw = res?.data
        const list = Array.isArray(raw) ? raw : (raw?.data && Array.isArray(raw.data) ? raw.data : [])
        const groups = list.filter((c) => c.isGroup === true || c.type === 'group')
        setGroupConversations(groups)
      })
      .catch(() => setGroupConversations([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadGroupConversations()
  }, [])

  const openStudyGroupsModal = () => setShowStudyGroupsModal(true)

  return {
    groupConversations,
    setGroupConversations,
    groupConversationsLoading: loading,
    loadGroupConversations,
    showStudyGroupsModal,
    setShowStudyGroupsModal,
    openStudyGroupsModal,
  }
}
