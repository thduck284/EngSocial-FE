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

const labelClass =
  'block font-semibold text-xs text-slate-500 dark:text-gray-400 mb-2'
const inputClass =
  'w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-gray-600'
const cardClass =
  'bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm'
const sectionTitleClass =
  'font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2'
const primaryBtnClass =
  'inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-primary/20 active:scale-95'

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
      },
      {
        id: 'learn',
        name: t('vocabulary.modeLearn'),
        description: t('vocabulary.modeLearnDesc'),
        icon: '📚',
      },
      {
        id: 'test',
        name: t('vocabulary.modeTest'),
        description: t('vocabulary.modeTestDesc'),
        icon: '📝',
      },
      {
        id: 'match',
        name: t('vocabulary.modeMatch'),
        description: t('vocabulary.modeMatchDesc'),
        icon: '🧩',
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

  const req = <span className="text-red-500">{t('vocabulary.requiredMark')}</span>

  const wordTypeLabel = (id) =>
    id ? t(`vocabulary.wordType.${id}`) : t('vocabulary.wordType.none')

  return (
    <div className="space-y-6">
      <div className={`${cardClass} p-5`}>
        <h2 className={`${sectionTitleClass} mb-1`}>
          <span className="material-symbols-outlined text-lg text-primary">edit_note</span>
          {t('vocabulary.myWordsAddTitle')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-gray-400 mb-5">
          {t('vocabulary.myWordsAddIntro')}
        </p>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelClass}>
              {t('vocabulary.fieldDeck')} {req}
            </label>
            <input
              value={deck}
              onChange={(e) => setDeck(e.target.value)}
              required
              className={inputClass}
              placeholder={t('vocabulary.deckPlaceholder')}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>
              {t('vocabulary.fieldWordEn')} {req}
            </label>
            <input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              required
              className={inputClass}
              placeholder={t('vocabulary.wordPlaceholder')}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>
              {t('vocabulary.fieldMeaningVi')} {req}
            </label>
            <input
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              required
              className={inputClass}
              placeholder={t('vocabulary.meaningPlaceholder')}
            />
          </div>
          <div>
            <label className={labelClass}>{t('vocabulary.fieldWordType')}</label>
            <select
              value={wordType}
              onChange={(e) => setWordType(e.target.value)}
              className={inputClass}
            >
              {VOCAB_WORD_TYPE_IDS.map((id) => (
                <option key={id || 'none'} value={id}>
                  {wordTypeLabel(id)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('vocabulary.fieldPronunciation')}</label>
            <input
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
              className={inputClass}
              placeholder={t('vocabulary.pronunciationPlaceholder')}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>{t('vocabulary.fieldExample')}</label>
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              rows={2}
              className={`${inputClass} resize-y min-h-[88px] p-3`}
              placeholder={t('vocabulary.examplePlaceholder')}
            />
          </div>
          <div className="md:col-span-2 flex justify-end pt-1">
            <button type="submit" className={primaryBtnClass}>
              <span className="material-symbols-outlined text-lg">add_circle</span>
              {t('vocabulary.addWord')}
            </button>
          </div>
        </form>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="px-5 py-4 border-b border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-background-dark/30">
          <h3 className={sectionTitleClass}>
            <span className="material-symbols-outlined text-lg text-primary">list_alt</span>
            {t('vocabulary.wordListTitle', { count: words.length })}
          </h3>
        </div>

        {words.length === 0 ? (
          <div className="py-16 px-6 text-center flex flex-col items-center">
            <div className="size-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-border-dark">
              <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-gray-600">
                inventory_2
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">
              {t('vocabulary.wordListEmpty')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 dark:bg-background-dark/30 text-xs font-semibold text-slate-500 dark:text-gray-400">
                <tr>
                  <th className="text-left px-5 py-3.5 border-b border-slate-100 dark:border-border-dark">
                    {t('vocabulary.colDeck')}
                  </th>
                  <th className="text-left px-5 py-3.5 border-b border-slate-100 dark:border-border-dark hidden md:table-cell">
                    {t('vocabulary.colWordType')}
                  </th>
                  <th className="text-left px-5 py-3.5 border-b border-slate-100 dark:border-border-dark">
                    {t('vocabulary.colWord')}
                  </th>
                  <th className="text-left px-5 py-3.5 border-b border-slate-100 dark:border-border-dark">
                    {t('vocabulary.colMeaning')}
                  </th>
                  <th className="text-left px-5 py-3.5 border-b border-slate-100 dark:border-border-dark hidden sm:table-cell">
                    {t('vocabulary.colPronunciation')}
                  </th>
                  <th className="text-left px-5 py-3.5 border-b border-slate-100 dark:border-border-dark hidden lg:table-cell min-w-[200px]">
                    {t('vocabulary.colExample')}
                  </th>
                  <th className="w-16 px-5 py-3.5 border-b border-slate-100 dark:border-border-dark" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                {words.map((w) => (
                  <tr
                    key={w.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-5 py-4 text-xs font-bold text-slate-500 dark:text-gray-400">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-border-dark">
                        {(w.deck || '').trim() || t('vocabulary.dash')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-primary hidden md:table-cell">
                      {(w.wordType || '').trim() ? wordTypeLabel(w.wordType) : t('vocabulary.dash')}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      {w.word}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600 dark:text-gray-300">
                      {w.meaning}
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-400 dark:text-gray-500 italic hidden sm:table-cell">
                      {w.pronunciation || t('vocabulary.dash')}
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-400 dark:text-gray-500 hidden lg:table-cell max-w-xs">
                      {(w.example || '').trim() ? (
                        <span className="italic line-clamp-2 leading-relaxed">{w.example}</span>
                      ) : (
                        t('vocabulary.dash')
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setItemToDelete(w)}
                        className="size-8 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        title={t('vocabulary.delete')}
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={`${cardClass} p-5`}>
        <h3 className={`${sectionTitleClass} mb-1`}>
          <span className="material-symbols-outlined text-lg text-primary">school</span>
          {t('vocabulary.practiceSectionTitle')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-gray-400 mb-5">
          {t('vocabulary.practiceSectionIntro')}
        </p>

        <div className="mb-5 max-w-md">
          <label className={labelClass}>{t('vocabulary.practiceByTopic')}</label>
          <select
            value={practiceDeck}
            onChange={(e) => setPracticeDeck(e.target.value)}
            className={inputClass}
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
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">warning</span>
            {t('vocabulary.noWordsInScope')}
          </div>
        )}
        {canPractice && !matchOk && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-border-dark text-sm text-slate-500 dark:text-gray-400 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">info</span>
            {t('vocabulary.matchNeedsFour')}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {studyModes.map((mode) => {
            const disabled = !canPractice || (mode.id === 'match' && !matchOk)
            return (
              <button
                key={mode.id}
                type="button"
                disabled={disabled}
                onClick={() => navigate(vocabPracticePath(CUSTOM_TOPIC_ID, mode.id, practiceDeck))}
                className="group bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark p-5 flex flex-col items-center text-center transition-all hover:border-primary/50 hover:shadow-md disabled:opacity-40 disabled:hover:border-slate-200 dark:disabled:hover:border-border-dark disabled:hover:shadow-none"
              >
                <div className="size-14 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-border-dark flex items-center justify-center text-3xl mb-4 group-hover:scale-105 transition-transform">
                  {mode.icon}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors mb-1.5">
                  {mode.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                  {mode.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('dashboard.viewDetail')}
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex justify-center border-t border-slate-100 dark:border-border-dark pt-5">
          <button
            type="button"
            disabled={!canPractice}
            onClick={() => navigate(vocabPracticePath(CUSTOM_TOPIC_ID, 'data', practiceDeck))}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark text-sm font-bold text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:border-primary/40 transition-all shadow-sm disabled:opacity-40 active:scale-95"
          >
            <span className="text-lg">📋</span>
            {t('vocabulary.viewAllWords')}
            <span className="material-symbols-outlined text-primary text-lg">arrow_forward</span>
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-gray-500 pb-2">
        {t('vocabulary.pickActivity')}
      </p>

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
