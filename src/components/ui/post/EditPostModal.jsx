import { createPortal } from 'react-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePostComposerAddons } from '../../../hooks/usePostComposerAddons'
import { friendsService } from '../../../services'
import { extractMentionNames, getMentionRanges, resolveMentionIds } from '../../../utils/postContent'
import { PostComposerAddToPostRow } from './PostComposerAddToPostRow'

export function EditPostModal({
  open,
  t,
  authorName,
  authorAvatar,
  content,
  setContent,
  initialMentions = [],
  initialMentionIds = [],
  onMentionIdsChange,
  visibility,
  setVisibility,
  images,
  videoUrl,
  documents,
  onImageSelect,
  onVideoSelect,
  onDocSelect,
  onAddGif,
  removeImage,
  removeVideo,
  removeDoc,
  onClose,
  onSave,
  loading,
  uploading,
  error,
  canSubmit,
}) {
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [friendsForMention, setFriendsForMention] = useState([])
  const contentTextareaRef = useRef(null)
  const contentBlockRef = useRef(null)

  const addons = usePostComposerAddons({
    open,
    onInsertEmoji: (emoji) => {
      const ta = contentTextareaRef.current
      if (!ta) {
        setContent((prev) => `${prev || ''}${emoji}`)
        return
      }
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const current = content || ''
      const next = `${current.slice(0, start)}${emoji}${current.slice(end)}`
      setContent(next)
      setTimeout(() => {
        ta.focus()
        const pos = start + emoji.length
        ta.setSelectionRange(pos, pos)
      }, 0)
    },
    onSelectGif: onAddGif,
  })

  const mentionCandidates = useMemo(() => {
    const mentionPoolMap = new Map()
    ;[...friendsForMention, ...(Array.isArray(initialMentions) ? initialMentions : [])].forEach((m) => {
      const id = String(m?.id ?? m?._id ?? '')
      const name = String(m?.name ?? '').trim()
      if (!id || !name) return
      if (!mentionPoolMap.has(id)) {
        mentionPoolMap.set(id, { id, name, avatar: m?.avatar || '' })
      }
    })
    const mentionPool = Array.from(mentionPoolMap.values())
    const names = extractMentionNames(content || '')
    const alreadyMentioned = new Set(names.map((n) => n.trim().toLowerCase()))
    if (names.length && names[names.length - 1].trim().toLowerCase() === mentionQuery.trim().toLowerCase()) {
      alreadyMentioned.delete(mentionQuery.trim().toLowerCase())
    }
    const filteredPool = mentionPool.filter((m) => !alreadyMentioned.has(m.name.trim().toLowerCase()))
    if (!mentionQuery.trim()) return filteredPool.slice(0, 8)
    const q = mentionQuery.trim().toLowerCase()
    return filteredPool.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 8)
  }, [friendsForMention, initialMentions, mentionQuery])

  useEffect(() => {
    if (!open) return
    onMentionIdsChange?.(Array.isArray(initialMentionIds) ? initialMentionIds : [])
    setShowMentionDropdown(false)
    setMentionQuery('')
    friendsService
      .getList({ limit: 100, page: 1 })
      .then((res) => {
        const raw = res?.data?.data ?? res?.data ?? []
        const list = (Array.isArray(raw) ? raw : [])
          .map((item) => {
            const u = item?.user || item
            const id = u?.id ?? u?._id
            const name = u?.name
            const avatar = u?.avatar
            return id && name ? { id: String(id), name: String(name), avatar: avatar || '' } : null
          })
          .filter(Boolean)
        setFriendsForMention(list)
      })
      .catch(() => setFriendsForMention([]))
  }, [open])

  useEffect(() => {
    if (!open) return
    const mentionPoolMap = new Map()
    ;[...friendsForMention, ...(Array.isArray(initialMentions) ? initialMentions : [])].forEach((m) => {
      const id = String(m?.id ?? m?._id ?? '')
      const name = String(m?.name ?? '').trim()
      if (!id || !name) return
      if (!mentionPoolMap.has(id)) {
        mentionPoolMap.set(id, { id, name, avatar: m?.avatar || '' })
      }
    })
    const mentionPool = Array.from(mentionPoolMap.values())
    const resolved = resolveMentionIds(content || '', mentionPool)
    onMentionIdsChange?.(resolved)
  }, [content, friendsForMention, initialMentions, onMentionIdsChange, open, initialMentionIds])

  const handleContentChange = (e) => {
    const value = e.target.value
    setContent(value)
    const cursor = e.target.selectionStart
    const textBefore = value.slice(0, cursor)
    const match = textBefore.match(/@([^\s@#]*)$/)
    if (match) {
      setShowMentionDropdown(true)
      setMentionQuery(match[1] || '')
      addons.setShowEmojiPicker(false)
      addons.setShowGifPicker(false)
    } else {
      setShowMentionDropdown(false)
      setMentionQuery('')
    }
  }

  const handleContentKeyDown = (e) => {
    const ta = contentTextareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const hasSelection = start !== end
    const ranges = getMentionRanges(content || '')

    if (e.key === 'Backspace' && !hasSelection) {
      const at = start
      const range = ranges.find((r) => at > r.start && at <= r.end)
      if (range) {
        e.preventDefault()
        const current = content || ''
        const next = current.slice(0, range.start) + current.slice(range.end)
        setContent(next)
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
        const current = content || ''
        const next = current.slice(0, range.start) + current.slice(range.end)
        setContent(next)
        setTimeout(() => {
          ta.focus()
          ta.setSelectionRange(range.start, range.start)
        }, 0)
      }
      return
    }
  }

  const insertMention = (friend) => {
    const ta = contentTextareaRef.current
    if (!ta) return
    const cursor = ta.selectionStart
    const current = content || ''
    const textBefore = current.slice(0, cursor)
    const start = textBefore.lastIndexOf('@')
    if (start === -1) return
    const next = `${current.slice(0, start)}@${friend.name} ${current.slice(cursor)}`
    setContent(next)
    setShowMentionDropdown(false)
    setMentionQuery('')
    setTimeout(() => {
      ta.focus()
      const pos = start + friend.name.length + 2
      ta.setSelectionRange(pos, pos)
    }, 0)
  }

  if (!open) return null

  return createPortal(
    <div className="create-post-modal-backdrop" onClick={() => (loading ? null : onClose())}>
      <div
        className="w-full max-w-2xl bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-slate-200 dark:border-border-dark overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-border-dark shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t('dashboard.editPost')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading || uploading}
            className="p-2 hover:bg-slate-100 dark:hover:bg-border-dark rounded-full transition-colors text-slate-500 dark:text-slate-400 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/30 shrink-0">
              <img src={authorAvatar} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {authorName || 'User'}
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
                <span className="material-symbols-outlined absolute left-1 top-1/2 -translate-y-1/2 text-[14px] pointer-events-none text-slate-500">
                  {visibility === 'private' ? 'lock' : visibility === 'friends' ? 'group' : 'public'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div ref={contentBlockRef} className="px-6 pb-2 shrink-0 relative">
          <textarea
            ref={contentTextareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleContentKeyDown}
            className="w-full min-h-[170px] bg-transparent border-none focus:ring-0 text-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none p-0"
            placeholder={t('dashboard.postPlaceholder')}
            rows={6}
          />
          {showMentionDropdown && (
            <div className="absolute left-6 right-6 top-full mt-0.5 pt-1.5 pb-2 bg-white dark:bg-card-dark rounded-xl shadow-xl border border-slate-200 dark:border-border-dark z-50 max-h-48 overflow-y-auto custom-scrollbar">
              {mentionCandidates.length === 0 ? (
                <p className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
                  {t('dashboard.noFriendMatch') || 'Khong co ban be phu hop.'}
                </p>
              ) : (
                mentionCandidates.map((friend) => (
                  <button
                    key={friend.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertMention(friend)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    {friend.avatar ? (
                      <span className="size-8 rounded-full overflow-hidden border border-primary/40 shrink-0">
                        <img src={friend.avatar} alt="" className="w-full h-full object-cover" />
                      </span>
                    ) : (
                      <span className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {(friend.name || '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {friend.name}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

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
                <div className="relative group">
                  <video
                    src={videoUrl}
                    className="w-20 h-20 object-cover rounded-lg border border-slate-200 dark:border-border-dark bg-slate-800"
                    muted
                    preload="metadata"
                    playsInline
                  />
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
                const name = typeof d === 'string' ? '' : d?.name || ''
                return (
                  <div
                    key={`doc-${i}-${url}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-blue-500 shrink-0">description</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                        {name || t('dashboard.document') + ` ${i + 1}`}
                      </span>
                    </div>
                    <button type="button" onClick={() => removeDoc(i)} className="text-slate-400 hover:text-red-500 transition-colors shrink-0">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
        </div>

        <PostComposerAddToPostRow
          t={t}
          uploading={uploading}
          imagesCount={images.length}
          hasVideo={Boolean(videoUrl)}
          documentsCount={documents.length}
          onImageSelect={onImageSelect}
          onVideoSelect={onVideoSelect}
          onDocSelect={onDocSelect}
          addons={addons}
        />

        <footer className="px-6 py-5 bg-slate-50 dark:bg-background-dark/30 border-t border-slate-200 dark:border-border-dark flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading || uploading}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-border-dark transition-colors disabled:opacity-50"
          >
            {t('buttons.cancel') || 'Huy'}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!canSubmit || loading || uploading}
            className="px-8 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('profile.saving') : t('profile.saveChanges')}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
