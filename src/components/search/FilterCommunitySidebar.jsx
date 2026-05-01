import { COMMUNITY_FILTER_OPTIONS } from '../../constants/search'

export function FilterCommunitySidebar({ t, communityFilter, setCommunityFilter, applyFilters, clearFilters }) {
  return (
    <div className="space-y-8 bg-white dark:bg-card-dark p-8 rounded-[2.5rem] border border-slate-200 dark:border-border-dark shadow-xl shadow-slate-200/50 dark:shadow-none">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 text-slate-900 dark:text-white">
          <span className="material-symbols-outlined text-primary text-xl">groups_3</span>
          {t('search.filterCommunityTitle')}
        </h2>
      </div>
      <div className="space-y-5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 flex items-center gap-2">
          <span className="size-1 rounded-full bg-primary" />
          {t('search.filterCommunityLabel')}
        </h3>
        <div className="space-y-4 px-1">
          {COMMUNITY_FILTER_OPTIONS.map(({ value, key }) => (
            <label key={value} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="community-filter"
                  checked={communityFilter === value}
                  onChange={() => setCommunityFilter(value)}
                  className="peer appearance-none size-5 rounded-full border-2 border-slate-200 dark:border-white/10 checked:border-primary transition-all"
                />
                <div className="absolute size-2.5 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform" />
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-gray-300 group-hover:text-primary transition-colors uppercase tracking-widest">{t(`search.${key}`)}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
        <button
          type="button"
          onClick={applyFilters}
          className="w-full bg-primary hover:brightness-110 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          {t('search.applyFilters')}
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="w-full py-3.5 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 transition-all active:scale-95 shadow-sm"
        >
          {t('search.clearFilters')}
        </button>
      </div>
    </div>

  )
}
