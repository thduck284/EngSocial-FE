import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants'

const DEFAULT_EXPANDED = { members: false, settings: false, options: false, privacy: false }
const AVATAR_MAX_SIZE = 5 * 1024 * 1024 // 5MB
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

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

export function ConversationRightSidebar({
  t,
  selected,
  openSettingsMenu,
  setOpenSettingsMenu,
  getSettingsUntil,
  getDisappearingDurationSeconds,
  applyConversationSettings,
  setShowDeleteAllConfirm,
  rightBarSearchQuery = '',
  setRightBarSearchQuery,
  rightBarSearchResults = [],
  rightBarMedia,
  rightBarFiles,
  rightBarLinks,
  rightBarMediaVisible,
  rightBarFilesVisible,
  rightBarLinksVisible,
  loadMoreMedia,
  loadMoreFiles,
  loadMoreLinks,
  setRightBarMediaVisibleCount,
  setRightBarFilesVisibleCount,
  setRightBarLinksVisibleCount,
  openImageViewer,
  scrollToMessage,
  downloadAttachment,
  rightBarSearchInputRef,
  onBlock,
  onBlockUserInChat,
  onReport,
  onOpenGroupSettings,
  onUploadGroupAvatar,
  onSaveGroupName,
  onAddMembers,
  onDisbandGroup,
  onLeaveGroup,
  currentUserId,
  onSetMemberAdmin,
  onMessageUser,
  onKickMember,
}) {
  const [expandedSections, setExpandedSections] = useState(DEFAULT_EXPANDED)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [isEditingGroupName, setIsEditingGroupName] = useState(false)
  const [editGroupNameValue, setEditGroupNameValue] = useState('')
  const [openMemberMenuUserId, setOpenMemberMenuUserId] = useState(null)
  const [memberMenuPosition, setMemberMenuPosition] = useState(null)
  const avatarInputRef = useRef(null)
  const groupNameInputRef = useRef(null)
  const memberMenuRef = useRef(null)
  const memberMenuPortalRef = useRef(null)
  const memberListScrollRef = useRef(null)
  const sidebarScrollRef = useRef(null)
  const toggleSection = (key) => setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))

  const updateMemberMenuPosition = () => {
    const el = memberMenuRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const menuWidth = 180
    setMemberMenuPosition({
      top: rect.bottom + 4,
      left: Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8),
    })
  }

  const isHost = selected?.myRole === 'host'
  const canKickMembers = isHost || (selected?.myRole === 'admin' && selected?.groupPermissions?.adminCanKick)

  const closeMemberMenu = () => setOpenMemberMenuUserId(null)

  const toggleMemberMenu = (userId) => {
    setOpenMemberMenuUserId((prev) => (prev === userId ? null : userId))
  }

  useEffect(() => {
    if (openMemberMenuUserId == null) {
      setMemberMenuPosition(null)
      return
    }
    const t = setTimeout(updateMemberMenuPosition, 0)
    const listEl = memberListScrollRef.current
    const sidebarEl = sidebarScrollRef.current
    if (listEl) listEl.addEventListener('scroll', updateMemberMenuPosition, { passive: true })
    if (sidebarEl) sidebarEl.addEventListener('scroll', updateMemberMenuPosition, { passive: true })
    window.addEventListener('resize', updateMemberMenuPosition)
    return () => {
      clearTimeout(t)
      listEl?.removeEventListener('scroll', updateMemberMenuPosition)
      sidebarEl?.removeEventListener('scroll', updateMemberMenuPosition)
      window.removeEventListener('resize', updateMemberMenuPosition)
    }
  }, [openMemberMenuUserId])

  useEffect(() => {
    if (openMemberMenuUserId == null) return
    const handleClickOutside = (e) => {
      const inTrigger = memberMenuRef.current?.contains(e.target)
      const inMenu = memberMenuPortalRef.current?.contains(e.target)
      if (!inTrigger && !inMenu) closeMemberMenu()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMemberMenuUserId])

  const canEditGroupAvatar = selected?.isGroup && (
    selected?.myRole === 'host' ||
    (selected?.myRole === 'admin' && selected?.groupPermissions?.adminCanEditGroupInfo) ||
    (selected?.myRole === 'user' && selected?.groupPermissions?.userCanEditGroupInfo)
  )
  const handleAvatarClick = () => {
    if (!canEditGroupAvatar) return
    if (onUploadGroupAvatar && avatarInputRef.current) {
      avatarInputRef.current.value = ''
      avatarInputRef.current.click()
    }
  }
  const handleAvatarFileChange = (e) => {
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

  return (
    <aside ref={sidebarScrollRef} className="hidden xl:flex w-[320px] flex-shrink-0 flex-col min-h-0 border-l border-border-dark bg-background-dark overflow-y-auto overflow-x-hidden">
      <div className="p-6 flex flex-col shrink-0">
        <div className="flex flex-col items-center text-center mb-4">
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleAvatarFileChange}
            aria-hidden
          />
          <div className="relative w-24 h-24 shrink-0">
            <div
              className={`w-full h-full rounded-full p-1 border-4 border-primary/20 overflow-hidden relative ${canEditGroupAvatar && !avatarUploading ? 'cursor-pointer hover:border-primary/40 transition-colors' : ''} ${avatarUploading ? 'opacity-70 pointer-events-none' : ''}`}
              onClick={canEditGroupAvatar && !avatarUploading ? handleAvatarClick : undefined}
              onKeyDown={canEditGroupAvatar && !avatarUploading ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAvatarClick() } } : undefined}
              role={canEditGroupAvatar && !avatarUploading ? 'button' : undefined}
              tabIndex={canEditGroupAvatar && !avatarUploading ? 0 : undefined}
              title={canEditGroupAvatar ? t('messages.chooseGroupAvatar') : undefined}
              aria-label={canEditGroupAvatar ? t('messages.chooseGroupAvatar') : undefined}
            >
              {avatarUploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center z-10">
                  <span className="material-symbols-outlined animate-spin text-2xl text-white">progress_activity</span>
                </div>
              )}
              {selected?.isGroup && !selected?.avatar ? (
                <div className="w-full h-full rounded-full bg-[#4a4a4a] flex items-center justify-center border border-white/10 relative">
                  <span className="material-symbols-outlined text-5xl text-gray-400" aria-hidden>group</span>
                  {canEditGroupAvatar && (
                    <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#3a3a3a] border-2 border-background-dark flex items-center justify-center" aria-hidden>
                      <span className="material-symbols-outlined text-white text-lg">photo_camera</span>
                    </span>
                  )}
                </div>
              ) : (
                <img src={selected?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selected?.name || '')}&background=13b6ec&color=fff`} alt="" className="w-full h-full rounded-full object-cover" />
              )}
            </div>
            {!selected?.isGroup && selected?.online && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-background-dark rounded-full z-10" />
            )}
          </div>
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
              className="w-full mt-3 text-lg font-bold text-white bg-card-dark border border-border-dark rounded-xl px-3 py-2 text-center focus:ring-2 focus:ring-primary outline-none"
              placeholder={t('messages.groupNamePlaceholder')}
              aria-label={t('messages.editGroupName')}
            />
          ) : selected?.isGroup && canEditGroupName ? (
            <button
              type="button"
              onClick={startEditingGroupName}
              className="mt-3 w-full flex items-center justify-center gap-2 text-center group rounded-lg py-1 hover:bg-white/5 transition-colors"
              title={t('messages.editGroupName')}
            >
              <h4 className="text-lg font-bold text-white truncate">{selected?.name}</h4>
              <span className="material-symbols-outlined text-gray-400 text-base shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden>edit</span>
            </button>
          ) : (
            <h4 className="text-lg font-bold text-white mt-3">{selected?.name}</h4>
          )}
          {selected?.isGroup && (
            <p className={`text-xs mt-1 ${selected?.online ? 'text-green-500' : 'text-gray-500'}`}>
              {selected?.online ? t('messages.activeNow') : (selected?.lastActiveDate ? formatGroupActiveAgo(selected.lastActiveDate, t) : t('messages.groupOffline'))}
              {selected?.memberCount != null && (
                <>
                  <span className="text-base mx-1 align-middle">·</span>
                  {t('messages.memberCount', { count: selected.memberCount })}
                </>
              )}
            </p>
          )}
        </div>
        <div className="space-y-3">
          {!selected?.isGroup && selected?.otherUserId && (
            <Link to={ROUTES.PROFILE_USER(selected.otherUserId)} className="block w-full py-2.5 px-4 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors text-center">
              {t('messages.viewProfile')}
            </Link>
          )}
        </div>
        <div className="relative mt-5 mb-2">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">search</span>
          <input
            ref={rightBarSearchInputRef}
            type="text"
            value={rightBarSearchQuery}
            onChange={(e) => setRightBarSearchQuery(e.target.value)}
            placeholder={t('messages.searchInChat')}
            className="w-full bg-card-dark border border-border-dark rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        {rightBarSearchQuery.trim() && (
          <div className="mb-4">
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('messages.searchResults')} ({rightBarSearchResults.length})</h5>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {rightBarSearchResults.length === 0 ? (
                <p className="text-gray-500 text-sm py-2">{t('messages.noSearchResults')}</p>
              ) : (
                rightBarSearchResults.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => scrollToMessage(r.id)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-card-dark border border-transparent hover:border-border-dark transition-colors group"
                  >
                    <p className={`text-sm truncate ${r.fromMe ? 'text-primary' : 'text-gray-200'}`}>{r.preview || '—'}</p>
                    <span className="text-xs text-gray-500">{r.time}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      <div className="px-6 space-y-6 pb-6 shrink-0">
        {selected?.isGroup && (
          <div>
            <button type="button" onClick={() => toggleSection('members')} className="w-full flex items-center justify-between text-left mb-2 group">
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-400">{t('messages.membersSection')}</h5>
              <span className={`material-symbols-outlined text-gray-500 text-lg transition-transform ${expandedSections.members ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {expandedSections.members && (
            <>
            {(selected?.myRole === 'host' || (selected?.myRole === 'admin' && selected?.groupPermissions?.adminCanAddMembers)) && onAddMembers && (
              <button
                type="button"
                onClick={onAddMembers}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium mb-2"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                {t('messages.addMember')}
              </button>
            )}
            <div ref={memberListScrollRef} className="space-y-1 max-h-[240px] overflow-y-auto relative">
              {Array.isArray(selected.members) && selected.members.length > 0 ? selected.members.map((m) => {
                const isMe = String(m.userId) === String(currentUserId)
                const showMenu = !isMe && (onSetMemberAdmin || onMessageUser || onKickMember || onBlockMember || onReport)
                const showSetAdmin = isHost && (m.role === 'user' || !m.role) && onSetMemberAdmin
                const showKick = canKickMembers && m.role !== 'host' && onKickMember
                return (
                  <div key={m.userId} className={`flex items-center gap-2 p-3 rounded-xl hover:bg-card-dark transition-colors group relative ${openMemberMenuUserId === m.userId ? 'z-20' : ''}`}>
                    <Link to={ROUTES.PROFILE_USER(m.userId)} className="flex items-center gap-3 min-w-0 flex-1 text-white">
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-card-dark">
                        {m.avatar ? (
                          <img src={m.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-primary bg-primary/20">
                            {(m.name || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-sm font-medium truncate">{m.name || 'User'}{isMe ? ` (${t('messages.you')})` : ''}</p>
                        <p className="text-xs text-gray-500">
                          {m.role === 'host' ? t('messages.roleHost') : m.role === 'admin' ? t('messages.roleAdmin') : t('messages.roleUser')}
                        </p>
                      </div>
                    </Link>
                    {showMenu && (
                      <div className="relative shrink-0" ref={openMemberMenuUserId === m.userId ? memberMenuRef : null}>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); toggleMemberMenu(m.userId) }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                          aria-label={t('messages.options')}
                        >
                          <span className="material-symbols-outlined text-lg">more_vert</span>
                        </button>
                      </div>
                    )}
                  </div>
                )
              }) : (
                <p className="text-sm text-gray-500 py-2 text-center">—</p>
              )}
            </div>
            </>
            )}
          </div>
        )}
        {selected?.isGroup && (selected?.myRole === 'host' || (selected?.myRole === 'admin' && selected?.groupPermissions?.adminCanAssignUserPermissions) || (selected?.myRole === 'user' && selected?.groupPermissions?.userCanEditGroupInfo)) && (
          <div>
            <button type="button" onClick={() => toggleSection('settings')} className="w-full flex items-center justify-between text-left mb-2 group">
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-400">{t('messages.settingsSection')}</h5>
              <span className={`material-symbols-outlined text-gray-500 text-lg transition-transform ${expandedSections.settings ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {expandedSections.settings && (
            <div className="space-y-1">
              <button type="button" onClick={() => onOpenGroupSettings?.()} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-card-dark transition-colors text-white">
                <span className="text-sm font-medium">{t('messages.groupSettings')}</span>
                <span className="material-symbols-outlined text-gray-400">settings</span>
              </button>
            </div>
            )}
          </div>
        )}
        <div>
          <button type="button" onClick={() => toggleSection('options')} className="w-full flex items-center justify-between text-left mb-2 group">
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-400">{t('messages.options')}</h5>
            <span className={`material-symbols-outlined text-gray-500 text-lg transition-transform ${expandedSections.options ? 'rotate-180' : ''}`}>expand_more</span>
          </button>
          {expandedSections.options && (
          <>
          <div className="space-y-1">
            <div className="relative">
              <button type="button" onClick={() => setOpenSettingsMenu((v) => (v === 'mute' ? null : 'mute'))} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-card-dark transition-colors text-white">
                <span className="text-sm font-medium">{t('messages.muteNotifications')}</span>
                <span className={`material-symbols-outlined ${selected?.muted ? 'text-primary' : 'text-gray-400'}`}>{selected?.muted ? 'notifications_off' : 'notifications'}</span>
              </button>
              {openSettingsMenu === 'mute' && (
                <div className="absolute top-full left-0 right-0 mt-0.5 py-1 rounded-xl bg-card-dark border border-border-dark shadow-xl z-20">
                  {selected?.muted ? (
                    <button type="button" onClick={() => applyConversationSettings({ mutedUntil: null })} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">notifications</span>
                      {t('messages.turnNotificationsOn')}
                    </button>
                  ) : (
                    <>
                      <button type="button" onClick={() => applyConversationSettings({ mutedUntil: getSettingsUntil('1h') })} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10">{t('messages.muteFor1h')}</button>
                      <button type="button" onClick={() => applyConversationSettings({ mutedUntil: getSettingsUntil('8h') })} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10">{t('messages.muteFor8h')}</button>
                      <button type="button" onClick={() => applyConversationSettings({ mutedUntil: getSettingsUntil('forever') })} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10">{t('messages.muteUntilTurnOn')}</button>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <button type="button" onClick={() => setOpenSettingsMenu((v) => (v === 'disappearing' ? null : 'disappearing'))} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-card-dark transition-colors text-white">
                <span className="text-sm font-medium">{t('messages.disappearingMessages')}</span>
                <span className={`material-symbols-outlined ${selected?.disappearing ? 'text-primary' : 'text-gray-400'}`}>timer</span>
              </button>
              {openSettingsMenu === 'disappearing' && (
                <div className="absolute top-full left-0 right-0 mt-0.5 py-1 rounded-xl bg-card-dark border border-border-dark shadow-xl z-20">
                  {selected?.disappearing ? (
                    <button type="button" onClick={() => applyConversationSettings({ disappearingUntil: null })} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">timer_off</span>
                      {t('messages.disappearingOff')}
                    </button>
                  ) : (
                    <>
                      <button type="button" onClick={() => applyConversationSettings({ disappearingUntil: getSettingsUntil('1h'), disappearingDurationSeconds: getDisappearingDurationSeconds('1h') })} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10">{t('messages.muteFor1h')}</button>
                      <button type="button" onClick={() => applyConversationSettings({ disappearingUntil: getSettingsUntil('8h'), disappearingDurationSeconds: getDisappearingDurationSeconds('8h') })} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10">{t('messages.muteFor8h')}</button>
                      <button type="button" onClick={() => applyConversationSettings({ disappearingUntil: getSettingsUntil('24h'), disappearingDurationSeconds: getDisappearingDurationSeconds('24h') })} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10">{t('messages.muteFor24h')}</button>
                      <button type="button" onClick={() => applyConversationSettings({ disappearingUntil: getSettingsUntil('forever'), disappearingDurationSeconds: getDisappearingDurationSeconds('forever') })} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10">{t('messages.disappearingUntilTurnOff')}</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1 mt-4">
            <button type="button" onClick={() => setShowDeleteAllConfirm(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-card-dark transition-colors text-white">
              <span className="text-sm font-medium">{t('messages.deleteAllMessages')}</span>
              <span className="material-symbols-outlined text-gray-400">delete_sweep</span>
            </button>
            {selected?.isGroup && selected?.myRole === 'host' && onDisbandGroup && (
              <button type="button" onClick={onDisbandGroup} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-card-dark transition-colors text-red-400 hover:text-red-300">
                <span className="text-sm font-medium">{t('messages.disbandGroup')}</span>
                <span className="material-symbols-outlined text-gray-400">group_off</span>
              </button>
            )}
            {selected?.isGroup && onLeaveGroup && (
              <button type="button" onClick={onLeaveGroup} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-card-dark transition-colors text-amber-400 hover:text-amber-300">
                <span className="text-sm font-medium">{t('messages.leaveGroup')}</span>
                <span className="material-symbols-outlined text-gray-400">logout</span>
              </button>
            )}
          </div>
          </>
          )}
        </div>
        {(onReport || (!selected?.isGroup && onBlock)) && (
          <div>
            <button type="button" onClick={() => toggleSection('privacy')} className="w-full flex items-center justify-between text-left mb-2 group">
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-400">{t('messages.privacySupport')}</h5>
              <span className={`material-symbols-outlined text-gray-500 text-lg transition-transform ${expandedSections.privacy ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {expandedSections.privacy && (
            <div className="space-y-1">
              {!selected?.isGroup && onBlock && (
                <button type="button" onClick={onBlock} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-card-dark transition-colors text-white">
                  <span className="text-sm font-medium">{t('messages.block')}</span>
                  <span className="material-symbols-outlined text-gray-400">block</span>
                </button>
              )}
              {onReport && (
                <button type="button" onClick={onReport} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-card-dark transition-colors text-white">
                  <span className="text-sm font-medium">{t('messages.report')}</span>
                  <span className="material-symbols-outlined text-gray-400">flag</span>
                </button>
              )}
            </div>
            )}
          </div>
        )}
        <div>
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t('messages.mediaSection')}</h5>
          <div className="grid grid-cols-3 gap-2">
            {rightBarMedia.length === 0 ? (
              <p className="col-span-3 text-gray-500 text-sm py-2">—</p>
            ) : (
              rightBarMedia.slice(0, rightBarMediaVisible).map((a, i) =>
                a.type?.startsWith('video/') ? (
                  <a key={`${a.url}-${i}`} href={a.url} target="_blank" rel="noopener noreferrer" className="aspect-square bg-card-dark rounded-lg overflow-hidden border border-border-dark flex items-center justify-center hover:opacity-90">
                    <span className="material-symbols-outlined text-primary">play_circle</span>
                  </a>
                ) : (
                  <div key={`${a.url}-${i}`} className="relative aspect-square bg-card-dark rounded-lg overflow-hidden border border-border-dark group/thumb">
                    <button type="button" onClick={() => openImageViewer(a.url, a.messageId)} className="block w-full h-full">
                      <img src={a.url} alt="" className="w-full h-full object-cover hover:opacity-90" />
                    </button>
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                      <span className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center cursor-pointer shrink-0" title={t('messages.viewOriginalMessage')} onClick={(e) => { e.stopPropagation(); scrollToMessage(a.messageId) }}>
                        <span className="material-symbols-outlined text-white text-sm">visibility</span>
                      </span>
                      <span className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center cursor-pointer shrink-0" title={t('common.download')} onClick={(e) => { e.stopPropagation(); downloadAttachment(a.url, a.name || 'image') }}>
                        <span className="material-symbols-outlined text-white text-sm">download</span>
                      </span>
                    </div>
                  </div>
                )
              )
            )}
            {rightBarMedia.length > rightBarMediaVisible && (
              <button type="button" disabled={loadMoreMedia} onClick={setRightBarMediaVisibleCount} className="col-span-3 py-2 rounded-lg bg-card-dark hover:bg-white/10 text-sm text-primary font-medium disabled:opacity-50 flex items-center justify-center gap-1">
                {loadMoreMedia ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : null}
                {t('messages.viewAll')}
              </button>
            )}
          </div>
        </div>
        <div>
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t('messages.fileSection')}</h5>
          <div className="space-y-1">
            {rightBarFiles.length === 0 ? (
              <p className="text-gray-500 text-sm py-2">—</p>
            ) : (
              rightBarFiles.slice(0, rightBarFilesVisible).map((a, i) => (
                <div key={`${a.url}-${i}`} className="group/file flex items-center gap-2 p-2 rounded-lg hover:bg-card-dark text-sm text-gray-200 min-w-0">
                  <span className="material-symbols-outlined text-primary shrink-0">attach_file</span>
                  <span className="truncate flex-1 min-w-0">{a.name || 'File'}</span>
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover/file:opacity-100 transition-opacity">
                    <span className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center cursor-pointer" title={t('messages.viewOriginalMessage')} onClick={() => scrollToMessage(a.messageId)}>
                      <span className="material-symbols-outlined text-white text-sm">visibility</span>
                    </span>
                    <span className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center cursor-pointer" title={t('common.download')} onClick={() => downloadAttachment(a.url, a.name || 'file')}>
                      <span className="material-symbols-outlined text-white text-sm">download</span>
                    </span>
                  </div>
                </div>
              ))
            )}
            {rightBarFiles.length > rightBarFilesVisible && (
              <button type="button" disabled={loadMoreFiles} onClick={setRightBarFilesVisibleCount} className="w-full py-2 rounded-lg bg-card-dark hover:bg-white/10 text-sm text-primary font-medium disabled:opacity-50 flex items-center justify-center gap-1">
                {loadMoreFiles ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : null}
                {t('messages.viewAll')}
              </button>
            )}
          </div>
        </div>
        <div>
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t('messages.linkSection')}</h5>
          <div className="space-y-1">
            {rightBarLinks.length === 0 ? (
              <p className="text-gray-500 text-sm py-2">—</p>
            ) : (
              rightBarLinks.slice(0, rightBarLinksVisible).map((item, i) => (
                <div key={`${item.url}-${item.messageId}-${i}`} className="group/link flex items-center gap-2 p-2 rounded-lg hover:bg-card-dark text-sm min-w-0">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="truncate flex-1 min-w-0 text-primary hover:underline">
                    {item.url}
                  </a>
                  <span className="w-7 h-7 shrink-0 rounded-full bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover/link:opacity-100 transition-opacity" title={t('messages.viewOriginalMessage')} onClick={() => scrollToMessage(item.messageId)}>
                    <span className="material-symbols-outlined text-white text-sm">visibility</span>
                  </span>
                </div>
              ))
            )}
            {rightBarLinks.length > rightBarLinksVisible && (
              <button type="button" disabled={loadMoreLinks} onClick={setRightBarLinksVisibleCount} className="w-full py-2 rounded-lg bg-card-dark hover:bg-white/10 text-sm text-primary font-medium disabled:opacity-50 flex items-center justify-center gap-1">
                {loadMoreLinks ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : null}
                {t('messages.viewAll')}
              </button>
            )}
          </div>
        </div>
      </div>
      {openMemberMenuUserId && memberMenuPosition && (() => {
        const m = selected?.members?.find((mem) => String(mem.userId) === String(openMemberMenuUserId))
        if (!m || !selected?.id) return null
        const showSetAdmin = isHost && (m.role === 'user' || !m.role) && onSetMemberAdmin
        const showKick = canKickMembers && m.role !== 'host' && onKickMember
        return createPortal(
          <div
            ref={memberMenuPortalRef}
            className="fixed py-1 min-w-[180px] rounded-xl bg-card-dark border border-border-dark shadow-xl z-[9999]"
            style={{ top: memberMenuPosition.top, left: memberMenuPosition.left }}
          >
            {showSetAdmin && (
              <button type="button" onClick={() => { onSetMemberAdmin(selected.id, m.userId); closeMemberMenu() }} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                {t('messages.setAsAdmin')}
              </button>
            )}
            {onMessageUser && (
              <button type="button" onClick={() => { onMessageUser(m.userId); closeMemberMenu() }} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">chat</span>
                {t('messages.messageUser')}
              </button>
            )}
            {onBlockUserInChat && (
              <button type="button" onClick={() => { onBlockUserInChat(m.userId); closeMemberMenu() }} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">block</span>
                {t('messages.block')}
              </button>
            )}
            {onReport && (
              <button type="button" onClick={() => { onReport(m.userId); closeMemberMenu() }} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">flag</span>
                {t('messages.report')}
              </button>
            )}
            {showKick && (
              <button type="button" onClick={() => { onKickMember(selected.id, m.userId); closeMemberMenu() }} className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">person_remove</span>
                {t('messages.kickFromGroup')}
              </button>
            )}
          </div>,
          document.body
        )
      })()}
    </aside>
  )
}
