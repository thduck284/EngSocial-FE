import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export function ProfileVideosGrid({ videos, loading, error, hasMore, loadMore }) {
  const { t } = useTranslation()
  const sentinelRef = useRef(null)

  useEffect(() => {
    if (!hasMore || !loadMore) return
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '150px', threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  if (loading && (!videos || videos.length === 0)) {
    return (
      <div className="w-full min-h-[16rem] flex flex-col items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">
          progress_activity
        </span>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t('dashboard.loading', { defaultValue: 'Dang tai...' })}
        </p>
      </div>
    )
  }

  if (error && (!videos || videos.length === 0)) {
    return <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="w-full min-h-[12rem] flex items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          {t('profile.noVideos', { defaultValue: 'Chua co video nao duoc dang tu bai viet.' })}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((item, index) => (
          <div
            key={`${item.postId || 'post'}-${index}-${item.url}`}
            className="overflow-hidden rounded-xl border border-slate-200 dark:border-border-dark bg-black"
          >
            <video
              src={item.url}
              controls
              preload="metadata"
              className="w-full h-56 object-cover"
            />
          </div>
        ))}
      </div>
      <div ref={sentinelRef} className="h-6" />
      {loading && videos.length > 0 && (
        <div className="flex justify-center py-4">
          <span className="material-symbols-outlined animate-spin text-2xl text-primary">
            progress_activity
          </span>
        </div>
      )}
    </div>
  )
}
