import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getVocabNotes,
  addVocabNote,
  deleteVocabNote,
} from '../../utils/vocabularyUserStorage'
import { AlertModal } from '../ui/common/AlertModal'
import { useAchievementSync } from '../../hooks/useAchievementSync'

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
    <div className="max-w-6xl mx-auto w-full px-4 mb-20">
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
        className="group relative bg-white/80 dark:bg-[#1f2e36]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 cursor-pointer transition-all hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-2xl outline-none mb-10 overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-3 flex items-center justify-center md:justify-start gap-4">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-4xl">note_alt</span>
              {t('vocabulary.notesTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base max-w-lg mb-4">
              {t('vocabulary.notesIntro')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {t('vocabulary.notesOpenComposerHint')}
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 active:scale-95 transition-all">
            <span className="material-symbols-outlined">add_circle</span>
            {t('vocabulary.notesAddNote')}
          </div>
        </div>
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
      </div>

      {savedHint && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-3 text-center sm:text-left animate-bounce">{savedHint}</p>
      )}

      <div className="mt-12 space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-black text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">description</span>
            {t('vocabulary.notesSavedList', { count: notes.length })}
          </h3>
          <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-white/10 to-transparent" />
        </div>

        {notes.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center bg-white/5 rounded-3xl border-2 border-dashed border-white/5">
            <span className="material-symbols-outlined text-6xl text-gray-700 mb-4">folder_open</span>
            <p className="text-gray-500 text-lg font-medium">
              {t('vocabulary.notesEmpty')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((n, idx) => {
              const { preview, truncated } = buildNotePreview(n.content)
              const displayBody = preview || t('vocabulary.dash')

              return (
                <div
                  key={n.id}
                  className="group relative bg-white/80 dark:bg-[#1f2e36]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 overflow-hidden"
                >
                  <div className="flex-1 min-w-0 flex flex-col gap-3 relative z-10">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                        {n.title || t('vocabulary.notesTitle')}
                      </h4>
                      <span className="material-symbols-outlined text-gray-400 transition-colors text-xl">push_pin</span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-wrap line-clamp-6 mb-2">
                      {displayBody}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 relative z-10">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                      {new Date(n.createdAt).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    
                    <div className="flex items-center gap-3">
                      {truncated && (
                        <button
                          type="button"
                          onClick={() => setDetailNote(n)}
                          className="size-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center hover:bg-gradient-to-r from-purple-600 to-pink-600 hover:text-white transition-all transform hover:scale-110 shadow-sm"
                          title={t('vocabulary.notesViewDetail')}
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setItemToDelete(n)
                        }}
                        className="size-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all transform hover:scale-110 shadow-sm"
                        title={t('vocabulary.delete')}
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                </div>
              )
            })}
          </div>
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
            className="bg-[#131f26] rounded-3xl shadow-2xl w-full max-w-lg max-h-[min(90vh,720px)] flex flex-col border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/5 shrink-0 flex items-start justify-between gap-3 bg-gradient-to-br from-[#131f26] to-[#0b1115]">
              <div>
                <h3
                  id="vocab-note-composer-title"
                  className="text-lg font-black text-white flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-purple-400">note_alt</span>
                  {t('vocabulary.notesTitle')}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {t('vocabulary.notesIntro')}
                </p>
              </div>
              <button
                type="button"
                onClick={closeComposer}
                className="shrink-0 p-2 rounded-xl text-gray-500 hover:bg-white/5 transition-colors"
                aria-label={t('vocabulary.notesCloseDetail')}
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('vocabulary.notesTitlePlaceholder')}
                className="w-full rounded-2xl border border-white/5 bg-[#0b1115]/50 px-5 py-3.5 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('vocabulary.notesContentPlaceholder')}
                rows={5}
                className="w-full rounded-2xl border border-white/5 bg-[#0b1115]/50 px-5 py-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none min-h-[160px]"
              />
            </div>
            <div className="p-5 border-t border-white/5 shrink-0 flex flex-wrap justify-end gap-3 bg-black/20">
              <button
                type="button"
                onClick={closeComposer}
                className="px-6 py-2.5 rounded-xl border border-white/5 text-gray-400 text-sm font-bold hover:bg-white/5 transition-all"
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
            className="bg-[#131f26] rounded-3xl shadow-2xl w-full max-w-lg max-h-[min(85vh,640px)] flex flex-col border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/5 shrink-0 bg-gradient-to-br from-[#131f26] to-[#0b1115] relative">
              <h3
                id="vocab-note-detail-title"
                className="text-lg font-black text-white pr-10"
              >
                {detailNote.title?.trim() ? detailNote.title : t('vocabulary.notesTitle')}
              </h3>
              <button
                type="button"
                onClick={closeDetail}
                className="absolute right-4 top-4 p-2 rounded-xl text-gray-500 hover:bg-white/5 transition-colors"
                aria-label={t('vocabulary.notesCloseDetail')}
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              <p className="text-gray-400 whitespace-pre-wrap text-sm leading-relaxed font-medium">
                {detailNote.content?.trim() ? detailNote.content : t('vocabulary.dash')}
              </p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-6">
                {new Date(detailNote.createdAt).toLocaleString(dateLocale)}
              </p>
            </div>
            <div className="p-5 border-t border-white/5 shrink-0 flex justify-end bg-black/20">
              <button
                type="button"
                onClick={closeDetail}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-black shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 active:scale-95 transition-all uppercase tracking-widest"
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
