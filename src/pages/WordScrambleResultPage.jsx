import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { wordScrambleService } from '../services/wordScramble.service'
import { friendsService } from '../services/friends.service'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'

export default function WordScrambleResultPage() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [game, setGame] = useState(null)
  const [requestingIds, setRequestingIds] = useState(new Set())

  useEffect(() => {
    if (!roomCode) return
    wordScrambleService.getResults(roomCode)
      .then(res => {
        if (res?.data?.game) {
          setGame(res.data.game)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load results:', err)
        setLoading(false)
      })
  }, [roomCode])

  const handleAddFriend = async (userId) => {
    if (requestingIds.has(userId)) return
    setRequestingIds(prev => new Set(prev).add(userId))
    try {
      await friendsService.sendRequest(userId)
      toast.success(t('friends.requestSentSuccess'))
    } catch (err) {
      toast.error(err.response?.data?.message || t('friends.requestFailed'))
      setRequestingIds(prev => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center p-8">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-5xl text-primary mb-4">progress_activity</span>
          <p className="text-gray-400">{t('common.loadingResults')}</p>
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">error</span>
        <h1 className="text-2xl font-bold text-white mb-2">{t('enter.game.resultsNotFound')}</h1>
        <p className="text-gray-400 mb-6">{t('enter.game.resultsNotFoundDesc')}</p>
        <button
          onClick={() => navigate('/practice/entertainment')}
          className="rounded-xl bg-primary text-background-dark font-bold px-8 py-3 hover:brightness-110 transition-all"
        >
          {t('common.backToEntertainment')}
        </button>
      </div>
    )
  }

  const sortedPlayers = [...game.players].sort((a, b) => (b.score || 0) - (a.score || 0))

  return (
    <div className="min-h-screen bg-background-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight ws-font-display">
            {t('enter.game.gameOverTitle')}
          </h1>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-bold uppercase tracking-widest">
            {t('enter.game.roomCode')}: {roomCode}
          </div>
        </div>

        {/* Podium for top 3 */}
        <div className="flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 mb-16 px-4">
          {/* 2nd Place */}
          {sortedPlayers[1] && (
             <div className="order-2 sm:order-1 flex flex-col items-center w-full sm:w-auto">
               <div className="mb-2 relative">
                 <img src={sortedPlayers[1].avatar || '/default-avatar.png'} alt={sortedPlayers[1].name} className="w-16 h-16 rounded-full border-4 border-slate-400 object-cover bg-slate-800" />
                 <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-slate-900 font-bold text-sm">2</div>
               </div>
               <div className="w-full sm:w-32 bg-slate-400/20 border-t-4 border-slate-400 h-24 rounded-t-lg flex flex-col items-center justify-center p-2 text-center">
                 <p className="text-white font-bold truncate w-full px-1">{sortedPlayers[1].name}</p>
                 <p className="text-slate-300 text-sm font-mono">{sortedPlayers[1].score} pts</p>
               </div>
             </div>
          )}
          
          {/* 1st Place */}
          {sortedPlayers[0] && (
            <div className="order-1 sm:order-2 flex flex-col items-center w-full sm:w-auto">
              <div className="mb-2 relative scale-110">
                <img src={sortedPlayers[0].avatar || '/default-avatar.png'} alt={sortedPlayers[0].name} className="w-20 h-20 rounded-full border-4 border-amber-400 object-cover bg-slate-800" />
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl animate-bounce">👑</span>
                <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-amber-900 font-bold text-base shadow-[0_0_15px_rgba(251,191,36,0.5)]">1</div>
              </div>
              <div className="w-full sm:w-40 bg-amber-400/20 border-t-8 border-amber-400 h-36 rounded-t-lg flex flex-col items-center justify-center p-2 text-center shadow-[0_0_30px_rgba(251,191,36,0.1)]">
                <p className="text-white font-black text-lg truncate w-full px-1">{sortedPlayers[0].name}</p>
                <p className="text-amber-300 font-mono text-xl">{sortedPlayers[0].score} {t('enter.game.pointsUnit')}</p>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {sortedPlayers[2] && (
            <div className="order-3 flex flex-col items-center w-full sm:w-auto">
              <div className="mb-2 relative">
                <img src={sortedPlayers[2].avatar || '/default-avatar.png'} alt={sortedPlayers[2].name} className="w-14 h-14 rounded-full border-4 border-amber-700/60 object-cover bg-slate-800" />
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-amber-700/80 flex items-center justify-center text-white font-bold text-xs font-mono">3</div>
              </div>
              <div className="w-full sm:w-32 bg-amber-700/10 border-t-4 border-amber-700/60 h-20 rounded-t-lg flex flex-col items-center justify-center p-2 text-center">
                <p className="text-white font-bold truncate w-full px-1">{sortedPlayers[2].name}</p>
                <p className="text-amber-600/90 text-sm font-mono">{sortedPlayers[2].score} {t('enter.game.pointsUnit')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Full Rankings List */}
        <div className="bg-card-dark rounded-3xl border border-border-dark overflow-hidden shadow-2xl mb-8">
          <div className="px-6 py-4 border-b border-border-dark bg-white/5 flex items-center justify-between">
            <h3 className="font-black text-lg text-white ws-font-display tracking-wide uppercase">
              {t('enter.game.fullRankings')}
            </h3>
            <span className="text-xs text-gray-500 font-bold">{sortedPlayers.length} {t('enter.game.playersLabel')}</span>
          </div>

          <div className="divide-y divide-border-dark/50">
            {sortedPlayers.map((p, idx) => {
              const isMe = String(p.userId) === String(currentUser?.id || currentUser?._id)
              return (
                <div key={p.userId} className={`flex items-center gap-4 px-6 py-5 transition-colors ${isMe ? 'bg-primary/5' : 'hover:bg-white/5'}`}>
                  <div className="w-8 font-black text-xl text-gray-600 italic">#{idx + 1}</div>
                  
                  <Link to={`/profile/${p.userId}`} className="shrink-0 group">
                    <img src={p.avatar || '/default-avatar.png'} alt={p.name} className="w-12 h-12 rounded-full border-2 border-slate-700 group-hover:border-primary transition-all object-cover bg-slate-800" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link to={`/profile/${p.userId}`} className="font-bold text-white hover:text-primary transition-colors truncate">
                        {p.name}
                      </Link>
                      {isMe && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/20">{t('enter.game.youLabel')}</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <span className="material-symbols-outlined text-[14px] text-emerald-400">check_circle</span>
                        {p.correctCount || 0} {t('enter.game.correctAnswers')}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <span className="material-symbols-outlined text-[14px] text-fuchsia-400">local_fire_department</span>
                        {p.maxStreak || 0} {t('enter.game.maxStreak')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 px-4">
                    <p className="text-2xl font-black text-white">{p.score || 0}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('enter.game.pointsUnit')}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isMe && (
                      <button
                        onClick={() => handleAddFriend(p.userId)}
                        disabled={requestingIds.has(p.userId)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          requestingIds.has(p.userId)
                            ? 'bg-slate-800 text-slate-500'
                            : 'bg-primary/10 text-primary hover:bg-primary hover:text-background-dark'
                        }`}
                        title={t('friends.sendRequest')}
                      >
                        <span className="material-symbols-outlined">
                          {requestingIds.has(p.userId) ? 'pending' : 'person_add'}
                        </span>
                      </button>
                    )}
                    <Link
                      to={`/profile/${p.userId}`}
                      className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all"
                      title={t('common.viewProfile')}
                    >
                      <span className="material-symbols-outlined">visibility</span>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate('/practice/entertainment/word-scramble')}
            className="flex items-center gap-2 rounded-2xl bg-slate-900 border border-border-dark px-10 py-4 font-bold text-white hover:bg-slate-800 transition-all shadow-xl"
          >
            <span className="material-symbols-outlined">replay</span>
            {t('enter.game.playAgain')}
          </button>
        </div>
      </div>
    </div>
  )
}
