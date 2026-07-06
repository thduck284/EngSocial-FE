import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import { SOCKET_ENABLED, SOCKET_BASE_URL, SOCKET_FALLBACK_BASE_URL } from '../constants/api'
import { createSocketAuthOptions, disconnectSocketSafe } from '../utils/socketClient'
import { getAuthToken, getTokenSessionVersion, markSessionReplacedLogout } from '../utils/auth'

export function GlobalAuthSessionListener() {
  const { user, logout, isGuest } = useAuth()
  const { t } = useTranslation()
  const socketRef = useRef(null)
  const triedFallbackRef = useRef(false)
  const handlingRef = useRef(false)

  useEffect(() => {
    if (!SOCKET_ENABLED || !user || isGuest) return
    const token = getAuthToken()
    if (!token) return

    const handleSessionReplaced = (data) => {
      if (handlingRef.current) return
      const currentToken = getAuthToken()
      if (!currentToken) return
      const mySv = getTokenSessionVersion(currentToken)
      const newSv = data?.sessionVersion ?? 0
      if (mySv >= newSv) return

      handlingRef.current = true
      toast.error(t('auth.sessionReplaced'), { duration: 6000 })
      markSessionReplacedLogout()
      logout()
    }

    const opts = createSocketAuthOptions(token)

    function attachListeners(socket) {
      socket.on('auth:sessionReplaced', handleSessionReplaced)
    }

    let socket = io(SOCKET_BASE_URL, opts)
    socketRef.current = socket
    attachListeners(socket)

    socket.on('connect_error', () => {
      if (!SOCKET_FALLBACK_BASE_URL || triedFallbackRef.current) return
      triedFallbackRef.current = true
      socket.removeAllListeners()
      disconnectSocketSafe(socket)
      socket = io(SOCKET_FALLBACK_BASE_URL, opts)
      socketRef.current = socket
      attachListeners(socket)
    })

    return () => {
      triedFallbackRef.current = false
      handlingRef.current = false
      disconnectSocketSafe(socketRef.current)
      socketRef.current = null
    }
  }, [user?.id, isGuest, logout, t])

  return null
}
