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
  return `w-full flex items-center gap-3 py-2 px-3 rounded-lg transition-colors text-sm ${
    isActive
      ? 'bg-primary/10 text-primary font-bold'
      : 'hover:bg-slate-50 dark:hover:bg-background-dark/60 text-slate-600 dark:text-gray-400 font-medium'
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
        <h3 className="text-xs font-bold text-slate-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base">history</span>
          {t('vocabulary.recentTopics')}
        </h3>
        <p className="text-xs text-slate-400 dark:text-gray-500 italic px-1">{t('vocabulary.recentTopicsEmpty')}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <h3 className="text-xs font-bold text-slate-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-base text-primary">history</span>
        {t('vocabulary.recentTopics')}
      </h3>
      <ul className="space-y-1">
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
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-background-dark/60 text-left transition-colors group"
            >
              <span className="size-9 rounded-lg bg-slate-50 dark:bg-background-dark flex items-center justify-center text-lg border border-slate-200 dark:border-border-dark shrink-0" aria-hidden>
                {row.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-slate-700 dark:text-white group-hover:text-primary transition-colors">{row.title}</span>
                <span className="block text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">{row.modeLabel}</span>
              </span>
              <span className="material-symbols-outlined text-slate-300 dark:text-gray-600 text-base shrink-0 group-hover:text-primary transition-colors">chevron_right</span>
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
      <div className="max-w-[1440px] mx-auto p-6">
        <nav
          className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar"
          aria-label={t('vocabulary.pageTitle')}
        >
          {links.map((item) => (
            <NavLink
              key={item.path}
              to={item.to}
              end
              className={({ isActive }) =>
                `shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-card-dark text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-border-dark hover:bg-slate-50 dark:hover:bg-background-dark/60'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="md:hidden mb-4 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-4 shadow-sm">
          <RecentTopicsBlock />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:items-stretch">
          <aside className="hidden md:flex md:flex-col md:col-span-3 lg:col-span-3 min-h-0">
            <div className="space-y-4 md:sticky md:top-4 md:self-start w-full md:max-h-[calc(100vh-6rem)] md:overflow-y-auto no-scrollbar">
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
                <h1 className="text-base font-bold text-slate-900 dark:text-white mb-0.5">{t('vocabulary.pageTitle')}</h1>
                <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">{t('vocabulary.pageSubtitle')}</p>
                <nav className="space-y-0.5 text-sm" aria-label="Words and notes sections">
                  {links.map((item) => (
                    <NavLink key={item.path} to={item.to} end className={({ isActive }) => sidebarLinkClass(isActive)}>
                      {({ isActive }) => (
                        <>
                          <span
                            className={`material-symbols-outlined text-lg ${isActive ? 'text-primary' : 'text-primary/60'}`}
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

              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
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

