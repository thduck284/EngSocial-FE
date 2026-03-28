import { vocabularyData } from '@vocabulary'
import { normalizeWordTypeId } from '../constants/vocabWordTypes'
import { getCustomVocabWords } from './vocabularyUserStorage'

export const CUSTOM_TOPIC_ID = 'custom'

function deckIsAll(deck) {
  return deck == null || deck === '' || deck === 'all'
}

/**
 * @param {string} topicId - numeric key từ @vocabulary (1…16) hoặc "custom"
 * @param {string | null | undefined} deckFilter - lọc chủ đề từ user (query deck), null/all = tất cả
 * @returns {{ topicName: string, words: Array } | null}
 */
export function getVocabularyTopic(topicId, deckFilter = null) {
  if (topicId === CUSTOM_TOPIC_ID) {
    let words = getCustomVocabWords()
    if (!deckIsAll(deckFilter)) {
      const d = String(deckFilter).trim()
      words = words.filter((w) => (w.deck || '').trim() === d)
    }
    const label = deckIsAll(deckFilter)
      ? 'Từ của tôi'
      : `Từ của tôi — ${String(deckFilter).trim()}`
    return {
      topicName: label,
      words,
    }
  }
  const t = vocabularyData[topicId]
  if (!t) return null
  return {
    ...t,
    words: t.words.map((w) => ({
      ...w,
      wordType: normalizeWordTypeId(w.wordType),
    })),
  }
}
