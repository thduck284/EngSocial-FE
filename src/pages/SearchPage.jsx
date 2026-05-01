import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../constants'
import { useSearchPage } from '../hooks/useSearchPage'
import {
  FilterPostsSidebar,
  FilterFriendsSidebar,
  FilterCommunitySidebar,
  SearchResultsFriends,
  SearchResultsPosts,
  SearchResultsCommunity,
  SearchRightSidebar,
} from '../components/search'
import { useAuth } from '../context/AuthContext'
import { useDashboardData, useDashboardFriends, useDashboardSocket, useStudyGroups } from '../hooks'
import { DashboardRightSidebar } from '../components/dashboard/DashboardRightSidebar'

export function SearchPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const search = useSearchPage()

  const [onlineUserIds, setOnlineUserIds] = useState(new Set())
  const studyGroups = useStudyGroups(setOnlineUserIds)
  const friends = useDashboardFriends(onlineUserIds, setOnlineUserIds, studyGroups.allConversations)
  useDashboardSocket(user, studyGroups.setConversations, friends.setOnlineFriends, setOnlineUserIds)

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
    friendsPagination,
    handleSearchSubmit,
    setTab,
    applyFilters,
    clearFilters,
    handleSendFriendRequest,
    handleCancelFriendRequest,
    postsResult,
    filteredPosts,
    postsLoading,
    postsError,
    postsPagination,
    communityResults,
    communityLoading,
    communityError,
    communityPagination,
  } = search

  const postsCount =
    postsPagination?.total ?? filteredPosts.length ?? postsResult.length

  // Reuse dashboard hooks so right sidebar (Friend suggestions, Study groups, Weekly leaderboard)
  // looks exactly like home.
  const {
    weeklyLeaderboard,
    weeklyLeaderboardLoading,
  } = useDashboardData()

  const {
    friendsFilterTab: dashFriendsFilterTab,
    setFriendsFilterTab: setDashFriendsFilterTab,
    friendTab,
    setFriendTab,
    suggestionsList,
    sentRequestsList,
    receivedRequestsList,
    friendTabLoading,
    loadFriendTabData,
    displayedFriendsList,
    friendSelectOpen,
    setFriendSelectOpen,
    friendSelectRef,
  } = friends
  const friendsCount = friendsPagination?.total ?? friendsResult.length
  const communityCount = communityPagination?.total ?? communityResults.length

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
    <main className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-2 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <aside className="hidden md:block md:col-span-3 pr-2 md:sticky md:top-4 self-start max-h-[calc(100vh-64px)] overflow-y-auto space-y-8 no-scrollbar">
          {renderFilterSidebar()}
        </aside>

        <div className="md:col-span-6 space-y-8">
          <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500">
            <Link to={ROUTES.HOME} className="hover:text-primary transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">home</span>
              {t('header.home')}
            </Link>
            <span className="text-slate-300 dark:text-gray-700">/</span>
            <span className="text-slate-900 dark:text-gray-200">{t('search.breadcrumb')}</span>
          </nav>

          <div className="space-y-6">
            <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark p-8 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
               <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight relative z-10">
                {t('search.resultsFor')}{' '}
                <span className="text-primary italic">«{q || t('search.emptyQuery')}»</span>
              </h2>
            </div>

            <div className="flex items-center gap-10 border-b border-slate-100 dark:border-border-dark overflow-x-auto no-scrollbar px-2">
              <button
                type="button"
                onClick={() => setTab('posts')}
                className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all whitespace-nowrap relative group/tab ${
                  tab === 'posts' ? 'text-primary' : 'text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'
                }`}
              >
                {t('search.tabPosts')}
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black transition-colors ${tab === 'posts' ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-600 group-hover/tab:bg-slate-200 dark:group-hover/tab:bg-white/10'}`}>
                  {postsCount}
                </span>
                {tab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_-4px_10px_rgba(19,182,236,0.5)]" />}
              </button>
              <button
                type="button"
                onClick={() => setTab('friends')}
                className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all whitespace-nowrap relative group/tab ${
                  tab === 'friends' ? 'text-primary' : 'text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'
                }`}
              >
                {t('search.tabFriends')}
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black transition-colors ${tab === 'friends' ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-600 group-hover/tab:bg-slate-200 dark:group-hover/tab:bg-white/10'}`}>
                  {friendsCount}
                </span>
                {tab === 'friends' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_-4px_10px_rgba(19,182,236,0.5)]" />}
              </button>
              <button
                type="button"
                onClick={() => setTab('community')}
                className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all whitespace-nowrap relative group/tab ${
                  tab === 'community' ? 'text-primary' : 'text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'
                }`}
              >
                {t('search.tabCommunity')}
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black transition-colors ${tab === 'community' ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-600 group-hover/tab:bg-slate-200 dark:group-hover/tab:bg-white/10'}`}>
                  {communityCount}
                </span>
                {tab === 'community' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_-4px_10px_rgba(19,182,236,0.5)]" />}
              </button>
            </div>
          </div>


          {tab === 'posts' && (
            <SearchResultsPosts
              t={t}
              posts={filteredPosts}
              postsCount={postsCount}
              query={q}
              loading={postsLoading}
              error={postsError}
            />
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
            <SearchResultsCommunity
              t={t}
              loading={communityLoading}
              error={communityError}
              groups={communityResults}
              query={q}
            />
          )}
        </div>

        <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-4 self-start max-h-[calc(100vh-64px)] overflow-y-auto space-y-6">
          <DashboardRightSidebar
            friendSelectRef={friendSelectRef}
            friendSelectOpen={friendSelectOpen}
            setFriendSelectOpen={setFriendSelectOpen}
            friendTab={friendTab}
            setFriendTab={setFriendTab}
            friendTabLoading={friendTabLoading}
            suggestionsList={suggestionsList}
            sentRequestsList={sentRequestsList}
            receivedRequestsList={receivedRequestsList}
            loadFriendTabData={loadFriendTabData}
            friendsFilterTab={dashFriendsFilterTab}
            setFriendsFilterTab={setDashFriendsFilterTab}
            displayedFriendsList={displayedFriendsList}
            onlineUserIds={onlineUserIds}
            weeklyLeaderboard={weeklyLeaderboard}
            weeklyLeaderboardLoading={weeklyLeaderboardLoading}
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
