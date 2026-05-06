import { useState, useEffect, useCallback } from 'react'
import { conversationService } from '../../services/conversation.service'
import { friendsService } from '../../services/friends.service'

const FORWARD_PAGE_SIZE = 5
const SEARCH_DEBOUNCE_MS = 300

export function ForwardMessageModal({ t, open, onClose, message, currentConversationId, onForward, forwarding }) {
  const [search, setSearch] = useState('')
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [nextOffset, setNextOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadMoreLoading, setLoadMoreLoading] = useState(false)
  const [searchFriends, setSearchFriends] = useState([])
  const [searchConversations, setSearchConversations] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  const loadPage = useCallback((offset, append = false) => {
    const doLoad = append ? setLoadMoreLoading : setLoading
    doLoad(true)
    conversationService
      .getForForward(FORWARD_PAGE_SIZE, offset)
      .then((res) => {
        const rawData = res?.data?.data ?? res?.data ?? []
        const data = rawData.filter((c) => c.id !== currentConversationId)
        const totalVal = res?.data?.total ?? res?.total ?? 0
        const hasMoreVal = res?.data?.hasMore ?? res?.hasMore ?? false
        if (append) setList((prev) => [...prev, ...data])
        else setList(data)
        setTotal(totalVal)
        setHasMore(hasMoreVal)
        setNextOffset(offset + rawData.length)
      })
      .catch(() => {
        if (!append) setList([])
        setHasMore(false)
      })
      .finally(() => {
        doLoad(false)
      })
  }, [currentConversationId])

  useEffect(() => {
    if (open && message) {
      setSearch('')
      setSearchFriends([])
      setSearchConversations([])
      loadPage(0, false)
    }
  }, [open, message, loadPage])

  useEffect(() => {
    if (!open) return
    const q = (search || '').trim()
    if (!q) {
      setSearchFriends([])
      setSearchConversations([])
      return
    }
    const timer = setTimeout(() => {
      setSearchLoading(true)
      Promise.all([
        friendsService.search({ q, limit: 10, friendFilter: 'connected' }),
        conversationService.getList({ q }),
      ])
        .then(([friendsRes, convRes]) => {
          const friends = friendsRes?.data?.data ?? friendsRes?.data ?? []
          const convs = (convRes?.data ?? []).filter((c) => c.id !== currentConversationId)
          setSearchFriends(Array.isArray(friends) ? friends : [])
          setSearchConversations(convs)
        })
        .catch(() => {
          setSearchFriends([])
          setSearchConversations([])
        })
        .finally(() => setSearchLoading(false))
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [open, search, currentConversationId])

  const handleLoadMore = () => {
    if (loadMoreLoading || !hasMore) return
    loadPage(nextOffset, true)
  }

  const handleForward = (conversationId) => {
    if (!conversationId || !message) return
    onForward(conversationId, message)
  }

  const handleSelectFriend = (friend) => {
    if (!friend?.id || !message) return
    conversationService
      .getOrCreateWithUser(friend.id)
      .then((res) => {
        const convId = res?.data?.conversation?.id
        if (convId) onForward(convId, message)
      })
      .catch(() => {})
  }

  if (!open) return null

  const searchActive = (search || '').trim().length > 0
  const showPaginatedList = !searchActive
  const showSearchResults = searchActive

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1e2630] rounded-2xl shadow-2xl w-full max-w-md border border-white/5 flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-200 dark:border-border-dark shrink-0">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('messages.forwardMessageTitle')}</h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 truncate">{t('messages.forwardTo')}</p>
          {message && (
            <div className="mt-3 p-3 rounded-xl bg-card-dark/80 text-sm text-gray-300 line-clamp-2">
              {(message.attachments || []).length > 0 && (
                <span className="text-slate-400 dark:text-gray-500 mr-2">[{message.attachments.length} file]</span>
              )}
              {message.text ? String(message.text).replace(/\[\d+\s*file\]/gi, '').trim() || null : null}
              {!message.text && (!message.attachments || message.attachments.length === 0) && '—'}
            </div>
          )}
          <input
            type="text"
            placeholder={t('messages.forwardSearchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mt-3 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl py-2.5 px-4 text-sm text-slate-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2 min-h-0">
          {showSearchResults && (
            <>
              {searchLoading ? (
                <div className="flex justify-center py-6">
                  <span className="material-symbols-outlined animate-spin text-2xl text-slate-400 dark:text-gray-500">progress_activity</span>
                </div>
              ) : (
                <>
                  {searchFriends.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider px-2 py-1.5">
                        {t('messages.forwardFriendsSection')}
                      </p>
                      <ul className="space-y-0.5">
                        {searchFriends.map((f) => (
                          <li key={f.id || f._id}>
                            <button
                              type="button"
                              onClick={() => handleSelectFriend(f)}
                              disabled={!!forwarding}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-card-dark text-left disabled:opacity-60 transition-colors"
                            >
                              <img
                                src={f.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name || '')}&background=13b6ec&color=fff`}
                                alt=""
                                className="w-12 h-12 rounded-full object-cover shrink-0"
                              />
                              <p className="text-slate-900 dark:text-white font-medium truncate">{f.name || 'User'}</p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {searchConversations.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider px-2 py-1.5">
                        {t('messages.forwardConversationsSection')}
                      </p>
                      <ul className="space-y-0.5">
                        {searchConversations.map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              onClick={() => handleForward(c.id)}
                              disabled={!!forwarding}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-card-dark text-left disabled:opacity-60 transition-colors"
                            >
                              <img
                                src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || '')}&background=13b6ec&color=fff`}
                                alt=""
                                className="w-12 h-12 rounded-full object-cover shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-slate-900 dark:text-white font-medium truncate">{c.name || (c.isGroup ? t('messages.groups') : 'Chat')}</p>
                                {c.isGroup && c.memberCount != null && (
                                  <p className="text-xs text-slate-400 dark:text-gray-500">{c.memberCount} {t('messages.members')}</p>
                                )}
                              </div>
                              {forwarding === c.id && (
                                <span className="material-symbols-outlined animate-spin text-primary text-xl">progress_activity</span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {!searchLoading && searchFriends.length === 0 && searchConversations.length === 0 && (
                    <p className="text-slate-400 dark:text-gray-500 text-sm text-center py-6">{t('messages.noConversationToForward')}</p>
                  )}
                </>
              )}
            </>
          )}
          {showPaginatedList && (
            <>
              {loading ? (
                <div className="flex justify-center py-6">
                  <span className="material-symbols-outlined animate-spin text-2xl text-slate-400 dark:text-gray-500">progress_activity</span>
                </div>
              ) : list.length === 0 ? (
                <p className="text-slate-400 dark:text-gray-500 text-sm text-center py-6">{t('messages.noConversationToForward')}</p>
              ) : (
                <ul className="space-y-0.5">
                  {list.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => handleForward(c.id)}
                        disabled={!!forwarding}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-card-dark text-left disabled:opacity-60 disabled:pointer-events-none transition-colors"
                      >
                        <img
                          src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || '')}&background=13b6ec&color=fff`}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-slate-900 dark:text-white font-medium truncate">{c.name || (c.isGroup ? t('messages.groups') : 'Chat')}</p>
                          {c.isGroup && c.memberCount != null && (
                            <p className="text-xs text-slate-400 dark:text-gray-500">{c.memberCount} {t('messages.members')}</p>
                          )}
                        </div>
                        {forwarding === c.id && (
                          <span className="material-symbols-outlined animate-spin text-primary text-xl">progress_activity</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {showPaginatedList && hasMore && !loading && (
                <div className="pt-2 pb-2">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadMoreLoading}
                    className="w-full py-2.5 rounded-xl bg-white/10 text-slate-900 dark:text-white hover:bg-white/20 text-sm font-medium disabled:opacity-60 transition-colors"
                  >
                    {loadMoreLoading ? (
                      <span className="material-symbols-outlined animate-spin align-middle text-lg">progress_activity</span>
                    ) : (
                      t('messages.loadMore')
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-border-dark shrink-0">
          <button type="button" onClick={onClose} className="w-full py-2.5 rounded-xl bg-white/10 text-slate-900 dark:text-white hover:bg-white/20 text-sm font-medium">
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
