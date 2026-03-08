import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { rawService } from '../../services'

// Helper to render notification content based on type
const renderNotificationContent = (n) => {
  if (n.type === 'comment') {
    return <><span className="font-bold">{n.userName}</span> vừa bình luận vào bài viết của bạn.</>
  }
  if (n.type === 'challenge') {
    return <><span className="font-bold">{n.title}</span> {n.message}</>
  }
  if (n.type === 'goal') {
    return <>{n.message}</>
  }
  if (n.type === 'follow') {
    return <><span className="font-bold">{n.userName}</span> đã bắt đầu theo dõi bạn.</>
  }
  return null
}

export function NotificationPopover({ open, onClose, anchorRef }) {
  const panelRef = useRef(null)
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (open) {
      rawService.getNotifications()
        .then((res) => setNotifications(Array.isArray(res?.data) ? res.data : []))
        .catch(() => setNotifications([]))
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

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-3 w-[380px] bg-card-dark border border-border-dark rounded-2xl shadow-2xl overflow-hidden z-[100] notification-popover-enter"
    >
      <div className="p-4 border-b border-border-dark flex items-center justify-between">
        <h3 className="font-bold text-lg text-white">{t('notifications.title')}</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-primary font-medium hover:underline"
        >
          {t('notifications.markAllRead')}
        </button>
      </div>
      <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
        {notifications.map((n) => (
          <button
            key={n.id}
            type="button"
            className={`w-full text-left p-4 transition-colors cursor-pointer group border-b border-border-dark last:border-b-0 ${
              n.unread
                ? 'bg-primary/5 border-l-4 border-l-primary hover:bg-gray-800/50'
                : 'hover:bg-gray-800/50'
            }`}
          >
            <div className="flex gap-3">
              {n.avatar ? (
                <img
                  alt=""
                  className="w-11 h-11 rounded-full object-cover shrink-0"
                  src={n.avatar}
                />
              ) : (
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${n.iconBg}`}>
                  <span className={`material-symbols-outlined ${n.iconColor}`}>{n.icon}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug text-gray-200">{renderNotificationContent(n)}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{n.time}</span>
                  {n.unread && <span className="size-2 bg-primary rounded-full shrink-0" />}
                </div>
              </div>
            </div>
          </button>
        ))}
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
