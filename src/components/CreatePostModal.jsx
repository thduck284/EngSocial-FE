import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { communityService, uploadService } from '../services'

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=13b6ec&color=fff'

export function CreatePostModal({ open, onClose, onSuccess }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [videoUrl, setVideoUrl] = useState('')
  const [documents, setDocuments] = useState([])
  const [posting, setPosting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const docInputRef = useRef(null)

  const displayAvatar = user?.avatar || (user?.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)

  const uploadFile = async (file) => {
    const res = await uploadService.uploadPostMedia(file)
    return res?.url
  }

  const handleImageSelect = async (e) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return
    setUploading(true)
    setError('')
    try {
      const urls = []
      for (const file of files.slice(0, 10 - images.length)) {
        const url = await uploadFile(file)
        if (url) urls.push(url)
      }
      setImages((prev) => [...prev, ...urls].slice(0, 10))
    } catch (err) {
      setError(t('dashboard.uploadError') || 'Upload thất bại.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleVideoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadFile(file)
      if (url) setVideoUrl(url)
    } catch (err) {
      setError(t('dashboard.uploadError') || 'Upload thất bại.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDocSelect = async (e) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return
    setUploading(true)
    setError('')
    try {
      const urls = []
      for (const file of files.slice(0, 5 - documents.length)) {
        const url = await uploadFile(file)
        if (url) urls.push(url)
      }
      setDocuments((prev) => [...prev, ...urls].slice(0, 5))
    } catch (err) {
      setError(t('dashboard.uploadError') || 'Upload thất bại.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index))
  const removeVideo = () => setVideoUrl('')
  const removeDoc = (index) => setDocuments((prev) => prev.filter((_, i) => i !== index))

  const handleSubmit = async () => {
    const text = content?.trim()
    if (!text && images.length === 0 && !videoUrl && documents.length === 0) return
    if (posting) return
    setPosting(true)
    setError('')
    try {
      const res = await communityService.createPost({
        content: text || ' ',
        images,
        video: videoUrl || undefined,
        documents: documents.length ? documents : undefined,
      })
      const newPost = res?.data
      if (newPost) onSuccess?.(newPost)
      setContent('')
      setImages([])
      setVideoUrl('')
      setDocuments([])
      onClose?.()
    } catch (err) {
      setError(err?.message || t('dashboard.postFailed') || 'Đăng bài thất bại.')
    } finally {
      setPosting(false)
    }
  }

  const handleClose = () => {
    if (!posting && !uploading) {
      setContent('')
      setImages([])
      setVideoUrl('')
      setDocuments([])
      setError('')
      onClose?.()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={handleClose}>
      <div
        className="bg-white dark:bg-[#111e22] rounded-2xl border border-slate-200 dark:border-[#325a67] w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#325a67]">
          <h3 className="font-bold text-lg">{t('dashboard.createPost') || 'Tạo bài viết'}</h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={posting || uploading}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#233f48] text-slate-500 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="flex gap-3 mb-4">
            <img src={displayAvatar} alt="" className="size-10 rounded-full object-cover shrink-0" />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('dashboard.postPlaceholder')}
              rows={4}
              className="flex-1 bg-slate-50 dark:bg-[#233f48] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-400 resize-none border-0 focus:ring-2 focus:ring-primary"
            />
          </div>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {images.map((url, i) => (
                <div key={url} className="relative group">
                  <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-slate-200 dark:border-[#325a67]" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 size-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
          {videoUrl && (
            <div className="mb-3 flex items-center gap-2 p-2 bg-slate-50 dark:bg-[#233f48] rounded-lg">
              <span className="material-symbols-outlined text-red-500">videocam</span>
              <span className="text-sm truncate flex-1">Video đã thêm</span>
              <button type="button" onClick={removeVideo} className="text-red-500 hover:bg-red-500/10 rounded p-1">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}
          {documents.length > 0 && (
            <div className="mb-3 space-y-1">
              {documents.map((url, i) => (
                <div key={url} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-[#233f48] rounded-lg">
                  <span className="material-symbols-outlined text-blue-500">description</span>
                  <span className="text-sm truncate flex-1">Tài liệu {i + 1}</span>
                  <button type="button" onClick={() => removeDoc(i)} className="text-red-500 hover:bg-red-500/10 rounded p-1">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
            <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple className="hidden" onChange={handleDocSelect} />
            <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploading || images.length >= 10} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#233f48] text-sm font-medium hover:bg-slate-200 dark:hover:bg-[#325a67] disabled:opacity-50">
              <span className="material-symbols-outlined text-green-500">image</span>
              {t('dashboard.image')}
            </button>
            <button type="button" onClick={() => videoInputRef.current?.click()} disabled={uploading || !!videoUrl} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#233f48] text-sm font-medium hover:bg-slate-200 dark:hover:bg-[#325a67] disabled:opacity-50">
              <span className="material-symbols-outlined text-red-500">videocam</span>
              {t('dashboard.video')}
            </button>
            <button type="button" onClick={() => docInputRef.current?.click()} disabled={uploading || documents.length >= 5} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#233f48] text-sm font-medium hover:bg-slate-200 dark:hover:bg-[#325a67] disabled:opacity-50">
              <span className="material-symbols-outlined text-blue-500">description</span>
              {t('dashboard.document')}
            </button>
          </div>
          {uploading && <p className="text-xs text-slate-500 mt-2">{t('dashboard.uploading') || 'Đang tải lên...'}</p>}
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-[#325a67] flex justify-end gap-2">
          <button type="button" onClick={handleClose} disabled={posting} className="px-4 py-2 rounded-lg font-medium text-slate-600 dark:text-[#92bbc9] hover:bg-slate-100 dark:hover:bg-[#233f48] disabled:opacity-50">
            {t('buttons.cancel') || 'Hủy'}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={posting || uploading || (!content?.trim() && images.length === 0 && !videoUrl && documents.length === 0)}
            className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {posting ? '...' : t('dashboard.post')}
          </button>
        </div>
      </div>
    </div>
  )
}
