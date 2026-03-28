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
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-visible">
      <div
        className="h-40 w-full relative"
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
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-indigo-600 to-purple-700" />
        )}
        <div className="absolute inset-0 opacity-10 pattern-dots" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-flex items-center px-3 py-1 bg-black/25 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider mb-2">
            <span>
              {activeGroup?.type === 'private'
                ? t('groups.header.private')
                : activeGroup?.type === 'invite_only'
                  ? t('groups.header.hidden')
                  : t('groups.header.public')}
            </span>
            {activeGroup && (
              <>
                <span className="mx-1 text-[9px] text-slate-200">·</span>
                <span className="text-[9px] font-semibold text-slate-200 normal-case">
                  {(activeGroup.memberCount ?? 0)} {t('groups.header.members')}
                </span>
              </>
            )}
          </span>
          <h1 className="text-white text-lg md:text-xl font-extrabold leading-tight">
            {activeGroup?.name || t('groups.header.placeholder')}
          </h1>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {visibleMembers.map((m) => (
              <div
                key={m.id}
                className="size-8 rounded-full border-2 border-slate-900 bg-slate-700 overflow-hidden cursor-pointer flex items-center justify-center shrink-0"
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
                className="size-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-200 min-w-8 px-0.5 hover:bg-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                title={t('groups.header.viewAllMembers', { defaultValue: 'Xem tất cả thành viên' })}
              >
                +{remainingOverAvatars}
              </button>
            )}
          </div>
          <div className="text-xs text-slate-300 space-y-0.5">
            {loadingActive ? (
              <p className="text-slate-500">{t('groups.header.loading')}</p>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2 relative z-30">
          {/* Mời — chỉ khi đã là thành viên */}
          {isMemberOfActiveGroup ? (
            <button
              type="button"
              onClick={onOpenInvite}
              className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold flex items-center gap-2 text-white shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              {t('groups.header.invite')}
            </button>
          ) : null}
          {/* Chia sẻ */}
          <button className="px-4 py-2 rounded-full bg-slate-100/10 hover:bg-slate-100/20 text-sm font-semibold flex items-center gap-2 text-slate-100 border border-slate-700">
            <span className="material-symbols-outlined text-sm">share</span>
            {t('groups.header.share')}
          </button>
          {/* Đã tham gia / Tham gia nhóm — theo GET /groups/me */}
          {loadingMembership && activeGroup && !blockingJoinSlot ? (
            <div
              className="h-9 min-w-[7.5rem] rounded-full bg-slate-800 border border-slate-700 animate-pulse"
              aria-hidden
            />
          ) : blockingJoinSlot ? null : isMemberOfActiveGroup ? (
            <div className="relative" ref={joinedMenuRef}>
              <button
                type="button"
                onClick={() => setJoinedMenuOpen((v) => !v)}
                className="px-4 py-2 rounded-full bg-slate-100/5 hover:bg-slate-100/15 text-sm font-semibold flex items-center gap-1.5 text-slate-100 border border-slate-700"
              >
                <span className="material-symbols-outlined text-sm">groups</span>
                <span>{t('groups.header.joined')}</span>
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>
              {joinedMenuOpen && activeGroup && (
                <div className="absolute right-0 top-full mt-1 w-40 rounded-xl bg-slate-900 border border-slate-800 shadow-lg text-xs text-slate-100 z-50">
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-t-xl rounded-b-xl"
                    onClick={() => {
                      setJoinedMenuOpen(false)
                      setLeaveModalOpen(true)
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px] text-rose-300">
                      logout
                    </span>
                    <span>{t('groups.header.leave')}</span>
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
              className="px-4 py-2 rounded-full bg-primary hover:opacity-90 text-sm font-semibold flex items-center gap-1.5 text-white border border-primary/40 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">group_add</span>
              <span>{joinBusy ? t('groups.header.joining') : t('groups.header.joinGroup')}</span>
            </button>
          ) : null}
        </div>
      </div>
      {pendingInvite && activeGroup && (onAcceptGroupInvite || onDeclineGroupInvite) ? (
        <div className="px-4 py-3 bg-amber-950/35 border-t border-amber-900/40 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-amber-100/95 pr-2">
            {t('groups.header.pendingInviteBanner', {
              defaultValue: 'Bạn được mời tham gia nhóm này. Chấp nhận để trở thành thành viên.',
            })}
          </p>
          <div className="flex items-center gap-2 shrink-0">
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
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700 disabled:opacity-50"
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
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white border border-emerald-500/50 hover:bg-emerald-500 disabled:opacity-50"
            >
              {t('groups.header.inviteAccept', { defaultValue: 'Chấp nhận' })}
            </button>
          </div>
        </div>
      ) : null}
      {pendingSelfJoin && !pendingInvite && activeGroup && onWithdrawPendingJoinRequest ? (
        <div className="px-4 py-3 bg-slate-800/80 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-200 pr-2">
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
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 text-slate-100 border border-slate-600 hover:bg-slate-600 disabled:opacity-50 shrink-0"
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
      />
      {/* Tabs dưới avatar giống Facebook: Giới thiệu, Bài viết, Mọi người, File phương tiện, File, Search icon */}
      <div className="px-4 pb-2 border-t border-slate-800">
        <div className="flex items-center gap-10 overflow-x-auto custom-scrollbar mt-4">
          <button
            type="button"
            onClick={() => onTabChange?.('about')}
            className={`pb-2 text-sm ${
              activeTab === 'about'
                ? 'font-semibold text-white border-b-2 border-emerald-500'
                : 'font-medium text-slate-300 hover:text-white hover:border-b-2 hover:border-slate-500'
            }`}
          >
            {t('groups.header.tabAbout', { defaultValue: 'Giới thiệu' })}
          </button>
          <button
            type="button"
            onClick={() => onTabChange?.('posts')}
            className={`pb-2 text-sm ${
              activeTab === 'posts'
                ? 'font-semibold text-white border-b-2 border-emerald-500'
                : 'font-medium text-slate-300 hover:text-white hover:border-b-2 hover:border-slate-500'
            }`}
          >
            {t('groups.header.tabDiscussion', { defaultValue: 'Bài viết' })}
          </button>
          <button
            type="button"
            onClick={() => onTabChange?.('people')}
            className={`pb-2 text-sm ${
              activeTab === 'people'
                ? 'font-semibold text-white border-b-2 border-emerald-500'
                : 'font-medium text-slate-300 hover:text-white hover:border-b-2 hover:border-slate-500'
            }`}
          >
            {t('groups.header.tabPeople', { defaultValue: 'Mọi người' })}
          </button>
          <button
            type="button"
            onClick={() => onTabChange?.('media')}
            className={`pb-2 text-sm ${
              activeTab === 'media'
                ? 'font-semibold text-white border-b-2 border-emerald-500'
                : 'font-medium text-slate-300 hover:text-white hover:border-b-2 hover:border-slate-500'
            }`}
          >
            {t('groups.header.tabMedia', { defaultValue: 'File phương tiện' })}
          </button>
          <button
            type="button"
            onClick={() => onTabChange?.('files')}
            className={`pb-2 text-sm ${
              activeTab === 'files'
                ? 'font-semibold text-white border-b-2 border-emerald-500'
                : 'font-medium text-slate-300 hover:text-white hover:border-b-2 hover:border-slate-500'
            }`}
          >
            {t('groups.header.tabFiles', { defaultValue: 'File' })}
          </button>

          <div className="ml-auto flex items-center mb-2">
            <button
              type="button"
              className="w-20 h-15 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              <span className="material-symbols-outlined text-lg">search</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
