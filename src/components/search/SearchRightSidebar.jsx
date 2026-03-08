import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants'
import {
  MOCK_FRIEND_SUGGESTIONS,
  MOCK_STUDY_GROUPS,
  MOCK_LEADERBOARD,
} from '../../constants/search'

export function SearchRightSidebar({ t, searchInput, setSearchInput, onSearchSubmit }) {
  return (
    <>
      <div className="relative group">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary">
          search
        </span>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
          className="w-full bg-card-dark border border-border-dark rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none transition-all text-white placeholder-gray-500"
          placeholder={t('dashboard.quickSearch')}
        />
      </div>

      <div className="bg-card-dark rounded-xl p-4 border border-border-dark space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center justify-between">
          {t('dashboard.friendSuggestions')}
          <Link to={ROUTES.FRIENDS} className="text-[10px] text-primary hover:underline">
            {t('dashboard.viewAllSuggestions')}
          </Link>
        </h3>
        <div className="space-y-4">
          {MOCK_FRIEND_SUGGESTIONS.map((f) => (
            <div key={f.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={f.avatar} alt="" className="size-8 rounded-full object-cover" />
                <div>
                  <p className="text-xs font-bold text-white">{f.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {f.mutual} {t('dashboard.mutualFriends')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card-dark rounded-xl p-4 border border-border-dark space-y-4">
        <h3 className="font-bold text-sm text-white">{t('dashboard.studyGroups')}</h3>
        <div className="space-y-3">
          {MOCK_STUDY_GROUPS.map((g) => (
            <div
              key={g.title}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-dark/50 transition-colors cursor-pointer border border-border-dark/30"
            >
              <div
                className={`size-10 bg-gradient-to-br ${g.color} rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-inner`}
              >
                {g.title.slice(0, 2)}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{g.title}</p>
                <p className="text-[10px] text-gray-400">{g.members}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card-dark rounded-xl p-4 border border-border-dark space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-yellow-500 text-lg">emoji_events</span>
          {t('search.leaderboardTitle')}
        </h3>
        <div className="space-y-3">
          {MOCK_LEADERBOARD.map((r) => (
            <div key={r.rank} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold w-4 ${r.color}`}>{r.rank}</span>
                <span className="text-xs font-medium text-white">{r.name}</span>
              </div>
              <span className="text-[10px] font-bold text-primary">{r.xp}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
