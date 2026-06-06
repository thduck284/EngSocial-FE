import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getVocabNotes,
  addVocabNote,
  deleteVocabNote,
} from '../../utils/vocabularyUserStorage'
import { AlertModal } from '../ui/common/AlertModal'
import { useAchievementSync } from '../../hooks/useAchievementSync'

const PREVIEW_MAX_CHARS = 220
const PREVIEW_MAX_LINES = 5

const labelClass =
  'block text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase mb-1.5 px-1 tracking-wider'
const inputClass =
  'w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-xs rounded-xl focus:ring-2 focus:ring-primary outline-none px-3 py-2 text-slate-900 dark:text-white transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-gray-600'
const cardClass =
  'bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm'
const sectionTitleClass =
  'text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2'
const modalShellClass =
  'bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg max-h-[min(90vh,720px)] flex flex-col border border-slate-200 dark:border-border-dark'

function buildNotePreview(content) {
  const raw = content ?? ''
  const s = raw.trim()
  const lines = raw.split(/\r?\n/)
  const manyLines = lines.length > PREVIEW_MAX_LINES

  if (s.length <= PREVIEW_MAX_CHARS && !manyLines) {
    return { preview: raw.length ? raw : '', truncated: false }
  }

  if (manyLines && s.length <= PREVIEW_MAX_CHARS) {
    const head = lines.slice(0, PREVIEW_MAX_LINES).join('\n')
    return { preview: `${head}…`, truncated: true }
  }

  let cut = s.slice(0, PREVIEW_MAX_CHARS)
  const lastSpace = cut.lastIndexOf(' ')
  if (lastSpace > PREVIEW_MAX_CHARS * 0.55) {
    cut = cut.slice(0, lastSpace)
  }
  return { preview: `${cut}…`, truncated: true }
}

