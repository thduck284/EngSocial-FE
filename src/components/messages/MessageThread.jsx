import { useState, useRef, useEffect } from 'react'

const AVATAR_MAX_SIZE = 5 * 1024 * 1024 // 5MB
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
import { useTranslation } from 'react-i18next'
import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'

const ONE_HOUR_MS = 60 * 60 * 1000
const WEEKDAY_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const WEEKDAY_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatMessageDateBubble(createdAt, language) {
  if (!createdAt) return ''
  const d = new Date(createdAt)
  const day = d.getDay()
  const date = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const labels = language === 'vi' ? WEEKDAY_VI : WEEKDAY_EN
  return `${labels[day]} ${date}/${month}/${year}`
}

function shouldShowTimeDivider(messages, index) {
  if (!messages.length || index < 0) return false
  const curr = messages[index]?.createdAt ? new Date(messages[index].createdAt).getTime() : null
  if (curr == null) return false
  if (index === 0) return true
  const prev = messages[index - 1]?.createdAt ? new Date(messages[index - 1].createdAt).getTime() : null
  if (prev == null) return true
  return curr - prev >= ONE_HOUR_MS
}

function formatActiveAgo(lastActiveDate, t) {
  if (!lastActiveDate) return ''
  const diffMs = Date.now() - new Date(lastActiveDate).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return t('messages.activeNow')
  if (diffMins < 60) return t('messages.activeMinutesAgo', { count: diffMins })
  if (diffHours < 24) return t('messages.activeHoursAgo', { count: diffHours })
  return t('messages.activeDaysAgo', { count: diffDays })
}

/** Cho nhóm khi không ai online: luôn hiển thị "X phút/giờ/ngày trước", không dùng "Đang hoạt động". */
function formatGroupActiveAgo(lastActiveDate, t) {
  if (!lastActiveDate) return ''
  const diffMs = Date.now() - new Date(lastActiveDate).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return t('messages.activeMinutesAgo', { count: 1 })
  if (diffMins < 60) return t('messages.activeMinutesAgo', { count: diffMins })
  if (diffHours < 24) return t('messages.activeHoursAgo', { count: diffHours })
  return t('messages.activeDaysAgo', { count: diffDays })
}

