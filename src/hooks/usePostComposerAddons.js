import { useEffect, useMemo, useRef, useState } from 'react'
import { hasGiphyKey, searchGiphy } from '../services/giphy.service'
import { getMessageEmojiCategories } from '../utils/emoji'

export function usePostComposerAddons({ open, onInsertEmoji, onSelectGif }) {
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [gifQuery, setGifQuery] = useState('')
  const [gifResults, setGifResults] = useState([])
  const [gifLoading, setGifLoading] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [emojiCategoryId, setEmojiCategoryId] = useState('faces')

  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const docInputRef = useRef(null)
  const gifPickerRef = useRef(null)
  const emojiPickerRef = useRef(null)

  const emojiCategories = useMemo(() => getMessageEmojiCategories(), [])
  const currentEmojis = useMemo(
    () =>
      emojiCategories.find((c) => c.id === emojiCategoryId)?.emojis ??
      emojiCategories[0]?.emojis ??
      [],
    [emojiCategories, emojiCategoryId],
  )

  const handleGifSearch = async () => {
    if (!hasGiphyKey) return
    setGifLoading(true)
    try {
      const results = await searchGiphy(gifQuery || '')
      setGifResults(results || [])
    } finally {
      setGifLoading(false)
    }
  }

  const insertEmoji = (emoji) => {
    onInsertEmoji?.(emoji)
    setShowEmojiPicker(false)
  }

  const handleSelectGif = (gifUrl) => {
    onSelectGif?.(gifUrl)
    setShowGifPicker(false)
    setGifQuery('')
    setGifResults([])
  }

  useEffect(() => {
    if (!showGifPicker || !hasGiphyKey || gifResults.length > 0 || gifQuery.trim()) return
    setGifLoading(true)
    searchGiphy('')
      .then((results) => setGifResults(results || []))
      .finally(() => setGifLoading(false))
  }, [showGifPicker, gifResults.length, gifQuery])

  useEffect(() => {
    if (!open) return
    const onMouseDown = (e) => {
      if (e.target.closest('[data-composer-floating-panel]')) return
      if (gifPickerRef.current && !gifPickerRef.current.contains(e.target)) setShowGifPicker(false)
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) setShowEmojiPicker(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  return {
    showGifPicker,
    setShowGifPicker,
    gifQuery,
    setGifQuery,
    gifResults,
    gifLoading,
    showEmojiPicker,
    setShowEmojiPicker,
    emojiCategoryId,
    setEmojiCategoryId,
    imageInputRef,
    videoInputRef,
    docInputRef,
    gifPickerRef,
    emojiPickerRef,
    emojiCategories,
    currentEmojis,
    handleGifSearch,
    handleSelectGif,
    insertEmoji,
    hasGiphyKey,
  }
}
