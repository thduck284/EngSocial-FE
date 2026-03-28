import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getVocabNotes,
  addVocabNote,
  deleteVocabNote,
} from '../../utils/vocabularyUserStorage'

/** Độ dài tối đa phần xem trước trong danh sách; dài hơn thì có nút xem chi tiết */
const PREVIEW_MAX_CHARS = 220
const PREVIEW_MAX_LINES = 5

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
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [savedHint, setSavedHint] = useState('')
  const [detailNote, setDetailNote] = useState(null)
  const [composerOpen, setComposerOpen] = useState(false)

  const refresh = () => setNotes(getVocabNotes())

  useEffect(() => {
    refresh()
  }, [])

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
    <div className="max-w-3xl mx-auto w-full">
      {/* Thẻ tóm tắt — bấm vào mở modal thêm ghi chú */}
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
        className="bg-white/80 dark:bg-[#1f2e36]/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 cursor-pointer transition-all hover:border-purple-400/50 dark:hover:border-purple-500/40 hover:shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">note_alt</span>
              {t('vocabulary.notesTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {t('vocabulary.notesIntro')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
              {t('vocabulary.notesOpenComposerHint')}
            </p>
          </div>
          <span
            className="material-symbols-outlined text-gray-400 dark:text-gray-500 shrink-0 text-2xl"
            aria-hidden
          >
            edit_note
          </span>
        </div>
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold pointer-events-none">
          <span className="material-symbols-outlined text-lg" aria-hidden>
            add
          </span>
          {t('vocabulary.notesAddNote')}
        </div>
      </div>

      {savedHint && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-3 text-center sm:text-left">{savedHint}</p>
      )}

      <div className="mt-10">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          {t('vocabulary.notesSavedList', { count: notes.length })}
        </h3>
        {notes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
            {t('vocabulary.notesEmpty')}
          </p>
        ) : (
          <ul className="space-y-3">
            {notes.map((n) => {
              const { preview, truncated } = buildNotePreview(n.content)
              const displayBody = preview || t('vocabulary.dash')
              return (
                <li
                  key={n.id}
                  className="bg-white dark:bg-[#1f2e36] rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-3"
                >
                  <div className="min-w-0 flex-1">
                    {n.title ? (
                      <p className="font-semibold text-gray-900 dark:text-white">{n.title}</p>
                    ) : null}
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm mt-1 line-clamp-5">
                      {displayBody}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(n.createdAt).toLocaleString(dateLocale)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {truncated ? (
                      <button
                        type="button"
                        onClick={() => setDetailNote(n)}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {t('vocabulary.notesViewDetail')}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        deleteVocabNote(n.id)
                        if (detailNote?.id === n.id) setDetailNote(null)
                        refresh()
                      }}
                      className="text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      {t('vocabulary.delete')}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Modal thêm ghi chú */}
      {composerOpen ? (
        <div
          className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vocab-note-composer-title"
          onClick={closeComposer}
        >
          <div
            className="bg-white dark:bg-[#1f2e36] rounded-2xl shadow-2xl w-full max-w-lg max-h-[min(90vh,720px)] flex flex-col border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 shrink-0 flex items-start justify-between gap-3">
              <div>
                <h3
                  id="vocab-note-composer-title"
                  className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-primary">note_alt</span>
                  {t('vocabulary.notesTitle')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('vocabulary.notesIntro')}
                </p>
              </div>
              <button
                type="button"
                onClick={closeComposer}
                className="shrink-0 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={t('vocabulary.notesCloseDetail')}
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('vocabulary.notesTitlePlaceholder')}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('vocabulary.notesContentPlaceholder')}
                rows={5}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y min-h-[140px]"
              />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeComposer}
                className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:opacity-95"
              >
                {t('vocabulary.notesSave')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {detailNote ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vocab-note-detail-title"
          onClick={closeDetail}
        >
          <div
            className="bg-white dark:bg-[#1f2e36] rounded-2xl shadow-2xl w-full max-w-lg max-h-[min(85vh,640px)] flex flex-col border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <h3
                id="vocab-note-detail-title"
                className="text-lg font-bold text-gray-900 dark:text-white pr-8"
              >
                {detailNote.title?.trim() ? detailNote.title : t('vocabulary.notesTitle')}
              </h3>
            </div>
            <div className="p-5 overflow-y-auto flex-1 min-h-0">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                {detailNote.content?.trim() ? detailNote.content : t('vocabulary.dash')}
              </p>
              <p className="text-xs text-gray-400 mt-4">
                {new Date(detailNote.createdAt).toLocaleString(dateLocale)}
              </p>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDetail}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:opacity-95"
              >
                {t('vocabulary.notesCloseDetail')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
