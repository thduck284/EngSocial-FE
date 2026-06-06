import { createPortal } from 'react-dom'
import { useEffect, useRef } from 'react'
import { DEFAULT_AVATAR } from '../../../constants/ui'
import { POST_REACTION_TYPES, REACTION_TYPE_TO_EMOJI } from '../../../constants'
import { formatPostTime } from '../../../utils/dateTime'
import { formatReactionCount } from '../../../utils/post'
import { PostCommentsThread } from './PostCommentsThread'
import { hasGiphyKey } from '../../../services/giphy.service'

export function PostCommentsSectionBase({
  variant = 'feed', // 'feed' | 'modal'
  /** 'dark' = always dark (image viewer); 'adaptive' = follow light/dark theme (view post modal) */
  modalSurface = 'dark',
  /** Pin composer to bottom; comments list scrolls above (image viewer sidebar) */
  stickyComposer = false,
  /** Scroll post body + comments together; composer sticks to bottom of sidebar */
  unifiedScroll = false,
  t,
  comments,
  commentsLoading,
  commentSending,
  commentError,
  commentText,
  setCommentText,
  commentImages,
  commentVideo,
  commentAudio,
  commentDocuments,
  commentUploading,
  showGifPicker,
  setShowGifPicker,
  gifQuery,
  setGifQuery,
  gifResults,
  gifLoading,
  commentTextareaRef,
  commentImageInputRef,
  commentVideoInputRef,
  commentAudioInputRef,
  commentDocInputRef,
  handleCommentImageSelect,
  handleCommentVideoSelect,
  handleCommentAudioSelect,
  handleCommentDocSelect,
  handleGifSearch,
  handleSelectGif,
  removeCommentImage,
  removeCommentVideo,
  removeCommentAudio,
  removeCommentDoc,
  handleSendComment,
  handleToggleCommentLike,
  handleFeedCommentLikeMouseEnter,
  handleFeedCommentLikeMouseLeave,
  handleFeedCommentLikeFocus,
  handleFeedCommentLikeBlur,
  handleCommentReactionBubbleEnter = () => {},
  handleCommentReactionBubbleLeave = () => {},
  showCommentReactionPicker,
  commentReactionBubbleRect,
  hoveredCommentId,
  setCommentReactionsModalCommentId,
  setCommentReactionsModalInitialTab,
  setShowCommentReactionsModal,
  replyToComment,
  startReplyToComment,
  cancelReplyToComment,
  loadMoreRootComments,
  rootHasMore,
  threadPages,
  loadMoreThreadComments,
  expandAfterReply,
  onExpandAfterReplyConsumed,
}) {
  const isModal = variant === 'modal'
  const isDarkOnlyModal = isModal && modalSurface !== 'adaptive'
  const useStickyComposer = isModal && stickyComposer
  const useUnifiedScroll = useStickyComposer && unifiedScroll
  const rootSentinelRef = useRef(null)

  useEffect(() => {
    if (isModal || !loadMoreRootComments || !rootHasMore) return
    const el = rootSentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          loadMoreRootComments()
        }
      },
      { root: null, threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [isModal, loadMoreRootComments, rootHasMore])

  return (
    <div
      className={
        isModal
          ? useUnifiedScroll
            ? 'min-w-0 overflow-x-hidden'
            : 'flex-1 flex flex-col min-h-0 min-w-0 overflow-x-hidden'
          : ''
      }
    >
      <div
        className={
          isModal
            ? useUnifiedScroll
              ? 'px-3 pt-2 pb-2'
              : useStickyComposer
                ? 'flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 pt-2 pb-2 custom-scrollbar'
                : 'flex-1 px-3 pt-2 pb-2'
            : 'mt-2 pt-3 border-t border-slate-100 dark:border-[#325a67]'
        }
      >
        {commentsLoading ? (
          <div
            className={
              isDarkOnlyModal
                ? 'py-6 text-center text-sm text-[#92bbc9]'
                : 'py-4 text-center text-sm text-slate-500 dark:text-[#92bbc9]'
            }
          >
            {t('common.loading') || 'Đang tải...'}
          </div>
        ) : comments.length === 0 ? (
          <div
            className={
              isDarkOnlyModal
                ? 'flex flex-col items-center justify-center text-center text-slate-300 py-8'
                : 'py-4 text-center text-sm text-slate-500 dark:text-[#92bbc9]'
            }
          >
            {isDarkOnlyModal ? (
              <>
                <span className="material-symbols-outlined text-4xl mb-2 text-[#325a67]">
                  description
                </span>
                <p className="text-sm font-medium">
                  {t('dashboard.noCommentsYet') || 'Chưa có bình luận nào'}
                </p>
                <p className="text-xs text-[#92bbc9] mt-0.5">
                  {t('dashboard.beFirstToComment') || 'Hãy là người đầu tiên bình luận.'}
                </p>
              </>
            ) : (
              t('dashboard.noCommentsYet') || 'Chưa có bình luận nào'
            )}
          </div>
        ) : (
          <div
            className={
              isModal
                ? 'flex flex-col gap-3'
                : 'flex flex-col gap-3 px-1 max-h-[320px] overflow-y-auto custom-scrollbar pr-1'
            }
          >
            <PostCommentsThread
              isModal={isModal}
              modalSurface={modalSurface}
              t={t}
              comments={comments}
              handleFeedCommentLikeMouseEnter={handleFeedCommentLikeMouseEnter}
              handleFeedCommentLikeMouseLeave={handleFeedCommentLikeMouseLeave}
              handleFeedCommentLikeFocus={handleFeedCommentLikeFocus}
              handleFeedCommentLikeBlur={handleFeedCommentLikeBlur}
              handleToggleCommentLike={handleToggleCommentLike}
              setCommentReactionsModalCommentId={setCommentReactionsModalCommentId}
              setCommentReactionsModalInitialTab={setCommentReactionsModalInitialTab}
              setShowCommentReactionsModal={setShowCommentReactionsModal}
              startReplyToComment={startReplyToComment}
              threadPages={threadPages}
              loadMoreThreadComments={loadMoreThreadComments}
              expandAfterReply={expandAfterReply}
              onExpandAfterReplyConsumed={onExpandAfterReplyConsumed}
            />
            {!isModal && (
              <div ref={rootSentinelRef} className="h-1" />
            )}
          </div>
        )}
      </div>

      {showCommentReactionPicker && commentReactionBubbleRect && hoveredCommentId != null &&
        createPortal(
          <div
            className="fixed z-[10000] flex items-center gap-1 rounded-full bg-white dark:bg-[#1a353d] border border-slate-200 dark:border-[#325a67] shadow-lg p-[5px]"
            style={{
              left: commentReactionBubbleRect.left + commentReactionBubbleRect.width / 2,
              top: commentReactionBubbleRect.top - 8,
              transform: 'translate(-50%, -100%)',
            }}
            role="menu"
            aria-label={t('dashboard.reactionPicker') || 'Chọn reaction'}
            onMouseEnter={handleCommentReactionBubbleEnter}
            onMouseLeave={handleCommentReactionBubbleLeave}
          >
            {POST_REACTION_TYPES.map((reactionType) => (
              <button
                key={reactionType}
                type="button"
                role="menuitem"
                onClick={() => handleToggleCommentLike(hoveredCommentId, reactionType)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-xl hover:bg-slate-100 dark:hover:bg-[#233f48] transition-colors"
                title={reactionType}
              >
                {REACTION_TYPE_TO_EMOJI[reactionType]}
              </button>
            ))}
          </div>,
          document.body
        )}

      <div
        className={
          isModal
            ? useStickyComposer
              ? useUnifiedScroll
                ? 'sticky bottom-0 z-10 px-2 py-2 border-t border-slate-200 dark:border-[#325a67] bg-white dark:bg-[#111e22] shadow-[0_-6px_16px_rgba(15,23,42,0.08)] dark:shadow-[0_-6px_20px_rgba(0,0,0,0.45)]'
                : 'shrink-0 z-10 px-2 py-2 border-t border-slate-200 dark:border-[#325a67] bg-white dark:bg-[#111e22] shadow-[0_-6px_16px_rgba(15,23,42,0.08)] dark:shadow-[0_-6px_20px_rgba(0,0,0,0.45)]'
              : 'px-2 py-0.5 border-t border-slate-200 dark:border-[#325a67] bg-slate-50 dark:bg-[#0f191c]'
            : 'mt-3'
        }
      >
        <div
          className={
            isModal
              ? 'flex items-center gap-1 px-3 py-1 rounded-xl bg-white dark:bg-[#233f48] border border-slate-200 dark:border-[#325a67]'
              : 'flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#233f48] border border-slate-200 dark:border-[#325a67]'
          }
        >
          <div className="flex-1 flex flex-col gap-0.5">
            {replyToComment && (
              <div
                className={
                  isDarkOnlyModal
                    ? 'mb-1 flex items-center justify-between text-xs text-[#92bbc9]'
                    : 'mb-1 flex items-center justify-between text-xs text-slate-600 dark:text-[#92bbc9]'
                }
              >
                <span className="truncate font-semibold text-sky-500">
                  {(() => {
                    const raw = t('dashboard.replyingTo')
                    const base =
                      raw && raw !== 'dashboard.replyingTo'
                        ? raw
                        : t('dashboard.reply') || 'Trả lời'
                    return `${base} ${replyToComment.authorName || ''}`.trim()
                  })()}
                </span>
                <button
                  type="button"
                  onClick={cancelReplyToComment}
                  className={
                    isDarkOnlyModal
                      ? 'ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#325a67] hover:bg-[#2b3b44] transition-colors'
                      : 'ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 dark:border-[#325a67] hover:bg-slate-100 dark:hover:bg-[#2b3b44] transition-colors'
                  }
                >
                  <span>{t('buttons.cancel') || 'Hủy'}</span>
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            )}
            {(commentImages.length > 0 ||
              commentVideo ||
              commentAudio ||
              commentDocuments.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {commentImages.map((url, i) => (
                  <div
                    key={`${isModal ? 'cimg' : 'feed-cimg'}-${i}-${url}`}
                    className="relative"
                  >
                    <img
                      src={url}
                      alt=""
                      className={
                        isDarkOnlyModal
                          ? 'w-10 h-10 rounded-lg object-cover border border-[#325a67]'
                          : 'w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-[#325a67]'
                      }
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => removeCommentImage(i)}
                      className="absolute -top-1 -right-1 size-5 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                      aria-label={t('buttons.close') || 'Đóng'}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        close
                      </span>
                    </button>
                  </div>
                ))}
                {commentVideo && (
                  <button
                    type="button"
                    onClick={removeCommentVideo}
                    className={
                      isDarkOnlyModal
                        ? 'inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[#325a67] bg-[#0f191c] text-xs text-[#92bbc9] hover:bg-[#2b3b44] transition-colors'
                        : 'inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-[#325a67] bg-white/70 dark:bg-[#0f191c] text-xs text-slate-600 dark:text-[#92bbc9] hover:bg-slate-100 dark:hover:bg-[#2b3b44] transition-colors'
                    }
                  >
                    <span className="material-symbols-outlined text-sm">videocam</span>
                    {t('dashboard.video') || 'Video'}
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
                {commentAudio && (
                  <button
                    type="button"
                    onClick={removeCommentAudio}
                    className={
                      isDarkOnlyModal
                        ? 'inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[#325a67] bg-[#0f191c] text-xs text-[#92bbc9] hover:bg-[#2b3b44] transition-colors'
                        : 'inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-[#325a67] bg-white/70 dark:bg-[#0f191c] text-xs text-slate-600 dark:text-[#92bbc9] hover:bg-slate-100 dark:hover:bg-[#2b3b44] transition-colors'
                    }
                  >
                    <span className="material-symbols-outlined text-sm">
                      audio_file
                    </span>
                    MP3
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
                {commentDocuments.map((d, i) => (
                  <button
                    key={`${isModal ? 'cdoc' : 'feed-cdoc'}-${i}-${d.url}`}
                    type="button"
                    onClick={() => removeCommentDoc(i)}
                    className={
                      isDarkOnlyModal
                        ? 'inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[#325a67] bg-[#0f191c] text-xs text-[#92bbc9] hover:bg-[#2b3b44] transition-colors max-w-full'
                        : 'inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-[#325a67] bg-white/70 dark:bg-[#0f191c] text-xs text-slate-600 dark:text-[#92bbc9] hover:bg-slate-100 dark:hover:bg-[#2b3b44] transition-colors max-w-full'
                    }
                  >
                    <span className="material-symbols-outlined text-sm">
                      description
                    </span>
                    <span className="truncate max-w-[120px]">
                      {d.name || (t('dashboard.document') || 'Tài liệu')}
                    </span>
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                ))}
              </div>
            )}
            <textarea
              rows={1}
              placeholder={t('dashboard.writeComment') || 'Viết bình luận...'}
              className={
                isDarkOnlyModal
                  ? 'w-full bg-transparent text-slate-100 placeholder:text-[#92bbc9] text-sm leading-snug focus:outline-none resize-none overflow-y-auto'
                  : 'w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-[#92bbc9] text-sm leading-snug focus:outline-none resize-none overflow-y-auto'
              }
              style={{ maxHeight: '72px' }}
              ref={commentTextareaRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = 'auto'
                const max = 72
                el.style.height = `${Math.min(el.scrollHeight, max)}px`
              }}
            />
            {commentError ? (
              <p
                className={
                  isDarkOnlyModal ? 'text-xs text-red-300' : 'text-xs text-red-500'
                }
              >
                {commentError}
              </p>
            ) : null}
            <div
              className={
                isDarkOnlyModal
                  ? 'flex items-center gap-1 text-[#92bbc9]'
                  : 'flex items-center gap-1 text-slate-500 dark:text-[#92bbc9]'
              }
            >
              <input
                ref={commentImageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleCommentImageSelect}
              />
              <input
                ref={commentVideoInputRef}
                type="file"
                accept="video/*,video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-ms-wmv"
                className="hidden"
                onChange={handleCommentVideoSelect}
              />
              <input
                ref={commentAudioInputRef}
                type="file"
                accept="audio/*,audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/webm,audio/ogg"
                className="hidden"
                onChange={handleCommentAudioSelect}
              />
              <input
                ref={commentDocInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                multiple
                className="hidden"
                onChange={handleCommentDocSelect}
              />
              {isDarkOnlyModal && (
                <button
                  type="button"
                  className="p-0.5 rounded-full text-[#9ca3af] hover:bg-[#2b3b44] transition-colors"
                  aria-label="Emoji"
                >
                  <span className="material-symbols-outlined text-sm">
                    sentiment_satisfied
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => commentImageInputRef.current?.click()}
                disabled={commentUploading || commentImages.length >= 10}
                className={
                  isDarkOnlyModal
                    ? 'p-0.5 rounded-full text-[#9ca3af] hover:bg-[#2b3b44] transition-colors'
                    : 'p-1 rounded-full hover:bg-slate-200 dark:hover:bg-[#2b3b44] transition-colors'
                }
                aria-label={t('dashboard.image') || 'Ảnh'}
              >
                <span className="material-symbols-outlined text-sm">image</span>
              </button>
              <button
                type="button"
                onClick={() => commentDocInputRef.current?.click()}
                disabled={commentUploading || commentDocuments.length >= 5}
                className={
                  isDarkOnlyModal
                    ? 'p-0.5 rounded-full text-[#9ca3af] hover:bg-[#2b3b44] transition-colors'
                    : 'p-1 rounded-full hover:bg-slate-200 dark:hover:bg-[#2b3b44] transition-colors'
                }
                aria-label={t('dashboard.document') || 'Tài liệu'}
              >
                <span className="material-symbols-outlined text-sm">
                  description
                </span>
              </button>
              <button
                type="button"
                onClick={() => commentVideoInputRef.current?.click()}
                disabled={commentUploading || Boolean(commentVideo)}
                className={
                  isDarkOnlyModal
                    ? 'p-0.5 rounded-full text-[#9ca3af] hover:bg-[#2b3b44] transition-colors'
                    : 'p-1 rounded-full hover:bg-slate-200 dark:hover:bg-[#2b3b44] transition-colors'
                }
                aria-label={t('dashboard.video') || 'Video'}
              >
                <span className="material-symbols-outlined text-sm">
                  videocam
                </span>
              </button>
              <button
                type="button"
                onClick={() => commentAudioInputRef.current?.click()}
                disabled={commentUploading || Boolean(commentAudio)}
                className={
                  isDarkOnlyModal
                    ? 'p-0.5 rounded-full text-[#9ca3af] hover:bg-[#2b3b44] transition-colors'
                    : 'p-1 rounded-full hover:bg-slate-200 dark:hover:bg-[#2b3b44] transition-colors'
                }
                aria-label="MP3"
              >
                <span className="material-symbols-outlined text-sm">
                  audio_file
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowGifPicker((v) => !v)}
                disabled={commentUploading || commentImages.length >= 10}
                className={
                  isDarkOnlyModal
                    ? 'p-0.5 rounded-full text-[#9ca3af] hover:bg-[#2b3b44] transition-colors'
                    : 'p-1 rounded-full hover:bg-slate-200 dark:hover:bg-[#2b3b44] transition-colors'
                }
                aria-label={t('dashboard.gif') || 'GIF'}
              >
                <span className="material-symbols-outlined text-sm">gif_box</span>
              </button>
              <button
                type="button"
                onClick={handleSendComment}
                disabled={commentUploading || commentSending}
                className={
                  (isDarkOnlyModal
                    ? 'ml-auto p-1 rounded-full text-primary hover:bg-[#314750] transition-colors shrink-0'
                    : 'ml-auto p-1.5 rounded-full text-primary hover:bg-slate-200 dark:hover:bg-[#314750] transition-colors') +
                  (commentUploading || commentSending
                    ? ' opacity-60 pointer-events-none'
                    : '')
                }
                aria-label="Gửi"
              >
                <span
                  className={
                    'material-symbols-outlined text-base ' +
                    (commentSending ? 'animate-spin' : '')
                  }
                >
                  {commentSending ? 'progress_activity' : 'send'}
                </span>
              </button>
            </div>
            {showGifPicker && (
              <div
                className={
                  isDarkOnlyModal
                    ? 'mt-1 rounded-xl border border-[#325a67] bg-[#0f191c] overflow-hidden'
                    : 'mt-1 rounded-xl border border-slate-200 dark:border-[#325a67] bg-white dark:bg-[#0f191c] overflow-hidden'
                }
              >
                <div
                  className={
                    isDarkOnlyModal
                      ? 'p-2 border-b border-[#325a67]'
                      : 'p-2 border-b border-slate-200 dark:border-[#325a67]'
                  }
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={gifQuery}
                      onChange={(e) => setGifQuery(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        (e.preventDefault(), handleGifSearch())
                      }
                      className={
                        isDarkOnlyModal
                          ? 'w-full bg-[#233f48] border border-[#325a67] rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-[#92bbc9] focus:outline-none'
                          : 'w-full bg-slate-50 dark:bg-[#233f48] border border-slate-200 dark:border-[#325a67] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-[#92bbc9] focus:outline-none'
                      }
                      placeholder={t('messages.searchGif') || 'Tìm GIF...'}
                    />
                    <button
                      type="button"
                      onClick={handleGifSearch}
                      disabled={gifLoading || !hasGiphyKey}
                      className="shrink-0 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
                    >
                      {gifLoading
                        ? '...'
                        : t('common.search') || 'Tìm'}
                    </button>
                  </div>
                </div>
                <div className="p-2 grid grid-cols-2 gap-2 max-h-56 overflow-y-auto custom-scrollbar">
                  {!hasGiphyKey ? (
                    <div className="col-span-2 py-4 text-center text-xs text-slate-500 dark:text-[#92bbc9]">
                      {t('messages.giphyKeyRequired')}
                    </div>
                  ) : gifLoading && gifResults.length === 0 ? (
                    <div className="col-span-2 py-6 text-center text-sm text-slate-500 dark:text-[#92bbc9]">
                      {t('common.loading') || 'Đang tải...'}
                    </div>
                  ) : (
                    gifResults.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleSelectGif(g.url)}
                        className={
                          isDarkOnlyModal
                            ? 'h-24 rounded-lg overflow-hidden border border-[#325a67] hover:ring-2 ring-primary'
                            : 'h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-[#325a67] hover:ring-2 ring-primary'
                        }
                      >
                        <img
                          src={g.preview || g.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

