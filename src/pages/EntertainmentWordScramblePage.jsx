import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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

export function EntertainmentWordScramblePage() {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [mode, setMode] = useState(/** @type {null | 'solo' | 'multi'} */ (null))
  const [multiPastLobby, setMultiPastLobby] = useState(false)
  const [playerCount, setPlayerCount] = useState(/** @type {null | number} */ (null))
  const [pendingJoinCode, setPendingJoinCode] = useState(/** @type {null | string} */ (null))
  const [difficulty, setDifficulty] = useState(/** @type {null | 'easy' | 'medium' | 'hard'} */ (null))
  const [isMatching, setIsMatching] = useState(false)

  const token = getAuthToken()
  const myUserId = user?.id ?? user?._id

  const lobbyParam = searchParams.get('lobby')

  useEffect(() => {
    if (!lobbyParam || !isAuthenticated) return
    const code = lobbyParam.trim().toUpperCase()
    if (code.length < 4) return
    setMode('multi')
    setPendingJoinCode(code)
    setMultiPastLobby(false)
    setPlayerCount(null)
  }, [lobbyParam, isAuthenticated])

  const clearLobbyQuery = useCallback(() => {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        p.delete('lobby')
        return p
      },
      { replace: true }
    )
  }, [setSearchParams])

  const onJoinedWithCapacity = useCallback(
    (n) => {
      setPlayerCount(n)
      setPendingJoinCode(null)
      clearLobbyQuery()
    },
    [clearLobbyQuery]
  )

  const lobbySocketEnabled =
    mode === 'multi' &&
    !multiPastLobby &&
    (!!pendingJoinCode || (playerCount != null && [2, 4, 6, 8].includes(playerCount)))

  const lobby = useWordScrambleLobby({
    enabled: lobbySocketEnabled,
    token,
    capacity: pendingJoinCode ? null : playerCount,
    joinCode: pendingJoinCode,
    myUserId: myUserId != null ? String(myUserId) : null,
    onMatchingStarted: () => {
      if (mode === 'multi') {
        setIsMatching(true)
      }
    },
    onGameStarted: (data) => {
      setMultiPastLobby(true)
      setIsMatching(false)
      setDifficulty('medium')
      console.log('Matchmaking AI Result:', data?.aiResult)
      if (data?.roomCode) {
        // Có thể cần logic chuyển hướng hoặc thông báo nếu cần, 
        // nhưng hiện tại EntertainmentWordScramble sẽ tự render dựa trên mode/playerCount
      }
    },
    onJoinedWithCapacity,
  })

  const handleModeSelect = (/** @type {'solo' | 'multi'} */ m) => {
    setMode(m)
    setMultiPastLobby(false)
    setPendingJoinCode(null)
    clearLobbyQuery()
  }

  const resetAll = () => {
    lobby.disconnectSocket()
    setMode(null)
    setMultiPastLobby(false)
    setPlayerCount(null)
    setPendingJoinCode(null)
    setDifficulty(null)
    clearLobbyQuery()
  }

  const resetDifficultyOnly = () => setDifficulty(null)

  const handleLobbyBack = () => {
    lobby.disconnectSocket()
    setPlayerCount(null)
    setPendingJoinCode(null)
    clearLobbyQuery()
    setMultiPastLobby(false)
  }

  return (
    <WordScrambleGameArena
      topBar={
        <div className="ws-topbar mx-1 sm:mx-2 mt-1">
          <Link to={ROUTES.SKILLS.ENTERTAINMENT} className="ws-link-back">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span className="hidden sm:inline">{t('enter.backToGameList')}</span>
          </Link>
          <div className="flex items-center gap-2 flex-wrap justify-end">
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
          </div>
        </div>
      }
    >
      {mode == null ? (
        <WordScrambleModePicker onSelect={handleModeSelect} />
      ) : mode === 'multi' && playerCount == null && !pendingJoinCode && !isMatching ? (
        <WordScramblePlayerCountPicker
          onSelect={(n) => {
            setPlayerCount(n)
            lobby.findMatch(n)
            setIsMatching(true)
          }}
          onBack={() => {
            setMode(null)
            setMultiPastLobby(false)
            clearLobbyQuery()
          }}
        />
      ) : isMatching ? (
        <WordScrambleMatching 
          onCancel={() => {
            setIsMatching(false)
            setPlayerCount(null)
            lobby.leaveRoom()
          }}
        />
      ) : mode === 'multi' && (playerCount != null || pendingJoinCode) && !multiPastLobby ? (
        <WordScrambleMultiLobby lobby={lobby} onBack={handleLobbyBack} />
      ) : difficulty == null && mode === 'solo' ? (
        <WordScrambleDifficultyPicker
          onSelect={setDifficulty}
          onBack={() => (mode === 'multi' ? setMultiPastLobby(false) : setMode(null))}
          backLabelKey={mode === 'multi' ? 'enter.game.backMultiLobby' : 'enter.game.backPickMode'}
        />
      ) : (
        <EntertainmentWordScramble
          key={`${mode}-${mode === 'multi' ? playerCount : ''}-${difficulty}`}
          fullScreen
          gameMode={mode}
          playerCount={mode === 'multi' ? playerCount ?? 2 : 1}
          difficulty={difficulty}
        />
      )}
    </WordScrambleGameArena>
  )
}
