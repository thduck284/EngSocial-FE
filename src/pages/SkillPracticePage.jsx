import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const SKILLS = {
  reading: { icon: 'menu_book', label: 'skills.reading', color: 'text-blue-400' },
  listening: { icon: 'headset', label: 'skills.listening', color: 'text-orange-400' },
  writing: { icon: 'edit_note', label: 'skills.writing', color: 'text-emerald-400' },
}

const skillTabs = [
  { to: '/skills/reading', key: 'reading', icon: 'menu_book', label: 'skills.reading' },
  { to: '/skills/listening', key: 'listening', icon: 'headset', label: 'skills.listening' },
  { to: '/skills/writing', key: 'writing', icon: 'edit_note', label: 'skills.writing' },
  { to: '/enter', icon: 'sports_esports', label: 'skills.entertainment' },
]

// --- Reading (from reading.html) ---
const readingFilters = [
  { label: 'Difficulty (All)', options: ['A1 - Beginner', 'B2 - Intermediate', 'C1 - Advanced'] },
  { label: 'Topic (All)', options: ['Business', 'Science', 'Culture'] },
  { label: 'Type (All)', options: ['Short Read', 'Long Read'] },
]

const readingChallenge = {
  title: 'Ultimate Reading Marathon',
  desc: 'Complete 5 advanced articles this week to earn 500 bonus XP and a unique badge.',
  time: '02:14:45',
  btn: 'buttons.join',
}

const readingCards = [
  {
    title: 'The Future of Sustainable Cities',
    level: 'B2',
    levelColor: 'bg-orange-500/10 text-orange-500',
    desc: 'Explore how urban planning is evolving to meet environmental challenges in the next decade...',
    topic: 'Science',
    time: '15m',
    questions: '10 Questions',
    rating: '8.5/10',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD24NhNfcY-rBlW8a_mwhHsta489aDVdAFE82VSK5a0Vck2wKwkZ6Vhaw_d2XKcRgwcM1Oc_1mtyfj8B43Ca6AhMLMul_MJEPeslF9SvyqjKNTg88ITERxd92cTmEYRbl98OBW2f1VVYSrcpR2J7pFtGYHEoPMU-_X1_C9vNCdhkWbbWt-QHP3iT-89bxCex9dIKVJyYIl5Uzt37--6sH9IEeex6R9PgR1xUVr3erYWpabGB9rbvcSz9Oz_MQNqYHk73azzVn6iyNn-',
  },
  {
    title: 'Effective Business Emails',
    level: 'A2',
    levelColor: 'bg-green-500/10 text-green-500',
    desc: 'Learn the basics of formal communication and how to structure professional inquiries...',
    topic: 'Business',
    time: '10m',
    questions: '5 Questions',
    rating: '9.2/10',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKqQRcZ2qEUm_G9civhe_WEXiHigCQOkb56jFE6xSQfjLEgB0aZByKocBA4xPNZtFhRTG5TuqjG1kogq3KdZD8cfD6VINztDQdUM2TAwY9Yn8HNzzMjl5yzHc7Eo5SkMYsiTiC4t_f5lxm-nTX1rNn7IXUmFieoc2KhtrWo9kc6a9H8sw20XyDiswbiBiG62iFjYbKEQB7Q63k7DzND2sbrO4hI5jhmTwYkzUtLGuY2cCIhPb8rZ-OelYJqRfAU20NTYUtHW7CqXmW',
  },
]

// --- Listening (from listening.html) ---
const listeningFilters = [
  { label: 'Difficulty (All)', options: ['A1 - Beginner', 'B2 - Intermediate', 'C1 - Advanced'] },
  { label: 'Topic (All)', options: ['Technology', 'News', 'Business', 'Entertainment'] },
  { label: 'Accent (All)', options: ['American', 'British', 'Australian'] },
  { label: 'Speed (Normal)', options: ['0.75x', '1.25x', '1.5x'] },
]

const listeningChallenge = {
  title: 'Listening Mastery: Daily Podcasts',
  desc: 'Listen to 7 podcasts this week and answer all questions to unlock the "Audio Explorer" badge & 800 XP.',
  time: '05:22:10',
  btn: 'buttons.joinChallenge',
  icon: 'equalizer',
}

