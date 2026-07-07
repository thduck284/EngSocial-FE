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
