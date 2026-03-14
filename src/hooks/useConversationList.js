import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { ROUTES } from '../constants'
import { useAuth } from '../context/AuthContext'
import { conversationService, friendsService } from '../services'
import { formatConversationTime } from '../utils/messages'

/**
 * Hook quản lý danh sách hội thoại: load, filter, tab, tìm bạn để chat, tạo nhóm.
 */
export function useConversationList() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { conversationId: conversationIdParam } = useParams()

  const currentUserId = user?.id ?? user?._id
  const selectedId = conversationIdParam ?? null

  const [conversations, setConversations] = useState([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [searchConversations, setSearchConversations] = useState('')
  const [friendsSearchResult, setFriendsSearchResult] = useState([])
  const [friendsSearchLoading, setFriendsSearchLoading] = useState(false)
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)

  const friendsSearchQueryRef = useRef('')

  const normalizeLastMessage = useCallback(
    (text) => {
      if (!text || typeof text !== 'string') return ''
      if (/^\[\d+\s*file\]$/i.test(String(text).trim())) return t('messages.attachedFile')
      return String(text)
    },
    [t]
  )

  const loadConversations = useCallback(() => {
    if (!currentUserId) return
    setConversationsLoading(true)
    conversationService
      .getList()
      .then((res) => {
        const list = res?.data ?? []
        setConversations(
          list.map((c) => ({
            ...c,
            lastMessage: normalizeLastMessage(c.lastMessage),
            time: formatConversationTime(c.lastMessageAt),
            isGroup: c.isGroup ?? false,
          }))
        )
      })
      .catch(() => setConversations([]))
      .finally(() => setConversationsLoading(false))
  }, [currentUserId, normalizeLastMessage])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const searchQ = searchConversations.trim().toLowerCase()
  const filteredConversations = useMemo(() => {
    const list = conversations.filter((c) => {
      if (!searchQ) return true
      const nameMatch = (c.name || '').toLowerCase().includes(searchQ)
      const lastMsgMatch = (c.lastMessage || '').toLowerCase().includes(searchQ)
      return nameMatch || lastMsgMatch
    })
    return list.slice().sort((a, b) => (new Date(b.lastMessageAt) || 0) - (new Date(a.lastMessageAt) || 0))
  }, [conversations, searchQ])

  useEffect(() => {
    if (!searchQ) {
      friendsSearchQueryRef.current = ''
      setFriendsSearchResult([])
      setFriendsSearchLoading(false)
      return
    }
    const timer = setTimeout(() => {
      const q = searchConversations.trim()
      friendsSearchQueryRef.current = q
      setFriendsSearchLoading(true)
      friendsService
        .search({ q, limit: 10, friendFilter: 'connected' })
        .then((res) => {
          if (friendsSearchQueryRef.current !== q) return
          const list = Array.isArray(res?.data) ? res.data : res?.data?.data ?? []
          setFriendsSearchResult(list)
        })
        .catch(() => {
          if (friendsSearchQueryRef.current === q) setFriendsSearchResult([])
        })
        .finally(() => {
          if (friendsSearchQueryRef.current === q) setFriendsSearchLoading(false)
        })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchConversations, searchQ])

  const withUserIdFromUrl = searchParams.get('with')
  const withUserFromState = location.state?.withUser
  const withUserId =
    withUserIdFromUrl != null && withUserIdFromUrl !== ''
      ? String(withUserIdFromUrl)
      : withUserFromState?.id != null
        ? String(withUserFromState.id)
        : null

  const handleSelectFriendToChat = useCallback(
    (userId) => {
      setSearchConversations('')
      setSearchParams({ with: userId }, { replace: true })
    },
    [setSearchParams]
  )

  const handleCreateGroupSuccess = useCallback(
    (conversationId) => {
      setShowCreateGroupModal(false)
      setConversationsLoading(true)
      conversationService
        .getList()
        .then((res) => {
          const list = res?.data ?? []
          setConversations(
            list.map((c) => ({
              ...c,
              lastMessage: normalizeLastMessage(c.lastMessage),
              time: formatConversationTime(c.lastMessageAt),
              isGroup: c.isGroup ?? false,
            }))
          )
        })
        .catch(() => {})
        .finally(() => {
          setConversationsLoading(false)
          navigate(ROUTES.MESSAGES_CONVERSATION(conversationId), { replace: true, state: {} })
        })
    },
    [normalizeLastMessage, formatConversationTime, navigate]
  )

  return {
    conversations,
    setConversations,
    conversationsLoading,
    loadConversations,
    filteredConversations,
    tab,
    setTab,
    searchConversations,
    setSearchConversations,
    friendsSearchResult,
    friendsSearchLoading,
    handleSelectFriendToChat,
    withUserId,
    showCreateGroupModal,
    setShowCreateGroupModal,
    handleCreateGroupSuccess,
    selectedId,
    currentUserId,
    normalizeLastMessage,
    withUserId,
  }
}
