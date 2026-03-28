import { createPortal } from 'react-dom'
import { useCreatePostModal } from '../../../hooks/useCreatePostModal'
import { PostComposerAddToPostRow } from './PostComposerAddToPostRow'

export function CreatePostModal({
  open,
  onClose,
  onSuccess,
  friendsList = [],
  groupId,
  initialVisibility = 'public',
  hideVisibilitySelector = false,
  forGroup = false,
}) {
  const {
    t,
    user,
    displayAvatar,
    state,
    refs,
    addons,
    handleContentChange,
    handleContentKeyDown,
    insertMention,
    handleImageSelect,
    handleVideoSelect,
    handleDocSelect,
    removeImage,
    removeVideo,
    removeDoc,
    handleSubmit,
    handleClose,
    setVisibility,
  } = useCreatePostModal({ friendsList, groupId, initialVisibility, forGroup, open, onClose, onSuccess })

  const {
    content,
    images,
    videoUrl,
    documents,
    visibility,
    posting,
    uploading,
    error,
    showMentionDropdown,
    mentionCandidates,
  } = state

  const {
    contentTextareaRef,
    contentBlockRef,
  } = refs

  if (!open) return null

  // Portal to body so backdrop covers full viewport (avoids fixed positioning inside transformed/scroll containers)
  const modalContent = (
    <div
      className="create-post-modal-backdrop"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-slate-200 dark:border-border-dark overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-border-dark shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t('dashboard.createPost') || 'Tạo bài viết'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={posting || uploading}
            className="p-2 hover:bg-slate-100 dark:hover:bg-border-dark rounded-full transition-colors text-slate-500 dark:text-slate-400 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* User Info & Privacy */}
        <div className="px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/30 shrink-0">
              <img
                src={displayAvatar}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {user?.name || 'User'}
              </p>
              {!hideVisibilitySelector && (
                <div className="relative mt-1">
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="appearance-none bg-slate-100 dark:bg-border-dark border-none rounded-lg text-xs font-medium py-1 pl-7 pr-8 text-slate-600 dark:text-slate-300 focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="public">{t('dashboard.public')}</option>
                    {forGroup ? (
                      <option value="private">{t('dashboard.privateOnly')}</option>
                    ) : (
                      <>
                        <option value="friends">{t('dashboard.friendsOnly')}</option>
                        <option value="private">{t('dashboard.privateOnly')}</option>
                      </>
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute left-1 top-1/2 -translate-y-1/2 text-[14px] pointer-events-none text-slate-500">
                    {visibility === 'private' ? 'lock' : visibility === 'friends' ? 'group' : 'public'}
                  </span>
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-[14px] pointer-events-none text-slate-500">
                    expand_more
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div ref={contentBlockRef} className="px-6 pb-2 shrink-0 relative">
          <textarea
            ref={contentTextareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleContentKeyDown}
            className="w-full min-h-[170px] bg-transparent border-none focus:ring-0 text-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none p-0"
            placeholder={t('dashboard.postPlaceholder')}
            rows={6}
          />
          {showMentionDropdown && (
            <div className="absolute left-6 right-6 top-full mt-0.5 pt-1.5 pb-2 bg-white dark:bg-card-dark rounded-xl shadow-xl border border-slate-200 dark:border-border-dark z-50 max-h-48 overflow-y-auto custom-scrollbar">
              <p className="px-3 pt-0.5 pb-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('dashboard.mentionFriend') || 'Gợi ý bạn bè'}
              </p>
              {mentionCandidates.length === 0 ? (
                <p className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">{t('dashboard.noFriendMatch') || 'Không có bạn bè trùng khớp.'}</p>
              ) : (
                mentionCandidates.map((friend) => (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => insertMention(friend)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    {friend.avatar ? (
                      <span className="size-8 rounded-full overflow-hidden border border-primary/40 shrink-0">
                        <img
                          src={friend.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </span>
                    ) : (
                      <span className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {(friend.name || '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{friend.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Preview Area - images and video same thumbnail style */}
        <div className="px-6 py-4 space-y-3 overflow-y-auto flex-1 min-h-0">
          {(images.length > 0 || videoUrl) && (
            <div className="flex flex-wrap gap-2">
              {images.map((url, i) => (
                <div key={`img-${i}-${url}`} className="relative group">
                  <img
                    src={url}
                    alt=""
                    className="w-20 h-20 object-cover rounded-lg border border-slate-200 dark:border-border-dark"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 size-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
              {videoUrl && (
                <div key="video-preview" className="relative group">
                  <video
                    src={videoUrl}
                    className="w-20 h-20 object-cover rounded-lg border border-slate-200 dark:border-border-dark bg-slate-800"
                    muted
                    preload="metadata"
                    playsInline
                  />
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="material-symbols-outlined text-white/80 text-2xl drop-shadow">play_circle</span>
                  </span>
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute -top-1 -right-1 size-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              )}
            </div>
          )}
          {documents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((d, i) => {
                const url = typeof d === 'string' ? d : d?.url
                const name = typeof d === 'string' ? '' : (d?.name || '')
                return (
                  <div
                    key={`doc-${i}-${url}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-blue-500 shrink-0">
                        description
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]" title={name || undefined}>
                        {name || (t('dashboard.document') + ` ${i + 1}`)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDoc(i)}
                      className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <PostComposerAddToPostRow
          t={t}
          uploading={uploading}
          imagesCount={images.length}
          hasVideo={Boolean(videoUrl)}
          documentsCount={documents.length}
          onImageSelect={handleImageSelect}
          onVideoSelect={handleVideoSelect}
          onDocSelect={handleDocSelect}
          addons={addons}
        />
        <div className="px-6 py-0 border-t-0">
          {uploading && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {t('dashboard.uploading')}
            </p>
          )}
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>

        {/* Footer Buttons */}
        <footer className="px-6 py-5 bg-slate-50 dark:bg-background-dark/30 border-t border-slate-200 dark:border-border-dark flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={posting}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-border-dark transition-colors disabled:opacity-50"
          >
            {t('buttons.cancel') || 'Hủy'}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              posting ||
              uploading ||
              (!content?.trim() && images.length === 0 && !videoUrl && documents.length === 0)
            }
            className="px-8 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {posting ? '...' : (t('dashboard.post') || 'Đăng bài')}
          </button>
        </footer>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
