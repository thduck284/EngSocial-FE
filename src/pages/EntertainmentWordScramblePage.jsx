import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../constants'
import { useAuth } from '../context/AuthContext'
import { getAuthToken } from '../utils/auth'
import { useWordScrambleLobby } from '../hooks/useWordScrambleLobby'
import { EntertainmentWordScramble } from '../components/entertainment/EntertainmentWordScramble'
import { WordScrambleModePicker } from '../components/entertainment/WordScrambleModePicker'
import { WordScrambleDifficultyPicker } from '../components/entertainment/WordScrambleDifficultyPicker'
import { WordScramblePlayerCountPicker } from '../components/entertainment/WordScramblePlayerCountPicker'
import { WordScrambleMatching } from '../components/entertainment/WordScrambleMatching'
import { WordScrambleMultiLobby } from '../components/entertainment/WordScrambleMultiLobby'
import { WordScrambleGameArena } from '../components/entertainment/WordScrambleGameArena'
import { WordScrambleInviteBubble } from '../components/entertainment/WordScrambleInviteBubble'
import { AlertModal } from '../components/ui/common/AlertModal'

export function EntertainmentWordScramblePage() {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { lobbyCode } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [mode, setMode] = useState(/** @type {null | 'solo' | 'multi'} */(null))
  const [multiPastLobby, setMultiPastLobby] = useState(false)
  const [playerCount, setPlayerCount] = useState(/** @type {null | number} */(null))
  const [pendingJoinCode, setPendingJoinCode] = useState(/** @type {null | string} */(null))
  const [difficulty, setDifficulty] = useState(/** @type {null | 'easy' | 'medium' | 'hard'} */(null))
  const [isMatching, setIsMatching] = useState(false)
  const [inviteCopied, setInviteCopied] = useState(false)
  const [isInviteBubbleOpen, setIsInviteBubbleOpen] = useState(false)
  const [activeRoomCode, setActiveRoomCode] = useState(/** @type {string | null} */(null))
  const [actualMatchedCount, setActualMatchedCount] = useState(/** @type {number | null} */(null))
  const [pendingQuickMatchCapacity, setPendingQuickMatchCapacity] = useState(/** @type {number | null} */(null))
  const [leaveLobbyModalOpen, setLeaveLobbyModalOpen] = useState(false)
  const pendingAfterLeaveRef = useRef(/** @type {(() => void) | null} */ (null))
  const leaveLobbyModalOpenRef = useRef(false)
  leaveLobbyModalOpenRef.current = leaveLobbyModalOpen

  const token = getAuthToken()
  const myUserId = user?.id ?? user?._id

  const onJoinedWithCapacity = useCallback(
    (n) => {
      setPlayerCount(n)
      // Vào phòng qua URL /lobby/:code — giữ pendingJoinCode = mã URL.
      // Nếu clear pendingJoinCode, hook đổi joinCode null + capacity N → effect reset socket
      // → emit create thay vì ở phòng → crash/reconnect liên tục.
      if (!lobbyCode) {
        setPendingJoinCode(null)
      }
    },
    [lobbyCode],
  )

  const lobbySocketEnabled =
    (mode === 'multi-quick' || mode === 'multi-private') &&
    !multiPastLobby &&
    (!!pendingJoinCode || (playerCount != null && [2, 4, 6, 8].includes(playerCount)))

  const lobby = useWordScrambleLobby({
    enabled: lobbySocketEnabled,
    token,
    capacity: pendingJoinCode ? null : playerCount,
    joinCode: pendingJoinCode,
    myUserId: myUserId != null ? String(myUserId) : null,
    onMatchingStarted: () => {
      setIsMatching(true)
    },
    onMatchingEnded: () => {
      setIsMatching(false)
    },
    onGameStarted: (data) => {
      // Không dùng `lobby` ở đây — callback nằm trong object truyền vào useWordScrambleLobby
      // nên `const lobby = ...` chưa gán xong → TDZ ReferenceError.
      const slots = data?.fullRoom?.slots
      const fromRoom =
        Array.isArray(slots) ? slots.filter((s) => s != null).length : 0
      const n =
        fromRoom ||
        (Number.isFinite(Number(data?.matchCount)) ? Number(data.matchCount) : 0) ||
        playerCount ||
        2
      setActualMatchedCount(n)

      if (data?.roomCode) {
        setActiveRoomCode(data.roomCode)
      }

      setMultiPastLobby(true)
      setIsMatching(false)
      setDifficulty('medium')
      console.log('Matchmaking AI Result:', data?.aiResult)
    },
    onJoinedWithCapacity,
  })

  /** Phòng riêng: server bật lobby.isMatching trước khi ref callback kịp sync — phải OR với state trang */
  const showMatchingUi = isMatching || lobby.isMatching

  // Đồng bộ URL /lobby/:code — phải đặt sau `lobby` (tránh TDZ "lobby before initialization").
  useEffect(() => {
    if (!lobbyCode || !isAuthenticated) return
    // Đã vào game sau started — không reset lobby (tránh nhảy về lobby + tắt socket game).
    if (multiPastLobby) return

    const code = lobbyCode.trim().toUpperCase()
    if (code.length < 4) return
    setMode('multi-private')

    const myRoom = lobby.roomCode ? String(lobby.roomCode).toUpperCase() : ''
    // Merge phòng: server state là mã phòng còn lại, URL vẫn mã cũ — đổi URL + pending, KHÔNG reset multiPastLobby/playerCount
    if (lobby.connected && myRoom && myRoom !== code) {
      setPendingJoinCode(myRoom)
      navigate(`/practice/entertainment/word-scramble/lobby/${myRoom}`, { replace: true })
      return
    }

    // Host vừa tạo phòng rồi replace URL — đừng set pendingJoinCode/clear playerCount
    // vì đổi props hook sẽ disconnect socket, server xóa phòng → invite: room_not_found.
    const alreadyInThisRoom =
      lobby.connected && myRoom && myRoom === code
    if (alreadyInThisRoom) return

    setPendingJoinCode(code)
    setMultiPastLobby(false)
    setPlayerCount(null)
  }, [lobbyCode, isAuthenticated, lobby.connected, lobby.roomCode, multiPastLobby, navigate])

  // Khi host tạo phòng xong và có roomCode, navigate tới URL lobby nếu chưa ở đó
  useEffect(() => {
    if (mode === 'multi-private' && lobby.roomCode && !lobbyCode) {
      navigate(`/practice/entertainment/word-scramble/lobby/${lobby.roomCode}`, { replace: true })
    }
  }, [mode, lobby.roomCode, lobbyCode, navigate])

  useEffect(() => {
    if (mode !== 'multi-quick') return
    if (!pendingQuickMatchCapacity) return
    if (!lobby.connected || !lobby.roomCode) return  // Wait for room to be created first
    lobby.findMatch(pendingQuickMatchCapacity)
    setIsMatching(true)
    setPendingQuickMatchCapacity(null)
  }, [mode, pendingQuickMatchCapacity, lobby.connected, lobby.roomCode, lobby])

  const handleModeSelect = (/** @type {'solo' | 'multi-quick' | 'multi-private'} */ m) => {
    setMode(m)
    setMultiPastLobby(false)
    setPendingJoinCode(null)
    setActiveRoomCode(null)
  }

  const resetAll = () => {
    lobby.disconnectSocket()
    setMode(null)
    setMultiPastLobby(false)
    setPlayerCount(null)
    setPendingJoinCode(null)
    setDifficulty(null)
    setIsMatching(false)
    setActualMatchedCount(null)
    setActiveRoomCode(null)
    setPendingQuickMatchCapacity(null)
    if (lobbyCode) {
      navigate('/practice/entertainment/word-scramble', { replace: true })
    }
  }

  const resetDifficultyOnly = () => setDifficulty(null)

  const isMulti = mode === 'multi-quick' || mode === 'multi-private'
  const isInLobby = isMulti && (playerCount != null || pendingJoinCode) && !multiPastLobby

  const clearLobbySessionState = useCallback(() => {
    lobby.disconnectSocket()
    setPlayerCount(null)
    setPendingJoinCode(null)
    setMultiPastLobby(false)
    setActiveRoomCode(null)
    setPendingQuickMatchCapacity(null)
  }, [lobby])

  const navigateLobbyListIfUrl = useCallback(() => {
    if (lobbyCode) {
      navigate('/practice/entertainment/word-scramble', { replace: true })
    }
  }, [lobbyCode, navigate])

  const requestLeaveLobby = useCallback((/** @type {(() => void) | null | undefined} */ afterLeave) => {
    pendingAfterLeaveRef.current = typeof afterLeave === 'function' ? afterLeave : null
    setLeaveLobbyModalOpen(true)
  }, [])

  const confirmLeaveLobby = useCallback(() => {
    clearLobbySessionState()
    const run = pendingAfterLeaveRef.current
    pendingAfterLeaveRef.current = null
    setLeaveLobbyModalOpen(false)
    if (run) run()
    else navigateLobbyListIfUrl()
  }, [clearLobbySessionState, navigateLobbyListIfUrl])

  const cancelLeaveLobby = useCallback(() => {
    pendingAfterLeaveRef.current = null
    setLeaveLobbyModalOpen(false)
  }, [])

  useEffect(() => {
    if (!isInLobby) return undefined
    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isInLobby])

  useEffect(() => {
    if (!isInLobby) return undefined
    const onDocClickCapture = (e) => {
      if (leaveLobbyModalOpenRef.current) return
      const t = e.target
      if (!(t instanceof Element)) return
      const el = t.closest('a[href]')
      if (!el) return
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const href = el.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      let nextUrl
      try {
        nextUrl = new URL(href, window.location.origin)
      } catch {
        return
      }
      if (nextUrl.origin !== window.location.origin) return
      const here = `${window.location.pathname}${window.location.search}`
      const there = `${nextUrl.pathname}${nextUrl.search}`
      if (there === here) return
      e.preventDefault()
      e.stopPropagation()
      pendingAfterLeaveRef.current = () => {
        navigate(there)
      }
      setLeaveLobbyModalOpen(true)
    }
    document.addEventListener('click', onDocClickCapture, true)
    return () => document.removeEventListener('click', onDocClickCapture, true)
  }, [isInLobby, navigate])

  const copyInvite = async () => {
    if (!lobby.inviteUrl) return
    try {
      await navigator.clipboard.writeText(lobby.inviteUrl)
      setInviteCopied(true)
      window.setTimeout(() => setInviteCopied(false), 2000)
    } catch { setInviteCopied(false) }
  }

  const toggleInviteBubble = (e) => {
    e?.stopPropagation?.()
    setIsInviteBubbleOpen(prev => !prev)
  }

  return (
    <>
    <WordScrambleGameArena
      topBar={
        <>
          {isInLobby ? (
            <button type="button" onClick={() => requestLeaveLobby()} className="ws-link-back px-1">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              <span className="hidden sm:inline">{t('enter.game.backPickPlayers')}</span>
            </button>
          ) : mode === 'solo' && difficulty != null ? (
            <button type="button" onClick={resetDifficultyOnly} className="ws-link-back px-1">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              <span className="hidden sm:inline">{t('enter.game.backPickDifficulty')}</span>
            </button>
          ) : mode != null ? (
            <button type="button" onClick={resetAll} className="ws-link-back px-1">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              <span className="hidden sm:inline">{t('enter.game.backPickMode')}</span>
            </button>
          ) : (
            <Link to={ROUTES.SKILLS.ENTERTAINMENT} className="ws-link-back">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              <span className="hidden sm:inline">{t('enter.backToGameList')}</span>
            </Link>
          )}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {isInLobby && lobby.roomCode && (
              <>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-fuchsia-300/80 px-2 py-1 rounded-lg border border-fuchsia-500/30 bg-fuchsia-950/40">
                  {t('enter.game.modeMultiTitle')}{lobby.capacity ? ` · ${lobby.capacity}P` : ''}
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-cyan-200/90 px-2 py-1 rounded-lg border border-cyan-500/25 bg-slate-950/60">
                  {lobby.roomCode}
                </span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={toggleInviteBubble}
                    disabled={!lobby.inviteUrl}
                    className="text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg border border-violet-400/40 bg-violet-500/15 text-violet-100 hover:bg-violet-500/25 disabled:opacity-40"
                  >
                    {t('enter.game.wsLobbyInvite')}
                  </button>

                  {isInviteBubbleOpen && (
                    <WordScrambleInviteBubble
                      lobby={lobby}
                      onClose={() => setIsInviteBubbleOpen(false)}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </>
      }
    >
      {mode == null ? (
        <WordScrambleModePicker onSelect={handleModeSelect} />
      ) : isMulti && playerCount == null && !pendingJoinCode && !showMatchingUi ? (
        <WordScramblePlayerCountPicker
          onSelect={(n) => {
            setPlayerCount(n)
            if (mode === 'multi-quick') {
              setPendingQuickMatchCapacity(n)
              setIsMatching(true) // Go straight to matching UI, skip lobby
            } else {
              // multi-private: Tạo phòng luôn
              lobby.create(n)
            }
          }}
          onBack={() => {
            setMode(null)
            setMultiPastLobby(false)
          }}
        />
      ) : showMatchingUi ? (
        <WordScrambleMatching
          onCancel={() => {
            setIsMatching(false)
            lobby.cancelStartMatching?.()
            if (mode === 'multi-quick') {
              setPlayerCount(null)
              setPendingQuickMatchCapacity(null)
              lobby.leaveRoom()
            }
            // multi-private: chỉ dừng poll + server xóa lastMatchRequest — không leaveRoom / không xóa playerCount
          }}
        />
      ) : isMulti && mode !== 'multi-quick' && (playerCount != null || pendingJoinCode) && !multiPastLobby ? (
        <WordScrambleMultiLobby lobby={lobby} onBack={() => requestLeaveLobby()} onInviteClick={() => setIsInviteBubbleOpen(true)} />
      ) : difficulty == null && mode === 'solo' ? (
        <WordScrambleDifficultyPicker
          onSelect={setDifficulty}
          onBack={() => (isMulti ? setMultiPastLobby(false) : setMode(null))}
          backLabelKey={isMulti ? 'enter.game.backMultiLobby' : 'enter.game.backPickMode'}
        />
      ) : (
        <EntertainmentWordScramble
          key={`${mode}-${isMulti ? playerCount : ''}-${difficulty}-${activeRoomCode}`}
          fullScreen
          gameMode={mode}
          roomCode={activeRoomCode}
          playerCount={isMulti ? (actualMatchedCount || playerCount || 2) : 1}
          difficulty={difficulty}
        />
      )}
    </WordScrambleGameArena>
    <AlertModal
      open={leaveLobbyModalOpen}
      title={t('enter.game.leaveLobbyTitle')}
      message={t('enter.game.leaveLobbyMessage')}
      confirmText={t('enter.game.leaveLobbyConfirm')}
      cancelText={t('enter.game.leaveLobbyCancel')}
      onClose={cancelLeaveLobby}
      onConfirm={confirmLeaveLobby}
    />
    </>
  )
}
