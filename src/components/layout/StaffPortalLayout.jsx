import { Outlet, Navigate, NavLink, useLocation, Link, useParams } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import {
  ROUTES,
  modPathTail,
  getStaffNavCore,
  getStaffNavEntertainment,
  getStaffNavGamification,
  getStaffNavAchievements,
} from '../../constants'
import { LogoutConfirmModal } from './LogoutConfirmModal'

function StaffNavLink({ to, end, icon, children, onNavigate, nested }) {
  return (
    <NavLink
      to={to}
      end={end ?? false}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'group flex w-full min-w-0 items-center gap-3 rounded-xl pl-3 pr-3 py-2.5 text-sm font-medium transition-all duration-200',
          'border border-transparent',
          nested ? 'ml-2 pl-3 border-l-2 border-white/[0.08]' : '',
          isActive
            ? 'bg-primary/15 text-primary border-primary/25 shadow-[0_0_24px_-8px_rgba(19,182,236,0.45)]'
            : 'text-gray-400 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.06]',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={[
              'flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors material-symbols-outlined text-[22px]',
              nested ? 'size-8 text-[20px]' : '',
              isActive ? 'bg-primary/25 text-primary' : 'bg-white/[0.04] text-gray-500 group-hover:bg-white/[0.08] group-hover:text-gray-300',
            ].join(' ')}
          >
            {icon}
          </span>
          <span className="truncate">{children}</span>
        </>
      )}
    </NavLink>
  )
}

