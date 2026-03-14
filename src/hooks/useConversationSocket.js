import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { ROUTES } from '../constants'
import { SOCKET_ENABLED, SOCKET_BASE_URL, SOCKET_FALLBACK_BASE_URL } from '../constants/api'
import { conversationService } from '../services'
import { getAuthToken } from '../utils/auth'
import { formatConversationTime } from '../utils/messages'

/**
 * Thiết lập socket cho realtime: read, online/offline, message, reaction, updated, deleted, disbanded, left, memberLeft.
 * Khi disband/left cần clear selection: gọi onClearSelection (thường là () => navigate(ROUTES.MESSAGES)).
 * Khi chạy local mà BE local không chạy thì thử fallback (Render).
 */
export function useConversationSocket({
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
}) {
  const currentSocketRef = useRef(null)
  const triedFallbackRef = useRef(false)

  useEffect(() => {
    if (!SOCKET_ENABLED || !currentUserId) return
    const token = getAuthToken()
    if (!token) return

    const opts = { auth: { token }, transports: ['websocket', 'polling'] }

    function attachListeners(socket) {
      socket.on('conversation:read', (payload) => {
      const { conversationId, userId: readerUserId } = payload || {}
      if (!conversationId) return
      setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, lastMessageSeen: true } : c)))
      if (selectedIdRef?.current === conversationId) {
        const readerId = readerUserId != null ? String(readerUserId) : null
        setMessages((prev) => {
          if (!readerId) return prev.map((m) => (m.fromMe ? { ...m, read: true } : m))
          return prev.map((m) => {
            const readBy = m.readBy || []
            const alreadyRead = readBy.some((id) => String(id) === readerId)
            if (alreadyRead) return m.fromMe ? { ...m, read: true } : m
            return { ...m, readBy: [...readBy, readerId], read: m.fromMe ? true : m.read }
          })
        })
      }
    })
    socket.on('conversation:userOnline', (payload) => {
      const userId = payload?.userId != null ? String(payload.userId) : null
      if (!userId) return
      const isMe = String(userId) === String(currentUserId)
      setConversations((prev) =>
        prev.map((c) => {
          if (String(c.otherUserId) === userId) return { ...c, online: true }
          if (c.isGroup && !isMe && Array.isArray(c.members) && c.members.some((m) => String(m.userId) === userId)) return { ...c, online: true }
          return c
        })
      )
    })
    socket.on('conversation:userOffline', (payload) => {
      const userId = payload?.userId != null ? String(payload.userId) : null
      if (!userId) return
      const isMe = String(userId) === String(currentUserId)
      setConversations((prev) =>
        prev.map((c) => {
          if (String(c.otherUserId) === userId) return { ...c, online: false }
          if (c.isGroup && !isMe && Array.isArray(c.members) && c.members.some((m) => String(m.userId) === userId)) return { ...c, online: false }
          return c
        })
      )
    })
    socket.on('conversation:message', (payload) => {
      const { conversationId, message } = payload || {}
      if (!conversationId || !message) return
      const isCurrentConversation = selectedIdRef?.current === conversationId
      setMessages((prev) => {
        if (!isCurrentConversation) return prev
        const isSystem = message.messageType === 'system'
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
          isSystem: !!isSystem,
        }
        if (prev.some((m) => m.id === ui.id)) return prev
        return [...prev, ui]
      })
      if (isCurrentConversation && String(message.senderId) !== String(currentUserId) && message.messageType !== 'system') setShowNewMessageBanner?.(true)
      if (isCurrentConversation && message.messageType !== 'system') {
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
      if (!conversationId || !messageId || selectedIdRef?.current !== conversationId) return
      setMessages((prev) => {
        const msg = prev.find((m) => m.id === messageId)
        const isMyMessage = msg?.fromMe === true
        const lastReaction = Array.isArray(reactions) && reactions.length ? reactions[reactions.length - 1] : null
        if (isMyMessage && lastReaction?.emoji && setReactionNotification) {
          const userName = selectedNameRef?.current || t('messages.someone')
          setTimeout(() => setReactionNotification({ messageId, userName, emoji: lastReaction.emoji }), 0)
        }
        return prev.map((m) => (m.id === messageId ? { ...m, reactions: Array.isArray(reactions) ? reactions : m.reactions || [] } : m))
      })
    })
    socket.on('conversation:messageUpdated', (payload) => {
      const { conversationId, messageId, message } = payload || {}
      if (!conversationId || !messageId || !message) return
      if (selectedIdRef?.current !== conversationId) return
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
    socket.on('conversation:disbanded', (payload) => {
      const { conversationId } = payload || {}
      if (!conversationId) return
      setConversations((prev) => prev.filter((c) => c.id !== conversationId))
      if (selectedIdRef?.current === conversationId) {
        onClearSelection?.()
        setMessages([])
      }
      loadConversations()
    })
    socket.on('conversation:left', (payload) => {
      const { conversationId } = payload || {}
      if (!conversationId) return
      setConversations((prev) => prev.filter((c) => c.id !== conversationId))
      if (selectedIdRef?.current === conversationId) {
        onClearSelection?.()
        setMessages([])
      }
      loadConversations()
    })
    socket.on('conversation:membersAdded', () => {
      loadConversations()
    })
    socket.on('conversation:memberRoleChanged', () => {
      loadConversations()
    })
    socket.on('conversation:memberLeft', (payload) => {
      const { conversationId, userId } = payload || {}
      if (!conversationId) return
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c
          const members = Array.isArray(c.members) ? c.members.filter((m) => String(m.userId) !== String(userId)) : c.members
          return { ...c, members, memberCount: Math.max(0, (c.memberCount ?? (c.members?.length ?? 0)) - 1) }
        })
      )
      loadConversations()
    })
    socket.on('conversation:messageDeleted', (payload) => {
      const { conversationId, messageId } = payload || {}
      if (!conversationId || !messageId) return
      const isCurrentConversation = selectedIdRef?.current === conversationId
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
    socket.on('conversation:memberBlocked', () => {
      loadConversations()
    })
    socket.on('conversation:memberUnblocked', () => {
      loadConversations()
    })
    socket.on('user:blocked', () => {
      loadConversations()
    })
      socket.on('user:unblocked', () => {
        loadConversations()
      })
    }

    let socket = io(SOCKET_BASE_URL, opts)
    currentSocketRef.current = socket
    if (socketRef) socketRef.current = socket
    attachListeners(socket)

    socket.on('connect_error', () => {
      if (!SOCKET_FALLBACK_BASE_URL || triedFallbackRef.current) return
      triedFallbackRef.current = true
      socket.removeAllListeners()
      socket.disconnect()
      socket = io(SOCKET_FALLBACK_BASE_URL, opts)
      currentSocketRef.current = socket
      if (socketRef) socketRef.current = socket
      attachListeners(socket)
    })

    return () => {
      triedFallbackRef.current = false
      currentSocketRef.current?.disconnect()
      currentSocketRef.current = null
      if (socketRef) socketRef.current = null
    }
  }, [currentUserId, t, loadConversations, onClearSelection, setConversations, setMessages, setShowNewMessageBanner, setReactionNotification])
}
