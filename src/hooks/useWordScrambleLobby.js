import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const SOCKET_BASE_URL = 'http://localhost:5000'
const SOCKET_FALLBACK_BASE_URL = 'http://localhost:5001'

/**
 * @param {object} props
 * @param {boolean} props.enabled
 * @param {string|null} props.token
 * @param {number|null} [props.capacity] - Only for automatic matchmaking
 * @param {string|null} [props.joinCode] - If present, attempt to join this private room
 * @param {string|null} [props.myUserId]
 * @param {() => void} [props.onMatchingStarted]
 * @param {(data: any) => void} [props.onGameStarted]
 * @param {(capacity: number) => void} [props.onJoinedWithCapacity]
 * @param {(data: any) => void} [props.onInviteReceived]
 */
export const useWordScrambleLobby = ({
  enabled,
  token,
  capacity,
  joinCode,
  myUserId,
  onMatchingStarted,
  onGameStarted,
  onJoinedWithCapacity,
  onInviteReceived
}) => {
  const [connected, setConnected] = useState(false)
  const [initError, setInitError] = useState(null)
  const [startError, setStartError] = useState(null)
  const [roomState, setRoomState] = useState(null)
  const [chatTail, setChatTail] = useState([])
  const [isMatchingLocal, setIsMatchingLocal] = useState(false)

  const socketRef = useRef(null)
  const initDoneRef = useRef(false)
  const startPollingRef = useRef(null) // Phải để ở đây để startGame thấy

  const onGameStartedRef = useRef(onGameStarted)
  const onMatchingStartedRef = useRef(onMatchingStarted)
  const onJoinedWithCapacityRef = useRef(onJoinedWithCapacity)
  const onInviteReceivedRef = useRef(onInviteReceived)

  useEffect(() => { onGameStartedRef.current = onGameStarted }, [onGameStarted])
  useEffect(() => { onMatchingStartedRef.current = onMatchingStarted }, [onMatchingStarted])
  useEffect(() => { onJoinedWithCapacityRef.current = onJoinedWithCapacity }, [onJoinedWithCapacity])
  useEffect(() => { onInviteReceivedRef.current = onInviteReceived }, [onInviteReceived])

  const stopStartLoop = useCallback(() => {
    if (startPollingRef.current) {
      clearInterval(startPollingRef.current)
      startPollingRef.current = null
    }
  }, [])

  const disconnectSocket = useCallback(() => {
    stopStartLoop()
    const s = socketRef.current
    if (s) {
      s.removeAllListeners()
      s.disconnect()
      socketRef.current = null
    }
    initDoneRef.current = false
    setConnected(false)
  }, [stopStartLoop])

  useEffect(() => {
    initDoneRef.current = false
    
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
        onGameStartedRef.current?.(data)
        setIsMatchingLocal(false)
      })
      s.on('wordScrambleLobby:inviteReceived', (data) => {
        if (typeof onInviteReceivedRef.current === 'function') {
          onInviteReceivedRef.current(data)
        }
      })
      s.on('wordScrambleLobby:matchFoundGlobal', (data) => {
        const myId = String(myUserId)
        if (data?.userIds?.map(String).includes(myId)) {
          onGameStartedRef.current?.(data)
          setIsMatchingLocal(false)
        }
      })
    }

    attachCoreListeners(socket)

    socket.on('connect', () => {
      setConnected(true)
      const currentCode = roomState?.roomCode || roomState?.code || ''
      if (currentCode && joinCodeNorm && currentCode.toUpperCase() === joinCodeNorm.toUpperCase()) {
        return
      }
      if (initDoneRef.current) return
      initDoneRef.current = true

      const done = (res) => {
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
      }
    })

    socket.on('connect_error', () => {
      socket.removeAllListeners()
      socket.disconnect()
      socket = io(SOCKET_FALLBACK_BASE_URL, opts)
      socketRef.current = socket
      attachCoreListeners(socket)
      socket.on('connect', () => {
        setConnected(true)
        if (initDoneRef.current) return
        initDoneRef.current = true
        const done = (res) => {
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
        }
      })
    })

    return () => {
      stopStartLoop()
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
      initDoneRef.current = false
      setConnected(false)
    }
  }, [enabled, token, joinCode, capacity, myUserId, disconnectSocket, stopStartLoop])

  const setReady = useCallback((ready) => {
    socketRef.current?.emit('wordScrambleLobby:setReady', { ready }, () => {})
  }, [])

  const sendChat = useCallback((text) => {
    socketRef.current?.emit('wordScrambleLobby:chat', { text }, () => {})
  }, [])

  const findMatch = useCallback((cap) => {
    setInitError(null)
    setStartError(null)
    setIsMatchingLocal(true)
    onMatchingStartedRef.current?.()
    socketRef.current?.emit('wordScrambleLobby:findMatch', { capacity: cap }, (res) => {
      if (!res?.ok) {
        setStartError(res?.error || 'find_match_failed')
        setIsMatchingLocal(false)
      }
    })
  }, [])

  const create = useCallback((cap) => {
    setInitError(null)
    setStartError(null)
    socketRef.current?.emit('wordScrambleLobby:create', { capacity: cap }, (res) => {
      if (res?.ok && res.state) {
        setRoomState(res.state)
        if (res.state.capacity) {
          onJoinedWithCapacityRef.current?.(Number(res.state.capacity))
        }
      } else if (!res?.ok) {
        setStartError(res?.error || 'create_failed')
      }
    })
  }, [])

  const startGame = useCallback(() => {
    setStartError(null)
    setIsMatchingLocal(true)
    onMatchingStartedRef.current?.()

    const attempt = () => {
      socketRef.current?.emit('wordScrambleLobby:start', {}, (res) => {
        if (res?.ok) {
          stopStartLoop()
        } else if (res?.error === 'not_enough_players') {
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
  }, [stopStartLoop])

  const slots = Array.isArray(roomState?.slots) ? roomState.slots : []
  const roomCode = roomState?.roomCode || roomState?.code || ''
  const hostId = roomState?.hostId != null ? String(roomState.hostId) : ''
  const cap = Number(roomState?.capacity) || 0
  const myId = myUserId != null ? String(myUserId) : ''
  const occupied = slots.filter(Boolean)
  const mySlot = occupied.find((s) => s && String(s.userId) === myId)
  const seated = !!mySlot
  const myReady = !!(mySlot && mySlot.ready)
  const isHost = !!myId && !!hostId && myId === hostId
  const canStart = isHost && connected
  
  const inviteUrl =
    typeof window !== 'undefined' && roomCode
      ? `${window.location.origin}/practice/entertainment/word-scramble/lobby/${encodeURIComponent(roomCode)}`
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
    leaveRoom: () => {
      socketRef.current?.emit('wordScrambleLobby:leave')
      setRoomState(null)
    },
    disconnectSocket,
    inviteUrl,
    isMatching: isMatchingLocal,
    inviteFriend: (friendId, inviteUrl) => {
      const s = socketRef.current
      if (s?.connected) {
        s.emit('wordScrambleLobby:invite', { 
          friendId, 
          roomCode: roomCode || roomState?.code,
          inviteUrl 
        }, (res) => {
           if (res?.ok) {
             console.log('[Lobby] Invite sent to', friendId)
             alert('Backend received: OK')
           } else {
             console.error('[Lobby] Invite failed:', res?.error)
             alert('Backend received error: ' + res?.error)
           }
        })
      } else {
        alert("Socket NOT connected when emitting invite!")
      }
    }
  }
}
