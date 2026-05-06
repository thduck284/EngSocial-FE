import { useMemo } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants/api'
import { VOCAB_TOPIC_METAS } from '../../constants/vocabTopicMetas'
import { CUSTOM_TOPIC_ID } from '../../utils/getVocabularyTopic'
import { vocabPracticePath, vocabTopicDetailPath } from '../../utils/vocabularyCustomRoutes'
import { useVocabularyRecent } from '../../hooks/useVocabularyRecent'

const SEGMENTS = [
  {
    path: 'topics',
    icon: 'menu_book',
    labelKey: 'vocabulary.tabTopics',
  },
  {
    path: 'notes',
    icon: 'note_alt',
    labelKey: 'vocabulary.tabNotes',
  },
  {
    path: 'my-words',
    icon: 'edit_note',
    labelKey: 'vocabulary.tabMyWords',
  },
]

const PRACTICE_LABEL_KEYS = {
  detail: 'vocabulary.modeOverview',
  flashcard: 'vocabulary.modeFlashcard',
  learn: 'vocabulary.modeLearn',
  test: 'vocabulary.modeTest',
  match: 'vocabulary.modeMatch',
  data: 'vocabulary.modeData',
}

function sidebarLinkClass(isActive) {
  return `w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left group ${
    isActive
      ? 'bg-primary/10 text-primary font-bold border-2 border-primary/20 shadow-sm'
      : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400 font-medium border-2 border-transparent'
  }`
}

function RecentTopicsBlock({ className = '' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { items } = useVocabularyRecent()

  const rows = useMemo(() => {
    return items
      .map((e, index) => {
        const isCustom = e.topicId === CUSTOM_TOPIC_ID
        let title = ''
        let icon = '📚'
        if (isCustom) {
          title = e.deck ? t('vocabulary.customTitleDeck', { deck: e.deck }) : t('vocabulary.customTitleAll')
          icon = '✨'
        } else {
          const idx = parseInt(e.topicId, 10) - 1
          const meta = VOCAB_TOPIC_METAS[idx]
          if (!meta) return null
          title = t(`vocabulary.topics.${meta.key}`)
          icon = meta.icon
        }
        const modeKey = PRACTICE_LABEL_KEYS[e.practiceMode] || 'vocabulary.modeOverview'
        return {
          key: `${e.topicId}-${e.deck || 'all'}-${e.practiceMode}-${index}`,
          title,
          icon,
          modeLabel: t(modeKey),
          entry: e,
        }
      })
      .filter(Boolean)
  }, [items, t])

  if (rows.length === 0) {
    return (
      <div className={className}>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">history</span>
          {t('vocabulary.recentTopics')}
        </h3>
        <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 italic px-2">{t('vocabulary.recentTopicsEmpty')}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-lg text-primary">history</span>
        {t('vocabulary.recentTopics')}
      </h3>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.key}>
            <button
              type="button"
              onClick={() => {
                const e = row.entry
                const path =
                  e.practiceMode === 'detail'
                    ? vocabTopicDetailPath(e.topicId, e.deck)
                    : vocabPracticePath(e.topicId, e.practiceMode, e.deck)
                navigate(path)
              }}
              className="w-full flex items-start gap-4 px-3 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5 group"
            >
              <span className="size-10 rounded-xl bg-white dark:bg-card-dark flex items-center justify-center text-xl shadow-sm border border-slate-100 dark:border-white/5 group-hover:scale-110 transition-transform" aria-hidden>
                {row.icon}
              </span>
              <span className="min-w-0 flex-1 py-0.5">
                <span className="block truncate text-xs font-black text-slate-700 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors">{row.title}</span>
                <span className="block text-[9px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest mt-1">{row.modeLabel}</span>
              </span>
              <span className="material-symbols-outlined text-slate-300 dark:text-gray-700 text-lg shrink-0 self-center group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function WordsNotesLayout() {
  const { t } = useTranslation()
  const location = useLocation()

  const links = SEGMENTS.map((s) => ({
    ...s,
    to: `${ROUTES.WORDS_NOTES}/${s.path}`,
    label: t(s.labelKey),
  }))

  return (
    <main className="min-h-screen bg-white dark:bg-background-dark">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-10 py-8">
        <nav
          className="md:hidden flex gap-3 overflow-x-auto pb-6 mb-4 no-scrollbar"
          aria-label={t('vocabulary.pageTitle')}
        >
          {links.map((item) => (
            <NavLink
              key={item.path}
              to={item.to}
              end
              className={({ isActive }) =>
                `shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white dark:bg-card-dark text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-border-dark hover:bg-slate-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="md:hidden mb-8 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <RecentTopicsBlock />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:items-stretch">
          <aside className="hidden md:flex md:flex-col md:col-span-3 lg:col-span-3 min-h-0">
            <div className="space-y-8 md:sticky md:top-8 md:self-start w-full md:max-h-[calc(100vh-6rem)] md:overflow-y-auto no-scrollbar">
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1 relative z-10">{t('vocabulary.pageTitle')}</h1>
                <p className="text-xs text-slate-500 dark:text-gray-400 mb-6 relative z-10">{t('vocabulary.pageSubtitle')}</p>
                <nav className="space-y-2 text-sm relative z-10" aria-label="Words and notes sections">
                  {links.map((item) => (
                    <NavLink key={item.path} to={item.to} end className={({ isActive }) => sidebarLinkClass(isActive)}>
                      {({ isActive }) => (
                        <>
                          <span
                            className={`material-symbols-outlined text-xl ${isActive ? 'text-primary' : 'text-slate-400 dark:text-gray-600'}`}
                          >
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </nav>
              </div>

              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <RecentTopicsBlock />
              </div>
            </div>
          </aside>

          <section className="md:col-span-9 lg:col-span-9 min-w-0">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Outlet key={location.pathname} />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

