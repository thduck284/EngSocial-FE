import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../constants'
import { MOCK_POSTS, MOCK_POSTS_COUNT } from '../constants/search'
import { useSearchPage } from '../hooks/useSearchPage'
import {
  FilterPostsSidebar,
  FilterFriendsSidebar,
  FilterCommunitySidebar,
  SearchResultsFriends,
  SearchResultsPosts,
  SearchRightSidebar,
} from '../components/search'

export function SearchPage() {
  const { t } = useTranslation()
  const search = useSearchPage()

  const {
    q,
    tab,
    searchInput,
    setSearchInput,
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
    friendFilter,
    setFriendFilter,
    communityFilter,
    setCommunityFilter,
    showMobileFilters,
    setShowMobileFilters,
    friendsResult,
    friendsLoading,
    friendsError,
    handleSearchSubmit,
    setTab,
    applyFilters,
    clearFilters,
    handleSendFriendRequest,
    handleCancelFriendRequest,
  } = search

  const renderFilterSidebar = () => {
    if (tab === 'friends')
      return (
        <FilterFriendsSidebar
          t={t}
          friendFilter={friendFilter}
          setFriendFilter={setFriendFilter}
          applyFilters={applyFilters}
          clearFilters={clearFilters}
        />
      )
    if (tab === 'community')
      return (
        <FilterCommunitySidebar
          t={t}
          communityFilter={communityFilter}
          setCommunityFilter={setCommunityFilter}
          applyFilters={applyFilters}
          clearFilters={clearFilters}
        />
      )
    return (
      <FilterPostsSidebar
        t={t}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        sort={sort}
        setSort={setSort}
        contentType={contentType}
        setContentType={setContentType}
        hasComments={hasComments}
        setHasComments={setHasComments}
        hasLikes={hasLikes}
        setHasLikes={setHasLikes}
        savedOnly={savedOnly}
        setSavedOnly={setSavedOnly}
        applyFilters={applyFilters}
        clearFilters={clearFilters}
      />
    )
  }

  return (
    <main className="max-w-[1440px] mx-auto px-4 lg:px-10 py-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <aside className="hidden md:block md:col-span-3 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)] pr-2">
          {renderFilterSidebar()}
        </aside>

        <div className="md:col-span-6 space-y-6">
          <nav className="flex text-xs text-gray-400 gap-2">
            <Link to={ROUTES.HOME} className="hover:text-primary">
              {t('header.home')}
            </Link>
            <span>/</span>
            <span className="text-gray-200">{t('search.breadcrumb')}</span>
          </nav>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">
              {t('search.resultsFor')}{' '}
              <span className="text-primary">«{q || t('search.emptyQuery')}»</span>
            </h2>
            <div className="flex items-center gap-8 border-b border-border-dark overflow-x-auto">
              <button
                type="button"
                onClick={() => setTab('posts')}
                className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                  tab === 'posts' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t('search.tabPosts')}{' '}
                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px]">
                  {MOCK_POSTS_COUNT}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTab('friends')}
                className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === 'friends' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t('search.tabFriends')}
              </button>
              <button
                type="button"
                onClick={() => setTab('community')}
                className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === 'community' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t('search.tabCommunity')}
              </button>
            </div>
          </div>

          {tab === 'posts' && (
            <SearchResultsPosts t={t} posts={MOCK_POSTS} postsCount={MOCK_POSTS_COUNT} query={q} />
          )}

          {tab === 'friends' && (
            <div className="space-y-4">
              <SearchResultsFriends
                t={t}
                loading={friendsLoading}
                error={friendsError}
                friendsResult={friendsResult}
                handleSendFriendRequest={handleSendFriendRequest}
                handleCancelFriendRequest={handleCancelFriendRequest}
              />
            </div>
          )}

          {tab === 'community' && (
            <div className="bg-card-dark rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-500">groups</span>
              <p className="text-sm text-gray-400 mt-2">{t('search.noCommunities')}</p>
            </div>
          )}
        </div>

        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <SearchRightSidebar
            t={t}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
          />
        </aside>
      </div>

      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setShowMobileFilters((v) => !v)}
          className="bg-primary size-14 rounded-full shadow-2xl flex items-center justify-center text-white"
        >
          <span className="material-symbols-outlined">filter_alt</span>
        </button>
      </div>

      {showMobileFilters && (
        <div className="md:hidden fixed inset-0 z-50 bg-background-dark/90 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">
              {tab === 'friends'
                ? t('search.filterFriendsTitle')
                : tab === 'community'
                  ? t('search.filterCommunityTitle')
                  : t('search.filterPostsTitle')}
            </h2>
            <button
              type="button"
              onClick={() => setShowMobileFilters(false)}
              className="text-gray-400 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          {renderFilterSidebar()}
        </div>
      )}
    </main>
  )
}
