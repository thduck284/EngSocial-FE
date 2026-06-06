import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { communityService } from '../services'
import { PostDetailModal } from '../components/ui/post/PostDetailModal'
import { resolvePostPatch } from '../utils/post'
import { closePostDetail } from '../utils/postLinks'
import { usePostFeedSync } from '../context/PostFeedSyncContext'

export function PostDetailPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [likeLoading, setLikeLoading] = useState(false)
  const { syncPostUpdate } = usePostFeedSync() || {}

  useEffect(() => {
    if (!postId) return
    let cancelled = false
    setLoading(true)
    setError('')
    communityService
      .getPost(postId)
      .then((res) => {
        if (cancelled) return
        const data = res?.data ?? res
        const nextPost = data?.post || data
        setPost(nextPost)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message || 'Không tải được bài viết')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [postId])

  const handleClose = useCallback(() => {
    closePostDetail(navigate, location)
  }, [navigate, location])

  const handleToggleLike = useCallback(
    (_id, patch = {}) => {
      setPost((prev) => (prev ? { ...prev, ...patch, liked: patch.liked ?? prev.liked } : prev))
    },
    []
  )

  const handleLikeFromModal = useCallback(
    (reactionType) => {
      if (!postId || likeLoading) return
      setLikeLoading(true)
      const isLiked = Boolean(post?.liked)
      const userReaction = post?.userReaction || null
      const reactionToSend =
        typeof reactionType === 'string' ? reactionType : isLiked ? userReaction || 'like' : 'like'

      communityService
        .setReaction(postId, reactionToSend)
        .then((res) => {
          const data = res?.data ?? res
          handleToggleLike(postId, {
            liked: data?.liked === true,
            userReaction: data?.userReaction ?? null,
            likeCount: typeof data?.likeCount === 'number' ? data.likeCount : undefined,
            reactionCounts:
              data?.reactionCounts && typeof data.reactionCounts === 'object'
                ? data.reactionCounts
                : undefined,
          })
        })
        .catch(() => {})
        .finally(() => setLikeLoading(false))
    },
    [postId, likeLoading, post?.liked, post?.userReaction, handleToggleLike]
  )

  const handleUpdatePost = useCallback(
    (_id, patch) => {
      setPost((prev) => (prev ? resolvePostPatch(prev, patch) : prev))
      syncPostUpdate?.(_id, patch)
    },
    [syncPostUpdate],
  )

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
        <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-2xl border border-slate-200 dark:border-border-dark flex items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
          <span className="text-sm font-medium text-slate-700 dark:text-gray-200">Đang tải bài viết...</span>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <p className="mb-4 font-semibold text-red-400">{error || 'Không tìm thấy bài viết'}</p>
        <button
          type="button"
          onClick={handleClose}
          className="px-4 py-2 rounded-lg bg-primary text-white font-medium"
        >
          Quay lại
        </button>
      </div>
    )
  }

  return (
    <PostDetailModal
      open
      onClose={handleClose}
      post={post}
      onToggleLike={handleLikeFromModal}
      onUpdatePost={handleUpdatePost}
      likeLoading={likeLoading}
    />
  )
}
