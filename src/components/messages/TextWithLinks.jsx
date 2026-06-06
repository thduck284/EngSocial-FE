import { useNavigate, useLocation } from 'react-router-dom'
import { parseTextWithLinks } from '../../utils/messages'
import { extractPostIdFromUrl, navigateToPostDetail, postDetailPath } from '../../utils/postLinks'

export function TextWithLinks({ text, className, fromMe = false }) {
  const navigate = useNavigate()
  const location = useLocation()

  if (!text || typeof text !== 'string') return null
  const parts = parseTextWithLinks(text)
  const linkClass = fromMe
    ? 'text-amber-100 hover:text-white underline underline-offset-2 decoration-amber-200/90 font-semibold break-all'
    : 'text-blue-600 dark:text-sky-400 hover:text-blue-700 dark:hover:text-sky-300 underline font-medium break-all'

  const handleLinkClick = (e, url) => {
    const postId = extractPostIdFromUrl(url)
    if (!postId) return
    e.preventDefault()
    navigateToPostDetail(navigate, location, postId)
  }

  return (
    <span className={className}>
      {parts.map((p) => {
        if (p.type !== 'link') return p.value
        const postId = extractPostIdFromUrl(p.value)
        return (
          <a
            key={p.key}
            href={postId ? postDetailPath(postId) : p.value}
            target={postId ? undefined : '_blank'}
            rel={postId ? undefined : 'noopener noreferrer'}
            onClick={(e) => handleLinkClick(e, p.value)}
            className={linkClass}
          >
            {p.value}
          </a>
        )
      })}
    </span>
  )
}
