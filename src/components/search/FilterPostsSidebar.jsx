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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-white">
          <span className="material-symbols-outlined text-primary">filter_list</span>
          {t('search.filterPostsTitle')}
        </h2>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('search.filterTimeLabel')}</h3>
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setTimeFilter(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                timeFilter === opt
                  ? 'bg-primary text-white'
                  : 'bg-card-dark border border-border-dark text-gray-300 hover:bg-primary/20'
              }`}
            >
              {t(opt === 'all' ? 'search.filterTimeAll' : `search.filterTime${opt.charAt(0).toUpperCase() + opt.slice(1)}`)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">{t('search.filterTimeFrom')}</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-card-dark border border-border-dark rounded-lg text-xs p-1.5 focus:ring-primary text-white"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">{t('search.filterTimeTo')}</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-card-dark border border-border-dark rounded-lg text-xs p-1.5 focus:ring-primary text-white"
            />
          </div>
        </div>
      </div>

      {/* Sort by section đã được ẩn theo yêu cầu, giữ logic nhưng không render UI */}

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('search.contentTypeLabel')}</h3>
        <div className="space-y-2">
          {CONTENT_TYPES.map(({ value, key }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="content-type"
                checked={contentType === value}
                onChange={() => setContentType(value)}
                className="text-primary focus:ring-primary bg-card-dark border-border-dark"
              />
              <span className="text-sm text-gray-300 group-hover:text-primary transition-colors">{t(`search.${key}`)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('search.interactionsLabel')}</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={hasComments}
              onChange={(e) => setHasComments(e.target.checked)}
              className="rounded text-primary focus:ring-primary bg-card-dark border-border-dark"
            />
            <span className="text-sm text-gray-300 group-hover:text-primary transition-colors">{t('search.filterHasComments')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={hasLikes}
              onChange={(e) => setHasLikes(e.target.checked)}
              className="rounded text-primary focus:ring-primary bg-card-dark border-border-dark"
            />
            <span className="text-sm text-gray-300 group-hover:text-primary transition-colors">{t('search.filterHasLikes')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={savedOnly}
              onChange={(e) => setSavedOnly(e.target.checked)}
              className="rounded text-primary focus:ring-primary bg-card-dark border-border-dark"
            />
            <span className="text-sm text-gray-300 group-hover:text-primary transition-colors">{t('search.filterSaved')}</span>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-4 border-t border-border-dark">
        <button
          type="button"
          onClick={clearFilters}
          className="w-full border border-border-dark py-2 rounded-lg font-medium text-sm hover:bg-card-dark transition-all text-gray-300"
        >
          {t('search.clearFilters')}
        </button>
      </div>
    </div>
  )
}
