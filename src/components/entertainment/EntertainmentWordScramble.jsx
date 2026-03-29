import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { wordScrambleService } from '../../services/wordScramble.service'
import { scrambleLetters } from '../../utils/scrambleLetters'

const MULTI_PLAYER_COUNTS = [2, 4, 6, 8]

/** @param {{ fullScreen?: boolean, gameMode?: 'solo' | 'multi', playerCount?: number, difficulty?: 'easy' | 'medium' | 'hard' }} props */
export function EntertainmentWordScramble({
  fullScreen = false,
  gameMode = 'solo',
  playerCount = 2,
  difficulty = 'medium',
}) {
  const { t } = useTranslation()
  const isMulti = gameMode === 'multi'
  const rawPc = Number(playerCount) || 2
  const nPlayers = isMulti
    ? MULTI_PLAYER_COUNTS.includes(rawPc)
      ? rawPc
      : MULTI_PLAYER_COUNTS[0]
    : 1
  const shellRef = useRef(null)
  const [entry, setEntry] = useState(null)
  const [scrambled, setScrambled] = useState('')
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
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
    setLoadingWord(true)
    let cancelled = false
    ;(async () => {
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

  const onCheck = useCallback(() => {
    if (!entry || feedback === 'correct') return
    const ok = input.trim().toLowerCase() === entry.word
    if (ok) {
      setFeedback('correct')
      if (!isMulti) {
        setScore((s) => s + 10 + Math.min(streak, 5) * 2)
        setStreak((s) => s + 1)
      } else {
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
  }, [entry, feedback, input, isMulti, streak, activePlayer, streaks, nPlayers])

  const onNext = useCallback(() => {
    setLoadingWord(true)
    ;(async () => {
      await pickNext()
      setLoadingWord(false)
    })()
    if (isMulti) {
      setActivePlayer((p) => ((p % nPlayers) + 1))
    }
  }, [pickNext, isMulti, nPlayers])

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
              ;(async () => {
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
    : `rounded-xl border border-border-dark bg-card-dark overflow-hidden transition-shadow ${
        wrongPulse ? 'ring-2 ring-red-500/60' : ''
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
            className={`font-bold flex flex-wrap items-center gap-2 ${
              fullScreen ? 'ws-font-display text-xl sm:text-2xl text-white' : 'text-lg text-white'
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
        ) : (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 max-w-full">
            {Array.from({ length: nPlayers }, (_, i) => i + 1).map((pid) => (
              <div
                key={pid}
                className={`rounded-xl px-3 py-2 border text-sm transition-all duration-300 ${
                  fullScreen
                    ? activePlayer === pid
                      ? 'ws-pill-active text-white'
                      : 'ws-pill-idle text-slate-500'
                    : activePlayer === pid
                      ? 'border-primary bg-primary/15 text-white'
                      : 'border-border-dark bg-background-dark/80 text-gray-400'
                }`}
              >
                <span className={fullScreen ? 'font-bold text-cyan-200' : 'font-bold text-primary'}>
                  {t('enter.game.playerLabel', { n: pid })}
                </span>
                <span className="mx-2 text-slate-500">|</span>
                <span>{t('enter.game.score', { n: scores[pid] ?? 0 })}</span>
                <span className={fullScreen ? 'text-fuchsia-300/90 ml-2' : 'text-primary/80 ml-2'}>
                  {t('enter.game.streakShort', { n: streaks[pid] ?? 0 })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {isMulti && (
        <div
          className={
            fullScreen
              ? 'ws-turn-banner px-4 py-2.5 text-center text-sm font-bold text-cyan-100 shrink-0 ws-font-display tracking-wide'
              : 'px-4 py-2.5 bg-primary/10 border-b border-primary/20 text-center text-sm font-semibold text-primary shrink-0'
          }
        >
          {t('enter.game.turnPlayer', { n: activePlayer })}
        </div>
      )}

      <div
        className={`space-y-6 min-h-0 ${
          fullScreen
            ? 'flex-1 flex flex-col px-4 sm:px-8 py-6 sm:py-10 overflow-y-auto justify-center min-h-0'
            : 'p-5 md:p-8'
        }`}
      >
        {entry && (
          <>
            <div className={fullScreen ? 'ws-fade-rise' : ''}>
              <p
                className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${
                  fullScreen ? 'text-cyan-500/70' : 'text-gray-500'
                }`}
              >
                {t('enter.game.scrambledLabel')}
              </p>
              <p
                className={`font-mono font-bold break-all leading-tight ${
                  fullScreen
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
                className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${
                  fullScreen ? 'text-fuchsia-400/65' : 'text-gray-500'
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
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  fullScreen ? 'text-violet-400/70' : 'text-gray-500'
                }`}
              >
                {isMulti ? t('enter.game.answerForPlayer', { n: activePlayer }) : t('enter.game.yourAnswer')}
              </label>
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
                disabled={feedback === 'correct'}
                className={
                  fullScreen
                    ? `ws-input-game ${feedback === 'correct' ? 'opacity-60' : ''} py-4 text-lg sm:text-xl px-4`
                    : 'w-full rounded-xl border border-border-dark bg-background-dark px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50'
                }
                placeholder={t('enter.game.placeholder')}
              />
            </div>

            {feedback === 'correct' && (
              <p
                className={`text-sm font-bold flex items-center gap-2 ${
                  fullScreen ? 'text-emerald-300 animate-ws-correct-pop drop-shadow-[0_0_12px_rgba(52,211,153,0.35)]' : 'font-semibold text-emerald-400'
                }`}
              >
                <span className="material-symbols-outlined text-lg">check_circle</span>
                {isMulti ? t('enter.game.correctMulti', { n: activePlayer }) : t('enter.game.correct')}
              </p>
            )}
            {feedback === 'wrong' && (
              <p
                className={`text-sm font-bold flex items-center gap-2 ${
                  fullScreen ? 'text-amber-300 animate-pulse' : 'font-semibold text-amber-400'
                }`}
              >
                <span className="material-symbols-outlined text-lg">refresh</span>
                {isMulti ? t('enter.game.wrongMulti') : t('enter.game.wrong')}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              {feedback !== 'correct' ? (
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
    </div>
  )
}
