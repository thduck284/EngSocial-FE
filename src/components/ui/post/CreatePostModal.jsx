import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useCreatePostModal } from '../../../hooks/useCreatePostModal'
import { PostComposerAddToPostRow } from './PostComposerAddToPostRow'
import { CompactSelect } from '../common/CompactSelect'

function visibilityIcon(value) {
  if (value === 'private') return 'lock'
  if (value === 'friends') return 'group'
  return 'public'
}

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
    violationResult,
    showMentionDropdown,
    mentionCandidates,
  } = state

  const {
    contentTextareaRef,
    contentBlockRef,
  } = refs

  const visibilityOptions = useMemo(() => {
    const opts = [{ value: 'public', label: t('dashboard.public') }]
    if (forGroup) {
      opts.push({ value: 'private', label: t('dashboard.privateOnly') })
    } else {
      opts.push(
        { value: 'friends', label: t('dashboard.friendsOnly') },
        { value: 'private', label: t('dashboard.privateOnly') }
      )
    }
    return opts
  }, [forGroup, t])

  if (!open) return null

  // Portal to body so backdrop covers full viewport (avoids fixed positioning inside transformed/scroll containers)
  const modalContent = (
    <div
      className="create-post-modal-backdrop"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-slate-200 dark:border-border-dark overflow-hidden flex flex-col h-[min(92vh,920px)] max-h-[96vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Header */}
        <header className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-border-dark shrink-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t('dashboard.createPost') || 'Tạo bài viết'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={posting || uploading}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-border-dark rounded-lg transition-colors text-slate-500 dark:text-slate-400 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* User Info & Privacy (Pinned below header) */}
        <div className="px-4 py-1.5 flex items-center gap-3 shrink-0">
          <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30 shrink-0">
            <img
              src={displayAvatar}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex flex-col items-start">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {user?.name || 'User'}
              </p>
              {!hideVisibilitySelector && (
                <CompactSelect
                  value={visibility}
                  onChange={setVisibility}
                  options={visibilityOptions}
                  matchRootWidth
                  size="sm"
                  leading={
                    <span className="material-symbols-outlined text-[14px] text-slate-500 dark:text-gray-400">
                      {visibilityIcon(visibility)}
                    </span>
                  }
                  className="mt-0.5"
                  buttonClassName="font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark shadow-none focus:ring-1 focus:ring-primary/30"
                />
              )}
          </div>
        </div>

        {/* Body: textarea fills remaining height */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div ref={contentBlockRef} className="flex-1 min-h-0 px-4 pt-1 pb-1 relative flex flex-col">
            <textarea
              ref={contentTextareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleContentKeyDown}
              className="flex-1 min-h-[12rem] w-full h-full bg-transparent border-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 shadow-none text-base leading-relaxed text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none p-0"
              placeholder={t('dashboard.postPlaceholder')}
            />
            {showMentionDropdown && (
              <div className="absolute left-4 right-4 top-full mt-0.5 pt-1 pb-1.5 bg-white dark:bg-card-dark rounded-lg shadow-lg border border-slate-200 dark:border-border-dark z-50 max-h-48 overflow-y-auto custom-scrollbar">
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

          <div className="shrink-0 overflow-y-auto max-h-[38vh] custom-scrollbar border-t border-slate-100 dark:border-border-dark">
          {/* Previews (Images/Videos) */}
          {(images.length > 0 || videoUrl) && (
            <div className="px-4 py-2 flex flex-wrap gap-2">
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

          {/* Previews (Documents) */}
          {documents.length > 0 && (
            <div className="px-4 py-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
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

          {/* Addons Panel (Add to post tools) */}
          <div className="px-4 py-1.5 bg-slate-50/50 dark:bg-card-dark/20">
            <PostComposerAddToPostRow
              compact
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
          </div>

          {/* Alerts & Errors */}
          <div className="px-4 py-1.5">
            {uploading && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('dashboard.uploading')}
              </p>
            )}

            {violationResult && (
              <div className="rounded-xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500 text-xl">gpp_bad</span>
                  <p className="font-bold text-red-600 dark:text-red-400 text-sm">
                    Nội dung vi phạm tiêu chuẩn cộng đồng
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="material-symbols-outlined text-base text-red-500">warning</span>
                  Mức độ vi phạm:&nbsp;
                  <span className="font-bold text-red-600 dark:text-red-400 uppercase">
                    {(violationResult.violation_score ?? 0) >= 80 ? 'Cao' : 'Trung bình'}
                  </span>
                </div>

                {violationResult.keywords?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                      Từ khóa vi phạm phát hiện:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {violationResult.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-red-200 dark:border-red-800">
                  ⚠️ Vui lòng chỉnh sửa nội dung và thử lại.
                </p>
              </div>
            )}

            {error && !violationResult && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
          </div>
          </div>
        </div>

        {/* Pinned Footer */}
        <footer className="px-4 py-2.5 bg-slate-50 dark:bg-background-dark/30 border-t border-slate-200 dark:border-border-dark flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={posting}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-border-dark transition-colors disabled:opacity-50"
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
            className="px-5 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {posting ? '...' : (t('dashboard.post') || 'Đăng bài')}
          </button>
        </footer>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
