import { useState, useEffect } from 'react'
import { PostComposerAddToPostRow } from './PostComposerAddToPostRow'
import { SharedPostPreviewCard } from './SharedPostPreviewCard'
import { normalizeMentions } from '../../../utils/post'

const REPOST_TEXTAREA_MAX_PX = 280

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
  onOpenSharedPost,
  withAddToPost = true,
}) {
  const [sharedContentExpanded, setSharedContentExpanded] = useState(false)

  const avatar =
    user?.avatar ||
    (user?.name
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=13b6ec&color=fff`
      : '')

  const sharedMentions = normalizeMentions(post?.mentions)

  useEffect(() => {
    const ta = repostTextareaRef?.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, REPOST_TEXTAREA_MAX_PX)}px`
  }, [repostText, repostTextareaRef])

  return (
    <>
      <div className="px-4 py-1.5 flex items-center gap-3">
        <img
          src={avatar}
          alt={user?.name || 'avatar'}
          className="size-9 rounded-full object-cover bg-slate-200 dark:bg-slate-500/40 border border-primary/30 shrink-0"
        />
        <div className="min-w-0 flex flex-col items-start relative">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
            {user?.name || 'User'}
          </span>
          <button
            type="button"
            onClick={() => setAudienceOpen((v) => !v)}
            className="mt-0.5 flex items-center gap-1 px-2 py-0.5 bg-slate-50 dark:bg-background-dark hover:bg-slate-100 dark:hover:bg-border-dark rounded-md text-xs font-bold transition-colors border border-slate-200 dark:border-border-dark text-slate-700 dark:text-slate-200"
          >
            <span className="material-symbols-outlined text-[14px]">
              {audience === 'public' ? 'public' : audience === 'friends' ? 'group' : 'lock'}
            </span>
            <span>
              {audience === 'public'
                ? t('dashboard.public') || 'Cong khai'
                : audience === 'friends'
                ? t('dashboard.friendsOnly') || 'Ban be'
                : t('dashboard.shareAudienceOnlyMe') || 'Chi minh toi'}
            </span>
            <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
          </button>

          {audienceOpen && (
            <div className="absolute z-20 top-full mt-1 left-0 w-48 rounded-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark shadow-lg py-1">
              {[
                { value: 'public', icon: 'public', label: t('dashboard.public') || 'Cong khai' },
                { value: 'friends', icon: 'group', label: t('dashboard.friendsOnly') || 'Ban be' },
                {
                  value: 'onlyMe',
                  icon: 'lock',
                  label: t('dashboard.shareAudienceOnlyMe') || 'Chi minh toi',
                },
              ].map(({ value, icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setAudience(value)
                    setAudienceOpen(false)
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-100 dark:hover:bg-white/10 ${
                    audience === value
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div ref={repostBlockRef} className="px-4 pt-1 pb-0 relative">
        <textarea
          ref={repostTextareaRef}
          value={repostText}
          onChange={onRepostTextChange}
          onKeyDown={onRepostTextKeyDown}
          rows={3}
          className="block min-h-[4.5rem] max-h-72 w-full overflow-y-auto bg-transparent border-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 shadow-none text-base leading-relaxed text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none p-0"
          placeholder={t('dashboard.shareWriteSomething') || 'Hay noi gi do ve noi dung nay...'}
        />
        {showMentionDropdown && (
          <div className="absolute left-4 right-4 top-full mt-0.5 pt-1 pb-1.5 bg-white dark:bg-card-dark rounded-lg shadow-lg border border-slate-200 dark:border-border-dark z-50 max-h-48 overflow-y-auto custom-scrollbar">
            <p className="px-3 pt-0.5 pb-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('dashboard.mentionFriend') || 'Goi y ban be'}
            </p>
            {mentionCandidates.length === 0 ? (
              <p className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                {t('dashboard.noFriendMatch') || 'Khong co ban be phu hop.'}
              </p>
            ) : (
              mentionCandidates.map((friend) => (
                <button
                  key={friend.id}
                  type="button"
                  onClick={() => onInsertMention(friend)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  {friend.avatar ? (
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="size-8 rounded-full object-cover border border-primary/40 shrink-0"
                    />
                  ) : (
                    <span className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                      {friend.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {friend.name}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {post && (
        <div className="px-4 pt-1 pb-0">
          <SharedPostPreviewCard
            compact
            sharedPost={post}
            sharedMentions={sharedMentions}
            contentExpanded={sharedContentExpanded}
            onToggleContentExpanded={() => setSharedContentExpanded((v) => !v)}
            onOpenMentions={() => {}}
            onOpenImageViewer={() => {}}
            onOpenPost={onOpenSharedPost}
          />
        </div>
      )}

      {(images.length > 0 || videoUrl) && (
          <div className="px-4 pt-2 pb-1 flex flex-wrap gap-2">
            {images.map((url, i) => (
              <div key={`share-img-${i}-${url}`} className="relative group">
                <img
                  src={url}
                  alt=""
                  className="w-20 h-20 object-cover rounded-lg border border-slate-200 dark:border-border-dark"
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
                  className="w-20 h-20 object-cover rounded-lg border border-slate-200 dark:border-border-dark bg-slate-800"
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
          <div className="px-4 pt-2 pb-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {documents.map((d, i) => {
              const name = typeof d === 'string' ? '' : d?.name || ''
              return (
                <div
                  key={`share-doc-${i}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-blue-500 shrink-0">description</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]" title={name || undefined}>
                      {name || `${t('dashboard.document') || 'Document'} ${i + 1}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveDoc(i)}
                    className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              )
            })}
          </div>
        )}

      <div className="px-4 py-1">
        {uploading && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('dashboard.uploading') || 'Dang upload...'}
          </p>
        )}
        {error ? (
          <p className="text-sm text-red-500 dark:text-red-400 whitespace-pre-wrap break-words">{error}</p>
        ) : null}
      </div>

      {withAddToPost && (
        <div className="px-4 py-1.5 bg-slate-50/50 dark:bg-card-dark/20 relative z-30 border-t border-slate-100 dark:border-border-dark">
          <PostComposerAddToPostRow
            compact
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
        </div>
      )}
    </>
  )
}
