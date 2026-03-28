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
  return `w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
    isActive
      ? 'bg-primary/15 text-primary font-semibold border border-primary/40'
      : 'hover:bg-slate-800 text-slate-200 border border-transparent'
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
        <h3 className="font-bold text-sm text-white mb-2">{t('vocabulary.recentTopics')}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{t('vocabulary.recentTopicsEmpty')}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <h3 className="font-bold text-sm text-white mb-3">{t('vocabulary.recentTopics')}</h3>
      <ul className="space-y-1 text-sm">
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
              className="w-full flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-800 text-left text-slate-200 transition-colors border border-transparent hover:border-slate-700"
            >
              <span className="text-lg shrink-0 leading-none pt-0.5" aria-hidden>
                {row.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-slate-100">{row.title}</span>
                <span className="block text-[11px] text-slate-500 mt-0.5 truncate">{row.modeLabel}</span>
              </span>
              <span className="material-symbols-outlined text-slate-500 text-lg shrink-0 self-center">chevron_right</span>
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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav
          className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-2 -mx-1 px-1"
          aria-label={t('vocabulary.pageTitle')}
        >
          {links.map((item) => (
            <NavLink
              key={item.path}
              to={item.to}
              end
              className={({ isActive }) =>
                `shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'bg-white dark:bg-[#1f2e36] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="md:hidden mb-4 bg-white dark:bg-[#1f2e36] border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <RecentTopicsBlock />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:items-stretch">
          <aside className="hidden md:flex md:flex-col md:col-span-3 lg:col-span-3 min-h-0">
            <div className="space-y-4 md:sticky md:top-6 md:self-start w-full md:max-h-[calc(100vh-5.5rem)] md:overflow-y-auto md:pb-2 md:pr-1 [scrollbar-gutter:stable]">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                <h1 className="text-lg font-bold text-white mb-1">{t('vocabulary.pageTitle')}</h1>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">{t('vocabulary.pageSubtitle')}</p>
                <nav className="space-y-1 text-sm" aria-label="Words and notes sections">
                  {links.map((item) => (
                    <NavLink key={item.path} to={item.to} end className={({ isActive }) => sidebarLinkClass(isActive)}>
                      {({ isActive }) => (
                        <>
                          <span
                            className={`material-symbols-outlined text-xl ${isActive ? 'text-primary' : 'text-slate-400'}`}
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

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                <RecentTopicsBlock />
              </div>
            </div>
          </aside>

          <section className="md:col-span-9 lg:col-span-9 min-w-0">
            <Outlet key={location.pathname} />
          </section>
        </div>
      </div>
    </main>
  )
}
