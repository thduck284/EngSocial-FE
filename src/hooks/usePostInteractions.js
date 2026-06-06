import { useState, useEffect, useRef, useCallback } from 'react'
import { communityService, uploadService } from '../services'
import { searchGiphy, hasGiphyKey } from '../services/giphy.service'
import { getExpandTargetsAfterReply } from '../utils/commentThread'

// ─── Image viewer for post modal ──────────────────────────────────────────────

export function usePostImageViewer({ open, initialImageIndex = 0, imagesList, onClose, onIndexChange }) {
  const [currentIndex, setCurrentIndex] = useState(initialImageIndex)
  const [zoom, setZoom] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [contentExpanded, setContentExpanded] = useState(false)

  const hasMultiple = imagesList.length > 1

  useEffect(() => {
    if (!open) return
    setCurrentIndex(Math.min(initialImageIndex, Math.max(0, imagesList.length - 1)))
    setZoom(1)
    setFullscreen(false)
    setContentExpanded(false)
  }, [open, initialImageIndex, imagesList.length])

  useEffect(() => {
    if (open && onIndexChange) {
      onIndexChange(currentIndex)
    }
  }, [currentIndex, open, onIndexChange])

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (fullscreen) setFullscreen(false)
        else if (typeof onClose === 'function') onClose()
      }
      if (e.key === 'ArrowLeft' && hasMultiple) {
        setCurrentIndex((i) => (i - 1 + imagesList.length) % imagesList.length)
      }
      if (e.key === 'ArrowRight' && hasMultiple) {
        setCurrentIndex((i) => (i + 1) % imagesList.length)
      }
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

  return {
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
  }
}

// ─── Reaction picker shared logic ─────────────────────────────────────────────

export const REACTION_PICKER_HOVER_DELAY = 1000
export const REACTION_PICKER_VISIBLE_DURATION = 4000
export const REACTION_PICKER_LEAVE_DELAY = 300

export function usePostReactionPicker() {
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [reactionBubbleRect, setReactionBubbleRect] = useState(null)
  const reactionHoverTimerRef = useRef(null)
  const reactionHideTimerRef = useRef(null)
  const reactionPendingHideRef = useRef(null)
  const likeAreaRef = useRef(null)

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

  const handleLikeAreaFocus = () => {
    clearAllReactionTimers()
    setShowReactionPicker(true)
  }

  const handleLikeAreaBlur = (e) => {
    if (likeAreaRef.current && e?.relatedTarget && likeAreaRef.current.contains(e.relatedTarget)) {
      return
    }
    reactionPendingHideRef.current = window.setTimeout(() => {
      setShowReactionPicker(false)
      reactionPendingHideRef.current = null
    }, REACTION_PICKER_LEAVE_DELAY)
  }

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

  return {
    likeAreaRef,
    showReactionPicker,
    reactionBubbleRect,
    handleLikeAreaMouseEnter,
    handleLikeAreaMouseLeave,
    handleBubbleMouseEnter,
    handleBubbleMouseLeave,
    handleLikeAreaFocus,
    handleLikeAreaBlur,
    hideReactionPicker: () => {
      clearAllReactionTimers()
      setShowReactionPicker(false)
    },
  }
}

// ─── Dashboard post comments (feed) ───────────────────────────────────────────

