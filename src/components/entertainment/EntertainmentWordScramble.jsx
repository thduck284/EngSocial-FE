import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { toast } from 'react-hot-toast'
import { wordScrambleService } from '../../services/wordScramble.service'
import { scrambleLetters } from '../../utils/scrambleLetters'
import { SOCKET_BASE_URL } from '../../constants/api'
import { getAuthToken } from '../../utils/auth'
import { useAuth } from '../../context/AuthContext'
import { avatarForPlayer, slotsToGamePlayers, DEFAULT_AVATAR } from '../../utils/entertainmentPlayer'

const MULTI_PLAYER_COUNTS = [2, 4, 6, 8]

/** @param {{ fullScreen?: boolean, gameMode?: 'solo' | 'multi' | 'multi-quick' | 'multi-private', roomCode?: string | null, playerCount?: number, difficulty?: 'easy' | 'medium' | 'hard', initialPlayers?: Array<object> }} props */
export function EntertainmentWordScramble({
  fullScreen = false,
  gameMode = 'solo',
  roomCode = null,
  playerCount = 2,
  difficulty = 'medium',
  initialPlayers = [],
}) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isMulti = gameMode && gameMode.startsWith('multi')
  const rawPc = Number(playerCount) || 2
  const nPlayers = isMulti
    ? MULTI_PLAYER_COUNTS.includes(rawPc)
      ? rawPc
      : MULTI_PLAYER_COUNTS[0]
    : 1
  const shellRef = useRef(null)
  const socketRef = useRef(null)

  const [entry, setEntry] = useState(null)
  const [scrambled, setScrambled] = useState('')
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)

  // Trạng thái Network Game
  const [networkPlayers, setNetworkPlayers] = useState(() => slotsToGamePlayers(initialPlayers))
  const [activePlayerIdx, setActivePlayerIdx] = useState(0)
  const [roundId, setRoundId] = useState(0)
  const [timeLimitSec, setTimeLimitSec] = useState(null)
  const [timeLeftSec, setTimeLeftSec] = useState(null)
  const [gameEnded, setGameEnded] = useState(false)

  // Trạng thái Local Multi Game
  const [activePlayer, setActivePlayer] = useState(1)

  const [scores, setScores] = useState(() =>
    Object.fromEntries(Array.from({ length: nPlayers }, (_, i) => [i + 1, 0]))
  )
  const [streaks, setStreaks] = useState(() =>
    Object.fromEntries(Array.from({ length: nPlayers }, (_, i) => [i + 1, 0]))
  )
  const [wrongPulse, setWrongPulse] = useState(false)
  const [loadingWord, setLoadingWord] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  const myId = user?.id || user?._id

  useEffect(() => {
    if (initialPlayers?.length) {
      setNetworkPlayers(slotsToGamePlayers(initialPlayers))
    }
  }, [roomCode, initialPlayers])

  const displayPlayers = useMemo(() => {
    if (networkPlayers.length > 0) return networkPlayers
    return slotsToGamePlayers(initialPlayers)
  }, [networkPlayers, initialPlayers])

  // Helper sync logic
  const applyGameState = useCallback((game) => {
    if (!game) return
    setNetworkPlayers(game.players || [])
    setActivePlayerIdx(game.turnIndex || 0)
    setRoundId(Number(game.currentRoundId || 0))
    if (game.status === 'finished') {
      window.setTimeout(() => {
        navigate(`/practice/entertainment/word-scramble/result/${roomCode}`, {
          state: {
            gameSnapshot: {
              roomCode,
              players: game.players || [],
              status: 'finished',
            },
          },
        })
      }, 1500)
    }
    setGameEnded(game.status === 'finished')

    const isNewWord = game.currentWord?.word && String(game.currentWord.word).trim().toLowerCase() !== entry?.word

    if (game.currentWord && isNewWord) {
      const w = game.currentWord
      const word = String(w.word).trim().toLowerCase()
      setEntry({
        word,
        meaning: String(w.meaning ?? '').trim(),
        example: w.example ? String(w.example).trim() : '',
      })
      setScrambled(scrambleLetters(word))
      const nextLimit = Number(w.timeLimitSec) || null
      setTimeLimitSec(nextLimit)
      setTimeLeftSec(nextLimit)
      setInput('')
      setFeedback(null)
      setLoadingWord(false)
    } else if (game.players) {
      setLoadingWord(false)
    }
  }, [entry, navigate, roomCode])

  // SOCKET CONNECTION
  useEffect(() => {
    if (!isMulti || !roomCode) return undefined

    const token = getAuthToken()
    const socket = io(SOCKET_BASE_URL, { auth: { token } })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('wordScrambleGame:join', { roomCode, difficulty }, (res) => {
        if (res?.ok && res.state) {
          applyGameState(res.state)
        }
      })
    })

    socket.on('wordScrambleGame:update', (data) => {
      if (data?.game) applyGameState(data.game)
    })

    socket.on('wordScrambleGame:newWord', ({ wordData }) => {
      if (wordData) {
        const word = String(wordData.word).trim().toLowerCase()
        setEntry({
          word,
          meaning: String(wordData.meaning ?? '').trim(),
          example: wordData.example ? String(wordData.example).trim() : '',
        })
        setScrambled(scrambleLetters(word))
        const nextLimit = Number(wordData.timeLimitSec) || null
        setTimeLimitSec(nextLimit)
        setTimeLeftSec(nextLimit)
        setInput('')
        setFeedback(null)
        setLoadingWord(false)
      }
    })
    socket.on('wordScrambleGame:ended', ({ reason }) => {
      setGameEnded(true)
      if (reason === 'timeout') {
        setFeedback('timeout')
      }
      setTimeLeftSec(0)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [isMulti, roomCode, applyGameState, difficulty])

  // ONLINE MULTIPLAYER TIMER
  useEffect(() => {
    if (!isMulti) return undefined
    if (!timeLeftSec || timeLeftSec <= 0) return undefined
    const timer = window.setInterval(() => {
      setTimeLeftSec((prev) => {
        if (!prev || prev <= 1) return 0
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isMulti, roundId, timeLeftSec])

  // SOLO / LOCAL TIMER
  useEffect(() => {
    if (isMulti) return undefined
    if (!timeLeftSec || timeLeftSec <= 0 || feedback === 'correct') return undefined
    const timer = window.setInterval(() => {
      setTimeLeftSec((prev) => {
        if (!prev || prev <= 1) {
          setFeedback('timeout')
          setStreak(0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isMulti, timeLeftSec, feedback])

  const pickNext = useCallback(async () => {
    setLoadingWord(true)
    setFetchError(false)
    try {
      const res = await wordScrambleService.getNext({ difficulty })
      const ok = res && res.success !== false
      const w = ok ? res?.data?.word : null
      if (w?.word) {
        const word = String(w.word).trim().toLowerCase()
        setEntry({
          word,
          meaning: String(w.meaning ?? '').trim(),
          example: w.example ? String(w.example).trim() : '',
        })
        setScrambled(scrambleLetters(word))
        setInput('')
        setFeedback(null)
        
        // Define time limit for solo mode (easy: 40s, medium: 30s, hard: 20s)
        const nextLimit = Number(w.timeLimitSec) || (difficulty === 'easy' ? 40 : difficulty === 'medium' ? 30 : 20)
        setTimeLimitSec(nextLimit)
        setTimeLeftSec(nextLimit)
        return
      }
      setEntry(null)
      setScrambled('')
      setInput('')
      setFeedback(null)
    } catch {
      setEntry(null)
      setScrambled('')
      setInput('')
      setFeedback(null)
      setFetchError(true)
    }
  }, [difficulty])

  useEffect(() => {
    if (isMulti) return undefined
    setLoadingWord(true)
    let cancelled = false
      ; (async () => {
        await pickNext()
        if (!cancelled) setLoadingWord(false)
      })()
    return () => {
      cancelled = true
    }
  }, [pickNext])

  useEffect(() => {
    if (!fullScreen || !wrongPulse || !shellRef.current) return
    const el = shellRef.current
    el.classList.remove('ws-game-shell--shake')
    void el.offsetWidth
    el.classList.add('ws-game-shell--shake')
    const timer = window.setTimeout(() => el.classList.remove('ws-game-shell--shake'), 480)
    return () => window.clearTimeout(timer)
  }, [wrongPulse, fullScreen])

  const onNext = useCallback(() => {
    if (isMulti && roomCode && socketRef.current) {
      return
    }
    setLoadingWord(true)
      ; (async () => {
        await pickNext()
        setLoadingWord(false)
      })()
    if (isMulti && (!roomCode || !socketRef.current)) {
      setActivePlayer((p) => ((p % nPlayers) + 1))
    }
  }, [pickNext, isMulti, roomCode, nPlayers])

  const onCheck = useCallback(async () => {
    if (!entry || feedback === 'correct' || feedback === 'timeout' || gameEnded) return

    if (isMulti && roomCode && socketRef.current) {
      const myNetworkPlayer = networkPlayers.find(p => String(p.userId) === String(myId))
      if (myNetworkPlayer?.isOut) return // Don't allow submission if out
      // ONLINE MODE
      socketRef.current.emit('wordScrambleGame:submit', {
        roomCode,
        answer: input.trim(),
        roundId,
      }, (res) => {
        if (!res?.ok) {
          console.error('Submit failed:', res?.error)
          return
        }
        if (res?.correct) {
          setFeedback('correct')
          toast.success(t('enter.game.correct'))
        } else {
          setFeedback('wrong')
          setWrongPulse(true)
          if (res?.error === 'stale_round') {
            toast.error(t('common.error'))
          } else {
            toast.error(t('enter.game.wrong'))
          }
          setTimeout(() => setWrongPulse(false), 500)
        }
      })
      return
    }

    // LOCAL MULTI / SOLO MODE
    const ok = input.trim().toLowerCase() === entry.word
    if (ok) {
      setFeedback('correct')
      if (!isMulti && nPlayers === 1) {
        setScore((s) => s + 10 + Math.min(streak, 5) * 2)
        setStreak((s) => s + 1)
        // Auto transition to next word after 1.2s
        window.setTimeout(() => {
          onNext()
        }, 1200)
      } else if (!isMulti) {
        const p = activePlayer
        const st = streaks[p] ?? 0
        const add = 10 + Math.min(st, 5) * 2
        setScores((prev) => ({ ...prev, [p]: prev[p] + add }))
        setStreaks((prev) => ({ ...prev, [p]: (prev[p] ?? 0) + 1 }))
      }
    } else {
      setFeedback('wrong')
      if (!isMulti) {
        setStreak(0)
      } else {
        setStreaks((prev) => ({ ...prev, [activePlayer]: 0 }))
        setActivePlayer((p) => ((p % nPlayers) + 1))
        setInput('')
      }
      setWrongPulse(true)
      window.setTimeout(() => setWrongPulse(false), 450)
    }
  }, [entry, feedback, input, isMulti, roomCode, streak, activePlayer, streaks, nPlayers, roundId, gameEnded, networkPlayers, myId, t, onNext])

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (feedback === 'correct') onNext()
      else onCheck()
    }
  }

  if (loadingWord) {
    return (
      <div
        className={
          fullScreen
            ? 'ws-game-shell flex-1 flex items-center justify-center min-h-[30vh] p-8'
            : 'rounded-xl border border-border-dark bg-card-dark p-8 flex justify-center'
        }
      >
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    )
  }

  if (!entry) {
    const shellEmpty =
      fullScreen
        ? 'ws-game-shell flex-1 flex flex-col items-center justify-center gap-4 min-h-[30vh] p-8 text-center text-sm border border-violet-500/25'
        : 'rounded-xl border border-border-dark bg-card-dark p-8 text-center text-sm flex flex-col items-center gap-4'
    if (fetchError) {
      return (
        <div className={shellEmpty}>
          <p className={fullScreen ? 'text-slate-400 max-w-md' : 'text-gray-400 max-w-md'}>{t('enter.game.loadWordsFailed')}</p>
          <button
            type="button"
            onClick={() => {
              setLoadingWord(true)
                ; (async () => {
                  await pickNext()
                  setLoadingWord(false)
                })()
            }}
            className={
              fullScreen
                ? 'ws-btn-arcade px-6 py-2.5 text-sm'
                : 'rounded-xl bg-primary text-background-dark font-bold hover:brightness-110 transition-all px-6 py-2.5 text-sm'
            }
          >
            {t('enter.game.retryLoad')}
          </button>
        </div>
      )
    }
    return (
      <div
        className={
          fullScreen
            ? 'ws-game-shell flex-1 flex items-center justify-center min-h-[30vh] p-8 text-center text-slate-400 text-sm border border-violet-500/25'
            : 'rounded-xl border border-border-dark bg-card-dark p-8 text-center text-sm text-gray-400'
        }
      >
        {t('enter.game.emptyPool')}
      </div>
    )
  }

  const shellClass = fullScreen
    ? 'ws-game-shell flex flex-col flex-1 min-h-0'
    : `rounded-xl border border-border-dark bg-card-dark overflow-hidden transition-shadow ${wrongPulse ? 'ring-2 ring-red-500/60' : ''
    }`

  const headerClass = fullScreen
    ? 'ws-game-header flex flex-wrap items-center justify-between gap-3 shrink-0 px-4 sm:px-8 py-3'
    : `border-b border-border-dark flex flex-wrap items-center justify-between gap-3 shrink-0 px-5 py-4`

  const badgeSolo = fullScreen
    ? 'text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-500/35 bg-slate-900/50 text-slate-300'
    : 'text-xs font-normal text-gray-500 ml-1 px-2 py-0.5 rounded-full bg-white/5 border border-border-dark'

  const badgeMulti = fullScreen
    ? 'text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-200'
    : 'text-xs font-normal text-primary/90 ml-1 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/25'

  const badgeDiff = fullScreen
    ? 'text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/45 bg-amber-500/10 text-amber-200'
    : 'text-xs font-normal text-amber-400/95 ml-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25'

    if (gameMode === 'solo') {
    return <WordScrambleSoloProgression fullScreen={fullScreen} difficulty={difficulty} />
  }

  return (
    <div ref={fullScreen ? shellRef : undefined} className={shellClass}>
      <div className={headerClass}>
        <div className="min-w-0">
          <h2
            className={`font-bold flex flex-wrap items-center gap-2 ${fullScreen ? 'ws-font-display text-xl sm:text-2xl text-white' : 'text-lg text-white'
              }`}
          >
            <span className="material-symbols-outlined text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.45)]">
              shuffle
            </span>
            {t('enter.game.title')}
            {isMulti ? (
              <span className={badgeMulti}>{t('enter.game.modeMultiShort', { n: nPlayers })}</span>
            ) : (
              <span className={badgeSolo}>{t('enter.game.modeSoloShort')}</span>
            )}
            <span className={badgeDiff}>
              {t(`enter.game.diff${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}Short`)}
            </span>
          </h2>
          {!fullScreen && !isMulti && (
            <p className="text-xs text-gray-400 mt-1 max-w-xl">{t('enter.game.subtitle')}</p>
          )}
        </div>
        {!isMulti ? (
          <div className={`flex items-center gap-4 shrink-0 ${fullScreen ? 'text-base' : 'text-sm'}`}>
            <span className={fullScreen ? 'text-slate-400' : 'text-gray-400'}>{t('enter.game.score', { n: score })}</span>
            <span className={fullScreen ? 'text-cyan-300 font-bold drop-shadow-[0_0_6px_rgba(34,211,238,0.35)]' : 'text-primary font-bold'}>
              {t('enter.game.streak', { n: streak })}
            </span>
          </div>
        ) : !fullScreen ? (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 max-w-full">
            {(networkPlayers.length > 0 ? networkPlayers : Array.from({ length: nPlayers }, (_, i) => ({ name: `Player ${i + 1}`, userId: i + 1 }))).map((p, i) => {
              const pid = i + 1
              const isActive = networkPlayers.length > 0 ? (activePlayerIdx === i) : (activePlayer === pid)
              const pScore = networkPlayers.length > 0 ? (p.score ?? 0) : (scores[pid] ?? 0)
              const pStreak = networkPlayers.length > 0 ? (p.streak ?? 0) : (streaks[pid] ?? 0)

              return (
                <div
                  key={p.userId || pid}
                  className={`rounded-xl px-3 py-2 border text-sm transition-all duration-300 ${fullScreen
                      ? isActive
                        ? 'ws-pill-active text-white'
                        : 'ws-pill-idle text-slate-500'
                      : isActive
                        ? 'border-primary bg-primary/15 text-white'
                        : 'border-border-dark bg-background-dark/80 text-gray-400'
                    }`}
                >
                  <span className={fullScreen ? 'font-bold text-cyan-200' : 'font-bold text-primary'}>
                    {p.name || t('enter.game.playerLabel', { n: pid })}
                  </span>
                  <span className="mx-2 text-slate-500">|</span>
                  <span>{t('enter.game.score', { n: pScore })}</span>
                  <span className={fullScreen ? 'text-fuchsia-300/90 ml-2' : 'text-primary/80 ml-2'}>
                    {t('enter.game.streakShort', { n: pStreak })}
                  </span>
                </div>
              )
            })}
          </div>
        ) : null}
      </div>

      <div
        className={
          fullScreen
            ? 'ws-turn-banner px-4 py-2.5 text-center text-sm font-bold text-cyan-100 shrink-0 ws-font-display tracking-wide'
            : 'px-4 py-2.5 bg-primary/10 border-b border-primary/20 text-center text-sm font-semibold text-primary shrink-0'
        }
      >
        {timeLimitSec
          ? `${t('enter.game.answerTimer')}: ${Math.max(0, Number(timeLeftSec ?? timeLimitSec))}s`
          : t('enter.game.answerTimerPreparing')}
      </div>

      <div
        className={fullScreen
          ? `flex-1 min-h-0 px-4 sm:px-8 py-6 sm:py-10 ${isMulti ? 'flex gap-4 sm:gap-6' : 'overflow-y-auto'}`
          : 'p-5 md:p-8'}
      >
        <div className={`space-y-6 min-h-0 ${fullScreen ? (isMulti ? 'flex-1 pr-1' : '') : ''}`}>
          {entry && (
            <>
            <div className={fullScreen ? 'ws-fade-rise' : ''}>
              <p
                className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${fullScreen ? 'text-cyan-500/70' : 'text-gray-500'
                  }`}
              >
                {t('enter.game.scrambledLabel')}
              </p>
              <p
                className={`font-mono font-bold break-all leading-tight ${fullScreen
                    ? 'text-3xl sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-fuchsia-200 to-pink-200'
                    : 'tracking-[0.35em] text-primary text-2xl md:text-3xl'
                  }`}
              >
                {fullScreen
                  ? scrambled.split('').map((ch, i) => (
                    <span
                      key={`${entry.word}-${scrambled}-${i}`}
                      className="ws-letter inline-block mr-1 sm:mr-1.5"
                      style={{ animationDelay: `${i * 42}ms` }}
                    >
                      {ch}
                    </span>
                  ))
                  : scrambled.split('').join(' ')}
              </p>
            </div>

            <div>
              <p
                className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${fullScreen ? 'text-fuchsia-400/65' : 'text-gray-500'
                  }`}
              >
                {t('enter.game.meaningLabel')}
              </p>
              <p className={`font-medium ${fullScreen ? 'text-lg sm:text-xl text-slate-100' : 'text-base text-white'}`}>
                {entry.meaning}
              </p>
              {entry.example ? (
                <p className={`mt-2 italic line-clamp-2 ${fullScreen ? 'text-sm text-slate-500' : 'text-xs text-gray-500'}`}>
                  &ldquo;{entry.example}&rdquo;
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="scramble-input"
                className={`text-[10px] font-bold uppercase tracking-wider ${fullScreen ? 'text-violet-400/70' : 'text-gray-500'
                  }`}
              >
                {isMulti ? t('enter.game.answerForPlayer', { n: activePlayer }) : t('enter.game.yourAnswer')}
              </label>
              {(() => {
                const myIdx = networkPlayers.findIndex(p => String(p.userId) === String(myId))
                const iAmOut = isMulti && myIdx >= 0 && networkPlayers[myIdx]?.isOut
                
                if (iAmOut && !gameEnded) {
                  return (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-center">
                      <p className="text-rose-400 font-bold ws-font-display animate-pulse">
                        {t('enter.game.youAreEliminated')}
                      </p>
                      <p className="text-xs text-rose-300/70 mt-1">
                        {t('enter.game.spectatingDesc')}
                      </p>
                    </div>
                  )
                }

                return (
                  <input
                    id="scramble-input"
                    type="text"
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value)
                      if (feedback === 'wrong') setFeedback(null)
                    }}
                    onKeyDown={onKeyDown}
                    disabled={feedback === 'correct' || feedback === 'timeout' || gameEnded}
                    className={
                      fullScreen
                        ? `ws-input-game ${feedback === 'correct' ? 'opacity-60' : ''} py-4 text-lg sm:text-xl px-4`
                        : 'w-full rounded-xl border border-border-dark bg-background-dark px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50'
                    }
                    placeholder={t('enter.game.placeholder')}
                  />
                )
              })()}
            </div>

            {feedback === 'correct' && (
              <p
                className={`text-sm font-bold flex items-center gap-2 ${fullScreen ? 'text-emerald-300 animate-ws-correct-pop drop-shadow-[0_0_12px_rgba(52,211,153,0.35)]' : 'font-semibold text-emerald-400'
                  }`}
              >
                <span className="material-symbols-outlined text-lg">check_circle</span>
                {isMulti ? t('enter.game.correctMulti', { n: activePlayer }) : t('enter.game.correct')}
              </p>
            )}
            {feedback === 'wrong' && (
              <p
                className={`text-sm font-bold flex items-center gap-2 ${fullScreen ? 'text-amber-300 animate-pulse' : 'font-semibold text-amber-400'
                  }`}
              >
                <span className="material-symbols-outlined text-lg">refresh</span>
                {isMulti ? t('enter.game.wrongMulti') : t('enter.game.wrong')}
              </p>
            )}
            {feedback === 'timeout' && (
              <p
                className={`text-sm font-bold flex items-center gap-2 ${fullScreen ? 'text-rose-300 animate-pulse' : 'font-semibold text-rose-400'
                  }`}
              >
                <span className="material-symbols-outlined text-lg">timer_off</span>
                {t('enter.game.matchEndedByTimeout')}
              </p>
            )}

              <div className="flex flex-wrap gap-3">
                {feedback !== 'correct' ? (
                  !(isMulti && networkPlayers.find(p => String(p.userId) === String(myId))?.isOut) && (
                    <button
                      type="button"
                      onClick={onCheck}
                      className={
                        fullScreen
                          ? 'ws-btn-arcade px-8 py-3.5 text-sm sm:text-base'
                          : 'rounded-xl bg-primary text-background-dark font-bold hover:brightness-110 transition-all px-6 py-2.5 text-sm'
                      }
                    >
                      {t('enter.game.submit')}
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={onNext}
                    className={
                      fullScreen
                        ? 'ws-btn-arcade px-8 py-3.5 text-sm sm:text-base'
                        : 'rounded-xl bg-primary text-background-dark font-bold hover:brightness-110 transition-all px-6 py-2.5 text-sm'
                    }
                  >
                    {t('enter.game.nextWord')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {fullScreen && isMulti && (
          <aside className="w-[240px] sm:w-[280px] shrink-0 self-stretch rounded-2xl border border-violet-500/30 bg-slate-950/45 p-3 sm:p-4 my-[5px]">
            <p className="text-[10px] uppercase tracking-wider text-violet-300/75 font-bold mb-3 ws-font-display">
              {t('enter.game.modeMultiTitle')}
            </p>
            <div className="space-y-2.5">
              {displayPlayers.length === 0 ? (
                <div className="rounded-xl px-3 py-4 border border-violet-500/20 bg-slate-900/40 text-center text-xs text-slate-500">
                  <span className="material-symbols-outlined animate-spin text-base align-middle mr-1">progress_activity</span>
                  {t('common.loading')}
                </div>
              ) : (
              displayPlayers.map((p, i, arr) => {
                const pid = i + 1
                const isMe = myId != null && String(p.userId) === String(myId)
                const isActive = networkPlayers.length > 0 ? (activePlayerIdx === i) : false
                const pScore = p.score ?? 0
                const pStreak = p.streak ?? 0
                const rank = [...arr]
                  .sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0))
                  .findIndex((rp) => String(rp?.userId ?? '') === String(p?.userId ?? '')) + 1

                return (
                  <div
                    key={p.userId || pid}
                    className={`rounded-xl px-3 py-3 border text-sm transition-all duration-300 relative ${
                      isActive || isMe ? 'ws-pill-active text-white' : 'ws-pill-idle text-slate-400'
                    } ${p.isOut ? 'opacity-50 grayscale-[0.5]' : ''}`}
                  >
                    {p.isOut && (
                      <div className="absolute top-1 right-2">
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter">
                          Out
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <img
                        src={avatarForPlayer(p)}
                        alt=""
                        className="size-9 shrink-0 rounded-full object-cover border-2 border-violet-400/40 bg-slate-800"
                        onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`font-bold truncate ${p.isOut ? 'text-slate-500' : 'text-cyan-200'}`}>
                            {p.name || t('enter.game.playerLabel', { n: pid })}
                            {isMe ? (
                              <span className="ml-1 text-[10px] font-bold text-primary uppercase">{t('enter.game.youLabel')}</span>
                            ) : null}
                          </p>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-cyan-400/35 text-cyan-200 shrink-0">
                            #{rank}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs">
                          <span className="text-slate-300">{t('enter.game.score', { n: pScore })}</span>
                          <span className="text-fuchsia-300/90">{t('enter.game.streakShort', { n: pStreak })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// INFINITE SOLO MODE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function WordScrambleSoloProgression({ fullScreen, difficulty }) {
  const STAGE_FORMATS = [
    { type: 'scramble',   title: 'Word Scramble',     desc: 'Sắp xếp chữ cái thành từ đúng',        icon: '🔀' },
    { type: 'missing',    title: 'Missing Letters',    desc: 'Điền các chữ cái còn thiếu',            icon: '🔡' },
    { type: 'meaning',    title: 'Correct Meaning',    desc: 'Chọn nghĩa tiếng Việt chính xác',       icon: '📖' },
    { type: 'word',       title: 'Correct Word',       desc: 'Tìm từ tiếng Anh theo mô tả',           icon: '🔍' },
    { type: 'sentence',   title: 'Fill the Blank',     desc: 'Điền từ vào chỗ trống trong câu',       icon: '✏️' },
    { type: 'wrong_word', title: 'Find Wrong Word',    desc: 'Tìm từ sai ngữ pháp trong câu',         icon: '⚠️' },
    { type: 'synonym',    title: 'Synonym Challenge',  desc: 'Tìm từ đồng nghĩa chính xác',           icon: '≈' },
    { type: 'antonym',    title: 'Antonym Challenge',  desc: 'Tìm từ trái nghĩa chính xác',           icon: '↔️' },
    { type: 'listening',  title: 'Listening',          desc: 'Nghe phát âm và viết lại từ',           icon: '🎧' },
    { type: 'image',      title: 'Image Guess',        desc: 'Đoán từ qua hình ảnh biểu tượng',       icon: '🖼️' },
    { type: 'speed',      title: 'Speed Round (30s)',  desc: 'Trả lời nhiều câu nhất trong 30 giây',  icon: '⚡' },
  ]
  const BOSS_FORMAT = { type: 'boss', title: 'Boss Battle', desc: 'Đại chiến Boss huyền thoại', icon: '👹' }

  const getStageConfig = (level) => {
    if (level % 10 === 0) return { ...BOSS_FORMAT, level }
    const formatIdx = (level - 1 - Math.floor((level - 1) / 10)) % 11
    return { ...STAGE_FORMATS[formatIdx], level }
  }

  const pickWordByDifficulty = (pool, targetPercent) => {
    if (!pool.length) return null
    const sorted = [...pool].sort((a, b) => a.word.length - b.word.length)
    const center = Math.round(targetPercent * (sorted.length - 1))
    const halfWindow = Math.max(3, Math.floor(sorted.length * 0.1))
    const lo = Math.max(0, center - halfWindow)
    const hi = Math.min(sorted.length - 1, center + halfWindow)
    const slice = sorted.slice(lo, hi + 1)
    return slice[Math.floor(Math.random() * slice.length)]
  }

  const { t } = useTranslation()
  const [currentStage, setCurrentStage] = useState(1)
  const [maxStageReached, setMaxStageReached] = useState(1)
  const [pickerPage, setPickerPage] = useState(0)
  const [activeLevel, setActiveLevel] = useState(null)
  const [stageState, setStageState] = useState('playing')

  const [wordPool, setWordPool] = useState([])
  const [stageWordPool, setStageWordPool] = useState([]) // words used this level
  const [pageWordPool, setPageWordPool] = useState([])   // 30 words shared across 10 stages of the page
  const [activePage, setActivePage] = useState(null)     // current page (0 for stages 1-10, 1 for 11-20...)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [correctCount, setCorrectCount] = useState(0)   // speed round counter
  const [stageCorrect, setStageCorrect] = useState(0)   // normal stage progress
  const REQUIRED_CORRECT = 3                             // correct answers needed per normal stage

  const [bossHp, setBossHp] = useState(150)
  const [playerHp, setPlayerHp] = useState(100)
  const [combatLog, setCombatLog] = useState([])
  const [rewards, setRewards] = useState({ xp: 0, coins: 0 })

  const DEFAULT_VOCAB = [
    { word: 'curious',   meaning: 'Tò mò',             example: 'He was curious about how things work.',    synonyms: ['inquisitive'], antonyms: ['indifferent'], sentenceTemplate: 'The boy is very [curious] about science.', wrongSentence: 'He are curious about the book.', wrongWord: 'are', emoji: '🕵️' },
    { word: 'library',   meaning: 'Thư viện',           example: 'I borrow books from the library.',         synonyms: ['archive'],     antonyms: ['bookstore'],   sentenceTemplate: 'We went to the [library] to study.', wrongSentence: 'We goes to the library yesterday.', wrongWord: 'goes', emoji: '📚' },
    { word: 'generous',  meaning: 'Rộng lượng',         example: 'She is very generous.',                    synonyms: ['kind'],         antonyms: ['greedy'],      sentenceTemplate: 'A [generous] man helps others.', wrongSentence: 'He is a most generouser person.', wrongWord: 'generouser', emoji: '🎁' },
    { word: 'honest',    meaning: 'Thành thật',         example: 'Always be honest.',                        synonyms: ['truthful'],    antonyms: ['dishonest'],   sentenceTemplate: 'Always be [honest] with friends.', wrongSentence: 'He am a very honest person.', wrongWord: 'am', emoji: '🤝' },
    { word: 'brave',     meaning: 'Dũng cảm',           example: 'The brave soldier saved lives.',            synonyms: ['courageous'],  antonyms: ['cowardly'],    sentenceTemplate: 'It takes a [brave] heart to help.', wrongSentence: 'The soldiers was very brave.', wrongWord: 'was', emoji: '🦁' },
    { word: 'clever',    meaning: 'Thông minh',         example: 'She is a clever student.',                 synonyms: ['smart'],       antonyms: ['foolish'],     sentenceTemplate: 'The fox is a [clever] animal.', wrongSentence: 'She are clever at math.', wrongWord: 'are', emoji: '💡' },
    { word: 'ancient',   meaning: 'Cổ kính',            example: 'We visited ancient ruins.',                synonyms: ['old'],         antonyms: ['modern'],      sentenceTemplate: 'They found [ancient] coins.', wrongSentence: 'This is more ancienter.', wrongWord: 'ancienter', emoji: '🏛️' },
    { word: 'happy',     meaning: 'Hạnh phúc',          example: 'She is happy today.',                      synonyms: ['joyful'],      antonyms: ['sad'],         sentenceTemplate: 'Children are [happy] when playing.', wrongSentence: 'I am feel happy today.', wrongWord: 'feel', emoji: '😊' },
    { word: 'modern',    meaning: 'Hiện đại',           example: 'This is a modern city.',                   synonyms: ['contemporary'],antonyms: ['ancient'],     sentenceTemplate: 'We live in a [modern] world.', wrongSentence: 'We lives in a modern city.', wrongWord: 'lives', emoji: '🏙️' },
    { word: 'wonderful', meaning: 'Tuyệt vời',          example: 'What a wonderful day!',                    synonyms: ['amazing'],     antonyms: ['terrible'],    sentenceTemplate: 'The view is [wonderful].', wrongSentence: 'They is wonderful people.', wrongWord: 'is', emoji: '🌟' },
    { word: 'calculate', meaning: 'Tính toán',          example: 'Please calculate the total.',              synonyms: ['compute'],     antonyms: ['guess'],       sentenceTemplate: 'We need to [calculate] the cost.', wrongSentence: 'He calculate quick.', wrongWord: 'quick', emoji: '🧮' },
    { word: 'campaign',  meaning: 'Chiến dịch',         example: 'The campaign was successful.',             synonyms: ['initiative'],  antonyms: ['inaction'],    sentenceTemplate: 'They launched a [campaign] for peace.', wrongSentence: 'The campaign are going well.', wrongWord: 'are', emoji: '📢' },
    { word: 'carpenter', meaning: 'Thợ mộc',            example: 'The carpenter made a table.',              synonyms: ['woodworker'],  antonyms: [],              sentenceTemplate: 'The [carpenter] fixed the door.', wrongSentence: 'The carpenter work hard.', wrongWord: 'work', emoji: '🪚' },
    { word: 'capture',   meaning: 'Bắt giữ',            example: 'They captured the fugitive.',              synonyms: ['catch'],       antonyms: ['release'],     sentenceTemplate: 'Police managed to [capture] the thief.', wrongSentence: 'They captured him quick.', wrongWord: 'quick', emoji: '🪤' },
    { word: 'candidate', meaning: 'Ứng cử viên',        example: 'She is a candidate for the role.',        synonyms: ['applicant'],   antonyms: [],              sentenceTemplate: 'The [candidate] answered well.', wrongSentence: 'The candidate have experience.', wrongWord: 'have', emoji: '🙋' },
  ]

  const effectivePool = wordPool.length > 0 ? wordPool : DEFAULT_VOCAB
  const shuffleArr = (arr) => [...arr].sort(() => Math.random() - 0.5)
  const randomItems = (arr, n) => shuffleArr(arr).slice(0, n)

  // Build a 30-word pool for the entire 10-stage page
  const buildPagePool = useCallback((pageIndex, fullPool) => {
    const base = fullPool.length > 0 ? fullPool : DEFAULT_VOCAB
    const sorted = [...base].sort((a, b) => a.word.length - b.word.length)
    
    const maxPct = Math.min(1, (pageIndex * 10) / 45)
    const center = Math.round(maxPct * (sorted.length - 1))
    const halfWindow = Math.max(25, Math.floor(sorted.length * 0.4))
    const lo = Math.max(0, center - halfWindow)
    const hi = Math.min(sorted.length - 1, center + halfWindow)
    const window = sorted.slice(lo, hi + 1)
    
    const shuffled = shuffleArr(window)
    return shuffled.slice(0, Math.min(30, shuffled.length))
  }, [])

  const generateQuestion = useCallback((level, stagePool, fullPool) => {
    const realStagePool = stagePool.length > 0 ? stagePool : (fullPool.length > 0 ? fullPool : DEFAULT_VOCAB)
    const realFullPool  = fullPool.length  > 0 ? fullPool  : DEFAULT_VOCAB
    const cfg = getStageConfig(level)

    if (cfg.type === 'boss') {
      const bossFormats = ['scramble', 'missing', 'meaning', 'word', 'sentence', 'synonym', 'antonym', 'image']
      const randomType = bossFormats[Math.floor(Math.random() * bossFormats.length)]
      const fakeCfg = { type: randomType }
      return _buildQuestion(fakeCfg, level, realStagePool, realFullPool, true)
    }
    return _buildQuestion(cfg, level, realStagePool, realFullPool, false)
  }, [])

  // stagePool: words available for this stage (limited set or full for boss)
  // distractorPool: full vocabulary for building wrong-answer choices
  function _buildQuestion(cfg, level, stagePool, distractorPool, isBoss = false) {
    // Pick a random word from the stage's dedicated pool
    const wordObj = stagePool[Math.floor(Math.random() * stagePool.length)] || distractorPool[0]
    const correctWord = wordObj.word.trim().toLowerCase()
    const gen = { type: cfg.type, word: correctWord, meaning: wordObj.meaning, example: wordObj.example, raw: wordObj, _stagePool: stagePool }

    switch (cfg.type) {
      case 'scramble': {
        gen.scrambled = scrambleLetters(correctWord)
        break
      }
      case 'missing': {
        const letters = correctWord.split('')
        const blanks = []
        const pct = 0.35 + Math.min(0.25, level * 0.006)
        const numBlanks = Math.max(1, Math.floor(letters.length * pct))
        while (blanks.length < numBlanks) {
          const idx = Math.floor(Math.random() * letters.length)
          if (!blanks.includes(idx)) blanks.push(idx)
        }
        gen.display = letters.map((l, i) => blanks.includes(i) ? '_' : l).join(' ')
        break
      }
      case 'meaning': {
        const wrongs = distractorPool.filter(d => d.meaning !== wordObj.meaning).map(d => d.meaning)
        gen.options = shuffleArr([wordObj.meaning, ...randomItems(wrongs, 3)])
        gen.answer = wordObj.meaning
        break
      }
      case 'word': {
        const wrongs = distractorPool.filter(d => d.word !== correctWord).map(d => d.word)
        const opts = shuffleArr([correctWord, ...randomItems(wrongs, 3)])
        gen.options = opts.map(o => o.charAt(0).toUpperCase() + o.slice(1))
        gen.answer = correctWord.charAt(0).toUpperCase() + correctWord.slice(1)
        break
      }
      case 'sentence': {
        const tmpl = wordObj.sentenceTemplate
        if (tmpl && tmpl.includes('[') && tmpl.includes(']')) {
          gen.display = tmpl.replace(/\[.*?\]/g, '_______')
          const wrongs = distractorPool.filter(d => d.word !== correctWord).map(d => d.word)
          gen.options = shuffleArr([correctWord, ...randomItems(wrongs, 3)])
          gen.answer = correctWord
        } else {
          // Fallback to 'word' (Choose correct English word)
          gen.type = 'word'
          const wrongs = distractorPool.filter(d => d.word !== correctWord).map(d => d.word)
          const opts = shuffleArr([correctWord, ...randomItems(wrongs, 3)])
          gen.options = opts.map(o => o.charAt(0).toUpperCase() + o.slice(1))
          gen.answer = correctWord.charAt(0).toUpperCase() + correctWord.slice(1)
        }
        break
      }
      case 'wrong_word': {
        const wrongSent = wordObj.wrongSentence
        const wrongWd = wordObj.wrongWord
        if (wrongSent && wrongWd) {
          gen.display = wrongSent
          const sentWords = wrongSent.replace(/[^\w\s]/g, '').split(' ')
          gen.options = shuffleArr(Array.from(new Set([wrongWd, ...randomItems(sentWords, 3)])).slice(0, 4))
          gen.answer = wrongWd
        } else {
          // Fallback to 'missing' (Complete the word)
          gen.type = 'missing'
          const letters = correctWord.split('')
          const blanks = []
          const pct = 0.35 + Math.min(0.25, level * 0.006)
          const numBlanks = Math.max(1, Math.floor(letters.length * pct))
          while (blanks.length < numBlanks) {
            const idx = Math.floor(Math.random() * letters.length)
            if (!blanks.includes(idx)) blanks.push(idx)
          }
          gen.display = letters.map((l, i) => blanks.includes(i) ? '_' : l).join(' ')
        }
        break
      }
      case 'synonym': {
        const syns = (wordObj.synonyms || []).filter(s => s && s.trim())
        if (syns.length > 0) {
          const correct = syns[0]
          const wrongs = distractorPool.map(d => d.word).filter(w => w !== correct && w !== correctWord)
          gen.options = shuffleArr([correct, ...randomItems(wrongs, 3)])
          gen.answer = correct
        } else {
          // Fallback to meaning selection
          gen.type = 'meaning'
          const wrongs = distractorPool.filter(d => d.meaning !== wordObj.meaning).map(d => d.meaning)
          gen.options = shuffleArr([wordObj.meaning, ...randomItems(wrongs, 3)])
          gen.answer = wordObj.meaning
        }
        break
      }
      case 'antonym': {
        const ants = (wordObj.antonyms || []).filter(a => a && a.trim())
        if (ants.length > 0) {
          const correct = ants[0]
          const wrongs = distractorPool.map(d => d.word).filter(w => w !== correct && w !== correctWord)
          gen.options = shuffleArr([correct, ...randomItems(wrongs, 3)])
          gen.answer = correct
        } else {
          // Fallback to scrambled word spelling
          gen.type = 'scramble'
          gen.scrambled = scrambleLetters(correctWord)
        }
        break
      }
      case 'listening': {
        gen.audio = correctWord
        break
      }
      case 'image': {
        gen.emoji = wordObj.emoji || '🌟'
        const wrongs = distractorPool.filter(d => d.word !== correctWord).map(d => d.word)
        const opts = shuffleArr([correctWord, ...randomItems(wrongs, 3)])
        gen.options = opts.map(o => o.charAt(0).toUpperCase() + o.slice(1))
        gen.answer = correctWord.charAt(0).toUpperCase() + correctWord.slice(1)
        break
      }
      case 'speed': {
        const isM = Math.random() > 0.5
        if (isM) {
          const wrongs = distractorPool.filter(d => d.meaning !== wordObj.meaning).map(d => d.meaning)
          gen.title = "Nghĩa của \"" + correctWord + "\" là gì?"
          gen.options = shuffleArr([wordObj.meaning, ...randomItems(wrongs, 3)])
          gen.answer = wordObj.meaning
        } else {
          const wrongs = distractorPool.filter(d => d.word !== correctWord).map(d => d.word)
          gen.title = "Từ nào có nghĩa là \"" + wordObj.meaning + "\"?"
          gen.options = shuffleArr([correctWord, ...randomItems(wrongs, 3)]).map(o => o.charAt(0).toUpperCase() + o.slice(1))
          gen.answer = correctWord.charAt(0).toUpperCase() + correctWord.slice(1)
        }
        break
      }
    }
    return gen
  }

  useEffect(() => {
    wordScrambleService.getSoloProgress()
      .then(res => {
        if (res?.success && res?.data) {
          setCurrentStage(res.data.currentStage || 1)
          setMaxStageReached(res.data.maxStageReached || 1)
        }
      }).catch(() => {})
    wordScrambleService.listWords({ limit: 500 })
      .then(res => {
        if (res?.success && Array.isArray(res?.data?.items) && res.data.items.length > 0) {
          setWordPool(res.data.items)
        }
      }).catch(() => {})
  }, [])

  const activeStageConfig = activeLevel ? getStageConfig(activeLevel) : null
  const isBossRound  = activeLevel && activeLevel % 10 === 0
  const isSpeedRound = activeStageConfig?.type === 'speed'

  useEffect(() => {
    if (!isSpeedRound || stageState !== 'playing') return undefined
    if (timeLeft <= 0) {
      if (correctCount >= 5) handleStageWin()
      else setStageState('defeat')
      return undefined
    }
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000)
    return () => clearInterval(timer)
  }, [isSpeedRound, stageState, timeLeft, correctCount])

  const speakWord = (word) => {
    if (!('speechSynthesis' in window)) { toast.error('Trình duyệt không hỗ trợ phát âm'); return }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(word)
    u.lang = 'en-US'; u.rate = 0.85
    window.speechSynthesis.speak(u)
  }

  const startLevel = (levelIndex) => {
    const fullPool = wordPool.length > 0 ? wordPool : DEFAULT_VOCAB
    
    // Determine active page
    const targetPage = Math.floor((levelIndex - 1) / 10)
    let currentPagePool = pageWordPool
    if (activePage !== targetPage || pageWordPool.length === 0) {
      currentPagePool = buildPagePool(targetPage, fullPool)
      setPageWordPool(currentPagePool)
      setActivePage(targetPage)
    }

    // Normal stages shuffle from the 30-word page pool.
    // For normal stages, we can use the page pool as is.
    setStageWordPool(currentPagePool)
    setActiveLevel(levelIndex)
    setStageState('playing')
    setInput(''); setFeedback(null); setSelectedOption(null)
    setCorrectCount(0)
    setStageCorrect(0)
    setBossHp(150); setPlayerHp(100)
    setCombatLog(["👹 Boss Màn " + levelIndex + " xuất hiện! Hãy tiêu diệt Boss."])
    const cfg = getStageConfig(levelIndex)
    if (cfg.type === 'speed') setTimeLeft(30)
    const q = generateQuestion(levelIndex, currentPagePool, fullPool)
    setCurrentQuestion(q)
    if (q?.audio) setTimeout(() => speakWord(q.audio), 400)
  }

  const handleStageWin = useCallback(() => {
    setStageState('victory')
    const xp = 20 + Math.floor((activeLevel || 1) / 5) * 5
    setRewards({ xp, coins: 5 })
    const nextStage = Math.max(currentStage, (activeLevel || 1) + 1)
    wordScrambleService.updateSoloProgress(nextStage)
      .then(res => {
        if (res?.success) {
          setCurrentStage(res.data.currentStage)
          setMaxStageReached(res.data.maxStageReached)
        }
      }).catch(() => {})
  }, [activeLevel, currentStage])

  const handleCheckAnswer = () => {
    if (!currentQuestion || feedback) return
    const cfg = getStageConfig(activeLevel)
    const isInputType = (currentQuestion.type === 'scramble' || currentQuestion.type === 'missing' || currentQuestion.type === 'listening') && !currentQuestion.options
    const isCorrect = isInputType
      ? input.trim().toLowerCase() === currentQuestion.word.trim().toLowerCase()
      : selectedOption === currentQuestion.answer

    const fullPool = wordPool.length > 0 ? wordPool : DEFAULT_VOCAB
    if (isCorrect) {
      setFeedback('correct')
      toast.success('⚡ Chính xác!')
      if (isSpeedRound) {
        setCorrectCount(c => c + 1)
        setTimeout(() => { setFeedback(null); setSelectedOption(null); setInput(''); setCurrentQuestion(generateQuestion(activeLevel, stageWordPool, fullPool)) }, 600)
      } else if (isBossRound) {
        const dmg = 5; const newHp = Math.max(0, bossHp - dmg)
        setBossHp(newHp)
        setCombatLog(p => ["⚔️ Chính xác! Gây " + dmg + " sát thương — Boss HP: " + newHp, ...p])
        if (newHp <= 0) { setTimeout(handleStageWin, 1200) }
        else { setTimeout(() => { setFeedback(null); setSelectedOption(null); setInput(''); const q = generateQuestion(activeLevel, stageWordPool, fullPool); setCurrentQuestion(q); if (q?.audio) speakWord(q.audio) }, 1200) }
      } else {
        // Normal stage: need REQUIRED_CORRECT consecutive correct answers
        const next = stageCorrect + 1
        setStageCorrect(next)
        if (next >= REQUIRED_CORRECT) {
          setTimeout(handleStageWin, 1000)
        } else {
          // Next question immediately after brief feedback
          setTimeout(() => {
            setFeedback(null); setSelectedOption(null); setInput('')
            const q = generateQuestion(activeLevel, stageWordPool, fullPool)
            setCurrentQuestion(q)
            if (q?.audio) speakWord(q.audio)
          }, 900)
        }
      }
    } else {
      setFeedback('wrong')
      toast.error('❌ Chưa chính xác!')
      if (isBossRound) {
        const dmg = difficulty === 'easy' ? 25 : difficulty === 'medium' ? 50 : 100
        const newPHp = Math.max(0, playerHp - dmg)
        setPlayerHp(newPHp)
        setCombatLog(p => ["💥 Sai! Boss phản công gây " + dmg + " — Giáp: " + newPHp, ...p])
        if (newPHp <= 0) { setTimeout(() => setStageState('defeat'), 1200) }
        else { setTimeout(() => { setFeedback(null); setSelectedOption(null); setInput('') }, 1200) }
      } else if (isSpeedRound) {
        setTimeout(() => { setFeedback(null); setSelectedOption(null); setInput(''); setCurrentQuestion(generateQuestion(activeLevel, stageWordPool, fullPool)) }, 600)
      } else {
        setTimeout(() => { setFeedback(null); setSelectedOption(null) }, 1200)
      }
    }
  }

  const handleNextLevel = () => startLevel((activeLevel || 0) + 1)

  const OptionBtn = ({ option, index, onSelect }) => {
    const isChecked = feedback !== null
    const isSelected = selectedOption === option
    const isOptCorrect = option === currentQuestion?.answer
    let cls = 'border-slate-800 bg-slate-900/60 hover:border-violet-500/40 text-slate-300'
    if (isSelected) cls = 'border-violet-500 bg-violet-950/20 text-white'
    if (isChecked) {
      if (isOptCorrect) cls = 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
      else if (isSelected) cls = 'border-rose-500 bg-rose-950/20 text-rose-300'
    }
    const labels = ['A','B','C','D']
    return (
      <button type="button" disabled={isChecked} onClick={() => onSelect(option)}
        className={"w-full py-3 px-4 rounded-xl border text-sm font-semibold transition-all text-left flex items-center gap-3 " + cls}>
        <span className="shrink-0 size-6 rounded-lg border border-current/25 flex items-center justify-center text-[10px] font-black">{labels[index] || index+1}</span>
        <span className="flex-1">{option}</span>
        {isChecked && isOptCorrect && <span className="material-symbols-outlined text-sm ml-auto">check</span>}
      </button>
    )
  }

  const VISIBLE = 10  // 5 columns × 2 rows
  // Clamp pickerPage so we never display stages beyond currentStage
  const maxPage = Math.floor((currentStage - 1) / VISIBLE)
  const clampedPage = Math.min(pickerPage, maxPage)
  const pickerStart = clampedPage * VISIBLE + 1
  const pickerEnd = Math.min(pickerStart + VISIBLE - 1, currentStage)
  const pickerLevels = Array.from({ length: pickerEnd - pickerStart + 1 }, (_, i) => pickerStart + i)

  const renderLevelPicker = () => (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-in fade-in duration-300">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 ws-font-display">
          🌟 {t('enter.game.infiniteTitle')}
        </h2>
        <p className="text-sm text-slate-400 mt-1.5">{t('enter.game.infiniteSubtitle')}</p>
        <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
            📊 {t('enter.game.infiniteCurrentStage')}: {currentStage}
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            🏆 {t('enter.game.infiniteRecord')}: {maxStageReached}
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
            {t('enter.game.infiniteNextBoss', { n: Math.ceil(currentStage / 10) * 10 })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {pickerLevels.map((level) => {
          const cfg = getStageConfig(level)
          const isBoss = level % 10 === 0
          const isUnlocked = level <= currentStage
          const isCompleted = level < currentStage
          const isCurrent = level === currentStage

          return (
            <div key={level} onClick={() => isUnlocked && startLevel(level)}
              className={"relative rounded-2xl border p-5 transition-all duration-200 select-none " + (
                isBoss
                  ? isUnlocked ? 'cursor-pointer border-rose-500/50 bg-rose-950/20 hover:border-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.35)] hover:scale-[1.04]' : 'opacity-35 border-rose-900/30 bg-rose-950/10 pointer-events-none'
                  : isUnlocked ? 'cursor-pointer border-violet-500/25 bg-slate-900/50 hover:border-cyan-400/70 hover:shadow-[0_0_18px_rgba(34,211,238,0.25)] hover:scale-[1.04]' : 'opacity-35 border-slate-800 bg-slate-950/20 pointer-events-none'
              )}
            >
              {isCurrent && <div className="absolute -top-1.5 -right-1.5 size-3 rounded-full bg-cyan-400 animate-ping" />}
              <div className="flex items-start justify-between mb-3">
                <span className={"text-[10px] font-black px-2 py-0.5 rounded-md border " + (isBoss ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-violet-500/15 text-violet-300 border-violet-500/25')}>
                  {isBoss ? '👹 BOSS' : t('enter.game.infiniteStageLabel', { n: level })}
                </span>
                {isCompleted ? <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
                  : !isUnlocked ? <span className="material-symbols-outlined text-base text-slate-600">lock</span>
                  : isCurrent ? <span className="text-[9px] font-black text-cyan-400 animate-pulse uppercase tracking-widest">{t('enter.game.infiniteNow')}</span>
                  : null}
              </div>
              <div className="text-3xl mb-2">{cfg.icon}</div>
              <h3 className="text-sm font-bold text-white leading-tight mb-1">{cfg.title}</h3>
              <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">{cfg.desc}</p>
              {isUnlocked && (
                <div className="mt-3 pt-2 border-t border-slate-800/50">
                  <span className="text-[10px] text-amber-400/80 font-bold">{t('enter.game.infiniteXpLabel', { n: 20 + Math.floor(level / 5) * 5 })}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination controls */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setPickerPage(p => Math.max(0, p - 1))}
          disabled={clampedPage === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:border-violet-500/60 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-sm transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <span className="material-symbols-outlined text-sm">chevron_left</span>
          {t('enter.game.infinitePrevPage')}
        </button>

        <span className="text-xs font-bold text-slate-500 tabular-nums">
          {t('enter.game.infinitePage', { current: clampedPage + 1, total: maxPage + 1 })}
          <span className="ml-2 text-slate-600">· {t('enter.game.infiniteStageRange', { from: pickerStart, to: pickerEnd })}</span>
        </span>

        <button
          type="button"
          onClick={() => setPickerPage(p => Math.min(maxPage, p + 1))}
          disabled={clampedPage >= maxPage}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:border-violet-500/60 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-sm transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          {t('enter.game.infiniteNextPage')}
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>
    </div>
  )

  const renderVictoryScreen = () => (
    <div className="max-w-md mx-auto text-center py-10 px-6 rounded-3xl border border-emerald-500/30 bg-slate-900/50 shadow-2xl animate-in zoom-in-95 duration-300">
      <span className="text-6xl block mb-3">{isBossRound ? '🏆' : '⭐'}</span>
      <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-1 ws-font-display">
        {isBossRound ? t('enter.game.infiniteBossVictoryTitle') : t('enter.game.infiniteVictoryTitle')}
      </h2>
      <p className="text-slate-400 text-sm mb-1">{t('enter.game.infiniteStageCleared', { n: activeLevel })}</p>
      <p className="text-xs text-slate-500 mb-6">
        {t('enter.game.infiniteNextStagePreview')} <span className="text-cyan-300 font-bold">{getStageConfig((activeLevel || 0) + 1).icon} {getStageConfig((activeLevel || 0) + 1).title}</span>
      </p>
      <div className="flex justify-center gap-4 mb-6">
        <div className="px-4 py-2.5 rounded-xl border border-cyan-400/20 bg-cyan-950/20 text-cyan-200">
          <p className="text-[10px] font-bold uppercase">XP</p>
          <p className="text-xl font-black">+{rewards.xp}</p>
        </div>
        <div className="px-4 py-2.5 rounded-xl border border-amber-400/20 bg-amber-950/20 text-amber-200">
          <p className="text-[10px] font-bold uppercase">Coin</p>
          <p className="text-xl font-black">+{rewards.coins}</p>
        </div>
      </div>
      <div className="space-y-2.5">
        <button type="button" onClick={handleNextLevel} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black rounded-xl hover:brightness-110 transition-all active:scale-[0.98]">{t('enter.game.infiniteNextStage')}</button>
        <button type="button" onClick={() => setActiveLevel(null)} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all">{t('enter.game.infiniteBackList')}</button>
      </div>
    </div>
  )

  const renderDefeatScreen = () => (
    <div className="max-w-md mx-auto text-center py-10 px-6 rounded-3xl border border-rose-500/25 bg-slate-900/50 shadow-2xl animate-in zoom-in-95 duration-300">
      <span className="text-6xl block mb-3">💀</span>
      <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-1 ws-font-display">{t('enter.game.infiniteDefeatTitle')}</h2>
      <p className="text-slate-400 text-sm mb-8">{t('enter.game.infiniteDefeatMsg', { n: activeLevel })}</p>
      <div className="space-y-2.5">
        <button type="button" onClick={() => startLevel(activeLevel)} className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black rounded-xl hover:brightness-110 transition-all active:scale-[0.98]">{t('enter.game.infiniteRetry')}</button>
        <button type="button" onClick={() => setActiveLevel(null)} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all">{t('enter.game.infiniteBackList')}</button>
      </div>
    </div>
  )

  const renderPlayStage = () => {
    if (!currentQuestion || !activeStageConfig) return null
    const { type } = activeStageConfig
    const isChecked = feedback !== null
    const isInputType = (type === 'scramble' || type === 'missing' || type === 'listening') && !currentQuestion.options

    return (
      <div className="max-w-xl mx-auto rounded-3xl border border-violet-500/20 bg-slate-900/50 p-6 md:p-8 shadow-2xl animate-in fade-in duration-300">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black tracking-widest text-violet-400 uppercase">STAGE {activeLevel}</span>
              <span className="text-[10px] text-slate-600">•</span>
              <span className="text-[10px] text-slate-500">{currentQuestion.word.length} chữ cái</span>
            </div>
            <h3 className="text-lg font-bold text-white">{activeStageConfig.icon} {activeStageConfig.title}</h3>
          </div>
          {/* Progress: N / REQUIRED_CORRECT correct */}
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1">
              {Array.from({ length: REQUIRED_CORRECT }).map((_, i) => (
                <div key={i} className={"size-2.5 rounded-full transition-all duration-300 " + (i < stageCorrect ? 'bg-emerald-400 scale-110' : 'bg-slate-700')} />
              ))}
              <span className="text-[10px] font-bold text-slate-400 ml-1">{stageCorrect}/{REQUIRED_CORRECT}</span>
            </div>
            <button type="button" onClick={() => setActiveLevel(null)} className="p-1 text-slate-600 hover:text-white transition-colors rounded-lg hover:bg-slate-800">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="py-5 px-4 bg-slate-950/40 rounded-2xl border border-slate-800 text-center">
            {type === 'scramble' && (<>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t('enter.game.scrambledWordLabel')}</p>
              <h4 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-300 tracking-wider ws-font-display font-mono">{currentQuestion.scrambled?.toUpperCase()}</h4>
              <p className="text-xs text-slate-500 mt-3 italic">"{currentQuestion.meaning}"</p>
            </>)}
            {type === 'missing' && (<>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t('enter.game.completeWordLabel')}</p>
              <h4 className="text-3xl font-black text-cyan-300 tracking-widest font-mono">{currentQuestion.display?.toUpperCase()}</h4>
              <p className="text-xs text-slate-500 mt-3">{currentQuestion.meaning}</p>
            </>)}
            {type === 'meaning' && (<>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t('enter.game.chooseMeaningLabel')}</p>
              <h4 className="text-2xl font-black text-white capitalize">{currentQuestion.word}</h4>
              {currentQuestion.example && <p className="text-xs text-slate-500 mt-2 italic">"{currentQuestion.example}"</p>}
            </>)}
            {type === 'word' && (<>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t('enter.game.whichWordMeansLabel')}</p>
              <h4 className="text-lg font-bold text-white">{currentQuestion.meaning}</h4>
            </>)}
            {type === 'sentence' && (<>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t('enter.game.fillBlankLabel')}</p>
              <h4 className="text-base text-slate-200 leading-relaxed font-semibold">{currentQuestion.display}</h4>
            </>)}
            {type === 'wrong_word' && (<>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t('enter.game.wrongWordLabel')}</p>
              <h4 className="text-base text-slate-200 leading-relaxed font-semibold italic">"{currentQuestion.display}"</h4>
            </>)}
            {type === 'synonym' && (<>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">CHOOSE SYNONYM FOR</p>
              <h4 className="text-2xl font-black text-white capitalize">{currentQuestion.word}</h4>
            </>)}
            {type === 'antonym' && (<>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">CHOOSE ANTONYM FOR</p>
              <h4 className="text-2xl font-black text-white capitalize">{currentQuestion.word}</h4>
            </>)}
            {type === 'listening' && (<>
              <button type="button" onClick={() => speakWord(currentQuestion.audio)}
                className="size-16 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 flex items-center justify-center hover:scale-105 active:scale-95 transition-all mx-auto shadow-md mb-2">
                <span className="material-symbols-outlined text-3xl">volume_up</span>
              </button>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Click to hear the pronunciation</p>
              <p className="text-xs text-slate-500 mt-1.5">Hint: "{currentQuestion.meaning}"</p>
            </>)}
            {type === 'image' && (<>
              <div className="text-6xl mb-3">{currentQuestion.emoji}</div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">WHAT WORD IS THIS?</p>
            </>)}
          </div>

          {currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((opt, i) => (
                <OptionBtn key={i} option={opt} index={i} onSelect={setSelectedOption} />
              ))}
            </div>
          )}

          {isInputType && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Answer</label>
              <input type="text" autoComplete="off" disabled={isChecked} value={input}
                onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckAnswer()}
                placeholder="Nhập đáp án..."
                className="w-full py-3.5 px-4 rounded-xl border border-slate-800 bg-slate-950/60 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors font-medium text-base"
              />
            </div>
          )}

          {isChecked && (
            <div className={"flex items-center gap-2 font-bold text-sm rounded-xl p-3 border animate-in fade-in duration-200 " + (
              feedback === 'correct' ? 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20' : 'text-rose-400 bg-rose-950/20 border-rose-500/20')}>
              <span className="material-symbols-outlined text-lg">{feedback === 'correct' ? 'check_circle' : 'cancel'}</span>
              <span>{feedback === 'correct' ? 'Chính xác! Tiếp tục...' : 'Chưa đúng. Thử lại nhé!'}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/60">
            <button type="button"
              disabled={isChecked || (isInputType ? !input.trim() : !selectedOption)}
              onClick={handleCheckAnswer}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-xl disabled:opacity-40 active:scale-95 transition-all text-xs font-bold">
              KIỂM TRA ✓
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderSpeedRound = () => {
    if (!currentQuestion) return null
    const isChecked = feedback !== null
    const timerPct = (timeLeft / 30) * 100
    return (
      <div className="max-w-xl mx-auto rounded-3xl border border-amber-500/25 bg-slate-900/50 p-6 shadow-2xl animate-in fade-in duration-300">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-4 mb-5">
          <div>
            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">STAGE {activeLevel} ⚡ SPEED ROUND</span>
            <h3 className="text-base font-bold text-white mt-0.5">Speed Round</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-black text-amber-300 font-mono">{timeLeft}s</div>
              <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div className="bg-amber-400 h-full rounded-full transition-all duration-1000" style={{ width: (timerPct) + "%" }} />
              </div>
            </div>
            <div className="px-2.5 py-1 bg-cyan-500/20 border border-cyan-500/25 rounded-lg text-cyan-300 font-bold text-xs">🎯 {correctCount}/5</div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="py-5 px-4 bg-slate-950/40 rounded-2xl border border-slate-800 text-center">
            <h4 className="text-base font-bold text-white">{currentQuestion.title}</h4>
          </div>
          <div className="space-y-2">
            {currentQuestion.options?.map((opt, idx) => {
              const isSelected = selectedOption === opt
              const isOptCorrect = opt === currentQuestion.answer
              let cls = 'border-slate-800 bg-slate-900/60 hover:border-amber-500/35 text-slate-300'
              if (isSelected) cls = 'border-amber-500 bg-amber-950/15 text-white'
              if (isChecked) {
                if (isOptCorrect) cls = 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                else if (isSelected) cls = 'border-rose-500 bg-rose-950/20 text-rose-300'
              }
              const labels = ['A','B','C','D']
              return (
                <button key={idx} type="button" disabled={isChecked}
                  onClick={() => {
                    setSelectedOption(opt)
                    setTimeout(() => {
                      const correct = opt === currentQuestion.answer
                      setFeedback(correct ? 'correct' : 'wrong')
                      if (correct) setCorrectCount(c => c + 1)
                      setTimeout(() => {
                        setFeedback(null); setSelectedOption(null)
                        setCurrentQuestion(generateQuestion(activeLevel, stageWordPool, fullPool))
                      }, 400)
                    }, 10)
                  }}
                  className={"w-full py-3 px-4 rounded-xl border text-sm font-semibold transition-all text-left flex items-center gap-3 " + cls}>
                  <span className="shrink-0 size-5 rounded-md border border-current/25 flex items-center justify-center text-[9px] font-black">{labels[idx]}</span>
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderBossBattle = () => {
    if (!currentQuestion) return null
    const isChecked = feedback !== null
    const isInputType = (currentQuestion.scrambled || (currentQuestion.audio && !currentQuestion.options)) && !currentQuestion.options

    return (
      <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_220px] gap-4 items-start">

          {/* ── LEFT: Boss panel ── */}
          <div className="rounded-2xl border border-rose-500/30 bg-slate-950/70 p-4 shadow-xl space-y-4">
            <div className="text-center">
              <span className="text-5xl animate-pulse block mb-2">👹</span>
              <p className="text-xs font-black text-rose-400 uppercase tracking-widest ws-font-display">BOSS #{Math.floor(activeLevel / 10)}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Stage {activeLevel}</p>
            </div>

            {/* Boss HP */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-rose-300 uppercase">Boss HP</span>
                <span className="text-[10px] font-black text-rose-300 font-mono">{bossHp}/150</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                <div className="bg-gradient-to-r from-rose-600 to-red-400 h-full rounded-full transition-all duration-500" style={{ width: (bossHp / 150 * 100) + "%" }} />
              </div>
            </div>

            {/* VS divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[9px] font-black text-slate-600 uppercase">VS</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Player HP */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-cyan-300 uppercase">Giáp bạn</span>
                <span className="text-[10px] font-black text-cyan-300 font-mono">{playerHp}/100</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full rounded-full transition-all duration-500" style={{ width: playerHp + "%" }} />
              </div>
            </div>

            {/* Feedback badge */}
            {isChecked && (
              <div className={`text-center text-xs font-bold py-2 px-3 rounded-xl border animate-in fade-in ${feedback === 'correct' ? 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20' : 'text-rose-400 bg-rose-950/20 border-rose-500/20'}`}>
                {feedback === 'correct' ? '⚔️ +5 sát thương!' : '💥 Boss phản công!'}
              </div>
            )}
          </div>

          {/* ── CENTER: Question card ── */}
          <div className="rounded-3xl border border-violet-500/20 bg-slate-900/50 p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-5">
              <span className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest">⚔️ ĐẠI CHIẾN BOSS — STAGE {activeLevel}</span>
              <button type="button" onClick={() => setActiveLevel(null)} className="text-slate-500 hover:text-white p-1">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="py-5 px-4 bg-slate-950/40 rounded-2xl border border-slate-800 text-center">
                {currentQuestion.type === 'scramble' && (<>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t('enter.game.sortWordLabel')}</p>
                  <h4 className="text-2xl font-black text-white font-mono tracking-wider">{currentQuestion.scrambled?.toUpperCase()}</h4>
                  <p className="text-xs text-slate-500 mt-2">"{currentQuestion.meaning}"</p>
                </>)}
                {currentQuestion.type === 'missing' && (<>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t('enter.game.completeWordLabel')}</p>
                  <h4 className="text-2xl font-black text-cyan-300 tracking-widest font-mono">{currentQuestion.display?.toUpperCase()}</h4>
                  <p className="text-xs text-slate-500 mt-2">{currentQuestion.meaning}</p>
                </>)}
                {currentQuestion.type === 'meaning' && (<>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t('enter.game.chooseMeaningLabel')}</p>
                  <h4 className="text-xl font-bold text-white capitalize">{currentQuestion.word}</h4>
                  {currentQuestion.example && <p className="text-xs text-slate-500 mt-1.5 italic">"{currentQuestion.example}"</p>}
                </>)}
                {currentQuestion.type === 'word' && (<>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t('enter.game.whichWordMeansLabel')}</p>
                  <h4 className="text-base text-slate-200 font-semibold">{currentQuestion.meaning}</h4>
                </>)}
                {currentQuestion.type === 'sentence' && (<>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t('enter.game.completeSentenceLabel')}</p>
                  <h4 className="text-base text-slate-200 font-semibold">{currentQuestion.display}</h4>
                </>)}
                {currentQuestion.type === 'wrong_word' && (<>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t('enter.game.wrongWordLabel')}</p>
                  <h4 className="text-base text-slate-200 font-semibold italic">"{currentQuestion.display}"</h4>
                </>)}
                {currentQuestion.type === 'synonym' && (<>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t('enter.game.chooseSynonymLabel')}</p>
                  <h4 className="text-xl font-bold text-white capitalize">{currentQuestion.word}</h4>
                </>)}
                {currentQuestion.type === 'antonym' && (<>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t('enter.game.chooseAntonymLabel')}</p>
                  <h4 className="text-xl font-bold text-white capitalize">{currentQuestion.word}</h4>
                </>)}
                {currentQuestion.type === 'listening' && (<>
                  <button type="button" onClick={() => speakWord(currentQuestion.audio)}
                    className="size-14 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 flex items-center justify-center hover:scale-105 active:scale-95 transition-all mx-auto shadow-md mb-2">
                    <span className="material-symbols-outlined text-2xl">volume_up</span>
                  </button>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('enter.game.listenLabel')}</p>
                  <p className="text-xs text-slate-550 mt-1">{t('enter.game.listenHint', { meaning: currentQuestion.meaning })}</p>
                </>)}
                {currentQuestion.type === 'image' && (<>
                  <div className="text-5xl mb-2">{currentQuestion.emoji}</div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('enter.game.imageGuessLabel2')}</p>
                </>)}
              </div>

              {currentQuestion.options ? (
                <div className="space-y-2">
                  {currentQuestion.options.map((opt, idx) => (
                    <OptionBtn key={idx} option={opt} index={idx} onSelect={setSelectedOption} />
                  ))}
                </div>
              ) : (
                <input type="text" autoComplete="off" disabled={isChecked} value={input}
                  onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckAnswer()}
                  placeholder="Nhập đáp án..."
                  className="w-full py-3 px-4 rounded-xl border border-slate-800 bg-slate-950/60 text-white placeholder:text-slate-700 focus:outline-none focus:border-violet-500 transition-colors"
                />
              )}

              <div className="flex justify-end pt-2 border-t border-slate-800/60">
                <button type="button"
                  disabled={isChecked || (currentQuestion.options ? !selectedOption : !input.trim())}
                  onClick={handleCheckAnswer}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl disabled:opacity-40 active:scale-95 transition-all text-xs">
                  TẤN CÔNG ⚔️
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Combat log ── */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-xl">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-slate-600">history</span>
              Nhật ký chiến đấu
            </p>
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
              {combatLog.length === 0 && (
                <p className="text-[10px] text-slate-600 italic">Trận chiến chưa bắt đầu...</p>
              )}
              {combatLog.map((log, i) => (
                <div key={i} className={`text-[10px] leading-relaxed font-semibold py-1.5 px-2.5 rounded-lg ${
                  log.includes('Gây') || log.includes('Chính xác')
                    ? 'text-emerald-300 bg-emerald-950/30 border border-emerald-900/40'
                    : log.includes('phản công') || log.includes('Sai')
                      ? 'text-rose-300 bg-rose-950/30 border border-rose-900/40'
                      : 'text-slate-400 bg-slate-900/40 border border-slate-800/60'
                }`}>{log}</div>
              ))}
            </div>
          </div>

        </div>
      </div>
    )
  }


  return (
    <main className="w-full min-h-[70vh] flex flex-col relative">
      {activeLevel === null ? (
        <div className="flex-1 flex flex-col justify-center">
          {renderLevelPicker()}
        </div>
      ) : (
        <div className="px-4 pt-4 pb-6">
          {stageState === 'victory' && renderVictoryScreen()}
          {stageState === 'defeat'  && renderDefeatScreen()}
          {stageState === 'playing' && (
            isBossRound ? renderBossBattle() : isSpeedRound ? renderSpeedRound() : renderPlayStage()
          )}
        </div>
      )}
    </main>
  )
}
