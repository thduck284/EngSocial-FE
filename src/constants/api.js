// API Base URL (backend default port 5000)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    PREFERENCES: '/auth/preferences',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },

  // User
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
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
    COMPLETE: (id) => `/lessons/${id}/complete`,
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
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/',
  SKILLS: {
    READING: '/skills/reading',
    LISTENING: '/skills/listening',
    WRITING: '/skills/writing',
  },
  ENTER: '/enter',
  LESSONS: '/lessons',
  LESSON: {
    LISTENING: (id) => `/lesson/listening/${id}`,
  },
  COMMUNITY: '/community',
  GROUPS: '/groups',
  PROFILE: '/profile',
  FRIENDS: '/friends',
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
