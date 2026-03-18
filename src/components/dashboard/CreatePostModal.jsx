import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { communityService, uploadService } from '../../services'
import { searchGiphy, hasGiphyKey } from '../../services/giphy.service'
import { getMessageEmojiCategories } from '../../utils/emoji'
import { extractHashtags, extractMentionNames, getMentionRanges, resolveMentionIds } from '../../utils/postContent'

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=13b6ec&color=fff'

/** Normalize friends list to { id, name, avatar } for @ mentions */
function normalizeFriendsList(list) {
  if (!Array.isArray(list)) return []
  return list
    .map((f) => {
      const user = f?.user ?? f
      const id = user?.id ?? user?._id
      const name = user?.name ?? f?.name
      const avatar = user?.avatar ?? f?.avatar
      return id && name ? { id: String(id), name: String(name), avatar: avatar || undefined } : null
    })
    .filter(Boolean)
}

export function CreatePostModal({ open, onClose, onSuccess, friendsList = [] }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [videoUrl, setVideoUrl] = useState('')
  const [documents, setDocuments] = useState([])
  const [visibility, setVisibility] = useState('public')
  const [posting, setPosting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [gifQuery, setGifQuery] = useState('')
  const [gifResults, setGifResults] = useState([])
  const [gifLoading, setGifLoading] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [emojiCategoryId, setEmojiCategoryId] = useState('faces')
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const docInputRef = useRef(null)
  const gifPickerRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const contentTextareaRef = useRef(null)
  const contentBlockRef = useRef(null)

  const emojiCategories = useMemo(() => getMessageEmojiCategories(), [])
  const currentEmojis = useMemo(
    () => emojiCategories.find((c) => c.id === emojiCategoryId)?.emojis ?? emojiCategories[0]?.emojis ?? [],
    [emojiCategories, emojiCategoryId]
  )

  const friendsForMention = useMemo(() => normalizeFriendsList(friendsList), [friendsList])
  // Exclude already-mentioned friends so each person can only be mentioned once
  const mentionCandidates = useMemo(() => {
    const names = extractMentionNames(content)
    const alreadyMentioned = new Set(names.map((n) => n.trim().toLowerCase()))
    if (names.length && names[names.length - 1].trim().toLowerCase() === mentionQuery.trim().toLowerCase()) {
      alreadyMentioned.delete(mentionQuery.trim().toLowerCase())
    }
    const filtered = friendsForMention.filter((f) => !alreadyMentioned.has(f.name.trim().toLowerCase()))
    if (!mentionQuery.trim()) return filtered.slice(0, 8)
    const q = mentionQuery.toLowerCase()
    return filtered
      .filter((f) => f.name.toLowerCase().includes(q))
      .slice(0, 8)
  }, [friendsForMention, mentionQuery, content])

  const displayAvatar =
    user?.avatar ||
    (user?.name
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=13b6ec&color=fff`
      : DEFAULT_AVATAR)

  const uploadFile = async (file) => {
    const res = await uploadService.uploadMedia(file)
    return res || {}
  }

  const handleImageSelect = async (e) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return
    setUploading(true)
    setError('')
    try {
      const urls = []
      for (const file of files.slice(0, 10 - images.length)) {
        const data = await uploadFile(file)
        if (data?.url) urls.push(data.url)
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
      const data = await uploadFile(file)
      if (data?.url) setVideoUrl(data.url)
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
      const list = []
      for (const file of files.slice(0, 5 - documents.length)) {
        const data = await uploadFile(file)
        if (data?.url) list.push({ url: data.url, name: data.name || file.name || '' })
      }
      setDocuments((prev) => [...prev, ...list].slice(0, 5))
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
    if (images.length >= 10) return
    setImages((prev) => [...prev, gifUrl].slice(0, 10))
    setShowGifPicker(false)
    setGifQuery('')
    setGifResults([])
  }

  // Load trending GIFs when picker opens and has key
  useEffect(() => {
    if (showGifPicker && hasGiphyKey && gifResults.length === 0 && !gifQuery.trim()) {
      setGifLoading(true)
      searchGiphy('')
        .then((results) => setGifResults(results || []))
        .finally(() => setGifLoading(false))
    }
  }, [showGifPicker, hasGiphyKey])

  const insertEmoji = (emoji) => {
    const ta = contentTextareaRef.current
    if (ta) {
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const before = content.slice(0, start)
      const after = content.slice(end)
      setContent(before + emoji + after)
      setTimeout(() => {
        ta.focus()
        ta.setSelectionRange(start + emoji.length, start + emoji.length)
      }, 0)
    } else {
      setContent((prev) => prev + emoji)
    }
  }

  // Close GIF, emoji, mention pickers on outside click
  useEffect(() => {
    if (!open) return
    const onMouseDown = (e) => {
      if (gifPickerRef.current && !gifPickerRef.current.contains(e.target)) setShowGifPicker(false)
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) setShowEmojiPicker(false)
      if (contentBlockRef.current && !contentBlockRef.current.contains(e.target)) setShowMentionDropdown(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  const handleContentChange = (e) => {
    const v = e.target.value
    setContent(v)
    const ta = e.target
    const cursor = ta.selectionStart
    const textBefore = v.slice(0, cursor)
    const match = textBefore.match(/@([^\s@#]*)$/)
    if (match) {
      setShowMentionDropdown(true)
      setShowGifPicker(false)
      setShowEmojiPicker(false)
      setMentionQuery(match[1] || '')
    } else {
      setShowMentionDropdown(false)
    }
  }

  // Backspace/Delete: remove whole mention when cursor is inside or adjacent to it
  // Typing inside a mention: insert character after the mention to avoid breaking it
  const handleContentKeyDown = (e) => {
    const ta = contentTextareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const hasSelection = start !== end
    const ranges = getMentionRanges(content)

    if (e.key === 'Backspace' && !hasSelection) {
      const at = start
      const range = ranges.find((r) => at > r.start && at <= r.end)
      if (range) {
        e.preventDefault()
        const newContent = content.slice(0, range.start) + content.slice(range.end)
        setContent(newContent)
        setTimeout(() => {
          ta.focus()
          ta.setSelectionRange(range.start, range.start)
        }, 0)
      }
      return
    }
    if (e.key === 'Delete' && !hasSelection) {
      const at = start
      const range = ranges.find((r) => at >= r.start && at < r.end)
      if (range) {
        e.preventDefault()
        const newContent = content.slice(0, range.start) + content.slice(range.end)
        setContent(newContent)
        setTimeout(() => {
          ta.focus()
          ta.setSelectionRange(range.start, range.start)
        }, 0)
      }
      return
    }

    // Single character typed while cursor is inside a mention: insert after the mention
    const isSingleChar = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey
    if (isSingleChar && !hasSelection) {
      const at = start
      const range = ranges.find((r) => at > r.start && at < r.end)
      if (range) {
        e.preventDefault()
        const char = e.key
        const newContent = content.slice(0, range.end) + char + content.slice(range.end)
        setContent(newContent)
        const newPos = range.end + 1
        setTimeout(() => {
          ta.focus()
          ta.setSelectionRange(newPos, newPos)
        }, 0)
      }
    }
  }

  const insertMention = (friend) => {
    const ta = contentTextareaRef.current
    if (!ta) return
    const cursor = ta.selectionStart
    const textBefore = content.slice(0, cursor)
    const start = textBefore.lastIndexOf('@')
    if (start === -1) return
    const before = content.slice(0, start)
    const after = content.slice(cursor)
    const newContent = before + '@' + friend.name + ' ' + after
    setContent(newContent)
    setShowMentionDropdown(false)
    setTimeout(() => {
      ta.focus()
      const pos = start + friend.name.length + 2
      ta.setSelectionRange(pos, pos)
    }, 0)
  }

  const handleSubmit = async () => {
    // Full content from textarea including @mention text (e.g. "Hello @John Doe"); store as-is in DB
    const text = content?.trim()
    if (!text && images.length === 0 && !videoUrl && documents.length === 0) return
    if (posting) return
    setPosting(true)
    setError('')
    try {
      const tags = extractHashtags(text)
      const mentions = resolveMentionIds(text, friendsForMention)
      const payload = {
        content: text || ' ', // full content with @mentions; backend saves this as post.content
        images,
        video: videoUrl || undefined,
        documents: documents.length ? documents.map((d) => (typeof d === 'string' ? { url: d, name: '' } : { url: d.url, name: d.name || '' })) : undefined,
        tags: tags.length ? tags : undefined,
        mentions: mentions.length ? mentions : undefined,
      }
      if (visibility && visibility !== 'public') payload.visibility = visibility
      const res = await communityService.createPost(payload)
      const newPost = res?.data?.post ?? res?.data
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
      setShowGifPicker(false)
      setShowEmojiPicker(false)
      setShowMentionDropdown(false)
      onClose?.()
    }
  }

  if (!open) return null

  // Portal to body so backdrop covers full viewport (avoids fixed positioning inside transformed/scroll containers)
  const modalContent = (
    <div
      className="create-post-modal-backdrop"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-slate-200 dark:border-border-dark overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-border-dark shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t('dashboard.createPost') || 'Tạo bài viết'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={posting || uploading}
            className="p-2 hover:bg-slate-100 dark:hover:bg-border-dark rounded-full transition-colors text-slate-500 dark:text-slate-400 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* User Info & Privacy */}
        <div className="px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/30 shrink-0">
              <img
                src={displayAvatar}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {user?.name || 'User'}
              </p>
              <div className="relative mt-1">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="appearance-none bg-slate-100 dark:bg-border-dark border-none rounded-lg text-xs font-medium py-1 pl-7 pr-8 text-slate-600 dark:text-slate-300 focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="public">{t('dashboard.public')}</option>
                  <option value="friends">{t('dashboard.friendsOnly')}</option>
                  <option value="private">{t('dashboard.privateOnly')}</option>
                </select>
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[14px] pointer-events-none text-slate-500">
                  public
                </span>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[14px] pointer-events-none text-slate-500">
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div ref={contentBlockRef} className="px-6 pb-2 shrink-0 relative">
          <textarea
            ref={contentTextareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleContentKeyDown}
            className="w-full min-h-[120px] bg-transparent border-none focus:ring-0 text-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none p-0"
            placeholder={t('dashboard.postPlaceholder')}
            rows={3}
          />
          {showMentionDropdown && (
            <div className="absolute left-6 right-6 top-full mt-0.5 pt-1.5 pb-2 bg-white dark:bg-card-dark rounded-xl shadow-xl border border-slate-200 dark:border-border-dark z-50 max-h-48 overflow-y-auto custom-scrollbar">
              <p className="px-3 pt-0.5 pb-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('dashboard.mentionFriend') || 'Gợi ý bạn bè'}
              </p>
              {mentionCandidates.length === 0 ? (
                <p className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">{t('dashboard.noFriendMatch') || 'Không có bạn bè trùng khớp.'}</p>
              ) : (
                mentionCandidates.map((friend) => (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => insertMention(friend)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    {friend.avatar ? (
                      <span className="size-8 rounded-full overflow-hidden border border-primary/40 shrink-0">
                        <img
                          src={friend.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </span>
                    ) : (
                      <span className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {(friend.name || '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{friend.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Preview Area - images and video same thumbnail style */}
        <div className="px-6 py-4 space-y-3 overflow-y-auto flex-1 min-h-0">
          {(images.length > 0 || videoUrl) && (
            <div className="flex flex-wrap gap-2">
              {images.map((url, i) => (
                <div key={`img-${i}-${url}`} className="relative group">
                  <img
                    src={url}
                    alt=""
                    className="w-20 h-20 object-cover rounded-lg border border-slate-200 dark:border-border-dark"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 size-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
              {videoUrl && (
                <div key="video-preview" className="relative group">
                  <video
                    src={videoUrl}
                    className="w-20 h-20 object-cover rounded-lg border border-slate-200 dark:border-border-dark bg-slate-800"
                    muted
                    preload="metadata"
                    playsInline
                  />
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="material-symbols-outlined text-white/80 text-2xl drop-shadow">play_circle</span>
                  </span>
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute -top-1 -right-1 size-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              )}
            </div>
          )}
          {documents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((d, i) => {
                const url = typeof d === 'string' ? d : d?.url
                const name = typeof d === 'string' ? '' : (d?.name || '')
                return (
                  <div
                    key={`doc-${i}-${url}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-blue-500 shrink-0">
                        description
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]" title={name || undefined}>
                        {name || (t('dashboard.document') + ` ${i + 1}`)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDoc(i)}
                      className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Media Upload Row */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-border-dark shrink-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            {t('dashboard.addToPost') || 'Thêm vào bài viết'}
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*,video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-ms-wmv"
              className="hidden"
              onChange={handleVideoSelect}
            />
            <input
              ref={docInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              multiple
              className="hidden"
              onChange={handleDocSelect}
            />
            <div ref={emojiPickerRef} className="relative">
              <button
                type="button"
                onClick={() => { setShowGifPicker(false); setShowEmojiPicker((v) => !v) }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  showEmojiPicker ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400' : 'hover:bg-slate-100 dark:hover:bg-border-dark border-slate-100 dark:border-border-dark'
                }`}
                title={t('messages.emoji') || 'Biểu cảm'}
              >
                <span className="material-symbols-outlined text-amber-500">mood</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('messages.emoji') || 'Biểu cảm'}</span>
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-full mb-3 left-0 w-72 bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-slate-200 dark:border-border-dark z-50 overflow-hidden">
                  <div className="flex justify-center gap-1 p-1.5 border-b border-slate-100 dark:border-border-dark overflow-x-auto shrink-0">
                    {emojiCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        title={cat.label}
                        onClick={() => setEmojiCategoryId(cat.id)}
                        className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-xl leading-none transition-colors ${emojiCategoryId === cat.id ? 'bg-primary text-white' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                      >
                        {cat.emojis[0]}
                      </button>
                    ))}
                  </div>
                  <div className="p-2 grid grid-cols-8 gap-1 max-h-[180px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {currentEmojis.map((emoji, i) => (
                      <button
                        key={`${emoji}-${i}`}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="flex items-center justify-center min-w-[36px] min-h-[36px] p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xl leading-none"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading || images.length >= 10}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-border-dark transition-colors border border-slate-100 dark:border-border-dark disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-green-500">image</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('dashboard.image')}
              </span>
            </button>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading || !!videoUrl}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-border-dark transition-colors border border-slate-100 dark:border-border-dark disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-red-500">videocam</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('dashboard.video')}
              </span>
            </button>
            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              disabled={uploading || documents.length >= 5}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-border-dark transition-colors border border-slate-100 dark:border-border-dark disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-blue-500">description</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('dashboard.document')}
              </span>
            </button>
            <div ref={gifPickerRef} className="relative">
              <button
                type="button"
                onClick={() => { setShowEmojiPicker(false); setShowGifPicker((v) => !v) }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  showGifPicker
                    ? 'bg-violet-500/10 dark:bg-violet-500/20 border-violet-500/30 text-violet-600 dark:text-violet-400'
                    : 'hover:bg-slate-100 dark:hover:bg-border-dark border-slate-100 dark:border-border-dark'
                }`}
              >
                <span className="material-symbols-outlined text-violet-500">gif_box</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('messages.gif') || 'GIF'}</span>
              </button>
              {showGifPicker && (
                <div className="absolute bottom-full mb-3 right-0 w-72 bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-slate-200 dark:border-border-dark z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 dark:border-border-dark">
                    <div className="relative flex gap-2">
                      <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        search
                      </span>
                      <input
                        type="text"
                        value={gifQuery}
                        onChange={(e) => setGifQuery(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === 'Enter' && (e.preventDefault(), handleGifSearch())
                        }
                        className="w-full bg-slate-100 dark:bg-background-dark border-none rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-1 focus:ring-primary text-slate-900 dark:text-slate-100"
                        placeholder={t('messages.searchGif') || 'Tìm GIF...'}
                      />
                      <button
                        type="button"
                        onClick={handleGifSearch}
                        disabled={gifLoading || !hasGiphyKey}
                        className="shrink-0 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
                      >
                        {gifLoading ? (t('common.loading') || '...') : (t('common.search') || 'Tìm')}
                      </button>
                    </div>
                  </div>
                  <div className="p-2 grid grid-cols-2 gap-2 h-48 overflow-y-auto custom-scrollbar">
                    {!hasGiphyKey ? (
                      <div className="col-span-2 flex flex-col items-center justify-center py-4 text-slate-500 dark:text-slate-400 text-xs text-center px-2">
                        {t('messages.giphyKeyRequired')}
                      </div>
                    ) : gifLoading && gifResults.length === 0 ? (
                      <div className="col-span-2 flex items-center justify-center py-8 text-slate-500 text-sm">
                        {t('common.loading') || 'Đang tải...'}
                      </div>
                    ) : (
                      gifResults.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => handleSelectGif(g.url)}
                          className="h-20 bg-slate-200 dark:bg-border-dark rounded-lg overflow-hidden flex items-center justify-center hover:ring-2 ring-primary"
                        >
                          <img
                            src={g.preview || g.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {uploading && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {t('dashboard.uploading')}
            </p>
          )}
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>

        {/* Footer Buttons */}
        <footer className="px-6 py-5 bg-slate-50 dark:bg-background-dark/30 border-t border-slate-200 dark:border-border-dark flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={posting}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-border-dark transition-colors disabled:opacity-50"
          >
            {t('buttons.cancel') || 'Hủy'}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              posting ||
              uploading ||
              (!content?.trim() && images.length === 0 && !videoUrl && documents.length === 0)
            }
            className="px-8 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {posting ? '...' : (t('dashboard.post') || 'Đăng bài')}
          </button>
        </footer>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
