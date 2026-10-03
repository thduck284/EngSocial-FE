import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { wordScrambleService } from '../services/wordScramble.service'
import { friendsService } from '../services/friends.service'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { avatarForPlayer, DEFAULT_AVATAR } from '../utils/entertainmentPlayer'
import { WordScrambleGameArena } from '../components/entertainment/WordScrambleGameArena'
import { ROUTES } from '../constants'

function PodiumCard({ player, rank, t }) {
  if (!player) return null
  const name = player.name || t('enter.game.playerLabel', { n: rank })
  const score = player.score || 0

  const sizeMap = {
    1: {
      wrap: 'order-1 sm:order-2 scale-105',
      img: 'size-20 border-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.35)]',
      badge: 'size-9 bg-amber-400 text-amber-950 text-base',
      podium: 'sm:w-40 h-36 border-t-8 border-amber-400 bg-amber-400/15',
      score: 'text-xl text-amber-300',
      crown: true,
    },
    2: {
      wrap: 'order-2 sm:order-1',
      img: 'size-16 border-slate-300 shadow-[0_0_16px_rgba(148,163,184,0.25)]',
      badge: 'size-8 bg-slate-300 text-slate-900 text-sm',
      podium: 'sm:w-32 h-24 border-t-4 border-slate-400 bg-slate-400/15',
      score: 'text-sm text-slate-300',
      crown: false,
    },
    3: {
      wrap: 'order-3',
      img: 'size-14 border-amber-700/70',
      badge: 'size-7 bg-amber-800/90 text-white text-xs',
      podium: 'sm:w-32 h-20 border-t-4 border-amber-700/60 bg-amber-900/15',
      score: 'text-sm text-amber-500/90',
      crown: false,
    },
  }
  const s = sizeMap[rank] || sizeMap[2]

  return (
    <div className={`flex flex-col items-center w-full sm:w-auto ws-fade-rise ${s.wrap}`}>
      <div className="mb-2 relative">
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md" />
        <img
          src={avatarForPlayer(player)}
          alt={name}
          className={`relative z-10 rounded-full border-4 object-cover bg-slate-900 ${s.img}`}
          onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR }}
        />
        {s.crown && (
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl animate-bounce z-20">👑</span>
        )}
        <div className={`absolute -bottom-2 -right-2 z-20 rounded-full flex items-center justify-center font-bold ${s.badge}`}>
          {rank}
        </div>
      </div>
      <div className={`w-full rounded-t-xl flex flex-col items-center justify-center p-2 text-center border border-violet-500/20 ${s.podium}`}>
        <p className="text-white font-bold truncate w-full px-1">{name}</p>
        <p className={`font-mono font-bold ${s.score}`}>
          {score} {t('enter.game.pointsUnit')}
        </p>
      </div>
    </div>
  )
}

