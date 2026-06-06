import { useState, useRef, useEffect } from 'react'
import { ROUTES } from '../../constants'

export function ConversationSidebar({
  t,
  navigate,
  selectedId,
  tab,
  setTab,
  searchConversations,
  setSearchConversations,
  filteredConversations,
  conversationsLoading,
  displayLastMessage,
  friendsSearchResult = [],
  friendsSearchLoading = false,
  onSelectFriendToChat,
  onCreateGroup,
  onViewProfile,
  onOpenMute,
  onOpenDisappearing,
  onDeleteMessages,
  onBlock,
  onReport,
  onLeaveGroup,
}) {
  const [openConvMenuId, setOpenConvMenuId] = useState(null)
  const convMenuRef = useRef(null)

  useEffect(() => {
    if (!openConvMenuId) return
    const handleClickOutside = (e) => {
      if (convMenuRef.current && !convMenuRef.current.contains(e.target)) {
        setOpenConvMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openConvMenuId])

  const showFriendsSection = searchConversations.trim() && (friendsSearchResult.length > 0 || friendsSearchLoading)
  const hasMessages = (c) => c.lastMessageAt != null || (typeof c.lastMessage === 'string' && c.lastMessage.trim() !== '')
  const totalUnread = filteredConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  const totalUnreadGroups = filteredConversations.filter((c) => c.isGroup).reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  const convList = filteredConversations.filter((c) => {
    const passTab = tab === 'all' || (tab === 'unread' && c.unread) || (tab === 'groups' && c.isGroup && c.unread)
    if (!passTab) return false
    const isSelected = c.id === selectedId
    return hasMessages(c) || isSelected
  })

  const closeMenu = () => setOpenConvMenuId(null)

  const tabBtnClass = (active) =>
    active
      ? 'bg-primary text-white'
      : 'bg-white dark:bg-card-dark text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-border-dark hover:bg-primary/10 dark:hover:bg-primary/20'

  const tabBadgeClass = (active) =>
    active
      ? 'bg-white/25 text-white'
      : 'bg-primary/10 text-primary dark:bg-primary/30'

  return (
    <aside className="w-full md:w-[280px] lg:w-[340px] flex-shrink-0 min-h-0 border-r border-slate-200 dark:border-border-dark flex flex-col bg-slate-50 dark:bg-background-dark overflow-hidden">
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('messages.title')}</h2>
          <button
            type="button"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-card-dark text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title={t('messages.newChat')}
          >
            <span className="material-symbols-outlined text-xl">edit_square</span>
          </button>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400 text-sm">search</span>
          <input
            type="text"
            className="w-full bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none"
            placeholder={t('messages.searchConversations')}
            value={searchConversations}
            onChange={(e) => setSearchConversations(e.target.value)}
          />
        </div>
        <div className="flex w-full items-center justify-center gap-2 -mx-3">
          <button
            type="button"
            onClick={() => setTab('all')}
            className={`h-8 min-w-[4.5rem] px-3 rounded-full text-sm font-semibold transition-colors flex items-center justify-center shrink-0 ${tabBtnClass(tab === 'all')}`}
          >
            {t('messages.all')}
          </button>
          <button
            type="button"
            onClick={() => setTab('unread')}
            className={`h-8 min-w-[4.5rem] px-3 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0 overflow-hidden ${totalUnread > 0 ? 'max-w-[5.5rem]' : ''} ${tabBtnClass(tab === 'unread')}`}
          >
            <span className="truncate min-w-0">{t('messages.unread')}</span>
            {totalUnread > 0 && (
              <span className={`min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${tabBadgeClass(tab === 'unread')}`}>
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab('groups')}
            className={`h-8 min-w-[4.5rem] px-3 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0 overflow-hidden ${totalUnreadGroups > 0 ? 'max-w-[5.5rem]' : ''} ${tabBtnClass(tab === 'groups')}`}
          >
            <span className="truncate min-w-0">{t('messages.groups')}</span>
            {totalUnreadGroups > 0 && (
              <span className={`min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${tabBadgeClass(tab === 'groups')}`}>
                {totalUnreadGroups > 99 ? '99+' : totalUnreadGroups}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => onCreateGroup?.()}
            className="h-8 w-8 shrink-0 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-card-dark text-slate-400 dark:text-gray-400 hover:bg-primary/10 hover:text-primary transition-all border border-slate-200 dark:border-white/5 active:scale-90"
            title={t('messages.createGroup')}
            aria-label={t('messages.createGroup')}
          >
            <span className="material-symbols-outlined text-lg">group_add</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 space-y-1 min-h-0">
        {showFriendsSection && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider px-2 py-1.5">
              {t('messages.searchFriends')}
            </p>
            {friendsSearchLoading ? (
              <div className="flex justify-center py-4 text-slate-400 dark:text-gray-500">
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              </div>
            ) : (
              friendsSearchResult.map((friend) => (
                <button
                  key={friend.id}
                  type="button"
                  onClick={() => onSelectFriendToChat?.(friend.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-card-dark transition-colors"
                >
                  <img
                    src={friend.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name || '')}&background=13b6ec&color=fff`}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-slate-900 dark:text-gray-200 truncate">{friend.name || 'User'}</span>
                  <span className="material-symbols-outlined text-lg text-slate-400 dark:text-gray-500 shrink-0">chat</span>
                </button>
              ))
            )}
          </div>
        )}
        {conversationsLoading ? (
          <div className="flex justify-center py-8 text-slate-400 dark:text-gray-500">
            <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
          </div>
        ) : (
          convList.map((conv) => (
              <div
                key={conv.id}
                ref={openConvMenuId === conv.id ? convMenuRef : undefined}
                className={`group/conversation relative flex items-center rounded-xl border-l-4 ${
                  selectedId === conv.id ? 'bg-primary/10 border-primary' : 'border-transparent'
                } ${openConvMenuId === conv.id ? 'z-20' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.MESSAGES_CONVERSATION(conv.id))}
                  className={`flex-1 flex items-center gap-4 p-3 rounded-xl text-left transition-colors min-w-0 ${
                    selectedId === conv.id ? '' : 'hover:bg-slate-100 dark:hover:bg-card-dark'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {conv.isGroup && !conv.avatar ? (
                      <div className="w-12 h-12 rounded-full bg-amber-400/90 flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-people-group text-xl text-slate-900 dark:text-white" aria-hidden />
                      </div>
                    ) : (
                      <img
                        src={conv.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name || '')}&background=13b6ec&color=fff`}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-background-dark rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-1.5 mb-0.5">
                      <span className={`flex items-center gap-1.5 min-w-0 flex-1 ${conv.unread ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-gray-300'}`}>
                        {conv.isGroup && (
                          <i className="fa-solid fa-people-group text-base text-slate-500 dark:text-gray-400 shrink-0" aria-hidden />
                        )}
                        <span className="truncate">{conv.name}</span>
                      </span>
                      <span className="text-xs text-slate-400 dark:text-gray-500 shrink-0">{conv.time || ''}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2 min-w-0">
                      <p className={`text-sm truncate min-w-0 flex-1 ${conv.unread ? 'font-semibold text-slate-700 dark:text-gray-200' : 'text-slate-500 dark:text-gray-500'}`}>
                        {conv.lastMessageFromMe
                          ? `${t('messages.you')}: ${displayLastMessage(conv.lastMessage) || ''}`.trim() || t('messages.noMessagesYet')
                          : (displayLastMessage(conv.lastMessage) || t('messages.noMessagesYet'))}
                      </p>
                      {conv.unread && <span className="w-2 h-2 bg-primary rounded-full shrink-0" />}
                      {!conv.unread && conv.lastMessageFromMe && conv.lastMessageSeen && (
                        <img
                          src={conv.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name || '')}&background=13b6ec&color=fff`}
                          alt=""
                          className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-200 dark:border-border-dark"
                          title={t('messages.seen')}
                        />
                      )}
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setOpenConvMenuId((prev) => (prev === conv.id ? null : conv.id)) }}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-card-dark transition-colors z-10 ${openConvMenuId === conv.id ? 'opacity-100' : 'opacity-0 group-hover/conversation:opacity-100'}`}
                  aria-label={t('messages.options')}
                >
                  <span className="material-symbols-outlined text-xl">more_vert</span>
                </button>
                {openConvMenuId === conv.id && (
                  <div className="absolute right-2 top-full mt-1 py-1 min-w-[200px] rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark shadow-xl z-30">
                    {!conv.isGroup && onViewProfile && (
                      <button type="button" onClick={() => { onViewProfile(conv); closeMenu() }} className="w-full px-4 py-2.5 text-left text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">person</span>
                        {t('messages.viewProfile')}
                      </button>
                    )}
                    {onOpenMute && (
                      <button type="button" onClick={() => { onOpenMute(conv); closeMenu() }} className="w-full px-4 py-2.5 text-left text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">{conv.muted ? 'notifications' : 'notifications_off'}</span>
                        {t('messages.muteNotifications')}
                      </button>
                    )}
                    {onOpenDisappearing && (
                      <button type="button" onClick={() => { onOpenDisappearing(conv); closeMenu() }} className="w-full px-4 py-2.5 text-left text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">timer</span>
                        {t('messages.disappearingMessages')}
                      </button>
                    )}
                    <div className="border-t border-slate-200 dark:border-border-dark my-1" />
                    {onDeleteMessages && (
                      <button type="button" onClick={() => { onDeleteMessages(conv); closeMenu() }} className="w-full px-4 py-2.5 text-left text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">delete</span>
                        {t('messages.deleteAllMessages')}
                      </button>
                    )}
                    {conv.isGroup && onLeaveGroup && (
                      <button type="button" onClick={() => { onLeaveGroup(conv); closeMenu() }} className="w-full px-4 py-2.5 text-left text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">exit_to_app</span>
                        {t('messages.leaveGroup')}
                      </button>
                    )}
                    {!conv.isGroup && onBlock && (
                      <button type="button" onClick={() => { onBlock(conv); closeMenu() }} className="w-full px-4 py-2.5 text-left text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">block</span>
                        {t('messages.block')}
                      </button>
                    )}
                    {onReport && (
                      <button type="button" onClick={() => { onReport(conv); closeMenu() }} className="w-full px-4 py-2.5 text-left text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">flag</span>
                        {t('messages.report')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
        )}
      </div>
    </aside>
  )
}
