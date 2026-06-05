import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useRef, useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { io } from 'socket.io-client'
import { useAuth } from '../../context/AuthContext'
import { NotificationPopover } from '../ui/common/NotificationPopover'
import { LanguageSwitcher } from '../ui/common/LanguageSwitcher'
import { NAV_ITEMS, ROUTES } from '../../constants'
import { SOCKET_ENABLED, SOCKET_BASE_URL, SOCKET_FALLBACK_BASE_URL } from '../../constants/api'
import { getAuthToken } from '../../utils/auth'
import { notificationsService, conversationService, communityService } from '../../services'
import { LogoutConfirmModal } from './LogoutConfirmModal'
import { PostDetailModal } from '../ui/post/PostDetailModal'
import { WordScrambleIncomingInviteModal } from '../entertainment/WordScrambleIncomingInviteModal'

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
  const { user, logout, isModerator, isAdmin, isGuest } = useAuth()
  const staffWorkTo =
    (isAdmin || isModerator) && user?.id != null
      ? isAdmin
        ? ROUTES.MANAGE_ADMIN_OVERVIEW(user.id)
        : ROUTES.MANAGE_OVERVIEW(user.id)
      : null
  const avatarUrl = user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User') + '&background=13b6ec&color=fff'
  const [notifOpen, setNotifOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [messagesUnreadCount, setMessagesUnreadCount] = useState(0)
  const [searchValue, setSearchValue] = useState(() => (location.pathname === ROUTES.SEARCH ? searchParams.get('q') || '' : ''))
  const notifButtonRef = useRef(null)
  const avatarRef = useRef(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [showPostModal, setShowPostModal] = useState(false)
  const [postModalLoading, setPostModalLoading] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const fetchUnreadCount = useCallback(() => {
    if (!user || isGuest) return
    notificationsService
      .getUnreadCount()
      .then((res) => setUnreadCount(res?.data?.unreadCount ?? 0))
      .catch(() => setUnreadCount(0))
  }, [user, isGuest])

  const fetchMessagesUnreadCount = useCallback(() => {
    if (!user || isGuest) return
    conversationService
      .getUnreadTotal()
      .then((res) => setMessagesUnreadCount(res?.data?.total ?? 0))
      .catch(() => setMessagesUnreadCount(0))
  }, [user, isGuest])

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

  const [incomingInvite, setIncomingInvite] = useState(null)

  useEffect(() => {
    if (!SOCKET_ENABLED || !user || isGuest) return
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
  }, [user, isGuest, fetchMessagesUnreadCount])

  useEffect(() => {
    if (location.pathname === ROUTES.SEARCH) {
      setSearchValue(searchParams.get('q') || '')
    } else {
      setSearchValue('')
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

  const openLogoutConfirm = () => {
    setAvatarOpen(false)
    setLogoutConfirmOpen(true)
  }

  const handleOpenPostModal = useCallback(async (postId) => {
    if (!postId) return
    setPostModalLoading(true)
    try {
      const res = await communityService.getPost(postId)
      const p = res?.data?.post ?? res?.data
      if (p) {
        setSelectedPost(p)
        setShowPostModal(true)
      }
    } catch (err) {
      console.error('Failed to fetch post for modal', err)
    } finally {
      setPostModalLoading(false)
    }
  }, [])

  const confirmLogout = () => {
    setLogoutConfirmOpen(false)
    logout()
  }

  return (
    <>
    <header className="sticky top-0 z-50 w-screen max-w-none ml-[calc(-50vw+50%)] bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-border-dark px-4 md:px-10 py-3">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 text-primary shrink-0">
            <LogoIcon />
            <span className="text-2xl font-bold tracking-tight hidden lg:block">EngSocial</span>
          </Link>
          <div className={`hidden md:flex flex-1 max-w-[320px] items-center bg-slate-100 dark:bg-card-dark rounded-lg px-3 py-2 border border-slate-200 dark:border-border-dark transition-all ${isSearchFocused ? 'ring-2 ring-primary/20 border-primary shadow-lg shadow-primary/5' : ''}`}>
            {!isSearchFocused && !searchValue && (
              <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-xl shrink-0">search</span>
            )}
            <input
              className={`bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-gray-400 w-full text-sm min-w-0 ${isSearchFocused ? 'pl-1' : ''}`}
              placeholder={t('header.searchPlaceholder')}
              type="text"
              value={searchValue}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
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
                  (to === ROUTES.PRACTICE && (location.pathname === '/practice' || location.pathname.startsWith('/practice/') || location.pathname.startsWith('/skills') || location.pathname === '/enter')) ||
                  (to === ROUTES.WORDS_NOTES && (location.pathname.startsWith('/words-notes') || location.pathname.startsWith('/topic/'))) ||
                  (to === ROUTES.QUESTS &&
                    (
                      location.pathname === '/quests'
                      || location.pathname === '/challenge'
                      || /^\/mod\/[^/]+\/quests(\/|$)/.test(location.pathname)
                    )) ||
                  (to === ROUTES.COMMUNITY && (location.pathname.startsWith('/community')))
                    ? 'text-primary font-semibold border-b-2 border-primary pb-1'
                    : 'text-slate-500 dark:text-gray-400 hover:text-primary'
                }`}
              >
                {t(label)}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <LanguageSwitcher />
          {!isGuest && (
          <div className="flex gap-2">
            <div className="relative">
              <button
                ref={notifButtonRef}
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-card-dark text-slate-500 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 hover:text-primary transition-all border border-slate-200 dark:border-border-dark"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-background-dark">
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
                onOpenPostModal={handleOpenPostModal}
              />
            </div>
            <Link
              to={ROUTES.MESSAGES}
              className={`relative w-10 h-10 flex items-center justify-center rounded-xl border transition-all shrink-0 ${
                isOnMessagesSection
                  ? 'bg-primary/20 text-primary border-primary'
                  : 'bg-slate-100 dark:bg-card-dark text-slate-500 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 hover:text-primary border-slate-200 dark:border-border-dark'
              }`}
            >
              <span className="material-symbols-outlined">chat_bubble</span>
              {messagesUnreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-background-dark">
                  {messagesUnreadCount > 99 ? '99+' : messagesUnreadCount}
                </span>
              )}
            </Link>
          </div>
          )}
          <div className="relative flex items-center gap-2" ref={avatarRef}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setAvatarOpen((o) => !o) }}
              className="size-10 rounded-full overflow-hidden border-2 border-primary cursor-pointer focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-background-dark flex items-center justify-center shrink-0"
              aria-expanded={avatarOpen}
              aria-haspopup="true"
            >
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            </button>
            {avatarOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 py-1 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark shadow-xl z-50">
                {isGuest ? (
                  <>
                    <div className="px-4 py-2.5 text-xs font-bold text-primary border-b border-slate-200 dark:border-border-dark">
                      {t('auth.guest.badge')}
                    </div>
                    <Link
                      to={ROUTES.LOGIN}
                      state={{ from: location }}
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700/50 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">login</span>
                      {t('auth.login')}
                    </Link>
                    <Link
                      to={ROUTES.REGISTER}
                      state={{ from: location }}
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700/50 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">person_add</span>
                      {t('auth.register')}
                    </Link>
                  </>
                ) : (
                  <>
                <Link
                  to={ROUTES.PROFILE}
                  onClick={() => setAvatarOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700/50 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">person</span>
                  {t('header.profile')}
                </Link>
                {staffWorkTo && (
                  <Link
                    to={staffWorkTo}
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700/50 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">dashboard</span>
                    {t('header.yourWork')}
                  </Link>
                )}
                <Link
                  to="/settings"
                  onClick={() => setAvatarOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700/50 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">settings</span>
                  {t('header.settings')}
                </Link>
                  </>
                )}
                <div className="my-1 border-t border-slate-200 dark:border-border-dark" />
                <button
                  type="button"
                  onClick={openLogoutConfirm}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  {isGuest ? t('auth.guest.exit') : t('header.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    <LogoutConfirmModal
      open={logoutConfirmOpen}
      onCancel={() => setLogoutConfirmOpen(false)}
      onConfirm={confirmLogout}
    />
    <PostDetailModal
      open={showPostModal}
      onClose={() => setShowPostModal(false)}
      post={selectedPost}
    />
    {postModalLoading && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
        <div className="bg-card-dark p-4 rounded-xl shadow-2xl border border-border-dark flex items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
          <span className="text-sm font-medium text-gray-200">Đang tải bài viết...</span>
        </div>
      </div>
    )}
    </>
  )
}
