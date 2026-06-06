import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { VOCAB_TOPIC_METAS } from '../constants/vocabTopicMetas'

const cardClass =
  'bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm'
const sectionTitleClass =
  'font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2'

/**
 * Tab « Chủ đề » — lưới chủ đề từ vựng (route /words-notes/topics)
 */
export default function VocabularyTopicsTab() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className={`${cardClass} overflow-hidden`}>
        <div className="px-5 py-4 border-b border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-background-dark/30">
          <h2 className={sectionTitleClass}>
            <span className="material-symbols-outlined text-lg text-primary">menu_book</span>
            {t('vocabulary.tabTopics')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            {t('vocabulary.topicsHint')}
          </p>
        </div>

        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {VOCAB_TOPIC_METAS.map((meta, index) => (
            <button
              key={meta.key}
              type="button"
              onClick={() => navigate(`/topic/${index + 1}`)}
              className="group bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark p-5 flex flex-col items-center text-center transition-all hover:border-primary/50 hover:shadow-md active:scale-[0.98]"
            >
              <div className="size-14 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-border-dark flex items-center justify-center text-3xl mb-3 group-hover:scale-105 transition-transform">
                {meta.icon}
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {t(`vocabulary.topics.${meta.key}`)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
