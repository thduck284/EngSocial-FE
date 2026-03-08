import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'

export function MessageThread({
  t,
  selected,
  messages,
  messagesLoading,
  messagesScrollRef,
  messagesEndRef,
  openMessageMenuId,
  setOpenMessageMenuId,
  openReactionPickerId,
  setOpenReactionPickerId,
  messageMenuRef,
  openImageViewer,
  downloadAttachment,
  handleMessageAction,
  handleReaction,
  openReactionDetailMessageId,
  setOpenReactionDetailMessageId,
  setSelectedReactionEmojiInModal,
  showNewMessageBanner,
  setShowNewMessageBanner,
  reactionNotification,
  setReactionNotification,
  scrollToMessage,
  // composer props (spread from api)
  composerProps,
}) {
  const lastReadByThemIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].fromMe && messages[i].read) return i
    }
    return -1
  })()

  const handleOpenReactionDetail = (msg) => {
    if (openReactionDetailMessageId === msg.id) {
      setOpenReactionDetailMessageId(null)
      setSelectedReactionEmojiInModal(null)
    } else {
      setOpenReactionDetailMessageId(msg.id)
      const firstEmoji = (msg.reactions || []).length ? (msg.reactions || [])[0]?.emoji : null
      setSelectedReactionEmojiInModal(firstEmoji || '👍')
    }
  }

  return (
    <>
      <header className="p-4 border-b border-border-dark flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={selected?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selected?.name || '')}&background=13b6ec&color=fff`} alt="" className="w-10 h-10 rounded-full object-cover" />
            {selected?.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background-dark rounded-full" />}
          </div>
          <div>
            <h3 className="font-bold text-base text-white leading-none">{selected?.name}</h3>
            <span className="text-xs text-green-500 font-medium">{selected?.online ? t('messages.online') : ''}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="p-2 rounded-full hover:bg-card-dark text-gray-400 hover:text-white">
            <span className="material-symbols-outlined">call</span>
          </button>
          <button type="button" className="p-2 rounded-full hover:bg-card-dark text-gray-400 hover:text-white">
            <span className="material-symbols-outlined">videocam</span>
          </button>
          <button type="button" className="p-2 rounded-full hover:bg-card-dark text-gray-400 hover:text-white">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </header>

      <div ref={messagesScrollRef} className="flex-1 overflow-y-auto p-6 space-y-[9px] flex flex-col min-h-0 relative">
        <div className="flex justify-center">
          <span className="text-xs text-gray-500 bg-card-dark px-3 py-1 rounded-full uppercase tracking-wider font-semibold">{t('messages.today')}</span>
        </div>
        {messagesLoading ? (
          <div className="flex justify-center py-8">
            <span className="material-symbols-outlined animate-spin text-3xl text-gray-500">progress_activity</span>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">{t('messages.noMessagesYet')}</p>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              selected={selected}
              index={index}
              messages={messages}
              lastReadByThemIndex={lastReadByThemIndex}
              openMessageMenuId={openMessageMenuId}
              setOpenMessageMenuId={setOpenMessageMenuId}
              openReactionPickerId={openReactionPickerId}
              setOpenReactionPickerId={setOpenReactionPickerId}
              messageMenuRef={messageMenuRef}
              openImageViewer={openImageViewer}
              downloadAttachment={downloadAttachment}
              handleMessageAction={handleMessageAction}
              handleReaction={handleReaction}
              onOpenReactionDetail={handleOpenReactionDetail}
              t={t}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {(showNewMessageBanner || reactionNotification) && (
        <div className="flex flex-col items-center gap-2 shrink-0 mb-[10px]">
          {showNewMessageBanner && (
            <button
              type="button"
              onClick={() => {
                setShowNewMessageBanner(false)
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity text-center"
            >
              {t('messages.newMessage')}
            </button>
          )}
          {reactionNotification && (
            <button
              type="button"
              onClick={() => {
                setReactionNotification(null)
                scrollToMessage(reactionNotification.messageId)
              }}
              className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity text-center inline-flex items-center gap-1.5"
            >
              <span>{reactionNotification.userName}</span>
              <span>{reactionNotification.emoji}</span>
              <span>{t('messages.reactedToYourMessage')}</span>
            </button>
          )}
        </div>
      )}

      <MessageComposer {...composerProps} />
    </>
  )
}
