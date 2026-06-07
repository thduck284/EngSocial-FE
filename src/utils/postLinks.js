import { captureMainScrollY } from './scrollRestore'
import { communityService } from '../services'
import { getDisplayContent } from './postContent'
import { normalizeMentions } from './post'

/** Matches /post/:id but not /post/photo/:id */
const POST_PATH_REGEX = /\/post\/(?!photo\/)([^/?#\s]+)/

/**
 * Extract post id from an internal post URL (absolute or path-only).
 * @param {string} url
 * @returns {string|null}
 */
export function extractPostIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed, window.location.origin)
    if (parsed.origin !== window.location.origin) return null
    const match = parsed.pathname.match(POST_PATH_REGEX)
    return match?.[1] ?? null
  } catch {
    const match = trimmed.match(POST_PATH_REGEX)
    return match?.[1] ?? null
  }
}

/**
 * @param {string} postId
 * @returns {string}
 */
export function postDetailPath(postId) {
  if (!postId) return '/home'
  return `/post/${encodeURIComponent(postId)}`
}

/**
 * Navigate to post detail modal route, preserving background page + scroll position.
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {import('react-router-dom').Location} location
 * @param {string} postId
 */
export function navigateToPostDetail(navigate, location, postId) {
  if (!postId) return
  const targetPath = postDetailPath(postId)
  const currentPostId = location.pathname.match(POST_PATH_REGEX)?.[1]
  if (currentPostId === String(postId)) return

  const isOnPostDetail = Boolean(currentPostId)
  const rootBackground = location.state?.background ?? (!isOnPostDetail ? location : undefined)
  const parentPostId = isOnPostDetail ? currentPostId : undefined

  const nextState = {
    scrollY: location.state?.scrollY ?? captureMainScrollY(),
  }
  if (rootBackground) nextState.background = rootBackground
  if (parentPostId) nextState.parentPostId = parentPostId

  navigate(targetPath, {
    state: nextState,
    preventScrollReset: true,
  })
}

/**
 * Resolve embedded shared post id from preview object or parent post field.
 * @param {object|string|null|undefined} sharedPost
 * @param {string|null|undefined} [fallbackId]
 * @returns {string|null}
 */
export function resolveSharedPostId(sharedPost, fallbackId) {
  if (fallbackId != null && String(fallbackId).trim()) return String(fallbackId)
  if (!sharedPost) return null
  if (typeof sharedPost === 'string') return sharedPost.trim() || null
  const id = sharedPost.id ?? sharedPost._id
  return id != null ? String(id) : null
}

/**
 * Close post detail modal and return to the previous route with scroll restored.
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {import('react-router-dom').Location} location
 * @param {string} [fallbackPath='/home']
 */
export function closePostDetail(navigate, location, fallbackPath = '/home') {
  const parentPostId = location.state?.parentPostId
  const bg = location.state?.background
  const scrollY = location.state?.scrollY

  if (parentPostId) {
    const parentState = { scrollY }
    if (bg) parentState.background = bg
    navigate(postDetailPath(parentPostId), {
      state: parentState,
      preventScrollReset: true,
    })
    return
  }

  if (bg) {
    navigate(
      { pathname: bg.pathname, search: bg.search, hash: bg.hash },
      {
        state: { ...(bg.state || {}), restoreScrollY: scrollY },
        preventScrollReset: true,
      }
    )
    return
  }

  if (window.history.length > 1) {
    navigate(-1)
    return
  }

  navigate(fallbackPath, { replace: true })
}

/** @deprecated Use postDetailPath */
export function homePostModalUrl(postId) {
  return postDetailPath(postId)
}

/**
 * Link preview for internal /post/:id URLs (description without @mentions).
 * @param {string} url
 */
export async function fetchPostLinkPreview(url) {
  const postId = extractPostIdFromUrl(url)
  if (!postId) return null

  try {
    const res = await communityService.getPost(postId)
    const post = res?.data?.post ?? res?.data
    if (!post) return null

    const mentions = normalizeMentions(post.mentions)
    const authorName = post.author?.name || 'User'
    const description = getDisplayContent(post.content, mentions)
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160)

    const images = Array.isArray(post.images)
      ? post.images.filter((u) => typeof u === 'string' && u.trim())
      : []
    const hostname =
      typeof window !== 'undefined' ? window.location.hostname.replace(/^www\./, '') : 'EngSocial'

    return {
      url,
      title: authorName,
      description,
      image: images[0] || '',
      siteName: 'EngSocial',
      hostname,
      favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`,
    }
  } catch {
    return null
  }
}
