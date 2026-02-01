// Mock: Listening filters
export const listeningFilters = [
  { label: 'Difficulty (All)', options: ['A1 - Beginner', 'B2 - Intermediate', 'C1 - Advanced'] },
  { label: 'Topic (All)', options: ['Technology', 'News', 'Business', 'Entertainment'] },
  { label: 'Accent (All)', options: ['American', 'British', 'Australian'] },
  { label: 'Speed (Normal)', options: ['0.75x', '1.25x', '1.5x'] },
]

// Mock: Listening challenge
export const listeningChallenge = {
  title: 'Listening Mastery: Daily Podcasts',
  desc: 'Listen to 7 podcasts this week and answer all questions to unlock the "Audio Explorer" badge & 800 XP.',
  time: '05:22:10',
  btn: 'buttons.joinChallenge',
  icon: 'equalizer',
}

// Mock: Listening lesson cards
export const listeningCards = [
  {
    id: 'listening-1',
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
    id: 'listening-2',
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
