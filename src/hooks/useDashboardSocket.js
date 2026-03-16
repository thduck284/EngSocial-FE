import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { SOCKET_ENABLED, SOCKET_BASE_URL, SOCKET_FALLBACK_BASE_URL } from '../constants/api'
import { getAuthToken } from '../utils/auth'

const OFFLINE_DELAY_MS = 2500

/**
 * Real-time online status for dashboard: conversation:userOnline / userOffline.
 * Debounces offline to avoid flicker on reconnect.
 * @param {Object} user - Current user (from useAuth)
 * @param {function} setGroupConversations - State setter for group conversations (to mark online/offline)
 */
export function useDashboardSocket(user, setGroupConversations) {
  const [onlineUserIds, setOnlineUserIds] = useState(new Set())
  const socketRef = useRef(null)
  const fallbackTriedRef = useRef(false)
  const pendingOfflineRef = useRef({})

  useEffect(() => {
    if (!SOCKET_ENABLED || !user) return
    const token = getAuthToken()
    if (!token) return
    const opts = { auth: { token }, transports: ['websocket', 'polling'] }
    const pending = pendingOfflineRef.current

    function attachListeners(socket) {
      socket.on('conversation:userOnline', (payload) => {
        const userId = payload?.userId != null ? String(payload.userId) : null
        if (!userId) return
        if (pending[userId]) {
          clearTimeout(pending[userId])
          delete pending[userId]
        }
        setOnlineUserIds((prev) => new Set([...prev, userId]))
        setGroupConversations((prev) =>
          prev.map((c) =>
            Array.isArray(c.members) && c.members.some((m) => String(m?.userId) === userId) ? { ...c, online: true } : c
          )
        )
      })
      socket.on('conversation:userOffline', (payload) => {
        const userId = payload?.userId != null ? String(payload.userId) : null
        if (!userId) return
        if (pending[userId]) return
        pending[userId] = setTimeout(() => {
          delete pending[userId]
          setOnlineUserIds((prev) => {
            const next = new Set(prev)
            next.delete(userId)
            return next
          })
          setGroupConversations((prev) =>
            prev.map((c) =>
              Array.isArray(c.members) && c.members.some((m) => String(m?.userId) === userId) ? { ...c, online: false } : c
            )
          )
        }, OFFLINE_DELAY_MS)
      })
    }

    let socket = io(SOCKET_BASE_URL, opts)
    socketRef.current = socket
    attachListeners(socket)
    socket.on('connect_error', () => {
      if (!SOCKET_FALLBACK_BASE_URL || fallbackTriedRef.current) return
      fallbackTriedRef.current = true
      socket.removeAllListeners()
      socket.disconnect()
      socket = io(SOCKET_FALLBACK_BASE_URL, opts)
      socketRef.current = socket
      attachListeners(socket)
    })

    return () => {
      Object.values(pending).forEach(clearTimeout)
      Object.keys(pending).forEach((k) => delete pending[k])
      fallbackTriedRef.current = false
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [user, setGroupConversations])

  return { onlineUserIds }
}