export default function WordScrambleResultPage() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [game, setGame] = useState(null)
  const [requestingIds, setRequestingIds] = useState(new Set())
  const stateSnapshot = location.state?.gameSnapshot

  useEffect(() => {
    if (!roomCode) return
    wordScrambleService.getResults(roomCode)
      .then((res) => {
        const apiGame = res?.data?.game
        if (apiGame?.players?.length) {
          setGame(apiGame)
        } else if (stateSnapshot?.players?.length) {
          setGame({
            ...stateSnapshot,
            roomCode: stateSnapshot.roomCode || roomCode,
            status: 'finished',
          })
        } else if (apiGame) {
          setGame(apiGame)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load results:', err)
        if (stateSnapshot?.players?.length) {
          setGame({
            ...stateSnapshot,
            roomCode: stateSnapshot.roomCode || roomCode,
            status: 'finished',
          })
        }
        setLoading(false)
      })
  }, [roomCode, stateSnapshot])

  const handleAddFriend = async (userId) => {
    if (requestingIds.has(userId)) return
    setRequestingIds((prev) => new Set(prev).add(userId))
    try {
      await friendsService.sendRequest(userId)
      toast.success(t('friends.requestSentSuccess'))
    } catch (err) {
      toast.error(err.response?.data?.message || t('friends.requestFailed'))
      setRequestingIds((prev) => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }
  }

  const topBar = (
  <>
    <button
      type="button"
      onClick={() => navigate(ROUTES.SKILLS.ENTERTAINMENT_WORD_SCRAMBLE)}
      className="ws-link-back px-1"
    >
      <span className="material-symbols-outlined text-xl">arrow_back</span>
      <span className="hidden sm:inline">{t('enter.game.playAgain')}</span>
    </button>
    {roomCode && (
      <span className="text-[10px] sm:text-xs font-mono text-cyan-200/90 px-2 py-1 rounded-lg border border-cyan-500/25 bg-slate-950/60">
        {roomCode}
      </span>
    )}
  </>
  )

  if (loading) {
    return (
      <WordScrambleGameArena topBar={topBar}>
        <div className="flex flex-col items-center justify-center flex-1 py-16 ws-fade-rise">
          <span className="material-symbols-outlined animate-spin text-5xl text-cyan-400 mb-4">progress_activity</span>
          <p className="text-slate-400">{t('common.loadingResults')}</p>
        </div>
      </WordScrambleGameArena>
    )
  }

  if (!game) {
    return (
      <WordScrambleGameArena topBar={topBar}>
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center ws-fade-rise px-4">
          <span className="material-symbols-outlined text-6xl text-violet-400/60 mb-4">error</span>
          <h1 className="text-2xl font-bold text-white mb-2 ws-font-display">{t('enter.game.resultsNotFound')}</h1>
          <p className="text-slate-400 mb-6 max-w-md">{t('enter.game.resultsNotFoundDesc')}</p>
          <button type="button" onClick={() => navigate(ROUTES.SKILLS.ENTERTAINMENT)} className="ws-btn-arcade px-8 py-3">
            {t('common.backToEntertainment')}
          </button>
        </div>
      </WordScrambleGameArena>
    )
  }

  const sortedPlayers = [...game.players].sort((a, b) => (b.score || 0) - (a.score || 0))

  return (
    <WordScrambleGameArena topBar={topBar}>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-1 sm:px-2 pb-4">
        <div className="max-w-3xl mx-auto ws-fade-rise">
          <div className="text-center mb-8 sm:mb-10 pt-2">
            <p className="text-[10px] uppercase tracking-[0.25em] text-fuchsia-300/80 font-bold mb-2 ws-font-display">
              {t('enter.game.modeMultiTitle')}
            </p>
            <h1 className="text-3xl sm:text-5xl font-black mb-3 ws-font-display ws-hero-gradient">
              {t('enter.game.gameOverTitle')}
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/35 bg-violet-950/50 text-violet-200 text-xs font-bold uppercase tracking-widest">
              {t('enter.game.roomCode')}: {roomCode}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 mb-10 px-2">
            <PodiumCard player={sortedPlayers[1]} rank={2} t={t} />
            <PodiumCard player={sortedPlayers[0]} rank={1} t={t} />
            <PodiumCard player={sortedPlayers[2]} rank={3} t={t} />
          </div>

          <div className="rounded-2xl border border-violet-500/30 bg-slate-950/45 overflow-hidden shadow-[0_8px_40px_-12px_rgba(139,92,246,0.35)] mb-8">
            <div className="px-4 sm:px-6 py-4 border-b border-violet-500/20 bg-violet-950/30 flex items-center justify-between">
              <h3 className="font-black text-sm sm:text-base text-violet-100 ws-font-display tracking-wide uppercase">
                {t('enter.game.fullRankings')}
              </h3>
              <span className="text-[10px] text-cyan-300/80 font-bold uppercase tracking-wider">
                {sortedPlayers.length} {t('enter.game.playersLabel')}
              </span>
            </div>

            <div className="divide-y divide-violet-500/10 p-2 sm:p-3 space-y-2">
              {sortedPlayers.map((p, idx) => {
                const isMe = String(p.userId) === String(currentUser?.id || currentUser?._id)
                const name = p.name || t('enter.game.playerLabel', { n: idx + 1 })
                return (
                  <div
                    key={p.userId}
                    className={`rounded-xl px-3 sm:px-4 py-3 border text-sm transition-all ${
                      isMe ? 'ws-pill-active text-white' : 'ws-pill-idle text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 font-black text-base text-violet-300/70 italic shrink-0">#{idx + 1}</span>
                      <Link to={`/profile/${p.userId}`} className="shrink-0 group">
                        <img
                          src={avatarForPlayer(p)}
                          alt={name}
                          className="size-11 rounded-full border-2 border-violet-400/40 object-cover bg-slate-900 group-hover:border-cyan-400/60 transition-all"
                          onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR }}
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link to={`/profile/${p.userId}`} className="font-bold text-cyan-100 hover:text-cyan-300 truncate transition-colors">
                            {name}
                          </Link>
                          {isMe && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-400/35 text-cyan-200 uppercase">
                              {t('enter.game.youLabel')}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-emerald-400">check_circle</span>
                            {p.correctCount || 0} {t('enter.game.correctAnswers')}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-fuchsia-400">local_fire_department</span>
                            {p.maxStreak || 0} {t('enter.game.maxStreak')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 px-1">
                        <p className="text-xl sm:text-2xl font-black text-white">{p.score || 0}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t('enter.game.pointsUnit')}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isMe && (
                          <button
                            type="button"
                            onClick={() => handleAddFriend(p.userId)}
                            disabled={requestingIds.has(p.userId)}
                            className={`size-9 rounded-lg flex items-center justify-center transition-all border ${
                              requestingIds.has(p.userId)
                                ? 'border-slate-700 bg-slate-900 text-slate-600'
                                : 'border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/25'
                            }`}
                            title={t('friends.sendRequest')}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {requestingIds.has(p.userId) ? 'pending' : 'person_add'}
                            </span>
                          </button>
                        )}
                        <Link
                          to={`/profile/${p.userId}`}
                          className="size-9 rounded-lg border border-slate-700/80 bg-slate-900/80 text-slate-400 flex items-center justify-center hover:border-cyan-500/40 hover:text-cyan-200 transition-all"
                          title={t('common.viewProfile')}
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-center pb-4">
            <button
              type="button"
              onClick={() => navigate(ROUTES.SKILLS.ENTERTAINMENT_WORD_SCRAMBLE)}
              className="ws-btn-arcade px-10 py-3.5 text-sm sm:text-base flex items-center gap-2"
            >
              <span className="material-symbols-outlined">replay</span>
              {t('enter.game.playAgain')}
            </button>
          </div>
        </div>
      </div>
    </WordScrambleGameArena>
  )
}
