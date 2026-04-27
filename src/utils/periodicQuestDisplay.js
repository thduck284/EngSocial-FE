import {
  PERIODIC_QUEST_TITLE_KEY_BY_CATEGORY,
  PERIODIC_QUEST_DESC_KEY_BY_CATEGORY,
  PERIODIC_QUEST_SKILL_SHORT_KEY,
} from '../constants/periodicQuestDisplay.js'

/**
 * Hậu tố kỹ năng trong title: " (Reading)" — chỉ khi skill khác all.
 * @param {string} skill
 * @param {import('i18next').TFunction} t
 */
export function periodicQuestSkillSuffix(skill, t) {
  if (!skill || skill === 'all') return ''
  const sub = PERIODIC_QUEST_SKILL_SHORT_KEY[skill]
  if (!sub) return ''
  const label = t(`quests.${sub}`)
  return t('quests.periodicSkillWrap', { label })
}

/**
 * Tiêu đề + mô tả hiển thị cho quest chu kỳ (API chỉ cần category, skill, target…).
 * @param {object} quest — item từ GET /quests/my/period (serializePeriodicQuestForClient)
 * @param {import('i18next').TFunction} t
 * @returns {{ title: string, description: string }}
 */
export function buildPeriodicQuestDisplay(quest, t) {
  const filters = quest.condition?.filters || {}
  const cat = typeof filters.category === 'string' ? filters.category : 'all'
  const skill = typeof filters.skill === 'string' ? filters.skill : 'all'
  const count = String(
    quest.userProgress?.effectiveTarget ?? quest.condition?.target ?? 1
  )
  const minScoreNum = Number(filters.minScorePercent ?? 0)
  const skillSuffix = periodicQuestSkillSuffix(skill, t)

  const titleSub =
    PERIODIC_QUEST_TITLE_KEY_BY_CATEGORY[cat] || PERIODIC_QUEST_TITLE_KEY_BY_CATEGORY.all
  const descSub =
    PERIODIC_QUEST_DESC_KEY_BY_CATEGORY[cat] || PERIODIC_QUEST_DESC_KEY_BY_CATEGORY.all

  let description = t(`quests.${descSub}`, { count })
  if (minScoreNum > 0 && (cat === 'lesson' || cat === 'all')) {
    description += t('quests.periodicDescScoreRequirement', {
      minScore: String(minScoreNum),
    })
  }

  return {
    title: t(`quests.${titleSub}`, { count, skill: skillSuffix }),
    description,
  }
}
