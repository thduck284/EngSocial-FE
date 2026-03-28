/**
 * Extract hashtag strings from content (without #), unique and lowercase.
 * @param {string} content
 * @returns {string[]}
 */
export function extractHashtags(content) {
  if (!content || typeof content !== 'string') return []
  const matches = content.match(/#[\w\u00C0-\u024F\u1E00-\u1EFF]+/g)
  if (!matches) return []
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))]
}

/**
 * Extract full @mention names from content in order (e.g. "Hello @John Doe and @Jane" -> ["John Doe", "Jane"]).
 * Supports names with spaces; one mention per @ until next @ or end.
 * @param {string} content
 * @returns {string[]}
 */
export function extractMentionNames(content) {
  if (!content || typeof content !== 'string') return []
  const matches = content.match(/@([^\s@#]+(?:\s+[^\s@#]+)*)/g)
  if (!matches) return []
  return matches
    .map((m) => sanitizeMentionName(m.slice(1)))
    .filter(Boolean)
}

function sanitizeMentionName(name) {
  if (!name || typeof name !== 'string') return ''
  // Remove common punctuation around mention token, keep inner punctuation/spaces.
  return name
    .trim()
    .replace(/^[`"'([{<]+/, '')
    .replace(/[`"'.,!?;:)\]}>]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Get all @mention ranges in content (for delete-whole-mention UX).
 * @param {string} content
 * @returns {{ start: number, end: number, text: string }[]}
 */
export function getMentionRanges(content) {
  if (!content || typeof content !== 'string') return []
  const regex = /@([^\s@#]+(?:\s+[^\s@#]+)*)/g
  const ranges = []
  let match
  while ((match = regex.exec(content)) !== null) {
    ranges.push({ start: match.index, end: match.index + match[0].length, text: match[0] })
  }
  return ranges
}

/**
 * Return content with all @mention spans removed (for display when mentions are shown in header).
 * @param {string} content
 * @returns {string}
 */
export function getContentWithoutMentions(content) {
  if (!content || typeof content !== 'string') return ''
  const ranges = getMentionRanges(content)
  if (ranges.length === 0) return content
  let out = ''
  let last = 0
  for (const r of ranges) {
    out += content.slice(last, r.start)
    last = r.end
  }
  out += content.slice(last)
  return out.replace(/\s+/g, ' ').trim()
}

/**
 * Resolve mention names to user IDs in order of appearance using friends list.
 * @param {string} content
 * @param {{ id: string, name: string }[]} friendsList
 * @returns {string[]} array of user ids in order of @ appearance
 */
export function resolveMentionIds(content, friendsList) {
  if (!content || typeof content !== 'string' || !Array.isArray(friendsList)) return []
  const candidates = friendsList
    .map((f) => {
      const id = f?.id
      const name = sanitizeMentionName(f?.name || '')
      if (!id || !name) return null
      return { id, name, lower: name.toLowerCase() }
    })
    .filter(Boolean)
    .sort((a, b) => b.lower.length - a.lower.length)
  if (!candidates.length) return []

  const ids = []
  const seen = new Set()
  const lowerContent = content.toLowerCase()
  for (let i = 0; i < lowerContent.length; i += 1) {
    if (lowerContent[i] !== '@') continue
    const after = lowerContent.slice(i + 1)
    const matched = candidates.find((c) => {
      if (!after.startsWith(c.lower)) return false
      const nextChar = after[c.lower.length] || ''
      // valid end: whitespace/punctuation/end
      return !nextChar || /[\s.,!?;:)\]}>]/.test(nextChar)
    })
    if (matched) {
      if (!seen.has(matched.id)) {
        seen.add(matched.id)
        ids.push(matched.id)
      }
      i += matched.lower.length
    }
  }
  return ids
}

/**
 * Parse content into segments for rendering: text, hashtag, mention.
 * @param {string} content
 * @param {{ id: string, name?: string, avatar?: string }[]} mentions - populated mentions from post (order matches @ in content)
 * @returns {{ type: 'text'|'hashtag'|'mention', value: string, mention?: { id: string, name?: string, avatar?: string } }[]}
 */
export function parseContentSegments(content, mentions = []) {
  if (!content || typeof content !== 'string') return []
  const segments = []
  const regex = /(#[^\s#]+)|(@[^\s@#]+(?:\s+[^\s@#]+)*)/g
  let lastIndex = 0
  let mentionIndex = 0
  let match
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: content.slice(lastIndex, match.index) })
    }
    if (match[0].startsWith('#')) {
      segments.push({ type: 'hashtag', value: match[0] })
    } else if (match[0].startsWith('@')) {
      const mention = mentions[mentionIndex]
      segments.push({
        type: 'mention',
        value: match[0],
        mention: mention ? { id: mention.id, name: mention.name, avatar: mention.avatar } : undefined,
      })
      mentionIndex += 1
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < content.length) {
    segments.push({ type: 'text', value: content.slice(lastIndex) })
  }
  return segments
}
