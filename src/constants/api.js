const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const LOCAL_API = import.meta.env.VITE_API_LOCAL_URL
const RENDER_API = import.meta.env.VITE_API_RENDER_URL

const ensureApi = (url) => (url || '').replace(/\/api\/?$/, '') + '/api'
const stripApi = (url) => (url || '').replace(/\/api\/?$/, '')

export const API_BASE_URL = ensureApi(isLocalhost ? LOCAL_API : RENDER_API)
export const API_FALLBACK_BASE_URL = isLocalhost ? ensureApi(RENDER_API) : null

export const SOCKET_BASE_URL = stripApi(isLocalhost ? LOCAL_API : RENDER_API)
export const SOCKET_FALLBACK_BASE_URL = isLocalhost ? stripApi(RENDER_API) : null

// AI Matchmaking URL
export const API_AI_MATCHING_URL = import.meta.env.VITE_API_AI_MATCHING_URL

// Socket.IO works with Render (long-lived server). Only disabled when no backend or serverless.
export const SOCKET_ENABLED = typeof window !== 'undefined'

// Admin app URL: dùng cho nút "Thêm bài học" / "Thêm bài tập" (moderator/admin)
export const ADMIN_APP_URL = import.meta.env.VITE_ADMIN_APP_URL

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    SOCIAL_GOOGLE: '/auth/social/google',
    SOCIAL_FACEBOOK: '/auth/social/facebook',
    ME: '/auth/me',
    PREFERENCES: '/auth/preferences',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },

  // User
  USER: {
    PROFILE: '/user/profile',
    PROFILE_BY_ID: (userId) => `/user/profile/${userId}`,
    UPDATE_PROFILE: '/user/profile',
    UPLOAD_AVATAR: '/user/avatar',
    CHANGE_PASSWORD: '/user/change-password',
    STATS: '/user/stats',
    SKILLS_PROFILE: '/user/skills-profile',
    GOALS: '/user/goals',
    ACHIEVEMENTS: '/user/achievements',
    BLOCK: (userId) => `/user/block/${userId}`,
    UNBLOCK: (userId) => `/user/block/${userId}`,
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
    MY_PROGRESS: '/lessons/my-progress',
    DETAIL: (id) => `/lessons/${id}`,
    PROGRESS: (id) => `/lessons/${id}/progress`,
    NOTES: (id) => `/lessons/${id}/notes`,
    SUBMIT: (id) => `/lessons/${id}/submit`,
    SUBMIT_WRITING: (id) => `/lessons/${id}/submit-writing`,
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

  /** Từ vựng: lịch sử truy cập / hình thức luyện (MongoDB, cần đăng nhập) */
  VOCABULARY: {
    RECENT: '/vocabulary/recent',
    RECORD_RECENT: '/vocabulary/recent',
  },

  /** Word Scramble — từ vựng game (next công khai; CRUD moderator/admin) */
  WORD_SCRAMBLE: {
    NEXT: '/word-scramble/next',
    WORDS: '/word-scramble/words',
    WORDS_ALL: '/word-scramble/words/all',
    WORDS_IMPORT_TSV: '/word-scramble/words/import-tsv',
    WORD: (id) => `/word-scramble/words/${id}`,
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
    POST_DOCUMENT_DOWNLOAD: (postId, index) => `/community/posts/${postId}/documents/${index}/download`,
    CREATE_POST: '/community/posts',
    UPDATE_POST: (id) => `/community/posts/${id}`,
    DELETE_POST: (id) => `/community/posts/${id}`,
    LIKE_POST: (id) => `/community/posts/${id}/like`,
    REACTION_POST: (id) => `/community/posts/${id}/reaction`,
    POST_REACTIONS: (id) => `/community/posts/${id}/reactions`,
    COMMENT_POST: (id) => `/community/posts/${id}/comments`,
  },

  // Conversations (chat)
  CONVERSATIONS: {
    LIST: '/conversations',
    FOR_FORWARD: '/conversations/for-forward',
    UNREAD_TOTAL: '/conversations/unread-total',
    GET_OR_CREATE_WITH: (userId) => `/conversations/with?with=${encodeURIComponent(userId)}`,
    MESSAGES: (conversationId) => `/conversations/${conversationId}/messages`,
    SEND_MESSAGE: (conversationId) => `/conversations/${conversationId}/messages`,
    UPDATE_MESSAGE: (conversationId, messageId) => `/conversations/${conversationId}/messages/${messageId}`,
    REACTION: (conversationId, messageId) => `/conversations/${conversationId}/messages/${messageId}/reaction`,
    DELETE_MESSAGE: (conversationId, messageId) => `/conversations/${conversationId}/messages/${messageId}`,
    DELETE_ALL_MESSAGES: (conversationId) => `/conversations/${conversationId}/messages/delete-all`,
    MARK_READ: (conversationId) => `/conversations/${conversationId}/read`,
    SETTINGS: (conversationId) => `/conversations/${conversationId}/settings`,
    GROUP_SETTINGS: (conversationId) => `/conversations/${conversationId}/group-settings`,
    ADD_MEMBERS: (conversationId) => `/conversations/${conversationId}/members`,
    SET_MEMBER_ROLE: (conversationId, userId) => `/conversations/${conversationId}/members/${userId}/role`,
    DISBAND: (conversationId) => `/conversations/${conversationId}/disband`,
    LEAVE: (conversationId) => `/conversations/${conversationId}/leave`,
    BLOCK_USER: (conversationId) => `/conversations/${conversationId}/block`,
    UNBLOCK_USER: (conversationId, userId) => `/conversations/${conversationId}/block/${userId}`,
    ATTACHMENT_DOWNLOAD: '/conversations/attachment-download',
  },

  // Friends
  FRIENDS: {
    LIST: '/friends',
    SEARCH: '/friends/search',
    SUGGESTIONS: '/friends/suggestions',
    PENDING_REQUESTS: '/friends/requests/pending',
    SENT_REQUESTS: '/friends/requests/sent',
    REQUEST: (userId) => `/friends/request/${userId}`,
    REQUEST_DELETE: (friendshipId) => `/friends/request/${friendshipId}`,
    REQUEST_ACCEPT: (friendshipId) => `/friends/request/${friendshipId}/accept`,
    ADD: (userId) => `/friends/${userId}/add`,
    REMOVE: (userId) => `/friends/${userId}`,
    ACCEPT: (userId) => `/friends/${userId}/accept`,
    REJECT: (userId) => `/friends/${userId}/reject`,
  },

  // Groups
  GROUPS: {
    LIST: '/groups',
    MY_GROUPS: '/groups/me',
    DETAIL: (id) => `/groups/${id}`,
    CREATE: '/groups',
    JOIN: (id) => `/groups/${id}/join`,
    LEAVE: (id) => `/groups/${id}/leave`,
    MEMBERS: (id) => `/groups/${id}/members`,
    ADD_MEMBERS: (id) => `/groups/${id}/members`,
    REMOVE_MEMBER: (groupId, userId) => `/groups/${groupId}/members/${userId}`,
    JOIN_REQUESTS: (id) => `/groups/${id}/join-requests`,
    APPROVE_JOIN_REQUEST: (groupId, userId) => `/groups/${groupId}/join-requests/${userId}/approve`,
    REJECT_JOIN_REQUEST: (groupId, userId) => `/groups/${groupId}/join-requests/${userId}/reject`,
    MY_MEMBERSHIP: (id) => `/groups/${id}/my-membership`,
    INVITE_ACCEPT: (id) => `/groups/${id}/invite/accept`,
    INVITE_DECLINE: (id) => `/groups/${id}/invite/decline`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
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

  // Leaderboard (backend: GET /api/leaderboard?type=weekly|monthly|all_time)
  LEADERBOARD: {
    BASE: '/leaderboard',
    WEEKLY: '/leaderboard?type=weekly',
    MONTHLY: '/leaderboard?type=monthly',
    ALL_TIME: '/leaderboard?type=all_time',
  },
}

export const buildApiUrl = (endpoint, baseUrl = API_BASE_URL) => {
  return `${baseUrl}${endpoint}`
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
    /** Giải trí — danh sách game */
    ENTERTAINMENT: '/skills/entertainment',
    /** Xáo chữ từ vựng */
    ENTERTAINMENT_WORD_SCRAMBLE: '/skills/entertainment/word-scramble',
  },
  /** @deprecated Dùng ROUTES.SKILLS.ENTERTAINMENT */
  ENTER: '/skills/entertainment',
  LESSONS: '/lessons',
  LESSON: '/lesson',
  LESSON_HISTORY: '/lesson/history',
  LESSON_READING_RESULT: (id) => `/lesson/reading/${id}/result`,
  PRACTICE: '/practice',
  QUESTS: '/quests',
  ACHIEVEMENTS: '/achievements',
  LESSON_DETAIL: {
    LISTENING: (id) => `/lesson/listening/${id}`,
    READING: (id) => `/lesson/reading/${id}`,
    WRITING: (id) => `/lesson/writing/${id}`,
  },
  COMMUNITY: '/community/my-groups',
  /** Trang « Từ & ghi chú » / Words & notes */
  WORDS_NOTES: '/words-notes',
  /** @deprecated Dùng WORDS_NOTES; giữ alias để code cũ */
  FLASH_CARD: '/words-notes',
  GROUPS: '/groups',
  PROFILE: '/profile',
  PROFILE_USER: (userId) => `/profile/${userId}`,
  SEARCH: '/search',
  MESSAGES: '/messages',
  MESSAGES_CONVERSATION: (id) => `/messages/conversation/${id}`,
  FRIENDS: '/friends',
  NOTIFICATIONS: '/notifications',
  /**
   * Khu mod/staff: /mod/:userId/... (userId = tài khoản đang đăng nhập).
   * URL cũ /manage/* redirect về /mod/:id/* trong App.
   */
  MANAGE_ROOT: (userId) => `/mod/${encodeURIComponent(String(userId))}`,
  /** Trang tổng quan khu mod (dashboard thẻ chức năng) */
  MANAGE_OVERVIEW: (userId) => `/mod/${encodeURIComponent(String(userId))}/over-view`,
  MANAGE_LESSONS: (userId) => `/mod/${encodeURIComponent(String(userId))}/lessons`,
  MANAGE_SKILLS: (userId) => `/mod/${encodeURIComponent(String(userId))}/skills`,
  MANAGE_QUESTS: (userId) => `/mod/${encodeURIComponent(String(userId))}/quests`,
  MANAGE_CHALLENGES: (userId) => `/mod/${encodeURIComponent(String(userId))}/challenges`,
  MANAGE_WORD_SCRAMBLE: (userId) => `/mod/${encodeURIComponent(String(userId))}/word-scramble`,
  MANAGE_ENTERTAINMENT: (userId) => `/mod/${encodeURIComponent(String(userId))}/entertainment`,
  MANAGE_ACHIEVEMENTS: (userId) => `/mod/${encodeURIComponent(String(userId))}/achievements`,
}

/** Phần path sau /mod/:userId (vd. `/lessons`); null nếu không phải route mod */
export function modPathTail(pathname) {
  if (!pathname || !pathname.startsWith('/mod/')) return null
  const tail = pathname.replace(/^\/mod\/[^/]+/, '')
  return tail || '/'
}

// Navigation items (for AppHeader)
export const NAV_ITEMS = [
  { to: ROUTES.HOME, label: 'header.home' },
  { to: ROUTES.LESSON, label: 'header.lesson' },
  { to: ROUTES.PRACTICE, label: 'header.practice' },
  { to: ROUTES.WORDS_NOTES, label: 'header.flashCard' },
  { to: ROUTES.QUESTS, label: 'header.quests' },
  { to: ROUTES.ACHIEVEMENTS, label: 'header.achievements' },
  { to: ROUTES.COMMUNITY, label: 'header.community' },
]
