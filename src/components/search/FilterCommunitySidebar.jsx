import { COMMUNITY_FILTER_OPTIONS } from '../../constants/search'

export function FilterCommunitySidebar({ t, communityFilter, setCommunityFilter, applyFilters, clearFilters }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-white">
          <span className="material-symbols-outlined text-primary">filter_list</span>
          {t('search.filterCommunityTitle')}
        </h2>
      </div>
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('search.filterCommunityLabel')}</h3>
        <div className="space-y-2">
          {COMMUNITY_FILTER_OPTIONS.map(({ value, key }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="community-filter"
                checked={communityFilter === value}
                onChange={() => setCommunityFilter(value)}
                className="text-primary focus:ring-primary bg-card-dark border-border-dark"
              />
              <span className="text-sm text-gray-300 group-hover:text-primary transition-colors">{t(`search.${key}`)}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 pt-4 border-t border-border-dark">
        <button
          type="button"
          onClick={applyFilters}
          className="w-full bg-primary py-2 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-white"
        >
          {t('search.applyFilters')}
        </button>
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
