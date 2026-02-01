/**
 * EngSocial - MongoDB Seed Data
 * 
 * Run: mongosh "mongodb+srv://<cluster>.mongodb.net/engsocial" --apiVersion 1 --username <username> < seed-data.js
 */

// ============================================
// 1. SKILLS (Fixed data)
// ============================================
db.skills.insertMany([
  {
    key: "reading",
    name: "Reading",
    nameVi: "Đọc hiểu",
    icon: "menu_book",
    description: "Improve your reading comprehension skills",
    descriptionVi: "Nâng cao kỹ năng đọc hiểu",
    color: "text-blue-500",
    order: 1
  },
  {
    key: "listening",
    name: "Listening",
    nameVi: "Nghe hiểu",
    icon: "headset",
    description: "Enhance your listening skills with podcasts and audio",
    descriptionVi: "Nâng cao kỹ năng nghe qua podcast và audio",
    color: "text-purple-500",
    order: 2
  },
  {
    key: "writing",
    name: "Writing",
    nameVi: "Viết",
    icon: "edit_note",
    description: "Practice writing essays, emails, and more",
    descriptionVi: "Luyện viết luận, email và nhiều hơn nữa",
    color: "text-emerald-500",
    order: 3
  }
])

// ============================================
// 2. ACHIEVEMENTS (Fixed data)
// ============================================
db.achievements.insertMany([
  // Streak achievements
  {
    key: "streak_3",
    name: "3 Day Streak",
    nameVi: "Streak 3 ngày",
    description: "Maintain a 3-day learning streak",
    descriptionVi: "Duy trì streak học 3 ngày liên tiếp",
    icon: "local_fire_department",
    color: "text-orange-500",
    type: "streak",
    skill: "all",
    requirement: { type: "streak", value: 3 },
    xpReward: 50,
    rarity: "common",
    order: 1,
    active: true
  },
  {
    key: "streak_7",
    name: "7 Day Streak",
    nameVi: "Streak 7 ngày",
    description: "Maintain a 7-day learning streak",
    descriptionVi: "Duy trì streak học 7 ngày liên tiếp",
    icon: "emoji_events",
    color: "text-yellow-500",
    type: "streak",
    skill: "all",
    requirement: { type: "streak", value: 7 },
    xpReward: 150,
    rarity: "uncommon",
    order: 2,
    active: true
  },
  {
    key: "streak_30",
    name: "30 Day Streak",
    nameVi: "Streak 30 ngày",
    description: "Maintain a 30-day learning streak",
    descriptionVi: "Duy trì streak học 30 ngày liên tiếp",
    icon: "whatshot",
    color: "text-red-500",
    type: "streak",
    skill: "all",
    requirement: { type: "streak", value: 30 },
    xpReward: 500,
    rarity: "rare",
    order: 3,
    active: true
  },
  
  // Skill achievements
  {
    key: "reading_beginner",
    name: "Reading Beginner",
    nameVi: "Người mới đọc",
    description: "Complete 5 reading lessons",
    descriptionVi: "Hoàn thành 5 bài đọc",
    icon: "menu_book",
    color: "text-blue-500",
    type: "skill",
    skill: "reading",
    requirement: { type: "lessons", value: 5 },
    xpReward: 100,
    rarity: "common",
    order: 10,
    active: true
  },
  {
    key: "reading_pro",
    name: "Reading Pro",
    nameVi: "Đọc chuyên nghiệp",
    description: "Complete 50 reading lessons",
    descriptionVi: "Hoàn thành 50 bài đọc",
    icon: "auto_awesome",
    color: "text-primary",
    type: "skill",
    skill: "reading",
    requirement: { type: "lessons", value: 50 },
    xpReward: 500,
    rarity: "rare",
    order: 11,
    active: true
  },
  {
    key: "listening_beginner",
    name: "Listening Beginner",
    nameVi: "Người mới nghe",
    description: "Complete 5 listening lessons",
    descriptionVi: "Hoàn thành 5 bài nghe",
    icon: "headset",
    color: "text-purple-500",
    type: "skill",
    skill: "listening",
    requirement: { type: "lessons", value: 5 },
    xpReward: 100,
    rarity: "common",
    order: 20,
    active: true
  },
  {
    key: "audio_pro",
    name: "Audio Pro",
    nameVi: "Nghe chuyên nghiệp",
    description: "Complete 50 listening lessons",
    descriptionVi: "Hoàn thành 50 bài nghe",
    icon: "graphic_eq",
    color: "text-purple-500",
    type: "skill",
    skill: "listening",
    requirement: { type: "lessons", value: 50 },
    xpReward: 500,
    rarity: "rare",
    order: 21,
    active: true
  },
  {
    key: "writing_beginner",
    name: "Writing Beginner",
    nameVi: "Người mới viết",
    description: "Complete 5 writing lessons",
    descriptionVi: "Hoàn thành 5 bài viết",
    icon: "edit_note",
    color: "text-emerald-500",
    type: "skill",
    skill: "writing",
    requirement: { type: "lessons", value: 5 },
    xpReward: 100,
    rarity: "common",
    order: 30,
    active: true
  },
  {
    key: "writing_pro",
    name: "Writing Pro",
    nameVi: "Viết chuyên nghiệp",
    description: "Complete 50 writing lessons",
    descriptionVi: "Hoàn thành 50 bài viết",
    icon: "edit_square",
    color: "text-emerald-500",
    type: "skill",
    skill: "writing",
    requirement: { type: "lessons", value: 50 },
    xpReward: 500,
    rarity: "rare",
    order: 31,
    active: true
  },
  
  // Social achievements
  {
    key: "social_butterfly",
    name: "Social Butterfly",
    nameVi: "Bướm xã hội",
    description: "Make 10 friends",
    descriptionVi: "Kết bạn với 10 người",
    icon: "groups",
    color: "text-pink-500",
    type: "social",
    skill: "all",
    requirement: { type: "friends", value: 10 },
    xpReward: 200,
    rarity: "uncommon",
    order: 40,
    active: true
  },
  {
    key: "contributor",
    name: "Contributor",
    nameVi: "Người đóng góp",
    description: "Create 10 posts in the community",
    descriptionVi: "Tạo 10 bài viết trong cộng đồng",
    icon: "volunteer_activism",
    color: "text-emerald-400",
    type: "social",
    skill: "all",
    requirement: { type: "posts", value: 10 },
    xpReward: 200,
    rarity: "uncommon",
    order: 41,
    active: true
  }
])

