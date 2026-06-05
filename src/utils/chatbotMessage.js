const FOOTER_MARKER = /📚\s*\*\*(?:Bài học|Lessons & practice)/

/** Path hoặc URL đầy đủ tới bài học / luyện tập. */
export const LESSON_URL_IN_TEXT_RE =
  /(?:URL:\s*\n?\s*)?((?:https?:\/\/[^\s\n<>"']+)|(?:\/(?:practice|lesson)\/[a-z]+\/[^\s\n<>"']+))/gi

export function normalizeLinkLines(text) {
  return String(text || '').replace(
    /(^|\n)(\s*Link:\s*)\n+\s*((?:https?:\/\/\S+)|(?:\/(?:practice|lesson)\/\S+))/gim,
    '$1$2$3',
  )
}

export function getAppOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return ''
}

export function normalizeLessonPath(path) {
  if (!path) return null
  let p = String(path).trim().replace(/[.,;:!?)]+$/, '')
  if (!p.startsWith('/')) p = `/${p}`
  if (!/^\/(?:practice|lesson)\/[a-z]+\//i.test(p)) return null
  return p
}

export function pathToSlug(path) {
  const p = normalizeLessonPath(path)
  if (!p) return null
  const parts = p.split('/').filter(Boolean)
  return parts.length >= 3 ? parts[parts.length - 1] : null
}

export function urlToLessonPath(urlOrPath) {
  const raw = String(urlOrPath || '').trim()
  if (!raw) return null
  if (raw.startsWith('/')) return normalizeLessonPath(raw)
  try {
    const u = new URL(raw)
    return normalizeLessonPath(u.pathname)
  } catch {
    return normalizeLessonPath(raw)
  }
}

export function toAbsoluteLessonUrl(pathOrUrl) {
  const path = urlToLessonPath(pathOrUrl) || (String(pathOrUrl || '').startsWith('http') ? null : normalizeLessonPath(pathOrUrl))
  if (!path) {
    const raw = String(pathOrUrl || '').trim()
    return /^https?:\/\//i.test(raw) ? raw : raw
  }
  const origin = getAppOrigin()
  return origin ? `${origin}${path}` : path
}

const LESSON_BLOCK_RE =
  /\n?\d+\.\s*\[[^\]]+\][^\n]*\n-\s*URL:\s*\S+(?:\n-\s*Mô tả:[^\n]*)?/gi

/** Đổi mọi path/URL bài học trong text thành URL đầy đủ (giữ prefix "URL: "). */
export function expandLessonUrlsInText(text) {
  let s = String(text || '').replace(/URL:\s*\n\s*/gi, 'URL: ')
  return s.replace(LESSON_URL_IN_TEXT_RE, (match, urlPart) => {
    const path = urlToLessonPath(urlPart)
    const abs = path ? toAbsoluteLessonUrl(path) : toAbsoluteLessonUrl(urlPart)
    if (/^URL:\s*/i.test(match)) return `URL: ${abs}`
    return abs
  })
}

/** Xóa block gợi ý bài có URL không nằm trong verifiedPaths. */
export function stripUnverifiedLessonBlocks(text, verifiedPaths) {
  const verified = verifiedPaths instanceof Set ? verifiedPaths : new Set(verifiedPaths || [])
  if (!text) return text
  let out = String(text).replace(LESSON_BLOCK_RE, (block) => {
    const urlMatch = block.match(/URL:\s*(\S+)/i)
    if (!urlMatch) return ''
    const path = urlToLessonPath(urlMatch[1])
    if (!path || !verified.has(path)) return ''
    return block
  })
  out = out.replace(/\n{3,}/g, '\n\n').trimEnd()
  return out
}

/** Ẩn block [LESSON_CONTEXT], URL bài học trong chat (trừ dòng Link: gợi ý bài). */
export function cleanAssistantDisplayText(text) {
  let s = normalizeLinkLines(String(text || ''))
  s = s.replace(/\[LESSON_CONTEXT\][\s\S]*?\[\/LESSON_CONTEXT\]/gi, '')
  s = s.replace(/<!--\s*LESSONS:[\s\S]*?-->/gi, '')
  s = s.replace(
    /^Bài học & luyện tập EngSocial \(chỉ gợi ý[^\n]*\)\s*$/gim,
    '',
  )
  s = s.replace(/^\s*-\s*Chủ đề:\s*[^\n]+\s*$/gim, '')
  s = s.replace(/^\s*URL:\s*\S+\s*$/gim, '')
  s = s.replace(/^\s*🔗\s*\S+\s*$/gim, '')
  const lines = s.split('\n')
  s = lines
    .map((line) => {
      if (/^\s*Link:\s*\S+/i.test(line)) return line
      return line.replace(/https?:\/\/[^\s\n]*(?:\/lesson\/|\/practice\/)[^\s\n]*/gi, '')
    })
    .join('\n')
  s = s.replace(
    /^\s*(?:\d+\.\s*)?\[(?:Luyện tập|Bài học|Practice|Lesson)\s*[·|][^\n]*$/gim,
    '',
  )
  s = s.replace(
    /^link\s*&\s*mô\s*tả\s*ở\s*dưới\.?\s*$/gim,
    'Kèm link & mô tả ở thẻ bên dưới.',
  )
  s = s.replace(/^\s*[-•]\s*(?:Bài học|Lesson|Practice)\s*:\s*/gim, '• ')
  s = s.replace(/\(chủ đề:\s*[^)\n]+\)/gi, '')
  s = s.replace(/\(topic:\s*[^)\n]+\)/gi, '')
  s = s.replace(/\s*\((?:User|Human)\s*:[^)]*\)\s*/gi, '')
  s = s.replace(/^\s*User\s+(?:đang|dang|is|hỏi|hoi|asks?|CẢM|CHÀO|CHAO)\b[^\n]*/gim, '')
  const roleLeak = s.search(/(?:^|\n|\()\s*(?:User|Assistant|Human|Học viên|Hoc vien)\s*:/i)
  if (roleLeak >= 0) {
    s = s.slice(0, roleLeak).trimEnd()
  }
  const closeRe =
    /(Kèm\s*link\s*&\s*mô\s*tả\s*ở\s*thẻ\s*bên\s*dưới\.|See\s+links\s+in\s+the\s+cards\s+below\.|Link truy cập và mô tả chi tiết[^\n.]*\.|Bạn có thể mở bài trực tiếp[^\n.]*\.|Chi tiết và link chính thức[^\n.]*\.|Full link and description[^\n.]*\.|Open the card below[^\n.]*\.)/i
  const closeMatch = s.match(closeRe)
  let head = s
  let closeLine = ''
  if (closeMatch?.index != null) {
    head = s.slice(0, closeMatch.index)
    closeLine = closeMatch[0]
  }
  head = head.replace(
    /(?:ưới|ới|dưới|bên|thẻ|Kèm|link)[\s.]{0,3}(?=(?:ưới|ới|dưới|bên|thẻ|Kèm|link))+/gi,
    '',
  )
  s = (head + closeLine).replace(/\n{3,}/g, '\n\n').trim()
  return s
}

