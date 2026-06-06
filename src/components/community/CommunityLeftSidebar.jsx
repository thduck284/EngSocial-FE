import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'

export function CommunityLeftSidebar({
  groups,
  loadingGroups,
  activeGroup,
  onSelectGroup,
  onShowYourGroups,
  onViewAllJoined,
  onSearch,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const isYourGroupsActive = location.pathname.endsWith('/community/my-groups')
  const isMyFeedActive = location.pathname.endsWith('/community/group-feed')
  const isDiscoverActive = location.pathname.endsWith('/community/discover')

  const [searchValue, setSearchValue] = useState('')

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSearch?.(searchValue)
    }
  }

  const navItemClass = (active) =>
    `w-full flex items-center gap-3 py-2 px-3 rounded-lg transition-colors text-sm ${
      active
        ? 'bg-primary/10 text-primary font-bold'
        : 'hover:bg-slate-50 dark:hover:bg-background-dark/60 text-slate-600 dark:text-gray-400 font-medium'
    }`

  return (
    <aside className="hidden md:block md:col-span-3 space-y-4">
      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-base font-bold text-slate-900 dark:text-white">{t('groups.sidebar.title')}</h1>
          <button className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-background-dark transition-colors">
            <span className="material-symbols-outlined text-lg">settings</span>
          </button>
        </div>
        <div className="relative mb-4 group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg transition-colors group-focus-within:text-primary">
            search
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchSubmit}
            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg py-2 pl-10 pr-9 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            placeholder={t('groups.sidebar.searchPlaceholder')}
          />
          {searchValue && (
            <button
              onClick={() => {
                setSearchValue('')
                onSearch?.('')
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>
        <nav className="space-y-0.5 text-sm">
          <button type="button" onClick={() => navigate('/community/group-feed')} className={navItemClass(isMyFeedActive)}>
            <span className={`material-symbols-outlined text-lg ${isMyFeedActive ? 'text-primary' : 'text-primary/60'}`}>
              rss_feed
            </span>
            <span>{t('groups.sidebar.myFeed')}</span>
          </button>
          <button type="button" onClick={() => navigate('/community/discover')} className={navItemClass(isDiscoverActive)}>
            <span className={`material-symbols-outlined text-lg ${isDiscoverActive ? 'text-primary' : 'text-primary/60'}`}>
              explore
            </span>
            <span>{t('groups.sidebar.discover')}</span>
          </button>
          <button type="button" onClick={onShowYourGroups} className={navItemClass(isYourGroupsActive)}>
            <span className={`material-symbols-outlined text-lg ${isYourGroupsActive ? 'text-primary' : 'text-primary/60'}`}>
              group
            </span>
            <span>{t('groups.sidebar.yourGroups')}</span>
          </button>
        </nav>
        <button
          type="button"
          onClick={() => navigate('/community/create')}
          className="w-full mt-4 h-9 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          {t('groups.sidebar.create')}
        </button>
      </div>

      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xs text-slate-500 dark:text-gray-400">{t('groups.sidebar.joinedTitle')}</h3>
          <button
            type="button"
            className="text-xs font-bold text-primary hover:underline transition-colors"
            onClick={onViewAllJoined}
          >
            {t('groups.sidebar.viewAll')}
          </button>
        </div>
        <div className="space-y-2 text-sm">
          {loadingGroups ? (
            <div className="py-4 flex justify-center">
              <span className="material-symbols-outlined animate-spin text-2xl text-primary opacity-50">progress_activity</span>
            </div>
          ) : groups.length === 0 ? (
            <p className="text-xs text-slate-400 py-2 italic text-center">{t('groups.sidebar.emptyGroups')}</p>
          ) : (
            groups.map((g) => {
              const id = g.id || g._id
              const isActive = activeGroup && (activeGroup.id === id || activeGroup._id === id)
              return (
                <div
                  key={id || g.slug}
                  onClick={() => onSelectGroup(id)}
                  className={`flex items-center gap-3 cursor-pointer rounded-lg p-2 transition-colors group ${
                    isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-slate-50 dark:hover:bg-background-dark/60'
                  }`}
                >
                  <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden border border-primary/20">
                    {g.icon ? (
                      <img src={g.icon} alt={g.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-base">group</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs truncate transition-colors ${isActive ? 'font-bold text-primary' : 'font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary'}`}>
                      {g.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {g.memberCount ?? 0} {t('groups.header.members')}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </aside>
  )
}
