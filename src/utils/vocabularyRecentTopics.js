import { VOCAB_TOPIC_METAS } from '../constants/vocabTopicMetas'
import { CUSTOM_TOPIC_ID } from './getVocabularyTopic'
import { vocabularyService } from '../services/vocabulary.service'

const STORAGE_KEY = 'engsocial_vocab_recent_topics'
const MAX_ITEMS = 12

/** @typedef {{ topicId: string, practiceMode: string, deck: string | null, visitedAt: string | number }} VocabRecentEntry */

const listeners = new Set()

export function subscribeVocabRecent(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notifyVocabRecent() {
  listeners.forEach((fn) => {
    try {
      fn()
    } catch {
      /* ignore */
    }
  })
}

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json)
    return Array.isArray(v) ? v : fallback
  } catch {
    return fallback
  }
}

function getAuthToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
}

const MAX_TOPIC_NUM = VOCAB_TOPIC_METAS.length

function itemKey(entry) {
  if (entry.topicId === CUSTOM_TOPIC_ID) {
    const d = (entry.deck || '').trim()
    return `custom:${d || 'all'}`
  }
  return String(entry.topicId)
}

function normalizeFromStorageRow(x) {
  if (x == null) return null
  if (typeof x === 'string') {
    const id = x.trim()
    if (!/^\d+$/.test(id)) return null
    const n = parseInt(id, 10)
    if (n < 1 || n > MAX_TOPIC_NUM) return null
    return {
      topicId: id,
      practiceMode: 'detail',
      deck: null,
      visitedAt: Date.now(),
    }
  }
  if (typeof x === 'object' && x.topicId != null) {
    const topicId = String(x.topicId).trim()
    const practiceMode = typeof x.practiceMode === 'string' ? x.practiceMode : 'detail'
    const deck = x.deck != null && x.deck !== '' ? String(x.deck).trim().slice(0, 120) : null
    const at = x.at ?? x.visitedAt ?? Date.now()
    return { topicId, practiceMode, deck, visitedAt: typeof at === 'string' ? at : Number(at) }
  }
  return null
}

/**
 * Đọc mảng gần đây từ localStorage (luôn dùng khi offline / chưa đăng nhập / fallback).
 * @returns {VocabRecentEntry[]}
 */
export function getRecentVocabEntriesLocal() {
  const prev = safeParse(localStorage.getItem(STORAGE_KEY), [])
  const normalized = prev.map(normalizeFromStorageRow).filter(Boolean)
  const seen = new Set()
  const deduped = []
  for (const row of normalized) {
    const k = itemKey(row)
    if (seen.has(k)) continue
    seen.add(k)
    deduped.push(row)
  }
  return deduped.slice(0, MAX_ITEMS)
}

function persistLocal(entries) {
  const serializable = entries.map((e) => ({
    topicId: e.topicId,
    practiceMode: e.practiceMode,
    deck: e.deck,
    at: e.visitedAt,
  }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
}

/**
 * Ghi nhận truy cập / luyện tập. Preset: topicId "1"…"N". Custom: topicId "custom" + deck (hoặc null = tất cả).
 * @param {string} topicId
 * @param {'detail'|'flashcard'|'learn'|'test'|'match'|'data'} practiceMode
 * @param {string|null|undefined} deck — chỉ dùng với custom
 */
export function recordVocabTopicActivity(topicId, practiceMode = 'detail', deck = null) {
  const tid = String(topicId || '').trim()
  const mode = typeof practiceMode === 'string' ? practiceMode : 'detail'
  const allowed = ['detail', 'flashcard', 'learn', 'test', 'match', 'data']
  if (!allowed.includes(mode)) return

  let deckNorm = null
  if (tid === CUSTOM_TOPIC_ID) {
    if (deck != null && deck !== '' && deck !== 'all') {
      deckNorm = String(deck).trim().slice(0, 120) || null
    }
  }

  if (tid === CUSTOM_TOPIC_ID) {
    /* ok */
  } else if (!/^\d+$/.test(tid)) {
    return
  } else {
    const n = parseInt(tid, 10)
    if (n < 1 || n > MAX_TOPIC_NUM) return
  }

  const entry = {
    topicId: tid,
    practiceMode: mode,
    deck: tid === CUSTOM_TOPIC_ID ? deckNorm : null,
    visitedAt: Date.now(),
  }

  const prev = getRecentVocabEntriesLocal()
  const k = itemKey(entry)
  const rest = prev.filter((x) => itemKey(x) !== k)
  const next = [entry, ...rest].slice(0, MAX_ITEMS)
  persistLocal(next)
  notifyVocabRecent()

  if (getAuthToken()) {
    vocabularyService
      .recordRecent({
        topicId: entry.topicId,
        practiceMode: entry.practiceMode,
        deck: entry.deck,
      })
      .then((res) => {
        if (res?.success) notifyVocabRecent()
      })
      .catch(() => {
        /* vẫn giữ local */
      })
  }
}

/** @deprecated dùng recordVocabTopicActivity(topicId, 'detail') */
export function recordVocabTopicVisit(topicId) {
  recordVocabTopicActivity(topicId, 'detail', null)
}

/** @returns {string[]} chỉ id preset (tương thích cũ) */
export function getRecentVocabTopicIds() {
  return getRecentVocabEntriesLocal()
    .map((e) => e.topicId)
    .filter((id) => id !== CUSTOM_TOPIC_ID && /^\d+$/.test(id))
}
