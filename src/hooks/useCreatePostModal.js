import { useState, useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { communityService, uploadService } from '../services'
import { extractHashtags, extractMentionNames, getMentionRanges, resolveMentionIds } from '../utils/postContent'
import { showEngSuccessToast } from '../utils/showEngToast'
import { usePostComposerAddons } from './usePostComposerAddons'

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=13b6ec&color=fff'

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

export function useCreatePostModal({
  friendsList = [],
  groupId,
  initialVisibility = 'public',
  forGroup = false,
  open,
  onClose,
  onSuccess,
}) {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [videoUrl, setVideoUrl] = useState('')
  const [documents, setDocuments] = useState([])
  const [visibility, setVisibility] = useState(initialVisibility || 'public')
  const [posting, setPosting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [violationResult, setViolationResult] = useState(null)
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')

  const contentTextareaRef = useRef(null)
  const contentBlockRef = useRef(null)

  const friendsForMention = useMemo(() => normalizeFriendsList(friendsList), [friendsList])

  const mentionCandidates = useMemo(() => {
    const names = extractMentionNames(content)
    const alreadyMentioned = new Set(names.map((n) => n.trim().toLowerCase()))
    if (names.length && names[names.length - 1].trim().toLowerCase() === mentionQuery.trim().toLowerCase()) {
      alreadyMentioned.delete(mentionQuery.trim().toLowerCase())
    }
    const filtered = friendsForMention.filter((f) => !alreadyMentioned.has(f.name.trim().toLowerCase()))
    if (!mentionQuery.trim()) return filtered.slice(0, 8)
    const q = mentionQuery.toLowerCase()
    return filtered.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 8)
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
    } catch {
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
    } catch {
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
    } catch {
      setError(t('dashboard.uploadError') || 'Upload thất bại.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index))
  const removeVideo = () => setVideoUrl('')
  const removeDoc = (index) => setDocuments((prev) => prev.filter((_, i) => i !== index))

  const handleSelectGif = (gifUrl) => {
    if (images.length >= 10) return
    setImages((prev) => [...prev, gifUrl].slice(0, 10))
  }

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

  const addons = usePostComposerAddons({
    open,
    onInsertEmoji: insertEmoji,
    onSelectGif: handleSelectGif,
  })

  useEffect(() => {
    if (!open) return
    const onMouseDown = (e) => {
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
      addons.setShowGifPicker(false)
      addons.setShowEmojiPicker(false)
      setMentionQuery(match[1] || '')
    } else {
      setShowMentionDropdown(false)
    }
  }

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
    const text = content?.trim()
    if (!text && images.length === 0 && !videoUrl && documents.length === 0) return
    if (posting) return
    setPosting(true)
    setError('')
    setViolationResult(null)
    try {
      const tags = extractHashtags(text)
      const mentions = resolveMentionIds(text, friendsForMention)
      const payload = {
        content: text || ' ',
        images,
        video: videoUrl || undefined,
        documents: documents.length
          ? documents.map((d) =>
              typeof d === 'string' ? { url: d, name: '' } : { url: d.url, name: d.name || '' }
            )
          : undefined,
        tags: tags.length ? tags : undefined,
        mentions: mentions.length ? mentions : undefined,
      }
      if (groupId) {
        payload.groupId = groupId
      }
      if (forGroup) {
        payload.visibility = visibility === 'public' ? 'public' : 'group'
      } else if (visibility && visibility !== 'public') {
        payload.visibility = visibility
      }
      const res = await communityService.createPost(payload)
      const newPost = res?.data?.post ?? res?.data
      if (newPost) {
        showEngSuccessToast(t('dashboard.postSuccess') || 'Đã đăng bài viết!')
        onSuccess?.(newPost)
      }
      setContent('')
      setImages([])
      setVideoUrl('')
      setDocuments([])
      onClose?.()
    } catch (err) {
      if (err?.status === 422 && err?.data?.data) {
        // Nội dung vi phạm: lưu kết quả kiểm duyệt để hiển thị UI
        setViolationResult(err.data.data)
        setError(err?.data?.message || err?.message || 'Nội dung bài viết vi phạm tiêu chuẩn cộng đồng.')
      } else if (err?.status === 503) {
        // Moderation service tạm thời không khả dụng
        setError('Hệ thống kiểm duyệt nội dung đang tạm thời không khả dụng. Vui lòng thử lại sau.')
      } else {
        setError(err?.data?.message || err?.message || t('dashboard.postFailed') || 'Đăng bài thất bại.')
      }
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
      setViolationResult(null)
      addons.setShowGifPicker(false)
      addons.setShowEmojiPicker(false)
      setShowMentionDropdown(false)
      onClose?.()
    }
  }

  return {
    t,
    user,
    displayAvatar,
    state: {
      content,
      images,
      videoUrl,
      documents,
      visibility,
      posting,
      uploading,
      error,
      violationResult,
      showMentionDropdown,
      mentionCandidates,
    },
    refs: {
      imageInputRef: addons.imageInputRef,
      videoInputRef: addons.videoInputRef,
      docInputRef: addons.docInputRef,
      gifPickerRef: addons.gifPickerRef,
      emojiPickerRef: addons.emojiPickerRef,
      contentTextareaRef,
      contentBlockRef,
    },
    addons,
    handleContentChange,
    handleContentKeyDown,
    insertMention,
    handleImageSelect,
    handleVideoSelect,
    handleDocSelect,
    removeImage,
    removeVideo,
    removeDoc,
    handleSubmit,
    handleClose,
    setVisibility,
  }
}

