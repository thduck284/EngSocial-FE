import { Link } from 'react-router-dom'
import { ROUTES } from '../../../constants'
import { parseContentSegments } from '../../../utils/postContent'

/**
 * Renders post content with clickable hashtags and @mentions.
 */
export function PostContentBody({ content, mentions = [] }) {
  const segments = parseContentSegments(content || '', mentions)
  if (segments.length === 0) return <span className="whitespace-pre-wrap">{content || ''}</span>
  return (
    <span className="whitespace-pre-wrap">
      {segments.map((seg, i) => {
        if (seg.type === 'text') return <span key={i}>{seg.value}</span>
        if (seg.type === 'hashtag') {
          return (
            <Link
              key={i}
              to={`${ROUTES.SEARCH}?q=${encodeURIComponent(seg.value)}`}
              className="text-primary font-medium hover:underline"
            >
              {seg.value}
            </Link>
          )
        }
        if (seg.type === 'mention' && seg.mention?.id) {
          const label = seg.mention?.name
            ? `@${seg.mention.name}`
            : seg.value
          return (
            <Link
              key={i}
              to={ROUTES.PROFILE_USER(seg.mention.id)}
              className="text-primary font-medium hover:underline"
            >
              {label}
            </Link>
          )
        }
        return <span key={i}>{seg.value}</span>
      })}
    </span>
  )
}

