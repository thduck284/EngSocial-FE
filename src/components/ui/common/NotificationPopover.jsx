import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { notificationsService, groupService } from '../../../services'
import { formatPostTime } from '../../../utils/dateTime'
import { ROUTES } from '../../../constants'
import { showEngSuccessToast } from '../../../utils/showEngToast'

function renderNotificationContent(n, t) {
  if (n.type === 'friend_request') {
    const fromName = n.data?.fromUserName || n.message?.split(' ')[0] || 'Someone'
    return (
      <>
        <span className="font-bold">{fromName}</span>
        {t('notifications.friendRequestSuffix', { defaultValue: ' sent you a friend request.' })}
      </>
    )
  }
  if (n.type === 'friend_request_accepted') {
    const accepterName = n.data?.accepterName || n.message?.split(' ')[0] || 'Someone'
    return (
      <>
        <span className="font-bold">{accepterName}</span>
        {t('notifications.friendRequestAcceptedSuffix', { defaultValue: ' accepted your friend request.' })}
      </>
    )
  }
  if (n.type === 'comment') {
    return (
      <>
        <span className="font-bold">{n.data?.userName || 'Someone'}</span>{' '}
        {t('notifications.commentedPost', { defaultValue: 'commented on your post.' })}
      </>
    )
  }
  if (n.type === 'challenge') {
    return (
      <>
        <span className="font-bold">{n.title}</span> {n.message}
      </>
    )
  }
  if (n.type === 'like' || n.type === 'post_like') {
    return (
      <>
        <span className="font-bold">{n.data?.userName || 'Someone'}</span>{' '}
        {t('notifications.likedPost', { defaultValue: 'liked your post.' })}
      </>
    )
  }
  if (n.type === 'comment_like') {
    return (
      <>
        <span className="font-bold">{n.data?.userName || 'Someone'}</span>{' '}
        {t('notifications.likedComment', { defaultValue: 'reacted to your comment.' })}
      </>
    )
  }
  if (n.type === 'mention' || n.type === 'post_mention') {
    return (
      <>
        <span className="font-bold">{n.data?.userName || 'Someone'}</span>{' '}
        {t('notifications.mentionedYou', { defaultValue: 'mentioned you in a post.' })}
      </>
    )
  }
  if (n.type === 'post_shared') {
    return (
      <>
        <span className="font-bold">{n.data?.userName || 'Someone'}</span>{' '}
        {t('notifications.postShared', { defaultValue: 'shared your post.' })}
      </>
    )
  }
  if (n.type === 'group_invite') {
    return n.message || n.title || t('notifications.groupInviteFallback', { defaultValue: 'You were invited to a group.' })
  }
  return n.message || n.title || null
}

function getNotificationLink(n) {
  if ((n.type === 'friend_request' || n.type === 'friend_request_accepted') && n.fromUserId) {
    return ROUTES.PROFILE_USER(n.fromUserId)
  }
  if (n.type === 'mention' || n.type === 'post_mention' || n.type === 'post_shared') {
    const pid = n.data?.postId || n.relatedId
    if (pid) return `${ROUTES.COMMUNITY}/posts/${pid}`
  }
  if (n.type === 'group_invite') {
    const gid = n.data?.groupId || n.relatedId
    if (gid) return `/community/group/${gid}/about`
  }
  if (n.relatedType === 'post' && n.relatedId) return `${ROUTES.COMMUNITY}/posts/${n.relatedId}`
  return null
}

