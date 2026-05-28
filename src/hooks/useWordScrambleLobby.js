import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { SOCKET_BASE_URL, SOCKET_FALLBACK_BASE_URL } from '../constants/api'

/**
 * @param {object} props
 * @param {boolean} props.enabled
 * @param {string|null} props.token
 * @param {number|null} [props.capacity] - Only for automatic matchmaking
 * @param {string|null} [props.joinCode] - If present, attempt to join this private room
 * @param {string|null} [props.myUserId]
 * @param {() => void} [props.onMatchingStarted]
 * @param {() => void} [props.onMatchingEnded] — server emit matchingEnd (hủy ghép chủ phòng)
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
  onMatchingEnded,
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
  /** Tránh gọi onMatchingEnded mỗi lần state (chat/ready) khi findingMatch vẫn false */
  const findingMatchPrevRef = useRef(undefined)

  const onGameStartedRef = useRef(onGameStarted)
  const onMatchingStartedRef = useRef(onMatchingStarted)
  const onMatchingEndedRef = useRef(onMatchingEnded)
  const onJoinedWithCapacityRef = useRef(onJoinedWithCapacity)
  const onInviteReceivedRef = useRef(onInviteReceived)
  /** Không đưa myUserId vào deps của effect socket — auth load xong đổi id → disconnect → khách lỡ matching/start */
  const myUserIdRef = useRef(myUserId)

  // Gán mỗi render (trước paint) — tránh socket `matching` tới trước khi useEffect kịp sync ref → khách không setIsMatching.
  onGameStartedRef.current = onGameStarted
  onMatchingStartedRef.current = onMatchingStarted
  onMatchingEndedRef.current = onMatchingEnded
  onJoinedWithCapacityRef.current = onJoinedWithCapacity
  onInviteReceivedRef.current = onInviteReceived
  myUserIdRef.current = myUserId

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
      try {
        s.emit('wordScrambleLobby:leave')
      } catch {
        /* ignore */
      }
      s.removeAllListeners()
      s.disconnect()
      socketRef.current = null
    }
    initDoneRef.current = false
    setConnected(false)
    setRoomState(null)
    setChatTail([])
  }, [stopStartLoop])

  useEffect(() => {
    initDoneRef.current = false
    findingMatchPrevRef.current = undefined

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

    /** Debug: nhận event từ server (bật khi dev, tắt khi build production) */
    const lobbyRx = (event, detail) => {
      if (import.meta.env?.DEV) {
        console.log('[WordScrambleLobby] ←', event, detail !== undefined ? detail : '')
      }
    }

    function applyFindingMatchFromState(state) {
      if (!state || !Object.prototype.hasOwnProperty.call(state, 'findingMatch')) return
      const fm = !!state.findingMatch
      setIsMatchingLocal(fm)
      const prev = findingMatchPrevRef.current
      if (prev !== fm) {
        findingMatchPrevRef.current = fm
        if (fm) onMatchingStartedRef.current?.()
        else if (prev === true) onMatchingEndedRef.current?.()
      }
    }

    function attachCoreListeners(s) {
      s.on('wordScrambleLobby:state', (state) => {
        lobbyRx('wordScrambleLobby:state', {
          code: state?.code ?? state?.roomCode,
          findingMatch: state?.findingMatch,
          players: Array.isArray(state?.slots) ? state.slots.filter(Boolean).length : 0,
        })
        setRoomState(state)
        if (Array.isArray(state?.chat)) setChatTail(state.chat)
        applyFindingMatchFromState(state)
      })
      s.on('wordScrambleLobby:chatMessage', (msg) => {
        if (msg && typeof msg === 'object') {
          lobbyRx('wordScrambleLobby:chatMessage', { from: msg.name, len: String(msg.text || '').length })
          setChatTail((prev) => [...prev.slice(-99), msg])
        }
      })
      s.on('wordScrambleLobby:matching', () => {
        lobbyRx('wordScrambleLobby:matching', { socketId: s.id })
        setIsMatchingLocal(true)
        onMatchingStartedRef.current?.()
      })
      s.on('wordScrambleLobby:matchingEnd', () => {
        lobbyRx('wordScrambleLobby:matchingEnd', { socketId: s.id })
        setIsMatchingLocal(false)
        onMatchingEndedRef.current?.()
      })
      s.on('wordScrambleLobby:started', (data) => {
        lobbyRx('wordScrambleLobby:started', {
          roomCode: data?.roomCode,
          others: data?.others?.length,
          socketId: s.id,
        })
        onGameStartedRef.current?.(data)
        setIsMatchingLocal(false)
      })
      s.on('wordScrambleLobby:inviteReceived', (data) => {
        lobbyRx('wordScrambleLobby:inviteReceived', { roomCode: data?.roomCode, inviterId: data?.inviterId })
        if (typeof onInviteReceivedRef.current === 'function') {
          onInviteReceivedRef.current(data)
        }
      })
      s.on('wordScrambleLobby:matchFoundGlobal', (data) => {
        const myId = myUserIdRef.current != null ? String(myUserIdRef.current) : ''
        const hit = myId && data?.userIds?.map(String).includes(myId)
        lobbyRx('wordScrambleLobby:matchFoundGlobal', { roomCode: data?.roomCode, forMe: hit })
        if (hit) {
          onGameStartedRef.current?.(data)
          setIsMatchingLocal(false)
        }
      })
    }

    attachCoreListeners(socket)

    socket.on('connect', () => {
      lobbyRx('socket.io connect', { socketId: socket.id, joinCode: joinCodeNorm, capacity: cap })
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
          applyFindingMatchFromState(st)
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
        lobbyRx('socket.io connect (fallback)', { socketId: socket.id, joinCode: joinCodeNorm, capacity: cap })
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
            applyFindingMatchFromState(st)
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
      findingMatchPrevRef.current = undefined
      setConnected(false)
      setRoomState(null)
      setChatTail([])
    }
  }, [enabled, token, joinCode, capacity, disconnectSocket, stopStartLoop])

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
    // Không bật matching optimistic: server chỉ emit matching/state sau khi qua allReady.
    // Bật sớm → chủ thấy màn ghép dù ack players_not_ready → Hủy → khách chỉ nhận matchingEnd.

    const attempt = () => {
      if (import.meta.env?.DEV) {
        console.log('[WordScrambleLobby] → emit wordScrambleLobby:start', { socketId: socketRef.current?.id })
      }
      socketRef.current?.emit('wordScrambleLobby:start', {}, (res) => {
        if (import.meta.env?.DEV) {
          console.log('[WordScrambleLobby] ← ack wordScrambleLobby:start', res)
        }
        if (res?.ok) {
          stopStartLoop()
        } else if (res?.error === 'not_enough_players') {
          console.log('Lobby is not full yet, retrying in 3s...')
        } else if (res?.error === 'players_not_ready') {
          setStartError('not_all_ready')
          setIsMatchingLocal(false)
          onMatchingEndedRef.current?.()
          stopStartLoop()
        } else {
          setStartError(res?.error || 'start_failed')
          setIsMatchingLocal(false)
          onMatchingEndedRef.current?.()
          stopStartLoop()
        }
      })
    }

    attempt()
    stopStartLoop()
    startPollingRef.current = setInterval(attempt, 3000)
  }, [stopStartLoop])

  const cancelStartMatching = useCallback(() => {
    stopStartLoop()
    setIsMatchingLocal(false)
    socketRef.current?.emit('wordScrambleLobby:cancelStart', {}, () => {})
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
  /** Chỉ bật Start khi mọi slot có người (không tính chủ phòng) đã ready — server vẫn set ready cho chủ khi Start. */
  const othersReady =
    occupied
      .filter((s) => s && String(s.userId) !== String(hostId))
      .every((s) => !!s.ready)
  const canStart = isHost && connected && othersReady

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
    cancelStartMatching,
    leaveRoom: () => {
      socketRef.current?.emit('wordScrambleLobby:leave')
      setRoomState(null)
    },
    disconnectSocket,
    inviteUrl,
    isMatching: isMatchingLocal,
    inviteFriend: (friendId, inviteUrl, onResult) => {
      const s = socketRef.current
      const code = String(roomCode || roomState?.code || '')
        .trim()
        .toUpperCase()
      if (!s?.connected) {
        onResult?.({ ok: false, error: 'socket_disconnected' })
        return
      }
      if (!code) {
        onResult?.({ ok: false, error: 'no_room_code' })
        return
      }
      s.emit(
        'wordScrambleLobby:invite',
        { friendId: String(friendId), roomCode: code, inviteUrl },
        (res) => {
          if (res?.ok) {
            console.log('[Lobby] Invite sent to', friendId, res?.friendOnline === false ? '(bạn chưa mở app / mất kết nối socket)' : '')
          } else {
            console.warn('[Lobby] Invite failed:', res?.error)
          }
          onResult?.(res)
        },
      )
    },
  }
}
