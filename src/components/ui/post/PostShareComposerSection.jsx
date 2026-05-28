import { PostComposerAddToPostRow } from './PostComposerAddToPostRow'

export function PostShareComposerSection({
  t,
  post,
  user,
  audience,
  setAudience,
  audienceOpen,
  setAudienceOpen,
  repostBlockRef,
  repostTextareaRef,
  repostText,
  onRepostTextChange,
  onRepostTextKeyDown,
  showMentionDropdown,
  mentionCandidates,
  onInsertMention,
  submitting,
  uploading,
  error,
  images,
  videoUrl,
  documents,
  onRemoveImage,
  onRemoveVideo,
  onRemoveDoc,
  onImageSelect,
  onVideoSelect,
  onDocSelect,
  addons,
}) {
  const avatar = user?.avatar || (user?.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=13b6ec&color=fff` : '')

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <img
            src={avatar}
            alt={user?.name || 'avatar'}
            className="w-10 h-10 rounded-full object-cover bg-slate-500/40"
          />
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-bold text-slate-100">
              {user?.name || 'User'}
            </span>
            <div className="flex gap-2 flex-wrap relative">
              <button
                type="button"
                onClick={() => setAudienceOpen((v) => !v)}
                className="flex items-center gap-1 px-2.5 py-1 bg-background-dark/70 hover:bg-background-dark rounded-md text-[13px] font-semibold transition-colors border border-border-dark"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {audience === 'public'
                    ? 'public'
                    : audience === 'friends'
                    ? 'group'
                    : 'lock'}
                </span>
                <span>
                  {audience === 'public'
                    ? t('dashboard.public') || 'Cong khai'
                    : audience === 'friends'
                    ? t('dashboard.friendsOnly') || 'Ban be'
                    : t('dashboard.shareAudienceOnlyMe') || 'Chi minh toi'}
                </span>
                <span className="material-symbols-outlined text-[16px]">
                  arrow_drop_down
                </span>
              </button>

              {audienceOpen && (
                <div className="absolute z-10 top-full mt-1 right-0 w-48 rounded-lg bg-card-dark border border-border-dark shadow-lg py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAudience('public')
                      setAudienceOpen(false)
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-xs text-left hover:bg-white/10 ${
                      audience === 'public' ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      public
                    </span>
                    <span>{t('dashboard.public') || 'Cong khai'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAudience('friends')
                      setAudienceOpen(false)
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-xs text-left hover:bg-white/10 ${
                      audience === 'friends' ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      group
                    </span>
                    <span>{t('dashboard.friendsOnly') || 'Ban be'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAudience('onlyMe')
                      setAudienceOpen(false)
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-xs text-left hover:bg-white/10 ${
                      audience === 'onlyMe' ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      lock
                    </span>
                    <span>
                      {t('dashboard.shareAudienceOnlyMe') || 'Chi minh toi'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative group" ref={repostBlockRef}>
          <textarea
            ref={repostTextareaRef}
            rows={6}
            className="w-full bg-transparent border-none p-0 text-[18px] focus:ring-0 resize-none placeholder:text-slate-400 min-h-[170px]"
            placeholder={
              t('dashboard.shareWriteSomething') || 'Hay noi gi do ve noi dung nay...'
            }
            value={repostText}
            onChange={onRepostTextChange}
            onKeyDown={onRepostTextKeyDown}
          />
          {showMentionDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1 rounded-xl bg-card-dark border border-border-dark shadow-xl z-20 max-h-44 overflow-y-auto">
              {mentionCandidates.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-400">
                  {t('dashboard.noFriendMatch') || 'Khong co ban be phu hop.'}
                </p>
              ) : (
                mentionCandidates.map((friend) => (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => onInsertMention(friend)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/10"
                  >
                    {friend.avatar ? (
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-7 h-7 rounded-full object-cover bg-background-dark"
                      />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                        {friend.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="text-sm text-slate-100 truncate">{friend.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
          <button className="absolute bottom-2 right-0 text-slate-400 hover:text-white">
            <span className="material-symbols-outlined text-[24px]">
              mood
            </span>
          </button>
        </div>

        {(images.length > 0 || videoUrl || documents.length > 0) && (
          <div className="space-y-3">
            {(images.length > 0 || videoUrl) && (
              <div className="flex flex-wrap gap-2">
                {images.map((url, i) => (
                  <div key={`share-img-${i}-${url}`} className="relative group">
                    <img
                      src={url}
                      alt=""
                      className="w-20 h-20 object-cover rounded-lg border border-border-dark"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveImage(i)}
                      className="absolute -top-1 -right-1 size-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
                {videoUrl && (
                  <div className="relative group">
                    <video
                      src={videoUrl}
                      className="w-20 h-20 object-cover rounded-lg border border-border-dark bg-background-dark"
                      muted
                      preload="metadata"
                      playsInline
                    />
                    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="material-symbols-outlined text-white/80 text-2xl drop-shadow">
                        play_circle
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={onRemoveVideo}
                      className="absolute -top-1 -right-1 size-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            {documents.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {documents.map((d, i) => {
                  const name = typeof d === 'string' ? '' : (d?.name || '')
                  return (
                    <div
                      key={`share-doc-${i}`}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border-dark bg-background-dark/40"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-blue-400 shrink-0">
                          description
                        </span>
                        <span className="text-xs text-slate-200 truncate" title={name || undefined}>
                          {name || `${t('dashboard.document') || 'Document'} ${i + 1}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveDoc(i)}
                        className="text-slate-400 hover:text-red-400 transition-colors shrink-0"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <PostComposerAddToPostRow
          t={t}
          uploading={uploading}
          imagesCount={images.length}
          hasVideo={Boolean(videoUrl)}
          documentsCount={documents.length}
          onImageSelect={onImageSelect}
          onVideoSelect={onVideoSelect}
          onDocSelect={onDocSelect}
          addons={addons}
        />

        {uploading && (
          <p className="text-xs text-slate-400 -mt-2">
            {t('dashboard.uploading') || 'Dang upload...'}
          </p>
        )}

        {/* Share button moved to modal footer next to Cancel */}
      </div>

      {error ? (
        <p className="px-4 pb-3 text-xs text-red-400 whitespace-pre-wrap break-words">
          {error}
        </p>
      ) : null}
    </>
  )
}

