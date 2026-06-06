import { TextWithLinks } from './TextWithLinks'
import { MessageLinkPreview } from './MessageLinkPreview'
import { extractFirstUrl } from '../../utils/messages'
import { MESSAGE_REACTION_EMOJIS } from '../../constants'

export function MessageBubble({
  msg,
  selected,
  index,
  messages,
  lastReadByThemIndex,
  lastReadByMembers,
  openMessageMenuId,
  setOpenMessageMenuId,
  openReactionPickerId,
  setOpenReactionPickerId,
  messageMenuRef,
  openImageViewer,
  downloadAttachment,
  handleMessageAction,
  handleReaction,
  onOpenReactionDetail,
  t,
}) {
  const isMenuOpen = openMessageMenuId === msg.id
  const showTheirAvatar = !msg.fromMe && (index === 0 || messages[index - 1].fromMe)

  if (msg.isSystem) {
    return (
      <div className="flex justify-center py-2 w-full" data-message-id={msg.id}>
        <span className="text-xs text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-card-dark/60 px-3 py-1.5 rounded-full max-w-[90%] text-center border border-slate-200 dark:border-transparent">
          {msg.text}
        </span>
      </div>
    )
  }

  const byEmoji = (msg.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1
    return acc
  }, {})
  const totalCount = (msg.reactions || []).length
  const emojiList = Object.keys(byEmoji)
  const messageText = msg.text ? String(msg.text).replace(/\[\d+\s*file\]/gi, '').trim() : ''
  const previewUrl = extractFirstUrl(messageText)
  const isUrlOnlyMessage =
    previewUrl &&
    messageText.replace(previewUrl, '').trim() === '' &&
    (msg.attachments || []).length === 0

  return (
    <div
      data-message-id={msg.id}
      ref={isMenuOpen ? messageMenuRef : undefined}
      className={`group flex items-start gap-2 w-full max-w-[85%] ${msg.fromMe ? 'self-end flex-row-reverse' : ''}`}
    >
      {!msg.fromMe && (
        <div className="w-8 shrink-0 flex justify-center mt-1">
          {showTheirAvatar ? (
            <img
              src={selected?.avatar || 'https://ui-avatars.com/api/?name=User&background=13b6ec&color=fff'}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : null}
        </div>
      )}
      <div className={`flex flex-col gap-0.5 min-w-0 flex-1 ${msg.fromMe ? 'items-end' : ''}`}>
        <div className={`flex flex-col gap-0.5 w-fit max-w-[80%] ${msg.fromMe ? 'items-end' : ''}`}>
          <div className={`flex items-center gap-0.5 w-fit ${msg.fromMe ? 'flex-row-reverse' : ''}`}>
            <div className="relative">
              <div className={`flex flex-col gap-0.5 w-fit shrink-0 ${msg.fromMe ? 'items-start' : 'items-end'}`}>
                <div
                  className={`rounded-2xl text-sm leading-relaxed w-fit max-w-full break-words whitespace-pre-wrap ${
                    isUrlOnlyMessage ? 'p-2' : 'p-4'
                  } ${
                    msg.fromMe
                      ? 'bg-primary dark:bg-[#333C4E] text-white font-medium rounded-br-none shadow-sm'
                      : 'bg-white dark:bg-card-dark text-slate-900 dark:text-white border border-slate-200 dark:border-transparent rounded-bl-none shadow-sm'
                  }`}
                >
                  {(msg.attachments || []).length > 0 && (
                    <div className="space-y-2 mb-2">
                      {(msg.attachments || []).map((att, idx) => (
                        <div key={att.url + idx}>
                          {att.type?.startsWith('image/') ? (
                            <div className="rounded-lg overflow-hidden max-w-[240px] max-h-[200px]">
                              <button type="button" onClick={() => openImageViewer(att.url, msg.id)} className="block w-full h-full cursor-pointer">
                                <img src={att.url} alt={att.name || ''} className="object-cover w-full h-full" />
                              </button>
                            </div>
                          ) : att.type?.startsWith('video/') ? (
                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden max-w-[240px]">
                              <video src={att.url} controls className="max-h-[200px] w-full" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => downloadAttachment(att.url, att.name || 'file')}
                              className="flex items-center gap-2 text-inherit underline opacity-90 hover:opacity-100 text-left"
                            >
                              <span className="material-symbols-outlined text-lg">attach_file</span>
                              <span className="truncate">{att.name || 'File'}</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {!isUrlOnlyMessage && messageText ? (
                    <TextWithLinks text={messageText} fromMe={msg.fromMe} />
                  ) : null}
                  {previewUrl ? <MessageLinkPreview url={previewUrl} fromMe={msg.fromMe} /> : null}
                </div>
              </div>
              {(msg.reactions || []).length > 0 && (
                <div className={`absolute z-10 bottom-0 translate-y-3/4 max-w-[33.333%] ${msg.fromMe ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'}`}>
                  <button
                    type="button"
                    onClick={() => onOpenReactionDetail && onOpenReactionDetail(msg)}
                    className={`flex items-center gap-0.5 py-0.5 px-1.5 rounded-full bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer shadow-sm min-w-0 max-w-full ${msg.fromMe ? 'flex-row' : 'flex-row-reverse'}`}
                    title={t('messages.whoReacted')}
                  >
                    {msg.fromMe && <span className="text-xs font-medium text-slate-600 dark:text-gray-300 min-w-[1ch]">{totalCount}</span>}
                    <div className="flex items-center -space-x-2">
                      {emojiList.map((emoji) => (
                        <span key={emoji} className="w-6 h-6 rounded-full bg-slate-50 dark:bg-background-dark border-2 border-slate-200 dark:border-border-dark flex items-center justify-center text-sm flex-shrink-0">
                          {emoji}
                        </span>
                      ))}
                    </div>
                    {!msg.fromMe && <span className="text-xs font-medium text-slate-600 dark:text-gray-300 min-w-[1ch]">{totalCount}</span>}
                  </button>
                </div>
              )}
            </div>
            <div className={`flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${isMenuOpen || openReactionPickerId === msg.id ? 'opacity-100' : ''}`}>
              {msg.fromMe ? (
                <>
                  <div className="relative">
                    <button type="button" onClick={() => setOpenMessageMenuId(isMenuOpen ? null : msg.id)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors" title={t('messages.moreOptions')}>
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                    {isMenuOpen && (
                      <div className="absolute top-full mt-0.5 py-1 min-w-[180px] bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-xl z-20 right-0">
                        <button type="button" onClick={() => handleMessageAction('deleteForMe', msg)} className="w-full px-4 py-2 text-left text-sm text-slate-900 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">delete_outline</span>
                          {t('messages.deleteForMe')}
                        </button>
                        {!msg.read && (
                          <button type="button" onClick={() => handleMessageAction('deleteForBoth', msg)} className="w-full px-4 py-2 text-left text-sm text-slate-900 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">delete_forever</span>
                            {t('messages.deleteForBoth')}
                          </button>
                        )}
                        {!msg.read && (
                          <button type="button" onClick={() => handleMessageAction('edit', msg)} className="w-full px-4 py-2 text-left text-sm text-slate-900 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">edit</span>
                            {t('messages.edit')}
                          </button>
                        )}
                        <button type="button" onClick={() => handleMessageAction('forward', msg)} className="w-full px-4 py-2 text-left text-sm text-slate-900 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">forward</span>
                          {t('messages.forward')}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button type="button" onClick={() => setOpenReactionPickerId(openReactionPickerId === msg.id ? null : msg.id)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors" title={t('messages.messageReaction')}>
                      <span className="material-symbols-outlined text-lg">mood</span>
                    </button>
                    {openReactionPickerId === msg.id && (
                      <div className="absolute bottom-full right-0 mb-1 py-1.5 px-2 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark shadow-xl z-20 flex items-center gap-0.5">
                        {MESSAGE_REACTION_EMOJIS.map((emoji) => (
                          <button key={emoji} type="button" onClick={() => handleReaction(msg, emoji)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xl">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <button type="button" onClick={() => setOpenReactionPickerId(openReactionPickerId === msg.id ? null : msg.id)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors" title={t('messages.messageReaction')}>
                      <span className="material-symbols-outlined text-lg">mood</span>
                    </button>
                    {openReactionPickerId === msg.id && (
                      <div className="absolute bottom-full left-0 mb-1 py-1.5 px-2 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark shadow-xl z-20 flex items-center gap-0.5">
                        {MESSAGE_REACTION_EMOJIS.map((emoji) => (
                          <button key={emoji} type="button" onClick={() => handleReaction(msg, emoji)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xl">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button type="button" onClick={() => setOpenMessageMenuId(isMenuOpen ? null : msg.id)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors" title={t('messages.moreOptions')}>
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                    {isMenuOpen && (
                      <div className="absolute top-full mt-0.5 py-1 min-w-[180px] bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-xl z-20 left-0">
                        <button type="button" onClick={() => handleMessageAction('deleteForMe', msg)} className="w-full px-4 py-2 text-left text-sm text-slate-900 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">delete_outline</span>
                          {t('messages.deleteForMe')}
                        </button>
                        <button type="button" onClick={() => handleMessageAction('forward', msg)} className="w-full px-4 py-2 text-left text-sm text-slate-900 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">forward</span>
                          {t('messages.forward')}
                        </button>
                        <button type="button" onClick={() => handleMessageAction('report', msg)} className="w-full px-4 py-2 text-left text-sm text-slate-900 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">flag</span>
                          {t('messages.report')}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className={`flex items-center gap-2 min-h-0 w-fit max-w-full ${msg.fromMe ? 'flex-row justify-end' : 'flex-row-reverse justify-start'}`}>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 dark:text-gray-500">{msg.time}</span>
                {msg.fromMe && (
                  <span className={`material-symbols-outlined text-[12px] ${msg.fromMe ? 'text-white/90' : 'text-slate-400 dark:text-gray-500'} ${msg.read ? 'fill' : ''}`} title={msg.read ? t('messages.read') : t('messages.sent')}>
                    {msg.read ? 'done_all' : 'done'}
                  </span>
                )}
              </div>
              {index === lastReadByThemIndex && msg.fromMe && !lastReadByMembers && (
                <img
                  src={selected?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selected?.name || '')}&background=13b6ec&color=fff`}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-border-dark"
                  title={t('messages.seen')}
                />
              )}
              {Array.isArray(lastReadByMembers) && lastReadByMembers.length > 0 && (
                <div className="flex items-center gap-0.5 -space-x-1.5 flex-wrap justify-end max-w-[80px]" title={t('messages.seen')}>
                  {lastReadByMembers.map((m) => (
                    <img
                      key={m.userId}
                      src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || '')}&background=13b6ec&color=fff`}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-border-dark shrink-0"
                      title={m.name || ''}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
