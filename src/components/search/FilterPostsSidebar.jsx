import { TIME_OPTIONS, CONTENT_TYPES } from '../../constants/search'

export function FilterPostsSidebar({
  t,
  timeFilter,
  setTimeFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  sort,
  setSort,
  contentType,
  setContentType,
  hasComments,
  setHasComments,
  hasLikes,
  setHasLikes,
  savedOnly,
  setSavedOnly,
  applyFilters,
  clearFilters,
}) {
  return (
    <div className="space-y-8 bg-white dark:bg-card-dark p-8 rounded-[2.5rem] border border-slate-200 dark:border-border-dark shadow-xl shadow-slate-200/50 dark:shadow-none">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 text-slate-900 dark:text-white">
          <span className="material-symbols-outlined text-primary text-xl">filter_list</span>
          {t('search.filterPostsTitle')}
        </h2>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 flex items-center gap-2">
          <span className="size-1 rounded-full bg-primary" />
          {t('search.filterTimeLabel')}
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setTimeFilter(opt)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                timeFilter === opt
                  ? 'bg-primary text-white shadow-primary/30'
                  : 'bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {t(opt === 'all' ? 'search.filterTimeAll' : `search.filterTime${opt.charAt(0).toUpperCase() + opt.slice(1)}`)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 px-1">{t('search.filterTimeFrom')}</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-bold p-3 focus:ring-2 focus:ring-primary/20 outline-none text-slate-700 dark:text-white transition-all shadow-inner"
            />
          </div>
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 px-1">{t('search.filterTimeTo')}</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-bold p-3 focus:ring-2 focus:ring-primary/20 outline-none text-slate-700 dark:text-white transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 flex items-center gap-2">
          <span className="size-1 rounded-full bg-primary" />
          {t('search.contentTypeLabel')}
        </h3>
        <div className="space-y-3 px-1">
          {CONTENT_TYPES.map(({ value, key }) => (
            <label key={value} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="content-type"
                  checked={contentType === value}
                  onChange={() => setContentType(value)}
                  className="peer appearance-none size-5 rounded-full border-2 border-slate-200 dark:border-white/10 checked:border-primary transition-all"
                />
                <div className="absolute size-2.5 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform" />
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-gray-300 group-hover:text-primary transition-colors uppercase tracking-widest">{t(`search.${key}`)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 flex items-center gap-2">
          <span className="size-1 rounded-full bg-primary" />
          {t('search.interactionsLabel')}
        </h3>
        <div className="space-y-3 px-1">
          {[
            { checked: hasComments, onChange: setHasComments, label: 'search.filterHasComments' },
            { checked: hasLikes, onChange: setHasLikes, label: 'search.filterHasLikes' },
            { checked: savedOnly, onChange: setSavedOnly, label: 'search.filterSaved' },
          ].map((item, idx) => (
            <label key={idx} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.onChange(e.target.checked)}
                  className="peer appearance-none size-5 rounded-lg border-2 border-slate-200 dark:border-white/10 checked:bg-primary checked:border-primary transition-all"
                />
                <span className="material-symbols-outlined absolute text-white text-sm scale-0 peer-checked:scale-100 transition-transform pointer-events-none">check</span>
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-gray-300 group-hover:text-primary transition-colors uppercase tracking-widest">{t(item.label)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-white/5">
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
