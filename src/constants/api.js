// API Base URL: set VITE_API_BASE_URL khi deploy (Vercel/Railway); dev mặc định localhost
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Admin app URL: dùng cho nút "Thêm bài học" / "Thêm bài tập" (moderator/admin)
export const ADMIN_APP_URL = import.meta.env.VITE_ADMIN_APP_URL || 'http://localhost:4000'

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    ME: '/auth/me',
    PREFERENCES: '/auth/preferences',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },

  // User
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    UPLOAD_AVATAR: '/user/avatar',
    CHANGE_PASSWORD: '/user/change-password',
    STATS: '/user/stats',
    GOALS: '/user/goals',
    ACHIEVEMENTS: '/user/achievements',
  },

  // Skills
  SKILLS: {
    // Reading
    READING: {
      LIST: '/skills/reading',
      DETAIL: (id) => `/skills/reading/${id}`,
      SUBMIT: (id) => `/skills/reading/${id}/submit`,
    },
    // Listening
    LISTENING: {
      LIST: '/skills/listening',
      DETAIL: (id) => `/skills/listening/${id}`,
      SUBMIT: (id) => `/skills/listening/${id}/submit`,
    },
    // Writing
    WRITING: {
      LIST: '/skills/writing',
      DETAIL: (id) => `/skills/writing/${id}`,
      SUBMIT: (id) => `/skills/writing/${id}/submit`,
    },
  },

  // Lessons
  LESSONS: {
    LIST: '/lessons',
    DETAIL: (id) => `/lessons/${id}`,
    PROGRESS: (id) => `/lessons/${id}/progress`,
    NOTES: (id) => `/lessons/${id}/notes`,
    COMPLETE: (id) => `/lessons/${id}/complete`,
    READING_CONTENT: (id) => `/lessons/reading/${id}/content`,
    LISTENING_CONTENT: (id) => `/lessons/listening/${id}/content`,
    WRITING_CONTENT: (id) => `/lessons/writing/${id}/content`,
  },

  UPLOAD: {
    ASSET: '/upload/asset',
    POST_MEDIA: '/upload/post-media',
  },

  // Practices (Skill Practice - tách biệt với Lessons)
  PRACTICES: {
    LIST: '/practices',
    FALLBACK: '/practices/fallback',
  },

  // Quests
  QUESTS: {
    LIST: '/quests',
    DETAIL: (id) => `/quests/${id}`,
  },

  // Mock tạm (gọi từ lesson, practice, quest controller)
  RAW: {
    DASHBOARD: '/lessons/dashboard',
    GAMES: '/practices/games',
    FRIENDS: '/quests/friends',
    NOTIFICATIONS: '/quests/notifications',
    CHATBOT: '/quests/chatbot',
  },

  // Community
  COMMUNITY: {
    POSTS: '/community/posts',
    POST_DETAIL: (id) => `/community/posts/${id}`,
    CREATE_POST: '/community/posts',
    UPDATE_POST: (id) => `/community/posts/${id}`,
    DELETE_POST: (id) => `/community/posts/${id}`,
    LIKE_POST: (id) => `/community/posts/${id}/like`,
    COMMENT_POST: (id) => `/community/posts/${id}/comments`,
  },

  // Friends
  FRIENDS: {
    LIST: '/friends',
    SUGGESTIONS: '/friends/suggestions',
    ADD: (userId) => `/friends/${userId}/add`,
    REMOVE: (userId) => `/friends/${userId}/remove`,
    ACCEPT: (userId) => `/friends/${userId}/accept`,
    REJECT: (userId) => `/friends/${userId}/reject`,
  },

  // Groups
  GROUPS: {
    LIST: '/groups',
    DETAIL: (id) => `/groups/${id}`,
    CREATE: '/groups',
    JOIN: (id) => `/groups/${id}/join`,
    LEAVE: (id) => `/groups/${id}/leave`,
    MEMBERS: (id) => `/groups/${id}/members`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id) => `/notifications/${id}`,
  },

  // Challenges
  CHALLENGES: {
    LIST: '/challenges',
    DETAIL: (id) => `/challenges/${id}`,
    JOIN: (id) => `/challenges/${id}/join`,
    LEAVE: (id) => `/challenges/${id}/leave`,
    LEADERBOARD: (id) => `/challenges/${id}/leaderboard`,
  },

  // Games
  GAMES: {
    LIST: '/games',
    DETAIL: (id) => `/games/${id}`,
    START: (id) => `/games/${id}/start`,
    SUBMIT: (id) => `/games/${id}/submit`,
    LEADERBOARD: (id) => `/games/${id}/leaderboard`,
  },

  // Chatbot
  CHATBOT: {
    CONVERSATIONS: '/chatbot/conversations',
    MESSAGES: (conversationId) => `/chatbot/conversations/${conversationId}/messages`,
    SEND_MESSAGE: (conversationId) => `/chatbot/conversations/${conversationId}/messages`,
    CREATE_CONVERSATION: '/chatbot/conversations',
  },

  // Leaderboard
  LEADERBOARD: {
    WEEKLY: '/leaderboard/weekly',
    MONTHLY: '/leaderboard/monthly',
    ALL_TIME: '/leaderboard/all-time',
  },
}

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`
}

// Application Routes (frontend)
export const ROUTES = {
  HOME: '/home',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/home',
  SKILLS: {
    READING: '/skills/reading',
    LISTENING: '/skills/listening',
    WRITING: '/skills/writing',
  },
  ENTER: '/enter',
  LESSONS: '/lessons',
  QUESTS: '/quests',
  ACHIEVEMENTS: '/achievements',
  LESSON: {
    LISTENING: (id) => `/lesson/listening/${id}`,
    READING: (id) => `/lesson/reading/${id}`,
    WRITING: (id) => `/lesson/writing/${id}`,
  },
  COMMUNITY: '/community',
  GROUPS: '/groups',
  PROFILE: '/profile',
  PROFILE_USER: (userId) => `/profile/${userId}`,
  SEARCH: '/search',
  FRIENDS: '/friends',
  NOTIFICATIONS: '/notifications',
  MANAGE_LESSONS: '/manage/lessons',
  MANAGE_SKILLS: '/manage/skills',
  MANAGE_QUESTS: '/manage/quests',
}

// Navigation items (for AppHeader)
export const NAV_ITEMS = [
  { to: ROUTES.HOME, label: 'header.home' },
  { to: ROUTES.SKILLS.READING, label: 'header.skills' },
  { to: ROUTES.LESSONS, label: 'header.lessons' },
  { to: ROUTES.QUESTS, label: 'header.quests' },
  { to: ROUTES.ACHIEVEMENTS, label: 'header.achievements' },
  { to: ROUTES.COMMUNITY, label: 'header.community' },
  { to: ROUTES.GROUPS, label: 'header.groups' },
]
