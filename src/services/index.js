// Auth
export { authService, submitRegisterForm, submitLoginForm, submitSocialLogin } from './auth.service.js'
export {
  validateRegisterForm,
  validateLoginForm,
  validateFullName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateLoginPassword,
  validateAgreeTerms,
  REGISTER_VALIDATION,
} from '../validators/index.js'

// User
export { userService } from './user.service.js'

// Conversations (chat)
export { conversationService } from './conversation.service.js'

// Giphy (for message GIF picker)
export { searchGiphy, hasGiphyKey } from './giphy.service.js'

// Friends
export { friendsService } from './friends.service.js'

// Practices
export { practicesService } from './practices.service.js'
export { mockTestService } from './mockTest.service.js'

// Raw (mock data từ BE)
export { rawService } from './raw.service.js'

// Quests
export { questsService } from './quests.service.js'

// Lessons
export { lessonsService } from './lessons.service.js'

// Vocabulary (recent visits — server)
export { vocabularyService } from './vocabulary.service.js'
export { wordScrambleService } from './wordScramble.service.js'

// Upload
export { uploadService } from './upload.service.js'

// Skills
export { skillsService } from './skills.service.js'

// Community
export { communityService } from './community.service.js'

// Notifications
export { notificationsService } from './notifications.service.js'

// Challenges
export { challengesService } from './challenges.service.js'

// Leaderboard
export { leaderboardService } from './leaderboard.service.js'

// Chatbot
export { chatbotService } from './chatbot.service.js'

// Groups
export { groupService } from './group.service.js'
