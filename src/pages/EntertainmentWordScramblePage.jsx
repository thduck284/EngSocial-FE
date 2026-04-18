import { useCallback, useEffect, useState } from 'react'
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

  const token = getAuthToken()
  const myUserId = user?.id ?? user?._id



  useEffect(() => {
    if (!lobbyCode || !isAuthenticated) return
    const code = lobbyCode.trim().toUpperCase()
    if (code.length < 4) return
    setMode('multi-private')
    setPendingJoinCode(code)
    setMultiPastLobby(false)
    setPlayerCount(null)
  }, [lobbyCode, isAuthenticated])

  const onJoinedWithCapacity = useCallback(
    (n) => {
      setPlayerCount(n)
      setPendingJoinCode(null)
    },
    []
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
      if (mode === 'multi-quick' || mode === 'multi-private') {
        setIsMatching(true)
      }
    },
    onGameStarted: (data) => {
      // Capture the actual players from the lobby before it disconnects
      const n = lobby.slots.filter(s => s != null).length || playerCount || 2
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

  // Khi host tạo phòng xong và có roomCode, navigate tới URL lobby nếu chưa ở đó
  useEffect(() => {
    if (mode === 'multi-private' && lobby.roomCode && !lobbyCode) {
      navigate(`/practice/entertainment/word-scramble/lobby/${lobby.roomCode}`, { replace: true })
    }
  }, [mode, lobby.roomCode, lobbyCode, navigate])

  useEffect(() => {
    if (mode !== 'multi-quick') return
    if (!pendingQuickMatchCapacity) return
    if (!lobby.connected) return
    lobby.findMatch(pendingQuickMatchCapacity)
    setIsMatching(true)
    setPendingQuickMatchCapacity(null)
  }, [mode, pendingQuickMatchCapacity, lobby.connected, lobby])

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

  const handleLobbyBack = () => {
    lobby.disconnectSocket()
    setPlayerCount(null)
    setPendingJoinCode(null)
    setMultiPastLobby(false)
    setActiveRoomCode(null)
    setPendingQuickMatchCapacity(null)
    if (lobbyCode) {
      navigate('/practice/entertainment/word-scramble', { replace: true })
    }
  }

  const isMulti = mode === 'multi-quick' || mode === 'multi-private'
  const isInLobby = isMulti && (playerCount != null || pendingJoinCode) && !multiPastLobby

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
    <WordScrambleGameArena
      topBar={
        <>
          {isInLobby ? (
            <button type="button" onClick={handleLobbyBack} className="ws-link-back px-1">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              <span className="hidden sm:inline">{t('enter.game.backPickPlayers')}</span>
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
            {isInLobby && lobby.roomCode ? (
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
            ) : (
              <>
                {mode === 'solo' && difficulty != null && (
                  <button type="button" onClick={resetDifficultyOnly} className="ws-chip-btn">
                    {t('enter.game.changeDifficulty')}
                  </button>
                )}
                {mode != null && (
                  <button type="button" onClick={resetAll} className="ws-chip-btn">
                    {t('enter.game.changeMode')}
                  </button>
                )}
              </>
            )}
          </div>
        </>
      }
    >
      {mode == null ? (
        <WordScrambleModePicker onSelect={handleModeSelect} />
      ) : isMulti && playerCount == null && !pendingJoinCode && !isMatching ? (
        <WordScramblePlayerCountPicker
          onSelect={(n) => {
            setPlayerCount(n)
            if (mode === 'multi-quick') {
              setPendingQuickMatchCapacity(n)
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
      ) : isMatching ? (
        <WordScrambleMatching
          onCancel={() => {
            setIsMatching(false)
            setPlayerCount(null)
            setPendingQuickMatchCapacity(null)
            lobby.leaveRoom()
          }}
        />
      ) : isMulti && (playerCount != null || pendingJoinCode) && !multiPastLobby ? (
        <WordScrambleMultiLobby lobby={lobby} onBack={handleLobbyBack} onInviteClick={() => setIsInviteBubbleOpen(true)} />
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
  )
}
