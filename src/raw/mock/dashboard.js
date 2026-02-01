import { ROUTES } from '../constants'

// Mock: User skill stats for dashboard
export const mockSkillStats = [
  { icon: 'menu_book', label: 'skills.reading', value: '45m', change: '+10%', changeColor: 'text-green-500', to: ROUTES.SKILLS.READING },
  { icon: 'headset', label: 'skills.listening', value: '1h 20m', change: '-5%', changeColor: 'text-red-500', to: ROUTES.SKILLS.LISTENING },
  { icon: 'edit_note', label: 'skills.writing', value: '30m', change: '+20%', changeColor: 'text-green-500', to: ROUTES.SKILLS.WRITING },
]

// Mock: Featured lessons
export const mockFeaturedLessons = [
  { title: 'Đọc hiểu: Sustainable Cities', icon: 'menu_book', skill: 'Reading', level: 'INTERMEDIATE', to: ROUTES.SKILLS.READING, learners: '1.8K' },
  { title: 'Podcast: Global Tech Trends', icon: 'headset', skill: 'Listening', level: 'INTERMEDIATE', to: ROUTES.SKILLS.LISTENING, learners: '2.1K' },
  { title: '10 Idioms cho công sở', icon: 'edit_note', skill: 'Writing', level: 'INTERMEDIATE', to: ROUTES.SKILLS.WRITING, learners: '1.2K' },
]

// Mock: User daily goals
export const mockGoals = [
  { done: true, label: 'Hoàn thành 2 bài học' },
  { done: true, label: 'Đọc 1 bài báo tiếng Anh' },
  { done: false, label: 'Viết 100 từ đoạn văn' },
]

// Mock: Suggested groups
export const mockSuggestedGroups = [
  { icon: 'translate', title: 'IELTS Speaking Practice', members: '12.4K thành viên', color: 'bg-indigo-500' },
  { icon: 'movie', title: 'Học Tiếng Anh Qua Phim', members: '8.2K thành viên', color: 'bg-emerald-500' },
]

// Mock: Leaderboard users
export const mockLeaderboard = [
  { rank: 1, name: 'Minh Anh', xp: 2450, highlight: true },
  { rank: 2, name: 'David H.', xp: 2280, highlight: false },
  { rank: 3, name: 'Sophie C.', xp: 2100, highlight: false },
]

// Mock: Friend suggestions
export const mockFriendSuggestions = [
  {
    name: 'Alex Thompson',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoXGEnJoxgQxywYi4WPAOtB40WXq8kh7fTyMwuGC7gYFcPp-B8qbQSmv6GuXs2p8IxvtC370Z0WAKCeDg2V1nGjZ4wz1c_QdyvecDrnCWfENaMpRxjidsw1gwYH__A52WrC_AT7egrH4lVh_cHhbYZpfQRVyPrvHFJ9vanYhKSpeBxJjI7eQOOUdkJ7er9keiH4rNw6O2KKUJ6m2y3YWtHLNhxep-iokctHHSC339RpsrOn73tZt4vy40SleGpbtqCGFhiwfZJtg2G',
    mutualFriends: 8,
  },
]

// Mock: Current user profile
export const mockUserProfile = {
  name: 'John Doe',
  level: 15,
  xp: 350,
  xpMax: 500,
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAGuekdnsUYQCD94kbmMXxQJIDdIL4jHmobUmicR2MrPfQNMNAHt1kh0f2sg8KDXoj-4wFBbRYsgI1WbW-etIl-yQvA0npLHwU5-psosYe42Zf-u1nGm-4eK0pVqMXYmEKVC8MhkwXthJnRKaH-EoBfm3gWmvne6dTEuU1S70MJ3sO7Fsyqh9kAGMKeVDiBHjwq2urcm0BHfZTetlVH9UGz2bsuj_XT1DHSQgFMLJJ94QzJVdWWfZbxDIB4c8jvKQC7eoFNDQB5RHl',
}
