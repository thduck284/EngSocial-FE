import { CUSTOM_TOPIC_ID } from './getVocabularyTopic'

/** @param {string | null | undefined} deck */
export function isAllDecks(deck) {
  return deck == null || deck === '' || deck === 'all'
}

/**
 * @param {string} topicId
 * @param {string} mode flashcard | learn | test | match | data
 * @param {string | null | undefined} deck
 */
export function vocabPracticePath(topicId, mode, deck) {
  const base = `/topic/${topicId}/${mode}`
  if (topicId !== CUSTOM_TOPIC_ID || isAllDecks(deck)) return base
  return `${base}?deck=${encodeURIComponent(deck)}`
}

/**
 * Trang tổng (TopicDetail) hoặc quay lại từ flashcard/learn/...
 * @param {string} topicId
 * @param {string | null | undefined} deck
 */
export function vocabTopicDetailPath(topicId, deck) {
  if (topicId !== CUSTOM_TOPIC_ID) return `/topic/${topicId}`
  if (isAllDecks(deck)) return '/topic/custom'
  return `/topic/custom?deck=${encodeURIComponent(deck)}`
}
