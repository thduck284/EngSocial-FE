/**
 * Khóa i18n (prefix `quests.`) cho tiêu đề / mô tả quest chu kỳ theo category.
 * Copy hiển thị do FE xử lý; không sinh ở backend.
 */
export const PERIODIC_QUEST_TITLE_KEY_BY_CATEGORY = {
  all: 'periodicTitle.all',
  lesson: 'periodicTitle.lesson',
  practice: 'periodicTitle.practice',
  friends: 'periodicTitle.friends',
  vocabulary_notes: 'periodicTitle.vocabulary_notes',
  community_post: 'periodicTitle.community_post',
  login_streak: 'periodicTitle.login_streak',
  online_time: 'periodicTitle.online_time',
}

export const PERIODIC_QUEST_DESC_KEY_BY_CATEGORY = {
  all: 'periodicDesc.all',
  lesson: 'periodicDesc.lesson',
  practice: 'periodicDesc.practice',
  friends: 'periodicDesc.friends',
  vocabulary_notes: 'periodicDesc.vocabulary_notes',
  community_post: 'periodicDesc.community_post',
  login_streak: 'periodicDesc.login_streak',
  online_time: 'periodicDesc.online_time',
}

/** Khóa `quests.periodicSkillShort.*` cho hậu tố kỹ năng trong title */
export const PERIODIC_QUEST_SKILL_SHORT_KEY = {
  reading: 'periodicSkillShort.reading',
  listening: 'periodicSkillShort.listening',
  writing: 'periodicSkillShort.writing',
}
