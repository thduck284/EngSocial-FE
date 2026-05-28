import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LeaveGroupConfirmModal } from '../messages/LeaveGroupConfirmModal'
import { useAuth } from '../../context/AuthContext'
import { DEFAULT_AVATAR } from '../../constants/ui'

export function CommunityHeader({
  activeGroup,
  activeMembers,
  loadingActive,
  loadingMembership = false,
  isMemberOfActiveGroup = false,
  onOpenInvite,
  onOpenGroupMembersModal,
  onLeaveGroup,
  onJoinGroup,
  activeTab,
  onTabChange,
  onSearch,
  myGroupMembership = null,
  onAcceptGroupInvite,
  onDeclineGroupInvite,
  onWithdrawPendingJoinRequest,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const myId = user?.id ?? user?._id
  const [joinedMenuOpen, setJoinedMenuOpen] = useState(false)
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [joinBusy, setJoinBusy] = useState(false)
  const [inviteActionBusy, setInviteActionBusy] = useState(false)
  const [withdrawJoinBusy, setWithdrawJoinBusy] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [groupSearchValue, setGroupSearchValue] = useState('')
  const joinedMenuRef = useRef(null)
  const totalMembers = activeGroup?.memberCount ?? activeMembers.length ?? 0
  const maxAvatars = 8
  const membersForAvatars =
    myId != null && myId !== ''
      ? activeMembers.filter((m) => String(m.id) !== String(myId))
      : activeMembers
  const visibleMembers = membersForAvatars.slice(0, maxAvatars)
  const imInFetchedMembers =
    myId != null &&
    myId !== '' &&
    activeMembers.some((m) => String(m.id) === String(myId))
  const othersTotal =
    imInFetchedMembers || isMemberOfActiveGroup
      ? Math.max(0, totalMembers - 1)
      : totalMembers
  const remainingOverAvatars =
    othersTotal > maxAvatars ? Math.max(0, othersTotal - maxAvatars) : 0

  const pendingInvite =
    myGroupMembership?.status === 'pending' && Boolean(myGroupMembership?.invitedBy)
  const pendingSelfJoin =
    myGroupMembership?.status === 'pending' && !myGroupMembership?.invitedBy
  const blockingJoinSlot = pendingInvite || pendingSelfJoin

  useEffect(() => {
    if (!joinedMenuOpen) return
    const onDoc = (e) => {
      const root = joinedMenuRef.current
      if (root && !root.contains(e.target)) {
        setJoinedMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [joinedMenuOpen])

  return (
    <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden shadow-sm">
      <div
        className="h-48 w-full relative"
        style={
          activeGroup?.icon
            ? {
                backgroundImage: `url(${activeGroup.icon})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {!activeGroup?.icon && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-indigo-500 to-purple-600" />
        )}
        <div className="absolute inset-0 opacity-10 pattern-dots" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-widest mb-3 border border-white/20">
            <span>
              {activeGroup?.type === 'private'
                ? t('groups.header.private')
                : activeGroup?.type === 'invite_only'
                  ? t('groups.header.hidden')
                  : t('groups.header.public')}
            </span>
            {activeGroup && (
              <>
                <span className="mx-2 text-white/50">·</span>
                <span className="text-[10px] font-black">
                  {(activeGroup.memberCount ?? 0)} {t('groups.header.members')}
                </span>
              </>
            )}
          </span>
          <h1 className="text-white text-2xl md:text-3xl font-black leading-tight drop-shadow-md">
            {activeGroup?.name || t('groups.header.placeholder')}
          </h1>
        </div>
      </div>
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {visibleMembers.map((m) => (
              <div
                key={m.id}
                className="size-10 rounded-full border-2 border-white dark:border-card-dark bg-slate-200 overflow-hidden cursor-pointer flex items-center justify-center shrink-0 shadow-sm hover:z-10 transition-all hover:scale-110"
                onClick={() => navigate(`/profile/${m.id}`)}
                title={m.name || ''}
              >
                <img
                  src={m.avatar || DEFAULT_AVATAR}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {remainingOverAvatars > 0 && (
              <button
                type="button"
                onClick={() => onOpenGroupMembersModal?.()}
                className="size-10 rounded-full border-2 border-white dark:border-card-dark bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-200 min-w-10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer shadow-sm"
                title={t('groups.header.viewAllMembers')}
              >
                +{remainingOverAvatars}
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 relative z-30">
          {/* Mời — chỉ khi đã là thành viên */}
          {isMemberOfActiveGroup ? (
            <button
              type="button"
              onClick={onOpenInvite}
              className="h-9 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-black flex items-center gap-2 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              {t('groups.header.invite')}
            </button>
          ) : null}
          {/* Chia sẻ */}
          <button className="h-9 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-black flex items-center gap-2 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[18px]">share</span>
            {t('groups.header.share')}
          </button>
          {/* Đã tham gia / Tham gia nhóm — theo GET /groups/me */}
          {loadingMembership && activeGroup && !blockingJoinSlot ? (
            <div
              className="h-9 min-w-[7rem] rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 animate-pulse"
              aria-hidden
            />
          ) : blockingJoinSlot ? null : isMemberOfActiveGroup ? (
            <div className="relative" ref={joinedMenuRef}>
              <button
                type="button"
                onClick={() => setJoinedMenuOpen((v) => !v)}
                className="h-9 px-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-black flex items-center gap-2 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{t('groups.header.joined')}</span>
                <span className="material-symbols-outlined text-lg">expand_more</span>
              </button>
              {joinedMenuOpen && activeGroup && (
                <div className="absolute right-0 top-full mt-2 w-full min-w-[120px] rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark shadow-2xl p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    type="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black rounded-xl transition-all"
                    onClick={() => {
                      setJoinedMenuOpen(false)
                      setLeaveModalOpen(true)
                    }}
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    <span className="text-[10px] uppercase tracking-widest">{t('groups.header.leave')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : activeGroup && onJoinGroup ? (
            <button
              type="button"
              disabled={joinBusy}
              onClick={async () => {
                const gid = activeGroup.id || activeGroup._id
                if (!gid) return
                setJoinBusy(true)
                try {
                  await onJoinGroup(gid)
                } catch (err) {
                  const msg =
                    (typeof err?.message === 'string' && err.message) ||
                    t('groups.header.joinFailed')
                  window.alert(msg)
                } finally {
                  setJoinBusy(false)
                }
              }}
              className="h-9 px-3 rounded-xl bg-primary hover:brightness-110 text-xs font-black flex items-center gap-2 text-white shadow-lg shadow-primary/25 transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">group_add</span>
              <span>{joinBusy ? t('groups.header.joining') : t('groups.header.joinGroup')}</span>
            </button>
          ) : null}
        </div>
      </div>
      {pendingInvite && activeGroup && (onAcceptGroupInvite || onDeclineGroupInvite) ? (
        <div className="px-6 py-4 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-200 dark:border-amber-900/40 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
            {t('groups.header.pendingInviteBanner', {
              defaultValue: 'Bạn được mời tham gia nhóm này. Chấp nhận để trở thành thành viên.',
            })}
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              disabled={inviteActionBusy}
              onClick={async () => {
                const gid = activeGroup.id || activeGroup._id
                if (!gid || !onDeclineGroupInvite) return
                setInviteActionBusy(true)
                try {
                  await onDeclineGroupInvite(gid)
                } catch (err) {
                  const msg =
                    (typeof err?.message === 'string' && err.message) ||
                    t('groups.header.inviteDeclineFailed', { defaultValue: 'Không thể từ chối.' })
                  window.alert(msg)
                } finally {
                  setInviteActionBusy(false)
                }
              }}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all disabled:opacity-50 shadow-sm"
            >
              {t('groups.header.inviteDecline', { defaultValue: 'Từ chối' })}
            </button>
            <button
              type="button"
              disabled={inviteActionBusy}
              onClick={async () => {
                const gid = activeGroup.id || activeGroup._id
                if (!gid || !onAcceptGroupInvite) return
                setInviteActionBusy(true)
                try {
                  await onAcceptGroupInvite(gid)
                } catch (err) {
                  const msg =
                    (typeof err?.message === 'string' && err.message) ||
                    t('groups.header.inviteAcceptFailed', { defaultValue: 'Không thể chấp nhận.' })
                  window.alert(msg)
                } finally {
                  setInviteActionBusy(false)
                }
              }}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-500 transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20"
            >
              {t('groups.header.inviteAccept', { defaultValue: 'Chấp nhận' })}
            </button>
          </div>
        </div>
      ) : null}
      {pendingSelfJoin && !pendingInvite && activeGroup && onWithdrawPendingJoinRequest ? (
        <div className="px-6 py-4 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-600 dark:text-gray-400 font-medium">
            {t('groups.header.pendingSelfJoinBanner', {
              defaultValue:
                'Bạn đã gửi yêu cầu tham gia. Chủ nhóm hoặc quản trị viên sẽ duyệt — bạn chưa là thành viên cho đến khi được chấp nhận.',
            })}
          </p>
          <button
            type="button"
            disabled={withdrawJoinBusy}
            onClick={async () => {
              const gid = activeGroup.id || activeGroup._id
              if (!gid) return
              setWithdrawJoinBusy(true)
              try {
                await onWithdrawPendingJoinRequest(gid)
              } catch (err) {
                const msg =
                  (typeof err?.message === 'string' && err.message) ||
                  t('groups.header.withdrawJoinFailed', { defaultValue: 'Không thể thu hồi yêu cầu.' })
                window.alert(msg)
              } finally {
                setWithdrawJoinBusy(false)
              }
            }}
            className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-white dark:bg-white/5 text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all disabled:opacity-50 shadow-sm"
          >
            {withdrawJoinBusy
              ? t('common.loading', { defaultValue: '...' })
              : t('groups.header.withdrawJoinRequest', { defaultValue: 'Thu hồi yêu cầu' })}
          </button>
        </div>
      ) : null}
      <LeaveGroupConfirmModal
        t={t}
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        messageKey="groups.header.leaveConfirm"
        confirmKey="groups.header.leave"
        onConfirm={async () => {
          const gid = activeGroup?.id || activeGroup?._id
          if (!gid || !onLeaveGroup) return
          try {
            await onLeaveGroup(gid)
          } catch (err) {
            const msg =
              (typeof err?.message === 'string' && err.message) ||
              t('groups.header.leaveFailed')
            window.alert(msg)
            throw err
          }
        }}
      />      <div className="px-6 border-t border-slate-100 dark:border-border-dark">
        <div className="flex items-center w-full overflow-x-auto custom-scrollbar no-scrollbar py-1">
          <button
            type="button"
            onClick={() => onTabChange?.('about')}
            className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative group ${
              activeTab === 'about'
                ? 'text-primary'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('groups.header.tabAbout', { defaultValue: 'Giới thiệu' })}
            {activeTab === 'about' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onTabChange?.('posts')}
            className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative group ${
              activeTab === 'posts'
                ? 'text-primary'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('groups.header.tabDiscussion', { defaultValue: 'Bài viết' })}
            {activeTab === 'posts' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onTabChange?.('people')}
            className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative group ${
              activeTab === 'people'
                ? 'text-primary'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('groups.header.tabPeople', { defaultValue: 'Mọi người' })}
            {activeTab === 'people' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onTabChange?.('media')}
            className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative group ${
              activeTab === 'media'
                ? 'text-primary'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('groups.header.tabMedia', { defaultValue: 'File phương tiện' })}
            {activeTab === 'media' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onTabChange?.('files')}
            className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative group ${
              activeTab === 'files'
                ? 'text-primary'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('groups.header.tabFiles', { defaultValue: 'File' })}
            {activeTab === 'files' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
            )}
          </button>
          <div className="flex items-center ml-2 relative">
            {isSearchOpen ? (
              <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 animate-in fade-in slide-in-from-right-4 duration-300">
                <input
                  autoFocus
                  type="text"
                  value={groupSearchValue}
                  onChange={(e) => setGroupSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      onSearch?.(groupSearchValue)
                    }
                  }}
                  placeholder={t('groups.sidebar.searchPlaceholder')}
                  className="bg-transparent border-none outline-none px-3 py-1.5 text-xs text-slate-900 dark:text-white w-40 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false)
                    setGroupSearchValue('')
                    onSearch?.('')
                  }}
                  className="pr-2 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="size-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">search</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