export default function VocabularyNotesPanel() {
  const { t, i18n } = useTranslation()
  const { sync } = useAchievementSync()
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [savedHint, setSavedHint] = useState('')
  const [detailNote, setDetailNote] = useState(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const refresh = () => setNotes(getVocabNotes())

  useEffect(() => {
    refresh()
    sync()
  }, [sync])

  const closeComposer = useCallback(() => {
    setComposerOpen(false)
  }, [])

  const closeDetail = useCallback(() => setDetailNote(null), [])

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return
    addVocabNote({ title, content })
    setTitle('')
    setContent('')
    setComposerOpen(false)
    refresh()
    sync()
    setSavedHint(t('vocabulary.notesSaved'))
    setTimeout(() => setSavedHint(''), 2500)
  }

  const dateLocale = i18n.language?.startsWith('vi') ? 'vi-VN' : 'en-US'

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (composerOpen) {
        closeComposer()
        return
      }
      if (detailNote) closeDetail()
    }
    if (!composerOpen && !detailNote) return
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [composerOpen, detailNote, closeComposer, closeDetail])

  const openComposer = () => setComposerOpen(true)

  return (
    <div className="space-y-6">
      <div
        role="button"
        tabIndex={0}
        onClick={openComposer}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openComposer()
          }
        }}
        className={`${cardClass} p-5 cursor-pointer transition-all hover:border-primary/50 hover:shadow-md outline-none group`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className={`${sectionTitleClass} mb-1`}>
              <span className="material-symbols-outlined text-sm text-primary">note_alt</span>
              {t('vocabulary.notesTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-1">
              {t('vocabulary.notesIntro')}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-gray-500">
              {t('vocabulary.notesOpenComposerHint')}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/25 shrink-0 group-hover:brightness-110 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            {t('vocabulary.notesAddNote')}
          </div>
        </div>
      </div>

      {savedHint && (
        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 px-1">
          {savedHint}
        </p>
      )}

      <div className={`${cardClass} overflow-hidden`}>
        <div className="px-5 py-4 border-b border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-background-dark/30">
          <h3 className={sectionTitleClass}>
            <span className="material-symbols-outlined text-sm text-primary">description</span>
            {t('vocabulary.notesSavedList', { count: notes.length })}
          </h3>
        </div>

        {notes.length === 0 ? (
          <div className="py-16 px-6 text-center flex flex-col items-center">
            <div className="size-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-border-dark">
              <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-gray-600">
                folder_open
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium italic">
              {t('vocabulary.notesEmpty')}
            </p>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {notes.map((n) => {
              const { preview, truncated } = buildNotePreview(n.content)
              const displayBody = preview || t('vocabulary.dash')

              return (
                <div
                  key={n.id}
                  className="group bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark p-4 flex flex-col gap-3 transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                        {n.title || t('vocabulary.notesTitle')}
                      </h4>
                      <span className="material-symbols-outlined text-slate-300 dark:text-gray-600 text-base shrink-0">
                        push_pin
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed whitespace-pre-wrap line-clamp-5">
                      {displayBody}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-border-dark">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                      {new Date(n.createdAt).toLocaleDateString(dateLocale, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {truncated && (
                        <button
                          type="button"
                          onClick={() => setDetailNote(n)}
                          className="size-8 rounded-xl text-slate-400 hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all"
                          title={t('vocabulary.notesViewDetail')}
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setItemToDelete(n)}
                        className="size-8 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center transition-all"
                        title={t('vocabulary.delete')}
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {composerOpen ? (
        <div
          className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vocab-note-composer-title"
          onClick={closeComposer}
        >
          <div className={modalShellClass} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-border-dark shrink-0 flex items-start justify-between gap-3">
              <div>
                <h3 id="vocab-note-composer-title" className={sectionTitleClass}>
                  <span className="material-symbols-outlined text-sm text-primary">note_alt</span>
                  {t('vocabulary.notesTitle')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                  {t('vocabulary.notesIntro')}
                </p>
              </div>
              <button
                type="button"
                onClick={closeComposer}
                className="shrink-0 size-8 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors"
                aria-label={t('vocabulary.notesCloseDetail')}
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
              <div>
                <label className={labelClass} htmlFor="vocab-note-title">
                  {t('vocabulary.notesTitlePlaceholder')}
                </label>
                <input
                  id="vocab-note-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('vocabulary.notesTitlePlaceholder')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="vocab-note-content">
                  {t('vocabulary.notesContentPlaceholder')}
                </label>
                <textarea
                  id="vocab-note-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('vocabulary.notesContentPlaceholder')}
                  rows={5}
                  className={`${inputClass} resize-none min-h-[120px]`}
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 dark:border-border-dark shrink-0 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeComposer}
                className="px-5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-border-dark text-[10px] font-black text-slate-600 dark:text-gray-300 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 bg-primary text-white font-black text-[10px] rounded-xl uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20"
              >
                {t('vocabulary.notesSave')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {detailNote ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vocab-note-detail-title"
          onClick={closeDetail}
        >
          <div
            className={`${modalShellClass} max-h-[min(85vh,640px)]`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 dark:border-border-dark shrink-0 relative">
              <h3
                id="vocab-note-detail-title"
                className="text-sm font-bold text-slate-900 dark:text-white pr-10 line-clamp-2"
              >
                {detailNote.title?.trim() ? detailNote.title : t('vocabulary.notesTitle')}
              </h3>
              <button
                type="button"
                onClick={closeDetail}
                className="absolute right-3 top-3 size-8 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors"
                aria-label={t('vocabulary.notesCloseDetail')}
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 min-h-0">
              <p className="text-xs text-slate-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {detailNote.content?.trim() ? detailNote.content : t('vocabulary.dash')}
              </p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mt-4">
                {new Date(detailNote.createdAt).toLocaleString(dateLocale)}
              </p>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 dark:border-border-dark shrink-0 flex justify-end">
              <button
                type="button"
                onClick={closeDetail}
                className="px-6 py-2 bg-primary text-white font-black text-[10px] rounded-xl uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20"
              >
                {t('vocabulary.notesCloseDetail')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AlertModal
        open={!!itemToDelete}
        title={t('common.confirmDelete')}
        message={t('vocabulary.deleteNoteConfirm', { title: itemToDelete?.title || t('vocabulary.notesTitle') })}
        confirmText={t('vocabulary.delete')}
        cancelText={t('common.cancel')}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            deleteVocabNote(itemToDelete.id)
            if (detailNote?.id === itemToDelete.id) setDetailNote(null)
            refresh()
            sync()
            setItemToDelete(null)
          }
        }}
      />
    </div>
  )
}
