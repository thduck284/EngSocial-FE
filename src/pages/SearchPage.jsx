import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DEFAULT_AVATAR } from '../constants/ui'
import { formatPostTime } from '../utils/dateTime'
import { ROUTES } from '../constants'

const TIME_OPTIONS = ['all', 'today', 'week', 'month']
const SORT_OPTIONS = ['newest', 'oldest', 'relevant', 'engagement', 'comments', 'likes']
const CONTENT_TYPES = [
  { value: 'all', key: 'filterContentAll' },
  { value: 'image', key: 'filterContentWithImage' },
  { value: 'video', key: 'filterContentWithVideo' },
  { value: 'text', key: 'filterContentTextOnly' },
]

export function SearchPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const tab = searchParams.get('tab') || 'posts'

  const [searchInput, setSearchInput] = useState(q)
  useEffect(() => {
    setSearchInput(q)
  }, [q])
  const [timeFilter, setTimeFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('newest')
  const [contentType, setContentType] = useState('all')
  const [hasComments, setHasComments] = useState(false)
  const [hasLikes, setHasLikes] = useState(false)
  const [savedOnly, setSavedOnly] = useState(false)
  const [friendFilter, setFriendFilter] = useState(searchParams.get('friendFilter') || 'all')
  const [communityFilter, setCommunityFilter] = useState(searchParams.get('communityFilter') || 'all')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    if (tab === 'friends') setFriendFilter(searchParams.get('friendFilter') || 'all')
  }, [tab, searchParams])
  useEffect(() => {
    if (tab === 'community') setCommunityFilter(searchParams.get('communityFilter') || 'all')
  }, [tab, searchParams])

  // Mock data for demo (replace with API)
  const postsCount = 128
  const mockPosts = [
    {
      id: '1',
      content: 'Hôm nay mình vừa tổng hợp lại 12 thì trong English Grammar cực kỳ dễ nhớ. Ai cần thì comment bên dưới mình gửi file PDF nhé!',
      author: { name: 'Nguyễn Minh Anh', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKxaDaK-W4YQ__s_tuDtMyEr5qtoiOOeqm0reNHLCZeH2zBlkJ97g3411Xsf3rR5qduKOEXWJCTptIhUGbIga52idwSW5DLqpk5g_UBCmi9EMfT6ZisTW-3AdEWbXSyMV4uEQYJARIiBWpeHH-TtKqbme0BXaG6XkiSHmSqZhe00RKExInHd7mgitvXXpuS2m-8_3m3WDk2JzQdnxuO9AWFXFlJqhFWfT3TLDMzDYw7_evJ2mZPvi3Vof9eGqDpwdON-2zzz4odA' },
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDXIrZaB0Uc9218vvUIVdp7tH9Y2YvtxxHGOMpjB1g6KPVcRB7DAYQ7aVvcVJiNu3_UXSx5pDjN8TL_MKhL7tA0th7p7hQK3gVVP5--QyDJD3QOrp5j2gzAyzPeHM3VxRFnWrMb6GDbdOdp7TCLkgtWyuaILXgb1kaMYCfyQogwcEM0X1tfRmFNv3KzMensvxnqQwBCKwkrotytsywK3inZx1nHwlf-aiAomCdd7b2nR0a1Jmwd_LDq-A77A-Mfw1Yay93gkKxbqA'],
      likeCount: 42,
      commentCount: 12,
      liked: false,
      saved: false,
      groupName: null,
    },
    {
      id: '2',
      content: "Don't forget the importance of Subject-Verb Agreement in English Grammar. Many learners make mistakes here when speaking fast. Let's practice with these 5 sentences...",
      author: { name: 'Mr. Alex Smith', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmqCA0xecH16v9mkb2BdlIOwKXppcGzPC9fEc8nu-dZQ1Y39uQO6812ezX1DEsbZGj4XFg3cHeedDzfZMlUR8wXnGGt4u_CEcEbOKS7I1RUMuvPN3o3i4hNV1UQGOGZVUb7yyJsn_nlnzw4nX0bKQ60QpkUDntVxtRtDTrVGmUsHdhyD1QUp7__s-YhoeqRk-JNNyfx74iu6AHx4733q5XKRGpscCYX7ZDvcarHMDEnAKRRVNdJqYnLKiVohIksEGCqDzQdjTqpg' },
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      images: [],
      likeCount: 128,
      commentCount: 45,
      liked: true,
      saved: true,
      groupName: 'English Master Hub',
    },
  ]

  const handleSearchSubmit = (e) => {
    e?.preventDefault?.()
    const term = (searchInput || '').trim()
    if (term) {
      setSearchParams({ q: term, tab: tab })
    }
  }

  const setTab = (newTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('tab', newTab)
      return next
    })
  }

  const applyFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (tab === 'posts') {
        if (timeFilter !== 'all') next.set('time', timeFilter)
        else next.delete('time')
        next.set('sort', sort)
        if (contentType !== 'all') next.set('contentType', contentType)
        else next.delete('contentType')
        if (dateFrom) next.set('dateFrom', dateFrom)
        else next.delete('dateFrom')
        if (dateTo) next.set('dateTo', dateTo)
        else next.delete('dateTo')
        if (hasComments) next.set('hasComments', '1')
        else next.delete('hasComments')
        if (hasLikes) next.set('hasLikes', '1')
        else next.delete('hasLikes')
        if (savedOnly) next.set('saved', '1')
        else next.delete('saved')
      } else if (tab === 'friends') {
        next.set('friendFilter', friendFilter)
      } else if (tab === 'community') {
        next.set('communityFilter', communityFilter)
      }
      return next
    })
    setShowMobileFilters(false)
  }

  const clearFilters = () => {
    if (tab === 'posts') {
      setTimeFilter('all')
      setDateFrom('')
      setDateTo('')
      setSort('newest')
      setContentType('all')
      setHasComments(false)
      setHasLikes(false)
      setSavedOnly(false)
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        ;['time', 'sort', 'contentType', 'dateFrom', 'dateTo', 'hasComments', 'hasLikes', 'saved'].forEach((k) => next.delete(k))
        return next
      })
    } else if (tab === 'friends') {
      setFriendFilter('all')
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('friendFilter')
        return next
      })
    } else if (tab === 'community') {
      setCommunityFilter('all')
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('communityFilter')
        return next
      })
    }
    setShowMobileFilters(false)
  }

  const FilterPostsSidebar = () => (
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

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('search.sortLabel')}</h3>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full bg-card-dark border border-border-dark rounded-lg text-sm p-2.5 focus:ring-primary outline-none text-white"
        >
          <option value="newest">{t('search.sortNewest')}</option>
          <option value="oldest">{t('search.sortOldest')}</option>
          <option value="relevant">{t('search.sortRelevant')}</option>
          <option value="engagement">{t('search.sortMostEngagement')}</option>
          <option value="comments">{t('search.sortMostComments')}</option>
          <option value="likes">{t('search.sortMostLikes')}</option>
        </select>
      </div>

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
              <span className="text-sm text-gray-300 group-hover:text-primary transition-colors">
                {t(`search.${key}`)}
              </span>
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

  const FRIEND_FILTER_OPTIONS = [
    { value: 'all', key: 'filterFriendsAll' },
    { value: 'connected', key: 'filterFriendsConnected' },
    { value: 'pending', key: 'filterFriendsPending' },
  ]

  const FilterFriendsSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-white">
          <span className="material-symbols-outlined text-primary">filter_list</span>
          {t('search.filterFriendsTitle')}
        </h2>
      </div>
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('search.filterFriendsLabel')}</h3>
        <div className="space-y-2">
          {FRIEND_FILTER_OPTIONS.map(({ value, key }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="friend-filter"
                checked={friendFilter === value}
                onChange={() => setFriendFilter(value)}
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

  const COMMUNITY_FILTER_OPTIONS = [
    { value: 'all', key: 'filterCommunityAll' },
    { value: 'joined', key: 'filterCommunityJoined' },
    { value: 'notJoined', key: 'filterCommunityNotJoined' },
  ]

  const FilterCommunitySidebar = () => (
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

  const renderFilterSidebar = () => {
    if (tab === 'friends') return <FilterFriendsSidebar />
    if (tab === 'community') return <FilterCommunitySidebar />
    return <FilterPostsSidebar />
  }

  return (
    <main className="max-w-[1440px] mx-auto px-4 lg:px-10 py-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Filters (theo tab) */}
        <aside className="hidden md:block md:col-span-3 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)] pr-2">
          {renderFilterSidebar()}
        </aside>

        {/* Main */}
        <div className="md:col-span-6 space-y-6">
          <nav className="flex text-xs text-gray-400 gap-2">
            <Link to={ROUTES.HOME} className="hover:text-primary">{t('header.home')}</Link>
            <span>/</span>
            <span className="text-gray-200">{t('search.breadcrumb')}</span>
          </nav>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">
              {t('search.resultsFor')} <span className="text-primary">«{q || t('search.emptyQuery')}»</span>
            </h2>
            <div className="flex items-center gap-8 border-b border-border-dark overflow-x-auto">
              <button
                type="button"
                onClick={() => setTab('posts')}
                className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                  tab === 'posts' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t('search.tabPosts')} <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px]">{postsCount}</span>
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
            <div className="space-y-4">
              {mockPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-card-dark rounded-xl p-5 border border-transparent hover:border-primary/30 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.author?.avatar || DEFAULT_AVATAR}
                        alt=""
                        className="size-10 rounded-full bg-slate-800 object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-white">{post.author?.name}</h4>
                        <p className="text-xs text-gray-400">
                          {formatPostTime(post.createdAt)}
                          {post.groupName && (
                            <> • <span className="text-primary">{post.groupName}</span></>
                          )}
                        </p>
                      </div>
                    </div>
                    <button type="button" className="text-gray-400 hover:text-primary">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">
                      {post.content.split(q).length > 1 ? (
                        <>
                          {post.content.split(q).map((part, i) => (
                            <span key={i}>
                              {part}
                              {i < post.content.split(q).length - 1 && <span className="text-primary font-bold">{q}</span>}
                            </span>
                          ))}
                        </>
                      ) : (
                        post.content
                      )}
                    </p>
                    {post.images?.length > 0 && (
                      <div className="rounded-lg overflow-hidden border border-border-dark h-48 sm:h-64">
                        <img src={post.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-border-dark/50 text-gray-400">
                    <div className="flex items-center gap-4">
                      <button type="button" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <span className={`material-symbols-outlined text-[20px] ${post.liked ? 'fill-current text-primary' : ''}`}>thumb_up</span>
                        <span className="text-xs font-medium">{post.likeCount}</span>
                      </button>
                      <button type="button" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                        <span className="text-xs font-medium">{post.commentCount}</span>
                      </button>
                      <button type="button" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">share</span>
                      </button>
                    </div>
                    <button type="button" className={post.saved ? 'text-primary' : 'hover:text-primary transition-colors'}>
                      <span className={`material-symbols-outlined text-[20px] ${post.saved ? 'fill-current' : ''}`}>bookmark</span>
                    </button>
                  </div>
                </article>
              ))}
              <button
                type="button"
                className="w-full py-3 rounded-xl border-2 border-dashed border-border-dark text-gray-400 hover:border-primary hover:text-primary transition-all font-medium text-sm"
              >
                {t('search.loadMorePosts')}
              </button>
            </div>
          )}

          {tab === 'friends' && (
            <div className="bg-card-dark rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-500">person_search</span>
              <p className="text-sm text-gray-400 mt-2">{t('search.noFriends')}</p>
            </div>
          )}

          {tab === 'community' && (
            <div className="bg-card-dark rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-500">groups</span>
              <p className="text-sm text-gray-400 mt-2">{t('search.noCommunities')}</p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary">search</span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              className="w-full bg-card-dark border border-border-dark rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none transition-all text-white placeholder-gray-500"
              placeholder={t('dashboard.quickSearch')}
            />
          </div>

          <div className="bg-card-dark rounded-xl p-4 border border-border-dark space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center justify-between">
              {t('dashboard.friendSuggestions')}
              <Link to={ROUTES.FRIENDS} className="text-[10px] text-primary hover:underline">{t('dashboard.viewAllSuggestions')}</Link>
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Lê Văn Toàn', mutual: '20', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCldQOiPBO2XRI1G-vo2dXBcEacJCgNEvRIVPfa_cclIiHEoQSneo-vqpqK5sqfCkbQKEoxVN2agzbIt73Zo-n935gKyFJH322-RUF-KL7vudqa7DsI9gQB4740540KrWeteC0p3Pmw76wCF-PFme-ameKh-AMBxNk4-T0gk7JNmJR6b1R_fa49Ev9fko_JRmDhH_FQaeFKhKXHzH1co20leN3YGOxN3VqhRtSapmWOXxRMiKFvTZ67xZu1vIkZW2Zo26FbZ7QJ4w' },
                { name: 'Trần Thu Hà', mutual: '12', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbvZ3ORh_ow4NCm9Y8N22dqFZyrB0GmBJnlOwNWMJKbNxemN3ADQPGVCJUJUL9CC5hcNX2pBjkO1BJ2yv04wF0hh_xT10JrARRbNz9J-0z9J259qAIuVVnmvKXhObjXFunqVC25KKSkWKxBRmJFgYxRM-Mw79lLzTcUo-lIjxkxoU89R3iV7pAeVBKHKJaDK-XRW50EbOQoIhH40yffhXXKW_TP46CyLNeWyj5euJQKZDOj54u5-rGSviS95zoA86VvEt3h7WnkQ' },
                { name: 'Hoàng Linh', mutual: '5', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADVF8tXiRk5hbit9fIuuP3EeunW6Fh-8oAyoo2jxg1AE9OrPro0UrL8N0415hv46MRQmRFeOCXQznl539pYXtoyA-6KTrvOFQIQDakiY4E4UmAJ3AWZQMX2koP4LkCpyafCQD7KXoZJ72fxKzvL0R8IQBQOtuwOxlj8GGllbefE5ER04YVBgmCoTwoAhwTecEnS-tGM3hQZGQeS5WLckUKu0bI5cTj8gtfxdqzPiysl4bptxuiTewwnyZBmRcmj_dJffsRJtrhiw' },
              ].map((f) => (
                <div key={f.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={f.avatar} alt="" className="size-8 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-bold text-white">{f.name}</p>
                      <p className="text-[10px] text-gray-400">{f.mutual} {t('dashboard.mutualFriends')}</p>
                    </div>
                  </div>
                  <button type="button" className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-base">person_add</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card-dark rounded-xl p-4 border border-border-dark space-y-4">
            <h3 className="font-bold text-sm text-white">{t('dashboard.studyGroups')}</h3>
            <div className="space-y-3">
              {[
                { title: 'IELTS 8.0+ Mastery', members: '24.5k thành viên', color: 'from-primary to-blue-600' },
                { title: 'English for Beginners', members: '82k thành viên', color: 'from-indigo-500 to-purple-600' },
              ].map((g) => (
                <div key={g.title} className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-dark/50 transition-colors cursor-pointer border border-border-dark/30">
                  <div className={`size-10 bg-gradient-to-br ${g.color} rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-inner`}>
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
              {[
                { rank: 1, name: 'Bảo Trâm', xp: '12,450 XP', color: 'text-yellow-500' },
                { rank: 2, name: 'Quốc Cường', xp: '10,820 XP', color: 'text-gray-400' },
                { rank: 3, name: 'Minh Tuấn', xp: '9,100 XP', color: 'text-orange-400' },
              ].map((r) => (
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
        </aside>
      </div>

      {/* Mobile filter button */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setShowMobileFilters((v) => !v)}
          className="bg-primary size-14 rounded-full shadow-2xl flex items-center justify-center text-white"
        >
          <span className="material-symbols-outlined">filter_alt</span>
        </button>
      </div>

      {/* Mobile filter panel */}
      {showMobileFilters && (
        <div className="md:hidden fixed inset-0 z-50 bg-background-dark/90 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">
              {tab === 'friends' ? t('search.filterFriendsTitle') : tab === 'community' ? t('search.filterCommunityTitle') : t('search.filterPostsTitle')}
            </h2>
            <button type="button" onClick={() => setShowMobileFilters(false)} className="text-gray-400 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          {renderFilterSidebar()}
        </div>
      )}
    </main>
  )
}
