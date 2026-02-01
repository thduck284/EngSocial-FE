import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const notifications = [
  {
    id: 1,
    unread: true,
    type: 'comment',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-oVK9sv1zsEIrhZzFDWplBlNkGHOdWpMbfTbee50oMU_zw-Ke6yEJXg6qfeJMQuzYIBYSCR2NsxAUFBeIt3-HI22-nmAsn1-IWrcRz7UMBQmPBdKmeh2Hly6x0Jh3FdPPmh4TvFYG9uTn6uKbUu5qLMDKcRKuIgylfjQyX3RE9dOnXqEY9hhu9ajD7YxkmmN4JbXVLfCDBKsAgckxTigEveGgkSnICu6GtlSNl3ASvkfcJ949M4pIxOuOgkRa4AsXYZniiPUQLZ30',
    content: <><span className="font-bold">Elena Rodriguez</span> vừa bình luận vào bài viết của bạn.</>,
    time: '2 phút trước',
  },
  {
    id: 2,
    unread: false,
    type: 'challenge',
    icon: 'emoji_events',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-500',
    content: <><span className="font-bold">Thử thách mới:</span> Vua Từ Vựng Tuần 48 đã bắt đầu! Tham gia ngay.</>,
    time: '1 giờ trước',
  },
  {
    id: 3,
    unread: false,
    type: 'goal',
    icon: 'check_circle',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-500',
    content: <>Bạn đã hoàn thành mục tiêu học tập hàng ngày. Chúc mừng!</>,
    time: '4 giờ trước',
  },
  {
    id: 4,
    unread: false,
    type: 'follow',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlcLPs4U31IUEEkJ-7hiUMKLh8ld5wo1RGeCtIBeEHQPkQ9Ofijva7BfHev8yilRvXN0WPV1TDMIaTpGbzOuUoOlbfMPoEor2V85bY0F4kWKK4kebj07jDy5_vLBJ1csR9LujDeRN9STlII7d3COtb7raAS-xwu5RFjTTcPx3ONz7Q2NBUxQVSBhZlMDRkw_LwZ8K5gqYmcGI598qawEvh0vzZE2x7589wg9hwhK6vQbh9YXMR7amiN-Pa6H0mmcK1kts2TBtvMFYk',
    content: <><span className="font-bold">Alex Thompson</span> đã bắt đầu theo dõi bạn.</>,
    time: 'Hôm qua',
  },
]

export function NotificationPopover({ open, onClose, anchorRef }) {
  const panelRef = useRef(null)
  const { t } = useTranslation()

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
                <p className="text-sm leading-snug text-gray-200">{n.content}</p>
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
