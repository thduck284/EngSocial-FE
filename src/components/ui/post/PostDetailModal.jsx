import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatPostTime } from '../../../utils/dateTime'
import { ROUTES, POST_REACTION_TYPES, REACTION_TYPE_TO_EMOJI } from '../../../constants'
import { 
  formatReactionCount, 
  getPostReactionTotal, 
  getPostVisibilityLabel, 
  normalizeMentions 
} from '../../../utils/post'
import { usePostReactionPicker, useDashboardPostComments } from '../../../hooks/usePostInteractions'
import { PostContentBody } from './PostContentBody'
import { PostCommentsSectionBase } from './PostCommentsSectionBase'
import { ReactionsModal } from './ReactionsModal'
import { MentionedUsersModal } from './MentionedUsersModal'
import { PostInteractionsModal } from './PostInteractionsModal'
import { SharedPostPreviewCard } from './SharedPostPreviewCard'

export function PostDetailModal({ 
  open, 
  onClose, 
  post, 
  onToggleLike, 
  onUpdatePost,
  likeLoading = false 
}) {
  const { t } = useTranslation()
  const [showReactionsModal, setShowReactionsModal] = useState(false)
  const [reactionsModalInitialTab, setReactionsModalInitialTab] = useState('all')
  const [showMentionsModal, setShowMentionsModal] = useState(false)
  const [showInteractionsModal, setShowInteractionsModal] = useState(false)
  const [interactionsType, setInteractionsType] = useState('comments')
  const [contentExpanded, setContentExpanded] = useState(true) // Default expanded in modal

  const postId = post?.id ?? post?._id

  const {
    likeAreaRef,
    showReactionPicker,
    reactionBubbleRect,
    handleLikeAreaMouseEnter,
    handleLikeAreaMouseLeave,
    handleBubbleMouseEnter,
    handleBubbleMouseLeave,
    handleLikeAreaFocus,
    handleLikeAreaBlur,
    hideReactionPicker,
  } = usePostReactionPicker()

  const {
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
    handleCommentReactionBubbleEnter,
    handleCommentReactionBubbleLeave,
    showCommentReactionPicker,
    commentReactionBubbleRect,
    hoveredCommentId,
    replyToComment,
    startReplyToComment,
    cancelReplyToComment,
    loadMoreRootComments,
    rootHasMore,
    threadPages,
    loadMoreThreadComments,
    expandAfterReply,
    onExpandAfterReplyConsumed,
    setShowCommentsPanel,
  } = useDashboardPostComments(postId, t)

  // Force loading comments since modal is open
  useEffect(() => {
    if (open && postId) {
      setShowCommentsPanel(true)
    }
  }, [open, postId, setShowCommentsPanel])

  if (!open || !post) return null

  const author = post.author || {}
  const authorAvatar = author.avatar || (author.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=13b6ec&color=fff` : '/default-avatar.png')
  const mentionsList = normalizeMentions(post.mentions)
  const isLiked = Boolean(post.liked)
  const reactionTotal = getPostReactionTotal(post)
  const userReaction = post.userReaction || null
  const imagesList = Array.isArray(post.images) ? post.images : []
  const documentsList = Array.isArray(post.documents) ? post.documents : []

  const handleLikeClick = () => {
    if (typeof onToggleLike === 'function') onToggleLike()
    hideReactionPicker()
  }

  const handleReactionClick = (type) => {
    if (typeof onToggleLike === 'function') onToggleLike(type)
    hideReactionPicker()
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto custom-scrollbar" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#111e22] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden border border-slate-200 dark:border-[#325a67]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-[#325a67] flex justify-between items-center bg-white dark:bg-[#111e22] sticky top-0 z-10">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {t('dashboard.viewPost') || 'Bài viết của ' + author.name}
          </h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#233f48] rounded-full transition-colors group"
          >
            <span className="material-symbols-outlined text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300">close</span>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-5">
            {/* Author Info */}
            <div className="flex gap-3 mb-4">
              <Link to={author.id || author._id ? ROUTES.PROFILE_USER(author.id || author._id) : '#'}>
                <img src={authorAvatar} alt="" className="size-11 rounded-full object-cover bg-slate-200" />
              </Link>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  <Link to={author.id || author._id ? ROUTES.PROFILE_USER(author.id || author._id) : '#'}>
                    {author.name || 'User'}
                  </Link>
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#92bbc9]">
                  {formatPostTime(post.createdAt)} • {getPostVisibilityLabel(post.visibility, t)}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <div className="text-base leading-relaxed text-slate-800 dark:text-slate-200 mb-4 whitespace-pre-wrap">
              <PostContentBody content={post.content || ''} mentions={mentionsList} />
            </div>

            {/* Shared Post */}
            {post.sharedPost && (
              <div className="mb-4">
                <SharedPostPreviewCard 
                  sharedPost={post.sharedPost}
                  sharedMentions={normalizeMentions(post.sharedPost?.mentions)}
                />
              </div>
            )}

            {/* Media */}
            {imagesList.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1 rounded-xl overflow-hidden border border-slate-200 dark:border-[#325a67]">
                {imagesList.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-full h-auto object-cover max-h-[400px]" />
                ))}
              </div>
            )}
            
            {post.video && (
              <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-[#325a67]">
                <video src={post.video} controls className="w-full max-h-96 bg-black" />
              </div>
            )}

            {documentsList.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                {documentsList.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-[#233f48] border border-slate-100 dark:border-[#325a67]">
                    <span className="material-symbols-outlined text-primary">description</span>
                    <span className="flex-1 text-sm font-medium truncate">{typeof doc === 'string' ? doc : doc?.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="mt-6 pt-2 border-t border-slate-100 dark:border-[#325a67] flex justify-between text-sm text-slate-500 dark:text-[#92bbc9]">
              <div className="flex items-center gap-1">
                {reactionTotal > 0 && (
                  <button 
                    onClick={() => {
                      setReactionsModalInitialTab('all')
                      setShowReactionsModal(true)
                    }}
                    className="hover:underline flex items-center gap-1"
                  >
                    <span className="flex items-center -space-x-1">
                      {POST_REACTION_TYPES.filter(type => post.reactionCounts?.[type] > 0).slice(0, 3).map(type => (
                        <span key={type} className="size-5 rounded-full bg-white dark:bg-[#111e22] ring-1 ring-slate-100 dark:ring-[#325a67] flex items-center justify-center text-[10px]">
                          {REACTION_TYPE_TO_EMOJI[type]}
                        </span>
                      ))}
                    </span>
                    <span className="ml-1">{formatReactionCount(reactionTotal)}</span>
                  </button>
                )}
              </div>
              <div className="flex gap-4">
                <button onClick={() => { setInteractionsType('comments'); setShowInteractionsModal(true); }} className="hover:underline">
                  {t('dashboard.commentsCount', { count: post.commentCount || 0 })}
                </button>
                <button onClick={() => { setInteractionsType('shares'); setShowInteractionsModal(true); }} className="hover:underline">
                  {t('dashboard.sharesCount', { count: post.shareCount || 0 })}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center h-12 mt-1 border-y border-slate-100 dark:border-[#325a67]">
              <div
                ref={likeAreaRef}
                className="relative flex-1 flex items-center justify-center h-full"
                onMouseEnter={handleLikeAreaMouseEnter}
                onMouseLeave={handleLikeAreaMouseLeave}
                onFocus={handleLikeAreaFocus}
                onBlur={handleLikeAreaBlur}
              >
                <button
                  type="button"
                  onClick={handleLikeClick}
                  disabled={likeLoading}
                  className={`w-full h-full flex items-center justify-center gap-2 text-sm font-bold transition-colors hover:bg-slate-50 dark:hover:bg-[#233f48] rounded-md ${isLiked ? 'text-red-500' : 'text-slate-600 dark:text-[#92bbc9]'}`}
                >
                  {isLiked && userReaction ? (
                    <span className="text-xl">{REACTION_TYPE_TO_EMOJI[userReaction]}</span>
                  ) : (
                    <span className={`material-symbols-outlined text-xl ${isLiked ? 'fill-current' : ''}`}>thumb_up</span>
                  )}
                  {isLiked && userReaction ? t(`dashboard.reaction${userReaction.charAt(0).toUpperCase() + userReaction.slice(1)}`) : t('dashboard.like')}
                </button>
              </div>
              <button className="flex-1 h-full flex items-center justify-center gap-2 text-sm font-bold text-slate-600 dark:text-[#92bbc9] hover:bg-slate-50 dark:hover:bg-[#233f48] rounded-md transition-colors">
                <span className="material-symbols-outlined text-xl text-primary">chat_bubble</span>
                {t('dashboard.comment')}
              </button>
              <button className="flex-1 h-full flex items-center justify-center gap-2 text-sm font-bold text-slate-600 dark:text-[#92bbc9] hover:bg-slate-50 dark:hover:bg-[#233f48] rounded-md transition-colors">
                <span className="material-symbols-outlined text-xl">share</span>
                {t('dashboard.share')}
              </button>
            </div>

            {/* Comments Section */}
            <div className="mt-2">
              <PostCommentsSectionBase 
                variant="feed"
                t={t}
                comments={comments}
                commentsLoading={commentsLoading}
                commentSending={commentSending}
                commentError={commentError}
                commentText={commentText}
                setCommentText={setCommentText}
                commentImages={commentImages}
                commentVideo={commentVideo}
                commentAudio={commentAudio}
                commentDocuments={commentDocuments}
                commentUploading={commentUploading}
                showGifPicker={showGifPicker}
                setShowGifPicker={setShowGifPicker}
                gifQuery={gifQuery}
                setGifQuery={setGifQuery}
                gifResults={gifResults}
                gifLoading={gifLoading}
                commentTextareaRef={commentTextareaRef}
                commentImageInputRef={commentImageInputRef}
                commentVideoInputRef={commentVideoInputRef}
                commentAudioInputRef={commentAudioInputRef}
                commentDocInputRef={commentDocInputRef}
                handleCommentImageSelect={handleCommentImageSelect}
                handleCommentVideoSelect={handleCommentVideoSelect}
                handleCommentAudioSelect={handleCommentAudioSelect}
                handleCommentDocSelect={handleCommentDocSelect}
                handleGifSearch={handleGifSearch}
                handleSelectGif={handleSelectGif}
                removeCommentImage={removeCommentImage}
                removeCommentVideo={removeCommentVideo}
                removeCommentAudio={removeCommentAudio}
                removeCommentDoc={removeCommentDoc}
                handleSendComment={handleSendComment}
                handleToggleCommentLike={handleToggleCommentLike}
                handleFeedCommentLikeMouseEnter={handleFeedCommentLikeMouseEnter}
                handleFeedCommentLikeMouseLeave={handleFeedCommentLikeMouseLeave}
                handleFeedCommentLikeFocus={handleFeedCommentLikeFocus}
                handleFeedCommentLikeBlur={handleFeedCommentLikeBlur}
                handleCommentReactionBubbleEnter={handleCommentReactionBubbleEnter}
                handleCommentReactionBubbleLeave={handleCommentReactionBubbleLeave}
                showCommentReactionPicker={showCommentReactionPicker}
                commentReactionBubbleRect={commentReactionBubbleRect}
                hoveredCommentId={hoveredCommentId}
                replyToComment={replyToComment}
                startReplyToComment={startReplyToComment}
                cancelReplyToComment={cancelReplyToComment}
                loadMoreRootComments={loadMoreRootComments}
                rootHasMore={rootHasMore}
                threadPages={threadPages}
                loadMoreThreadComments={loadMoreThreadComments}
                expandAfterReply={expandAfterReply}
                onExpandAfterReplyConsumed={onExpandAfterReplyConsumed}
                setCommentReactionsModalCommentId={() => {}} // Not needed for simple modal
                setCommentReactionsModalInitialTab={() => {}} // Not needed for simple modal
                setShowCommentReactionsModal={() => {}} // Not needed for simple modal
              />
            </div>
          </div>
        </div>

        {/* Floating Reaction Picker */}
        {showReactionPicker && reactionBubbleRect && createPortal(
          <div
            className="fixed z-[10001] flex items-center gap-1 rounded-full bg-white dark:bg-[#1a353d] border border-slate-200 dark:border-[#325a67] shadow-lg p-1.5"
            style={{
              left: reactionBubbleRect.left + reactionBubbleRect.width / 2,
              top: reactionBubbleRect.top - 8,
              transform: 'translate(-50%, -100%)',
            }}
            onMouseEnter={handleBubbleMouseEnter}
            onMouseLeave={handleBubbleMouseLeave}
          >
            {POST_REACTION_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleReactionClick(type)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-[#233f48] transition-transform hover:scale-125 duration-200 text-2xl"
                title={type}
              >
                {REACTION_TYPE_TO_EMOJI[type]}
              </button>
            ))}
          </div>,
          document.body
        )}
      </div>

      <ReactionsModal 
        open={showReactionsModal} 
        onClose={() => setShowReactionsModal(false)}
        mode="post"
        entityId={postId}
        initialTab={reactionsModalInitialTab}
        likeCount={reactionTotal}
        reactionCounts={post.reactionCounts}
      />
      
      <MentionedUsersModal 
        open={showMentionsModal} 
        onClose={() => setShowMentionsModal(false)}
        mentions={mentionsList}
      />

      <PostInteractionsModal 
        open={showInteractionsModal} 
        onClose={() => setShowInteractionsModal(false)}
        postId={postId}
        type={interactionsType}
      />
    </div>
  )

  return createPortal(modalContent, document.body)
}
