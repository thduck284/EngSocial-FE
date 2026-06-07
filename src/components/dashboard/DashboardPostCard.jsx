import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { formatPostTime } from '../../utils/dateTime'
import { ROUTES, API_ENDPOINTS, buildApiUrl, POST_REACTION_TYPES, REACTION_TYPE_TO_EMOJI } from '../../constants'
import { uploadService, reportService } from '../../services'
import { searchGiphy, hasGiphyKey } from '../../services/giphy.service'
import { ReactionsModal } from '../ui/post/ReactionsModal'
import { PostCommentsSectionBase } from '../ui/post/PostCommentsSectionBase'
import { PostContentBody } from '../ui/post/PostContentBody'
import { PostOptionsMenu } from '../ui/post/PostOptionsMenu'
import { MentionedUsersModal } from '../ui/post/MentionedUsersModal'
import { SharedPostPreviewCard } from '../ui/post/SharedPostPreviewCard'
import { EditPostModal } from '../ui/post/EditPostModal'
import { useDashboardPostCard } from '../../hooks'
import { usePostReactionPicker, useDashboardPostComments } from '../../hooks/usePostInteractions'
import { PostShareModal } from '../ui/post/PostShareModal'
import { formatReactionCount, getPostReactionTotal, incrementCommentCountPatch, getPostVisibilityLabel, normalizeMentions } from '../../utils/post'
import { AlertModal } from '../ui/common/AlertModal'
import { ReportContentModal } from '../ui/common/ReportContentModal'
import { PostInteractionsModal } from '../ui/post/PostInteractionsModal'
import { navigateToPostDetail } from '../../utils/postLinks'

/** Max characters to show before "See more" */
const MAX_CONTENT_PREVIEW = 300

