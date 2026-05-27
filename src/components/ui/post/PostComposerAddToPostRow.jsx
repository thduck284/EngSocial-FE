export function PostComposerAddToPostRow({
  t,
  uploading,
  imagesCount,
  hasVideo,
  documentsCount,
  onImageSelect,
  onVideoSelect,
  onDocSelect,
  addons,
}) {
  const {
    showGifPicker,
    setShowGifPicker,
    gifQuery,
    setGifQuery,
    gifResults,
    gifLoading,
    showEmojiPicker,
    setShowEmojiPicker,
    emojiCategoryId,
    setEmojiCategoryId,
    imageInputRef,
    videoInputRef,
    docInputRef,
    gifPickerRef,
    emojiPickerRef,
    emojiCategories,
    currentEmojis,
    handleGifSearch,
    handleSelectGif,
    insertEmoji,
    hasGiphyKey,
  } = addons

  return (
    <div className="py-3 border-t border-slate-200 dark:border-border-dark shrink-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
        {t('dashboard.addToPost') || 'Them vao bai viet'}
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onImageSelect}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*,video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-ms-wmv"
          className="hidden"
          onChange={onVideoSelect}
        />
        <input
          ref={docInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          multiple
          className="hidden"
          onChange={onDocSelect}
        />
        <div ref={emojiPickerRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowGifPicker(false)
              setShowEmojiPicker((v) => !v)
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              showEmojiPicker
                ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : 'hover:bg-slate-100 dark:hover:bg-border-dark border-slate-100 dark:border-border-dark'
            }`}
            title={t('messages.emoji') || 'Bieu cam'}
          >
            <span className="material-symbols-outlined text-amber-500">mood</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('messages.emoji') || 'Bieu cam'}
            </span>
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-full mb-3 left-0 w-72 bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-slate-200 dark:border-border-dark z-50 overflow-hidden">
              <div className="flex justify-center gap-1 p-1.5 border-b border-slate-100 dark:border-border-dark overflow-x-auto shrink-0">
                {emojiCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    title={cat.label}
                    onClick={() => setEmojiCategoryId(cat.id)}
                    className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-xl leading-none transition-colors ${
                      emojiCategoryId === cat.id
                        ? 'bg-primary text-white'
                        : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                  >
                    {cat.emojis[0]}
                  </button>
                ))}
              </div>
              <div className="p-2 grid grid-cols-8 gap-1 max-h-[180px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                {currentEmojis.map((emoji, i) => (
                  <button
                    key={`${emoji}-${i}`}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="flex items-center justify-center min-w-[36px] min-h-[36px] p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xl leading-none"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploading || imagesCount >= 10}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-border-dark transition-colors border border-slate-100 dark:border-border-dark disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-green-500">image</span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('dashboard.image')}
          </span>
        </button>
        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          disabled={uploading || hasVideo}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-border-dark transition-colors border border-slate-100 dark:border-border-dark disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-red-500">videocam</span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('dashboard.video')}
          </span>
        </button>
        <button
          type="button"
          onClick={() => docInputRef.current?.click()}
          disabled={uploading || documentsCount >= 5}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-border-dark transition-colors border border-slate-100 dark:border-border-dark disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-blue-500">description</span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('dashboard.document')}
          </span>
        </button>
        <div ref={gifPickerRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(false)
              setShowGifPicker((v) => !v)
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              showGifPicker
                ? 'bg-violet-500/10 dark:bg-violet-500/20 border-violet-500/30 text-violet-600 dark:text-violet-400'
                : 'hover:bg-slate-100 dark:hover:bg-border-dark border-slate-100 dark:border-border-dark'
            }`}
          >
            <span className="material-symbols-outlined text-violet-500">gif_box</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('messages.gif') || 'GIF'}
            </span>
          </button>
          {showGifPicker && (
            <div className="absolute bottom-full mb-3 right-0 w-72 bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-slate-200 dark:border-border-dark z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-100 dark:border-border-dark">
                <div className="relative flex gap-2">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    search
                  </span>
                  <input
                    type="text"
                    value={gifQuery}
                    onChange={(e) => setGifQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleGifSearch())}
                    className="w-full bg-slate-100 dark:bg-background-dark border-none rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-1 focus:ring-primary text-slate-900 dark:text-slate-100"
                    placeholder={t('messages.searchGif') || 'Tim GIF...'}
                  />
                  <button
                    type="button"
                    onClick={handleGifSearch}
                    disabled={gifLoading || !hasGiphyKey}
                    className="shrink-0 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
                  >
                    {gifLoading ? t('common.loading') || '...' : t('common.search') || 'Tim'}
                  </button>
                </div>
              </div>
              <div className="p-2 grid grid-cols-2 gap-2 h-48 overflow-y-auto custom-scrollbar">
                {!hasGiphyKey ? (
                  <div className="col-span-2 flex flex-col items-center justify-center py-4 text-slate-500 dark:text-slate-400 text-xs text-center px-2">
                    {t('messages.giphyKeyRequired')}
                  </div>
                ) : gifLoading && gifResults.length === 0 ? (
                  <div className="col-span-2 flex items-center justify-center py-8 text-slate-500 text-sm">
                    {t('common.loading') || 'Dang tai...'}
                  </div>
                ) : (
                  gifResults.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleSelectGif(g.url)}
                      className="h-20 bg-slate-200 dark:bg-border-dark rounded-lg overflow-hidden flex items-center justify-center hover:ring-2 ring-primary"
                    >
                      <img src={g.preview || g.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
