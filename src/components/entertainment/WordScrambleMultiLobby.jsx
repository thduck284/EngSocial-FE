import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants'
import { DEFAULT_AVATAR } from '../../constants/ui'
const QUICK_MESSAGES = [
  '👋 Hello!',
  '🎮 Ready?',
  '🔥 Let\'s go!',
  '👍 Good luck!',
  '⏳ Wait...',
]

/**
 * @param {{
 *   lobby: ReturnType<typeof import('../../hooks/useWordScrambleLobby').useWordScrambleLobby>,
 *   onBack: () => void,
 * }} props
 */
export function WordScrambleMultiLobby({ lobby, onBack }) {
  const { t } = useTranslation()
  const [chatInput, setChatInput] = useState('')
  const [inviteCopied, setInviteCopied] = useState(false)
  const chatEndRef = useRef(null)
  const {
    connected,
    roomCode,
    capacity,
    slots,
    hostId,
    chatMessages,
    myReady,
    seated,
    isHost,
    canStart,
    initError,
    startError,
    setReady,
    sendChat,
    startGame,
    leaveRoom,
    inviteUrl,
  } = lobby

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [chatMessages.length])

  const handleBack = () => {
    leaveRoom()
    onBack()
  }

  const avatarFor = (slot) => {
    if (slot?.avatar) return slot.avatar
    const n = slot?.name || '?'
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=7c3aed&color=fff`
  }

  const sendChatSubmit = (e) => {
    e.preventDefault()
    const msg = chatInput.trim()
    if (!msg) return
    sendChat(msg)
    setChatInput('')
  }

  const copyInvite = async () => {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setInviteCopied(true)
      window.setTimeout(() => setInviteCopied(false), 2000)
    } catch {
      setInviteCopied(false)
    }
  }

  if (initError === 'login_required') {
    return (
      <div className="flex flex-col flex-1 min-h-0 justify-center items-center gap-6 py-8 px-4 ws-fade-rise text-center">
        <p className="text-slate-300 max-w-md">{t('enter.game.wsLobbyLoginRequired')}</p>
        <Link to={ROUTES.LOGIN} className="ws-btn-arcade px-8 py-3 text-sm">
          {t('enter.game.wsLobbyGoLogin')}
        </Link>
        <button type="button" onClick={handleBack} className="ws-link-back">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          {t('enter.game.backPickPlayers')}
        </button>
      </div>
    )
  }

  if (initError) {
    const errMap = {
      not_found: 'enter.game.wsLobbyErrNotFound',
      full: 'enter.game.wsLobbyErrFull',
      connect_failed: 'enter.game.wsLobbyErrConnect',
      bad_params: 'enter.game.wsLobbyErrBadParams',
    }
    const key = errMap[initError] || 'enter.game.wsLobbyErrGeneric'
    return (
      <div className="flex flex-col flex-1 min-h-0 justify-center items-center gap-6 py-8 px-4 ws-fade-rise text-center">
        <p className="text-amber-200/90 max-w-md">{t(key)}</p>
        <button type="button" onClick={handleBack} className="ws-btn-arcade px-8 py-3 text-sm">
          {t('enter.game.wsLobbyErrBack')}
        </button>
      </div>
    )
  }

  const slotArray = Array.from({ length: capacity || slots.length || 0 }, (_, i) => slots[i] ?? null)

  return (
    <div className="flex flex-col flex-1 min-h-0 px-2 sm:px-4 py-4 justify-start ws-fade-rise">
      {/* Status indicator - fixed height to avoid layout shift when disappearing */}
      <div className="h-8 flex items-center justify-center shrink-0">
        {!connected && (
          <p className="text-center text-sm text-slate-400 flex items-center gap-2">
            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            {t('enter.game.wsLobbyConnecting')}
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-8 mt-4 sm:mt-6 max-w-7xl mx-auto w-full justify-between">
        <div className="flex-1 min-h-0 flex flex-col gap-4 max-w-3xl">
          <div className="shrink-0 space-y-1">
            <h2 className="ws-font-display ws-hero-gradient text-xl sm:text-3xl font-bold text-center">
              {t('enter.game.multiLobbyTitle')}
            </h2>
            <p className="text-xs text-slate-400 text-center max-w-xl mx-auto">{t('enter.game.multiLobbySubtitle')}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 content-center px-1">
            {slotArray.map((slot, idx) => {
              const isSlotHost = slot && String(hostId) === String(slot.userId)
              return (
                <div
                  key={`slot-${idx}-${slot?.userId ?? 'empty'}`}
                  className={`group relative rounded-2xl border-2 p-3 flex flex-col items-center text-center gap-2 min-h-[120px] justify-center transition-all duration-300 ${
                    slot
                      ? 'border-fuchsia-500/40 bg-slate-900/60 shadow-[0_8px_32px_-12px_rgba(217,70,239,0.5)] backdrop-blur-md'
                      : 'border-dashed border-slate-700/50 bg-slate-950/30 hover:bg-slate-900/40'
                  }`}
                >
                  {slot ? (
                    <>
                      <div className="relative">
                        <div className={`absolute inset-0 rounded-full blur-lg opacity-40 transition-all duration-500 ${slot.ready ? 'bg-emerald-500' : 'bg-fuchsia-500'}`} />
                        <img
                          src={avatarFor(slot)}
                          alt=""
                          className={`relative z-10 size-16 rounded-full object-cover border-2 shadow-2xl transition-transform duration-300 group-hover:scale-110 ${
                            slot.ready ? 'border-emerald-400' : 'border-fuchsia-400'
                          }`}
                          onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR }}
                        />
                        {isSlotHost ? (
                          <div className="absolute -top-1 -right-1 z-20 size-7 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center border-2 border-slate-900 shadow-lg animate-pulse" title={t('enter.game.wsLobbyHost')}>
                            <span className="material-symbols-outlined text-[14px] text-white font-bold">star</span>
                          </div>
                        ) : null}
                        {slot.ready ? (
                          <div className="absolute -bottom-1 -right-1 z-20 size-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center border-2 border-slate-900 shadow-lg">
                            <span className="material-symbols-outlined text-white text-[16px]">check</span>
                          </div>
                        ) : null}
                      </div>
                      <div className="space-y-0.5 z-10">
                        <p className="text-sm font-bold text-white tracking-tight line-clamp-1">{slot.name}</p>
                        <p className={`text-[10px] uppercase font-heavy tracking-widest ${slot.ready ? 'text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-slate-500'}`}>
                          {slot.ready ? t('enter.game.wsLobbyReady') : t('enter.game.wsLobbyWaiting')}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-600/60 group-hover:text-slate-500/80 transition-colors">
                      <div className="size-12 rounded-full border-2 border-dashed border-slate-700/50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">person_add</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em]">{t('enter.game.wsLobbyEmptySlot')}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 shrink-0">
            <button
              type="button"
              onClick={() => setReady(!myReady)}
              disabled={!connected || !seated}
              className={`px-8 py-3 rounded-xl text-sm font-bold border transition-all ${
                myReady
                  ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-100'
                  : 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25'
              } disabled:opacity-40`}
            >
              {myReady ? t('enter.game.wsLobbyUnready') : t('enter.game.wsLobbyReady')}
            </button>
            {isHost ? (
              <button
                type="button"
                onClick={startGame}
                disabled={!connected || !canStart}
                className="ws-btn-arcade px-10 py-3.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('enter.game.wsLobbyStart')}
              </button>
            ) : (
              <p className="text-xs text-slate-500 max-w-xs text-center">{t('enter.game.wsLobbyWaitHost')}</p>
            )}
          </div>
          {isHost && !canStart && connected ? (
            <p className="text-[10px] text-center text-slate-500">{t('enter.game.wsLobbyStartHint')}</p>
          ) : null}
          {startError ? (
            <p className="text-xs text-center text-amber-300">
              {t(
                {
                  not_host: 'enter.game.wsLobbyStartErrNotHost',
                  not_all_ready: 'enter.game.wsLobbyStartErrNotReady',
                  empty: 'enter.game.wsLobbyStartErrEmpty',
                  no_room: 'enter.game.wsLobbyStartErrNoRoom',
                  gone: 'enter.game.wsLobbyStartErrGone',
                  start_failed: 'enter.game.wsLobbyStartErrGeneric',
                }[startError] || 'enter.game.wsLobbyStartErrGeneric'
              )}
            </p>
          ) : null}
        </div>

        <div className="w-full lg:w-[360px] shrink-0 flex flex-col border border-fuchsia-500/20 rounded-2xl bg-slate-950/40 min-h-[300px] lg:min-h-0 lg:max-h-full">
          <div className="px-3 py-2 border-b border-fuchsia-500/15 text-[10px] font-bold uppercase tracking-widest text-fuchsia-200/80 flex items-center gap-2 bg-fuchsia-500/5">
            <span className="material-symbols-outlined text-base">chat</span>
            {t('enter.game.wsLobbyChatTitle')}
          </div>
          <div className="flex-1 overflow-hidden p-3 space-y-3 min-h-[140px] max-h-[30vh] lg:max-h-none">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-40 gap-2">
                <span className="material-symbols-outlined text-3xl">forum</span>
                <p className="text-[10px] uppercase font-bold tracking-widest">{t('enter.game.wsLobbyChatEmpty')}</p>
              </div>
            ) : (
              chatMessages.map((m, i) => (
                <div key={`${m.ts}-${i}`} className="flex flex-col gap-1 ws-fade-rise">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400/80">{m.name}</span>
                    <span className="text-[8px] text-slate-600 font-mono">{new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-xs rounded-2xl rounded-tl-none px-3 py-2 bg-slate-900/90 border border-fuchsia-500/10 text-slate-200 break-words shadow-sm">
                    {m.text}
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-2 border-t border-fuchsia-500/10 space-y-2">
            <div className="flex flex-wrap gap-1">
              {QUICK_MESSAGES.map((msg) => (
                <button
                  key={msg}
                  type="button"
                  onClick={() => sendChat(msg)}
                  disabled={!connected}
                  className="px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 text-[9px] font-bold text-slate-400 hover:text-white hover:bg-fuchsia-500/20 hover:border-fuchsia-500/30 transition-all disabled:opacity-30"
                >
                  {msg}
                </button>
              ))}
            </div>
            <form onSubmit={sendChatSubmit} className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                maxLength={500}
                placeholder={t('enter.game.wsLobbyChatPlaceholder')}
                className="flex-1 min-w-0 rounded-xl bg-slate-900/90 border border-slate-600/50 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500/50"
              />
              <button
                type="submit"
                disabled={!connected}
                className="shrink-0 px-3 py-2 rounded-xl bg-fuchsia-600/80 text-white text-xs font-bold hover:bg-fuchsia-500 disabled:opacity-40"
              >
                {t('enter.game.wsLobbySend')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}