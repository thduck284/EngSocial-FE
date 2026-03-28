import { normalizeWordTypeId } from '../constants/vocabWordTypes'

const NOTES_KEY = 'engsocial_vocab_notes'
const WORDS_KEY = 'engsocial_vocab_custom_words'

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json)
    return Array.isArray(v) ? v : fallback
  } catch {
    return fallback
  }
}

export function getVocabNotes() {
  return safeParse(localStorage.getItem(NOTES_KEY), [])
}

export function saveVocabNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
}

export function addVocabNote({ title, content }) {
  const notes = getVocabNotes()
  const id = `n-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const item = {
    id,
    title: (title || '').trim(),
    content: (content || '').trim(),
    createdAt: Date.now(),
  }
  notes.unshift(item)
  saveVocabNotes(notes)
  return item
}

export function deleteVocabNote(id) {
  const notes = getVocabNotes().filter((n) => n.id !== id)
  saveVocabNotes(notes)
}

export function getCustomVocabWords() {
  const raw = safeParse(localStorage.getItem(WORDS_KEY), [])
  return raw.map((w) => ({
    ...w,
    deck: (w.deck != null ? String(w.deck) : '').trim(),
    wordType: normalizeWordTypeId(w.wordType),
    example: w.example != null ? String(w.example).trim() : '',
  }))
}

export function saveCustomVocabWords(words) {
  localStorage.setItem(WORDS_KEY, JSON.stringify(words))
}

export function addCustomVocabWord({ word, meaning, pronunciation, deck, wordType, example }) {
  const words = getCustomVocabWords()
  const maxId = words.reduce((m, w) => (typeof w.id === 'number' && w.id > m ? w.id : m), 0)
  const item = {
    id: maxId + 1,
    word: (word || '').trim(),
    meaning: (meaning || '').trim(),
    pronunciation: (pronunciation || '').trim() || '—',
    deck: (deck || '').trim(),
    wordType: normalizeWordTypeId(wordType),
    example: (example || '').trim(),
  }
  words.push(item)
  saveCustomVocabWords(words)
  return item
}

/** Danh sách chủ đề (deck) duy nhất, có ít nhất một từ */
export function getCustomDeckNames() {
  const words = getCustomVocabWords()
  const set = new Set()
  for (const w of words) {
    const d = (w.deck || '').trim()
    if (d) set.add(d)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'vi'))
}

export function deleteCustomVocabWord(id) {
  const words = getCustomVocabWords().filter((w) => w.id !== id)
  saveCustomVocabWords(words)
}
