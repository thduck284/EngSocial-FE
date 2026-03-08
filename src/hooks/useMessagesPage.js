import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { ROUTES } from '../constants'
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api'
import { useAuth } from '../context/AuthContext'
import { conversationService, friendsService } from '../services'
import { searchGiphy as giphySearch, hasGiphyKey } from '../services/giphy.service'
import { getAuthToken } from '../utils/auth'
import { getMessageEmojiCategories } from '../utils/emoji'
import {
  formatConversationTime,
  mapApiMessagesToUi,
  extractRightBarMedia,
  extractRightBarFiles,
  extractRightBarLinks,
  RIGHT_BAR_MEDIA_INITIAL,
  RIGHT_BAR_FILES_INITIAL,
  RIGHT_BAR_LINKS_INITIAL,
} from '../utils/messages'

const SETTINGS_FOREVER_MS = 10 * 365 * 24 * 60 * 60 * 1000

export function useMessagesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { conversationId: conversationIdParam } = useParams()
  const selectedId = conversationIdParam ?? null

  const [tab, setTab] = useState('all')
  const [searchConversations, setSearchConversations] = useState('')
  const [friendsSearchResult, setFriendsSearchResult] = useState([])
  const [friendsSearchLoading, setFriendsSearchLoading] = useState(false)
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [inputText, setInputText] = useState('')
  const [withUserLoading, setWithUserLoading] = useState(false)
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [sendLoading, setSendLoading] = useState(false)

  const messagesEndRef = useRef(null)
  const messagesScrollRef = useRef(null)
  const lastMessageIdRef = useRef(null)
  const socketRef = useRef(null)
  const selectedIdRef = useRef(selectedId)
  const selectedNameRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const gifInputRef = useRef(null)
  const textareaRef = useRef(null)
  const gifPickerRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const messageMenuRef = useRef(null)
  const editingMessageRef = useRef(null)

  const [openMessageMenuId, setOpenMessageMenuId] = useState(null)
  const [editingMessage, setEditingMessage] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [emojiCategoryId, setEmojiCategoryId] = useState('faces')
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [gifQuery, setGifQuery] = useState('')
  const [gifResults, setGifResults] = useState([])
  const [gifLoading, setGifLoading] = useState(false)
  const [imageViewer, setImageViewer] = useState(null)
  const [openReactionPickerId, setOpenReactionPickerId] = useState(null)
  const [openReactionDetailMessageId, setOpenReactionDetailMessageId] = useState(null)
  const [selectedReactionEmojiInModal, setSelectedReactionEmojiInModal] = useState(null)
  const [rightBarMediaVisible, setRightBarMediaVisible] = useState(RIGHT_BAR_MEDIA_INITIAL)
  const [rightBarFilesVisible, setRightBarFilesVisible] = useState(RIGHT_BAR_FILES_INITIAL)
  const [rightBarLinksVisible, setRightBarLinksVisible] = useState(RIGHT_BAR_LINKS_INITIAL)
  const [loadMoreMedia, setLoadMoreMedia] = useState(false)
  const [loadMoreFiles, setLoadMoreFiles] = useState(false)
  const [loadMoreLinks, setLoadMoreLinks] = useState(false)
  const [showNewMessageBanner, setShowNewMessageBanner] = useState(false)
  const [reactionNotification, setReactionNotification] = useState(null)
  const [openSettingsMenu, setOpenSettingsMenu] = useState(null)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)

  const currentUserId = user?.id ?? user?._id
  selectedIdRef.current = selectedId
  const selected = useMemo(() => conversations.find((c) => c.id === selectedId), [conversations, selectedId])
  selectedNameRef.current = selected?.name ?? null

  const normalizeLastMessage = useCallback(
    (text) => {
      if (!text || typeof text !== 'string') return ''
      if (/^\[\d+\s*file\]$/i.test(String(text).trim())) return t('messages.attachedFile')
      return String(text)
    },
    [t]
  )
  const displayLastMessage = useCallback(
    (msg) => {
      if (!msg) return ''
      if (msg === '[GIF]' || msg === 'GIF') return t('messages.gif')
      if (msg === 'Attached file(s)' || msg === 'File đính kèm') return t('messages.attachedFile')
      if (/^\[\d+\s*file\]$/i.test(String(msg).trim())) return t('messages.attachedFile')
      return msg
    },
    [t]
  )

  const getSettingsUntil = useCallback((key) => {
    if (key === null) return null
    if (key === '1h') return new Date(Date.now() + 60 * 60 * 1000).toISOString()
    if (key === '8h') return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
    if (key === '24h') return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    if (key === 'forever') return new Date(Date.now() + SETTINGS_FOREVER_MS).toISOString()
    return null
  }, [])
  const getDisappearingDurationSeconds = useCallback((key) => {
    if (key === '1h') return 3600
    if (key === '8h') return 28800
    if (key === '24h' || key === 'forever') return 86400
    return null
  }, [])

  const searchGiphy = useCallback(async (query) => {
    if (!hasGiphyKey) {
      setGifLoading(false)
      setGifResults([])
      return
    }
    setGifLoading(true)
    setGifResults([])
    try {
      const list = await giphySearch(query)
      setGifResults(list)
    } catch {
      setGifResults([])
    } finally {
      setGifLoading(false)
    }
  }, [])

  const sendGif = useCallback(
    (gifUrl) => {
      if (!selectedId || sendLoading) return
      setSendLoading(true)
      setShowGifPicker(false)
      conversationService
        .sendMessage(selectedId, '', null, [{ url: gifUrl, name: 'GIF', type: 'image/gif' }])
        .then((res) => {
          const msg = res?.data
          if (!msg) return
          const ui = {
            id: msg.id,
            fromMe: true,
            text: '',
            time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
            read: false,
            attachments: Array.isArray(msg.attachments) ? msg.attachments : msg.attachment?.url ? [msg.attachment] : [],
          }
          setMessages((prev) => [...prev, ui])
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedId
                ? { ...c, lastMessage: '[GIF]', lastMessageAt: msg.createdAt, time: formatConversationTime(msg.createdAt), lastMessageFromMe: true, lastMessageSeen: false }
                : c
            )
          )
        })
        .catch(() => {})
        .finally(() => setSendLoading(false))
    },
    [selectedId, sendLoading]
  )

  const applyConversationSettings = useCallback(
    (payload) => {
      if (!selectedId) return
      conversationService
        .updateSettings(selectedId, payload)
        .then((res) => {
          const data = res?.data ?? {}
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedId
                ? { ...c, muted: data.muted ?? c.muted, mutedUntil: data.mutedUntil ?? c.mutedUntil, disappearing: data.disappearing ?? c.disappearing, disappearingUntil: data.disappearingUntil ?? c.disappearingUntil }
                : c
            )
          )
          setOpenSettingsMenu(null)
        })
        .catch(() => {})
    },
    [selectedId]
  )

  const addFilesToSend = useCallback((list) => {
    if (!list.length) return
    setSelectedFiles((prev) => [...prev, ...list].slice(0, 10))
  }, [])

  const insertEmoji = useCallback(
    (emoji) => {
      const ta = textareaRef.current
      if (ta) {
        const start = ta.selectionStart
        const end = ta.selectionEnd
        const before = inputText.slice(0, start)
        const after = inputText.slice(end)
        setInputText(before + emoji + after)
        setTimeout(() => {
          ta.focus()
          ta.setSelectionRange(start + emoji.length, start + emoji.length)
        }, 0)
      } else {
        setInputText((prev) => prev + emoji)
      }
    },
    [inputText]
  )

  const downloadAttachment = useCallback(async (url, name) => {
    const token = getAuthToken()
    if (!token) return
    const q = new URLSearchParams({ url, name: name || 'file' })
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CONVERSATIONS.ATTACHMENT_DOWNLOAD}?${q}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return
    const blob = await res.blob()
    const u = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = u
    a.download = name || 'file'
    a.click()
    URL.revokeObjectURL(u)
  }, [])

  const openImageViewer = useCallback((url, messageId) => setImageViewer({ url, messageId }), [])
  const closeImageViewer = useCallback(() => setImageViewer(null), [])
  const scrollToMessage = useCallback((messageId) => {
    setImageViewer(null)
    if (messageId) {
      document.querySelector(`[data-message-id="${messageId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])
  const viewOriginalMessage = useCallback(() => {
    if (imageViewer?.messageId) scrollToMessage(imageViewer.messageId)
    else setImageViewer(null)
  }, [imageViewer?.messageId, scrollToMessage])

  const searchQ = searchConversations.trim().toLowerCase()
  const filteredConversations = useMemo(
    () =>
      conversations.filter((c) => {
        if (!searchQ) return true
        const nameMatch = (c.name || '').toLowerCase().includes(searchQ)
        const lastMsgMatch = (c.lastMessage || '').toLowerCase().includes(searchQ)
        return nameMatch || lastMsgMatch
      }),
    [conversations, searchQ]
  )

  const friendsSearchQueryRef = useRef('')
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

  const handleSelectFriendToChat = useCallback(
    (userId) => {
      setSearchConversations('')
      setSearchParams({ with: userId }, { replace: true })
    },
    [setSearchParams]
  )

  const withUserIdFromUrl = searchParams.get('with')
  const withUserFromState = location.state?.withUser
  const withUserId =
    withUserIdFromUrl != null && withUserIdFromUrl !== ''
      ? String(withUserIdFromUrl)
      : withUserFromState?.id != null
        ? String(withUserFromState.id)
        : null

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
            isGroup: false,
          }))
        )
      })
      .catch(() => setConversations([]))
      .finally(() => setConversationsLoading(false))
  }, [currentUserId, normalizeLastMessage])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (!selectedId || !currentUserId) {
      setMessages([])
      return
    }
    const otherUserId = selected?.otherUserId
    setMessagesLoading(true)
    conversationService
      .getMessages(selectedId)
      .then((res) => setMessages(mapApiMessagesToUi(res?.data ?? [], currentUserId, otherUserId)))
      .catch(() => setMessages([]))
      .finally(() => setMessagesLoading(false))
    conversationService.markAsRead(selectedId).then(() => {
      setConversations((prev) => prev.map((c) => (c.id === selectedId ? { ...c, unread: false, unreadCount: 0 } : c)))
    }).catch(() => {})
  }, [selectedId, currentUserId, selected?.otherUserId])

  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    const lastId = lastMsg?.id
    lastMessageIdRef.current = lastId != null ? lastId : null
  }, [messages])

  useEffect(() => {
    if (!showEmojiPicker) return
    const close = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) setShowEmojiPicker(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [showEmojiPicker])

  useEffect(() => {
    if (!showGifPicker) return
    setShowEmojiPicker(false)
    if (hasGiphyKey && gifResults.length === 0 && !gifLoading) searchGiphy('')
    const close = (e) => {
      if (gifPickerRef.current && !gifPickerRef.current.contains(e.target)) setShowGifPicker(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [showGifPicker, hasGiphyKey, gifResults.length, gifLoading, searchGiphy])

  useEffect(() => {
    if (openMessageMenuId == null) return
    const close = (e) => {
      if (messageMenuRef.current && !messageMenuRef.current.contains(e.target)) setOpenMessageMenuId(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [openMessageMenuId])

  useEffect(() => {
    if (!showNewMessageBanner || !messagesScrollRef.current || !messagesEndRef.current) return
    const root = messagesScrollRef.current
    const endEl = messagesEndRef.current
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) setShowNewMessageBanner(false)
    }, { root, rootMargin: '0px', threshold: 0 })
    observer.observe(endEl)
    return () => observer.disconnect()
  }, [showNewMessageBanner, messages.length])

  useEffect(() => {
    if (!reactionNotification?.messageId || !messagesScrollRef.current) return
    const el = document.querySelector(`[data-message-id="${reactionNotification.messageId}"]`)
    if (!el) return
    const root = messagesScrollRef.current
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) setReactionNotification(null)
    }, { root, rootMargin: '0px', threshold: 0 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [reactionNotification?.messageId])

  useEffect(() => {
    if (!withUserId || !currentUserId) return
    let cancelled = false
    setWithUserLoading(true)
    conversationService
      .getOrCreateWithUser(withUserId)
      .then((res) => {
        if (cancelled) return
        const { conversation, otherUser, messages: apiMessages } = res?.data ?? {}
        if (!conversation?.id || !otherUser) return
        const convId = conversation.id
        const uiMessages = mapApiMessagesToUi(apiMessages || [], currentUserId, otherUser?.id)
        setConversations((prev) => {
          const newConv = {
            id: convId,
            otherUserId: otherUser.id,
            name: otherUser.name || 'User',
            avatar: otherUser.avatar || `https://ui-avatars.com/api/?name=User&background=13b6ec&color=fff`,
            lastMessage: normalizeLastMessage(conversation.lastMessageText),
            lastMessageAt: conversation.lastMessageAt,
            time: t('messages.newConversation'),
            unread: false,
            isGroup: false,
            muted: conversation.muted ?? false,
            mutedUntil: conversation.mutedUntil ?? null,
            disappearing: conversation.disappearing ?? false,
            disappearingUntil: conversation.disappearingUntil ?? null,
          }
          const idx = prev.findIndex((c) => c.id === convId || String(c.otherUserId) === String(otherUser.id))
          if (idx >= 0) {
            const next = [...prev]
            next[idx] = { ...newConv, time: formatConversationTime(conversation.lastMessageAt) || newConv.time }
            return next
          }
          return [newConv, ...prev]
        })
        setMessages(uiMessages)
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev)
          next.delete('with')
          return next
        }, { replace: true })
        navigate(ROUTES.MESSAGES_CONVERSATION(convId), { replace: true, state: {} })
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setWithUserLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [withUserId, currentUserId, setSearchParams, navigate, t, normalizeLastMessage])

  useEffect(() => {
    if (!currentUserId) return
    const token = getAuthToken()
    if (!token) return
    const socketUrl = API_BASE_URL.replace(/\/api\/?$/, '')
    const socket = io(socketUrl, { auth: { token }, transports: ['websocket', 'polling'] })
    socketRef.current = socket
    socket.on('conversation:read', (payload) => {
      const { conversationId } = payload || {}
      if (!conversationId) return
      setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, lastMessageSeen: true } : c)))
      if (selectedIdRef.current === conversationId) {
        setMessages((prev) => prev.map((m) => (m.fromMe ? { ...m, read: true } : m)))
      }
    })
    socket.on('conversation:message', (payload) => {
      const { conversationId, message } = payload || {}
      if (!conversationId || !message) return
      const isCurrentConversation = selectedIdRef.current === conversationId
      setMessages((prev) => {
        if (!isCurrentConversation) return prev
        const ui = {
          id: message.id,
          fromMe: String(message.senderId) === String(currentUserId),
          text: message.content || '',
          time: message.createdAt ? new Date(message.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
          read: false,
          attachments:
            Array.isArray(message.attachments) && message.attachments.length
              ? message.attachments
              : message.attachment?.url
                ? [{ url: message.attachment.url, name: message.attachment.name, type: message.attachment.type }]
                : [],
          reactions: Array.isArray(message.reactions) ? message.reactions : [],
          createdAt: message.createdAt || null,
        }
        if (prev.some((m) => m.id === ui.id)) return prev
        return [...prev, ui]
      })
      if (isCurrentConversation && String(message.senderId) !== String(currentUserId)) setShowNewMessageBanner(true)
      if (isCurrentConversation) {
        conversationService.markAsRead(conversationId).then(() => {
          setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, read: true } : m)))
        }).catch(() => {})
      }
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c
          const fromMe = String(message.senderId) === String(currentUserId)
          const hasAttachments = (Array.isArray(message.attachments) && message.attachments.length) || message.attachment?.url
          const onlyGif = hasAttachments && (
            (Array.isArray(message.attachments) && message.attachments.length > 0 && message.attachments.every((a) => (a.type || '').toLowerCase() === 'image/gif')) ||
            (message.attachment?.type || '').toLowerCase() === 'image/gif'
          )
          const contentTrimmed = (message.content || '').trim().slice(0, 100)
          const isOnlyFilePlaceholder = /^\[\d+\s*file\]$/i.test(contentTrimmed)
          const lastMessageText =
            (contentTrimmed && !isOnlyFilePlaceholder)
              ? contentTrimmed
              : (onlyGif ? '[GIF]' : hasAttachments ? t('messages.attachedFile') : '')
          const updated = {
            ...c,
            lastMessage: lastMessageText,
            lastMessageAt: message.createdAt,
            time: formatConversationTime(message.createdAt),
            lastMessageFromMe: fromMe,
            lastMessageSeen: false,
          }
          if (!isCurrentConversation) {
            updated.unread = true
            updated.unreadCount = (c.unreadCount || 0) + 1
          }
          return updated
        })
      )
    })
    socket.on('conversation:messageReaction', (payload) => {
      const { conversationId, messageId, reactions } = payload || {}
      if (!conversationId || !messageId || selectedIdRef.current !== conversationId) return
      setMessages((prev) => {
        const msg = prev.find((m) => m.id === messageId)
        const isMyMessage = msg?.fromMe === true
        const lastReaction = Array.isArray(reactions) && reactions.length ? reactions[reactions.length - 1] : null
        if (isMyMessage && lastReaction?.emoji) {
          const userName = selectedNameRef.current || t('messages.someone')
          setTimeout(() => setReactionNotification({ messageId, userName, emoji: lastReaction.emoji }), 0)
        }
        return prev.map((m) => (m.id === messageId ? { ...m, reactions: Array.isArray(reactions) ? reactions : m.reactions || [] } : m))
      })
    })
    socket.on('conversation:messageUpdated', (payload) => {
      const { conversationId, messageId, message } = payload || {}
      if (!conversationId || !messageId || !message) return
      if (selectedIdRef.current !== conversationId) return
      const ui = {
        id: message.id || messageId,
        fromMe: false,
        text: message.content || '',
        time: message.createdAt ? new Date(message.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
        read: (message.readBy || []).some((id) => String(id) === String(currentUserId)),
        attachments: Array.isArray(message.attachments) ? message.attachments : message.attachment?.url ? [message.attachment] : [],
      }
      setMessages((prev) => prev.map((m) => (m.id === messageId ? ui : m)))
    })
    socket.on('conversation:messageDeleted', (payload) => {
      const { conversationId, messageId } = payload || {}
      if (!conversationId || !messageId) return
      const isCurrentConversation = selectedIdRef.current === conversationId
      if (!isCurrentConversation) {
        loadConversations()
        return
      }
      setMessages((prev) => {
        const next = prev.filter((m) => m.id !== messageId)
        const newLast = next[next.length - 1]
        const hasAtt = newLast?.attachments?.length
        const onlyGif = hasAtt && (newLast.attachments || []).every((a) => (a.type || '').toLowerCase() === 'image/gif')
        const contentTrimmed = (newLast?.text || '').trim().slice(0, 100)
        const isOnlyFilePlaceholder = /^\[\d+\s*file\]$/i.test(contentTrimmed)
        const lastMessageText = !newLast
          ? ''
          : (contentTrimmed && !isOnlyFilePlaceholder)
            ? contentTrimmed
            : (onlyGif ? '[GIF]' : hasAtt ? t('messages.attachedFile') : (newLast?.text || '').slice(0, 100))
        setConversations((cPrev) =>
          cPrev.map((c) =>
            c.id !== conversationId
              ? c
              : {
                  ...c,
                  lastMessage: lastMessageText,
                  lastMessageAt: newLast?.createdAt ?? null,
                  time: newLast?.createdAt ? formatConversationTime(newLast.createdAt) : '',
                  lastMessageFromMe: newLast?.fromMe ?? c.lastMessageFromMe,
                  lastMessageSeen: newLast?.fromMe ? (newLast?.read ?? c.lastMessageSeen) : c.lastMessageSeen,
                }
          )
        )
        return next
      })
    })
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [currentUserId, t, loadConversations])

  editingMessageRef.current = editingMessage

  useEffect(() => {
    setRightBarMediaVisible(RIGHT_BAR_MEDIA_INITIAL)
    setRightBarFilesVisible(RIGHT_BAR_FILES_INITIAL)
    setRightBarLinksVisible(RIGHT_BAR_LINKS_INITIAL)
    setOpenMessageMenuId(null)
    setOpenReactionPickerId(null)
    setOpenReactionDetailMessageId(null)
    setSelectedReactionEmojiInModal(null)
    setShowNewMessageBanner(false)
    setReactionNotification(null)
    setOpenSettingsMenu(null)
    setEditingMessage(null)
  }, [selectedId])

  const handleSend = useCallback(() => {
    const currentEditing = editingMessageRef.current
    const text = inputText.trim()
    const hasFiles = selectedFiles.length > 0
    const hasUrlAttachments = currentEditing?.attachments?.length > 0
    if ((!text && !hasFiles && !hasUrlAttachments) || !selectedId || sendLoading) return
    setSendLoading(true)
    const filesToSend = [...selectedFiles]
    const urlAttachments = currentEditing?.attachments?.length ? currentEditing.attachments : null
    const messageIdToReplace = currentEditing?.id

    const applyMessageSuccess = (msg) => {
      const ui = {
        id: msg.id,
        fromMe: true,
        text: msg.content || '',
        time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
        read: false,
        attachments: Array.isArray(msg.attachments) ? msg.attachments : msg.attachment?.url ? [msg.attachment] : [],
      }
      setMessages((prev) => {
        if (messageIdToReplace) {
          return prev.map((m) => (m.id === messageIdToReplace ? ui : m))
        }
        return [...prev, ui]
      })
      const lastText = (text || msg.content || '').trim() || (msg.attachments?.length ? t('messages.attachedFile') : '')
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? { ...c, lastMessage: lastText.slice(0, 100), lastMessageAt: msg.createdAt, time: formatConversationTime(msg.createdAt), lastMessageFromMe: true, lastMessageSeen: false }
            : c
        )
      )
      setInputText('')
      setEditingMessage(null)
      setSelectedFiles([])
    }

    if (messageIdToReplace) {
      conversationService
        .updateMessage(selectedId, messageIdToReplace, text, filesToSend.length ? filesToSend : undefined, urlAttachments || undefined)
        .then((res) => {
          const msg = res?.data
          if (msg) applyMessageSuccess(msg)
        })
        .catch(() => {})
        .finally(() => setSendLoading(false))
    } else {
      setSelectedFiles([])
      conversationService
        .sendMessage(selectedId, text, filesToSend.length ? filesToSend : undefined, urlAttachments || undefined)
        .then((res) => {
          const msg = res?.data
          if (msg) applyMessageSuccess(msg)
        })
        .catch(() => {})
        .finally(() => setSendLoading(false))
    }
  }, [inputText, selectedFiles, selectedId, sendLoading, t])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const updateConversationLastMessage = useCallback(
    (conversationId, nextMessages) => {
      const newLast = nextMessages[nextMessages.length - 1]
      const hasAtt = newLast?.attachments?.length
      const onlyGif = hasAtt && (newLast.attachments || []).every((a) => (a.type || '').toLowerCase() === 'image/gif')
      const contentTrimmed = (newLast?.text || '').trim().slice(0, 100)
      const isOnlyFilePlaceholder = /^\[\d+\s*file\]$/i.test(contentTrimmed)
      const lastMessageText = !newLast
        ? ''
        : (contentTrimmed && !isOnlyFilePlaceholder)
          ? contentTrimmed
          : (onlyGif ? '[GIF]' : hasAtt ? t('messages.attachedFile') : (newLast?.text || '').slice(0, 100))
      setConversations((cPrev) =>
        cPrev.map((c) =>
          c.id !== conversationId
            ? c
            : {
                ...c,
                lastMessage: lastMessageText,
                lastMessageAt: newLast?.createdAt ?? null,
                time: newLast?.createdAt ? formatConversationTime(newLast.createdAt) : '',
                lastMessageFromMe: newLast?.fromMe ?? c.lastMessageFromMe,
                lastMessageSeen: newLast?.fromMe ? (newLast?.read ?? c.lastMessageSeen) : c.lastMessageSeen,
              }
        )
      )
    },
    [t]
  )

  const handleDeleteAllMessagesForMe = useCallback(() => {
    if (!selectedId || !currentUserId || !selected?.otherUserId) return
    conversationService.deleteAllMessagesForMe(selectedId).then(() => {
      conversationService.getMessages(selectedId).then((res) => {
        const nextMessages = mapApiMessagesToUi(res?.data ?? [], currentUserId, selected.otherUserId)
        setMessages(nextMessages)
        updateConversationLastMessage(selectedId, nextMessages)
      }).catch(() => {})
    }).catch(() => {})
  }, [selectedId, currentUserId, selected?.otherUserId, updateConversationLastMessage])

  const handleMessageAction = useCallback(
    (action, msg) => {
      setOpenMessageMenuId(null)
      setOpenReactionPickerId(null)
      if (action === 'deleteForMe') {
        if (!selectedId) return
        conversationService.deleteMessage(selectedId, msg.id, 'me').then(() => {
          setMessages((prev) => {
            const next = prev.filter((m) => m.id !== msg.id)
            updateConversationLastMessage(selectedId, next)
            return next
          })
        }).catch(() => {})
      } else if (action === 'deleteForBoth') {
        if (!selectedId) return
        conversationService.deleteMessage(selectedId, msg.id, 'everyone').then(() => {
          setMessages((prev) => {
            const next = prev.filter((m) => m.id !== msg.id)
            updateConversationLastMessage(selectedId, next)
            return next
          })
        }).catch(() => {})
      } else if (action === 'edit') {
        const editPayload = { id: msg.id, text: msg.text || '', attachments: msg.attachments || [] }
        editingMessageRef.current = editPayload
        setEditingMessage(editPayload)
        setInputText(msg.text || '')
      }
    },
    [selectedId, updateConversationLastMessage]
  )

  const cancelEditMessage = useCallback(() => {
    editingMessageRef.current = null
    setEditingMessage(null)
    setInputText('')
    setSelectedFiles([])
    setOpenMessageMenuId(null)
  }, [])

  const handleRemoveEditingAttachment = useCallback((index) => {
    setEditingMessage((prev) => {
      if (!prev?.attachments?.length) return prev
      const nextAttachments = prev.attachments.filter((_, i) => i !== index)
      const next = { ...prev, attachments: nextAttachments }
      editingMessageRef.current = next
      return next
    })
  }, [])

  const handleReaction = useCallback(
    (msg, emoji) => {
      if (!selectedId) return
      setOpenReactionPickerId(null)
      conversationService
        .reactToMessage(selectedId, msg.id, emoji)
        .then((res) => {
          const data = res?.data
          if (data?.reactions) {
            setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, reactions: data.reactions } : m)))
          }
        })
        .catch(() => {})
    },
    [selectedId]
  )

  const emojiCategories = useMemo(() => getMessageEmojiCategories(), [])
  const currentEmojis = useMemo(
    () => emojiCategories.find((c) => c.id === emojiCategoryId)?.emojis ?? emojiCategories[0]?.emojis ?? [],
    [emojiCategories, emojiCategoryId]
  )

  const rightBarMedia = useMemo(() => extractRightBarMedia(messages), [messages])
  const rightBarFiles = useMemo(() => extractRightBarFiles(messages), [messages])
  const rightBarLinks = useMemo(() => extractRightBarLinks(messages), [messages])

  const setRightBarMediaVisibleCount = useCallback(() => {
    setLoadMoreMedia(true)
    setTimeout(() => {
      setRightBarMediaVisible((prev) => prev + RIGHT_BAR_MEDIA_INITIAL)
      setLoadMoreMedia(false)
    }, 1000)
  }, [])
  const setRightBarFilesVisibleCount = useCallback(() => {
    setLoadMoreFiles(true)
    setTimeout(() => {
      setRightBarFilesVisible((prev) => prev + RIGHT_BAR_FILES_INITIAL)
      setLoadMoreFiles(false)
    }, 1000)
  }, [])
  const setRightBarLinksVisibleCount = useCallback(() => {
    setLoadMoreLinks(true)
    setTimeout(() => {
      setRightBarLinksVisible((prev) => prev + RIGHT_BAR_LINKS_INITIAL)
      setLoadMoreLinks(false)
    }, 1000)
  }, [])

  return {
    t,
    user,
    navigate,
    selectedId,
    selected,
    tab,
    setTab,
    searchConversations,
    setSearchConversations,
    friendsSearchResult,
    friendsSearchLoading,
    handleSelectFriendToChat,
    conversations,
    filteredConversations,
    conversationsLoading,
    messages,
    messagesLoading,
    messagesEndRef,
    messagesScrollRef,
    inputText,
    setInputText,
    sendLoading,
    withUserLoading,
    withUserId,
    fileInputRef,
    imageInputRef,
    videoInputRef,
    gifInputRef,
    textareaRef,
    gifPickerRef,
    emojiPickerRef,
    messageMenuRef,
    openMessageMenuId,
    setOpenMessageMenuId,
    editingMessage,
    cancelEditMessage,
    onRemoveEditingAttachment: handleRemoveEditingAttachment,
    selectedFiles,
    setSelectedFiles,
    showEmojiPicker,
    setShowEmojiPicker,
    emojiCategoryId,
    setEmojiCategoryId,
    emojiCategories,
    currentEmojis,
    showGifPicker,
    setShowGifPicker,
    gifQuery,
    setGifQuery,
    gifResults,
    gifLoading,
    hasGiphyKey,
    imageViewer,
    openImageViewer,
    closeImageViewer,
    scrollToMessage,
    viewOriginalMessage,
    openReactionPickerId,
    setOpenReactionPickerId,
    openReactionDetailMessageId,
    setOpenReactionDetailMessageId,
    selectedReactionEmojiInModal,
    setSelectedReactionEmojiInModal,
    rightBarMedia,
    rightBarFiles,
    rightBarLinks,
    rightBarMediaVisible,
    rightBarFilesVisible,
    rightBarLinksVisible,
    loadMoreMedia,
    loadMoreFiles,
    loadMoreLinks,
    setRightBarMediaVisibleCount,
    setRightBarFilesVisibleCount,
    setRightBarLinksVisibleCount,
    showNewMessageBanner,
    setShowNewMessageBanner,
    reactionNotification,
    setReactionNotification,
    openSettingsMenu,
    setOpenSettingsMenu,
    showDeleteAllConfirm,
    setShowDeleteAllConfirm,
    currentUserId,
    normalizeLastMessage,
    displayLastMessage,
    getSettingsUntil,
    getDisappearingDurationSeconds,
    searchGiphy,
    sendGif,
    applyConversationSettings,
    addFilesToSend,
    insertEmoji,
    downloadAttachment,
    handleSend,
    handleKeyDown,
    handleDeleteAllMessagesForMe,
    handleMessageAction,
    handleReaction,
    loadConversations,
    formatConversationTime,
  }
}
