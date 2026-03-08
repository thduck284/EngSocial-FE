import { parseTextWithLinks } from '../../utils/messages'

export function TextWithLinks({ text, className }) {
  if (!text || typeof text !== 'string') return null
  const parts = parseTextWithLinks(text)
  return (
    <span className={className}>
      {parts.map((p) =>
        p.type === 'link' ? (
          <a key={p.key} href={p.value} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">
            {p.value}
          </a>
        ) : (
          p.value
        )
      )}
    </span>
  )
}
