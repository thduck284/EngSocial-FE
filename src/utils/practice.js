import { LEVEL_COLORS } from '../constants/lessons'

/**
 * Map practice API object to card format for SkillPracticePage
 */
export function practiceToCard(p, skill) {
  const levelColor = LEVEL_COLORS[p.level] || 'bg-gray-600 text-gray-300'
  return {
    id: p.id,
    title: p.title,
    level: p.level,
    levelColor,
    desc: p.description,
    topic: p.topic,
    time: p.time,
    questions: p.questions || '',
    rating: String(p.rating || 0),
    img: p.thumbnail,
    accent: p.accent || '',
    accentClass: p.accent ? 'bg-primary/10 text-primary border-primary/20' : '',
    type: p.type || '',
    typeClass: p.type ? 'bg-primary/10 text-primary border-primary/20' : '',
    length: p.length || '',
  }
}
