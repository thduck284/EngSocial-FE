import { useEffect, useRef, useState } from 'react'
import { communityService, uploadService } from '../services'
import { searchGiphy, hasGiphyKey } from '../services/giphy.service'
import {
  REACTION_PICKER_HOVER_DELAY,
  REACTION_PICKER_VISIBLE_DURATION,
  REACTION_PICKER_LEAVE_DELAY,
} from './usePostInteractions'

export function usePostImageViewerComments(postId, t, open) {
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

  const [commentReactionPicker, setCommentReactionPicker] = useState({
    open: false,
    commentId: null,
    anchorRect: null,
  })
  const commentReactionHoverTimerRef = useRef(null)
  const commentReactionHideTimerRef = useRef(null)
  const [replyToComment, setReplyToComment] = useState(null)

  const commentTextareaRef = useRef(null)
  const commentImageInputRef = useRef(null)
  const commentVideoInputRef = useRef(null)
  const commentAudioInputRef = useRef(null)
  const commentDocInputRef = useRef(null)

  // load comments khi modal mở
  useEffect(() => {
    if (!open || !postId) return
    setCommentsLoading(true)
    setCommentError('')
    communityService
      .getComments(postId, { page: 1, limit: 50 })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : []
        setComments(list)
      })
      .catch((err) => {
        setCommentError(err?.message || (t('common.error') || 'Có lỗi xảy ra'))
      })
      .finally(() => setCommentsLoading(false))
  }, [open, postId, t])

  // reset state khi modal mở lại
  useEffect(() => {
    if (!open) return
    setComments([])
    setCommentsLoading(false)
    setCommentSending(false)
    setCommentError('')
    setCommentText('')
    setCommentImages([])
    setCommentVideo('')
    setCommentAudio('')
    setCommentDocuments([])
    setCommentUploading(false)
    setShowGifPicker(false)
    setGifQuery('')
    setGifResults([])
    setGifLoading(false)
  }, [open])

  // pre-load GIF mặc định
  useEffect(() => {
    if (showGifPicker && hasGiphyKey && gifResults.length === 0 && !gifQuery.trim()) {
      setGifLoading(true)
      searchGiphy('')
        .then((results) => setGifResults(results || []))
        .finally(() => setGifLoading(false))
    }
  }, [showGifPicker, gifQuery, gifResults.length])

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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
      window.setTimeout(() => {
        commentTextareaRef.current && commentTextareaRef.current.focus()
      }, 0)
    }
  }

  const cancelReplyToComment = () => {
    setReplyToComment(null)
  }

  const clearCommentReactionTimers = () => {
    if (commentReactionHoverTimerRef.current) {
      window.clearTimeout(commentReactionHoverTimerRef.current)
      commentReactionHoverTimerRef.current = null
    }
    if (commentReactionHideTimerRef.current) {
      window.clearTimeout(commentReactionHideTimerRef.current)
      commentReactionHideTimerRef.current = null
    }
  }

  const openCommentReactionPicker = (commentId, rect) => {
    setCommentReactionPicker({
      open: true,
      commentId,
      anchorRect: rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : null,
    })
  }

  const closeCommentReactionPicker = () => {
    setCommentReactionPicker({
      open: false,
      commentId: null,
      anchorRect: null,
    })
  }

  const handleCommentLikeMouseEnter = (commentId, target) => {
    clearCommentReactionTimers()
    const rect = target?.getBoundingClientRect ? target.getBoundingClientRect() : null
    commentReactionHoverTimerRef.current = window.setTimeout(() => {
      openCommentReactionPicker(commentId, rect)
      commentReactionHoverTimerRef.current = null
      commentReactionHideTimerRef.current = window.setTimeout(() => {
        closeCommentReactionPicker()
        commentReactionHideTimerRef.current = null
      }, REACTION_PICKER_VISIBLE_DURATION)
    }, REACTION_PICKER_HOVER_DELAY)
  }

  const handleCommentLikeMouseLeave = () => {
    if (commentReactionHoverTimerRef.current) {
      window.clearTimeout(commentReactionHoverTimerRef.current)
      commentReactionHoverTimerRef.current = null
    }
    commentReactionHideTimerRef.current = window.setTimeout(() => {
      closeCommentReactionPicker()
      commentReactionHideTimerRef.current = null
    }, REACTION_PICKER_LEAVE_DELAY)
  }

  const handleCommentReactionBubbleEnter = () => {
    clearCommentReactionTimers()
  }

  const handleCommentReactionBubbleLeave = () => {
    commentReactionHideTimerRef.current = window.setTimeout(() => {
      closeCommentReactionPicker()
      commentReactionHideTimerRef.current = null
    }, REACTION_PICKER_LEAVE_DELAY)
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
        documents: commentDocuments.length
          ? commentDocuments.map((d) => ({ url: d.url, name: d.name || '' }))
          : undefined,
      }
      if (replyToComment?.commentId) {
        payload.parentId = replyToComment.commentId
      }
      const res = await communityService.commentPost(postId, payload)
      const newComment = res?.data?.comment ?? res?.data
      if (newComment) setComments((prev) => [...prev, newComment])
      setCommentText('')
      setCommentImages([])
      setCommentVideo('')
      setCommentAudio('')
      setCommentDocuments([])
      setShowGifPicker(false)
      setGifQuery('')
      setGifResults([])
      if (commentTextareaRef.current) commentTextareaRef.current.style.height = ''
      setReplyToComment(null)
    } catch (err) {
      setCommentError(err?.message || (t('common.error') || 'Có lỗi xảy ra'))
    } finally {
      setCommentSending(false)
    }
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

  // Handlers được PostCommentsSectionBase gọi trong context modal ảnh
  // → map sang logic bong bóng reaction cho comment ở modal
  const handleFeedCommentLikeMouseEnter = (commentId, target) => {
    handleCommentLikeMouseEnter(commentId, target)
  }
  const handleFeedCommentLikeMouseLeave = () => {
    handleCommentLikeMouseLeave()
  }

  return {
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
  }
}