import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useRef, useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { io } from 'socket.io-client'
import { useAuth } from '../../context/AuthContext'
import { NotificationPopover } from '../ui/NotificationPopover'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { NAV_ITEMS, ROUTES } from '../../constants'
import { SOCKET_ENABLED, SOCKET_BASE_URL, SOCKET_FALLBACK_BASE_URL } from '../../constants/api'
import { getAuthToken } from '../../utils/auth'
import { notificationsService, conversationService } from '../../services'

const LogoIcon = () => (
  <div className="size-8">
    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path
        d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
        fill="currentColor"
      />
    </svg>
  </div>
)

export function AppHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const avatarUrl = user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User') + '&background=13b6ec&color=fff'
  const [notifOpen, setNotifOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [messagesUnreadCount, setMessagesUnreadCount] = useState(0)
  const [searchValue, setSearchValue] = useState(() => (location.pathname === ROUTES.SEARCH ? searchParams.get('q') || '' : ''))
  const notifButtonRef = useRef(null)
  const avatarRef = useRef(null)

  const fetchUnreadCount = useCallback(() => {
    if (!user) return
    notificationsService
      .getUnreadCount()
      .then((res) => setUnreadCount(res?.data?.unreadCount ?? 0))
      .catch(() => setUnreadCount(0))
  }, [user])

  const fetchMessagesUnreadCount = useCallback(() => {
    if (!user) return
    conversationService
      .getUnreadTotal()
      .then((res) => setMessagesUnreadCount(res?.data?.total ?? 0))
      .catch(() => setMessagesUnreadCount(0))
  }, [user])

  useEffect(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])

  useEffect(() => {
    fetchMessagesUnreadCount()
  }, [fetchMessagesUnreadCount])

  const isOnMessagesSection = location.pathname === ROUTES.MESSAGES || location.pathname.startsWith(ROUTES.MESSAGES + '/')

  useEffect(() => {
    if (isOnMessagesSection) fetchMessagesUnreadCount()
  }, [isOnMessagesSection, fetchMessagesUnreadCount])

  useEffect(() => {
    const onFocus = () => { if (isOnMessagesSection) fetchMessagesUnreadCount() }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [isOnMessagesSection, fetchMessagesUnreadCount])

  const headerSocketRef = useRef(null)
  const headerTriedFallbackRef = useRef(false)

  useEffect(() => {
    if (!SOCKET_ENABLED || !user) return
    const token = getAuthToken()
    if (!token) return
    const opts = { auth: { token }, transports: ['websocket', 'polling'] }

    function attachListeners(s) {
      s.on('notification', () => setUnreadCount((prev) => prev + 1))
      s.on('conversation:message', () => fetchMessagesUnreadCount())
      s.on('conversation:read', () => fetchMessagesUnreadCount())
    }

    let socket = io(SOCKET_BASE_URL, opts)
    headerSocketRef.current = socket
    attachListeners(socket)
    socket.on('connect_error', () => {
      if (!SOCKET_FALLBACK_BASE_URL || headerTriedFallbackRef.current) return
      headerTriedFallbackRef.current = true
      socket.removeAllListeners()
      socket.disconnect()
      socket = io(SOCKET_FALLBACK_BASE_URL, opts)
      headerSocketRef.current = socket
      attachListeners(socket)
    })

    return () => {
      headerTriedFallbackRef.current = false
      headerSocketRef.current?.disconnect()
      headerSocketRef.current = null
    }
  }, [user, fetchMessagesUnreadCount])

  useEffect(() => {
    if (location.pathname === ROUTES.SEARCH) {
      setSearchValue(searchParams.get('q') || '')
    }
  }, [location.pathname, searchParams])

  useEffect(() => {
    if (!avatarOpen) return
    const handleClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [avatarOpen])

  const handleLogout = () => {
    setAvatarOpen(false)
    logout()
  }

  return (
    <header className="sticky top-0 z-50 w-screen max-w-none ml-[calc(-50vw+50%)] bg-background-dark/80 backdrop-blur-md border-b border-border-dark px-4 md:px-10 py-3">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 text-primary shrink-0">
            <LogoIcon />
            <span className="text-2xl font-bold tracking-tight hidden lg:block">EngSocial</span>
          </Link>
          <div className="hidden md:flex flex-1 max-w-[320px] items-center bg-card-dark rounded-lg px-3 py-2 border border-border-dark">
            <span className="material-symbols-outlined text-gray-400 text-xl shrink-0">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-white placeholder-gray-400 w-full text-sm min-w-0"
              placeholder={t('header.searchPlaceholder')}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const q = (e.target.value || '').trim()
                  if (q) navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(q)}`)
                }
              }}
            />
          </div>
          <nav className="hidden xl:flex items-center gap-6 shrink-0">
            {NAV_ITEMS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`font-medium text-sm transition-colors whitespace-nowrap ${
                  location.pathname === to ||
                  (to === ROUTES.LESSON && (location.pathname === '/lesson' || location.pathname.startsWith('/lesson/') || location.pathname === '/lessons')) ||
                  (to === ROUTES.PRACTICE && (location.pathname === '/practice' || location.pathname.startsWith('/practice/') || location.pathname.startsWith('/skills')))
                    ? 'text-primary font-semibold border-b-2 border-primary pb-1'
                    : 'text-gray-400 hover:text-primary'
                }`}
              >
                {t(label)}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <LanguageSwitcher />
          <div className="flex gap-2">
            <div className="relative">
              <button
                ref={notifButtonRef}
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-card-dark text-gray-300 hover:bg-gray-700 hover:text-primary transition-all border border-border-dark"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-background-dark">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationPopover
                open={notifOpen}
                onClose={() => setNotifOpen(false)}
                anchorRef={notifButtonRef}
                unreadCount={unreadCount}
                onMarkAllRead={fetchUnreadCount}
                onUnreadChange={fetchUnreadCount}
              />
            </div>
            <Link
              to={ROUTES.MESSAGES}
              className={`relative w-10 h-10 flex items-center justify-center rounded-xl border transition-all shrink-0 ${
                isOnMessagesSection
                  ? 'bg-primary/20 text-primary border-primary'
                  : 'bg-card-dark text-gray-300 hover:bg-gray-700 hover:text-primary border-border-dark'
              }`}
            >
              <span className="material-symbols-outlined">chat_bubble</span>
              {messagesUnreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-background-dark">
                  {messagesUnreadCount > 99 ? '99+' : messagesUnreadCount}
                </span>
              )}
            </Link>
          </div>
          <div className="relative flex items-center gap-2" ref={avatarRef}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setAvatarOpen((o) => !o) }}
              className="size-10 rounded-full overflow-hidden border-2 border-primary cursor-pointer focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background-dark flex items-center justify-center shrink-0"
              aria-expanded={avatarOpen}
              aria-haspopup="true"
            >
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            </button>
            {avatarOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 py-1 rounded-xl bg-card-dark border border-border-dark shadow-xl z-50">
                <Link
                  to={ROUTES.PROFILE}
                  onClick={() => setAvatarOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700/50 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">person</span>
                  {t('header.profile')}
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setAvatarOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700/50 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">settings</span>
                  {t('header.settings')}
                </Link>
                <div className="my-1 border-t border-border-dark" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  {t('header.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
