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
    <div className="max-w-[1440px] mx-auto w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark shadow-2xl shadow-slate-200/50 dark:shadow-none p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight flex items-center gap-4">
            <span className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">✏️</span>
            {t('vocabulary.myWordsAddTitle')}
          </h2>
          <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-10 ml-16">
            {t('vocabulary.myWordsAddIntro')}
          </p>

          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-3 block ml-1">
                {t('vocabulary.fieldDeck')} {req}
              </label>
              <input
                value={deck}
                onChange={(e) => setDeck(e.target.value)}
                required
                className="w-full rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-background-dark/50 px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600"
                placeholder={t('vocabulary.deckPlaceholder')}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-3 block ml-1">
                {t('vocabulary.fieldWordEn')} {req}
              </label>
              <input
                value={word}
                onChange={(e) => setWord(e.target.value)}
                required
                className="w-full rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-background-dark/50 px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600"
                placeholder={t('vocabulary.wordPlaceholder')}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-3 block ml-1">
                {t('vocabulary.fieldMeaningVi')} {req}
              </label>
              <input
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                required
                className="w-full rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-background-dark/50 px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600"
                placeholder={t('vocabulary.meaningPlaceholder')}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-3 block ml-1">
                {t('vocabulary.fieldWordType')}
              </label>
              <select
                value={wordType}
                onChange={(e) => setWordType(e.target.value)}
                className="w-full rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-background-dark/50 px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
              >
                {VOCAB_WORD_TYPE_IDS.map((id) => (
                  <option key={id || 'none'} value={id}>
                    {wordTypeLabel(id)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-3 block ml-1">
                {t('vocabulary.fieldPronunciation')}
              </label>
              <input
                value={pronunciation}
                onChange={(e) => setPronunciation(e.target.value)}
                className="w-full rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-background-dark/50 px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600"
                placeholder={t('vocabulary.pronunciationPlaceholder')}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-3 block ml-1">
                {t('vocabulary.fieldExample')}
              </label>
              <textarea
                value={example}
                onChange={(e) => setExample(e.target.value)}
                rows={2}
                className="w-full rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-background-dark/50 px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-y min-h-[100px] placeholder:text-slate-300 dark:placeholder:text-gray-600"
                placeholder={t('vocabulary.examplePlaceholder')}
              />
            </div>
            <div className="md:col-span-2 flex justify-end mt-4">
              <button
                type="submit"
                className="px-10 py-5 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                {t('vocabulary.addWord')}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-background-dark/30">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="size-2 rounded-full bg-primary" />
            {t('vocabulary.wordListTitle', { count: words.length })}
          </h3>
        </div>
        
        {words.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="size-24 bg-slate-50 dark:bg-background-dark/50 rounded-full flex items-center justify-center mb-8 border border-slate-100 dark:border-white/5">
              <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-gray-700">inventory_2</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">
              {t('vocabulary.wordListEmpty')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 dark:bg-background-dark/30 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                <tr>
                  <th className="text-left px-8 py-5 border-b border-slate-100 dark:border-white/5">{t('vocabulary.colDeck')}</th>
                  <th className="text-left px-8 py-5 border-b border-slate-100 dark:border-white/5 hidden md:table-cell">{t('vocabulary.colWordType')}</th>
                  <th className="text-left px-8 py-5 border-b border-slate-100 dark:border-white/5">{t('vocabulary.colWord')}</th>
                  <th className="text-left px-8 py-5 border-b border-slate-100 dark:border-white/5">{t('vocabulary.colMeaning')}</th>
                  <th className="text-left px-8 py-5 border-b border-slate-100 dark:border-white/5 hidden sm:table-cell">{t('vocabulary.colPronunciation')}</th>
                  <th className="text-left px-8 py-5 border-b border-slate-100 dark:border-white/5 hidden lg:table-cell min-w-[220px]">{t('vocabulary.colExample')}</th>
                  <th className="w-24 px-8 py-5 border-b border-slate-100 dark:border-white/5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {words.map((w) => (
                  <tr
                    key={w.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-8 py-6 text-xs font-bold text-slate-500 dark:text-gray-400">
                      <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        {(w.deck || '').trim() || t('vocabulary.dash')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs font-black text-primary uppercase tracking-widest hidden md:table-cell">
                      {(w.wordType || '').trim() ? wordTypeLabel(w.wordType) : t('vocabulary.dash')}
                    </td>
                    <td className="px-8 py-6 text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors">{w.word}</td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-600 dark:text-gray-300">{w.meaning}</td>
                    <td className="px-8 py-6 text-xs font-medium text-slate-400 dark:text-gray-500 italic hidden sm:table-cell">
                      {w.pronunciation || t('vocabulary.dash')}
                    </td>
                    <td className="px-8 py-6 text-xs font-medium text-slate-400 dark:text-gray-500 hidden lg:table-cell max-w-xs">
                      {(w.example || '').trim() ? (
                        <span className="italic line-clamp-2 leading-relaxed">{w.example}</span>
                      ) : (
                        t('vocabulary.dash')
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <button
                        type="button"
                        onClick={() => setItemToDelete(w)}
                        className="size-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm opacity-0 group-hover:opacity-100"
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

      <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark shadow-2xl shadow-slate-200/50 dark:shadow-none p-10">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
          {t('vocabulary.practiceSectionTitle')}
        </h3>
        <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-8">
          {t('vocabulary.practiceSectionIntro')}
        </p>
        
        <div className="mb-10 max-w-md">
          <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-3 block ml-1">
            {t('vocabulary.practiceByTopic')}
          </label>
          <div className="relative">
            <select
              value={practiceDeck}
              onChange={(e) => setPracticeDeck(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-background-dark/50 px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
            >
              <option value="all">{t('vocabulary.allDecks')}</option>
              {deckNames.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        {!canPractice && (
          <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined">warning</span>
            {t('vocabulary.noWordsInScope')}
          </div>
        )}
        {canPractice && !matchOk && (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined">info</span>
            {t('vocabulary.matchNeedsFour')}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {studyModes.map((mode) => {
            const disabled = !canPractice || (mode.id === 'match' && !matchOk)
            return (
              <button
                key={mode.id}
                type="button"
                disabled={disabled}
                onClick={() => navigate(vocabPracticePath(CUSTOM_TOPIC_ID, mode.id, practiceDeck))}
                className="group relative bg-slate-50 dark:bg-background-dark/50 rounded-[2rem] border border-slate-100 dark:border-white/5 p-8 flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className="size-20 rounded-[1.5rem] bg-white dark:bg-card-dark border border-slate-100 dark:border-white/10 shadow-lg flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-500">
                  {mode.icon}
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest group-hover:text-primary transition-colors mb-2">
                  {mode.name}
                </h3>
                <p className="text-[9px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-[0.1em] leading-relaxed">
                  {mode.description}
                </p>
                <div className="mt-8 size-10 rounded-full bg-white dark:bg-card-dark border border-slate-100 dark:border-white/10 flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all group-hover:shadow-lg group-hover:shadow-primary/20">
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-12 flex justify-center border-t border-slate-100 dark:border-white/5 pt-10">
          <button
            type="button"
            disabled={!canPractice}
            onClick={() => navigate(vocabPracticePath(CUSTOM_TOPIC_ID, 'data', practiceDeck))}
            className="flex items-center gap-4 px-10 py-5 rounded-2xl bg-white dark:bg-card-dark border-2 border-slate-100 dark:border-white/5 text-slate-600 dark:text-white hover:text-primary dark:hover:text-primary hover:border-primary/50 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none active:scale-95 disabled:opacity-40"
          >
            <span className="text-2xl">📋</span>
            <span className="text-[10px] font-black uppercase tracking-widest">
              {t('vocabulary.viewAllWords')}
            </span>
            <span className="material-symbols-outlined text-primary ml-2 group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
      </div>

      <p className="text-center text-[10px] font-black text-slate-300 dark:text-gray-700 uppercase tracking-[0.3em] py-10">
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
