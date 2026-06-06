import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchLinkPreview } from '../../utils/linkPreview'
import { extractPostIdFromUrl, navigateToPostDetail, postDetailPath, fetchPostLinkPreview } from '../../utils/postLinks'

function PreviewSkeleton({ fromMe }) {
  return (
    <div
      className={`mt-2.5 w-[min(100%,280px)] rounded-xl overflow-hidden animate-pulse ${
        fromMe ? 'bg-white/15 ring-1 ring-white/20' : 'bg-slate-100 dark:bg-white/5 ring-1 ring-slate-200/80 dark:ring-border-dark'
      }`}
    >
      <div className={`aspect-[1.91/1] ${fromMe ? 'bg-white/20' : 'bg-slate-200/80 dark:bg-white/10'}`} />
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className={`size-4 rounded-full ${fromMe ? 'bg-white/25' : 'bg-slate-200 dark:bg-white/10'}`} />
          <div className={`h-2.5 rounded flex-1 max-w-[40%] ${fromMe ? 'bg-white/20' : 'bg-slate-200 dark:bg-white/10'}`} />
        </div>
        <div className={`h-3 rounded w-[85%] ${fromMe ? 'bg-white/25' : 'bg-slate-200 dark:bg-white/10'}`} />
        <div className={`h-2 rounded w-full ${fromMe ? 'bg-white/15' : 'bg-slate-100 dark:bg-white/5'}`} />
      </div>
    </div>
  )
}

export function MessageLinkPreview({ url, fromMe = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const postId = extractPostIdFromUrl(url)

  useEffect(() => {
    if (!url) {
      setPreview(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setImageError(false)
    const load = postId ? fetchPostLinkPreview(url) : fetchLinkPreview(url)
    load
      .then((data) => {
        if (cancelled) return
        if (data) {
          setPreview(data)
          return
        }
        if (postId) return fetchLinkPreview(url).then((fallback) => {
          if (!cancelled && fallback) setPreview(fallback)
        })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [url])

  if (!url) return null
  if (loading) return <PreviewSkeleton fromMe={fromMe} />

  if (!preview) return null

  const domain = preview.hostname || preview.siteName
  const showImage = Boolean(preview.image) && !imageError
  const displayTitle = preview.title && preview.title !== domain ? preview.title : domain

  const handlePreviewClick = (e) => {
    if (!postId) return
    e.preventDefault()
    navigateToPostDetail(navigate, location, postId)
  }

  return (
    <a
      href={postId ? postDetailPath(postId) : preview.url}
      target={postId ? undefined : '_blank'}
      rel={postId ? undefined : 'noopener noreferrer'}
      onClick={handlePreviewClick}
      className={`group/preview mt-2.5 block w-[min(100%,280px)] rounded-xl overflow-hidden transition-all hover:brightness-[1.02] active:scale-[0.99] ${
        fromMe
          ? 'bg-white shadow-md ring-1 ring-white/30'
          : 'bg-white dark:bg-[#1a2332] shadow-sm ring-1 ring-slate-200/90 dark:ring-border-dark hover:ring-primary/30'
      }`}
    >
      {showImage ? (
        <div className="relative aspect-[1.91/1] bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img
            src={preview.image}
            alt=""
            className="w-full h-full object-cover transition-transform duration-300 group-hover/preview:scale-[1.02]"
            loading="lazy"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />
        </div>
      ) : (
        <div
          className={`flex items-center justify-center aspect-[2.4/1] ${
            fromMe ? 'bg-slate-50' : 'bg-slate-50 dark:bg-slate-800/80'
          }`}
        >
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">link</span>
        </div>
      )}

      <div className="px-3 py-2.5 min-w-0 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-1.5 mb-1 min-w-0">
          <img
            src={preview.favicon}
            alt=""
            className="size-4 rounded-sm shrink-0 bg-slate-100 object-contain"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate uppercase tracking-wide">
            {domain}
          </span>
        </div>
        <p className="text-[13px] font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
          {displayTitle}
        </p>
        {preview.description ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {preview.description}
          </p>
        ) : null}
      </div>
    </a>
  )
}
