import { ROUTES } from './api'

/** Danh sách game Giải trí — slug khớp route con `skills/entertainment/:slug` */
export const ENTERTAINMENT_GAMES = [
  {
    slug: 'word-scramble',
    path: ROUTES.SKILLS.ENTERTAINMENT_WORD_SCRAMBLE,
    icon: 'shuffle',
    titleKey: 'enter.game.title',
    descKey: 'enter.game.listDesc',
  },
]
