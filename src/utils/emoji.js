import { MESSAGE_EMOJI_LIST, MESSAGE_EMOJI_CATEGORY_RANGES } from '../constants/emoji'

let _cachedList = null
let _cachedCategories = null

/**
 * Load and return the flat list of emojis for the message input picker.
 * @returns {string[]}
 */
export function getMessageEmojiList() {
  if (_cachedList === null) _cachedList = MESSAGE_EMOJI_LIST
  return _cachedList
}

/**
 * Load and return emoji grouped by category (phân mục) for the picker.
 * @returns {{ id: string, label: string, emojis: string[] }[]}
 */
export function getMessageEmojiCategories() {
  if (_cachedCategories === null) {
    const list = MESSAGE_EMOJI_LIST
    _cachedCategories = MESSAGE_EMOJI_CATEGORY_RANGES.map(({ id, label, start, end }) => ({
      id,
      label,
      emojis: list.slice(start, end ?? list.length),
    }))
  }
  return _cachedCategories
}
