import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'

export function CommunityLeftSidebar({
  groups,
  loadingGroups,
  activeGroup,
  onSelectGroup,
  onShowYourGroups,
  onViewAllJoined,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const isYourGroupsActive = location.pathname.endsWith('/community/my-groups')
  const isMyFeedActive = location.pathname.endsWith('/community/group-feed')

  return (
    <aside className="hidden md:block md:col-span-3 space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold">{t('groups.sidebar.title')}</h1>
          <span className="material-symbols-outlined text-slate-400">settings</span>
        </div>
        <div className="relative mb-6">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            search
          </span>
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-1 focus:ring-primary focus:border-primary"
            placeholder={t('groups.sidebar.searchPlaceholder')}
          />
        </div>
        <nav className="space-y-1 text-sm">
          <button
            type="button"
            onClick={() => navigate('/community/group-feed')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              isMyFeedActive
                ? 'bg-primary/15 text-primary-100 font-semibold border border-primary/40'
                : 'hover:bg-slate-800 text-slate-200'
            }`}
          >
            <span
              className={`material-symbols-outlined ${
                isMyFeedActive ? 'text-primary' : 'text-slate-300'
              }`}
            >
              rss_feed
            </span>
            <span>{t('groups.sidebar.myFeed')}</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-200">
            <span className="material-symbols-outlined text-slate-300">explore</span>
            <span>{t('groups.sidebar.discover')}</span>
          </button>
          <button
            type="button"
            onClick={onShowYourGroups}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              isYourGroupsActive
                ? 'bg-primary/15 text-primary-100 font-semibold border border-primary/40'
                : 'hover:bg-slate-800 text-slate-200'
            }`}
          >
            <span
              className={`material-symbols-outlined ${
                isYourGroupsActive ? 'text-primary' : 'text-slate-300'
              }`}
            >
              group
            </span>
            <span>{t('groups.sidebar.yourGroups')}</span>
          </button>
        </nav>
        <button
          type="button"
          onClick={() => navigate('/community/create')}
          className="w-full mt-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {t('groups.sidebar.create')}
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">{t('groups.sidebar.joinedTitle')}</h3>
          <button
            type="button"
            className="text-xs text-primary font-medium hover:underline"
            onClick={onViewAllJoined}
          >
            {t('groups.sidebar.viewAll')}
          </button>
        </div>
        <div className="space-y-3 text-sm">
          {loadingGroups ? (
            <p className="text-xs text-slate-500">{t('groups.sidebar.loadingGroups')}</p>
          ) : groups.length === 0 ? (
            <p className="text-xs text-slate-500">{t('groups.sidebar.emptyGroups')}</p>
          ) : (
            groups.map((g) => {
              const id = g.id || g._id
              const isActive = activeGroup && (activeGroup.id === id || activeGroup._id === id)
              return (
                <div
                  key={id || g.slug}
                  onClick={() => onSelectGroup(id)}
                  className={`flex items-center gap-3 cursor-pointer rounded-lg px-2 py-1 ${
                    isActive ? 'bg-slate-800' : 'hover:bg-slate-900'
                  }`}
                >
                  <div className="size-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 overflow-hidden">
                    {g.icon ? (
                      <img src={g.icon} alt={g.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined">group</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{g.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {g.memberCount ?? 0} thành viên
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