const CATALOG_ITEM_LINE =
  /^\s*(?:\d+\.\s*)?\[(?:Luyện tập|Bài học|Practice|Lesson)\s*[·|]/i
const CATALOG_META_LINE =
  /^\s*(?:-\s*)?(?:Mô tả|Ví dụ|Description|Example)\s*:/i

/** Gỡ dòng catalog bài học model bịa (không khớp title đã verify). */
export function stripFakeLessonCatalogLines(text, allowedTitles = []) {
  const s = String(text || '')
  if (!s) return s
  const allowed = new Set(
    (allowedTitles || [])
      .map((t) => String(t).trim().toLowerCase())
      .filter((t) => t.length >= 3),
  )
  const out = []
  let skipMeta = false
  for (const line of s.split('\n')) {
    if (CATALOG_ITEM_LINE.test(line)) {
      skipMeta = true
      continue
    }
    if (skipMeta) {
      if (CATALOG_META_LINE.test(line) || line.trim().startsWith('-')) continue
      skipMeta = false
    }
    out.push(line)
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()
}

export function splitChatbotMessage(text) {
  const raw = String(text || '')
  // Parse footer + link trước khi cleanAssistantDisplayText (hàm này cắt sau dòng "Kèm link…")
  const lessons = parseLessonSuggestions(raw)
  const match = raw.match(FOOTER_MARKER)
  const idx = match ? raw.indexOf(match[0]) : -1
  const body = cleanAssistantDisplayText(idx === -1 ? raw : raw.slice(0, idx)).trimEnd()
  const footer = idx === -1 ? '' : raw.slice(idx)
  return { body, footer, lessons }
}

export function parseLessonSuggestions(text) {
  const lessons = []
  const seen = new Set()

  const add = (title, path, meta) => {
    const normalized = normalizeLessonPath(path)
    if (!normalized || seen.has(normalized)) return
    seen.add(normalized)
    lessons.push({
      title: title?.trim() || null,
      path: normalized,
      meta: meta?.trim() || null,
      slug: pathToSlug(normalized),
    })
  }

  const metaMatch = text.match(/<!--\s*LESSONS:(\[[\s\S]*?\])\s*-->/i)
  if (metaMatch) {
    try {
      const arr = JSON.parse(metaMatch[1])
      if (Array.isArray(arr)) {
        for (const L of arr) {
          const slug = String(L?.slug || '').trim()
          if (!slug) continue
          const cat = String(L?.category || 'lesson').toLowerCase() === 'practice' ? 'practice' : 'lesson'
          const skill = String(L?.skill || 'reading').toLowerCase()
          const meta = [L?.level, L?.category === 'practice' ? 'Luyện tập' : 'Bài học']
            .filter(Boolean)
            .join(' · ')
          add(L?.title, `/${cat}/${skill}/${slug}`, meta)
        }
      }
    } catch {
      /* ignore malformed meta */
    }
  }

  const footerRe =
    /(\d+)\.\s*\*\*([^*]+)\*\*\s*—\s*([^\n]+)(?:\n(?![\d.]+\.\s*\*\*)[^\n🔗]*)*\n\s*🔗\s*(?:Kèm link:|Link:)?\s*((?:https?:\/\/\S+)|(?:\/(?:practice|lesson)\/\S+))/gi
  let m
  while ((m = footerRe.exec(text)) !== null) {
    add(m[2], m[4], m[3])
  }

  const numberedUrlRe =
    /\d+\.\s*\[[^\]]+\][^\n]*\n\s*-\s*URL:\s*((?:https?:\/\/\S+)|(?:\/(?:practice|lesson)\/\S+))/gi
  while ((m = numberedUrlRe.exec(text)) !== null) {
    const path = urlToLessonPath(m[1])
    if (path) add(null, path, null)
  }

  const urlLineRe =
    /-\s*URL:\s*\n?\s*((?:https?:\/\/\S+)|(?:\/(?:practice|lesson)\/\S+))/gi
  while ((m = urlLineRe.exec(text)) !== null) {
    const path = urlToLessonPath(m[1])
    if (path) add(null, path, null)
  }

  const bracketTitleRe =
    /\d+\.\s*\[(?:Lesson|Practice|Luyện tập|Bài học)[^\]]*\]:\s*([^\n]+)\s*\n\s*-\s*URL:\s*((?:https?:\/\/\S+)|(?:\/(?:practice|lesson)\/\S+))/gi
  while ((m = bracketTitleRe.exec(text)) !== null) {
    const path = urlToLessonPath(m[2])
    if (path) add(m[1], path, null)
  }

  const bulletResourceRe =
    /-\s*\[(?:Lesson|Practice)[^\]]*\]:\s*([^\n]+)\s*\n\s*-\s*URL:\s*((?:https?:\/\/\S+)|(?:\/(?:practice|lesson)\/\S+))/gi
  while ((m = bulletResourceRe.exec(text)) !== null) {
    const path = urlToLessonPath(m[2])
    if (path) add(m[1], path, null)
  }

  const linkOnlyRe =
    /🔗\s*(?:Kèm link:|Link:)?\s*((?:https?:\/\/\S+)|(?:\/(?:practice|lesson)\/\S+))/gi
  while ((m = linkOnlyRe.exec(text)) !== null) {
    const path = urlToLessonPath(m[1])
    if (path) add(null, path, null)
  }

  // Fallback: dòng footer có link nhưng không khớp block trên
  const looseFooterRe =
    /\*\*([^*]+)\*\*\s*—[^\n]*\n(?:[^\n]*\n)*?\s*🔗\s*(?:Kèm link:|Link:)?\s*((?:https?:\/\/\S+)|(?:\/(?:practice|lesson)\/\S+))/gi
  while ((m = looseFooterRe.exec(text)) !== null) {
    add(m[1], m[2], null)
  }

  return lessons
}

