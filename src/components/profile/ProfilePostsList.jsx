import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardPostCard } from '../dashboard/DashboardPostCard'
import { resolvePostPatch } from '../../utils/post'

export function ProfilePostsList({ posts, loading, error }) {
  const { t } = useTranslation()
  const [localPosts, setLocalPosts] = useState(Array.isArray(posts) ? posts : [])

  useEffect(() => {
    setLocalPosts(Array.isArray(posts) ? posts : [])
  }, [posts])

  const handlePostReactionUpdate = (postId, patch = {}) => {
    if (!postId) return
    setLocalPosts((prev) =>
      prev.map((p) => {
        const id = p?.id ?? p?._id
        if (String(id) !== String(postId)) return p
        return {
          ...p,
          liked: patch.liked ?? p.liked,
          userReaction: patch.userReaction ?? p.userReaction,
          likeCount:
            typeof patch.likeCount === 'number' ? patch.likeCount : p.likeCount,
          reactionCounts: patch.reactionCounts ?? p.reactionCounts,
        }
      }),
    )
  }

  const handlePostUpdate = (postId, updated = {}) => {
    if (!postId) return
    setLocalPosts((prev) =>
      prev.map((p) => {
        const id = p?.id ?? p?._id
        if (String(id) !== String(postId)) return p
        return resolvePostPatch(p, updated)
      }),
    )
  }

  const handlePostDelete = (postId) => {
    if (!postId) return
    setLocalPosts((prev) => prev.filter((p) => String(p?.id ?? p?._id) !== String(postId)))
  }

  if (loading) {
    return (
      <div className="w-full min-h-[16rem] flex flex-col items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">
          progress_activity
        </span>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t('dashboard.loading', { defaultValue: 'Đang tải...' })}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-sm text-red-500 dark:text-red-400">
        {error}
      </p>
    )
  }

  if (!localPosts || localPosts.length === 0) {
    return (
      <div className="w-full min-h-[12rem] flex items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          {t('profile.noPosts', {
            defaultValue:
              'Bạn chưa có bài viết nào. Hãy tạo bài viết đầu tiên ở trang chủ!',
          })}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {localPosts.map((post) => (
        <DashboardPostCard
          key={post?.id ?? post?._id}
          post={post}
          onToggleLike={handlePostReactionUpdate}
          onUpdatePost={handlePostUpdate}
          onDeletePost={handlePostDelete}
        />
      ))}
    </div>
  )
}

