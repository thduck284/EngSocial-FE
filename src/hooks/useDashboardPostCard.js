import { useEffect } from 'react'
import { DEFAULT_AVATAR } from '../constants/ui'
import { communityService } from '../services'
import { normalizeMentions } from '../utils/post'

export function useDashboardPostCard({
  post,
  postId,
  isLiked,
  userReaction,
  onToggleLike,
  likeLoading,
  setLikeLoading,
  hideCardReactionPicker,
  contentExpanded,
  maxContentPreview,
  setModalMentions,
  setViewerPost,
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
  setEditError,
  setPostActionLoading,
  onUpdatePost,
  onDeletePost,
  isSavedPost,
  t,
}) {
  const normalizeDocs = (docs) =>
    (Array.isArray(docs) ? docs : []).map((d) =>
      typeof d === 'string' ? { url: d, name: '' } : { url: d?.url || '', name: d?.name || '' },
    )

  const author = post?.author ?? {}
  const authorAvatar =
    author.avatar ||
    (author.name
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=13b6ec&color=fff`
      : DEFAULT_AVATAR)
  const mentionsList = normalizeMentions(post?.mentions)
  const hasMentions = mentionsList.length > 0
  const firstMention = hasMentions ? mentionsList[0] : null
  const firstMentionId =
    firstMention && (firstMention.id ?? (typeof firstMention === 'string' ? firstMention : null))
  const othersCount = hasMentions ? mentionsList.length - 1 : 0
  const contentToShow = post?.content != null ? String(post.content) : ''
  const isLongContent = contentToShow.length > maxContentPreview
  const contentPreview =
    isLongContent && !contentExpanded
      ? contentToShow.slice(0, maxContentPreview)
      : contentToShow
  const imagesList = Array.isArray(post?.images)
    ? post.images.filter((url) => typeof url === 'string' && url.trim())
    : []
  const documentsList = Array.isArray(post?.documents) ? post.documents : []
  const sharedPost = post?.sharedPost || null
  const sharedMentions = sharedPost ? normalizeMentions(sharedPost.mentions) : []

  useEffect(() => {
    setModalMentions(mentionsList)
    setViewerPost(post)
    setIsSavedPost(Boolean(post?.saved ?? post?.isSaved))
  }, [postId, post, mentionsList, setModalMentions, setViewerPost, setIsSavedPost])

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
        const reactionCounts =
          data?.reactionCounts && typeof data.reactionCounts === 'object'
            ? data.reactionCounts
            : undefined
        onToggleLike(postId, {
          liked,
          userReaction: nextReaction,
          likeCount: nextCount,
          reactionCounts,
        })
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
        const reactionCounts =
          data?.reactionCounts && typeof data.reactionCounts === 'object'
            ? data.reactionCounts
            : undefined
        onToggleLike(postId, {
          liked,
          userReaction: nextReaction,
          likeCount: nextCount,
          reactionCounts,
        })
      })
      .catch(() => {})
      .finally(() => setLikeLoading(false))
  }

  const handleOpenEdit = () => {
    if (!isOwnPost || postActionLoading) return
    if (typeof setEditError === 'function') setEditError('')
    setEditContent(post?.content != null ? String(post.content) : '')
    setEditImages(Array.isArray(post?.images) ? post.images : [])
    setEditVideoUrl(typeof post?.video === 'string' ? post.video : '')
    setEditDocuments(Array.isArray(post?.documents) ? post.documents : [])
    setEditVisibility(
      post?.visibility === 'friends' || post?.visibility === 'private' ? post.visibility : 'public',
    )
    setEditingPost(true)
  }

  const handleSaveEdit = () => {
    if (!postId || !isOwnPost || postActionLoading) return
    const nextContent = editContent.trim()
    const hasMedia =
      (Array.isArray(editImages) && editImages.length > 0) ||
      (typeof editVideoUrl === 'string' && editVideoUrl.trim()) ||
      (Array.isArray(editDocuments) && editDocuments.length > 0)
    if (!nextContent && !hasMedia) {
      if (typeof setEditError === 'function') {
        setEditError(t('dashboard.editPostEmpty') || 'Post must have content or media.')
      }
      return
    }

    const originalContent = post?.content != null ? String(post.content).trim() : ''
    const originalImages = Array.isArray(post?.images) ? post.images : []
    const originalVideo = typeof post?.video === 'string' ? post.video : ''
    const originalDocuments = normalizeDocs(post?.documents)
    const nextDocuments = normalizeDocs(editDocuments)
    const originalVisibility =
      post?.visibility === 'friends' || post?.visibility === 'private' ? post.visibility : 'public'

    const isUnchanged =
      nextContent === originalContent &&
      JSON.stringify(editImages) === JSON.stringify(originalImages) &&
      (editVideoUrl || '') === originalVideo &&
      JSON.stringify(nextDocuments) === JSON.stringify(originalDocuments) &&
      editVisibility === originalVisibility

    if (isUnchanged) {
      setEditingPost(false)
      return
    }

    setPostActionLoading(true)
    if (typeof setEditError === 'function') setEditError('')
    communityService
      .updatePost(postId, {
        content: nextContent,
        images: editImages,
        video: editVideoUrl || '',
        documents: editDocuments,
        visibility: editVisibility,
      })
      .then((res) => {
        const updated = res?.data?.data ?? res?.data ?? res ?? {}
        if (typeof onUpdatePost === 'function') {
          onUpdatePost(postId, {
            ...updated,
            content: updated?.content ?? nextContent,
            images: updated?.images ?? editImages,
            video: updated?.video ?? editVideoUrl,
            documents: updated?.documents ?? editDocuments,
            visibility: updated?.visibility ?? editVisibility,
          })
        }
        setEditingPost(false)
      })
      .catch((err) => {
        if (typeof setEditError === 'function') {
          setEditError(
            err?.data?.message ||
              err?.message ||
              t('profile.saveFailed') ||
              'Failed to save. Please try again.',
          )
        }
      })
      .finally(() => setPostActionLoading(false))
  }

  const handleDeletePost = () => {
    if (!postId || !isOwnPost || postActionLoading) return
    const ok = window.confirm(t('dashboard.deletePostConfirm') || 'Delete this post?')
    if (!ok) return
    setPostActionLoading(true)
    communityService
      .deletePost(postId)
      .then(() => {
        if (typeof onDeletePost === 'function') onDeletePost(postId)
      })
      .catch(() => {})
      .finally(() => {
        setPostActionLoading(false)
      })
  }

  const handleReportPost = () => {
    if (!postId || isOwnPost || postActionLoading) return
    // TODO: replace with backend report-post API when available
    window.alert(t('dashboard.reportPostSoon') || 'Report submitted. Thank you!')
  }

  const handleToggleSavePost = () => {
    // TODO: replace with backend save/unsave post API when available
    setIsSavedPost((prev) => !prev)
    if (typeof onUpdatePost === 'function') {
      onUpdatePost(postId, { saved: !isSavedPost, isSaved: !isSavedPost })
    }
  }

  return {
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
  }
}
