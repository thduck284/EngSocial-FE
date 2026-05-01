import { ROUTES } from './api'

/** Danh sách game Giải trí — slug khớp route con `skills/entertainment/:slug` */
export const ENTERTAINMENT_GAMES = [
  {
    slug: 'word-scramble',
    path: ROUTES.SKILLS.ENTERTAINMENT_WORD_SCRAMBLE,
    icon: 'shuffle',
    image: '/logo-word-scramble.jpg',
    titleKey: 'enter.game.title',
    descKey: 'enter.game.listDesc',
  },
  {
    slug: 'snake-word',
    path: ROUTES.SKILLS.ENTERTAINMENT_SNAKE_WORD,
    icon: 'pest_control',
    image: '/logo-snake-word.jpg',
    titleKey: 'enter.game.snakeTitle',
    descKey: 'enter.game.snakeDesc',
  },
]
