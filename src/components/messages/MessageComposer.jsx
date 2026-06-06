export function MessageComposer({
  t,
  inputText,
  setInputText,
  selectedFiles,
  setSelectedFiles,
  sendLoading,
  handleSend,
  handleKeyDown,
  textareaRef,
  fileInputRef,
  imageInputRef,
  videoInputRef,
  addFilesToSend,
  showEmojiPicker,
  setShowEmojiPicker,
  emojiCategoryId,
  setEmojiCategoryId,
  emojiCategories,
  currentEmojis,
  insertEmoji,
  emojiPickerRef,
  showGifPicker,
  setShowGifPicker,
  gifPickerRef,
  gifQuery,
  setGifQuery,
  gifResults,
  gifLoading,
  hasGiphyKey,
  searchGiphy,
  sendGif,
  selectedId,
  editingMessage = null,
  cancelEditMessage,
  onRemoveEditingAttachment,
}) {
  const hasContent = inputText.trim() || selectedFiles.length > 0 || (editingMessage?.attachments?.length > 0)
  return (
    <>
      {/* Input file ẩn được render ở MessagesPage để ref gắn đúng; nút bấm gọi fileInputRef.current?.click() */}
      <footer className="px-4 py-2 border-t border-slate-200 dark:border-border-dark shrink-0">
        {editingMessage && (
          <div className="flex items-center justify-between gap-2 mb-2 py-1.5 px-2 rounded-lg bg-primary/10 border border-primary/30 text-sm text-slate-700 dark:text-gray-200">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-lg text-primary">edit</span>
              {t('messages.editingMessage')}
              {editingMessage.attachments?.length > 0 && (
                <span className="text-xs text-slate-400 dark:text-gray-500">
                  ({editingMessage.attachments.length} {t('messages.attachment')})
                </span>
              )}
            </span>
            <button type="button" onClick={cancelEditMessage} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white" title={t('common.cancel') || 'Hủy'}>
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}
        <div className="bg-white dark:bg-card-dark rounded-xl py-1.5 px-2 flex flex-col gap-1 border border-slate-200 dark:border-border-dark">
          {(selectedFiles.length > 0 || editingMessage?.attachments?.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-gray-400 px-1">
              {selectedFiles.map((f, i) => (
                <span key={`${f.name}-${i}`} className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded px-2 py-1 max-w-[180px]">
                  <span className="truncate" title={f.name}>{f.name}</span>
                  <button type="button" onClick={() => setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i))} className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-red-500 dark:text-red-400 shrink-0" title={t('common.remove') || 'Xóa'}>
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </span>
              ))}
              {editingMessage?.attachments?.map((att, i) => (
                <span key={`edit-att-${i}`} className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded px-2 py-1 max-w-[180px] text-slate-600 dark:text-gray-400">
                  {att.type?.startsWith('image/') ? <span className="material-symbols-outlined text-sm">image</span> : att.type?.startsWith('video/') ? <span className="material-symbols-outlined text-sm">videocam</span> : <span className="material-symbols-outlined text-sm">attach_file</span>}
                  <span className="truncate" title={att.name || att.url}>{att.name || (att.type?.startsWith('image/') ? t('messages.image') : att.type?.startsWith('video/') ? t('messages.video') : 'File')}</span>
                  {onRemoveEditingAttachment && (
                    <button type="button" onClick={() => onRemoveEditingAttachment(i)} className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-red-500 dark:text-red-400 shrink-0" title={t('common.remove') || 'Xóa'}>
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 shrink-0">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-border-dark/50 text-slate-500 dark:text-gray-400 transition-colors flex items-center justify-center" title={t('messages.attachFile')}>
                <span className="material-symbols-outlined text-lg">attach_file</span>
              </button>
              <button type="button" onClick={() => imageInputRef.current?.click()} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-border-dark/50 text-slate-500 dark:text-gray-400 transition-colors flex items-center justify-center" title={t('messages.attachImage')}>
                <span className="material-symbols-outlined text-lg">image</span>
              </button>
              <button type="button" onClick={() => videoInputRef.current?.click()} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-border-dark/50 text-slate-500 dark:text-gray-400 transition-colors flex items-center justify-center" title={t('messages.attachVideo')}>
                <span className="material-symbols-outlined text-lg">videocam</span>
              </button>
              <div ref={gifPickerRef} className="relative overflow-visible">
                <button type="button" onClick={() => { setShowEmojiPicker(false); setShowGifPicker((v) => !v) }} className={`p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-border-dark/50 text-slate-500 dark:text-gray-400 transition-colors flex items-center justify-center ${showGifPicker ? 'bg-slate-100 dark:bg-border-dark/50' : ''}`} title={t('messages.attachGif')}>
                  <span className="material-symbols-outlined text-lg">gif_box</span>
                </button>
                {showGifPicker && (
                  <div className="absolute bottom-full left-0 mb-1 z-50 min-w-[340px] w-[400px] rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark shadow-xl overflow-hidden flex flex-col max-h-[320px]">
                    <div className="p-2 border-b border-slate-200 dark:border-border-dark shrink-0 flex gap-2">
                      <input type="text" value={gifQuery} onChange={(e) => setGifQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchGiphy(gifQuery))} placeholder={t('messages.searchGif') || 'Tìm GIF...'} className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-border-dark rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-primary" />
                      <button type="button" onClick={() => searchGiphy(gifQuery)} disabled={gifLoading || !hasGiphyKey} className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50">
                        {gifLoading ? t('common.loading') || 'Đang tải' : t('common.search') || 'Tìm'}
                      </button>
                    </div>
                    <div className="p-2 overflow-y-auto flex-1 grid grid-cols-4 gap-1.5 min-h-[120px]">
                      {!hasGiphyKey ? (
                        <div className="col-span-4 flex flex-col items-center justify-center py-8 text-slate-500 dark:text-gray-400 text-sm text-center px-4">
                          <p className="mb-2">{t('messages.giphyKeyRequired') || 'Thêm API key để tìm GIF.'}</p>
                          <p className="text-xs">
                            <a href="https://developers.giphy.com/dashboard/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">developers.giphy.com</a>
                            {' → tạo key miễn phí, thêm vào .env: VITE_GIPHY_API_KEY=...'}
                          </p>
                        </div>
                      ) : gifLoading && gifResults.length === 0 ? (
                        <div className="col-span-4 flex items-center justify-center py-8 text-slate-500 dark:text-gray-400 text-sm">{t('common.loading') || 'Đang tải...'}</div>
                      ) : (
                        gifResults.map((g) => (
                          <button key={g.id} type="button" onClick={() => sendGif(g.url)} className="rounded-lg overflow-hidden bg-slate-100 dark:bg-white/5 hover:ring-2 ring-primary aspect-square flex items-center justify-center">
                            <img src={g.preview || g.url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div ref={emojiPickerRef} className="relative overflow-visible">
                <button type="button" onClick={() => setShowEmojiPicker((v) => !v)} className={`p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-border-dark/50 text-slate-500 dark:text-gray-400 transition-colors flex items-center justify-center ${showEmojiPicker ? 'bg-slate-100 dark:bg-border-dark/50' : ''}`} title={t('messages.emoji')}>
                  <span className="material-symbols-outlined text-lg">mood</span>
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-1 z-50 min-w-[340px] w-[400px] rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark shadow-xl overflow-hidden flex flex-col">
                    <div className="flex justify-center gap-1 p-1.5 border-b border-slate-200 dark:border-border-dark overflow-x-auto shrink-0">
                      {emojiCategories.map((cat) => (
                        <button key={cat.id} type="button" title={cat.label} onClick={() => setEmojiCategoryId(cat.id)} className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-xl leading-none transition-colors ${emojiCategoryId === cat.id ? 'bg-primary text-white' : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}>
                          {cat.emojis[0]}
                        </button>
                      ))}
                    </div>
                    <div className="p-2 grid grid-cols-4 gap-1.5 max-h-[180px] overflow-y-auto overflow-x-hidden">
                      {currentEmojis.map((emoji, i) => (
                        <button key={i} type="button" onClick={() => insertEmoji(emoji)} className="flex items-center justify-center min-w-[44px] min-h-[44px] p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xl leading-none">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <textarea
              ref={textareaRef}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1.5 resize-none max-h-28 min-h-[32px] text-slate-900 dark:text-white placeholder-gray-500 outline-none leading-normal"
              placeholder={t('messages.inputPlaceholder')}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={(e) => {
                const pasted = e.clipboardData?.getData?.('text/plain')
                if (pasted != null && pasted.trim()) {
                  e.preventDefault()
                  const ta = textareaRef.current
                  if (ta) {
                    const start = ta.selectionStart
                    const end = ta.selectionEnd
                    const before = inputText.slice(0, start)
                    const after = inputText.slice(end)
                    setInputText(before + pasted.trim() + after)
                    setTimeout(() => { ta.selectionStart = ta.selectionEnd = before.length + pasted.trim().length })
                  } else {
                    setInputText((prev) => prev + pasted.trim())
                  }
                }
              }}
              rows={1}
              disabled={sendLoading}
            />
            <button type="button" onClick={handleSend} disabled={sendLoading || !hasContent} className="shrink-0 w-9 h-9 rounded-xl bg-primary text-white hover:scale-105 transition-transform flex items-center justify-center p-0 disabled:opacity-50 disabled:cursor-not-allowed" aria-label={t('messages.send')}>
              {sendLoading ? <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span> : <span className="material-symbols-outlined fill text-xl leading-none">send</span>}
            </button>
          </div>
        </div>
      </footer>
    </>
  )
}
