import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { DEFAULT_AVATAR } from '../../constants/ui'
import { formatPostTime } from '../../utils/dateTime'
import { parseContentSegments } from '../../utils/postContent'
import { ROUTES, API_ENDPOINTS, buildApiUrl, POST_REACTION_TYPES, REACTION_TYPE_TO_EMOJI } from '../../constants'
import { communityService } from '../../services'
import { PostReactionsModal } from './PostReactionsModal'

/** Hover delay in ms before showing reaction picker */
const REACTION_PICKER_HOVER_DELAY = 1000
/** How long the picker stays visible after showing when not hovering bubble (ms) */
const REACTION_PICKER_VISIBLE_DURATION = 4000
/** Delay before hiding when leaving like area or bubble (allows move to bubble/like without flicker) */
const REACTION_PICKER_LEAVE_DELAY = 300

/** Max characters to show before "See more" */
const MAX_CONTENT_PREVIEW = 300

/** Format reaction count for display (e.g. 1600 -> "1,6K", 42 -> "42") */
function formatReactionCount(n) {
  const num = Number(n) || 0
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace('.', ',')}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace('.', ',')}K`
  return String(num)
}

/**
 * Renders post content with clickable hashtags and @mentions.
 */
function PostContentBody({ content, mentions = [] }) {
  const segments = parseContentSegments(content || '', mentions)
  if (segments.length === 0) return <span className="whitespace-pre-wrap">{content || ''}</span>
  return (
    <span className="whitespace-pre-wrap">
      {segments.map((seg, i) => {
        if (seg.type === 'text') return <span key={i}>{seg.value}</span>
        if (seg.type === 'hashtag') {
          return (
            <Link
              key={i}
              to={`${ROUTES.SEARCH}?q=${encodeURIComponent(seg.value)}`}
              className="text-primary font-medium hover:underline"
            >
              {seg.value}
            </Link>
          )
        }
        if (seg.type === 'mention' && seg.mention?.id) {
          return (
            <Link
              key={i}
              to={ROUTES.PROFILE_USER(seg.mention.id)}
              className="text-primary font-medium hover:underline"
            >
              {seg.value}
            </Link>
          )
        }
        return <span key={i}>{seg.value}</span>
      })}
    </span>
  )
}

/**
 * Normalize mentions to array of { id, name?, avatar? } (backend may return populated or raw id).
 */
function normalizeMentions(mentions) {
  if (!Array.isArray(mentions)) return []
  return mentions.map((m) => {
    if (m && typeof m === 'object' && (m.id || m._id)) return { id: String(m.id ?? m._id), name: m.name, avatar: m.avatar }
    if (typeof m === 'string') return { id: m, name: undefined, avatar: undefined }
    return null
  }).filter(Boolean)
}

/**
 * Modal: list all mentioned users (avatar + name, link to profile).
 */
function MentionedUsersModal({ open, onClose, mentions = [] }) {
  const { t } = useTranslation()
  if (!open) return null
  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-[#111e22] rounded-xl shadow-xl border border-slate-200 dark:border-[#325a67] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('dashboard.mentionedUsers') || 'Người được nhắc đến'}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#325a67]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t('dashboard.mentionedUsers') || 'Người được nhắc đến'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#233f48] text-slate-500 dark:text-[#92bbc9] transition-colors"
            aria-label={t('buttons.close') || 'Đóng'}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
          {mentions.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-500 dark:text-[#92bbc9]">{t('dashboard.noMentions') || 'Không có.'}</p>
          ) : (
            <ul className="py-2">
              {mentions.map((m) => {
                const id = m?.id ?? (typeof m === 'string' ? m : '')
                const name = (m?.name ?? id) || '—'
                const avatar = m?.avatar || (name !== '—' ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
                return (
                  <li key={id}>
                    <Link
                      to={ROUTES.PROFILE_USER(id)}
                      onClick={onClose}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-[#233f48] transition-colors"
                    >
                      <img src={avatar} alt="" className="size-10 rounded-full object-cover shrink-0" />
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
  return createPortal(modalContent, document.body)
}

/**
 * Full-screen image viewer modal: left = image + carousel/zoom/fullscreen, right = post context + actions + comments.
 * Styled to match app theme (dark card, primary accents).
 */
function PostImageViewerModal({ open, onClose, post, initialImageIndex = 0, onLikeClick, likeLoading = false }) {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(initialImageIndex)
  const [zoom, setZoom] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [contentExpanded, setContentExpanded] = useState(false)
  const [showMentionsModal, setShowMentionsModal] = useState(false)
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false)
  const optionsMenuRef = useRef(null)

  const imagesList = Array.isArray(post?.images) ? post.images.filter((url) => typeof url === 'string' && url.trim()) : []
  const hasMultiple = imagesList.length > 1
  const currentSrc = imagesList[currentIndex] || null
  const author = post?.author ?? {}
  const authorAvatar = author.avatar || (author.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
  const mentionsList = normalizeMentions(post?.mentions)
  const contentToShow = post?.content != null ? String(post.content) : ''
  const isLongContent = contentToShow.length > MAX_CONTENT_PREVIEW
  const contentPreview = isLongContent && !contentExpanded ? contentToShow.slice(0, MAX_CONTENT_PREVIEW) : contentToShow
  const isLikedInModal = Boolean(post?.liked)
  const likeCountInModal = Number(post?.likeCount) ?? 0

  useEffect(() => {
    if (!open) return
    setCurrentIndex(Math.min(initialImageIndex, Math.max(0, imagesList.length - 1)))
    setZoom(1)
    setFullscreen(false)
    setContentExpanded(false)
    setShowMentionsModal(false)
    setOptionsMenuOpen(false)
  }, [open, initialImageIndex, imagesList.length])

  useEffect(() => {
    if (!optionsMenuOpen) return
    const handleClickOutside = (e) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target)) setOptionsMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [optionsMenuOpen])

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (fullscreen) setFullscreen(false)
        else onClose()
      }
      if (e.key === 'ArrowLeft' && hasMultiple) setCurrentIndex((i) => (i - 1 + imagesList.length) % imagesList.length)
      if (e.key === 'ArrowRight' && hasMultiple) setCurrentIndex((i) => (i + 1) % imagesList.length)
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, fullscreen, hasMultiple, imagesList.length])

  const goPrev = () => setCurrentIndex((i) => (i - 1 + imagesList.length) % imagesList.length)
  const goNext = () => setCurrentIndex((i) => (i + 1) % imagesList.length)
  const zoomIn = () => setZoom((z) => Math.min(4, z + 0.25))
  const zoomOut = () => setZoom((z) => Math.max(0.5, z - 0.25))
  const toggleFullscreen = () => setFullscreen((v) => !v)

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
        <div className="flex-1 flex flex-col min-h-[50vh] md:min-h-0 min-w-0 bg-black/40 relative">
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 bg-gradient-to-b from-black/60 to-transparent">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label={t('buttons.close') || 'Đóng'}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={zoomOut}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Thu nhỏ"
              >
                <span className="material-symbols-outlined">zoom_out</span>
              </button>
              <button
                type="button"
                onClick={zoomIn}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Phóng to"
              >
                <span className="material-symbols-outlined">zoom_in</span>
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Toàn màn hình"
              >
                <span className="material-symbols-outlined">{fullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
              </button>
            </div>
          </div>
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Ảnh trước"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Ảnh sau"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </>
          )}
          <div className="flex-1 flex items-center justify-center min-h-0 p-4 overflow-auto">
            {currentSrc && (
              <img
                src={currentSrc}
                alt=""
                className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
                onClick={(e) => e.stopPropagation()}
                referrerPolicy="no-referrer"
                draggable={false}
              />
            )}
          </div>
        </div>

        {/* Right: post context + actions + comments (hidden in fullscreen) */}
        {!fullscreen && (
        <aside className="w-full md:max-w-[400px] flex-shrink-0 flex flex-col bg-[#111e22] border-t md:border-t-0 md:border-l border-[#325a67] overflow-hidden pt-4">
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
                <p className="text-xs text-[#92bbc9]">{formatPostTime(post?.createdAt)} · {(post?.visibility === 'public' && (t('dashboard.public') || 'Công khai')) || (post?.visibility === 'friends' && (t('dashboard.friendsOnly') || 'Bạn bè')) || (post?.visibility === 'private' && (t('dashboard.privateOnly') || 'Chỉ mình tôi')) || post?.visibility || '—'}</p>
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
            <div className="border-b border-[#325a67] px-4 py-2 max-h-64 overflow-y-auto custom-scrollbar">
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
          <div className="flex w-full items-center justify-between border-b border-[#325a67] px-3 py-1.5">
            <button
              type="button"
              onClick={() => typeof onLikeClick === 'function' && !likeLoading && onLikeClick()}
              disabled={likeLoading}
              className={`flex flex-1 items-center justify-center gap-1 py-0.5 text-xs font-medium transition-colors ${isLikedInModal ? 'text-red-400' : 'text-[#92bbc9] hover:text-red-400'} ${likeLoading ? 'opacity-70 pointer-events-none' : ''}`}
            >
              {likeLoading ? (
                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
              ) : (
                <span className={`material-symbols-outlined text-lg ${isLikedInModal ? 'fill-current' : ''}`}>favorite</span>
              )}
              {likeCountInModal}
            </button>
            <button type="button" className="flex flex-1 items-center justify-center gap-1 py-0.5 text-xs font-medium text-[#92bbc9] hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg">chat_bubble</span>
              {t('dashboard.comment') || 'Bình luận'}
            </button>
            <button type="button" className="flex flex-1 items-center justify-center gap-1 py-0.5 text-xs font-medium text-[#92bbc9] hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg">share</span>
              {t('dashboard.share') || 'Chia sẻ'}
            </button>
          </div>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 flex items-center justify-center overflow-y-auto custom-scrollbar px-2 min-h-0">
              <div className="flex flex-col items-center justify-center py-1 text-center">
                <span className="material-symbols-outlined text-3xl text-[#325a67] mb-1">description</span>
                <p className="text-xs font-medium text-slate-300">{t('dashboard.noCommentsYet') || 'Chưa có bình luận nào'}</p>
                <p className="text-[11px] text-[#92bbc9] mt-0.5">{t('dashboard.beFirstToComment') || 'Hãy là người đầu tiên bình luận.'}</p>
              </div>
            </div>
            <div className="px-2 py-0.5 border-t border-[#325a67] flex items-center gap-1 bg-[#0f191c] shrink-0">
              <input
                type="text"
                placeholder={t('dashboard.writeComment') || 'Viết bình luận...'}
                className="flex-1 min-w-0 px-2 py-1 rounded-full bg-[#233f48] border border-[#325a67] text-slate-100 placeholder:text-[#92bbc9] text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <button type="button" className="p-1 rounded-full text-primary hover:bg-[#233f48] transition-colors shrink-0" aria-label="Gửi">
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
        </aside>
        )}
      </div>
      <MentionedUsersModal
        open={showMentionsModal}
        onClose={() => setShowMentionsModal(false)}
        mentions={mentionsList}
      />
    </div>
  )
  return createPortal(modalContent, document.body)
}

/**
 * Single post card in the feed (author + mentions in header, full content in body, media, actions).
 * Defensive against missing or malformed data (mention, hashtag, images, video, documents).
 * onToggleLike(postId, { liked }) is called after successful like/unlike to sync feed state.
 */
export function DashboardPostCard({ post, onToggleLike }) {
  const { t } = useTranslation()
  const [showMentionsModal, setShowMentionsModal] = useState(false)
  const [contentExpanded, setContentExpanded] = useState(false)
  /** null = closed, number = open at that image index */
  const [imageViewerIndex, setImageViewerIndex] = useState(null)
  const [likeLoading, setLikeLoading] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [reactionBubbleRect, setReactionBubbleRect] = useState(null)
  const [showReactionsModal, setShowReactionsModal] = useState(false)
  const [reactionsModalInitialTab, setReactionsModalInitialTab] = useState('all')
  const reactionHoverTimerRef = useRef(null)
  const reactionHideTimerRef = useRef(null)
  const reactionPendingHideRef = useRef(null)
  const likeAreaRef = useRef(null)
  if (!post) return null

  const postId = post?.id ?? post?._id
  const isLiked = Boolean(post?.liked)
  const userReaction = post?.userReaction || null
  const likeCount = Number(post?.likeCount) ?? 0

  const handleLikeClick = () => {
    if (!postId || likeLoading || typeof onToggleLike !== 'function') return
    setLikeLoading(true)
    setShowReactionPicker(false)
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
    setShowReactionPicker(false)
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

  const clearAllReactionTimers = () => {
    if (reactionHoverTimerRef.current) {
      window.clearTimeout(reactionHoverTimerRef.current)
      reactionHoverTimerRef.current = null
    }
    if (reactionHideTimerRef.current) {
      window.clearTimeout(reactionHideTimerRef.current)
      reactionHideTimerRef.current = null
    }
    if (reactionPendingHideRef.current) {
      window.clearTimeout(reactionPendingHideRef.current)
      reactionPendingHideRef.current = null
    }
  }

  const handleLikeAreaMouseEnter = () => {
    clearAllReactionTimers()
    reactionHoverTimerRef.current = window.setTimeout(() => {
      setShowReactionPicker(true)
      reactionHoverTimerRef.current = null
      // Auto-hide after 4s only when not hovering the bubble; bubble enter will cancel this
      reactionHideTimerRef.current = window.setTimeout(() => {
        setShowReactionPicker(false)
        reactionHideTimerRef.current = null
      }, REACTION_PICKER_VISIBLE_DURATION)
    }, REACTION_PICKER_HOVER_DELAY)
  }

  const handleLikeAreaMouseLeave = () => {
    if (reactionHoverTimerRef.current) {
      window.clearTimeout(reactionHoverTimerRef.current)
      reactionHoverTimerRef.current = null
    }
    // Delay hide so moving to bubble keeps it visible
    reactionPendingHideRef.current = window.setTimeout(() => {
      if (reactionHideTimerRef.current) {
        window.clearTimeout(reactionHideTimerRef.current)
        reactionHideTimerRef.current = null
      }
      setShowReactionPicker(false)
      reactionPendingHideRef.current = null
    }, REACTION_PICKER_LEAVE_DELAY)
  }

  const handleBubbleMouseEnter = () => {
    clearAllReactionTimers()
    setShowReactionPicker(true)
  }

  const handleBubbleMouseLeave = () => {
    reactionPendingHideRef.current = window.setTimeout(() => {
      setShowReactionPicker(false)
      reactionPendingHideRef.current = null
    }, REACTION_PICKER_LEAVE_DELAY)
  }

  // Update bubble position when picker opens so portal can place it above Like button
  useEffect(() => {
    if (!showReactionPicker || !likeAreaRef.current) {
      setReactionBubbleRect(null)
      return
    }
    const el = likeAreaRef.current
    const rect = el.getBoundingClientRect()
    setReactionBubbleRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })
  }, [showReactionPicker])

  useEffect(() => {
    return () => {
      clearAllReactionTimers()
    }
  }, [])

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
      <div className="bg-white dark:bg-[#111e22] rounded-xl border border-slate-200 dark:border-[#325a67] overflow-hidden">
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
                onClick={() => setImageViewerIndex(i)}
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
          onClose={() => setImageViewerIndex(null)}
          post={post}
          initialImageIndex={imageViewerIndex ?? 0}
          onLikeClick={typeof onToggleLike === 'function' ? handleLikeClick : undefined}
          likeLoading={likeLoading}
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
        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-[#325a67] my-1" />
        {/* Bottom row: Thích (hover to show bubble picker above), Bình luận, Chia sẻ */}
        <div className="flex items-center">
          <div
            ref={likeAreaRef}
            className="relative flex-1 flex items-center justify-center"
            onMouseEnter={handleLikeAreaMouseEnter}
            onMouseLeave={handleLikeAreaMouseLeave}
          >
            <button
              type="button"
              onClick={handleLikeClick}
              disabled={likeLoading}
              className={`w-full flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors rounded-lg ${isLiked ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-[#92bbc9] hover:bg-slate-50 dark:hover:bg-[#233f48]'}`}
              aria-pressed={isLiked}
              aria-haspopup="true"
              aria-expanded={showReactionPicker}
            >
              {isLiked && userReaction ? (
                <span className="text-xl" aria-hidden>{REACTION_TYPE_TO_EMOJI[userReaction] ?? userReaction}</span>
              ) : (
                <span className={`material-symbols-outlined text-xl ${isLiked ? 'fill-current' : ''}`}>thumb_up</span>
              )}
              {isLiked && userReaction ? t(`dashboard.reaction${userReaction.charAt(0).toUpperCase() + userReaction.slice(1)}`) : t('dashboard.like')}
            </button>
          </div>
          <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-500 dark:text-[#92bbc9] hover:bg-slate-50 dark:hover:bg-[#233f48] rounded-lg transition-colors">
            <span className="material-symbols-outlined text-xl">chat_bubble</span>
            {t('dashboard.comment')}
          </button>
          <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-500 dark:text-[#92bbc9] hover:bg-slate-50 dark:hover:bg-[#233f48] rounded-lg transition-colors">
            <span className="material-symbols-outlined text-xl">share</span>
            {t('dashboard.share')}
          </button>
        </div>
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

      <PostReactionsModal
        open={showReactionsModal}
        onClose={() => setShowReactionsModal(false)}
        postId={postId}
        initialTab={reactionsModalInitialTab}
        likeCount={likeCount}
        reactionCounts={post.reactionCounts}
      />
      <MentionedUsersModal
        open={showMentionsModal}
        onClose={() => setShowMentionsModal(false)}
        mentions={mentionsList}
      />
    </>
  )
}