// ============================================
// 3. GAMES (Fixed data)
// ============================================
db.games.insertMany([
  {
    key: "word_battle",
    title: "Word Battle",
    titleVi: "Trận chiến từ vựng",
    description: "Test your speed and accuracy in defining complex academic and business vocabulary.",
    descriptionVi: "Kiểm tra tốc độ và độ chính xác của bạn trong việc định nghĩa từ vựng học thuật và kinh doanh.",
    type: "vocabulary",
    difficulty: "medium",
    icon: "spellcheck",
    color: "text-primary",
    bgColor: "bg-indigo-500",
    playCount: 0,
    currentPlaying: 0,
    rating: 0,
    ratingCount: 0,
    config: {
      timeLimit: 60,
      questionsPerRound: 10,
      xpPerCorrect: 10,
      streakBonus: true
    },
    status: "active",
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    key: "grammar_galaxy",
    title: "Grammar Galaxy",
    titleVi: "Ngân hà ngữ pháp",
    description: "Fix broken sentence structures and navigate through complex tenses across the galaxy.",
    descriptionVi: "Sửa cấu trúc câu sai và điều hướng qua các thì phức tạp trong ngân hà.",
    type: "grammar",
    difficulty: "hard",
    icon: "rocket_launch",
    color: "text-purple-400",
    bgColor: "bg-purple-500",
    playCount: 0,
    currentPlaying: 0,
    rating: 0,
    ratingCount: 0,
    config: {
      timeLimit: 90,
      questionsPerRound: 15,
      xpPerCorrect: 15,
      streakBonus: true
    },
    status: "active",
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    key: "quiz_arena",
    title: "Quiz Arena",
    titleVi: "Đấu trường Quiz",
    description: "Test your English knowledge with random quizzes from all categories.",
    descriptionVi: "Kiểm tra kiến thức tiếng Anh của bạn với các câu hỏi ngẫu nhiên từ tất cả các danh mục.",
    type: "mixed",
    difficulty: "easy",
    icon: "psychology",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500",
    playCount: 0,
    currentPlaying: 0,
    rating: 0,
    ratingCount: 0,
    config: {
      timeLimit: 45,
      questionsPerRound: 10,
      xpPerCorrect: 8,
      streakBonus: true
    },
    status: "active",
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// ============================================
// 4. SAMPLE LESSONS
// ============================================
db.lessons.insertMany([
  // Reading Lessons
  {
    title: "The Future of Sustainable Cities",
    slug: "future-sustainable-cities",
    skill: "reading",
    level: "B2",
    topic: "Science",
    description: "Explore how urban planning is evolving to meet environmental challenges in the next decade.",
    thumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
    content: {
      text: `Urban sustainability has become one of the most pressing issues of our time. As cities continue to grow, 
they face unprecedented challenges in managing resources, reducing pollution, and providing quality of life for their residents.

Modern city planners are now incorporating green technologies and innovative design principles to create more sustainable urban environments. 
This includes everything from vertical gardens and green roofs to smart grids and renewable energy systems.

The concept of a "15-minute city" has gained traction, where residents can access all their daily needs within a 15-minute walk or bike ride. 
This approach reduces car dependency and promotes healthier lifestyles while decreasing carbon emissions.`,
      wordCount: 95
    },
    questions: [
      {
        id: "q1",
        question: "What is the main topic of this passage?",
        type: "multiple_choice",
        options: [
          { value: "a", text: "Climate change effects" },
          { value: "b", text: "Urban sustainability and city planning" },
          { value: "c", text: "Green technology manufacturing" },
          { value: "d", text: "Transportation systems" }
        ],
        correctAnswer: "b",
        points: 10
      },
      {
        id: "q2",
        question: "What is a '15-minute city'?",
        type: "multiple_choice",
        options: [
          { value: "a", text: "A city that takes 15 minutes to build" },
          { value: "b", text: "A city where daily needs are within 15-minute walk/bike" },
          { value: "c", text: "A city with 15 districts" },
          { value: "d", text: "A city founded 15 years ago" }
        ],
        correctAnswer: "b",
        points: 10
      }
    ],
    vocabulary: [
      {
        word: "Sustainability",
        phonetic: "/səˌsteɪnəˈbɪləti/",
        meaning: "The ability to be maintained at a certain rate or level",
        meaningVi: "Sự bền vững, khả năng duy trì ở một mức độ nhất định"
      },
      {
        word: "Unprecedented",
        phonetic: "/ʌnˈpresɪdentɪd/",
        meaning: "Never done or known before",
        meaningVi: "Chưa từng có tiền lệ"
      }
    ],
    estimatedTime: 15,
    xpReward: 50,
    totalQuestions: 2,
    rating: 4.5,
    ratingCount: 120,
    completionCount: 1800,
    status: "published",
    featured: true,
    tags: ["science", "environment", "urban"],
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date()
  },
  
  // Listening Lesson
  {
    title: "Global Tech Trends Podcast",
    slug: "global-tech-trends-podcast",
    skill: "listening",
    level: "B2",
    topic: "Technology",
    description: "Stay updated with the latest technological advancements and how they impact our global economy.",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    content: {
      audioUrl: "/audio/tech-trends-podcast.mp3",
      transcript: `Welcome to Global Tech Trends, your weekly podcast on the latest in technology. 
Today we're discussing artificial intelligence and its implications for the future of work.

AI has made remarkable progress in recent years. From language models to autonomous vehicles, 
the technology is advancing at an unprecedented pace.

However, with these advancements come important ethical considerations. 
How do we ensure AI systems are fair and unbiased? How do we protect privacy?

These are questions that researchers, policymakers, and industry leaders are actively working to address.`,
      duration: 720,
      accent: "american",
      speed: 1.0,
      chapters: [
        { id: "intro", label: "Introduction", time: "0:00", startTime: 0 },
        { id: "main", label: "Main Discussion", time: "2:45", startTime: 165 },
        { id: "ethics", label: "Ethical Considerations", time: "6:12", startTime: 372 },
        { id: "conclusion", label: "Conclusion", time: "10:30", startTime: 630 }
      ]
    },
    questions: [
      {
        id: "q1",
        question: "What is the main topic of this podcast?",
        type: "multiple_choice",
        options: [
          { value: "a", text: "The history of computing" },
          { value: "b", text: "AI and its implications for the future of work" },
          { value: "c", text: "Social media trends" },
          { value: "d", text: "Mobile phone development" }
        ],
        correctAnswer: "b",
        points: 10
      }
    ],
    vocabulary: [
      {
        word: "Implication",
        phonetic: "/ˌɪmplɪˈkeɪʃn/",
        meaning: "The conclusion that can be drawn from something",
        meaningVi: "Hàm ý, kết luận có thể rút ra từ điều gì đó"
      }
    ],
    estimatedTime: 12,
    xpReward: 60,
    totalQuestions: 8,
    rating: 4.2,
    ratingCount: 210,
    completionCount: 2100,
    status: "published",
    featured: true,
    tags: ["technology", "AI", "podcast"],
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date()
  },
  
  // Writing Lesson
  {
    title: "Professional Email Request",
    slug: "professional-email-request",
    skill: "writing",
    level: "B1",
    topic: "Business",
    description: "Compose a formal request to a manager regarding a schedule change for next month.",
    thumbnail: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2",
    content: {
      prompt: `Write a formal email to your manager requesting a schedule change for next month. 
You need to change your working hours from 9 AM - 5 PM to 10 AM - 6 PM due to a new commute situation.

Your email should include:
- A clear subject line
- Professional greeting
- Clear explanation of your request
- Reason for the change
- How you will ensure your work is not affected
- Professional closing`,
      wordLimit: { min: 100, max: 150 },
      sampleAnswer: `Subject: Request for Schedule Change - Starting January

Dear Mr./Ms. [Manager's Name],

I hope this email finds you well. I am writing to request a modification to my working hours starting next month.

Due to a recent change in my commute, I would like to shift my schedule from 9 AM - 5 PM to 10 AM - 6 PM. This adjustment would allow me to avoid peak traffic hours and arrive at work more reliably.

I want to assure you that this change will not affect my productivity or availability for team meetings. I will ensure all my responsibilities are fulfilled and will remain accessible during core business hours.

I would be grateful if you could consider this request. Please let me know if you need any additional information or would like to discuss this further.

Thank you for your understanding.

Best regards,
[Your Name]`
    },
    questions: [],
    vocabulary: [
      {
        word: "Modification",
        phonetic: "/ˌmɒdɪfɪˈkeɪʃn/",
        meaning: "A change or alteration",
        meaningVi: "Sự thay đổi, điều chỉnh"
      }
    ],
    estimatedTime: 30,
    xpReward: 80,
    totalQuestions: 0,
    rating: 4.5,
    ratingCount: 85,
    completionCount: 1200,
    status: "published",
    featured: false,
    tags: ["business", "email", "formal"],
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date()
  }
])

// ============================================
// 5. SAMPLE CHALLENGES
// ============================================
const now = new Date()
const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

db.challenges.insertMany([
  {
    title: "Ultimate Reading Marathon",
    titleVi: "Marathon Đọc Tối Thượng",
    description: "Complete 5 advanced articles this week to earn 500 bonus XP and a unique badge.",
    descriptionVi: "Hoàn thành 5 bài đọc nâng cao tuần này để nhận 500 XP bonus và huy hiệu độc đáo.",
    type: "weekly",
    skill: "reading",
    requirement: { type: "lessons", target: 5 },
    xpReward: 500,
    badge: "reading_marathon",
    startDate: now,
    endDate: weekEnd,
    participantCount: 0,
    completedCount: 0,
    icon: "menu_book",
    color: "bg-blue-500",
    status: "active",
    createdAt: now
  },
  {
    title: "Listening Mastery: Daily Podcasts",
    titleVi: "Thành Thạo Nghe: Podcast Hàng Ngày",
    description: "Listen to 7 podcasts this week and answer all questions to unlock the 'Audio Explorer' badge & 800 XP.",
    descriptionVi: "Nghe 7 podcast tuần này và trả lời tất cả câu hỏi để mở khóa huy hiệu 'Audio Explorer' & 800 XP.",
    type: "weekly",
    skill: "listening",
    requirement: { type: "lessons", target: 7 },
    xpReward: 800,
    badge: "audio_explorer",
    startDate: now,
    endDate: weekEnd,
    participantCount: 0,
    completedCount: 0,
    icon: "equalizer",
    color: "bg-purple-500",
    status: "active",
    createdAt: now
  },
  {
    title: "Writing Challenge: The Future of AI",
    titleVi: "Thử Thách Viết: Tương Lai của AI",
    description: "Write a 300-word essay on how AI impacts education. Reward: 1000 XP & 'Future Thinker' Badge.",
    descriptionVi: "Viết bài luận 300 từ về tác động của AI đến giáo dục. Phần thưởng: 1000 XP & Huy hiệu 'Future Thinker'.",
    type: "weekly",
    skill: "writing",
    requirement: { type: "score", target: 80 },
    xpReward: 1000,
    badge: "future_thinker",
    startDate: now,
    endDate: weekEnd,
    participantCount: 0,
    completedCount: 0,
    icon: "edit_square",
    color: "bg-emerald-500",
    status: "active",
    createdAt: now
  }
])

// ============================================
// 6. SAMPLE GROUPS
// ============================================
db.groups.insertMany([
  {
    name: "IELTS Speaking Practice",
    slug: "ielts-speaking-practice",
    description: "A community for IELTS candidates to practice speaking skills together.",
    icon: "translate",
    color: "bg-indigo-500",
    type: "public",
    category: "IELTS",
    memberCount: 12400,
    postCount: 0,
    rules: [
      "Be respectful to all members",
      "Use English only in discussions",
      "No spam or self-promotion"
    ],
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Học Tiếng Anh Qua Phim",
    slug: "hoc-tieng-anh-qua-phim",
    description: "Learn English through movies and TV shows. Share recommendations and discuss dialogues!",
    icon: "movie",
    color: "bg-emerald-500",
    type: "public",
    category: "Entertainment",
    memberCount: 8200,
    postCount: 0,
    rules: [
      "Tôn trọng mọi người",
      "Chia sẻ nội dung hữu ích",
      "Không spam"
    ],
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// ============================================
// Print summary
// ============================================
print("\n========================================")
print("Seed Data Inserted Successfully!")
print("========================================")
print("Inserted:")
print("  - 3 skills")
print("  - 12 achievements")
print("  - 3 games")
print("  - 3 sample lessons")
print("  - 3 challenges")
print("  - 2 groups")
print("========================================\n")
