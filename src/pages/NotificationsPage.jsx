import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { notificationsService, groupService } from '../services'
import { formatPostTime } from '../utils/dateTime'
import { ROUTES } from '../constants'
import { showEngSuccessToast } from '../utils/showEngToast'
import { navigateToPostDetail } from '../utils/postLinks'
import {
  getNotificationLink,
  getPostIdFromNotification,
  isPostNotification,
  renderNotificationContent,
} from '../utils/notificationDisplay.jsx'
import { getVisiblePageNumbers } from '../utils/pagination'

const PER_PAGE = 20

function NotificationIcon({ n }) {
  if (n.type === 'friend_request' || n.type === 'group_invite') {
    return (
      <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-primary">
          {n.type === 'group_invite' ? 'group_add' : 'person_add'}
        </span>
      </div>
    )
  }
  if (n.type === 'system') {
    return (
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
          n.data?.outcome === 'accepted'
            ? 'bg-emerald-500/15'
            : n.data?.outcome === 'rejected'
              ? 'bg-slate-500/15'
              : 'bg-amber-500/15'
        }`}
      >
        <span
          className={`material-symbols-outlined ${
            n.data?.outcome === 'accepted'
              ? 'text-emerald-600 dark:text-emerald-400'
              : n.data?.outcome === 'rejected'
                ? 'text-slate-600 dark:text-slate-400'
                : 'text-amber-600 dark:text-amber-400'
          }`}
        >
          {n.data?.kind === 'report_status_change'
            ? n.data?.outcome === 'accepted'
              ? 'check_circle'
              : n.data?.outcome === 'rejected'
                ? 'cancel'
                : 'flag'
            : 'admin_panel_settings'}
        </span>
      </div>
    )
  }
  if (n.type === 'challenge') {
    return (
      <div className="w-11 h-11 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-amber-500">emoji_events</span>
      </div>
    )
  }
  return (
    <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-gray-600/50 flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-slate-500 dark:text-gray-400">notifications</span>
    </div>
  )
}

export function NotificationsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [filter, setFilter] = useState('all')
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 })
  const [unreadCount, setUnreadCount] = useState(0)
  const [joinedGroupIds, setJoinedGroupIds] = useState(new Set())

  const loadNotifications = useCallback(() => {
    setLoading(true)
    const params = { page, limit: PER_PAGE }
    if (filter === 'unread') params.read = false

    Promise.all([
      notificationsService.getNotifications(params),
      groupService.listMine({ limit: 100 }).catch(() => null),
    ])
      .then(([notifRes, groupsRes]) => {
        const payload = notifRes?.data ?? {}
        const inner = payload.data ?? payload
        const list = inner?.notifications ?? (Array.isArray(inner) ? inner : [])
        setNotifications(Array.isArray(list) ? list : [])
        setUnreadCount(inner?.unreadCount ?? payload.unreadCount ?? 0)
        setPagination(payload.pagination ?? inner?.pagination ?? { totalPages: 1, total: list.length })

        const groupsList = groupsRes?.data?.groups || (Array.isArray(groupsRes?.data) ? groupsRes.data : [])
        setJoinedGroupIds(new Set(groupsList.map((g) => String(g.id || g._id))))
      })
      .catch(() => {
        setNotifications([])
        setPagination({ totalPages: 1, total: 0 })
      })
      .finally(() => setLoading(false))
  }, [filter, page])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    setPage(1)
  }, [filter])

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (_) {}
  }

  const markOneRead = async (n) => {
    if (n.read !== false) return
    try {
      await notificationsService.markAsRead(n.id)
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch (_) {}
  }

  const handleItemClick = async (n, e) => {
    if (isPostNotification(n)) {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }
      const pid = getPostIdFromNotification(n)
      if (pid) {
        await markOneRead(n)
        navigateToPostDetail(navigate, location, pid)
        return
      }
    }

    await markOneRead(n)
  }

  const visiblePages = getVisiblePageNumbers(page, pagination.totalPages || 1)

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('notifications.title')}</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
              {t('notifications.unreadSummary', { count: unreadCount, defaultValue: '{{count}} unread' })}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-sm font-semibold text-primary hover:underline shrink-0"
          >
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'unread'].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === key
                ? 'bg-primary text-white shadow-sm shadow-primary/20'
                : 'bg-white dark:bg-card-dark text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-border-dark hover:border-primary/40'
            }`}
          >
            {t(key === 'all' ? 'notifications.filterAll' : 'notifications.filterUnread', {
              defaultValue: key === 'all' ? 'All' : 'Unread',
            })}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-gray-400 text-sm">
            {t('notifications.loading')}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-gray-600 mb-3">notifications_off</span>
            <p className="text-slate-500 dark:text-gray-400 font-medium">{t('notifications.empty')}</p>
          </div>
        ) : (
          notifications.map((n) => {
            const link = getNotificationLink(n)
            const openPost = isPostNotification(n) && getPostIdFromNotification(n)
            const itemClass = `w-full text-left p-4 transition-colors border-b border-slate-100 dark:border-border-dark last:border-b-0 ${
              n.read === false
                ? 'bg-primary/5 border-l-4 border-l-primary hover:bg-slate-50 dark:hover:bg-gray-800/50'
                : 'hover:bg-slate-50 dark:hover:bg-gray-800/50'
            }`

            const body = (
              <div className="flex gap-3">
                <NotificationIcon n={n} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug text-slate-700 dark:text-gray-200">
                    {renderNotificationContent(n, t)}
                  </p>

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
                            showEngSuccessToast(t('groups.header.inviteAcceptedSuccess', { defaultValue: 'Joined group!' }))
                            setNotifications((prev) => prev.filter((item) => item.id !== n.id))
                            setUnreadCount((c) => (n.read === false ? Math.max(0, c - 1) : c))
                          } catch (err) {
                            window.alert(err?.message || 'Failed')
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold hover:brightness-110"
                      >
                        {t('groups.header.inviteAccept', { defaultValue: 'Accept' })}
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
                            setNotifications((prev) => prev.filter((item) => item.id !== n.id))
                            setUnreadCount((c) => (n.read === false ? Math.max(0, c - 1) : c))
                          } catch (err) {
                            window.alert(err?.message || 'Failed')
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-200 text-[11px] font-bold"
                      >
                        {t('groups.header.inviteDecline', { defaultValue: 'Decline' })}
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500 dark:text-gray-500">{formatPostTime(n.createdAt)}</span>
                    {n.read === false && <span className="size-2 bg-primary rounded-full shrink-0" />}
                  </div>
                </div>
              </div>
            )

            if (openPost) {
              return (
                <button key={n.id} type="button" onClick={(e) => handleItemClick(n, e)} className={itemClass}>
                  {body}
                </button>
              )
            }

            if (link) {
              return (
                <Link key={n.id} to={link} onClick={(e) => handleItemClick(n, e)} className={`block ${itemClass}`}>
                  {body}
                </Link>
              )
            }

            return (
              <button key={n.id} type="button" onClick={(e) => handleItemClick(n, e)} className={itemClass}>
                {body}
              </button>
            )
          })
        )}
      </div>

      {!loading && (pagination.totalPages || 1) > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="size-9 rounded-lg border border-slate-200 dark:border-border-dark disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          {visiblePages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`min-w-9 h-9 px-2 rounded-lg text-xs font-bold ${
                p === page ? 'bg-primary text-white' : 'border border-slate-200 dark:border-border-dark'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= (pagination.totalPages || 1)}
            onClick={() => setPage((p) => p + 1)}
            className="size-9 rounded-lg border border-slate-200 dark:border-border-dark disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      )}
    </main>
  )
}
