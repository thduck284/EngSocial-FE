import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import { SOCKET_ENABLED, SOCKET_BASE_URL, SOCKET_FALLBACK_BASE_URL } from '../constants/api'
import { getAuthToken } from '../utils/auth'
import { WordScrambleIncomingInviteModal } from './entertainment/WordScrambleIncomingInviteModal'

export function GlobalGameInviteListener() {
  const { user } = useAuth()
  const socketRef = useRef(null)
  const triedFallbackRef = useRef(false)
  const [incomingInvite, setIncomingInvite] = useState(null)

  useEffect(() => {
    if (!SOCKET_ENABLED || !user) return
    const token = getAuthToken()
    if (!token) return
    const opts = { auth: { token }, transports: ['websocket', 'polling'] }

    function attachListeners(s) {
      s.on('wordScrambleLobby:inviteReceived', (data) => {
        alert("Frontend GLOBAL listener caught: " + JSON.stringify(data))
        setIncomingInvite(data)
      })
    }

    let socket = io(SOCKET_BASE_URL, opts)
    socketRef.current = socket
    attachListeners(socket)
    
    socket.on('connect_error', () => {
      if (!SOCKET_FALLBACK_BASE_URL || triedFallbackRef.current) return
      triedFallbackRef.current = true
      socket.removeAllListeners()
      socket.disconnect()
      socket = io(SOCKET_FALLBACK_BASE_URL, opts)
      socketRef.current = socket
      attachListeners(socket)
    })

    return () => {
      triedFallbackRef.current = false
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [user])

  return (
    <WordScrambleIncomingInviteModal 
      invite={incomingInvite}
      onAccept={(invite) => {
        window.location.href = invite.inviteUrl
        setIncomingInvite(null)
      }}
      onCancel={() => setIncomingInvite(null)}
    />
  )
}
