import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DEFAULT_AVATAR } from '../../constants/ui'
import { formatPostTime } from '../../utils/dateTime'
import { ROUTES, API_ENDPOINTS, buildApiUrl, POST_REACTION_TYPES, REACTION_TYPE_TO_EMOJI } from '../../constants'
import { communityService, uploadService } from '../../services'
import { searchGiphy, hasGiphyKey } from '../../services/giphy.service'
import { ReactionsModal } from './ReactionsModal'
import { PostCommentsSectionBase } from './PostCommentsSectionBase'
import { PostContentBody } from './PostContentBody'
import { MentionedUsersModal } from './MentionedUsersModal'
import { PostImageViewerModal } from './PostImageViewerModal'
import { usePostReactionPicker, useDashboardPostComments } from '../../hooks/usePostInteractions'
import { PostShareModal } from './PostShareModal'
import { formatReactionCount, normalizeMentions } from '../../utils/post'

/** Max characters to show before "See more" */
const MAX_CONTENT_PREVIEW = 300

export function DashboardPostCard({ post, onToggleLike }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [showMentionsModal, setShowMentionsModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [contentExpanded, setContentExpanded] = useState(false)
  /** null = closed, number = open at that image index */
  const [imageViewerIndex, setImageViewerIndex] = useState(null)
  const [imageViewerReturnPath, setImageViewerReturnPath] = useState(null)
  const [likeLoading, setLikeLoading] = useState(false)
  const [showReactionsModal, setShowReactionsModal] = useState(false)
  const [reactionsModalInitialTab, setReactionsModalInitialTab] = useState('all')
  if (!post) return null

  const postId = post?.id ?? post?._id
  const isLiked = Boolean(post?.liked)
  const userReaction = post?.userReaction || null
  const likeCount = Number(post?.likeCount) ?? 0

  // Like button reaction picker (hover bubble)
  const {
    likeAreaRef: cardLikeAreaRef,
    showReactionPicker,
    reactionBubbleRect,
    handleLikeAreaMouseEnter: handleCardLikeAreaMouseEnter,
    handleLikeAreaMouseLeave: handleCardLikeAreaMouseLeave,
    handleBubbleMouseEnter,
    handleBubbleMouseLeave,
    handleLikeAreaFocus: handleCardLikeAreaFocus,
    handleLikeAreaBlur: handleCardLikeAreaBlur,
    hideReactionPicker: hideCardReactionPicker,
  } = usePostReactionPicker()

  // Comments, uploads, GIF picker logic
  const {
    showCommentsPanel,
    setShowCommentsPanel,
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
    postCardRef,
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
  } = useDashboardPostComments(postId, t)

  const handleLikeClick = () => {
    if (!postId || likeLoading || typeof onToggleLike !== 'function') return
    setLikeLoading(true)
    hideCardReactionPicker()
    const reactionToSend = isLiked ? userReaction || 'like' : 'like'
    communityService
      .setReaction(postId, reactionToSend)
      .then((res) => {
        const data = res?.data ?? res
        const liked = data?.liked === true
        const nextReaction = data?.userReaction ?? null
        const nextCount = typeof data?.likeCount === 'number' ? data.likeCount : undefined
        const reactionCounts = data?.reactionCounts && typeof data.reactionCounts === 'object' ? data.reactionCounts : undefined
        onToggleLike(postId, { liked, userReaction: nextReaction, likeCount: nextCount, reactionCounts })
      })
      .catch(() => {})
      .finally(() => setLikeLoading(false))
  }

  const handleReactionClick = (reactionType) => {
    if (!postId || likeLoading || typeof onToggleLike !== 'function') return
    setLikeLoading(true)
    hideCardReactionPicker()
    communityService
      .setReaction(postId, reactionType)
      .then((res) => {
        const data = res?.data ?? res
        const liked = data?.liked === true
        const nextReaction = data?.userReaction ?? null
        const nextCount = typeof data?.likeCount === 'number' ? data.likeCount : undefined
        const reactionCounts = data?.reactionCounts && typeof data.reactionCounts === 'object' ? data.reactionCounts : undefined
        onToggleLike(postId, { liked, userReaction: nextReaction, likeCount: nextCount, reactionCounts })
      })
      .catch(() => {})
      .finally(() => setLikeLoading(false))
  }

  const author = post.author ?? {}
  const authorAvatar = author.avatar || (author.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
  const mentionsList = normalizeMentions(post.mentions)
  const hasMentions = mentionsList.length > 0
  const firstMention = hasMentions ? mentionsList[0] : null
  const firstMentionId = firstMention && (firstMention.id ?? (typeof firstMention === 'string' ? firstMention : null))
  const othersCount = hasMentions ? mentionsList.length - 1 : 0
  const contentToShow = post.content != null ? String(post.content) : ''
  const isLongContent = contentToShow.length > MAX_CONTENT_PREVIEW
  const contentPreview = isLongContent && !contentExpanded ? contentToShow.slice(0, MAX_CONTENT_PREVIEW) : contentToShow
  const imagesList = Array.isArray(post.images) ? post.images.filter((url) => typeof url === 'string' && url.trim()) : []
  const documentsList = Array.isArray(post.documents) ? post.documents : []

  return (
    <>
      <div ref={postCardRef} className="bg-white dark:bg-[#111e22] rounded-xl border border-slate-200 dark:border-[#325a67] overflow-hidden">
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3">
              <img
                src={authorAvatar}
                alt=""
                className="size-11 rounded-full object-cover bg-slate-300"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {author.name || 'User'}
                  {firstMention && firstMentionId && (
                    <>
                      {' '}
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {t('dashboard.with')}
                      </span>{' '}
                      <Link
                        to={ROUTES.PROFILE_USER(firstMentionId)}
                        className="font-bold text-primary hover:underline"
                      >
                        {firstMention.name || firstMentionId}
                      </Link>
                      {othersCount > 0 && (
                        <>
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            {t('dashboard.and')}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowMentionsModal(true)}
                            className="font-bold text-primary hover:underline ml-0.5"
                          >
                            {t('dashboard.othersCount', { count: othersCount })}
                          </button>
                        </>
                      )}
                    </>
                  )}
                </h4>
              <p className="text-xs text-slate-400 dark:text-[#92bbc9]">{formatPostTime(post.createdAt)} • {post.visibility === 'public' ? (t('dashboard.public') || 'Công khai') : post.visibility}</p>
            </div>
          </div>
          <button type="button" className="text-slate-400 dark:text-[#92bbc9] hover:bg-slate-100 dark:hover:bg-[#233f48] rounded p-1">
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
        </div>
        {/* Content: post body (hashtags, @mentions); long content truncated with "See more" */}
        {(contentToShow || imagesList.length > 0 || post.video || documentsList.length > 0) ? (
          <div className="text-sm leading-relaxed">
            {contentToShow ? (
              <>
                <p className="whitespace-pre-wrap">
                  <PostContentBody content={contentPreview} mentions={mentionsList} />
                  {isLongContent && !contentExpanded && ' ... '}
                </p>
                {isLongContent && (
                  <button
                    type="button"
                    onClick={() => setContentExpanded((v) => !v)}
                    className="mt-1 text-primary font-medium hover:underline"
                  >
                    {contentExpanded ? (t('dashboard.seeLess') || 'Thu gọn') : (t('dashboard.seeMore') || 'Xem thêm')}
                  </button>
                )}
              </>
            ) : (
              <p><span className="inline-block min-h-[1em]">&nbsp;</span></p>
            )}
          </div>
        ) : null}
        {imagesList.length > 0 && (
          <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-[#325a67] flex flex-wrap gap-1">
            {imagesList.map((url, i) => (
              <button
                key={`img-${i}-${url.slice(0, 50)}`}
                type="button"
                onClick={() => {
                  setImageViewerIndex(i)
                  if (postId) {
                    const params = new URLSearchParams()
                    params.set('image', String(i))
                    navigate(`/post/photo/${postId}?${params.toString()}`)
                  }
                }}
                className="flex-1 min-w-0 cursor-pointer block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded overflow-hidden"
              >
                <img
                  alt=""
                  src={url}
                  referrerPolicy="no-referrer"
                  className="max-h-64 w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      <PostImageViewerModal
        open={imageViewerIndex !== null}
        onClose={() => {
          setImageViewerIndex(null)
          navigate(-1)
        }}
        post={post}
        initialImageIndex={imageViewerIndex ?? 0}
        onLikeClick={typeof onToggleLike === 'function' ? handleLikeClick : undefined}
        likeLoading={likeLoading}
        onReactionClick={typeof onToggleLike === 'function' ? handleReactionClick : undefined}
      />
        {post.video && typeof post.video === 'string' && post.video.trim() && (
          <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-[#325a67]">
            <video src={post.video} controls className="w-full max-h-80" preload="metadata" />
          </div>
        )}
        {documentsList.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {documentsList.map((doc, i) => {
              const url = typeof doc === 'string' ? doc : doc?.url
              const name = typeof doc === 'string' ? '' : (doc?.name || '')
              if (!url || typeof url !== 'string') return null
              const label = name || (t('dashboard.document') + ` ${i + 1}`)
              const downloadUrl = post?.id ? buildApiUrl(API_ENDPOINTS.COMMUNITY.POST_DOCUMENT_DOWNLOAD(post.id, i)) : url
              return (
                <a key={`doc-${i}-${url.slice(0, 40)}`} href={downloadUrl} target="_blank" rel="noopener noreferrer" download={Boolean(post?.id)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#233f48] text-sm font-medium text-primary hover:underline max-w-full min-w-0" title={name || undefined}>
                  <span className="material-symbols-outlined text-lg shrink-0">description</span>
                  <span className="truncate">{label}</span>
                </a>
              )
            })}
          </div>
        )}
      </div>
      {/* Post footer: reaction summary + counts row, then Like / Comment / Share buttons */}
      <div className="px-5 pt-2 pb-1 border-t border-slate-100 dark:border-[#325a67]">
        {/* Top row: reaction icons + total count (left) | comments count, shares count (right) */}
        <div className="flex items-center justify-between py-1.5 text-sm text-slate-500 dark:text-[#92bbc9]">
          <div className="flex items-center gap-0.5 min-w-0">
            {likeCount > 0 && (
              <>
                <span className="flex items-center -space-x-3 shrink-0" aria-hidden>
                  {POST_REACTION_TYPES.filter((type) => (post.reactionCounts && post.reactionCounts[type] > 0)).map((reactionType) => (
                    <button
                      key={reactionType}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setReactionsModalInitialTab(reactionType)
                        setShowReactionsModal(true)
                      }}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-[#233f48] transition-colors cursor-pointer text-base leading-none shrink-0"
                      title={reactionType}
                    >
                      {REACTION_TYPE_TO_EMOJI[reactionType]}
                    </button>
                  ))}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setReactionsModalInitialTab('all')
                    setShowReactionsModal(true)
                  }}
                  className="font-medium tabular-nums hover:underline cursor-pointer text-left"
                >
                  {formatReactionCount(likeCount)}
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="tabular-nums">{t('dashboard.commentsCount', { count: post.commentCount ?? 0 })}</span>
            <span className="tabular-nums">{t('dashboard.sharesCount', { count: post.shareCount ?? 0 })}</span>
          </div>
        </div>
        {/* Divider between summary and actions (full-width border line) */}
        <div className="my-1 border-t border-[#325a67]" />
        {/* Bottom row: Thích (hover to show bubble picker above), Bình luận, Chia sẻ - fixed height */}
        <div className="flex items-center h-12">
          <div
            ref={cardLikeAreaRef}
            className="relative flex-1 flex items-center justify-center"
            onMouseEnter={handleCardLikeAreaMouseEnter}
            onMouseLeave={handleCardLikeAreaMouseLeave}
            onFocus={handleCardLikeAreaFocus}
            onBlur={handleCardLikeAreaBlur}
          >
            <button
              type="button"
              onClick={handleLikeClick}
              disabled={likeLoading}
              className={`w-full flex items-center justify-center gap-2 py-2 text-base font-medium transition-colors rounded-lg ${isLiked ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-[#92bbc9] hover:bg-slate-50 dark:hover:bg-[#233f48]'}`}
              aria-pressed={isLiked}
              aria-haspopup="true"
              aria-expanded={showReactionPicker}
            >
              {isLiked && userReaction ? (
                <span className="text-2xl" aria-hidden>{REACTION_TYPE_TO_EMOJI[userReaction] ?? userReaction}</span>
              ) : (
                <span className={`material-symbols-outlined text-2xl ${isLiked ? 'fill-current' : ''}`}>thumb_up</span>
              )}
              {isLiked && userReaction ? t(`dashboard.reaction${userReaction.charAt(0).toUpperCase() + userReaction.slice(1)}`) : t('dashboard.like')}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowCommentsPanel((v) => !v)}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-base font-medium text-slate-500 dark:text-[#92bbc9] hover:bg-slate-50 dark:hover:bg-[#233f48] rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">chat_bubble</span>
            {t('dashboard.comment')}
          </button>
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-base font-medium text-slate-500 dark:text-[#92bbc9] hover:bg-slate-50 dark:hover:bg-[#233f48] rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">share</span>
            {t('dashboard.share')}
          </button>
        </div>

        {showCommentsPanel && (
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
          />
        )}
      </div>
    </div>

      {/* Reaction picker bubble: portal above Like button so not clipped by card overflow */}
      {showReactionPicker && reactionBubbleRect && createPortal(
        <div
          className="fixed z-[100] flex items-center gap-1 rounded-full bg-white dark:bg-[#1a353d] border border-slate-200 dark:border-[#325a67] shadow-lg p-[5px]"
          style={{
            left: reactionBubbleRect.left + reactionBubbleRect.width / 2,
            top: reactionBubbleRect.top - 8,
            transform: 'translate(-50%, -100%)',
          }}
          role="menu"
          aria-label={t('dashboard.reactionPicker') || 'Chọn reaction'}
          onMouseEnter={handleBubbleMouseEnter}
          onMouseLeave={handleBubbleMouseLeave}
        >
          {POST_REACTION_TYPES.map((reactionType) => (
            <button
              key={reactionType}
              type="button"
              role="menuitem"
              onClick={() => handleReactionClick(reactionType)}
              className={`w-11 h-11 flex items-center justify-center rounded-full text-2xl hover:bg-slate-100 dark:hover:bg-[#233f48] transition-colors ${userReaction === reactionType ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-[#111e22]' : ''}`}
              title={reactionType}
            >
              {REACTION_TYPE_TO_EMOJI[reactionType]}
            </button>
          ))}
        </div>,
        document.body
      )}

      <ReactionsModal
        open={showReactionsModal}
        onClose={() => setShowReactionsModal(false)}
        mode="post"
        entityId={postId}
        initialTab={reactionsModalInitialTab}
        likeCount={likeCount}
        reactionCounts={post.reactionCounts}
      />
      <MentionedUsersModal
        open={showMentionsModal}
        onClose={() => setShowMentionsModal(false)}
        mentions={mentionsList}
      />

      <PostShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={post}
        t={t}
      />
    </>
  )
}
