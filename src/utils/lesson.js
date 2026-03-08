import { LEVEL_ORDER, SKILL_ORDER } from '../constants/lessons'

/**
 * Get lesson detail URL by skill
 */
export function getLessonLink(lesson) {
  if (lesson.skill === 'reading') return `/lesson/reading/${lesson.id}`
  if (lesson.skill === 'listening') return `/lesson/listening/${lesson.id}`
  if (lesson.skill === 'writing') return `/lesson/writing/${lesson.id}`
  return '/lessons'
}

/**
 * Sort lessons by level then skill (for list display)
 */
export function sortLessonsByLevelThenSkill(lessons) {
  return [...(lessons || [])].sort((a, b) => {
    const levelDiff = (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99)
    if (levelDiff !== 0) return levelDiff
    return (SKILL_ORDER[a.skill] ?? 99) - (SKILL_ORDER[b.skill] ?? 99)
  })
}
