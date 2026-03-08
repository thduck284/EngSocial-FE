/** Level sort order (A1 → C2) */
export const LEVEL_ORDER = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 }

/** Skill sort order (reading → listening → writing) */
export const SKILL_ORDER = { reading: 1, listening: 2, writing: 3 }

/** Tailwind classes for level badges */
export const LEVEL_COLORS = {
  A1: 'bg-green-500/10 text-green-500',
  A2: 'bg-green-500/10 text-green-500',
  B1: 'bg-blue-500/10 text-blue-500',
  B2: 'bg-orange-500/10 text-orange-500',
  C1: 'bg-red-500/10 text-red-500',
  C2: 'bg-red-500/10 text-red-500',
}

/** Topic filter options for lessons (key + i18n label key) */
export const TOPIC_OPTIONS = [
  { key: 'all', label: 'lessons.topicsAll' },
  { key: 'Science', label: 'lessons.topicScience' },
  { key: 'Business', label: 'lessons.topicBusiness' },
  { key: 'Culture', label: 'lessons.topicCulture' },
  { key: 'Life', label: 'lessons.topicLife' },
  { key: 'Technology', label: 'lessons.topicTechnology' },
  { key: 'News', label: 'lessons.topicNews' },
  { key: 'Travel', label: 'lessons.topicTravel' },
  { key: 'Education', label: 'lessons.topicEducation' },
  { key: 'Academic', label: 'lessons.topicAcademic' },
]

/** Skill tabs for lessons page */
export const SKILL_TABS_LESSONS = [
  { key: 'all', icon: 'menu_book', label: 'skills.all' },
  { key: 'reading', icon: 'menu_book', label: 'skills.reading' },
  { key: 'listening', icon: 'headset', label: 'skills.listening' },
  { key: 'writing', icon: 'edit_note', label: 'skills.writing' },
]

/** Playback speed options for audio */
export const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5]
