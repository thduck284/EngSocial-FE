import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { wordScrambleService } from '../services/wordScramble.service'
import { AlertModal } from '../components/ui/common/AlertModal'

/** Cùng chiều cao với input / nút (36px) */
const selectClass =
  'w-full h-9 min-h-9 box-border bg-background-dark border border-border-dark rounded-lg px-2.5 py-0 text-xs leading-none text-white outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/40 transition-shadow appearance-none cursor-pointer bg-[length:0.875rem] bg-[right_0.5rem_center] bg-no-repeat pr-8'

const controlBtnClass =
  'h-9 min-h-9 box-border shrink-0 inline-flex items-center justify-center gap-1.5 px-3 rounded-lg text-xs font-bold leading-none'

const selectChevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")"

const FILE_ACCEPT = '.txt,.tsv,.md,.json,text/plain,text/markdown,application/json'

/**
 * @param {string} rawJson
 * @returns {string} TSV with header word, meaning, example, difficulty, topic
 */
function jsonWordListToTsv(rawJson) {
  let data
  try {
    data = JSON.parse(rawJson.replace(/^\uFEFF/, '').trim())
  } catch {
    const err = new Error('INVALID_JSON')
    throw err
  }
  const rows = Array.isArray(data) ? data : data?.words ?? data?.items
  if (!Array.isArray(rows)) {
    const err = new Error('INVALID_JSON_SHAPE')
    throw err
  }
  const esc = (s) =>
    String(s ?? '')
      .replace(/\t/g, ' ')
      .replace(/\r?\n/g, ' ')
      .trim()
  const header = 'word\tmeaning\texample\tdifficulty\ttopic'
  const lines = [header]
  for (const r of rows) {
    if (!r || typeof r !== 'object') continue
    const w = esc(r.word)
    const m = esc(r.meaning ?? r.mean)
    if (!w || !m) continue
    lines.push([w, m, esc(r.example), esc(r.difficulty), esc(r.topic)].join('\t'))
  }
  if (lines.length <= 1) {
    const err = new Error('EMPTY_JSON_ROWS')
    throw err
  }
  return lines.join('\n')
}

/**
 * @param {File} file
 * @returns {Promise<string>}
 */
async function readFileAsImportTsv(file) {
  const text = await file.text()
  const name = file.name.toLowerCase()
  if (name.endsWith('.json') || file.type === 'application/json') {
    return jsonWordListToTsv(text)
  }
  return text
}

function tsvCell(s) {
  return String(s ?? '')
    .replace(/\t/g, ' ')
    .replace(/\r?\n/g, ' ')
}

function wordsToTsv(rows) {
  const lines = ['word\tmeaning\texample\tdifficulty\ttopic']
  for (const r of rows) {
    lines.push(
      [tsvCell(r.word), tsvCell(r.meaning), tsvCell(r.example), tsvCell(r.difficulty), tsvCell(r.topic)].join('\t'),
    )
  }
  return lines.join('\n')
}