export function DashboardPostCard({
  post,
  onToggleLike,
  onUpdatePost,
  onDeletePost,
  useHomeCommunityStyle = false,
  /** Ẩn tên/link nhóm trong header (vd. đang ở trang bài viết của nhóm đó) */
  hidePostGroupLabel = false,
}) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showMentionsModal, setShowMentionsModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [contentExpanded, setContentExpanded] = useState(false)
  /** null = closed, number = open at that image index */
  const [likeLoading, setLikeLoading] = useState(false)
  const [showReactionsModal, setShowReactionsModal] = useState(false)
  const [reactionsModalInitialTab, setReactionsModalInitialTab] = useState('all')
  const [modalMentions, setModalMentions] = useState([])
  const [editingPost, setEditingPost] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editImages, setEditImages] = useState([])
  const [editVideoUrl, setEditVideoUrl] = useState('')
  const [editDocuments, setEditDocuments] = useState([])
  const [editVisibility, setEditVisibility] = useState('public')
  const [editError, setEditError] = useState('')
  const [editMentionIds, setEditMentionIds] = useState([])
  const [postActionLoading, setPostActionLoading] = useState(false)
  const [editUploading, setEditUploading] = useState(false)
  const [isSavedPost, setIsSavedPost] = useState(Boolean(post?.saved ?? post?.isSaved))
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [showInteractionsModal, setShowInteractionsModal] = useState(false)
  const [interactionsType, setInteractionsType] = useState('comments') // 'comments' | 'shares'
  const [showReportModal, setShowReportModal] = useState(false)
  if (!post) return null

  const postId = post?.id ?? post?._id
  const currentUserId = user?.id ?? user?._id
  const authorId = post?.author?.id ?? post?.author?._id ?? post?.authorId
  const isOwnPost = Boolean(currentUserId && authorId && String(currentUserId) === String(authorId))
  const isLiked = Boolean(post?.liked)
  const userReaction = post?.userReaction || null
  const reactionTotal = getPostReactionTotal(post)

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

  const handleCommentAdded = useCallback(() => {
    if (!postId || typeof onUpdatePost !== 'function') return
    onUpdatePost(postId, incrementCommentCountPatch)
  }, [postId, onUpdatePost])

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
  } = useDashboardPostComments(postId, t, handleCommentAdded)

  const {
    author,
    authorAvatar,
    mentionsList,
    hasMentions,
    firstMention,
    firstMentionId,
    othersCount,
    contentToShow,
    isLongContent,
    contentPreview,
    imagesList,
    documentsList,
    sharedPost,
    sharedMentions,
    handleLikeClick,
    handleReactionClick,
    handleOpenEdit,
    handleSaveEdit,
    handleDeletePost,
    handleReportPost,
    handleToggleSavePost,
  } = useDashboardPostCard({
    post,
    postId,
    isLiked,
    userReaction,
    onToggleLike,
    likeLoading,
    setLikeLoading,
    hideCardReactionPicker,
    contentExpanded,
    maxContentPreview: MAX_CONTENT_PREVIEW,
    setModalMentions,
    setIsSavedPost,
    isOwnPost,
    postActionLoading,
    setEditContent,
    setEditImages,
    setEditVideoUrl,
    setEditDocuments,
    setEditVisibility,
    setEditingPost,
    editContent,
    editImages,
    editVideoUrl,
    editDocuments,
    editVisibility,
    editMentionIds,
    setEditError,
    setPostActionLoading,
    onUpdatePost,
    onDeletePost,
    isSavedPost,
    t,
    onRequestReportPost: () => setShowReportModal(true),
  })
  const canSubmitEdit =
    editContent.trim().length > 0 ||
    editImages.length > 0 ||
    Boolean(editVideoUrl) ||
    editDocuments.length > 0

  const openPostDetailModal = () => {
    if (!postId) return
    navigateToPostDetail(navigate, location, postId)
  }

  const handleEditImageSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setEditUploading(true)
    try {
      const res = await uploadService.uploadMany(files, 'posts/images')
      const urls = Array.isArray(res?.urls) ? res.urls : []
      setEditImages((prev) => [...prev, ...urls])
    } catch {
      setEditError(t('profile.saveFailed'))
    } finally {
      setEditUploading(false)
      e.target.value = ''
    }
  }

  const handleEditVideoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEditUploading(true)
    try {
      const res = await uploadService.uploadVideo(file, 'posts/videos')
      const url = typeof res?.url === 'string' ? res.url : ''
      if (url) setEditVideoUrl(url)
    } catch {
      setEditError(t('profile.saveFailed'))
    } finally {
      setEditUploading(false)
      e.target.value = ''
    }
  }

  const handleEditDocSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setEditUploading(true)
    try {
      const res = await uploadService.uploadMany(files, 'posts/documents')
      const urls = Array.isArray(res?.urls) ? res.urls : []
      const names = Array.isArray(res?.fileNames) ? res.fileNames : []
      const docs = urls.map((url, i) => ({ url, name: names[i] || '' }))
      setEditDocuments((prev) => [...prev, ...docs])
    } catch {
      setEditError(t('profile.saveFailed'))
    } finally {
      setEditUploading(false)
      e.target.value = ''
    }
  }

  return (
    <>
      <div ref={postCardRef} className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3">
              {post?.group?.id && useHomeCommunityStyle && !hidePostGroupLabel ? (
                <div className="relative size-11 shrink-0">
                  <Link
                    to={`/community/group/${post.group.id}/about`}
                    className="block"
                    title={post.group.name || 'Community Group'}
                  >
                    <img
                      src={
                        post.group.icon ||
                        (post.group.name
                          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(post.group.name)}&background=334155&color=fff`
                          : authorAvatar)
                      }
                      alt={post.group.name || 'Group avatar'}
                      className="size-11 rounded-full object-cover bg-slate-200 dark:bg-slate-800 shadow-sm"
                    />
                  </Link>
                  <Link to={authorId ? ROUTES.PROFILE_USER(authorId) : '#'}>
                    <img
                      src={authorAvatar}
                      alt={author.name || 'User avatar'}
                      className="absolute -bottom-0.5 -right-0.5 size-6 rounded-full object-cover border-2 border-white dark:border-card-dark bg-slate-200 hover:brightness-110 shadow-sm"
                    />
                  </Link>
                </div>
              ) : (
                <Link to={authorId ? ROUTES.PROFILE_USER(authorId) : '#'}>
                  <img
                    src={authorAvatar}
                    alt=""
                    className="size-11 rounded-full object-cover bg-slate-200 dark:bg-slate-800 hover:opacity-80 transition-opacity shadow-sm"
                  />
                </Link>
              )}
              <div>
                {post?.group?.id && !hidePostGroupLabel && (
                  <Link
                    to={`/community/group/${post.group.id}/about`}
                    className="inline-flex items-center gap-1.5 text-base text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors mb-0.5 font-black uppercase tracking-tight"
                  >
                    <span className="material-symbols-outlined text-[18px]">groups</span>
                    <span className="font-bold truncate max-w-[320px]">
                      {post.group.name || 'Community Group'}
                    </span>
                  </Link>
                )}
                {post?.group?.id && useHomeCommunityStyle && !hidePostGroupLabel ? (
                  <div className="flex items-center gap-1.5 flex-wrap text-[12px]">
                    <h4 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                      <Link to={authorId ? ROUTES.PROFILE_USER(authorId) : '#'} className="hover:text-primary transition-colors">
                        {author.name || 'User'}
                      </Link>
                      {firstMention && firstMentionId && (
                        <>
                          {' '}
                          <span className="text-[12px] font-medium text-slate-500 dark:text-slate-300">
                            {t('dashboard.with')}
                          </span>{' '}
                          <Link
                            to={ROUTES.PROFILE_USER(firstMentionId)}
                            className="text-[12px] font-bold text-primary hover:underline"
                          >
                            {firstMention.name || firstMentionId}
                          </Link>
                          {othersCount > 0 && (
                            <>
                              <span className="text-[12px] font-medium text-slate-500 dark:text-slate-300">
                                {t('dashboard.and')}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setModalMentions(mentionsList)
                                  setShowMentionsModal(true)
                                }}
                                className="text-[12px] font-bold text-primary hover:underline ml-0.5"
                              >
                                {t('dashboard.othersCount', { count: othersCount })}
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </h4>
                    <span className="text-[12px] text-slate-400 dark:text-gray-500">•</span>
                    <span className="text-[12px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-tighter">
                      {formatPostTime(post.createdAt)}
                    </span>
                    <span className="text-[12px] text-slate-400 dark:text-gray-500">•</span>
                    <span className="text-[12px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest text-[9px]">
                      {getPostVisibilityLabel(post.visibility, t)}
                    </span>
                  </div>
                ) : (
                  <>
                    <h4 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                      <Link to={authorId ? ROUTES.PROFILE_USER(authorId) : '#'} className="hover:text-primary transition-colors">
                        {author.name || 'User'}
                      </Link>
                      {firstMention && firstMentionId && (
                        <>
                          {' '}
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
                            {t('dashboard.with')}
                          </span>{' '}
                          <Link
                            to={ROUTES.PROFILE_USER(firstMentionId)}
                            className="text-sm font-bold text-primary hover:underline"
                          >
                            {firstMention.name || firstMentionId}
                          </Link>
                          {othersCount > 0 && (
                            <>
                              <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
                                {t('dashboard.and')}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setModalMentions(mentionsList)
                                  setShowMentionsModal(true)
                                }}
                                className="text-sm font-bold text-primary hover:underline ml-0.5"
                              >
                                {t('dashboard.othersCount', { count: othersCount })}
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-tighter">
                      {formatPostTime(post.createdAt)} • {getPostVisibilityLabel(post.visibility, t)}
                    </p>
                  </>
                )}
            </div>
          </div>
          <PostOptionsMenu
            isOwnPost={isOwnPost}
            isSavedPost={isSavedPost}
            disabled={postActionLoading}
            onToggleSave={handleToggleSavePost}
            onShare={() => setShowShareModal(true)}
            onEdit={handleOpenEdit}
            onDelete={() => setShowDeleteConfirmModal(true)}
            onReport={handleReportPost}
          />
        </div>
        {/* Content: post body (hashtags, @mentions); long content truncated with "See more" */}
        {(contentToShow || imagesList.length > 0 || post.video || documentsList.length > 0) ? (
          <div className="p-5 pt-0 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            {post.moderation && (post.moderation.level === 'medium' || post.moderation.level === 'high') && (
              <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 flex items-start gap-2.5 shadow-sm">
                <span className="material-symbols-outlined shrink-0 text-amber-500 text-xl">warning</span>
                <div className="text-xs">
                  <p className="font-bold mb-0.5">⚠️ Cảnh báo nội dung ({post.moderation.level === 'high' ? 'Mức độ: Cao' : 'Mức độ: Trung bình'})</p>
                  {post.moderation.keywords && post.moderation.keywords.length > 0 && (
                    <p className="opacity-90">Từ khóa nhạy cảm phát hiện: <span className="font-semibold">{post.moderation.keywords.join(', ')}</span></p>
                  )}
                </div>
              </div>
            )}
            {contentToShow ? (
              <>
                <div className="whitespace-pre-wrap">
                  <PostContentBody
                    content={contentPreview}
                    mentions={hasMentions ? [] : mentionsList}
                  />
                  {isLongContent && !contentExpanded && ' ... '}
                </div>
                {isLongContent && (
                  <button
                    type="button"
                    onClick={() => setContentExpanded((v) => !v)}
                    className="mt-2 text-primary font-bold hover:underline text-xs"
                  >
                    {contentExpanded ? (t('dashboard.seeLess') || 'Thu gọn') : (t('dashboard.seeMore') || 'Xem thêm')}
                  </button>
                )}
              </>
            ) : null}

            {sharedPost && (
              <div className="mt-4">
                <SharedPostPreviewCard
                  sharedPost={sharedPost}
                  sharedPostId={post?.sharedPostId}
                  sharedMentions={sharedMentions}
                  contentExpanded={contentExpanded}
                  onToggleContentExpanded={() => setContentExpanded((v) => !v)}
                  onOpenMentions={() => {
                    setModalMentions(sharedMentions)
                    setShowMentionsModal(true)
                  }}
                  onOpenImageViewer={(index) => {
                    const spId = sharedPost?.id ?? sharedPost?._id
                    if (spId) {
                      const params = new URLSearchParams()
                      params.set('image', String(index))
                      navigate(`/post/photo/${spId}?${params.toString()}`, { state: { background: location } })
                    }
                  }}
                />
              </div>
            )}

            {imagesList.length > 0 && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100 dark:border-border-dark flex flex-wrap gap-1 bg-slate-50 dark:bg-slate-900/20 shadow-inner">
                {imagesList.map((url, i) => (
                  <button
                    key={`img-${i}-${url.slice(0, 50)}`}
                    type="button"
                    onClick={() => {
                      if (postId) {
                        const params = new URLSearchParams()
                        params.set('image', String(i))
                        navigate(`/post/photo/${postId}?${params.toString()}`, { state: { background: location } })
                      }
                    }}
                    className="flex-1 min-w-[200px] cursor-pointer block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded overflow-hidden"
                  >
                    <img
                      alt=""
                      src={url}
                      referrerPolicy="no-referrer"
                      className="max-h-[500px] w-full object-cover hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
            {post.video && typeof post.video === 'string' && post.video.trim() && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100 dark:border-border-dark bg-black shadow-lg">
                <video src={post.video} controls className="w-full max-h-[500px]" preload="metadata" />
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
                    <a key={`doc-${i}-${url.slice(0, 40)}`} href={downloadUrl} target="_blank" rel="noopener noreferrer" download={Boolean(post?.id)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-sm font-black text-primary hover:bg-primary/10 transition-colors max-w-full min-w-0 border border-slate-200 dark:border-white/5 shadow-sm" title={name || undefined}>
                      <span className="material-symbols-outlined text-lg shrink-0">description</span>
                      <span className="truncate">{label}</span>
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        ) : null}
      </div>
      {/* Post footer: reaction summary + counts row, then Like / Comment / Share buttons */}
      <div className="px-5 pt-2 pb-1 border-t border-slate-100 dark:border-border-dark">
        {/* Top row: reaction icons + total count (left) | comments count, shares count (right) */}
        <div className="flex items-center justify-between py-1.5 text-sm text-slate-500 dark:text-gray-400 font-bold">
          <div className="flex items-center gap-0.5 min-w-0">
            {reactionTotal > 0 && (
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
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer text-base leading-none shrink-0"
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
                  className="font-medium tabular-nums hover:underline cursor-pointer text-left ml-1"
                >
                  {formatReactionCount(reactionTotal)}
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={openPostDetailModal}
              className="tabular-nums hover:underline hover:text-primary transition-colors cursor-pointer"
            >
              {t('dashboard.commentsCount', { count: post.commentCount ?? 0 })}
            </button>
            <button
              onClick={() => {
                setInteractionsType('shares')
                setShowInteractionsModal(true)
              }}
              className="tabular-nums hover:underline hover:text-primary transition-colors cursor-pointer"
            >
              {t('dashboard.sharesCount', { count: post.shareCount ?? 0 })}
            </button>
          </div>
        </div>
        {/* Divider between summary and actions (full-width border line) */}
        <div className="my-1 border-t border-slate-100 dark:border-border-dark" />
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
              className={`w-full h-full flex items-center justify-center gap-2.5 py-2 text-sm font-black transition-all rounded-xl ${isLiked ? 'text-primary' : 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              aria-pressed={isLiked}
              aria-haspopup="true"
              aria-expanded={showReactionPicker}
            >
              {isLiked && userReaction ? (
                <span className="text-xl" aria-hidden>{REACTION_TYPE_TO_EMOJI[userReaction] ?? userReaction}</span>
              ) : (
                <span className={`material-symbols-outlined text-2xl ${isLiked ? 'fill-current' : ''}`}>thumb_up</span>
              )}
              {isLiked && userReaction ? t(`dashboard.reaction${userReaction.charAt(0).toUpperCase() + userReaction.slice(1)}`) : t('dashboard.like')}
            </button>
          </div>
          <button
            type="button"
            onClick={openPostDetailModal}
            className="flex-1 h-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-slate-500 dark:text-[#92bbc9] hover:bg-slate-50 dark:hover:bg-[#233f48] rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">chat_bubble</span>
            {t('dashboard.comment')}
          </button>
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="flex-1 h-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-slate-500 dark:text-[#92bbc9] hover:bg-slate-50 dark:hover:bg-[#233f48] rounded-lg transition-colors"
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
        likeCount={reactionTotal}
        reactionCounts={post.reactionCounts}
      />
      <MentionedUsersModal
        open={showMentionsModal}
        onClose={() => setShowMentionsModal(false)}
        mentions={modalMentions.length ? modalMentions : mentionsList}
      />

      <PostShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={post}
        t={t}
        onRepostSuccess={(sharedPostId) => {
          if (!sharedPostId || typeof onUpdatePost !== 'function') return
          const cur = Number(post?.shareCount)
          const base = Number.isFinite(cur) ? cur : 0
          onUpdatePost(sharedPostId, { shareCount: base + 1 })
        }}
      />
      <EditPostModal
        open={editingPost}
        t={t}
        authorName={author.name}
        authorAvatar={authorAvatar}
        content={editContent}
        setContent={(v) => {
          setEditContent(v)
          if (editError) setEditError('')
        }}
        initialMentions={normalizeMentions(post?.mentions)}
        initialMentionIds={normalizeMentions(post?.mentions).map((m) => String(m?.id ?? m?._id ?? m)).filter(Boolean)}
        onMentionIdsChange={setEditMentionIds}
        visibility={editVisibility}
        setVisibility={setEditVisibility}
        images={editImages}
        videoUrl={editVideoUrl}
        documents={editDocuments}
        onImageSelect={handleEditImageSelect}
        onVideoSelect={handleEditVideoSelect}
        onDocSelect={handleEditDocSelect}
        onAddGif={(url) => {
          if (!url) return
          setEditImages((prev) => [...prev, url])
        }}
        removeImage={(idx) => setEditImages((prev) => prev.filter((_, i) => i !== idx))}
        removeVideo={() => setEditVideoUrl('')}
        removeDoc={(idx) => setEditDocuments((prev) => prev.filter((_, i) => i !== idx))}
        onClose={() => {
          setEditingPost(false)
          if (editError) setEditError('')
        }}
        onSave={handleSaveEdit}
        loading={postActionLoading}
        uploading={editUploading}
        error={editError}
        canSubmit={canSubmitEdit}
      />
      <AlertModal
        open={showDeleteConfirmModal}
        title={t('common.notification')}
        message={t('dashboard.deletePostConfirm') || 'Delete this post?'}
        confirmText={t('dashboard.deletePost') || 'Delete'}
        cancelText={t('buttons.cancel') || 'Cancel'}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={() => {
          setShowDeleteConfirmModal(false)
          handleDeletePost()
        }}
      />
      <PostInteractionsModal
        open={showInteractionsModal}
        onClose={() => setShowInteractionsModal(false)}
        postId={postId}
        type={interactionsType}
      />
      <ReportContentModal
        open={showReportModal}
        titleKey="report.titlePost"
        onClose={() => setShowReportModal(false)}
        onSubmit={async ({ reason, details }) => {
          await reportService.submitReport({
            targetType: 'post',
            targetId: String(postId),
            reason,
            details,
          })
        }}
      />
    </>
  )
}