import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DEFAULT_AVATAR } from '../../constants/ui'
import { ROUTES, POST_REACTION_TYPES, REACTION_TYPE_TO_EMOJI } from '../../constants'
import { formatPostTime } from '../../utils/dateTime'
import { formatReactionCount, normalizeMentions } from '../../utils/post'
import { usePostReactionPicker, usePostImageViewer } from '../../hooks/usePostInteractions'
import { usePostImageViewerComments } from '../../hooks/usePostImageViewerComments'
import { PostImageViewerLeft } from './PostImageViewerLeft'
import { hasGiphyKey } from '../../services/giphy.service'
import { ReactionsModal } from './ReactionsModal'
import { PostContentBody } from './PostContentBody'
import { MentionedUsersModal } from './MentionedUsersModal'
import { PostImageViewerCommentsSection } from './PostImageViewerCommentsSection'

export function PostImageViewerModal({ open, onClose, post, initialImageIndex = 0, onLikeClick, likeLoading = false, onReactionClick }) {
  const { t } = useTranslation()
  const [showMentionsModal, setShowMentionsModal] = useState(false)
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false)
  const [showReactionsModal, setShowReactionsModal] = useState(false)
  const [reactionsModalInitialTab, setReactionsModalInitialTab] = useState('all')
  const optionsMenuRef = useRef(null)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [reactionBubbleRect, setReactionBubbleRect] = useState(null)
  const {
    likeAreaRef: cardLikeAreaRef,
    showReactionPicker: cardShowReactionPicker,
    reactionBubbleRect: cardReactionBubbleRect,
    handleLikeAreaMouseEnter: handleCardLikeAreaMouseEnter,
    handleLikeAreaMouseLeave: handleCardLikeAreaMouseLeave,
    handleBubbleMouseEnter: handleCardBubbleMouseEnter,
    handleBubbleMouseLeave: handleCardBubbleMouseLeave,
    handleLikeAreaFocus: handleCardLikeAreaFocus,
    handleLikeAreaBlur: handleCardLikeAreaBlur,
    hideReactionPicker: hideCardReactionPicker,
  } = usePostReactionPicker()
  const [showCommentReactionsModal, setShowCommentReactionsModal] = useState(false)
  const [commentReactionsModalInitialTab, setCommentReactionsModalInitialTab] = useState('all')
  const [commentReactionsModalCommentId, setCommentReactionsModalCommentId] = useState(null)

  const imagesList = Array.isArray(post?.images) ? post.images.filter((url) => typeof url === 'string' && url.trim()) : []
  const postId = post?.id ?? post?._id
  const author = post?.author ?? {}
  const authorAvatar = author.avatar || (author.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
  const mentionsList = normalizeMentions(post?.mentions)
  const contentToShow = post?.content != null ? String(post.content) : ''
  const isLikedInModal = Boolean(post?.liked)
  const likeCountInModal = Number(post?.likeCount) ?? 0
  const userReactionInModal = post?.userReaction || null

  // Hook điều khiển viewer ảnh (index, zoom, fullscreen, expand)
  const {
    currentIndex,
    zoom,
    fullscreen,
    contentExpanded,
    setContentExpanded,
    hasMultiple,
    goPrev,
    goNext,
    zoomIn,
    zoomOut,
    toggleFullscreen,
  } = usePostImageViewer({ open, initialImageIndex, imagesList, onClose })

  const currentSrc = imagesList[currentIndex] || null
  const isLongContent = contentToShow.length > 300
  const contentPreview = isLongContent && !contentExpanded ? contentToShow.slice(0, 300) : contentToShow

  // Hook comment + reaction cho modal ảnh
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
    commentReactionPicker,
    handleCommentLikeMouseEnter,
    handleCommentLikeMouseLeave,
    handleCommentReactionBubbleEnter,
    handleCommentReactionBubbleLeave,
    handleFeedCommentLikeMouseEnter,
    handleFeedCommentLikeMouseLeave,
    replyToComment,
    startReplyToComment,
    cancelReplyToComment,
  } = usePostImageViewerComments(postId, t, open)

  useEffect(() => {
    if (!optionsMenuOpen) return
    const handleClickOutside = (e) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target)) setOptionsMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [optionsMenuOpen])

  useEffect(() => {
    if (!showReactionPicker || !cardLikeAreaRef.current) {
      setReactionBubbleRect(null)
      return
    }
    const el = cardLikeAreaRef.current
    const rect = el.getBoundingClientRect()
    setReactionBubbleRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })
  }, [showReactionPicker, cardLikeAreaRef])

  // Phần bắt phím / fullscreen đã được di chuyển vào usePostImageViewer


  if (!open) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-background-dark text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh bài viết"
    >
      <div className="flex flex-1 min-h-0 w-full flex-col md:flex-row">
        {/* Left: image viewer */}
        <PostImageViewerLeft
          currentSrc={currentSrc}
          zoom={zoom}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          fullscreen={fullscreen}
          toggleFullscreen={toggleFullscreen}
          hasMultiple={hasMultiple}
          goPrev={goPrev}
          goNext={goNext}
          onClose={onClose}
          t={t}
        />

        {/* Right: post context + actions + comments (hidden in fullscreen) */}
        {!fullscreen && (
        <aside className="w-full md:max-w-[400px] flex-1 flex flex-col bg-[#111e22] border-t md:border-t-0 md:border-l border-[#325a67] overflow-y-auto pt-4">
          <div className="border-b border-[#325a67] px-4 py-2">
            <div className="flex items-start justify-between gap-2">
              <img src={authorAvatar} alt="" className="size-9 rounded-full object-cover bg-slate-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-100">
                  <span className="font-bold">{author.name || 'User'}</span>
                  {mentionsList.length > 0 && (
                    <>
                      {' '}
                      <span className="font-medium text-slate-400">{t('dashboard.with') || 'cùng với'}</span>{' '}
                      {mentionsList.slice(0, 1).map((m) => {
                        const id = m?.id ?? (typeof m === 'string' ? m : '')
                        const name = (m?.name ?? id) || '—'
                        return (
                          <Link key={id} to={ROUTES.PROFILE_USER(id)} className="font-bold text-primary hover:underline">
                            {name}
                          </Link>
                        )
                      })}
                      {mentionsList.length > 1 && (
                        <>
                          {' '}
                          <span className="font-medium text-slate-400">{t('dashboard.and') || 'và'}</span>{' '}
                          <button
                            type="button"
                            onClick={() => setShowMentionsModal(true)}
                            className="font-bold text-primary hover:underline"
                          >
                            {t('dashboard.othersCount', { count: mentionsList.length - 1 })}
                          </button>
                        </>
                      )}
                    </>
                  )}
                </p>
                <p className="text-xs text-[#92bbc9]">
                  {formatPostTime(post?.createdAt)} ·
                  {(post?.visibility === 'public' && (t('dashboard.public') || 'Công khai')) ||
                    (post?.visibility === 'friends' && (t('dashboard.friendsOnly') || 'Bạn bè')) ||
                    (post?.visibility === 'private' && (t('dashboard.privateOnly') || 'Chỉ mình tôi')) ||
                    post?.visibility ||
                    '—'}
                </p>
              </div>
              <div className="relative shrink-0" ref={optionsMenuRef}>
                <button
                  type="button"
                  onClick={() => setOptionsMenuOpen((v) => !v)}
                  className="p-1 rounded hover:bg-[#233f48] text-[#92bbc9] hover:text-slate-300 transition-colors"
                  aria-label="Tùy chọn"
                  aria-expanded={optionsMenuOpen}
                >
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
                {optionsMenuOpen && (
                  <div className="absolute right-0 top-full z-10 mt-1 min-w-[180px] rounded-xl border border-[#325a67] bg-[#111e22] py-1 shadow-xl">
                    <button
                      type="button"
                      onClick={() => setOptionsMenuOpen(false)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-200 hover:bg-[#233f48]"
                    >
                      <span className="material-symbols-outlined text-lg">bookmark</span>
                      {t('dashboard.savePost') || 'Lưu bài viết'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {(contentToShow.trim() || mentionsList.length > 0) ? (
            <div className="border-b border-[#325a67] px-4 py-2">
              <div className="text-sm leading-relaxed text-slate-300">
                <p className="whitespace-pre-wrap break-words">
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
              </div>
            </div>
          ) : null}
          {/* Reaction summary row inside image modal (same layout as feed footer) */}
          <div className="flex items-center justify-between px-4 pt-1 pb-0.5 text-sm text-slate-500 dark:text-[#92bbc9]">
            <div className="flex items-center gap-0.5 min-w-0">
              {likeCountInModal > 0 && (
                <>
                  <span className="flex items-center -space-x-3 shrink-0" aria-hidden>
                    {POST_REACTION_TYPES.filter((type) => (post.reactionCounts && post.reactionCounts[type] > 0)).map(
                      (reactionType) => (
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
                      )
                    )}
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
                    {formatReactionCount(likeCountInModal)}
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="tabular-nums">{t('dashboard.commentsCount', { count: post.commentCount ?? 0 })}</span>
              <span className="tabular-nums">{t('dashboard.sharesCount', { count: post.shareCount ?? 0 })}</span>
            </div>
          </div>
          <div className="flex w-full items-center justify-between border-b border-[#325a67] px-3 py-1.5">
            <div
              ref={cardLikeAreaRef}
              className="flex flex-1 items-center justify-center"
              onMouseEnter={handleCardLikeAreaMouseEnter}
              onMouseLeave={handleCardLikeAreaMouseLeave}
              onFocus={handleCardLikeAreaFocus}
              onBlur={handleCardLikeAreaBlur}
            >
              <button
                type="button"
                onClick={() => typeof onLikeClick === 'function' && !likeLoading && onLikeClick()}
                disabled={likeLoading}
                className={`w-full flex items-center justify-center gap-1 py-0.5 text-sm font-medium transition-colors rounded-lg ${
                  isLikedInModal ? 'text-red-400' : 'text-[#92bbc9] hover:text-red-400'
                } ${likeLoading ? 'opacity-70 pointer-events-none' : ''}`}
                aria-pressed={isLikedInModal}
                aria-haspopup="true"
                aria-expanded={cardShowReactionPicker}
              >
                {likeLoading ? (
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                ) : isLikedInModal && userReactionInModal ? (
                  <span className="text-xl" aria-hidden>
                    {REACTION_TYPE_TO_EMOJI[userReactionInModal] ?? userReactionInModal}
                  </span>
                ) : (
                  <span className={`material-symbols-outlined text-xl ${isLikedInModal ? 'fill-current' : ''}`}>
                    thumb_up
                  </span>
                )}
                {isLikedInModal && userReactionInModal
                  ? t(`dashboard.reaction${userReactionInModal.charAt(0).toUpperCase() + userReactionInModal.slice(1)}`)
                  : t('dashboard.like')}
              </button>
            </div>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-1 py-0.5 text-sm font-medium text-[#92bbc9] hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-xl">chat_bubble</span>
              {t('dashboard.comment') || 'Bình luận'}
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-1 py-0.5 text-sm font-medium text-[#92bbc9] hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-xl">share</span>
              {t('dashboard.share') || 'Chia sẻ'}
            </button>
          </div>
          <PostImageViewerCommentsSection
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
            setCommentReactionsModalCommentId={setCommentReactionsModalCommentId}
            setCommentReactionsModalInitialTab={setCommentReactionsModalInitialTab}
            setShowCommentReactionsModal={setShowCommentReactionsModal}
            replyToComment={replyToComment}
            startReplyToComment={startReplyToComment}
            cancelReplyToComment={cancelReplyToComment}
          />
        </aside>
        )}
      </div>
      {commentReactionPicker.open && commentReactionPicker.anchorRect && createPortal(
        <div
          className="fixed z-[101] flex items-center gap-1 rounded-full bg-white dark:bg-[#1a353d] border border-slate-200 dark:border-[#325a67] shadow-lg p-[5px]"
          style={{
            left: commentReactionPicker.anchorRect.left + commentReactionPicker.anchorRect.width / 2,
            top: commentReactionPicker.anchorRect.top - 8,
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
              onClick={() => {
                handleToggleCommentLike(commentReactionPicker.commentId, reactionType)
                closeCommentReactionPicker()
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full text-xl hover:bg-slate-100 dark:hover:bg-[#233f48] transition-colors"
              title={reactionType}
            >
              {REACTION_TYPE_TO_EMOJI[reactionType]}
            </button>
          ))}
        </div>,
        document.body
      )}
      {cardShowReactionPicker && cardReactionBubbleRect && createPortal(
        <div
          className="fixed z-[100] flex items-center gap-1 rounded-full bg-white dark:bg-[#1a353d] border border-slate-200 dark:border-[#325a67] shadow-lg p-[5px]"
          style={{
            left: cardReactionBubbleRect.left + cardReactionBubbleRect.width / 2,
            top: cardReactionBubbleRect.top - 8,
            transform: 'translate(-50%, -100%)',
          }}
          role="menu"
          aria-label={t('dashboard.reactionPicker') || 'Chọn reaction'}
          onMouseEnter={handleCardBubbleMouseEnter}
          onMouseLeave={handleCardBubbleMouseLeave}
        >
          {POST_REACTION_TYPES.map((reactionType) => (
            <button
              key={reactionType}
              type="button"
              role="menuitem"
              onClick={() => typeof onReactionClick === 'function' && onReactionClick(reactionType)}
              className={`w-11 h-11 flex items-center justify-center rounded-full text-2xl hover:bg-slate-100 dark:hover:bg-[#233f48] transition-colors ${
                userReactionInModal === reactionType ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-[#111e22]' : ''
              }`}
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
        entityId={post?.id ?? post?._id}
        initialTab={reactionsModalInitialTab}
        likeCount={likeCountInModal}
        reactionCounts={post?.reactionCounts}
      />
      <MentionedUsersModal
        open={showMentionsModal}
        onClose={() => setShowMentionsModal(false)}
        mentions={mentionsList}
      />
      <ReactionsModal
        open={showCommentReactionsModal}
        onClose={() => setShowCommentReactionsModal(false)}
        mode="comment"
        entityId={commentReactionsModalCommentId}
        initialTab={commentReactionsModalInitialTab}
        likeCount={0}
        reactionCounts={{}}
      />
    </div>
  )

  return createPortal(modalContent, document.body)
}