const listeningCards = [
  {
    title: 'Global Tech Trends Podcast',
    level: 'B2',
    levelColor: 'bg-orange-500/10 text-orange-500',
    accent: 'American Accent',
    accentClass: 'bg-primary/10 text-primary border-primary/20',
    desc: 'Stay updated with the latest technological advancements and how they impact our global economy...',
    topic: 'Technology',
    time: '12m',
    questions: '8 Questions',
    rating: '8.2/10',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD24NhNfcY-rBlW8a_mwhHsta489aDVdAFE82VSK5a0Vck2wKwkZ6Vhaw_d2XKcRgwcM1Oc_1mtyfj8B43Ca6AhMLMul_MJEPeslF9SvyqjKNTg88ITERxd92cTmEYRbl98OBW2f1VVYSrcpR2J7pFtGYHEoPMU-_X1_C9vNCdhkWbbWt-QHP3iT-89bxCex9dIKVJyYIl5Uzt37--6sH9IEeex6R9PgR1xUVr3erYWpabGB9rbvcSz9Oz_MQNqYHk73azzVn6iyNn-',
  },
  {
    title: 'BBC News Highlights',
    level: 'C1',
    levelColor: 'bg-red-500/10 text-red-500',
    accent: 'British Accent',
    accentClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    desc: 'A quick summary of the most important world news events reported by expert correspondents...',
    topic: 'News',
    time: '5m',
    questions: '10 Questions',
    rating: '9.0/10',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKqQRcZ2qEUm_G9civhe_WEXiHigCQOkb56jFE6xSQfjLEgB0aZByKocBA4xPNZtFhRTG5TuqjG1kogq3KdZD8cfD6VINztDQdUM2TAwY9Yn8HNzzMjl5yzHc7Eo5SkMYsiTiC4t_f5lxm-nTX1rNn7IXUmFieoc2KhtrWo9kc6a9H8sw20XyDiswbiBiG62iFjYbKEQB7Q63k7DzND2sbrO4hI5jhmTwYkzUtLGuY2cCIhPb8rZ-OelYJqRfAU20NTYUtHW7CqXmW',
  },
]

// --- Writing (from writing.html) ---
const writingFilters = [
  { label: 'Difficulty (All)', options: ['A1', 'A2', 'B1', 'B2', 'C1'] },
  { label: 'Topic (All)', options: ['Business', 'Travel', 'Technology', 'Education', 'Life'] },
  { label: 'Type (All)', options: ['Essay', 'Email', 'Story', 'Report'] },
  { label: 'Length (All)', options: ['Short', 'Medium', 'Long'] },
]

const writingChallenge = {
  title: 'Writing Challenge: The Future of AI',
  desc: 'Write a 300-word essay on how AI impacts education. Reward: 1000 XP & "Future Thinker" Badge.',
  time: '03:15:45',
  btn: 'buttons.joinChallenge',
  icon: 'edit_square',
}

const writingCards = [
  {
    title: 'Professional Email Request',
    level: 'B1',
    levelColor: 'bg-blue-500/10 text-blue-500',
    type: 'Email Practice',
    typeClass: 'bg-primary/10 text-primary border-primary/20',
    desc: 'Compose a formal request to a manager regarding a schedule change for next month...',
    topic: 'Business',
    length: '100-150 words',
    time: '30 min',
    rating: '8.5/10',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD24NhNfcY-rBlW8a_mwhHsta489aDVdAFE82VSK5a0Vck2wKwkZ6Vhaw_d2XKcRgwcM1Oc_1mtyfj8B43Ca6AhMLMul_MJEPeslF9SvyqjKNTg88ITERxd92cTmEYRbl98OBW2f1VVYSrcpR2J7pFtGYHEoPMU-_X1_C9vNCdhkWbbWt-QHP3iT-89bxCex9dIKVJyYIl5Uzt37--6sH9IEeex6R9PgR1xUVr3erYWpabGB9rbvcSz9Oz_MQNqYHk73azzVn6iyNn-',
  },
  {
    title: 'Travel Blog Entry',
    level: 'A2',
    levelColor: 'bg-orange-500/10 text-orange-500',
    type: 'Storytelling',
    typeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    desc: 'Describe your last vacation and what you enjoyed most about the destination...',
    topic: 'Travel',
    length: '150-200 words',
    time: '45 min',
    rating: '7.9/10',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKqQRcZ2qEUm_G9civhe_WEXiHigCQOkb56jFE6xSQfjLEgB0aZByKocBA4xPNZtFhRTG5TuqjG1kogq3KdZD8cfD6VINztDQdUM2TAwY9Yn8HNzzMjl5yzHc7Eo5SkMYsiTiC4t_f5lxm-nTX1rNn7IXUmFieoc2KhtrWo9kc6a9H8sw20XyDiswbiBiG62iFjYbKEQB7Q63k7DzND2sbrO4hI5jhmTwYkzUtLGuY2cCIhPb8rZ-OelYJqRfAU20NTYUtHW7CqXmW',
  },
]

