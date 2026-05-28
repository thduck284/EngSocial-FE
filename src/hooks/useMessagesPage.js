import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '../constants'
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api'
import { useAuth } from '../context/AuthContext'
import { conversationService, friendsService, uploadService, userService, reportService } from '../services'
import { searchGiphy as giphySearch, hasGiphyKey } from '../services/giphy.service'
import { getAuthToken } from '../utils/auth'
import { getMessageEmojiCategories } from '../utils/emoji'
import { formatConversationTime, mapApiMessagesToUi } from '../utils/messages'
import { useConversationList, useConversationSocket } from './useConversations'
import { useRightBarData } from './useRightBarData'

const SETTINGS_FOREVER_MS = 10 * 365 * 24 * 60 * 60 * 1000
const MESSAGES_PAGE_SIZE = 10

export function useMessagesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const {
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
    showCreateGroupModal,
    setShowCreateGroupModal,
    handleCreateGroupSuccess,
    selectedId,
    currentUserId,
    normalizeLastMessage,
    withUserId,
  } = useConversationList()

  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [inputText, setInputText] = useState('')
  const [withUserLoading, setWithUserLoading] = useState(false)
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
  const rightBarSearchInputRef = useRef(null)

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
  const [showNewMessageBanner, setShowNewMessageBanner] = useState(false)
  const [reactionNotification, setReactionNotification] = useState(null)
  const [openSettingsMenu, setOpenSettingsMenu] = useState(null)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)
  const [showDisbandConfirm, setShowDisbandConfirm] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [headerActionPanel, setHeaderActionPanel] = useState(null) // 'search' | 'mute' | 'disappearing' – panel mở bên trái (main)
  const [forwardMessage, setForwardMessage] = useState(null)
  const [forwardingToId, setForwardingToId] = useState(null)
  const [reportModal, setReportModal] = useState({
    open: false,
    targetType: '',
    targetId: '',
    titleKey: '',
  })

  const rightBar = useRightBarData(messages)
  const {
    rightBarSearchQuery: rightBarSearchQueryFromHook,
    setRightBarSearchQuery: setRightBarSearchQueryFromHook,
    panelSearchQuery: panelSearchQueryFromHook,
    setPanelSearchQuery: setPanelSearchQueryFromHook,
    rightBarMedia,
    rightBarFiles,
    rightBarLinks,
    rightBarSearchResults,
    panelSearchResults,
    rightBarMediaVisible,
    rightBarFilesVisible,
    rightBarLinksVisible,
    loadMoreMedia,
    loadMoreFiles,
    loadMoreLinks,
    setRightBarMediaVisibleCount,
    setRightBarFilesVisibleCount,
    setRightBarLinksVisibleCount,
    resetOnConversationChange: rightBarResetOnConversationChange,
  } = rightBar
  const rightBarSearchQuery = rightBarSearchQueryFromHook
  const setRightBarSearchQuery = setRightBarSearchQueryFromHook
  const panelSearchQuery = panelSearchQueryFromHook
  const setPanelSearchQuery = setPanelSearchQueryFromHook
  const [hasMoreOlderMessages, setHasMoreOlderMessages] = useState(false)
  const [loadMoreMessagesLoading, setLoadMoreMessagesLoading] = useState(false)
  const scrollRestoreRef = useRef(null) // { scrollHeight, scrollTop } sau khi prepend older messages
  const didScrollToBottomForRef = useRef(null)
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  selectedIdRef.current = selectedId
  const selected = useMemo(() => conversations.find((c) => c.id === selectedId), [conversations, selectedId])
  selectedNameRef.current = selected?.name ?? null

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

  useEffect(() => {
    if (!selectedId || !currentUserId) {
      setMessages([])
      setHasMoreOlderMessages(false)
      didScrollToBottomForRef.current = null
      scrollRestoreRef.current = null
      return
    }
    didScrollToBottomForRef.current = null
    scrollRestoreRef.current = null
    const otherUserId = selected?.otherUserId
    setMessagesLoading(true)
    setHasMoreOlderMessages(false)
    conversationService
      .getMessages(selectedId, { limit: MESSAGES_PAGE_SIZE })
      .then((res) => {
        const list = mapApiMessagesToUi(res?.data ?? [], currentUserId, otherUserId)
        setMessages(list)
        setHasMoreOlderMessages(list.length >= MESSAGES_PAGE_SIZE)
      })
      .catch(() => setMessages([]))
      .finally(() => setMessagesLoading(false))
    conversationService.markAsRead(selectedId).then(() => {
      setConversations((prev) => prev.map((c) => (c.id === selectedId ? { ...c, unread: false, unreadCount: 0 } : c)))
    }).catch(() => {})
  }, [selectedId, currentUserId, selected?.otherUserId])

  // Khi mở conversation, cuộn xuống tin nhắn mới nhất (đáy) — dùng useLayoutEffect để chạy trước paint, tránh nháy lên trên
  useLayoutEffect(() => {
    if (messagesLoading || !messages.length || !selectedId) return
    if (didScrollToBottomForRef.current === selectedId) return
    didScrollToBottomForRef.current = selectedId
    const root = messagesScrollRef.current
    if (!root) return
    root.scrollTop = root.scrollHeight
  }, [selectedId, messagesLoading, messages.length])

  // Fallback: scroll lại sau khi layout ổn định (ảnh/iframe load có thể làm thay đổi chiều cao)
  useEffect(() => {
    if (messagesLoading || !messages.length || !selectedId) return
    const scrollToBottom = () => {
      const el = messagesScrollRef.current
      if (el) el.scrollTop = el.scrollHeight
    }
    const t1 = setTimeout(scrollToBottom, 80)
    const t2 = setTimeout(scrollToBottom, 200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [selectedId, messagesLoading, messages.length])

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
        const { conversation, otherUser, messages: apiMessages, online } = res?.data ?? {}
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
            online: online ?? false,
            lastActiveDate: otherUser?.lastActiveDate ?? null,
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
  }, [withUserId, currentUserId, setSearchParams, navigate, t, normalizeLastMessage, setConversations, setMessages])

  const onClearSelection = useCallback(() => navigate(ROUTES.MESSAGES), [navigate])
  useConversationSocket({
    currentUserId,
    setConversations,
    setMessages,
    selectedIdRef,
    selectedNameRef,
    loadConversations,
    onClearSelection,
    t,
    setShowNewMessageBanner,
    setReactionNotification,
    socketRef,
  })

  editingMessageRef.current = editingMessage

  useEffect(() => {
    rightBarResetOnConversationChange?.()
    setOpenMessageMenuId(null)
    setOpenReactionPickerId(null)
    setOpenReactionDetailMessageId(null)
    setSelectedReactionEmojiInModal(null)
    setShowNewMessageBanner(false)
    setReactionNotification(null)
    setOpenSettingsMenu(null)
    setEditingMessage(null)
  }, [selectedId, rightBarResetOnConversationChange])

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

  const loadMoreOlderMessages = useCallback(() => {
    if (loadMoreMessagesLoading || !hasMoreOlderMessages || !selectedId || !currentUserId || !selected?.otherUserId) return
    const current = messagesRef.current
    const oldestId = current[0]?.id
    if (!oldestId) return
    const root = messagesScrollRef.current
    const scrollHeightBefore = root?.scrollHeight ?? 0
    const scrollTopBefore = root?.scrollTop ?? 0

    setLoadMoreMessagesLoading(true)
    setTimeout(() => {
      conversationService
        .getMessages(selectedId, { limit: MESSAGES_PAGE_SIZE, before: oldestId })
        .then((res) => {
          const older = mapApiMessagesToUi(res?.data ?? [], currentUserId, selected.otherUserId)
          setHasMoreOlderMessages(older.length >= MESSAGES_PAGE_SIZE)
          setMessages((prev) => [...older, ...prev])
          scrollRestoreRef.current = { scrollHeightBefore, scrollTopBefore }
        })
        .catch(() => {})
        .finally(() => setLoadMoreMessagesLoading(false))
    }, 1000)
  }, [selectedId, currentUserId, selected?.otherUserId, loadMoreMessagesLoading, hasMoreOlderMessages])

  useEffect(() => {
    const saved = scrollRestoreRef.current
    if (!saved || !messagesScrollRef.current) return
    scrollRestoreRef.current = null
    const root = messagesScrollRef.current
    requestAnimationFrame(() => {
      const newHeight = root.scrollHeight
      root.scrollTop = newHeight - saved.scrollHeightBefore + saved.scrollTopBefore
    })
  }, [messages])

  const handleDeleteAllMessagesForMe = useCallback(() => {
    if (!selectedId || !currentUserId || !selected?.otherUserId) return
    conversationService.deleteAllMessagesForMe(selectedId).then(() => {
      conversationService.getMessages(selectedId, { limit: MESSAGES_PAGE_SIZE }).then((res) => {
        const nextMessages = mapApiMessagesToUi(res?.data ?? [], currentUserId, selected.otherUserId)
        setMessages(nextMessages)
        setHasMoreOlderMessages(nextMessages.length >= MESSAGES_PAGE_SIZE)
        updateConversationLastMessage(selectedId, nextMessages)
      }).catch(() => {})
    }).catch(() => {})
  }, [selectedId, currentUserId, selected?.otherUserId, updateConversationLastMessage])

  const handleDisbandGroup = useCallback(() => {
    if (!selectedId || !selected?.isGroup || selected?.myRole !== 'host') return
    conversationService.disbandGroup(selectedId).then(() => {
      navigate(ROUTES.MESSAGES)
      setMessages([])
      loadConversations()
    }).catch(() => {})
  }, [selectedId, selected?.isGroup, selected?.myRole, loadConversations, navigate])

  const handleLeaveGroup = useCallback(() => {
    if (!selectedId || !selected?.isGroup) return
    conversationService.leaveGroup(selectedId).then(() => {
      navigate(ROUTES.MESSAGES)
      setMessages([])
      loadConversations()
    }).catch(() => {})
  }, [selectedId, selected?.isGroup, loadConversations, navigate])

  const handleSetMemberAdmin = useCallback((conversationId, userId) => {
    if (!conversationId || !userId) return
    conversationService.setMemberRole(conversationId, userId, 'admin').then(() => loadConversations()).catch(() => {})
  }, [loadConversations])

  const handleMessageUser = useCallback((userId) => {
    if (!userId) return
    setSearchParams({ with: userId })
  }, [setSearchParams])

  const updateConversationMembersAfterKick = useCallback((conversationId, userId) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId && Array.isArray(c.members)
          ? { ...c, members: c.members.filter((m) => String(m.userId) !== String(userId)), memberCount: Math.max(0, (c.memberCount ?? c.members.length) - 1) }
          : c
      )
    )
  }, [])

  const handleKickMember = useCallback((conversationId, userId) => {
    if (!conversationId || !userId) return
    conversationService.blockUserInGroup(conversationId, userId).then(() => {
      updateConversationMembersAfterKick(conversationId, userId)
      loadConversations()
    }).catch(() => {})
  }, [loadConversations, updateConversationMembersAfterKick])

  const handleBlockMember = useCallback((conversationId, userId) => {
    if (!conversationId || !userId) return
    conversationService.blockUserInGroup(conversationId, userId).then(() => {
      updateConversationMembersAfterKick(conversationId, userId)
      loadConversations()
    }).catch(() => {})
  }, [loadConversations, updateConversationMembersAfterKick])

  const handleBlockDirect = useCallback((otherUserId) => {
    if (!otherUserId) return
    userService.blockUser(otherUserId).then(() => loadConversations()).catch(() => {})
  }, [loadConversations])

  const handleUnblockDirect = useCallback((otherUserId) => {
    if (!otherUserId) return
    userService.unblockUser(otherUserId).then(() => loadConversations()).catch(() => {})
  }, [loadConversations])

  const handleUploadGroupAvatar = useCallback((file) => {
    if (!selectedId || !selected?.isGroup || !file) return Promise.reject()
    return uploadService.uploadMedia(file).then((data) => {
      const url = data?.url
      if (!url) return Promise.reject()
      return conversationService.updateGroupSettings(selectedId, { avatar: url })
    }).then(() => {
      loadConversations()
    })
  }, [selectedId, selected?.isGroup, loadConversations])

  const handleSaveGroupName = useCallback((conversationId, newName) => {
    const trimmed = (newName || '').trim()
    if (!conversationId || !selected?.isGroup || trimmed === '') return Promise.reject()
    return conversationService.updateGroupSettings(conversationId, { name: trimmed }).then(() => {
      loadConversations()
    })
  }, [selected?.isGroup, loadConversations])

  const closeReportModal = useCallback(() => {
    setReportModal({ open: false, targetType: '', targetId: '', titleKey: '' })
  }, [])

  const handleAnyReport = useCallback(
    (arg) => {
      if (arg && typeof arg === 'object' && arg.id) {
        const conv = arg
        if (conv.isGroup) {
          setReportModal({
            open: true,
            targetType: 'conversation',
            targetId: String(conv.id),
            titleKey: 'report.titleConversation',
          })
        } else if (conv.otherUserId) {
          setReportModal({
            open: true,
            targetType: 'user',
            targetId: String(conv.otherUserId),
            titleKey: 'report.titleUser',
          })
        }
        return
      }
      if (typeof arg === 'string' && arg) {
        setReportModal({
          open: true,
          targetType: 'user',
          targetId: String(arg),
          titleKey: 'report.titleUser',
        })
        return
      }
      if (!selected) return
      if (selected.isGroup) {
        setReportModal({
          open: true,
          targetType: 'conversation',
          targetId: String(selected.id),
          titleKey: 'report.titleConversation',
        })
      } else if (selected.otherUserId) {
        setReportModal({
          open: true,
          targetType: 'user',
          targetId: String(selected.otherUserId),
          titleKey: 'report.titleUser',
        })
      }
    },
    [selected]
  )

  const submitReportModal = useCallback(
    async ({ reason, details }) => {
      if (!reportModal.targetType || !reportModal.targetId) return
      await reportService.submitReport({
        targetType: reportModal.targetType,
        targetId: reportModal.targetId,
        reason,
        details,
      })
    },
    [reportModal.targetType, reportModal.targetId]
  )

  const updateConversationData = useCallback((conversationId, patch) => {
    if (!conversationId || !patch || typeof patch !== 'object') return
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, ...patch } : c))
    )
  }, [])

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
      } else if (action === 'forward') {
        setForwardMessage(msg)
      } else if (action === 'report') {
        if (!selectedId || !msg?.id) return
        setReportModal({
          open: true,
          targetType: 'message',
          targetId: String(msg.id),
          titleKey: 'report.titleMessage',
        })
      }
    },
    [selectedId, updateConversationLastMessage]
  )

  const handleForwardMessage = useCallback((conversationId, message) => {
    if (!conversationId || !message) return
    const content = (message.text || '').replace(/\[\d+\s*file\]/gi, '').trim()
    const attachments = (message.attachments || []).map((a) => ({ url: a.url, name: a.name || null, type: a.type || null }))
    if (!content && attachments.length === 0) return
    setForwardingToId(conversationId)
    conversationService
      .sendMessage(conversationId, content || (attachments.length ? `[${attachments.length} file]` : ''), null, attachments.length ? attachments : null)
      .then(() => {
        setForwardMessage(null)
        setForwardingToId(null)
        loadConversations()
      })
      .catch(() => setForwardingToId(null))
  }, [loadConversations])

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
    showCreateGroupModal,
    setShowCreateGroupModal,
    handleCreateGroupSuccess,
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
    rightBarSearchQuery,
    setRightBarSearchQuery,
    rightBarSearchInputRef,
    rightBarSearchResults,
    panelSearchQuery,
    setPanelSearchQuery,
    panelSearchResults,
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
    showDisbandConfirm,
    setShowDisbandConfirm,
    handleDisbandGroup,
    showLeaveConfirm,
    setShowLeaveConfirm,
    handleLeaveGroup,
    forwardMessage,
    setForwardMessage,
    handleForwardMessage,
    forwardingToId,
    handleSetMemberAdmin,
    handleMessageUser,
    handleKickMember,
    handleBlockMember,
    handleBlockDirect,
    handleUnblockDirect,
    handleUploadGroupAvatar,
    handleSaveGroupName,
    updateConversationData,
    headerActionPanel,
    setHeaderActionPanel,
    hasMoreOlderMessages,
    loadMoreMessagesLoading,
    loadMoreOlderMessages,
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
    reportModal,
    closeReportModal,
    handleAnyReport,
    submitReportModal,
  }
}
