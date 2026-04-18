import { ROUTES } from './api'

/** @param {string|number} userId */
export function getStaffNavCore(userId) {
  return [
    {
      to: ROUTES.MANAGE_LESSONS(userId),
      end: false,
      icon: 'menu_book',
      labelKey: 'staffDashboard.navLessons',
      descKey: 'staffDashboard.cardLessonsDesc',
      adminOnly: false,
    },
    {
      to: ROUTES.MANAGE_SKILLS(userId),
      end: false,
      icon: 'fitness_center',
      labelKey: 'staffDashboard.navPractice',
      descKey: 'staffDashboard.cardPracticeDesc',
      adminOnly: false,
    },
    {
      to: ROUTES.MANAGE_MOCK_TESTS(userId),
      end: false,
      icon: 'quiz',
      labelKey: 'staffDashboard.navMockTest',
      descKey: 'staffDashboard.cardMockTestDesc',
      adminOnly: false,
    },
  ]
}

/** @param {string|number} userId */
export function getStaffNavEntertainment(userId) {
  return {
    labelKey: 'staffDashboard.navEntertainment',
    icon: 'sports_esports',
    hubTo: ROUTES.MANAGE_ENTERTAINMENT(userId),
    descKey: 'staffDashboard.cardEntertainmentDesc',
    children: [
      {
        to: ROUTES.MANAGE_WORD_SCRAMBLE(userId),
        end: true,
        icon: 'sort_by_alpha',
        labelKey: 'staffDashboard.navWordScramble',
        descKey: 'staffDashboard.cardWordScrambleDesc',
        adminOnly: false,
      },
    ],
  }
}

/** @param {string|number} userId */
export function getStaffNavGamification(userId) {
  return [
    {
      to: ROUTES.MANAGE_QUESTS(userId),
      end: false,
      icon: 'flag',
      labelKey: 'staffDashboard.navQuests',
      descKey: 'staffDashboard.cardQuestsDesc',
      adminOnly: false,
    },
    {
      to: ROUTES.MANAGE_CHALLENGES(userId),
      end: false,
      icon: 'emoji_events',
      labelKey: 'staffDashboard.navChallenges',
      descKey: 'staffDashboard.cardChallengesDesc',
      adminOnly: false,
    },
  ]
}

/** @param {string|number} userId */
export function getStaffNavAchievements(userId) {
  return {
    to: ROUTES.MANAGE_ACHIEVEMENTS(userId),
    end: true,
    icon: 'military_tech',
    labelKey: 'staffDashboard.navAchievements',
    descKey: 'staffDashboard.cardAchievementsDesc',
    adminOnly: false,
  }
}

/** @deprecated Dùng getStaffNavGamification */
export const STAFF_NAV_ADMIN_GAMIFICATION = []

/**
 * Thẻ trên trang chủ mod — Entertainment (hub); quest/challenge/achievement riêng.
 * @param {boolean} isAdmin
 * @param {string|number} userId
 */
export function getStaffHomeCards(isAdmin, userId) {
  const entertainment = getStaffNavEntertainment(userId)
  const cards = [
    ...getStaffNavCore(userId).filter((c) => !c.adminOnly || isAdmin),
    {
      to: ROUTES.MANAGE_ENTERTAINMENT(userId),
      end: true,
      icon: entertainment.icon,
      labelKey: entertainment.labelKey,
      descKey: entertainment.descKey,
      adminOnly: false,
    },
    ...getStaffNavGamification(userId).filter((c) => !c.adminOnly || isAdmin),
    getStaffNavAchievements(userId),
  ]
  return cards.filter((c) => !c.adminOnly || isAdmin)
}

/** @param {string|number} userId */
export function getStaffPortalSections(userId) {
  const ent = getStaffNavEntertainment(userId)
  return [...getStaffNavCore(userId), ...ent.children, ...getStaffNavGamification(userId), getStaffNavAchievements(userId)]
}

/** @deprecated Dùng getStaffPortalSections(userId) */
export const STAFF_PORTAL_SECTIONS = []
