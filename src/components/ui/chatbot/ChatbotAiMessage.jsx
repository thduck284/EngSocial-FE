import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lessonsService } from '../../../services'
import { getLessonLink } from '../../../utils/lesson'
import {
  escapeHtml,
  formatInlineMarkdownHtml,
  splitBodySegments,
  splitChatbotMessage,
  stripUnverifiedLessonBlocks,
  stripFakeLessonCatalogLines,
  toAbsoluteLessonUrl,
} from '../../../utils/chatbotMessage'
import { ChatbotLessonCards } from './ChatbotLessonCards'

function RichTextBlock({ text }) {
  if (!text) return null
  return (
    <span
      className="chatbot-md"
      dangerouslySetInnerHTML={{
        __html: `<span class="space-y-1">${formatInlineMarkdownHtml(escapeHtml(text))}</span>`,
      }}
    />
  )
}

async function verifyLessonItem(item) {
  if (!item.slug) return null
  try {
    const res = await lessonsService.getById(item.slug)
    const L = res?.data?.lesson ?? res?.data ?? res
    if (!L?.slug && !L?._id) return null
    const href = getLessonLink(L)
    return {
      ...item,
      title: item.title || L.title,
      description: (L.description || '').slice(0, 160),
      thumbnail: L.thumbnail,
      skill: L.skill,
      level: L.level,
      category: L.category,
      topic: L.topic,
      path: href,
      href,
      slug: L.slug || item.slug,
      absoluteUrl: toAbsoluteLessonUrl(href),
    }
  } catch {
    return null
  }
}

export function ChatbotAiMessage({ text }) {
  const { t } = useTranslation()
  const { body: rawBody, lessons: parsedLessons } = useMemo(
    () => splitChatbotMessage(text),
    [text],
  )
  const [verifiedLessons, setVerifiedLessons] = useState([])
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!parsedLessons.length) {
      setVerifiedLessons([])
      setChecking(false)
      return
    }
    let cancelled = false
    setChecking(true)
    ;(async () => {
      const results = await Promise.all(parsedLessons.map((item) => verifyLessonItem(item)))
      if (!cancelled) {
        setVerifiedLessons(results.filter(Boolean))
        setChecking(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [text, parsedLessons])

  const verifiedPaths = useMemo(
    () => new Set(verifiedLessons.map((l) => l.path).filter(Boolean)),
    [verifiedLessons],
  )

  const body = useMemo(() => {
    let text = rawBody
    if (parsedLessons.length) {
      if (checking) text = stripUnverifiedLessonBlocks(rawBody, new Set())
      else text = stripUnverifiedLessonBlocks(rawBody, verifiedPaths)
    }
    text = stripFakeLessonCatalogLines(
      text,
      verifiedLessons.map((l) => l.title).filter(Boolean),
    )
    return text
  }, [rawBody, parsedLessons.length, checking, verifiedPaths, verifiedLessons])

  const segments = splitBodySegments(
    body,
    parsedLessons.length ? (verifiedPaths.size ? verifiedPaths : new Set()) : null,
  )

  const showNoLessonsNote =
    parsedLessons.length > 0 && !checking && verifiedLessons.length === 0

  return (
    <div className="text-sm leading-relaxed">
      <div className="space-y-1">
        {segments.map((seg, i) => {
          if (seg.type === 'text') {
            return <RichTextBlock key={`t-${i}`} text={seg.value} />
          }
          const href = toAbsoluteLessonUrl(seg.path)
          return (
            <span
              key={`l-${i}`}
              className={`${seg.inline ? 'inline' : 'block'} my-1.5 text-xs leading-relaxed`}
            >
              {seg.prefix ? (
                <span className="text-gray-400">{seg.prefix}</span>
              ) : null}
              <Link
                to={seg.path}
                className="text-sky-400 hover:text-sky-300 underline underline-offset-2 break-all"
              >
                {href}
              </Link>
            </span>
          )
        })}
      </div>
      {showNoLessonsNote && (
        <p className="mt-3 text-xs text-amber-200/90 border border-amber-500/30 bg-amber-950/30 rounded-lg px-3 py-2">
          {t(
            'chatbot.noVerifiedLessons',
            'Không có bài học thật trên hệ thống khớp gợi ý trên — các link có thể do AI tự tạo đã được ẩn.',
          )}
        </p>
      )}
      {verifiedLessons.length > 0 && <ChatbotLessonCards items={verifiedLessons} />}
    </div>
  )
}