// Right sidebar: Friends & Achievements (skill-specific)
const friendsReading = [
  { name: 'Alex T.', activity: 'Listening: B2 Podcast' },
  { name: 'Sophie C.', activity: 'Reading: Short Stories' },
]
const friendsListening = [
  { name: 'Alex T.', activity: 'Listening: Tech Trends' },
  { name: 'Sophie C.', activity: 'Listening: BBC News' },
]
const friendsWriting = [
  { name: 'Alex T.', activity: 'Listening: B2 Podcast' },
  { name: 'Sophie C.', activity: 'Reading: Short Stories' },
]

const achievementsBySkill = {
  reading: [
    { icon: 'emoji_events', color: 'text-yellow-500', label: '7 Day Streak' },
    { icon: 'auto_awesome', color: 'text-primary', label: 'Reading Pro' },
    { icon: 'volunteer_activism', color: 'text-emerald-400', label: 'Contributor' },
  ],
  listening: [
    { icon: 'emoji_events', color: 'text-yellow-500', label: '7 Day Streak' },
    { icon: 'headset', color: 'text-primary', label: 'Audio Pro' },
    { icon: 'volunteer_activism', color: 'text-emerald-400', label: 'Contributor' },
  ],
  writing: [
    { icon: 'emoji_events', color: 'text-yellow-500', label: '7 Day Streak' },
    { icon: 'edit_square', color: 'text-primary', label: 'Writing Pro' },
    { icon: 'volunteer_activism', color: 'text-emerald-400', label: 'Contributor' },
  ],
}