export function MessageThread({
  t: tProp,
  selected,
  messages,
  messagesLoading,
  messagesScrollRef,
  messagesEndRef,
  openMessageMenuId,
  setOpenMessageMenuId,
  openReactionPickerId,
  setOpenReactionPickerId,
  messageMenuRef,
  openImageViewer,
  downloadAttachment,
  handleMessageAction,
  handleReaction,
  openReactionDetailMessageId,
  setOpenReactionDetailMessageId,
  setSelectedReactionEmojiInModal,
  showNewMessageBanner,
  setShowNewMessageBanner,
  reactionNotification,
  setReactionNotification,
  scrollToMessage,
  onViewProfile,
  onSearchMessages,
  onOpenMute,
  onOpenDisappearing,
  onDeleteAll,
  onBlock,
  onUnblock,
  onReport,
  headerActionPanel,
  setHeaderActionPanel,
  panelSearchQuery,
  setPanelSearchQuery,
  panelSearchResults,
  getSettingsUntil,
  getDisappearingDurationSeconds,
  applyConversationSettings,
  hasMoreOlderMessages,
  loadMoreMessagesLoading,
  onLoadMoreOlderMessages,
  composerProps,
  onUploadGroupAvatar,
  onSaveGroupName,
  currentUserId,
}) {
  const { t: tI18n, i18n } = useTranslation()
  const t = tProp ?? tI18n
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [isEditingGroupName, setIsEditingGroupName] = useState(false)
  const [editGroupNameValue, setEditGroupNameValue] = useState('')
  const [, setActiveAgoTick] = useState(0)
  const headerMenuRef = useRef(null)
  const topSentinelRef = useRef(null)
  const avatarInputRef = useRef(null)
  const groupNameInputRef = useRef(null)

  const canEditGroupAvatar = selected?.isGroup && (
    selected?.myRole === 'host' ||
    (selected?.myRole === 'admin' && selected?.groupPermissions?.adminCanEditGroupInfo) ||
    (selected?.myRole === 'user' && selected?.groupPermissions?.userCanEditGroupInfo)
  )
  const handleHeaderAvatarClick = () => {
    if (!canEditGroupAvatar || !onUploadGroupAvatar || avatarUploading) return
    if (avatarInputRef.current) {
      avatarInputRef.current.value = ''
      avatarInputRef.current.click()
    }
  }
  const handleHeaderAvatarFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file || !onUploadGroupAvatar) return
    const type = (file.type || '').toLowerCase()
    if (!AVATAR_TYPES.includes(type)) return
    if (file.size > AVATAR_MAX_SIZE) return
    setAvatarUploading(true)
    Promise.resolve(onUploadGroupAvatar(file)).finally(() => {
      setAvatarUploading(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    })
  }

  const canEditGroupName = selected?.isGroup && (
    selected?.myRole === 'host' ||
    (selected?.myRole === 'admin' && selected?.groupPermissions?.adminCanEditGroupInfo) ||
    (selected?.myRole === 'user' && selected?.groupPermissions?.userCanEditGroupInfo)
  )
  const startEditingGroupName = () => {
    if (!canEditGroupName || !selected?.id) return
    setEditGroupNameValue(selected?.name || '')
    setIsEditingGroupName(true)
    setTimeout(() => groupNameInputRef.current?.focus(), 0)
  }
  const saveGroupName = () => {
    if (!onSaveGroupName || !selected?.id) return
    const trimmed = (editGroupNameValue || '').trim()
    if (trimmed && trimmed !== (selected?.name || '').trim()) {
      Promise.resolve(onSaveGroupName(selected.id, trimmed)).catch(() => {})
    }
    setIsEditingGroupName(false)
  }
  const cancelEditingGroupName = () => {
    setEditGroupNameValue(selected?.name || '')
    setIsEditingGroupName(false)
  }

  useEffect(() => {
    const id = setInterval(() => setActiveAgoTick((n) => n + 1), 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const sentinel = topSentinelRef.current
    const root = messagesScrollRef?.current
    if (!sentinel || !root || !onLoadMoreOlderMessages) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || !hasMoreOlderMessages || loadMoreMessagesLoading) return
        onLoadMoreOlderMessages()
      },
      { root, rootMargin: '100px 0px 0px 0px', threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMoreOlderMessages, loadMoreMessagesLoading, onLoadMoreOlderMessages])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) setHeaderMenuOpen(false)
    }
    if (headerMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [headerMenuOpen])

  const lastReadByThemIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].fromMe && messages[i].read) return i
    }
    return -1
  })()

  // Nhóm: với mỗi tin nhắn, danh sách thành viên có tin này là "đã đọc cuối" (để hiện avatar nhỏ)
  const lastReadByMembersPerMessage = (() => {
    if (!selected?.isGroup || !Array.isArray(messages) || messages.length === 0) return []
    const myId = currentUserId != null ? String(currentUserId) : ''
    const members = selected?.members ?? []
    const lastReadIndexByUser = {}
    for (let i = 0; i < messages.length; i++) {
      const readBy = messages[i].readBy || []
      for (const uid of readBy) {
        const id = String(uid)
        lastReadIndexByUser[id] = i
      }
    }
    return messages.map((_, i) => {
      return members.filter((m) => {
        const uid = String(m.userId)
        if (uid === myId) return false
        return lastReadIndexByUser[uid] === i
      }).map((m) => ({ userId: m.userId, name: m.name, avatar: m.avatar }))
    })
  })()

  const handleOpenReactionDetail = (msg) => {
    if (openReactionDetailMessageId === msg.id) {
      setOpenReactionDetailMessageId(null)
      setSelectedReactionEmojiInModal(null)
    } else {
      setOpenReactionDetailMessageId(msg.id)
      const firstEmoji = (msg.reactions || []).length ? (msg.reactions || [])[0]?.emoji : null
      setSelectedReactionEmojiInModal(firstEmoji || '👍')
    }
  }

  return (
    <>
      <div className="w-full shrink-0 flex flex-col min-w-0">
        <header className="w-full min-w-0 p-4 flex items-center justify-between">
          <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleHeaderAvatarFileChange}
          aria-hidden
        />
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div
              className={`relative w-10 h-10 rounded-full overflow-hidden ${canEditGroupAvatar && !avatarUploading ? 'cursor-pointer hover:ring-2 hover:ring-primary/50 transition-shadow' : ''} ${avatarUploading ? 'opacity-70 pointer-events-none' : ''}`}
              onClick={canEditGroupAvatar && !avatarUploading ? handleHeaderAvatarClick : undefined}
              onKeyDown={canEditGroupAvatar && !avatarUploading ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleHeaderAvatarClick() } } : undefined}
              role={canEditGroupAvatar && !avatarUploading ? 'button' : undefined}
              tabIndex={canEditGroupAvatar && !avatarUploading ? 0 : undefined}
              title={canEditGroupAvatar ? t('messages.chooseGroupAvatar') : undefined}
              aria-label={canEditGroupAvatar ? t('messages.chooseGroupAvatar') : undefined}
            >
              {avatarUploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center z-10">
                  <span className="material-symbols-outlined animate-spin text-xl text-slate-900 dark:text-white">progress_activity</span>
                </div>
              )}
              {selected?.isGroup && !selected?.avatar ? (
                <div className="w-full h-full rounded-full bg-[#4a4a4a] flex items-center justify-center border border-white/10 relative">
                  <span className="material-symbols-outlined text-[22px] text-slate-500 dark:text-gray-400" aria-hidden>group</span>
                  {canEditGroupAvatar && (
                    <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#3a3a3a] border border-background-dark flex items-center justify-center" aria-hidden>
                      <span className="material-symbols-outlined text-slate-900 dark:text-white text-sm">photo_camera</span>
                    </span>
                  )}
                </div>
              ) : (
                <img src={selected?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selected?.name || '')}&background=13b6ec&color=fff`} alt="" className="w-10 h-10 rounded-full object-cover" />
              )}
            </div>
            {!selected?.isGroup && selected?.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background-dark rounded-full" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {selected?.isGroup && canEditGroupName && isEditingGroupName ? (
                <input
                  ref={groupNameInputRef}
                  type="text"
                  value={editGroupNameValue}
                  onChange={(e) => setEditGroupNameValue(e.target.value)}
                  onBlur={saveGroupName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveGroupName()
                    if (e.key === 'Escape') cancelEditingGroupName()
                  }}
                  className="flex-1 min-w-0 font-bold text-base text-slate-900 dark:text-white bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-lg px-2 py-1 leading-none focus:ring-2 focus:ring-primary outline-none"
                  placeholder={t('messages.groupNamePlaceholder')}
                  aria-label={t('messages.editGroupName')}
                />
              ) : selected?.isGroup && canEditGroupName ? (
                <button
                  type="button"
                  onClick={startEditingGroupName}
                  className="flex items-center gap-1.5 text-left group rounded px-1 -mx-1 hover:bg-white/5 cursor-pointer"
                  title={t('messages.editGroupName')}
                >
                  <h3 className="font-bold text-base text-slate-900 dark:text-white leading-none truncate">{selected?.name}</h3>
                  <span className="material-symbols-outlined text-slate-500 dark:text-gray-400 text-sm shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden>edit</span>
                </button>
              ) : (
                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-none truncate">{selected?.name}</h3>
              )}
            </div>
            <span className={`text-xs font-medium ${selected?.online ? 'text-green-500' : 'text-gray-500'}`}>
              {selected?.isGroup ? (
                <>
                  {selected?.online ? t('messages.activeNow') : (selected?.lastActiveDate ? formatGroupActiveAgo(selected.lastActiveDate, t) : t('messages.groupOffline'))}
                  {selected?.memberCount != null && (
                    <>
                      <span className="text-base mx-1 align-middle">·</span>
                      {t('messages.memberCount', { count: selected.memberCount })}
                    </>
                  )}
                </>
              ) : selected?.online ? (
                t('messages.activeNow')
              ) : selected?.lastActiveDate ? (
                formatActiveAgo(selected.lastActiveDate, t)
              ) : (
                ''
              )}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2" ref={headerMenuRef}>
          <button type="button" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-card-dark text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">
            <span className="material-symbols-outlined">call</span>
          </button>
          <button type="button" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-card-dark text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">
            <span className="material-symbols-outlined">videocam</span>
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setHeaderMenuOpen((v) => !v)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-card-dark text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
              aria-expanded={headerMenuOpen}
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>
            {headerMenuOpen && (
              <div className="absolute right-0 top-full mt-1 py-1 min-w-[200px] rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark shadow-xl z-30">
                {!selected?.isGroup && selected?.otherUserId && onViewProfile && (
                  <button type="button" onClick={() => { onViewProfile(); setHeaderMenuOpen(false) }} className="w-full px-4 py-2.5 text-left text-sm text-slate-900 dark:text-white hover:bg-white/10 flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg">person</span>
                    {t('messages.viewProfile')}
                  </button>
                )}
                {onSearchMessages && (
                  <button type="button" onClick={() => { onSearchMessages(); setHeaderMenuOpen(false) }} className="w-full px-4 py-2.5 text-left text-sm text-slate-900 dark:text-white hover:bg-white/10 flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg">search</span>
                    {t('messages.searchInChat')}
                  </button>
                )}
                {onOpenMute && (
                  <button type="button" onClick={() => { onOpenMute(); setHeaderMenuOpen(false) }} className="w-full px-4 py-2.5 text-left text-sm text-slate-900 dark:text-white hover:bg-white/10 flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg">{selected?.muted ? 'notifications' : 'notifications_off'}</span>
                    {t('messages.muteNotifications')}
                  </button>
                )}
                {onOpenDisappearing && (
                  <button type="button" onClick={() => { onOpenDisappearing(); setHeaderMenuOpen(false) }} className="w-full px-4 py-2.5 text-left text-sm text-slate-900 dark:text-white hover:bg-white/10 flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg">timer</span>
                    {t('messages.disappearingMessages')}
                  </button>
                )}
                {onDeleteAll && (
                  <button type="button" onClick={() => { onDeleteAll(); setHeaderMenuOpen(false) }} className="w-full px-4 py-2.5 text-left text-sm text-slate-900 dark:text-white hover:bg-white/10 flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg">delete_sweep</span>
                    {t('messages.deleteAllMessages')}
                  </button>
                )}
                {!selected?.isGroup && onBlock && (
                  <button type="button" onClick={() => { onBlock(); setHeaderMenuOpen(false) }} className="w-full px-4 py-2.5 text-left text-sm text-slate-900 dark:text-white hover:bg-white/10 flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg">block</span>
                    {t('messages.block')}
                  </button>
                )}
                {!selected?.isGroup && onReport && (
                  <button type="button" onClick={() => { onReport(); setHeaderMenuOpen(false) }} className="w-full px-4 py-2.5 text-left text-sm text-slate-900 dark:text-white hover:bg-white/10 flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg">report</span>
                    {t('messages.report')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        </header>
        <div className="w-full border-b border-slate-200 dark:border-border-dark shrink-0" aria-hidden />
      </div>

      {headerActionPanel && (
        <div className="shrink-0 border-b border-slate-200 dark:border-border-dark bg-card-dark/80 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {headerActionPanel === 'search' && t('messages.searchInChat')}
              {headerActionPanel === 'mute' && t('messages.muteNotifications')}
              {headerActionPanel === 'disappearing' && t('messages.disappearingMessages')}
            </span>
            <button type="button" onClick={() => setHeaderActionPanel(null)} className="p-1.5 rounded-full hover:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          {headerActionPanel === 'search' && (
            <div className="space-y-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 text-lg">search</span>
                <input
                  type="text"
                  value={panelSearchQuery}
                  onChange={(e) => setPanelSearchQuery(e.target.value)}
                  placeholder={t('messages.searchInChat')}
                  className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none"
                  autoFocus
                />
              </div>
              {panelSearchQuery.trim() && (
                <div className="max-h-[200px] overflow-y-auto space-y-1">
                  {panelSearchResults.length === 0 ? (
                    <p className="text-slate-400 dark:text-gray-500 text-sm py-2">{t('messages.noSearchResults')}</p>
                  ) : (
                    panelSearchResults.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => { scrollToMessage(r.id); setHeaderActionPanel(null) }}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-background-dark border border-transparent hover:border-border-dark transition-colors"
                      >
                        <p className={`text-sm truncate ${r.fromMe ? 'text-primary' : 'text-gray-200'}`}>{r.preview || '—'}</p>
                        <span className="text-xs text-slate-400 dark:text-gray-500">{r.time}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          {headerActionPanel === 'mute' && (
            <div className="space-y-1">
              {selected?.muted ? (
                <button type="button" onClick={() => { applyConversationSettings({ mutedUntil: null }); setHeaderActionPanel(null) }} className="w-full px-4 py-2.5 rounded-xl text-left text-sm text-slate-900 dark:text-white hover:bg-white/10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">notifications</span>
                  {t('messages.turnNotificationsOn')}
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => { applyConversationSettings({ mutedUntil: getSettingsUntil('1h') }); setHeaderActionPanel(null) }} className="w-full px-4 py-2.5 rounded-xl text-left text-sm text-slate-900 dark:text-white hover:bg-white/10">{t('messages.muteFor1h')}</button>
                  <button type="button" onClick={() => { applyConversationSettings({ mutedUntil: getSettingsUntil('8h') }); setHeaderActionPanel(null) }} className="w-full px-4 py-2.5 rounded-xl text-left text-sm text-slate-900 dark:text-white hover:bg-white/10">{t('messages.muteFor8h')}</button>
                  <button type="button" onClick={() => { applyConversationSettings({ mutedUntil: getSettingsUntil('forever') }); setHeaderActionPanel(null) }} className="w-full px-4 py-2.5 rounded-xl text-left text-sm text-slate-900 dark:text-white hover:bg-white/10">{t('messages.muteUntilTurnOn')}</button>
                </>
              )}
            </div>
          )}
          {headerActionPanel === 'disappearing' && (
            <div className="space-y-1">
              {selected?.disappearing ? (
                <button type="button" onClick={() => { applyConversationSettings({ disappearingUntil: null }); setHeaderActionPanel(null) }} className="w-full px-4 py-2.5 rounded-xl text-left text-sm text-slate-900 dark:text-white hover:bg-white/10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">timer_off</span>
                  {t('messages.disappearingOff')}
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => { applyConversationSettings({ disappearingUntil: getSettingsUntil('1h'), disappearingDurationSeconds: getDisappearingDurationSeconds('1h') }); setHeaderActionPanel(null) }} className="w-full px-4 py-2.5 rounded-xl text-left text-sm text-slate-900 dark:text-white hover:bg-white/10">{t('messages.muteFor1h')}</button>
                  <button type="button" onClick={() => { applyConversationSettings({ disappearingUntil: getSettingsUntil('8h'), disappearingDurationSeconds: getDisappearingDurationSeconds('8h') }); setHeaderActionPanel(null) }} className="w-full px-4 py-2.5 rounded-xl text-left text-sm text-slate-900 dark:text-white hover:bg-white/10">{t('messages.muteFor8h')}</button>
                  <button type="button" onClick={() => { applyConversationSettings({ disappearingUntil: getSettingsUntil('24h'), disappearingDurationSeconds: getDisappearingDurationSeconds('24h') }); setHeaderActionPanel(null) }} className="w-full px-4 py-2.5 rounded-xl text-left text-sm text-slate-900 dark:text-white hover:bg-white/10">{t('messages.muteFor24h')}</button>
                  <button type="button" onClick={() => { applyConversationSettings({ disappearingUntil: getSettingsUntil('forever'), disappearingDurationSeconds: getDisappearingDurationSeconds('forever') }); setHeaderActionPanel(null) }} className="w-full px-4 py-2.5 rounded-xl text-left text-sm text-slate-900 dark:text-white hover:bg-white/10">{t('messages.disappearingUntilTurnOff')}</button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div ref={messagesScrollRef} className="flex-1 overflow-y-auto p-6 space-y-[9px] flex flex-col min-h-0 relative">
        <div ref={topSentinelRef} className="h-0 overflow-hidden" aria-hidden="true" />
        {hasMoreOlderMessages && loadMoreMessagesLoading && (
          <div className="flex justify-center py-2">
            <span className="material-symbols-outlined animate-spin text-xl text-slate-400 dark:text-gray-500">progress_activity</span>
          </div>
        )}
        {messagesLoading ? (
          <div className="flex justify-center py-8">
            <span className="material-symbols-outlined animate-spin text-3xl text-slate-400 dark:text-gray-500">progress_activity</span>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-slate-400 dark:text-gray-500 text-sm text-center py-4">{t('messages.noMessagesYet')}</p>
        ) : (
          messages.map((msg, index) => (
            <div key={msg.id} className="contents">
              {shouldShowTimeDivider(messages, index) && (
                <div className="flex justify-center py-2">
                  <span className="text-xs text-gray-300 bg-white dark:bg-card-dark px-3 py-1.5 rounded-full uppercase tracking-wider font-semibold">
                    {formatMessageDateBubble(msg.createdAt, i18n.language)}
                  </span>
                </div>
              )}
              <MessageBubble
                msg={msg}
                selected={selected}
                index={index}
                messages={messages}
                lastReadByThemIndex={lastReadByThemIndex}
                lastReadByMembers={selected?.isGroup ? (lastReadByMembersPerMessage[index] || []) : undefined}
                openMessageMenuId={openMessageMenuId}
                setOpenMessageMenuId={setOpenMessageMenuId}
                openReactionPickerId={openReactionPickerId}
                setOpenReactionPickerId={setOpenReactionPickerId}
                messageMenuRef={messageMenuRef}
                openImageViewer={openImageViewer}
                downloadAttachment={downloadAttachment}
                handleMessageAction={handleMessageAction}
                handleReaction={handleReaction}
                onOpenReactionDetail={handleOpenReactionDetail}
                t={t}
              />
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {!selected?.isGroup && selected?.iBlockedThem && (
        <div className="shrink-0 border-t border-slate-200 dark:border-border-dark bg-card-dark/90 p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-slate-900 dark:text-white text-center">
            {t('messages.youBlockedUser', { name: selected?.name || 'User' })}
          </p>
          <p className="text-xs text-slate-500 dark:text-gray-400 text-center">
            {t('messages.cannotMessageInThisChat')}
          </p>
          {onUnblock && selected?.otherUserId && (
            <button
              type="button"
              onClick={() => onUnblock(selected.otherUserId)}
              className="w-full py-2.5 rounded-xl bg-white/10 text-slate-900 dark:text-white hover:bg-white/20 text-sm font-medium transition-colors"
            >
              {t('messages.unblock')}
            </button>
          )}
        </div>
      )}

      {(showNewMessageBanner || reactionNotification) && (
        <div className="flex flex-col items-center gap-2 shrink-0 mb-[10px]">
          {showNewMessageBanner && (
            <button
              type="button"
              onClick={() => {
                setShowNewMessageBanner(false)
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity text-center"
            >
              {t('messages.newMessage')}
            </button>
          )}
          {reactionNotification && (
            <button
              type="button"
              onClick={() => {
                setReactionNotification(null)
                scrollToMessage(reactionNotification.messageId)
              }}
              className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity text-center inline-flex items-center gap-1.5"
            >
              <span>{reactionNotification.userName}</span>
              <span>{reactionNotification.emoji}</span>
              <span>{t('messages.reactedToYourMessage')}</span>
            </button>
          )}
        </div>
      )}

      {!selected?.isGroup && selected?.theyBlockedMe && (
        <div className="shrink-0 border-t border-slate-200 dark:border-border-dark bg-primary/20 px-4 py-3 flex items-center justify-center gap-2">
          <span className="text-sm text-slate-900 dark:text-white">{t('messages.cannotReplyToThisConversation')}</span>
          <a href="#" onClick={(e) => e.preventDefault()} className="text-sm text-primary hover:underline shrink-0">
            {t('messages.learnMore')}
          </a>
        </div>
      )}
      {((selected?.isGroup) || (!selected?.iBlockedThem && !selected?.theyBlockedMe)) && <MessageComposer {...composerProps} />}
    </>
  )
}