export function NotificationPopover({ open, onClose, anchorRef, unreadCount, onMarkAllRead, onUnreadChange, onOpenPostModal }) {
  const panelRef = useRef(null)
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [joinedGroupIds, setJoinedGroupIds] = useState(new Set())

  useEffect(() => {
    if (open) {
      setLoading(true)
      
      // Fetch both notifications and member groups
      Promise.all([
        notificationsService.getNotifications({ limit: 20 }),
        groupService.listMine({ limit: 100 })
      ])
        .then(([notifRes, groupsRes]) => {
          const notifData = notifRes?.data
          const list = notifData?.notifications ?? (Array.isArray(notifData) ? notifData : [])
          setNotifications(Array.isArray(list) ? list : [])

          const groupsList = groupsRes?.data?.groups || (Array.isArray(groupsRes?.data) ? groupsRes.data : [])
          const ids = new Set(groupsList.map(g => String(g.id || g._id)))
          setJoinedGroupIds(ids)
        })
        .catch(() => {
          setNotifications([])
          setJoinedGroupIds(new Set())
        })
        .finally(() => setLoading(false))
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose?.()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose, anchorRef])

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead()
      onMarkAllRead?.()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (_) {}
  }

  const handleItemClick = async (n, e) => {
    // Check if it's a post notification that we should open in modal
    const isPostNotif =
      n.type === 'mention' ||
      n.type === 'post_mention' ||
      n.type === 'post_shared' ||
      n.type === 'comment' ||
      n.type === 'like' ||
      n.relatedType === 'post'

    if (isPostNotif && onOpenPostModal) {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }
      const pid = n.data?.postId || n.relatedId
      if (pid) {
        onOpenPostModal(pid)
        onClose?.()
        
        // Mark as read without navigation
        if (n.read === false) {
          try {
            await notificationsService.markAsRead(n.id)
            onUnreadChange?.()
            setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
          } catch (_) {}
        }
        return
      }
    }

    const link = getNotificationLink(n)
    if (n.read === false) {
      try {
        await notificationsService.markAsRead(n.id)
        onUnreadChange?.()
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
      } catch (_) {}
    }
    if (link) onClose?.()
  }

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-3 w-[380px] bg-card-dark border border-border-dark rounded-2xl shadow-2xl overflow-hidden z-[100] notification-popover-enter"
    >
      <div className="p-4 border-b border-border-dark flex items-center justify-between">
        <h3 className="font-bold text-lg text-white">
          {t('notifications.title')}
          {unreadCount > 0 && (
            <span className="ml-2 text-sm font-normal text-primary">({unreadCount})</span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs text-primary font-medium hover:underline"
          >
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>
      <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-6 text-center text-gray-400 text-sm">{t('notifications.loading', { defaultValue: 'Loading...' })}</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">{t('notifications.empty', { defaultValue: 'No notifications.' })}</div>
        ) : (
          notifications.map((n) => {
            const link = getNotificationLink(n)
            const content = (
              <div className="flex gap-3">
                {n.type === 'friend_request' || n.type === 'group_invite' ? (
                  <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">
                      {n.type === 'group_invite' ? 'group_add' : 'person_add'}
                    </span>
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gray-600/50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-gray-400">notifications</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug text-gray-200">{renderNotificationContent(n, t)}</p>
                  
                  {n.type === 'group_invite' && !joinedGroupIds.has(String(n.data?.groupId || n.relatedId)) && (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const gid = n.data?.groupId || n.relatedId
                          if (!gid) return
                          try {
                            await groupService.acceptGroupInvite(gid)
                            showEngSuccessToast(t('groups.header.inviteAcceptedSuccess', { defaultValue: 'Đã tham gia nhóm!' }))
                            setNotifications(prev => prev.filter(item => item.id !== n.id))
                            onUnreadChange?.()
                          } catch (err) {
                            window.alert(err?.message || 'Failed')
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold hover:brightness-110"
                      >
                        {t('groups.header.inviteAccept', { defaultValue: 'Chấp nhận' })}
                      </button>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const gid = n.data?.groupId || n.relatedId
                          if (!gid) return
                          try {
                            await groupService.declineGroupInvite(gid)
                            setNotifications(prev => prev.filter(item => item.id !== n.id))
                            onUnreadChange?.()
                          } catch (err) {
                            window.alert(err?.message || 'Failed')
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-200 text-[11px] font-bold hover:bg-gray-600"
                      >
                        {t('groups.header.inviteDecline', { defaultValue: 'Từ chối' })}
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{formatPostTime(n.createdAt)}</span>
                    {n.read === false && <span className="size-2 bg-primary rounded-full shrink-0" />}
                  </div>
                </div>
              </div>
            )
            const isPostNotif =
              n.type === 'mention' ||
              n.type === 'post_mention' ||
              n.type === 'post_shared' ||
              n.type === 'comment' ||
              n.type === 'like' ||
              n.relatedType === 'post'

            if (isPostNotif && onOpenPostModal) {
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={(e) => handleItemClick(n, e)}
                  className={`w-full text-left p-4 transition-colors border-b border-border-dark last:border-b-0 ${
                    n.read === false ? 'bg-primary/5 border-l-4 border-l-primary hover:bg-gray-800/50' : 'hover:bg-gray-800/50'
                  }`}
                >
                  {content}
                </button>
              )
            }

            return link ? (
              <Link
                key={n.id}
                to={link}
                onClick={(e) => handleItemClick(n, e)}
                className={`block w-full text-left p-4 transition-colors border-b border-border-dark last:border-b-0 ${
                  n.read === false ? 'bg-primary/5 border-l-4 border-l-primary hover:bg-gray-800/50' : 'hover:bg-gray-800/50'
                }`}
              >
                {content}
              </Link>
            ) : (
              <button
                key={n.id}
                type="button"
                onClick={(e) => handleItemClick(n, e)}
                className={`w-full text-left p-4 transition-colors border-b border-border-dark last:border-b-0 ${
                  n.read === false ? 'bg-primary/5 border-l-4 border-l-primary hover:bg-gray-800/50' : 'hover:bg-gray-800/50'
                }`}
              >
                {content}
              </button>
            )
          })
        )}
      </div>
      <div className="p-3 text-center border-t border-border-dark">
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-sm font-semibold text-primary hover:brightness-110 transition-colors"
        >
          {t('notifications.viewAll')}
        </Link>
      </div>
    </div>
  )
}
