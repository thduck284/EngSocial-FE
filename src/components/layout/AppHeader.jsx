import { Link, useLocation } from 'react-router-dom'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NotificationPopover } from '../ui/NotificationPopover'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'

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

const navItems = [
  { to: '/', label: 'header.home' },
  { to: '/skills/reading', label: 'header.skills' },
  { to: '/lessons', label: 'header.lessons' },
  { to: '/community', label: 'header.community' },
  { to: '/groups', label: 'header.groups' },
]

export function AppHeader() {
  const location = useLocation()
  const { t } = useTranslation()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifButtonRef = useRef(null)

  return (
    <header className="sticky top-0 z-50 w-full bg-background-dark/80 backdrop-blur-md border-b border-border-dark px-4 md:px-10 py-3">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-8 flex-1">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <LogoIcon />
            <span className="text-2xl font-bold tracking-tight hidden lg:block">EngSocial</span>
          </Link>
          <div className="hidden md:flex flex-1 max-w-md items-center bg-card-dark rounded-lg px-3 py-2 border border-border-dark">
            <span className="material-symbols-outlined text-gray-400 text-xl">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-white placeholder-gray-400 w-full text-sm"
              placeholder={t('header.searchPlaceholder')}
              type="text"
            />
          </div>
        </div>
        <nav className="hidden xl:flex items-center gap-6">
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`font-medium text-sm transition-colors ${
                location.pathname === to ||
                (to === '/skills/reading' && (location.pathname.startsWith('/skills') || location.pathname === '/enter')) ||
                (to.startsWith('/skills') && to !== '/skills/reading' && location.pathname.startsWith('/skills'))
                  ? 'text-primary font-semibold border-b-2 border-primary pb-1'
                  : 'text-gray-400 hover:text-primary'
              }`}
            >
              {t(label)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4 flex-1 justify-end">
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
          <div
            className="size-10 rounded-full bg-cover bg-center border-2 border-primary cursor-pointer"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA0AwCXYFkKZ6OadHZuVXKbGgPnJwXEbZ7mju_OspTxQDgYeb0a7ElTqsjD8BloFjbwxu8hlLpzQAXTpvgzA0Oe83pZ0xHTWNw47GKOKrRCMuPOBauT2uxw3bc9ydH3ojxuBArP752_-YvDYlqVx92pZjU111tnLtzgh2--MFFydJLdo4hVJfVeQlHd8jPPxNnSi4WMYG0gYJgD-Hsb2QuJZuQeZWjGlwKtSVnhhux0tIMKpd-muKa5gZUASKoxqXsnHH5ge6MgyVmx')`,
            }}
          />
        </div>
      </div>
    </header>
  )
}