function csvCell(s) {
  const v = String(s ?? '')
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`
  return v
}

function wordsToCsv(rows) {
  const lines = ['word,meaning,example,difficulty,topic']
  for (const r of rows) {
    lines.push([csvCell(r.word), csvCell(r.meaning), csvCell(r.example), csvCell(r.difficulty), csvCell(r.topic)].join(','))
  }
  return lines.join('\n')
}

function wordsToJson(rows) {
  const data = rows.map((r) => ({
    word: r.word,
    meaning: r.meaning,
    example: r.example || '',
    difficulty: r.difficulty,
    topic: r.topic || '',
  }))
  return `${JSON.stringify(data, null, 2)}\n`
}

function wordsToMd(rows) {
  let s = '| word | meaning | example | difficulty | topic |\n| --- | --- | --- | --- | --- |\n'
  for (const r of rows) {
    const c = (x) => String(x ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')
    s += `| ${c(r.word)} | ${c(r.meaning)} | ${c(r.example)} | ${c(r.difficulty)} | ${c(r.topic)} |\n`
  }
  return s
}

function downloadFile(filename, body, mime) {
  const blob = new Blob([body], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function ManageWordScramblePage() {
  const { t } = useTranslation()
  const fileRef = useRef(null)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterDiff, setFilterDiff] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [importing, setImporting] = useState(false)
  const [importSummary, setImportSummary] = useState(null)
  const exportMenuRef = useRef(null)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isBulkDelete, setIsBulkDelete] = useState(false)
  const limit = 50

  const fetchList = useCallback(
    async (forPage) => {
      setLoading(true)
      setError('')
      try {
        const res = await wordScrambleService.listWords({
          page: forPage,
          limit,
          ...(filterDiff ? { difficulty: filterDiff } : {}),
          ...(appliedSearch.trim() ? { q: appliedSearch.trim() } : {}),
          includeInactive: true,
        })
        const data = res?.data
        setItems(data?.items || [])
        setTotal(data?.total ?? 0)
      } catch (e) {
        setError(e?.message || t('manageWordScramble.loadFailed'))
        setItems([])
      } finally {
        setLoading(false)
      }
    },
    [limit, filterDiff, appliedSearch, t],
  )

  const load = useCallback(() => fetchList(page), [fetchList, page])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!exportMenuOpen) return
    const onDown = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [exportMenuOpen])

  const fetchAllWordsUnfiltered = useCallback(async () => {
    const out = []
    const batchLimit = 500
    let p = 1
    for (;;) {
      const res = await wordScrambleService.listWords({ page: p, limit: batchLimit, includeInactive: true })
      const data = res?.data
      const batch = data?.items || []
      out.push(...batch)
      if (batch.length < batchLimit) break
      p += 1
    }
    return out
  }, [])

  const onExportFormat = async (format) => {
    setExportMenuOpen(false)
    setError('')
    setExporting(true)
    try {
      const rows = await fetchAllWordsUnfiltered()
      if (rows.length === 0) {
        setError(t('manageWordScramble.exportEmpty'))
        return
      }
      const utf8 = 'charset=utf-8'
      if (format === 'tsv') {
        downloadFile('word-scramble.tsv', wordsToTsv(rows), `text/tab-separated-values;${utf8}`)
      } else if (format === 'txt') {
        downloadFile('word-scramble.txt', wordsToTsv(rows), `text/plain;${utf8}`)
      } else if (format === 'json') {
        downloadFile('word-scramble.json', wordsToJson(rows), `application/json;${utf8}`)
      } else if (format === 'csv') {
        downloadFile('word-scramble.csv', wordsToCsv(rows), `text/csv;${utf8}`)
      } else if (format === 'md') {
        downloadFile('word-scramble.md', wordsToMd(rows), `text/markdown;${utf8}`)
      }
    } catch (e) {
      setError(e?.message || t('manageWordScramble.exportFailed'))
    } finally {
      setExporting(false)
    }
  }

  const onDeleteAll = () => {
    setIsBulkDelete(true)
    setItemToDelete({ title: 'ALL' }) // dummy to open modal
  }

  const handleConfirmDeleteAll = async () => {
    setIsBulkDelete(false)
    setItemToDelete(null)
    setError('')
    setDeletingAll(true)
    try {
      await wordScrambleService.deleteAllWords()
      setImportSummary(null)
      setPage(1)
      await fetchList(1)
    } catch (e) {
      setError(e?.message || e?.data?.message || t('manageWordScramble.deleteAllFailed'))
    } finally {
      setDeletingAll(false)
    }
  }

  const runImport = async (rawTsv) => {
    const raw = rawTsv.trim()
    if (!raw) return
    setImporting(true)
    setError('')
    setImportSummary(null)
    try {
      const res = await wordScrambleService.importTsv(raw)
      const summary = res?.data?.summary
      setImportSummary(summary || null)
      setPage(1)
      await fetchList(1)
    } catch (e) {
      setError(e?.message || e?.data?.message || t('manageWordScramble.importFailed'))
    } finally {
      setImporting(false)
    }
  }

  const onFileSelected = async (fileList) => {
    const file = fileList?.[0]
    if (!file) return
    try {
      const tsv = await readFileAsImportTsv(file)
      await runImport(tsv)
    } catch (e) {
      const key = e?.message
      if (key === 'INVALID_JSON' || key === 'INVALID_JSON_SHAPE') {
        setError(t('manageWordScramble.uploadInvalidJson'))
      } else if (key === 'EMPTY_JSON_ROWS') {
        setError(t('manageWordScramble.uploadEmptyJson'))
      } else {
        setError(e?.message || t('manageWordScramble.importFailed'))
      }
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const onDelete = (id) => {
    setIsBulkDelete(false)
    setItemToDelete({ id })
  }

  const handleConfirmDeleteSingle = async () => {
    if (!itemToDelete) return
    const { id } = itemToDelete
    setItemToDelete(null)
    setError('')
    try {
      await wordScrambleService.deleteWord(id)
      await fetchList(page)
    } catch (e) {
      setError(e?.message || t('manageWordScramble.deleteFailed'))
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const rangeFrom = total === 0 ? 0 : (page - 1) * limit + 1
  const rangeTo = Math.min(page * limit, total)

  const applySearch = () => {
    setPage(1)
    setAppliedSearch(searchInput.trim())
  }

  const hasActiveFilters = filterDiff !== '' || searchInput.trim() !== '' || appliedSearch.trim() !== ''

  const clearFilters = () => {
    setFilterDiff('')
    setSearchInput('')
    setAppliedSearch('')
    setPage(1)
  }

  const emptyMessage =
    !loading && total > 0 && items.length === 0
      ? t('manageWordScramble.listNoMatches')
      : t('manageWordScramble.empty')

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {error ? (
        <div className="mb-4 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      ) : null}

      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-white">{t('manageWordScramble.title')}</h1>
        <p className="text-xs text-gray-500 mt-1 w-full max-w-6xl leading-relaxed">{t('manageWordScramble.subtitleUpload')}</p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={FILE_ACCEPT}
        className="hidden"
        onChange={(e) => onFileSelected(e.target.files)}
      />

      {importSummary ? (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 space-y-1">
          <p className="font-semibold text-emerald-100">{t('manageWordScramble.importTsvResult')}</p>
          <ul className="text-xs text-emerald-200/90 list-disc list-inside space-y-0.5">
            <li>{t('manageWordScramble.importTsvUpserted', { n: importSummary.upserted ?? 0 })}</li>
            <li>{t('manageWordScramble.importTsvModified', { n: importSummary.modified ?? 0 })}</li>
            <li>{t('manageWordScramble.importTsvMatched', { n: importSummary.matched ?? 0 })}</li>
            <li>{t('manageWordScramble.importTsvRows', { n: importSummary.rowsInFile ?? 0 })}</li>
            <li>{t('manageWordScramble.importTsvValid', { n: importSummary.validForWrite ?? 0 })}</li>
          </ul>
          {importSummary.rowErrors?.length > 0 ? (
            <details className="mt-2 text-xs text-amber-200/90">
              <summary className="cursor-pointer">
                {t('manageWordScramble.importTsvErrors', { n: importSummary.rowErrors.length })}
              </summary>
              <ul className="mt-1 max-h-32 overflow-y-auto font-mono text-[11px] text-amber-100/80">
                {importSummary.rowErrors.map((e, i) => (
                  <li key={i}>
                    L{e.line}: {e.word} — {e.reason}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-lg border border-border-dark bg-card-dark/80 p-2.5 sm:p-3 mb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-x-2 sm:gap-y-2">
          <div className="w-full sm:w-[8.5rem] shrink-0 flex flex-col gap-1">
            <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500 leading-none min-h-[14px]">
              {t('manageWordScramble.filterDifficulty')}
            </label>
            <select
              value={filterDiff}
              onChange={(e) => {
                setFilterDiff(e.target.value)
                setPage(1)
              }}
              className={selectClass}
              style={{ backgroundImage: selectChevron }}
            >
              <option value="">{t('manageWordScramble.all')}</option>
              <option value="easy">{t('enter.game.diffEasyShort')}</option>
              <option value="medium">{t('enter.game.diffMediumShort')}</option>
              <option value="hard">{t('enter.game.diffHardShort')}</option>
            </select>
          </div>
          <div className="flex flex-1 min-w-0 flex-col gap-1">
            <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500 leading-none min-h-[14px] sm:max-w-[calc(100%-12rem)]">
              {t('manageWordScramble.search')}
            </label>
            <div className="flex flex-1 min-w-0 flex-wrap items-center gap-1.5">
              <div className="relative flex-1 min-w-[min(100%,140px)]">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-[18px] leading-none pointer-events-none">
                  search
                </span>
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') applySearch()
                  }}
                  placeholder={t('manageWordScramble.searchPlaceholder')}
                  className="h-9 min-h-9 w-full box-border bg-background-dark border border-border-dark rounded-lg pl-9 pr-8 py-0 text-xs leading-normal text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40"
                />
                {searchInput ? (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex size-6 items-center justify-center rounded-md text-gray-500 hover:bg-white/10 hover:text-white"
                    aria-label={t('common.cancel')}
                  >
                    <span className="material-symbols-outlined text-[18px] leading-none">close</span>
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={applySearch}
                className={`${controlBtnClass} bg-white/10 text-white hover:bg-white/15`}
              >
                {t('common.search')}
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={importing || loading}
                title={t('manageWordScramble.uploadFormatsHint')}
                className={`${controlBtnClass} border border-cyan-500/35 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/15 disabled:opacity-40`}
              >
                <span className="material-symbols-outlined text-[18px] leading-none">upload_file</span>
                {importing ? t('common.loading') : t('manageWordScramble.uploadBtn')}
              </button>
              <div className="relative shrink-0" ref={exportMenuRef}>
                <button
                  type="button"
                  onClick={() => setExportMenuOpen((o) => !o)}
                  disabled={exporting || loading}
                  className={`${controlBtnClass} border border-border-dark text-gray-300 hover:bg-white/5 hover:text-white disabled:opacity-40`}
                  aria-expanded={exportMenuOpen}
                  aria-haspopup="menu"
                >
                  <span className="material-symbols-outlined text-[18px] leading-none">download</span>
                  {exporting ? t('common.loading') : t('manageWordScramble.exportBtn')}
                </button>
              {exportMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.25rem)] z-50 min-w-[9.5rem] rounded-lg border border-border-dark bg-[#12181f] py-1 shadow-xl shadow-black/40"
                >
                  {(['tsv', 'txt', 'json', 'csv', 'md']).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      role="menuitem"
                      onClick={() => onExportFormat(fmt)}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-200 hover:bg-white/10 hover:text-white"
                    >
                      {t(`manageWordScramble.exportFormat_${fmt}`)}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
              <button
                type="button"
                onClick={onDeleteAll}
                disabled={loading || deletingAll || total === 0}
                className={`${controlBtnClass} border border-red-500/35 bg-red-500/10 text-red-300 hover:bg-red-500/15 disabled:opacity-40`}
              >
                <span className="material-symbols-outlined text-[18px] leading-none">delete_sweep</span>
                {deletingAll ? t('common.loading') : t('manageWordScramble.deleteAllBtn')}
              </button>
            </div>
          </div>
          {hasActiveFilters ? (
            <div className="flex items-end justify-end gap-2 sm:ml-auto sm:flex-nowrap pb-px">
              <button
                type="button"
                onClick={clearFilters}
                className={`${controlBtnClass} text-[11px] text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10`}
              >
                <span className="material-symbols-outlined text-[18px] leading-none">restart_alt</span>
                {t('manageWordScramble.clearFilters')}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-border-dark bg-card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-border-dark">
                <th className="px-4 py-3 text-gray-400 text-xs uppercase tracking-wide font-semibold">
                  {t('manageWordScramble.fieldWord')}
                </th>
                <th className="px-4 py-3 text-gray-400 text-xs uppercase tracking-wide font-semibold">
                  {t('manageWordScramble.fieldMeaning')}
                </th>
                <th className="px-4 py-3 text-gray-400 text-xs uppercase tracking-wide font-semibold">
                  {t('manageWordScramble.fieldDifficulty')}
                </th>
                <th className="px-4 py-3 text-gray-400 text-xs uppercase tracking-wide font-semibold">
                  {t('manageWordScramble.fieldTopic')}
                </th>
                <th className="px-4 py-3 text-gray-400 text-xs uppercase tracking-wide text-right font-semibold">
                  {t('manageLessons.colActions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-gray-500">
                    <span className="material-symbols-outlined animate-spin text-3xl text-primary inline-block align-middle">
                      progress_activity
                    </span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-border-dark/80 hover:bg-white/[0.02] ${row.isActive ? '' : 'opacity-50'}`}
                  >
                    <td className="px-4 py-3 font-mono text-cyan-300 font-medium">{row.word}</td>
                    <td className="px-4 py-3 text-gray-300 max-w-[220px]">
                      <span className="line-clamp-2" title={row.meaning}>
                        {row.meaning}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 capitalize">{row.difficulty}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-[140px]">
                      <span className="line-clamp-2">{row.topic || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onDelete(row.id)}
                        className="p-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title={t('manageWordScramble.delete')}
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && total > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-border-dark bg-background-dark/40">
            <p className="text-xs text-gray-500">
              <span className="text-gray-400 font-medium">
                {t('manageWordScramble.paginationRange', { from: rangeFrom, to: rangeTo, total })}
              </span>
              <span className="mx-2 text-border-dark">·</span>
              <span>{t('manageWordScramble.perPage', { n: limit })}</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 mr-1">
                {t('manageWordScramble.paginationPage', { current: page, total: totalPages })}
              </span>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-border-dark text-gray-300 hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
                {t('manageWordScramble.pagePrev')}
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-border-dark text-gray-300 hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                {t('manageWordScramble.pageNext')}
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <AlertModal
        open={!!itemToDelete}
        title={t('quests.delete')}
        message={isBulkDelete ? t('manageWordScramble.confirmDeleteAll') : t('manageWordScramble.confirmDelete')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        onClose={() => {
          setItemToDelete(null)
          setIsBulkDelete(false)
        }}
        onConfirm={isBulkDelete ? handleConfirmDeleteAll : handleConfirmDeleteSingle}
      />
    </div>
  )
}
