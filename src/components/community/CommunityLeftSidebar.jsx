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

  return (
    <aside className="hidden md:block md:col-span-3 space-y-6">
      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('groups.sidebar.title')}</h1>
          <button className="size-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-lg">settings</span>
          </button>
        </div>
        <div className="relative mb-6 group">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg transition-colors group-focus-within:text-primary">
            search
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchSubmit}
            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/5 rounded-2xl py-3 pl-11 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none shadow-inner"
            placeholder={t('groups.sidebar.searchPlaceholder')}
          />
          {searchValue && (
            <button
              onClick={() => {
                setSearchValue('')
                onSearch?.('')
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>
        <nav className="space-y-1 text-sm">
          <button
            type="button"
            onClick={() => navigate('/community/group-feed')}
            className={`w-full flex items-center gap-4 py-2.5 px-3 rounded-xl transition-all group ${
              isMyFeedActive
                ? 'bg-primary text-white shadow-md font-bold uppercase tracking-wider scale-[1.02]'
                : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400 font-bold'
            }`}
          >
            <span
              className={`material-symbols-outlined text-xl ${
                isMyFeedActive ? 'text-white' : 'text-primary/60 group-hover:text-primary transition-colors'
              }`}
            >
              rss_feed
            </span>
            <span className="text-[10px] uppercase tracking-widest">{t('groups.sidebar.myFeed')}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/community/discover')}
            className={`w-full flex items-center gap-4 py-2.5 px-3 rounded-xl transition-all group ${
              isDiscoverActive
                ? 'bg-primary text-white shadow-md font-bold uppercase tracking-wider scale-[1.02]'
                : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400 font-bold'
            }`}
          >
            <span
              className={`material-symbols-outlined text-xl ${
                isDiscoverActive ? 'text-white' : 'text-primary/60 group-hover:text-primary transition-colors'
              }`}
            >
              explore
            </span>
            <span className="text-[10px] uppercase tracking-widest">{t('groups.sidebar.discover')}</span>
          </button>
          <button
            type="button"
            onClick={onShowYourGroups}
            className={`w-full flex items-center gap-4 py-2.5 px-3 rounded-xl transition-all group ${
              isYourGroupsActive
                ? 'bg-primary text-white shadow-md font-bold uppercase tracking-wider scale-[1.02]'
                : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400 font-bold'
            }`}
          >
            <span
              className={`material-symbols-outlined text-xl ${
                isYourGroupsActive ? 'text-white' : 'text-primary/60 group-hover:text-primary transition-colors'
              }`}
            >
              group
            </span>
            <span className="text-[10px] uppercase tracking-widest">{t('groups.sidebar.yourGroups')}</span>
          </button>
        </nav>
        <button
          type="button"
          onClick={() => navigate('/community/create')}
          className="w-full mt-4 h-10 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-md shadow-primary/25 flex items-center justify-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          {t('groups.sidebar.create')}
        </button>
      </div>

      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-gray-500">{t('groups.sidebar.joinedTitle')}</h3>
          <button
            type="button"
            className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all"
            onClick={onViewAllJoined}
          >
            {t('groups.sidebar.viewAll')}
          </button>
        </div>
        <div className="space-y-4 text-sm">
          {loadingGroups ? (
            <div className="py-4 flex justify-center">
              <span className="material-symbols-outlined animate-spin text-2xl text-primary opacity-50">progress_activity</span>
            </div>
          ) : groups.length === 0 ? (
            <p className="text-xs font-bold text-slate-400 py-2 italic text-center">{t('groups.sidebar.emptyGroups')}</p>
          ) : (
            groups.map((g) => {
              const id = g.id || g._id
              const isActive = activeGroup && (activeGroup.id === id || activeGroup._id === id)
              return (
                <div
                  key={id || g.slug}
                  onClick={() => onSelectGroup(id)}
                  className={`flex items-center gap-4 cursor-pointer rounded-2xl p-2 transition-all group ${
                    isActive ? 'bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                    {g.icon ? (
                      <img src={g.icon} alt={g.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined">group</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs truncate transition-colors ${isActive ? 'font-black text-primary' : 'font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary'}`}>
                      {g.name}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
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

