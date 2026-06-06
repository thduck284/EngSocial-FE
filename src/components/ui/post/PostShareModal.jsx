import { createPortal } from 'react-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { communityService } from '../../../services/community.service'
import { friendsService, conversationService } from '../../../services'
import { uploadService } from '../../../services/upload.service'
import { DEFAULT_AVATAR } from '../../../constants/ui'
import { useSharePostActions } from '../../../hooks/useSharePostActions'
import { usePostComposerAddons } from '../../../hooks/usePostComposerAddons'
import { resolveMentionIds, getContentWithoutMentions, getMentionRanges } from '../../../utils/postContent'
import { showEngSuccessToast } from '../../../utils/showEngToast'
import { PostShareComposerSection } from './PostShareComposerSection'
import { PostShareMessengerGroupModal } from './PostShareMessengerGroupModal'

export function PostShareModal({ open, onClose, post, t, onRepostSuccess }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('repost') // 'repost' | 'external' | 'inapp'
  const [repostText, setRepostText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [audience, setAudience] = useState('onlyMe') // 'public' | 'friends' | 'onlyMe'
  const [audienceOpen, setAudienceOpen] = useState(false)
  const [friendsForShare, setFriendsForShare] = useState([])
  const [friendsForShareLoading, setFriendsForShareLoading] = useState(false)
  const [friendsPage, setFriendsPage] = useState(1)
  const [friendsHasMore, setFriendsHasMore] = useState(true)
  const [showMessengerGroupModal, setShowMessengerGroupModal] = useState(false)
  const [messengerGroups, setMessengerGroups] = useState([])
  const [messengerGroupsLoading, setMessengerGroupsLoading] = useState(false)
  const [messengerGroupSearch, setMessengerGroupSearch] = useState('')
  const [messengerModalMode, setMessengerModalMode] = useState('both') // 'both' | 'groupsOnly'
  const [selectedFriendIds, setSelectedFriendIds] = useState(new Set())
  const [selectedGroupIds, setSelectedGroupIds] = useState(new Set())
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [images, setImages] = useState([])
  const [videoUrl, setVideoUrl] = useState('')
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const repostTextareaRef = useRef(null)
  const repostBlockRef = useRef(null)

  const origin =
    typeof window !== 'undefined' && window.location
      ? window.location.origin
      : ''
  const postUrl = `${origin}/post/${post.id || post._id || ''}`

  const { handleCopyLink, sendShareToTargets } = useSharePostActions({
    t,
    postUrl,
    onClose,
  })

  const insertEmojiToRepost = (emoji) => {
    const ta = repostTextareaRef.current
    if (!ta) {
      setRepostText((prev) => `${prev || ''}${emoji}`)
      return
    }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const before = repostText.slice(0, start)
    const after = repostText.slice(end)
    const next = `${before}${emoji}${after}`
    setRepostText(next)
    setTimeout(() => {
      ta.focus()
      const pos = start + emoji.length
      ta.setSelectionRange(pos, pos)
    }, 0)
  }

  const handleSelectGif = (gifUrl) => {
    if (!gifUrl || images.length >= 10) return
    setImages((prev) => [...prev, gifUrl].slice(0, 10))
  }

  const addons = usePostComposerAddons({
    open,
    onInsertEmoji: insertEmojiToRepost,
    onSelectGif: handleSelectGif,
  })

  const friendsForMention = useMemo(() => {
    if (!Array.isArray(friendsForShare)) return []
    return friendsForShare
      .map((item) => {
        const u = item?.user || item
        const id = u?.id ?? u?._id
        const name = u?.name
        const avatar = u?.avatar
        return id && name ? { id: String(id), name: String(name), avatar: avatar || '' } : null
      })
      .filter(Boolean)
  }, [friendsForShare])

  const mentionCandidates = useMemo(() => {
    if (!mentionQuery.trim()) return friendsForMention.slice(0, 8)
    const q = mentionQuery.trim().toLowerCase()
    return friendsForMention
      .filter((f) => f.name.toLowerCase().includes(q))
      .slice(0, 8)
  }, [friendsForMention, mentionQuery])

  const loadFriendsForShare = (page = 1, append = false) => {
    if (friendsForShareLoading) return
    setFriendsForShareLoading(true)
    friendsService
      .getList({ limit: 10, page })
      .then((res) => {
        const raw = res?.data?.data ?? res?.data ?? []
        const list = Array.isArray(raw) ? raw : []
        if (append) {
          setFriendsForShare((prev) => [...prev, ...list])
        } else {
          setFriendsForShare(list)
        }
        setFriendsHasMore(list.length >= 10)
        setFriendsPage(page)
      })
      .catch(() => {
        if (!append) setFriendsForShare([])
        setFriendsHasMore(false)
      })
      .finally(() => setFriendsForShareLoading(false))
  }

  useEffect(() => {
    if (!open) return
    setFriendsForShare([])
    setFriendsHasMore(true)
    loadFriendsForShare(1, false)
    setSelectedFriendIds(new Set())
    setSelectedGroupIds(new Set())
    setShowMentionDropdown(false)
    setMentionQuery('')
    setImages([])
    setVideoUrl('')
    setDocuments([])
    setUploading(false)
    addons.setShowEmojiPicker(false)
    addons.setShowGifPicker(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onMouseDown = (e) => {
      if (repostBlockRef.current && !repostBlockRef.current.contains(e.target)) {
        setShowMentionDropdown(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  useEffect(() => {
    if (!showMessengerGroupModal || messengerGroups.length > 0) return
    setMessengerGroupsLoading(true)
    conversationService
      .getList()
      .then((res) => {
        const raw = res?.data
        const list = Array.isArray(raw)
          ? raw
          : raw?.data && Array.isArray(raw.data)
          ? raw.data
          : []
        const groups = list.filter(
          (c) => c.isGroup === true || c.type === 'group'
        )
        setMessengerGroups(groups)
      })
      .catch(() => setMessengerGroups([]))
      .finally(() => setMessengerGroupsLoading(false))
  }, [showMessengerGroupModal, messengerGroups.length])

  if (!open || !post) return null

  const handleRepost = async () => {
    if (submitting || uploading) return
    setSubmitting(true)
    setError('')
    try {
      const contentRaw = repostText.trim()
      const content = contentRaw
      const mentions = resolveMentionIds(repostText, friendsForMention)

      await communityService.createPost({
        content: content || ' ',
        sharedPostId: post.id || post._id,
        images: images.length ? images : undefined,
        video: videoUrl || undefined,
        documents: documents.length
          ? documents.map((d) =>
              typeof d === 'string' ? { url: d, name: '' } : { url: d.url, name: d.name || '' }
            )
          : undefined,
        mentions: mentions.length ? mentions : undefined,
      })
      const sharedSourceId = post.id || post._id
      if (sharedSourceId) {
        showEngSuccessToast(t('dashboard.shareSuccess') || 'Chia sẻ bài viết thành công.')
        onRepostSuccess?.(sharedSourceId)
      }
      onClose?.()
    } catch (e) {
      setError(
        e?.message ||
          t('common.error') ||
          'Có lỗi xảy ra khi chia sẻ bài viết.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleImageSelect = async (e) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return
    setUploading(true)
    setError('')
    try {
      const next = []
      for (const file of files.slice(0, 10 - images.length)) {
        const data = await uploadService.uploadMedia(file)
        if (data?.url) next.push(data.url)
      }
      setImages((prev) => [...prev, ...next].slice(0, 10))
    } catch {
      setError(t('dashboard.uploadError') || 'Upload that bai.')
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
      const data = await uploadService.uploadMedia(file)
      if (data?.url) setVideoUrl(data.url)
    } catch {
      setError(t('dashboard.uploadError') || 'Upload that bai.')
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
      const next = []
      for (const file of files.slice(0, 5 - documents.length)) {
        const data = await uploadService.uploadMedia(file)
        if (data?.url) next.push({ url: data.url, name: data.name || file.name || '' })
      }
      setDocuments((prev) => [...prev, ...next].slice(0, 5))
    } catch {
      setError(t('dashboard.uploadError') || 'Upload that bai.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleExternalShare = () => {
    if (!origin) {
      handleCopyLink()
      return
    }
    const text =
      t('dashboard.shareText') ||
      'Xem bài viết này:'
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      postUrl
    )}&quote=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleInAppShare = () => {
    handleCopyLink()
    alert(
      t('dashboard.shareInAppHint') ||
        'Link bài viết đã được copy, bạn có thể dán vào chat hoặc nhóm.'
    )
  }

  const handleRepostTextChange = (e) => {
    const v = e.target.value
    setRepostText(v)
    const cursor = e.target.selectionStart
    const textBefore = v.slice(0, cursor)
    const match = textBefore.match(/@([^\s@#]*)$/)
    if (match) {
      setShowMentionDropdown(true)
      setMentionQuery(match[1] || '')
    } else {
      setShowMentionDropdown(false)
      setMentionQuery('')
    }
  }

  const handleRepostTextKeyDown = (e) => {
    const ta = repostTextareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const hasSelection = start !== end
    const ranges = getMentionRanges(repostText || '')

    if (e.key === 'Backspace' && !hasSelection) {
      const at = start
      const range = ranges.find((r) => at > r.start && at <= r.end)
      if (range) {
        e.preventDefault()
        const next = repostText.slice(0, range.start) + repostText.slice(range.end)
        setRepostText(next)
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
        const next = repostText.slice(0, range.start) + repostText.slice(range.end)
        setRepostText(next)
        setTimeout(() => {
          ta.focus()
          ta.setSelectionRange(range.start, range.start)
        }, 0)
      }
    }
  }

  const insertMention = (friend) => {
    const ta = repostTextareaRef.current
    if (!ta) return
    const cursor = ta.selectionStart
    const textBefore = repostText.slice(0, cursor)
    const start = textBefore.lastIndexOf('@')
    if (start === -1) return
    const before = repostText.slice(0, start)
    const after = repostText.slice(cursor)
    const newValue = `${before}@${friend.name} ${after}`
    setRepostText(newValue)
    setShowMentionDropdown(false)
    setMentionQuery('')
    setTimeout(() => {
      ta.focus()
      const pos = start + friend.name.length + 2
      ta.setSelectionRange(pos, pos)
    }, 0)
  }

  const body = (
    <div
      className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t('dashboard.share') || 'Chia sẻ bài viết'}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[760px] rounded-2xl bg-white dark:bg-card-dark text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-border-dark shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với tiêu đề + nút X */}
        <div className="relative px-4 py-4 border-b border-slate-200 dark:border-border-dark flex justify-center items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {(() => {
              const raw = t('dashboard.sharePostTitle')
              return !raw || raw === 'dashboard.sharePostTitle'
                ? 'Chia sẻ'
                : raw
            })()}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 p-1 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label={t('buttons.close') || 'Đóng'}
          >
            <span className="material-symbols-outlined text-[20px]">
              close
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto">
          <PostShareComposerSection
            t={t}
            post={post}
            user={user}
            audience={audience}
            setAudience={setAudience}
            audienceOpen={audienceOpen}
            setAudienceOpen={setAudienceOpen}
            repostBlockRef={repostBlockRef}
            repostTextareaRef={repostTextareaRef}
            repostText={repostText}
            onRepostTextChange={handleRepostTextChange}
            onRepostTextKeyDown={handleRepostTextKeyDown}
            showMentionDropdown={showMentionDropdown}
            mentionCandidates={mentionCandidates}
            onInsertMention={insertMention}
            submitting={submitting}
            uploading={uploading}
            error={error}
            images={images}
            videoUrl={videoUrl}
            documents={documents}
            onRemoveImage={(idx) => setImages((prev) => prev.filter((_, i) => i !== idx))}
            onRemoveVideo={() => setVideoUrl('')}
            onRemoveDoc={(idx) => setDocuments((prev) => prev.filter((_, i) => i !== idx))}
            onImageSelect={handleImageSelect}
            onVideoSelect={handleVideoSelect}
            onDocSelect={handleDocSelect}
            addons={addons}
          />

          <div className="border-t border-slate-200 dark:border-border-dark mx-4" />

          {/* Gửi bằng Messenger */}
          <div className="p-4">
            <h3 className="text-[17px] font-bold mb-4 text-slate-900 dark:text-slate-100">
              {t('dashboard.shareMessengerSection') || 'Gửi bằng Messenger'}
            </h3>
            <div className="relative group">
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 relative">
                {friendsForShareLoading ? (
                  <div className="flex items-center justify-center h-16 px-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined animate-spin text-[20px] mr-1">
                      progress_activity
                    </span>
                    {t('dashboard.loading') || 'Đang tải...'}
                  </div>
                ) : friendsForShare.length === 0 ? (
                  <div className="flex items-center justify-center h-16 px-4 text-xs text-slate-500 dark:text-slate-400">
                    {t('dashboard.noFriendsOnline') || 'Chưa có bạn bè.'}
                  </div>
                ) : (
                  <>
                    {friendsForShare.map((item) => {
                      const u = item?.user || item
                      const name = u?.name || 'User'
                      const id = u?.id ?? u?._id
                      const avatar =
                        u?.avatar ||
                        (name
                          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              name
                            )}&background=13b6ec&color=fff`
                          : DEFAULT_AVATAR)
                      return (
                        <button
                          key={id || name}
                          type="button"
                          onClick={async () => {
                            if (!id) return
                            try {
                              const oneFriendSet = new Set([String(id)])
                              await sendShareToTargets(oneFriendSet, new Set())
                              onClose?.()
                            } catch (e) {
                              console.error(
                                'Failed to quick-share via Messenger',
                                e
                              )
                              alert(
                                t('dashboard.shareSendFailed') ||
                                  'Không gửi được link qua tin nhắn. Vui lòng thử lại.'
                              )
                            }
                          }}
                          className="flex flex-col items-center gap-1.5 min-w-[72px] text-center text-slate-700 dark:text-slate-200"
                        >
                          <img
                            src={avatar}
                            alt={name}
                            className="w-14 h-14 rounded-full border border-slate-200 dark:border-border-dark object-cover bg-slate-100 dark:bg-background-dark"
                          />
                          <span className="text-[12px] font-medium leading-tight truncate max-w-[72px]">
                            {name}
                          </span>
                        </button>
                      )
                    })}
                    {friendsForShare.length > 0 && friendsHasMore && (
                      <button
                        type="button"
                        disabled={friendsForShareLoading}
                        onClick={() =>
                          !friendsForShareLoading &&
                          loadFriendsForShare(friendsPage + 1, true)
                        }
                        className="flex flex-col items-center gap-1.5 min-w-[72px] text-center text-slate-700 dark:text-slate-200"
                      >
                        <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-background-dark/80 hover:bg-slate-200 dark:hover:bg-background-dark flex items-center justify-center cursor-pointer border border-slate-200 dark:border-border-dark transition-colors disabled:opacity-60">
                          <span className="material-symbols-outlined">
                            more_horiz
                          </span>
                        </div>
                        <span className="text-[12px] font-medium leading-tight">
                          {t('dashboard.shareDemoMore') || 'Xem thêm'}
                        </span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-border-dark mx-4" />

          {/* Chia sẻ lên */}
          <div className="p-4">
            <h3 className="text-[17px] font-bold mb-4 text-slate-900 dark:text-slate-100">
              {t('dashboard.shareExternal') || 'Chia sẻ lên'}
            </h3>
            <div className="flex flex-wrap gap-8 text-[12px] text-slate-500 dark:text-slate-400">
              {/* Messenger */}
              <button
                type="button"
                onClick={() => {
                  setMessengerModalMode('both')
                  setShowMessengerGroupModal(true)
                }}
                className="flex flex-col items-center gap-2 group text-slate-600 dark:text-slate-400"
              >
                <div className="w-12 h-12 bg-slate-100 dark:bg-background-dark/80 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-background-dark transition-colors border border-slate-200 dark:border-border-dark text-slate-700 dark:text-slate-200">
                  <span className="material-symbols-outlined text-[24px]">
                    chat_bubble
                  </span>
                </div>
                <span className="group-hover:text-slate-900 dark:group-hover:text-white">Messenger</span>
              </button>

              {/* Sao chép liên kết */}
              <button
                type="button"
                onClick={() => handleCopyLink(true)}
                className="flex flex-col items-center gap-2 group text-slate-600 dark:text-slate-400"
              >
                <div className="w-12 h-12 bg-slate-100 dark:bg-background-dark/80 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-background-dark transition-colors border border-slate-200 dark:border-border-dark text-slate-700 dark:text-slate-200">
                  <span className="material-symbols-outlined text-[24px]">
                    link
                  </span>
                </div>
                <span className="group-hover:text-slate-900 dark:group-hover:text-white text-center leading-tight">
                  {t('dashboard.shareCopyLink') || 'Sao chép liên kết'}
                </span>
              </button>

              {/* Nhóm */}
              <button
                type="button"
                onClick={() => {
                  setMessengerModalMode('groupsOnly')
                  setShowMessengerGroupModal(true)
                }}
                className="flex flex-col items-center gap-2 group text-slate-600 dark:text-slate-400"
              >
                <div className="w-12 h-12 bg-slate-100 dark:bg-background-dark/80 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-background-dark transition-colors border border-slate-200 dark:border-border-dark text-slate-700 dark:text-slate-200">
                  <span className="material-symbols-outlined text-[24px]">
                    groups
                  </span>
                </div>
                <span className="group-hover:text-slate-900 dark:group-hover:text-white">Nhóm</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer: Cancel + Share with same size */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-200 dark:border-border-dark">
          <button
            type="button"
            onClick={onClose}
            className="h-10 min-w-[120px] px-4 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-background-dark/70 border border-slate-200 dark:border-border-dark hover:bg-slate-200 dark:hover:bg-background-dark"
          >
            {t('buttons.cancel') || 'Hủy'}
          </button>
          <button
            type="button"
            onClick={handleRepost}
            disabled={submitting || uploading}
            className="h-10 min-w-[120px] px-4 rounded-lg text-sm font-semibold text-white bg-primary hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting
              ? t('dashboard.sharing') || 'Dang chia se...'
              : t('dashboard.shareNow') || 'Chia se'}
          </button>
        </div>
      </div>
    </div>
  )

  const messengerGroupsBody = (
    <PostShareMessengerGroupModal
      open={showMessengerGroupModal}
      t={t}
      messengerGroupSearch={messengerGroupSearch}
      setMessengerGroupSearch={setMessengerGroupSearch}
      messengerGroupsLoading={messengerGroupsLoading}
      messengerGroups={messengerGroups}
      friendsForShare={friendsForShare}
      messengerModalMode={messengerModalMode}
      selectedFriendIds={selectedFriendIds}
      setSelectedFriendIds={setSelectedFriendIds}
      selectedGroupIds={selectedGroupIds}
      setSelectedGroupIds={setSelectedGroupIds}
      onClose={() => setShowMessengerGroupModal(false)}
      onSend={async () => {
        try {
          await sendShareToTargets(selectedFriendIds, selectedGroupIds)
          setShowMessengerGroupModal(false)
        } catch (e) {
          console.error('Failed to send share link via Messenger', e)
          alert(
            t('dashboard.shareSendFailed') ||
              'Khong gui duoc link qua tin nhan. Vui long thu lai.'
          )
        }
      }}
    />
  )

  return createPortal(
    <>
      {body}
      {messengerGroupsBody}
    </>,
    document.body
  )
}

