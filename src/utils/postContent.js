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
  return matches.map((m) => m.slice(1).trim()).filter(Boolean)
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
  const names = extractMentionNames(content)
  if (!names.length || !Array.isArray(friendsList)) return []
  const byName = new Map()
  friendsList.forEach((f) => {
    if (f?.name && f?.id) byName.set(f.name.trim().toLowerCase(), f.id)
  })
  const ids = []
  names.forEach((name) => {
    const id = byName.get(name.toLowerCase())
    if (id) ids.push(id)
  })
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