export function StaffPortalLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const { userId: modUserParam } = useParams()
  const { user, logout, isAuthenticated, isModerator, isAdmin } = useAuth()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  const modTail = modPathTail(location.pathname)
  const [entertainmentOpen, setEntertainmentOpen] = useState(() =>
    Boolean(modTail?.startsWith('/entertainment') || modTail?.startsWith('/word-scramble')),
  )

  useEffect(() => {
    const tail = modPathTail(location.pathname)
    const open = Boolean(tail?.startsWith('/entertainment') || tail?.startsWith('/word-scramble'))
    if (open) setEntertainmentOpen(true)
  }, [location.pathname])

  const staffNavCore = useMemo(() => {
    if (user?.id == null) return []
    return getStaffNavCore(user.id)
  }, [user?.id])

  const staffNavEntertainment = useMemo(() => {
    if (user?.id == null) {
      return {
        labelKey: 'staffDashboard.navEntertainment',
        icon: 'sports_esports',
        hubTo: '/',
        descKey: '',
        children: [],
      }
    }
    return getStaffNavEntertainment(user.id)
  }, [user?.id])

  const gamificationNav = useMemo(() => {
    if (user?.id == null) return []
    return getStaffNavGamification(user.id).filter((s) => !s.adminOnly || isAdmin)
  }, [user?.id, isAdmin])

  const staffNavAchievements = useMemo(() => {
    if (user?.id == null) {
      return { to: '/', end: true, icon: 'military_tech', labelKey: 'staffDashboard.navAchievements' }
    }
    return getStaffNavAchievements(user.id)
  }, [user?.id])

  const entertainmentChildren = staffNavEntertainment.children.filter((s) => !s.adminOnly || isAdmin)

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }
  if (!isModerator && !isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />
  }
  if (!user?.id) {
    return <Navigate to={ROUTES.HOME} replace />
  }
  if (String(modUserParam) !== String(user.id)) {
    const tail = location.pathname.replace(/^\/mod\/[^/]+/, '') || ''
    const to = tail ? `${ROUTES.MANAGE_ROOT(user.id)}${tail}` : ROUTES.MANAGE_OVERVIEW(user.id)
    return <Navigate to={to} replace />
  }

  const roleLabel = isAdmin ? t('staffDashboard.roleAdmin') : t('staffDashboard.roleModerator')
  const avatarUrl =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=13b6ec&color=fff`

  const closeMobile = () => setMobileNavOpen(false)

  const confirmLogout = () => {
    setLogoutConfirmOpen(false)
    logout()
  }

  return (
    <div className="min-h-screen h-screen flex flex-col bg-[#080c10] text-white overflow-hidden">
      <header className="shrink-0 z-[60] border-b border-white/[0.07] bg-[#0c1118]/95 backdrop-blur-md shadow-[0_1px_0_rgba(19,182,236,0.08)]">
        <div className="h-[3.5rem] sm:h-14 flex items-center justify-between gap-3 px-3 sm:px-5">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              className="md:hidden flex size-10 items-center justify-center rounded-xl text-gray-300 hover:bg-white/[0.08] hover:text-white transition-colors -ml-0.5"
              onClick={() => setMobileNavOpen((o) => !o)}
              aria-label={t('staffDashboard.openMenu')}
            >
              <span className="material-symbols-outlined text-[26px]">{mobileNavOpen ? 'close' : 'menu'}</span>
            </button>
            <Link
              to={ROUTES.MANAGE_OVERVIEW(user.id)}
              className="flex items-center gap-2.5 sm:gap-3 min-w-0 rounded-xl sm:rounded-2xl sm:pr-4 sm:py-1 sm:-my-1 hover:bg-white/[0.03] transition-colors"
              onClick={closeMobile}
            >
              <span className="relative flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 ring-1 ring-primary/30 shadow-[0_0_20px_-6px_rgba(19,182,236,0.6)]">
                <span className="material-symbols-outlined text-[24px] sm:text-[26px] text-primary">shield_person</span>
              </span>
              <div className="min-w-0 flex flex-col gap-0.5">
                <span className="font-bold text-[15px] sm:text-base text-white tracking-tight leading-tight truncate">
                  {t('staffDashboard.brand')}
                </span>
                <span className="inline-flex items-center gap-1.5 w-fit max-w-full">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 truncate">EngSocial</span>
                  <span className="size-1 rounded-full bg-primary/80 shrink-0" aria-hidden />
                  <span className="text-[10px] font-medium text-primary/90 truncate">{roleLabel}</span>
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-gray-300 bg-white/[0.04] border border-white/[0.08] hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
            >
              <span className="material-symbols-outlined text-lg text-primary/80">home</span>
              <span className="hidden sm:inline pr-0.5">{t('staffDashboard.backToApp')}</span>
            </Link>
            <div className="hidden sm:block h-8 w-px bg-white/[0.08]" aria-hidden />
            <div className="flex items-center gap-2 rounded-2xl pl-1 pr-1 py-1 bg-black/25 border border-white/[0.06]">
              <img src={avatarUrl} alt="" className="size-8 rounded-lg object-cover ring-1 ring-white/10" />
              <span className="hidden md:inline text-sm text-gray-200 max-w-[7rem] lg:max-w-[10rem] truncate pr-1 font-medium">
                {user?.name}
              </span>
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(true)}
                className="flex size-9 items-center justify-center rounded-xl text-gray-500 hover:bg-red-500/15 hover:text-red-400 transition-colors"
                title={t('header.logout')}
              >
                <span className="material-symbols-outlined text-[22px]">logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        {mobileNavOpen ? (
          <button
            type="button"
            className="fixed inset-0 top-[3.5rem] sm:top-14 bg-black/65 backdrop-blur-[2px] z-40 md:hidden"
            aria-label={t('staffDashboard.closeMenu')}
            onClick={closeMobile}
          />
        ) : null}
        <aside
          className={[
            'fixed top-[3.5rem] sm:top-14 left-0 bottom-0 z-50 w-[min(18rem,88vw)]',
            'flex flex-col border-r border-white/[0.06] bg-gradient-to-b from-[#0e141c] to-[#0a0e14]',
            'shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]',
            'transition-transform duration-300 ease-out md:static md:top-0 md:z-0 md:w-[15.5rem] md:shrink-0 md:translate-x-0 md:shadow-none',
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          ].join(' ')}
        >
          <nav className="flex-1 overflow-y-auto custom-scrollbar px-2 pt-4 pb-4 md:pt-5 space-y-1">
            <StaffNavLink to={ROUTES.MANAGE_OVERVIEW(user.id)} end icon="dashboard" onNavigate={closeMobile}>
              {t('staffDashboard.navOverview')}
            </StaffNavLink>

            {staffNavCore.map((item) => (
              <StaffNavLink key={item.to} to={item.to} end={item.end} icon={item.icon} onNavigate={closeMobile}>
                {t(item.labelKey)}
              </StaffNavLink>
            ))}

            <div className="pt-1 space-y-0.5">
              <div className="flex items-stretch gap-0.5 rounded-xl">
                <div className="min-w-0 flex-1">
                  <StaffNavLink
                    to={staffNavEntertainment.hubTo}
                    end
                    icon={staffNavEntertainment.icon}
                    onNavigate={closeMobile}
                  >
                    {t(staffNavEntertainment.labelKey)}
                  </StaffNavLink>
                </div>
                <button
                  type="button"
                  onClick={() => setEntertainmentOpen((o) => !o)}
                  className="shrink-0 w-10 flex items-center justify-center rounded-xl border border-transparent text-gray-500 hover:bg-white/[0.06] hover:text-white transition-colors"
                  aria-expanded={entertainmentOpen}
                  aria-label={t('staffDashboard.toggleEntertainment')}
                >
                  <span
                    className={`material-symbols-outlined text-[22px] transition-transform ${entertainmentOpen ? 'rotate-180' : ''}`}
                  >
                    expand_more
                  </span>
                </button>
              </div>
              {entertainmentOpen
                ? entertainmentChildren.map((child) => (
                    <StaffNavLink
                      key={child.to}
                      to={child.to}
                      end={child.end}
                      icon={child.icon}
                      onNavigate={closeMobile}
                      nested
                    >
                      {t(child.labelKey)}
                    </StaffNavLink>
                  ))
                : null}
            </div>

            {gamificationNav.length > 0 ? (
              <div className="pt-2 space-y-1">
                {gamificationNav.map((item) => (
                  <StaffNavLink key={item.to} to={item.to} end={item.end} icon={item.icon} onNavigate={closeMobile}>
                    {t(item.labelKey)}
                  </StaffNavLink>
                ))}
              </div>
            ) : null}

            <StaffNavLink
              to={staffNavAchievements.to}
              end={staffNavAchievements.end}
              icon={staffNavAchievements.icon}
              onNavigate={closeMobile}
            >
              {t(staffNavAchievements.labelKey)}
            </StaffNavLink>
          </nav>

          <div className="shrink-0 border-t border-white/[0.06] px-2 pb-4 pt-2 md:pb-3">
            <button
              type="button"
              onClick={() => {
                closeMobile()
                setLogoutConfirmOpen(true)
              }}
              className="group flex w-full min-w-0 items-center gap-3 rounded-xl border border-transparent pl-3 pr-3 py-2.5 text-sm font-medium text-gray-400 transition-all duration-200 hover:border-white/[0.06] hover:bg-white/[0.05] hover:text-red-400"
              aria-label={t('header.logout')}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-gray-500 transition-colors material-symbols-outlined text-[22px] group-hover:bg-red-500/15 group-hover:text-red-400">
                logout
              </span>
              <span className="truncate">{t('header.logout')}</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden bg-background-dark md:shadow-[inset_1px_0_0_rgba(255,255,255,0.04)]">
          <Outlet />
        </main>
      </div>
      <LogoutConfirmModal
        open={logoutConfirmOpen}
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={confirmLogout}
      />
    </div>
  )
}