export function useDashboardPostComments(postId, t, onCommentAdded) {
  const [showCommentsPanel, setShowCommentsPanel] = useState(false)
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentSending, setCommentSending] = useState(false)
  const [commentError, setCommentError] = useState('')
  const [commentText, setCommentText] = useState('')
  const [commentImages, setCommentImages] = useState([])
  const [commentVideo, setCommentVideo] = useState('')
  const [commentAudio, setCommentAudio] = useState('')
  const [commentDocuments, setCommentDocuments] = useState([])
  const [commentUploading, setCommentUploading] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [gifQuery, setGifQuery] = useState('')
  const [gifResults, setGifResults] = useState([])
  const [gifLoading, setGifLoading] = useState(false)

  const postCardRef = useRef(null)
  const commentTextareaRef = useRef(null)
  const commentImageInputRef = useRef(null)
  const commentVideoInputRef = useRef(null)
  const commentAudioInputRef = useRef(null)
  const commentDocInputRef = useRef(null)

  const [showCommentReactionPicker, setShowCommentReactionPicker] = useState(false)
  const [commentReactionBubbleRect, setCommentReactionBubbleRect] = useState(null)
  const [hoveredCommentId, setHoveredCommentId] = useState(null)
  const commentLikeAnchorRef = useRef(null)
  const commentHoverTimerRef = useRef(null)
  const commentHideTimerRef = useRef(null)
  const commentPendingHideRef = useRef(null)
  const [replyToComment, setReplyToComment] = useState(null)

  // Phân trang comment cấp 0 (root) – mỗi lần 10 comment
  const [rootPage, setRootPage] = useState(1)
  const [rootHasMore, setRootHasMore] = useState(true)
  // Phân trang reply theo thread: key = id comment gốc (cấp 1)
  const [threadPages, setThreadPages] = useState({}) // { [parentId]: { page, hasMore } }
  const [expandAfterReply, setExpandAfterReply] = useState(null)
  const pendingExpandParentIdRef = useRef(null)

  const onExpandAfterReplyConsumed = useCallback(() => {
    setExpandAfterReply(null)
  }, [])

  useEffect(() => {
    const pid = pendingExpandParentIdRef.current
    if (!pid) return
    pendingExpandParentIdRef.current = null
    const targets = getExpandTargetsAfterReply(pid, comments)
    setExpandAfterReply({ ...targets, token: Date.now() })
  }, [comments])

  const clearCommentReactionTimers = () => {
    if (commentHoverTimerRef.current) {
      window.clearTimeout(commentHoverTimerRef.current)
      commentHoverTimerRef.current = null
    }
    if (commentHideTimerRef.current) {
      window.clearTimeout(commentHideTimerRef.current)
      commentHideTimerRef.current = null
    }
    if (commentPendingHideRef.current) {
      window.clearTimeout(commentPendingHideRef.current)
      commentPendingHideRef.current = null
    }
  }

  const handleFeedCommentLikeMouseEnter = (commentId, targetEl) => {
    clearCommentReactionTimers()
    setHoveredCommentId(commentId)
    commentLikeAnchorRef.current = targetEl || null
    commentHoverTimerRef.current = window.setTimeout(() => {
      const el = commentLikeAnchorRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setCommentReactionBubbleRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      })
      setShowCommentReactionPicker(true)
      commentHoverTimerRef.current = null
      commentHideTimerRef.current = window.setTimeout(() => {
        setShowCommentReactionPicker(false)
        setCommentReactionBubbleRect(null)
        commentHideTimerRef.current = null
      }, REACTION_PICKER_VISIBLE_DURATION)
    }, REACTION_PICKER_HOVER_DELAY)
  }

  const handleFeedCommentLikeMouseLeave = () => {
    if (commentHoverTimerRef.current) {
      window.clearTimeout(commentHoverTimerRef.current)
      commentHoverTimerRef.current = null
    }
    commentPendingHideRef.current = window.setTimeout(() => {
      if (commentHideTimerRef.current) {
        window.clearTimeout(commentHideTimerRef.current)
        commentHideTimerRef.current = null
      }
      setShowCommentReactionPicker(false)
      setCommentReactionBubbleRect(null)
      commentPendingHideRef.current = null
    }, REACTION_PICKER_LEAVE_DELAY)
  }

  const handleCommentReactionBubbleEnter = () => {
    clearCommentReactionTimers()
    setShowCommentReactionPicker(true)
  }

  const handleCommentReactionBubbleLeave = () => {
    commentPendingHideRef.current = window.setTimeout(() => {
      setShowCommentReactionPicker(false)
      setCommentReactionBubbleRect(null)
      commentPendingHideRef.current = null
    }, REACTION_PICKER_LEAVE_DELAY)
  }

  const handleFeedCommentLikeFocus = (commentId, targetEl) => {
    clearCommentReactionTimers()
    setHoveredCommentId(commentId)
    commentLikeAnchorRef.current = targetEl || null
    const el = commentLikeAnchorRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setCommentReactionBubbleRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    })
    setShowCommentReactionPicker(true)
  }

  const handleFeedCommentLikeBlur = () => {
    commentPendingHideRef.current = window.setTimeout(() => {
      if (commentHideTimerRef.current) {
        window.clearTimeout(commentHideTimerRef.current)
        commentHideTimerRef.current = null
      }
      setShowCommentReactionPicker(false)
      setCommentReactionBubbleRect(null)
      commentLikeAnchorRef.current = null
      commentPendingHideRef.current = null
    }, REACTION_PICKER_LEAVE_DELAY)
  }

  useEffect(() => {
    if (!showCommentReactionPicker || !commentLikeAnchorRef.current) return

    const updateRect = () => {
      const el = commentLikeAnchorRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setCommentReactionBubbleRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      })
    }

    updateRect()
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)

    return () => {
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [showCommentReactionPicker])

  useEffect(() => {
    return () => {
      clearCommentReactionTimers()
    }
  }, [])

  useEffect(() => {
    if (!showCommentsPanel || !postId) return
    setCommentsLoading(true)
    setCommentError('')
    communityService
      .getComments(postId, { page: rootPage, limit: 10 })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : []
        setComments((prev) => (rootPage === 1 ? list : [...prev, ...list]))
        setRootHasMore(list.length === 10)
      })
      .catch((err) => setCommentError(err?.message || (t('common.error') || 'Có lỗi xảy ra')))
      .finally(() => setCommentsLoading(false))
  }, [showCommentsPanel, postId, t, rootPage])

  useEffect(() => {
    if (showGifPicker && hasGiphyKey && gifResults.length === 0 && !gifQuery.trim()) {
      setGifLoading(true)
      searchGiphy('')
        .then((results) => setGifResults(results || []))
        .finally(() => setGifLoading(false))
    }
  }, [showGifPicker, gifQuery, gifResults.length])

  useEffect(() => {
    if (!showCommentsPanel) return
    const el = postCardRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (!e?.isIntersecting) {
          setShowCommentsPanel(false)
          setShowGifPicker(false)
        }
      },
      { threshold: 0.05 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [showCommentsPanel])

  const uploadCommentFile = async (file) => {
    const res = await uploadService.uploadMedia(file)
    return res || {}
  }

  const handleCommentImageSelect = async (e) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return
    setCommentUploading(true)
    setCommentError('')
    try {
      const urls = []
      for (const file of files.slice(0, 10 - commentImages.length)) {
        const data = await uploadCommentFile(file)
        if (data?.url) urls.push(data.url)
      }
      setCommentImages((prev) => [...prev, ...urls].slice(0, 10))
    } catch (err) {
      setCommentError(t('dashboard.uploadError') || 'Upload thất bại.')
    } finally {
      setCommentUploading(false)
      e.target.value = ''
    }
  }

  const handleCommentVideoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || commentVideo) return
    setCommentUploading(true)
    setCommentError('')
    try {
      const data = await uploadCommentFile(file)
      if (data?.url) setCommentVideo(data.url)
    } catch (err) {
      setCommentError(t('dashboard.uploadError') || 'Upload thất bại.')
    } finally {
      setCommentUploading(false)
      e.target.value = ''
    }
  }

  const handleCommentAudioSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || commentAudio) return
    setCommentUploading(true)
    setCommentError('')
    try {
      const data = await uploadCommentFile(file)
      if (data?.url) setCommentAudio(data.url)
    } catch (err) {
      setCommentError(t('dashboard.uploadError') || 'Upload thất bại.')
    } finally {
      setCommentUploading(false)
      e.target.value = ''
    }
  }

  const handleCommentDocSelect = async (e) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return
    setCommentUploading(true)
    setCommentError('')
    try {
      const list = []
      for (const file of files.slice(0, 5 - commentDocuments.length)) {
        const data = await uploadCommentFile(file)
        if (data?.url) list.push({ url: data.url, name: data.name || file.name || '' })
      }
      setCommentDocuments((prev) => [...prev, ...list].slice(0, 5))
    } catch (err) {
      setCommentError(t('dashboard.uploadError') || 'Upload thất bại.')
    } finally {
      setCommentUploading(false)
      e.target.value = ''
    }
  }

  const handleGifSearch = async () => {
    if (!hasGiphyKey) return
    setGifLoading(true)
    try {
      const results = await searchGiphy(gifQuery)
      setGifResults(results || [])
    } finally {
      setGifLoading(false)
    }
  }

  const handleSelectGif = (gifUrl) => {
    if (!gifUrl || commentImages.length >= 10) return
    setCommentImages((prev) => [...prev, gifUrl].slice(0, 10))
    setShowGifPicker(false)
    setGifQuery('')
    setGifResults([])
  }

  const removeCommentImage = (index) => setCommentImages((prev) => prev.filter((_, i) => i !== index))
  const removeCommentVideo = () => setCommentVideo('')
  const removeCommentAudio = () => setCommentAudio('')
  const removeCommentDoc = (index) => setCommentDocuments((prev) => prev.filter((_, i) => i !== index))

  const startReplyToComment = (commentId, author) => {
    if (!commentId) return
    const authorName = author?.name || ''
    setReplyToComment({ commentId, authorName })
    setCommentText((prev) => {
      if (prev && prev.trim().length > 0) return prev
      return authorName ? `@${authorName} ` : ''
    })
    if (commentTextareaRef.current) {
      // focus sau 1 tick để đảm bảo textarea đã render
      window.setTimeout(() => {
        commentTextareaRef.current && commentTextareaRef.current.focus()
      }, 0)
    }
  }

  const cancelReplyToComment = () => {
    setReplyToComment(null)
  }

  const handleSendComment = async () => {
    if (!postId || commentSending || commentUploading) return
    const text = commentText?.trim() || ''
    if (!text && commentImages.length === 0 && !commentVideo && !commentAudio && commentDocuments.length === 0) return
    setCommentSending(true)
    setCommentError('')
    try {
      const payload = {
        content: text,
        images: commentImages,
        video: commentVideo || undefined,
        audio: commentAudio || undefined,
        documents: commentDocuments.length ? commentDocuments.map((d) => ({ url: d.url, name: d.name || '' })) : undefined,
      }
      if (replyToComment?.commentId) {
        payload.parentId = replyToComment.commentId
      }
      const res = await communityService.commentPost(postId, payload)
      const newComment = res?.data?.comment ?? res?.data
      const parentIdForExpand = replyToComment?.commentId
      if (newComment) {
        if (parentIdForExpand) pendingExpandParentIdRef.current = String(parentIdForExpand)
        setComments((prev) => [...prev, newComment])
        if (typeof onCommentAdded === 'function') onCommentAdded(newComment)
      }
      setCommentText('')
      setCommentImages([])
      setCommentVideo('')
      setCommentAudio('')
      setCommentDocuments([])
      setShowGifPicker(false)
      setGifQuery('')
      setGifResults([])
      setReplyToComment(null)
      if (commentTextareaRef.current) commentTextareaRef.current.style.height = ''
    } catch (err) {
      setCommentError(err?.message || (t('common.error') || 'Có lỗi xảy ra'))
    } finally {
      setCommentSending(false)
    }
  }

  const loadMoreRootComments = () => {
    if (!rootHasMore || commentsLoading) return
    setRootPage((prev) => prev + 1)
  }

  const loadMoreThreadComments = (parentId) => {
    if (!postId || !parentId) return
    const key = String(parentId)
    const meta = threadPages[key] || { page: 1, hasMore: true }
    if (!meta.hasMore || commentsLoading) return

    const nextPage = meta.page + 1

    communityService
      .getComments(postId, { parentId: key, page: nextPage, limit: 10 })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : []
        if (!list.length) {
          setThreadPages((prev) => ({
            ...prev,
            [key]: { ...meta, hasMore: false },
          }))
          return
        }
        setComments((prev) => [...prev, ...list])
        setThreadPages((prev) => ({
          ...prev,
          [key]: { page: nextPage, hasMore: list.length === 10 },
        }))
      })
      .catch(() => {})
  }

  const handleToggleCommentLike = async (commentId, reactionType) => {
    if (!commentId) return
    const current = comments.find((c) => String(c?.id ?? c?._id) === String(commentId))
    const nextReaction = reactionType || current?.userReaction || 'like'
    try {
      const res = await communityService.setCommentReaction(commentId, nextReaction)
      const data = res?.data ?? res
      const liked = data?.liked === true
      const userReaction = data?.userReaction ?? null
      const likeCount = typeof data?.likeCount === 'number' ? data.likeCount : undefined
      const reactionCounts = data?.reactionCounts && typeof data.reactionCounts === 'object' ? data.reactionCounts : undefined
      setComments((prev) =>
        prev.map((c) => {
          const cid = c?.id ?? c?._id
          if (String(cid) !== String(commentId)) return c
          return {
            ...c,
            liked,
            userReaction,
            likeCount: likeCount ?? c.likeCount,
            reactionCounts: reactionCounts ?? c.reactionCounts,
          }
        })
      )
    } catch {
      // ignore
    }
  }

  return {
    showCommentsPanel,
    setShowCommentsPanel,
    comments,
    setComments,
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
  }
}
