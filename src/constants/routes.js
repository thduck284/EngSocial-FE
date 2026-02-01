// Application Routes
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Dashboard
  DASHBOARD: '/',

  // Skills
  SKILLS: {
    READING: '/skills/reading',
    LISTENING: '/skills/listening',
    WRITING: '/skills/writing',
  },

  // Entertainment
  ENTER: '/enter',

  // Lessons
  LESSONS: '/lessons',
  LESSON: {
    LISTENING: (id) => `/lesson/listening/${id}`,
  },

  // Community
  COMMUNITY: '/community',

  // Groups
  GROUPS: '/groups',

  // Profile
  PROFILE: '/profile',

  // Friends
  FRIENDS: '/friends',

  // Notifications
  NOTIFICATIONS: '/notifications',
}

// Navigation items (for AppHeader)
export const NAV_ITEMS = [
  { to: ROUTES.HOME, label: 'header.home' },
  { to: ROUTES.SKILLS.READING, label: 'header.skills' },
  { to: ROUTES.LESSONS, label: 'header.lessons' },
  { to: ROUTES.COMMUNITY, label: 'header.community' },
  { to: ROUTES.GROUPS, label: 'header.groups' },
]
