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
}) {
  const showFriendsSection = searchConversations.trim() && (friendsSearchResult.length > 0 || friendsSearchLoading)
  const hasMessages = (c) => c.lastMessageAt != null || (typeof c.lastMessage === 'string' && c.lastMessage.trim() !== '')
  const convList = filteredConversations.filter((c) => {
    const passTab = tab === 'all' || (tab === 'unread' && c.unread) || (tab === 'groups' && c.isGroup)
    if (!passTab) return false
    const isSelected = c.id === selectedId
    return hasMessages(c) || isSelected
  })

  return (
    <aside className="w-full md:w-[280px] lg:w-[340px] flex-shrink-0 min-h-0 border-r border-border-dark flex flex-col bg-background-dark">
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{t('messages.title')}</h2>
          <button
            type="button"
            className="p-1.5 rounded-lg hover:bg-card-dark text-gray-400 hover:text-white transition-colors"
            title={t('messages.newChat')}
          >
            <span className="material-symbols-outlined text-xl">edit_square</span>
          </button>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
          <input
            type="text"
            className="w-full bg-card-dark border border-border-dark rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none"
            placeholder={t('messages.searchConversations')}
            value={searchConversations}
            onChange={(e) => setSearchConversations(e.target.value)}
          />
        </div>
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={() => setTab('all')}
            className={`h-8 min-w-[4.5rem] px-4 rounded-full text-sm font-semibold transition-colors flex items-center justify-center shrink-0 ${tab === 'all' ? 'bg-primary text-background-dark' : 'bg-card-dark text-gray-400 hover:bg-primary/20'}`}
          >
            {t('messages.all')}
          </button>
          <button
            type="button"
            onClick={() => setTab('unread')}
            className={`h-8 min-w-[4.5rem] px-4 rounded-full text-sm font-semibold transition-colors flex items-center justify-center shrink-0 ${tab === 'unread' ? 'bg-primary text-background-dark' : 'bg-card-dark text-gray-400 hover:bg-primary/20'}`}
          >
            {t('messages.unread')}
          </button>
          <button
            type="button"
            onClick={() => setTab('groups')}
            className={`h-8 min-w-[4.5rem] px-4 rounded-full text-sm font-semibold transition-colors flex items-center justify-center shrink-0 ${tab === 'groups' ? 'bg-primary text-background-dark' : 'bg-card-dark text-gray-400 hover:bg-primary/20'}`}
          >
            {t('messages.groups')}
          </button>
          <button
            type="button"
            onClick={() => onCreateGroup?.()}
            className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center bg-card-dark text-gray-400 hover:bg-primary/20 hover:text-primary transition-colors"
            title={t('messages.createGroup')}
            aria-label={t('messages.createGroup')}
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 space-y-1 min-h-0">
        {showFriendsSection && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1.5">
              {t('messages.searchFriends')}
            </p>
            {friendsSearchLoading ? (
              <div className="flex justify-center py-4 text-gray-500">
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              </div>
            ) : (
              friendsSearchResult.map((friend) => (
                <button
                  key={friend.id}
                  type="button"
                  onClick={() => onSelectFriendToChat?.(friend.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-card-dark transition-colors"
                >
                  <img
                    src={friend.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name || '')}&background=13b6ec&color=fff`}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-200 truncate">{friend.name || 'User'}</span>
                  <span className="material-symbols-outlined text-lg text-gray-500 shrink-0">chat</span>
                </button>
              ))
            )}
          </div>
        )}
        {conversationsLoading ? (
          <div className="flex justify-center py-8 text-gray-500">
            <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
          </div>
        ) : (
          convList.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => navigate(ROUTES.MESSAGES_CONVERSATION(conv.id))}
                className={`w-full flex items-center gap-4 p-3 rounded-xl text-left transition-colors ${
                  selectedId === conv.id ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-card-dark border-l-4 border-transparent'
                }`}
              >
                <div className="relative flex-shrink-0">
                  {conv.isGroup && !conv.avatar ? (
                    <div className="w-12 h-12 rounded-full bg-amber-400/90 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-people-group text-xl text-white" aria-hidden />
                    </div>
                  ) : (
                    <img
                      src={conv.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name || '')}&background=13b6ec&color=fff`}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background-dark rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-1.5 mb-0.5">
                    <span className={`flex items-center gap-1.5 min-w-0 flex-1 ${conv.unread ? 'font-bold text-white' : 'font-medium text-gray-300'}`}>
                      {conv.isGroup && (
                        <i className="fa-solid fa-people-group text-base text-gray-400 shrink-0" aria-hidden />
                      )}
                      <span className="truncate">{conv.name}</span>
                    </span>
                    <span className="text-xs text-gray-500 shrink-0">{conv.time || ''}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2 min-w-0">
                    <p className={`text-sm truncate min-w-0 flex-1 ${conv.unread ? 'font-semibold text-gray-200' : 'text-gray-500'}`}>
                      {conv.lastMessageFromMe
                        ? `${t('messages.you')}: ${displayLastMessage(conv.lastMessage) || ''}`.trim() || t('messages.noMessagesYet')
                        : (displayLastMessage(conv.lastMessage) || t('messages.noMessagesYet'))}
                    </p>
                    {conv.unread && <span className="w-2 h-2 bg-primary rounded-full shrink-0" />}
                    {!conv.unread && conv.lastMessageFromMe && conv.lastMessageSeen && (
                      <img
                        src={conv.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name || '')}&background=13b6ec&color=fff`}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover shrink-0 border border-border-dark"
                        title={t('messages.seen')}
                      />
                    )}
                  </div>
                </div>
              </button>
            ))
        )}
      </div>
    </aside>
  )
}
