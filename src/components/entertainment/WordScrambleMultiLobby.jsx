import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants'
import { DEFAULT_AVATAR } from '../../constants/ui'

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
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
    <div className="flex flex-col flex-1 min-h-0 gap-4 py-3 px-1 sm:px-2 ws-fade-rise overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button type="button" onClick={handleBack} className="ws-link-back px-1">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          {t('enter.game.backPickPlayers')}
        </button>
        <div className="flex-1 min-w-[12rem] flex flex-wrap items-center justify-end gap-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-fuchsia-300/80 px-2 py-1 rounded-lg border border-fuchsia-500/30 bg-fuchsia-950/40">
            {t('enter.game.wsLobbyGameMode')}: {t('enter.game.modeMultiTitle')}
            {capacity ? ` · ${capacity}P` : ''}
          </span>
          {roomCode ? (
            <span className="text-[10px] sm:text-xs font-mono text-cyan-200/90 px-2 py-1 rounded-lg border border-cyan-500/25 bg-slate-950/60">
              {roomCode}
            </span>
          ) : null}
          <button
            type="button"
            onClick={copyInvite}
            disabled={!inviteUrl}
            className="text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg border border-violet-400/40 bg-violet-500/15 text-violet-100 hover:bg-violet-500/25 disabled:opacity-40"
          >
            {inviteCopied ? t('enter.game.wsLobbyInviteCopied') : t('enter.game.wsLobbyInvite')}
          </button>
        </div>
      </div>

      {!connected && (
        <p className="text-center text-sm text-slate-400 flex items-center justify-center gap-2 shrink-0">
          <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
          {t('enter.game.wsLobbyConnecting')}
        </p>
      )}

      <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-4 overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto lg:overflow-hidden">
          <h2 className="ws-font-display ws-hero-gradient text-xl sm:text-2xl font-bold text-center shrink-0">
            {t('enter.game.multiLobbyTitle')}
          </h2>
          <p className="text-xs text-slate-400 text-center max-w-xl mx-auto shrink-0">{t('enter.game.multiLobbySubtitle')}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 flex-1 content-start">
            {slotArray.map((slot, idx) => {
              const isSlotHost = slot && String(hostId) === String(slot.userId)
              return (
                <div
                  key={`slot-${idx}-${slot?.userId ?? 'empty'}`}
                  className={`rounded-2xl border p-3 flex flex-col items-center text-center gap-2 min-h-[140px] justify-center transition-all ${
                    slot
                      ? 'border-fuchsia-500/35 bg-slate-950/50 shadow-[0_0_24px_-8px_rgba(217,70,239,0.35)]'
                      : 'border-dashed border-slate-600/50 bg-slate-950/20'
                  }`}
                >
                  {slot ? (
                    <>
                      <div className="relative">
                        <img
                          src={avatarFor(slot)}
                          alt=""
                          className="size-14 rounded-full object-cover border-2 border-fuchsia-500/40"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_AVATAR
                          }}
                        />
                        {isSlotHost ? (
                          <span
                            className="absolute -top-1 -right-1 size-6 rounded-full bg-amber-500 text-[10px] flex items-center justify-center border border-slate-900"
                            title={t('enter.game.wsLobbyHost')}
                          >
                            ★
                          </span>
                        ) : null}
                        {slot.ready ? (
                          <span className="absolute -bottom-1 -right-1 size-6 rounded-full bg-emerald-500 flex items-center justify-center border border-slate-900">
                            <span className="material-symbols-outlined text-white text-sm">check</span>
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs font-semibold text-white line-clamp-2 w-full px-1">{slot.name}</p>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <span className="material-symbols-outlined text-4xl opacity-40">person_add</span>
                      <span className="text-[10px] uppercase tracking-wider">{t('enter.game.wsLobbyEmptySlot')}</span>
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

        <div className="w-full lg:w-[min(100%,320px)] shrink-0 flex flex-col border border-fuchsia-500/20 rounded-2xl bg-slate-950/40 min-h-[200px] lg:min-h-0 lg:max-h-full">
          <div className="px-3 py-2 border-b border-fuchsia-500/15 text-xs font-bold uppercase tracking-wider text-fuchsia-200/80 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">chat</span>
            {t('enter.game.wsLobbyChatTitle')}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px] max-h-[40vh] lg:max-h-none lg:flex-1">
            {chatMessages.map((m, i) => (
              <div key={`${m.ts}-${i}`} className="text-xs rounded-lg px-2 py-1.5 bg-slate-900/80 border border-slate-700/50">
                <span className="font-bold text-cyan-300/90">{m.name}</span>
                <span className="text-slate-500 mx-1">·</span>
                <span className="text-slate-200 break-words">{m.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendChatSubmit} className="p-2 border-t border-fuchsia-500/15 flex gap-2">
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
  )
}
