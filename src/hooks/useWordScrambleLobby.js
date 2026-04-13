import { useCallback, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { SOCKET_BASE_URL, SOCKET_FALLBACK_BASE_URL } from '../constants/api'

/**
 * Socket.IO phòng chờ Word Scramble multiplayer (không lưu DB; chat chỉ broadcast).
 * @param {{
 *   enabled: boolean,
 *   token: string | null,
 *   capacity: number | null,
 *   joinCode: string | null,
 *   myUserId: string | null,
 *   onMatchingStarted: () => void,
 *   onGameStarted: (data?: any) => void,
 *   onJoinedWithCapacity: (n: number) => void,
 * }} opts
 */
export function useWordScrambleLobby({
  enabled,
  token,
  capacity,
  joinCode,
  myUserId,
  onMatchingStarted,
  onGameStarted,
  onJoinedWithCapacity,
}) {
  const [connected, setConnected] = useState(false)
  const [roomState, setRoomState] = useState(/** @type {null | Record<string, unknown>} */ (null))
  const [initError, setInitError] = useState(/** @type {string | null} */ (null))
  const [startError, setStartError] = useState(/** @type {string | null} */ (null))
  const [isMatchingLocal, setIsMatchingLocal] = useState(false)
  const [chatTail, setChatTail] = useState(/** @type {Array<{ userId: string, name: string, text: string, ts: number }>} */ ([]))

  const socketRef = useRef(null)
  const initDoneRef = useRef(false)
  const onMatchingStartedRef = useRef(onMatchingStarted)
  const onGameStartedRef = useRef(onGameStarted)
  const onJoinedWithCapacityRef = useRef(onJoinedWithCapacity)
  onMatchingStartedRef.current = onMatchingStarted
  onGameStartedRef.current = onGameStarted
  onJoinedWithCapacityRef.current = onJoinedWithCapacity

  const leaveRoom = useCallback(() => {
    const s = socketRef.current
    if (s?.connected) s.emit('wordScrambleLobby:leave')
  }, [])

  const disconnectSocket = useCallback(() => {
    const s = socketRef.current
    if (s) {
      s.removeAllListeners()
      s.disconnect()
      socketRef.current = null
    }
    initDoneRef.current = false
    setConnected(false)
  }, [])

  useEffect(() => {
    if (!enabled) {
      disconnectSocket()
      setRoomState(null)
      setChatTail([])
      setInitError(null)
      setStartError(null)
      setIsMatchingLocal(false)
      return undefined
    }

    if (!token) {
      setInitError('login_required')
      return undefined
    }

    setInitError(null)
    const joinCodeNorm = joinCode ? String(joinCode).trim().toUpperCase() : null
    const cap = capacity != null ? Number(capacity) : null

    const opts = { auth: { token }, transports: ['websocket', 'polling'] }
    let socket = io(SOCKET_BASE_URL, opts)
    socketRef.current = socket

    function attachCoreListeners(s) {
      s.on('wordScrambleLobby:state', (state) => {
        setRoomState(state)
        if (Array.isArray(state?.chat)) setChatTail(state.chat)
      })
      s.on('wordScrambleLobby:chatMessage', (msg) => {
        if (msg && typeof msg === 'object') {
          setChatTail((prev) => [...prev.slice(-99), msg])
        }
      })
      s.on('wordScrambleLobby:matching', () => {
        setIsMatchingLocal(true)
        onMatchingStartedRef.current?.()
      })
      s.on('wordScrambleLobby:started', (data) => {
        if (data?.roomCode) {
          console.log('Match started for room:', data.roomCode)
        }
        onGameStartedRef.current?.(data)
        setIsMatchingLocal(false)
      })

      // LẮNG NGHE TIN NHẮN TOÀN CỤC (FAIL-SAFE)
      s.on('wordScrambleLobby:matchFoundGlobal', (data) => {
        const myId = String(myUserId)
        if (data?.userIds?.map(String).includes(myId)) {
          console.log('[Lobby] Global Match Found for me! Entering game...')
          onGameStartedRef.current?.(data)
          setIsMatchingLocal(false)
        }
      })
    }

    attachCoreListeners(socket)

    socket.on('connect', () => {
      setConnected(true)
      if (initDoneRef.current) return
      initDoneRef.current = true
      const done = (/** @type {{ ok?: boolean, error?: string, state?: unknown }} */ res) => {
        if (!res?.ok) {
          setInitError(res?.error || 'failed')
          initDoneRef.current = false
          return
        }
        if (res.state && typeof res.state === 'object') {
          setRoomState(res.state)
          const st = res.state
          if (Array.isArray(st.chat)) setChatTail(st.chat)
          const c = Number(st.capacity)
          if (Number.isFinite(c) && c > 0) onJoinedWithCapacityRef.current?.(c)
        }
      }
      if (joinCodeNorm) {
        socket.emit('wordScrambleLobby:join', { roomCode: joinCodeNorm }, done)
      } else if (cap != null && [2, 4, 6, 8].includes(cap)) {
        socket.emit('wordScrambleLobby:create', { capacity: cap }, done)
      } else {
        setInitError('bad_params')
        initDoneRef.current = false
      }
    })

    socket.on('connect_error', () => {
      if (!SOCKET_FALLBACK_BASE_URL) {
        setInitError('connect_failed')
        return
      }
      socket.removeAllListeners()
      socket.disconnect()
      socket = io(SOCKET_FALLBACK_BASE_URL, opts)
      socketRef.current = socket
      attachCoreListeners(socket)
      socket.on('connect', () => {
        setConnected(true)
        if (initDoneRef.current) return
        initDoneRef.current = true
        const done = (/** @type {{ ok?: boolean, error?: string, state?: unknown }} */ res) => {
          if (!res?.ok) {
            setInitError(res?.error || 'failed')
            initDoneRef.current = false
            return
          }
          if (res.state && typeof res.state === 'object') {
            setRoomState(res.state)
            const st = res.state
            if (Array.isArray(st.chat)) setChatTail(st.chat)
            const c = Number(st.capacity)
            if (Number.isFinite(c) && c > 0) onJoinedWithCapacityRef.current?.(c)
          }
        }
        if (joinCodeNorm) socket.emit('wordScrambleLobby:join', { roomCode: joinCodeNorm }, done)
        else if (cap != null && [2, 4, 6, 8].includes(cap)) {
          socket.emit('wordScrambleLobby:create', { capacity: cap }, done)
        } else {
          setInitError('bad_params')
          initDoneRef.current = false
        }
      })
      socket.on('connect_error', () => setInitError('connect_failed'))
    })

    return () => {
      socket.removeAllListeners()
      socket.emit('wordScrambleLobby:leave')
      socket.disconnect()
      socketRef.current = null
      initDoneRef.current = false
      setConnected(false)
    }
  }, [enabled, token, joinCode, capacity, disconnectSocket, myUserId])

  const setReady = useCallback((ready) => {
    socketRef.current?.emit('wordScrambleLobby:setReady', { ready }, () => {})
  }, [])

  const sendChat = useCallback((message) => {
    socketRef.current?.emit('wordScrambleLobby:chat', { message }, () => {})
  }, [])

  const findMatch = useCallback((cap) => {
    setStartError(null)
    setIsMatchingLocal(true)
    onMatchingStartedRef.current?.()
    socketRef.current?.emit('wordScrambleLobby:findMatch', { capacity: cap }, (/** @type {{ ok?: boolean, error?: string }} */ res) => {
      if (!res?.ok) {
        setStartError(res?.error || 'find_match_failed')
        setIsMatchingLocal(false)
      }
    })
  }, [])

  const create = useCallback((cap) => {
    setStartError(null)
    socketRef.current?.emit('wordScrambleLobby:create', { capacity: cap }, (/** @type {{ ok?: boolean, error?: string, state?: unknown }} */ res) => {
      if (!res?.ok) setStartError(res?.error || 'create_failed')
    })
  }, [])

  const startPollingRef = useRef(null)

  const stopStartLoop = () => {
    if (startPollingRef.current) {
      clearInterval(startPollingRef.current)
      startPollingRef.current = null
    }
  }

  const startGame = useCallback(() => {
    setStartError(null)
    setIsMatchingLocal(true)
    onMatchingStartedRef.current?.()

    const attempt = () => {
      socketRef.current?.emit('wordScrambleLobby:start', {}, (/** @type {{ ok?: boolean, error?: string }} */ res) => {
        if (res?.ok) {
          stopStartLoop()
        } else if (res?.error === 'not_enough_players') {
          // Room not full, keep spinning and wait for next poll
          console.log('Lobby is not full yet, retrying in 3s...')
        } else {
          setStartError(res?.error || 'start_failed')
          setIsMatchingLocal(false)
          stopStartLoop()
        }
      })
    }

    attempt()
    stopStartLoop()
    startPollingRef.current = setInterval(attempt, 3000)
  }, [])

  const slots = Array.isArray(roomState?.slots) ? roomState.slots : []
  const roomCode = typeof roomState?.roomCode === 'string' ? roomState.roomCode : ''
  const hostId = roomState?.hostId != null ? String(roomState.hostId) : ''
  const cap = Number(roomState?.capacity) || 0
  const myId = myUserId != null ? String(myUserId) : ''
  const occupied = slots.filter(Boolean)
  const mySlot = occupied.find((s) => s && String(s.userId) === myId)
  const seated = !!mySlot
  const myReady = !!(mySlot && mySlot.ready)
  const isHost = !!myId && !!hostId && myId === hostId
  const canStart = isHost && connected
  const isMatching = isMatchingLocal

  const inviteUrl =
    typeof window !== 'undefined' && roomCode
      ? `${window.location.origin}/practice/entertainment/word-scramble?lobby=${encodeURIComponent(roomCode)}`
      : ''

  return {
    connected,
    roomCode,
    capacity: cap,
    slots,
    hostId,
    chatMessages: chatTail,
    myReady,
    seated,
    isHost,
    canStart,
    initError,
    startError,
    setReady,
    sendChat,
    findMatch,
    create,
    startGame,
    leaveRoom,
    disconnectSocket,
    inviteUrl,
    isMatching,
  }
}