/** Chia body thành đoạn text / link bài học (chỉ link đã xác minh nếu truyền verifiedPaths). */
export function splitBodySegments(body, verifiedPaths = null) {
  const verified =
    verifiedPaths == null
      ? null
      : verifiedPaths instanceof Set
        ? verifiedPaths
        : new Set(verifiedPaths)
  const segments = []
  const s = expandLessonUrlsInText(normalizeLinkLines(body || ''))
  if (!s) return segments

  let last = 0
  let m
  const re = new RegExp(LESSON_URL_IN_TEXT_RE.source, 'gi')
  while ((m = re.exec(s)) !== null) {
    const path = urlToLessonPath(m[1])
    if (!path) continue
    if (verified && !verified.has(path)) continue

    const lineStart = s.lastIndexOf('\n', m.index - 1) + 1
    const lineBeforeUrl = s.slice(lineStart, m.index)
    const linkLabel = lineBeforeUrl.match(/Link:\s*$/i)

    if (m.index > last) {
      const textEnd = linkLabel ? lineStart + lineBeforeUrl.length - linkLabel[0].length : m.index
      if (textEnd > last) {
        segments.push({ type: 'text', value: s.slice(last, textEnd) })
      }
    }

    const full = m[0]
    let prefix = ''
    if (linkLabel) prefix = 'Link: '
    else if (/^URL:\s*/i.test(full)) prefix = 'URL: '
    else if (full.includes('🔗')) prefix = '🔗 '

    segments.push({ type: 'link', path, prefix, inline: Boolean(linkLabel) })
    last = m.index + m[0].length
  }
  if (last < s.length) {
    segments.push({ type: 'text', value: s.slice(last) })
  }
  if (segments.length === 0) {
    segments.push({ type: 'text', value: s })
  }
  return segments
}

export function escapeHtml(raw) {
  const d = document.createElement('div')
  d.textContent = String(raw ?? '')
  return d.innerHTML
}

export function formatInlineMarkdownHtml(escaped) {
  let h = escaped
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
  h = h.replace(/_([^_\n]+)_/g, '<em class="text-gray-300 not-italic">$1</em>')
  h = h.replace(/\n/g, '<br />')
  h = h.replace(/<br \/>•/g, '<br /><span class="text-violet-400 mr-1 select-none" aria-hidden>•</span>')
  h = h.replace(/<br \/>▸/g, '<br /><span class="text-sky-400 mr-1 select-none" aria-hidden>▸</span>')
  return h
}
