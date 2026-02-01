import { ROUTES } from '../../constants'

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

// Mock: User daily goals (labelKey for i18n)
export const mockGoals = [
  { done: true, labelKey: 'profile.goalCompleteLessons' },
  { done: true, labelKey: 'profile.goalReadArticle' },
  { done: false, labelKey: 'profile.goalWritingWords' },
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

// Mock: Profile page - friends list (avatar, name, level, online)
export const mockProfileFriends = [
  { name: 'Alex Nguyen', level: 'Level 24', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTEBAZEPYNTJX9XyvgnsyvRKhqurA3HvvbvG74IITupd5tNrphCGWnCGjGYxRc7T5_a1WGCku1yZB0D-tYGdVCeECjUQaSRm8XZ36rtVVkju_SYohICy8aWlP_wNkBSmA6nltjaOZ1cmv2iAXbnP6L8kV8HMdBIUb0NxEztJ9sC7K8ckvpWBGMrGs-lZLP--e8ajjglgKe9cvtGh7WCX9qZ5hBdhE0YOat4FlaAD4rCVPAyYjCSNJlcwfsWNsXjvVGtseo922oZQ6F', online: true },
  { name: 'Sophie Tran', level: 'Level 18', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB00tx0u_3o2LUj0aIFZgksQ8bnwE1UAH2Ny4OMVSmhhwjdXRBCfVEmLVQ79t2tpyeugqZy_W6qdXTqCztjkEQkTMLMKgHw7p3JK7pcQ5Tph1Zj4CTxeRyHjEZrYc5myKInLjTlV2m4KO_5PV2oSzZETAa1_2RhUVAf9bJOQDamv-6PA0dD4irnX61Aa4GXT9sxJ5Q818mcbWtTk6UxukjZJO9QArX09P9nc42h8V8-5C4oMtEpJBhGa-jXaqiLBvMvoSoylcFRou__', online: true },
  { name: 'Minh Hoang', level: 'Level 30', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT4gXjcpFKt5tr-c5jnCJrVdP4L2KR_KH4Z92xb0P0ahycS813_ZYyiE7djTgJZf66E1qIoqaq1Q1wRKYP2T82pnT2TumNWT14kV4hWyE3YnVQvJzxlBSOQX8atoxVly95r7mP6zOruErV5kdkfv7s-YbKC_Anfmm6ukYqIXbyv-WsXJzZX6AGACeMOKgPgztbvwGAO0OzZ1ob84-M_I_1ihJGi4IQE8yiYjDM5dcxNvPv65Zxee_7vepBSPrv3r7UqhfMWAr0GoUp', online: true },
  { name: 'Elena Smith', level: 'Level 12', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDh1C9kYXz1wfsaSS02asKLBS05amrGBKcsn9uRNCmeFKzHO3A8annHb-CC6ap7-E1o2kh1oKpJLI2uhJ6xbahwfdt4y9NBUR9LU65NkqLEGcI2cLzqW34AjWcijW3rv0oy87IjGfzsR7fagMhj2sybkBAW8Z2KZa7X2htkacopEVn7FFUfmZlQ0V2RcLkysYQecFe3GYVv7oRn6RhTeTc7DWK8dNUwR6gnLcitmePWKDDOqeQ-v3NmDaIdghdQeT4Eis3BW-S8T6Ti', online: true },
  { name: 'Tuan Anh', level: 'Offline', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwCAhThjIExEdCWluOeAryO3gw68oP9ZxSVOKiUWuz99DriPd2O7roCp8ezXLem05HLF-0zlSR3ANRcr_opKv0mtIC_kOAbQD1pwJvZtb1n6xTeHGjAn_Zjrz8If0IZoPMdJC3Rrn8MxzCKL49ontwWgaAzQ_MJ0fU6lBSAQEl2obbmUolhzAzCMPuQMxaKenIfusrpkzgSWCheJGnqNguT2ZGnatj7x-tZMu08iWiG-4N_dgSCVQsEVxmUaxwimJscBc6AwPJXYtG', online: false },
]

// Mock: Profile page - skill stats (XP), labelKey for i18n
export const mockProfileSkillStats = [
  { icon: 'menu_book', labelKey: 'skills.reading', xp: '1,240 XP', iconColor: 'text-blue-500' },
  { icon: 'headset', labelKey: 'skills.listening', xp: '850 XP', iconColor: 'text-orange-500' },
  { icon: 'edit_note', labelKey: 'skills.writing', xp: '420 XP', iconColor: 'text-green-500' },
]

// Mock: Profile page - achievements
export const mockProfileAchievements = [
  { icon: 'workspace_premium', title: 'Top Learner', date: 'Nov 2023', bgClass: 'bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20', textClass: 'text-orange-600 dark:text-orange-400', iconBg: 'bg-orange-500' },
  { icon: 'auto_graph', title: 'Skill Master', date: 'B2 Level', bgClass: 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-100 dark:border-cyan-500/20', textClass: 'text-cyan-600 dark:text-cyan-400', iconBg: 'bg-cyan-500' },
]
