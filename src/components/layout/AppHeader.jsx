import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { NotificationPopover } from '../ui/NotificationPopover'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { NAV_ITEMS, ROUTES } from '../../constants'

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
  const { user, role, isModerator, isAdmin, logout } = useAuth()
  const avatarUrl = user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User') + '&background=13b6ec&color=fff'
  const roleBadge = isAdmin ? 'Admin' : isModerator ? 'Moderator' : null
  const [notifOpen, setNotifOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(() => (location.pathname === ROUTES.SEARCH ? searchParams.get('q') || '' : ''))
  const notifButtonRef = useRef(null)
  const avatarRef = useRef(null)

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
    <header className="sticky top-0 z-50 w-full bg-background-dark/80 backdrop-blur-md border-b border-border-dark px-4 md:px-10 py-3">
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
                  (to === ROUTES.SKILLS.READING && (location.pathname.startsWith('/skills') || location.pathname === ROUTES.ENTER)) ||
                  (to.startsWith('/skills') && to !== ROUTES.SKILLS.READING && location.pathname.startsWith('/skills'))
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
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-card-dark text-gray-300 hover:bg-gray-700 hover:text-primary transition-all border border-border-dark"
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2.5 size-2 bg-red-500 rounded-full border-2 border-background-dark" />
              </button>
              <NotificationPopover
                open={notifOpen}
                onClose={() => setNotifOpen(false)}
                anchorRef={notifButtonRef}
              />
            </div>
            <button
              type="button"
              className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-card-dark text-gray-300 hover:bg-gray-700 hover:text-primary transition-all border border-border-dark"
            >
              <span className="material-symbols-outlined">chat_bubble</span>
              <span className="absolute top-2 right-2.5 size-2 bg-red-500 rounded-full border-2 border-background-dark" />
            </button>
          </div>
          <div className="relative flex items-center gap-2" ref={avatarRef}>
            {roleBadge && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isAdmin ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                }`}
                title={roleBadge}
              >
                {roleBadge}
              </span>
            )}
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
