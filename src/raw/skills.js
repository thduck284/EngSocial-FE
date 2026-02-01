import { ROUTES } from '../constants'

// Skill definitions (shared across pages)
export const SKILLS = {
  reading: { icon: 'menu_book', label: 'skills.reading', color: 'text-blue-400' },
  listening: { icon: 'headset', label: 'skills.listening', color: 'text-orange-400' },
  writing: { icon: 'edit_note', label: 'skills.writing', color: 'text-emerald-400' },
}

// Skill tabs for navigation (shared across SkillPracticePage & EnterPage)
export const SKILL_TABS = [
  { to: ROUTES.SKILLS.READING, key: 'reading', icon: 'menu_book', label: 'skills.reading' },
  { to: ROUTES.SKILLS.LISTENING, key: 'listening', icon: 'headset', label: 'skills.listening' },
  { to: ROUTES.SKILLS.WRITING, key: 'writing', icon: 'edit_note', label: 'skills.writing' },
  { to: ROUTES.ENTER, key: 'enter', icon: 'sports_esports', label: 'skills.entertainment' },
]

// Skill stats for sidebar (shared)
export const SKILL_STATS_CONFIG = [
  { icon: 'menu_book', label: 'skills.reading', color: 'text-blue-400', key: 'reading' },
  { icon: 'headset', label: 'skills.listening', color: 'text-orange-400', key: 'listening' },
  { icon: 'edit_note', label: 'skills.writing', color: 'text-emerald-400', key: 'writing' },
]
