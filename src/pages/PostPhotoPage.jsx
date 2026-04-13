import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { communityService } from '../services'
import { PostImageViewerModal } from '../components/ui/post/PostImageViewerModal'

export function PostPhotoPage() {
  const { postId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rawResponse, setRawResponse] = useState(null)

  const initialImageIndex = Number(searchParams.get('image') || 0) || 0

  useEffect(() => {
    // Debug: log when effect runs
    // eslint-disable-next-line no-console
    console.log('[PostPhotoPage] mount/effect', { postId, initialImageIndex })
    if (!postId) return
    setLoading(true)
    setError('')
    communityService
      .getPost(postId)
      .then((res) => {
        // eslint-disable-next-line no-console
        console.log('[PostPhotoPage] getPost response', res)
        const data = res?.data ?? res
        const nextPost = data?.post || data
        setRawResponse(data || null)
        setPost(nextPost)
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[PostPhotoPage] getPost error', err)
        setError(err?.message || 'Không tải được bài viết')
      })
      .finally(() => setLoading(false))
  }, [postId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <span>Đang tải ảnh...</span>
      </div>
    )
  }

  if (error || !post) {
    // Debug: show error explicitly
    // eslint-disable-next-line no-console
    console.log('[PostPhotoPage] render error/empty', { error, post })
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <p className="mb-2 font-semibold text-red-400">{error || 'Không tìm thấy bài viết'}</p>
        <pre className="mb-4 max-w-xl max-h-64 overflow-auto text-xs bg-slate-900/80 px-3 py-2 rounded-lg text-left">
          {JSON.stringify(
            {
              postId,
              rawResponse,
            },
            null,
            2
          )}
        </pre>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg bg-primary text-white font-medium"
        >
          Quay lại
        </button>
      </div>
    )
  }

  return (
    <PostImageViewerModal
      open
      onClose={() => {
        navigate(-1)
      }}
      post={post}
      initialImageIndex={initialImageIndex}
      onLikeClick={undefined}
      likeLoading={false}
      onReactionClick={undefined}
      onIndexChange={(newIndex) => {
        if (newIndex === initialImageIndex) return
        const params = new URLSearchParams(location.search)
        params.set('image', String(newIndex))
        navigate({ search: params.toString() }, { replace: true, state: location.state })
      }}
    />
  )
}

