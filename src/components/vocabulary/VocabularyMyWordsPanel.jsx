import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  getCustomVocabWords,
  addCustomVocabWord,
  deleteCustomVocabWord,
  getCustomDeckNames,
} from '../../utils/vocabularyUserStorage'
import { AlertModal } from '../ui/common/AlertModal'
import { CUSTOM_TOPIC_ID } from '../../utils/getVocabularyTopic'
import { vocabPracticePath } from '../../utils/vocabularyCustomRoutes'
import { VOCAB_WORD_TYPE_IDS } from '../../constants/vocabWordTypes'
import { useAchievementSync } from '../../hooks/useAchievementSync'

export default function VocabularyMyWordsPanel() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { sync } = useAchievementSync()
  const [words, setWords] = useState([])
  const [deck, setDeck] = useState('')
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [pronunciation, setPronunciation] = useState('')
  const [example, setExample] = useState('')
  const [wordType, setWordType] = useState('')
  const [practiceDeck, setPracticeDeck] = useState('all')
  const [itemToDelete, setItemToDelete] = useState(null)

  const refresh = () => setWords(getCustomVocabWords())

  useEffect(() => {
    refresh()
    sync()
  }, [sync])

  const deckNames = useMemo(() => getCustomDeckNames(), [words])

  const wordsInPracticeScope = useMemo(() => {
    if (practiceDeck === 'all') return words
    return words.filter((w) => (w.deck || '').trim() === practiceDeck)
  }, [words, practiceDeck])

  const canPractice = wordsInPracticeScope.length > 0
  const matchOk = wordsInPracticeScope.length >= 4

  const studyModes = useMemo(
    () => [
      {
        id: 'flashcard',
        name: t('vocabulary.modeFlashcard'),
        description: t('vocabulary.modeFlashcardDesc'),
        icon: '🃏',
        color: 'from-blue-400 to-blue-600',
      },
      {
        id: 'learn',
        name: t('vocabulary.modeLearn'),
        description: t('vocabulary.modeLearnDesc'),
        icon: '📚',
        color: 'from-green-400 to-green-600',
      },
      {
        id: 'test',
        name: t('vocabulary.modeTest'),
        description: t('vocabulary.modeTestDesc'),
        icon: '📝',
        color: 'from-green-400 to-green-600',
      },
      {
        id: 'match',
        name: t('vocabulary.modeMatch'),
        description: t('vocabulary.modeMatchDesc'),
        icon: '🧩',
        color: 'from-pink-400 to-pink-600',
      },
    ],
    [t]
  )

  const handleAdd = (e) => {
    e.preventDefault()
    if (!word.trim() || !meaning.trim() || !deck.trim()) return
    addCustomVocabWord({ word, meaning, pronunciation, deck, wordType, example })
    setWord('')
    setMeaning('')
    setPronunciation('')
    setExample('')
    setWordType('')
    refresh()
    sync()
  }

  const req = (
    <span className="text-red-500">{t('vocabulary.requiredMark')}</span>
  )

  const wordTypeLabel = (id) =>
    id ? t(`vocabulary.wordType.${id}`) : t('vocabulary.wordType.none')

  return (
    <div className="max-w-5xl mx-auto w-full space-y-10">
      <div className="bg-white/80 dark:bg-[#1f2e36]/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
          <span className="text-2xl">✏️</span>
          {t('vocabulary.myWordsAddTitle')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          {t('vocabulary.myWordsAddIntro')}
        </p>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('vocabulary.fieldDeck')} {req}
            </label>
            <input
              value={deck}
              onChange={(e) => setDeck(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              placeholder={t('vocabulary.deckPlaceholder')}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('vocabulary.fieldWordEn')} {req}
            </label>
            <input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              placeholder={t('vocabulary.wordPlaceholder')}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('vocabulary.fieldMeaningVi')} {req}
            </label>
            <input
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              placeholder={t('vocabulary.meaningPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('vocabulary.fieldWordType')}
            </label>
            <select
              value={wordType}
              onChange={(e) => setWordType(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            >
              {VOCAB_WORD_TYPE_IDS.map((id) => (
                <option key={id || 'none'} value={id}>
                  {wordTypeLabel(id)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('vocabulary.fieldPronunciation')}
            </label>
            <input
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              placeholder={t('vocabulary.pronunciationPlaceholder')}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('vocabulary.fieldExample')}
            </label>
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 resize-y min-h-[72px]"
              placeholder={t('vocabulary.examplePlaceholder')}
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-95"
            >
              {t('vocabulary.addWord')}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          {t('vocabulary.wordListTitle', { count: words.length })}
        </h3>
        {words.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
            {t('vocabulary.wordListEmpty')}
          </p>
        ) : (
          <div className="bg-white dark:bg-[#1f2e36] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                <tr>
                  <th className="text-left px-4 py-3">{t('vocabulary.colDeck')}</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">{t('vocabulary.colWordType')}</th>
                  <th className="text-left px-4 py-3">{t('vocabulary.colWord')}</th>
                  <th className="text-left px-4 py-3">{t('vocabulary.colMeaning')}</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">{t('vocabulary.colPronunciation')}</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell min-w-[180px]">{t('vocabulary.colExample')}</th>
                  <th className="w-20 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {words.map((w) => (
                  <tr
                    key={w.id}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/80"
                  >
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {(w.deck || '').trim() || t('vocabulary.dash')}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                      {(w.wordType || '').trim() ? wordTypeLabel(w.wordType) : t('vocabulary.dash')}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{w.word}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{w.meaning}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {w.pronunciation || t('vocabulary.dash')}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden lg:table-cell max-w-xs align-top">
                      {(w.example || '').trim() ? (
                        <span className="italic line-clamp-3">{w.example}</span>
                      ) : (
                        t('vocabulary.dash')
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setItemToDelete(w)
                        }}
                        className="text-red-600 dark:text-red-400 text-sm hover:underline"
                      >
                        {t('vocabulary.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          {t('vocabulary.practiceSectionTitle')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {t('vocabulary.practiceSectionIntro')}
        </p>
        <div className="mb-6 max-w-md">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('vocabulary.practiceByTopic')}
          </label>
          <select
            value={practiceDeck}
            onChange={(e) => setPracticeDeck(e.target.value)}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">{t('vocabulary.allDecks')}</option>
            {deckNames.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {!canPractice && (
          <p className="text-amber-600 dark:text-amber-400 text-sm mb-4">
            {t('vocabulary.noWordsInScope')}
          </p>
        )}
        {canPractice && !matchOk && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            {t('vocabulary.matchNeedsFour')}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studyModes.map((mode) => {
            const disabled =
              !canPractice || (mode.id === 'match' && !matchOk)
            return (
              <button
                key={mode.id}
                type="button"
                disabled={disabled}
                onClick={() =>
                  navigate(
                    vocabPracticePath(CUSTOM_TOPIC_ID, mode.id, practiceDeck)
                  )
                }
                className="group relative bg-white dark:bg-[#1f2e36] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-start border-2 border-transparent hover:scale-[1.02] overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${mode.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">{mode.icon}</span>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-primary transition-colors">
                      {mode.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {mode.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 self-end text-primary group-hover:translate-x-2 transition-transform">
                  <span className="material-symbols-outlined text-3xl">
                    arrow_forward
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            disabled={!canPractice}
            onClick={() =>
              navigate(
                vocabPracticePath(CUSTOM_TOPIC_ID, 'data', practiceDeck)
              )
            }
            className="group relative bg-white dark:bg-[#1f2e36] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 px-8 py-4 flex items-center gap-4 border-2 border-transparent hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="text-3xl">📋</span>
            <span className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-primary">
              {t('vocabulary.viewAllWords')}
            </span>
            <span className="material-symbols-outlined text-primary ml-2">
              arrow_forward
            </span>
          </button>
        </div>

        <p className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          {t('vocabulary.pickActivity')}
        </p>
      </div>
      <AlertModal
        open={!!itemToDelete}
        title={t('common.confirmDelete')}
        message={t('vocabulary.deleteWordConfirm', { word: itemToDelete?.word || '' })}
        confirmText={t('vocabulary.delete')}
        cancelText={t('common.cancel')}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            deleteCustomVocabWord(itemToDelete.id)
            refresh()
            sync()
            setItemToDelete(null)
          }
        }}
      />
    </div>
  )
}
