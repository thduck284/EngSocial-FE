import { DashboardPostCard } from '../dashboard/DashboardPostCard'

export function SearchResultsPosts({
  t,
  posts,
  postsCount,
  query,
  loading = false,
  error = null,
}) {
  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center justify-center py-6 text-gray-400 text-sm">
          <span className="material-symbols-outlined animate-spin mr-2">
            progress_activity
          </span>
          {t('search.loading') || 'Đang tải...'}
        </div>
      )}
      {!loading && error && (
        <p className="text-sm text-red-400 py-4">
          {error === 'search.loadError'
            ? t('search.friendSearchError')
            : error}
        </p>
      )}
      {!loading && !error && posts.length === 0 && (
        <p className="text-sm text-gray-400 py-4">
          {t('search.loadMorePosts') || 'Không tìm thấy bài viết phù hợp.'}
        </p>
      )}
      {!loading &&
        !error &&
        posts.map((post) => (
          <DashboardPostCard
            key={post.id ?? post._id}
            post={post}
            // Ở trang search chỉ cần hiển thị giống home; không cập nhật state like toàn cục
            onToggleLike={() => {}}
          />
        ))}
    </div>
  )
}