export function SkillPracticePage() {
  const { skill = 'reading' } = useParams()
  const { t } = useTranslation()
  const current = SKILLS[skill] || SKILLS.reading
  const isReading = skill === 'reading'
  const isListening = skill === 'listening'
  const isWriting = skill === 'writing'

  const filters = isReading ? readingFilters : isListening ? listeningFilters : writingFilters
  const challenge = isReading ? readingChallenge : isListening ? listeningChallenge : writingChallenge
  const challengeGradient = isReading ? 'from-indigo-900/40' : isListening ? 'from-orange-900/40' : 'from-emerald-900/40'
  const challengeIcon = isListening ? 'equalizer' : isWriting ? 'edit_square' : 'workspace_premium'
  const friends = isReading ? friendsReading : isListening ? friendsListening : friendsWriting
  const achievements = achievementsBySkill[skill] || achievementsBySkill.reading

  const renderCards = () => {
    if (isReading) {
      return readingCards.map((card) => (
        <div
          key={card.title}
          className="bg-card-dark rounded-xl border border-border-dark overflow-hidden group hover:border-primary/50 transition-all"
        >
          <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url('${card.img}')` }} />
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <h5 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors">{card.title}</h5>
              <span className={`px-1.5 py-0.5 ${card.levelColor} text-[9px] font-bold rounded`}>{card.level}</span>
            </div>
            <p className="text-xs text-gray-400 line-clamp-2">{card.desc}</p>
            <div className="flex flex-wrap gap-2 py-2">
              <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">category</span> {card.topic}
              </span>
              <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">timer</span> {card.time}
              </span>
              <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">quiz</span> {card.questions}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-dark">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-yellow-500 text-sm fill-icon">star</span>
                <span className="text-[10px] font-bold">TB: {card.rating}</span>
              </div>
              <button className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-background-dark font-bold text-xs rounded transition-all">
                {t('buttons.start')}
              </button>
            </div>
          </div>
        </div>
      ))
    }
    if (isListening) {
      return listeningCards.map((card) => (
        <div
          key={card.title}
          className="bg-card-dark rounded-xl border border-border-dark overflow-hidden group hover:border-primary/50 transition-all"
        >
          <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url('${card.img}')` }}>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-5xl">play_circle</span>
            </div>
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] font-medium">
              <span className="material-symbols-outlined text-xs text-primary">equalizer</span>
              Audio Content
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <h5 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors">{card.title}</h5>
              <span className={`px-1.5 py-0.5 ${card.levelColor} text-[9px] font-bold rounded`}>{card.level}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 ${card.accentClass} text-[10px] font-bold rounded-full border`}>{card.accent}</span>
            </div>
            <p className="text-xs text-gray-400 line-clamp-2">{card.desc}</p>
            <div className="flex flex-wrap gap-2 py-2">
              <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">category</span> {card.topic}
              </span>
              <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">timer</span> {card.time}
              </span>
              <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">quiz</span> {card.questions}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-dark">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-yellow-500 text-sm fill-icon">star</span>
                <span className="text-[10px] font-bold">TB: {card.rating}</span>
              </div>
              <button className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-background-dark font-bold text-xs rounded transition-all">
                {t('buttons.startListening')}
              </button>
            </div>
          </div>
        </div>
      ))
    }
    if (isWriting) {
      return writingCards.map((card) => (
        <div
          key={card.title}
          className="bg-card-dark rounded-xl border border-border-dark overflow-hidden group hover:border-primary/50 transition-all"
        >
          <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url('${card.img}')` }}>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-5xl">edit_note</span>
            </div>
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] font-medium">
              <span className="material-symbols-outlined text-xs text-primary">description</span>
              Writing Task
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <h5 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors">{card.title}</h5>
              <span className={`px-1.5 py-0.5 ${card.levelColor} text-[9px] font-bold rounded`}>{card.level}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 ${card.typeClass} text-[10px] font-bold rounded-full border`}>{card.type}</span>
            </div>
            <p className="text-xs text-gray-400 line-clamp-2">{card.desc}</p>
            <div className="flex flex-wrap gap-2 py-2">
              <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">category</span> {card.topic}
              </span>
              <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">straighten</span> {card.length}
              </span>
              <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">timer</span> {card.time}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-dark">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-yellow-500 text-sm fill-icon">star</span>
                <span className="text-[10px] font-bold">TB: {card.rating}</span>
              </div>
              <button className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-background-dark font-bold text-xs rounded transition-all">
                {t('buttons.startWriting')}
              </button>
            </div>
          </div>
        </div>
      ))
    }
    return null
  }

  return (
    <main className="max-w-[1440px] mx-auto grid grid-cols-12 gap-6 p-6">
      {/* Left sidebar - same for all skills */}
      <aside className="col-span-12 lg:col-span-3 space-y-6">
        <div className="bg-card-dark rounded-xl p-5 border border-border-dark">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            {t('skills.skillStats')}
          </h3>
          <div className="space-y-4">
            {Object.entries(SKILLS).map(([key, { icon, label, color }]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${color}`}>{icon}</span>
                  <span className="text-sm">{t(label)}</span>
                </div>
                <span className="text-sm font-bold">
                  {key === 'reading' ? '1,240' : key === 'listening' ? '850' : '420'} XP
                </span>
              </div>
            ))}
            <div className="pt-4 border-t border-border-dark flex justify-between items-center text-xs text-gray-400">
              <span>{t('skills.weeklyTime')}: <strong className="text-white">5h 20m</strong></span>
              <span>{t('skills.done')}: <strong className="text-white">12/15</strong></span>
            </div>
          </div>
        </div>
        <div className="bg-card-dark rounded-xl p-5 border border-border-dark">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">flag</span>
              {t('skills.goals')}
            </h3>
            <div className="flex gap-1">
              <button className="size-7 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600" type="button">
                <span className="material-symbols-outlined text-xs">edit</span>
              </button>
              <button className="size-7 flex items-center justify-center rounded bg-primary/20 text-primary hover:bg-primary/30" type="button">
                <span className="material-symbols-outlined text-xs">add</span>
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span>{t('skills.readingDaily')}</span>
                <span>80%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-700 rounded-full">
                <div className="h-full bg-primary rounded-full" style={{ width: '80%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span>{t('skills.vocabularyGoal')}</span>
                <span>45%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-700 rounded-full">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-card-dark rounded-xl p-5 border border-border-dark">
          <h3 className="font-bold text-sm mb-4">{t('skills.roadmapProgress')}</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="size-12 rounded-full border-4 border-primary border-t-transparent flex items-center justify-center font-bold text-primary">
              B2
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('skills.currentLevel')}</p>
              <p className="font-bold">Intermediate</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-[10px]">
              <span>65% to C1 Advanced</span>
            </div>
            <div className="h-2 w-full bg-gray-700 rounded-full">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }} />
            </div>
          </div>
          <button className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-bold transition-all" type="button">
            {t('skills.viewDetails')}
          </button>
        </div>
      </aside>

      {/* Center - tabs + filters + challenge + cards */}
      <section className="col-span-12 lg:col-span-6 space-y-6">
        <div className="bg-card-dark p-1 rounded-xl flex border border-border-dark">
          {skillTabs.map(({ to, key, icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                key && key === skill
                  ? 'bg-background-dark border border-border-dark text-primary font-bold'
                  : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{icon}</span>
              {t(label)}
            </Link>
          ))}
        </div>

        <div className="bg-card-dark p-4 rounded-xl border border-border-dark flex flex-wrap gap-3 items-center">
          {filters.map((f) => (
            <select
              key={f.label}
              className="bg-background-dark border-border-dark text-xs rounded-lg focus:ring-primary focus:border-primary px-3 py-2 min-w-[120px]"
            >
              <option>{f.label}</option>
              {f.options.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          ))}
          <div className="flex gap-2 ml-auto">
            <button className="px-3 py-2 text-xs font-medium text-gray-400 hover:text-white" type="button">Đặt lại</button>
            <button className="px-4 py-2 bg-primary text-background-dark font-bold text-xs rounded-lg hover:brightness-110" type="button">
              Lưu
            </button>
          </div>
        </div>

        <div className={`bg-gradient-to-r ${challengeGradient} to-primary/20 border border-primary/30 rounded-xl p-5 relative overflow-hidden`}>
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-primary text-background-dark text-[10px] font-bold rounded">{t('enter.weeklyChallenge')}</span>
                <span className="text-xs text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span> {challenge.time}
                </span>
              </div>
              <h4 className="font-bold text-lg text-white">{challenge.title}</h4>
              <p className="text-xs text-gray-300">{challenge.desc}</p>
              <button className="mt-2 px-6 py-2 bg-primary text-background-dark font-bold text-sm rounded-lg hover:brightness-110" type="button">
                {t(challenge.btn)}
              </button>
            </div>
            <span className="material-symbols-outlined text-7xl text-primary/20">{challengeIcon}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{renderCards()}</div>
      </section>

      {/* Right sidebar - Friends, Achievements, Hot Games */}
      <aside className="col-span-12 lg:col-span-3 space-y-6">
        <div className="bg-card-dark rounded-xl p-5 border border-border-dark">
          <h3 className="font-bold text-sm mb-4 flex items-center justify-between">
            {t('enter.friendsOnline')}
            <span className="size-2 bg-green-500 rounded-full animate-pulse" />
          </h3>
          <div className="space-y-4">
            {friends.map(({ name, activity }) => (
              <div key={name} className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-slate-600 border border-primary relative" />
                <div className="text-xs">
                  <p className="font-bold">{name}</p>
                  <p className="text-gray-400">{activity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card-dark rounded-xl p-5 border border-border-dark">
          <h3 className="font-bold text-sm mb-4">{t('enter.achievements')}</h3>
          <div className="grid grid-cols-3 gap-2">
            {achievements.map(({ icon, color, label }) => (
              <div
                key={label}
                className="aspect-square bg-background-dark rounded-lg flex flex-col items-center justify-center border border-border-dark p-2 group cursor-help"
              >
                <span className={`material-symbols-outlined ${color} text-2xl group-hover:scale-110 transition-transform`}>{icon}</span>
                <span className="text-[8px] mt-1 text-center font-bold">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card-dark rounded-xl p-5 border border-border-dark">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-400">local_fire_department</span>
            {t('enter.hotGames')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded bg-indigo-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">spellcheck</span>
                </div>
                <div className="text-[10px]">
                  <p className="font-bold">Word Battle</p>
                  <p className="text-gray-400">120 {t('enter.playing')}</p>
                </div>
              </div>
              <button className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded hover:bg-primary hover:text-background-dark transition-all" type="button">
                {t('buttons.join')}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded bg-emerald-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">psychology</span>
                </div>
                <div className="text-[10px]">
                  <p className="font-bold">Quiz Arena</p>
                  <p className="text-gray-400">85 {t('enter.playing')}</p>
                </div>
              </div>
              <button className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded hover:bg-primary hover:text-background-dark transition-all" type="button">
                {t('buttons.join')}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </main>
  )
}
