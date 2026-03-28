import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { VOCAB_TOPIC_METAS } from '../constants/vocabTopicMetas'

/**
 * Tab « Chủ đề » — lưới chủ đề từ vựng (route /words-notes/topics)
 */
export default function VocabularyTopicsTab() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
          {t('vocabulary.pageTitle')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-base md:text-lg">
          {t('vocabulary.pageSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6">
        {VOCAB_TOPIC_METAS.map((meta, index) => (
          <button
            key={meta.key}
            type="button"
            onClick={() => navigate(`/topic/${index + 1}`)}
            className="group relative bg-white/80 dark:bg-[#1f2e36]/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 md:p-8 flex flex-col items-center justify-center border-2 border-transparent hover:border-purple-400 dark:hover:border-purple-500 hover:scale-[1.02]"
          >
            <span className="text-5xl md:text-6xl mb-3 md:mb-4 transform group-hover:scale-110 transition-transform duration-300">
              {meta.icon}
            </span>
            <span className="text-base md:text-xl font-semibold text-gray-800 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-400 text-center">
              {t(`vocabulary.topics.${meta.key}`)}
            </span>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          </button>
        ))}
      </div>

      <p className="text-center md:text-left text-gray-500 dark:text-gray-400 text-sm md:text-base">
        {t('vocabulary.topicsHint')}
      </p>
    </div>
  )
}
