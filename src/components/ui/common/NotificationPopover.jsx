import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { notificationsService } from '../../../services'
import { formatPostTime } from '../../../utils/dateTime'
import { ROUTES } from '../../../constants'

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
  if (n.type === 'like') {
    return (
      <>
        <span className="font-bold">{n.data?.userName || 'Someone'}</span>{' '}
        {t('notifications.likedPost', { defaultValue: 'liked your post.' })}
      </>
    )
  }
  return n.message || n.title || null
}

function getNotificationLink(n) {
  if ((n.type === 'friend_request' || n.type === 'friend_request_accepted') && n.fromUserId) {
    return ROUTES.PROFILE_USER(n.fromUserId)
  }
  if (n.relatedType === 'post' && n.relatedId) return `${ROUTES.COMMUNITY}/posts/${n.relatedId}`
  return null
}

export function NotificationPopover({ open, onClose, anchorRef, unreadCount, onMarkAllRead, onUnreadChange }) {
  const panelRef = useRef(null)
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setLoading(true)
      notificationsService
        .getNotifications({ limit: 20 })
        .then((res) => {
          const data = res?.data
          const list = data?.notifications ?? (Array.isArray(data) ? data : [])
          setNotifications(Array.isArray(list) ? list : [])
        })
        .catch(() => setNotifications([]))
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

  const handleItemClick = async (n) => {
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
                {n.type === 'friend_request' ? (
                  <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">person_add</span>
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gray-600/50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-gray-400">notifications</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug text-gray-200">{renderNotificationContent(n, t)}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{formatPostTime(n.createdAt)}</span>
                    {n.read === false && <span className="size-2 bg-primary rounded-full shrink-0" />}
                  </div>
                </div>
              </div>
            )
            return link ? (
              <Link
                key={n.id}
                to={link}
                onClick={() => handleItemClick(n)}
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
                onClick={() => handleItemClick(n)}
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
