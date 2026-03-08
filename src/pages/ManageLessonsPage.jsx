import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lessonsService, uploadService } from '../services'
import { ROUTES } from '../constants'

const defaultForm = (category = 'lesson') => ({
  title: '',
  slug: '',
  skill: 'reading',
  level: 'A1',
  topic: '',
  description: '',
  thumbnail: '',
  status: 'draft',
  category,
  estimatedTime: 15,
  xpReward: 50,
  time: '10m',
  practiceType: '',
  length: '',
  order: 0,
  content: { text: '' },
  questions: [],
  vocabulary: [],
})

const LEVEL_KEYS = { A1: 'levelA1', A2: 'levelA2', B1: 'levelB1', B2: 'levelB2', C1: 'levelC1', C2: 'levelC2' }

export function ManageLessonsPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isEdit = !!id
  const isPractice = location.pathname.includes('/manage/skills')
  const category = isPractice ? 'practice' : 'lesson'

  const [form, setForm] = useState(() => defaultForm(category))
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingLesson, setLoadingLesson] = useState(isEdit)
  const [uploading, setUploading] = useState(false)
  const [vocabQuickText, setVocabQuickText] = useState('')
  const [showScriptModal, setShowScriptModal] = useState(false)
  const [scriptModalValue, setScriptModalValue] = useState('')

  useEffect(() => {
    if (!isEdit) setForm(defaultForm(category))
  }, [category, isEdit])

  useEffect(() => {
    if (!id) return
    setLoadingLesson(true)
    lessonsService
      .getById(id)
      .then((res) => {
        const d = res?.data
        if (!d) return
        const content = d.content || { text: '' }
        if (d.accent && !content.accent) content.accent = d.accent
        setForm({
          title: d.title ?? '',
          slug: d.slug ?? '',
          skill: d.skill || 'reading',
          level: d.level || 'A1',
          topic: d.topic ?? '',
          description: d.description ?? '',
          thumbnail: d.thumbnail ?? '',
          status: d.status || 'draft',
          category: d.category || category,
          estimatedTime: d.estimatedTime ?? 15,
          xpReward: d.xpReward ?? 50,
          time: d.time || '10m',
          practiceType: d.practiceType ?? d.type ?? '',
          length: d.length ?? '',
          order: d.order ?? 0,
          content,
          questions: Array.isArray(d.questions) ? d.questions : [],
          vocabulary: Array.isArray(d.vocabulary) ? d.vocabulary : [],
        })
      })
      .catch(() => setError(t('manageLessons.saveFailed')))
      .finally(() => setLoadingLesson(false))
  }, [id, category, t])

  const onFileChange = async (e, field) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadService.uploadAsset(file)
      if (field === 'content.audioUrl') {
        setForm((f) => (f ? { ...f, content: { ...f.content, audioUrl: url } } : f))
      } else {
        setForm((f) => (f ? { ...f, [field]: url } : f))
      }
    } catch (e) {
      setError(e.message || t('manageLessons.uploadFailed'))
    } finally {
      setUploading(false)
    }
  }

  const setContent = (key, value) => {
    setForm((f) => (f ? { ...f, content: { ...f.content, [key]: value } } : f))
  }
  const setChapter = (index, key, value) => {
    const ch = [...(form.content?.chapters || [])]
    if (!ch[index]) ch[index] = { id: `ch-${index}`, label: '', time: '', startTime: 0 }
    ch[index] = { ...ch[index], [key]: key === 'startTime' ? +value || 0 : value }
    setForm((f) => (f ? { ...f, content: { ...f.content, chapters: ch } } : f))
  }
  const addChapter = () => {
    const ch = [...(form.content?.chapters || []), { id: `ch-${(form.content?.chapters?.length || 0)}`, label: '', time: '0:00', startTime: 0 }]
    setForm((f) => (f ? { ...f, content: { ...f.content, chapters: ch } } : f))
  }
  const removeChapter = (i) => setForm((f) => (f ? { ...f, content: { ...f.content, chapters: (f.content?.chapters || []).filter((_, idx) => idx !== i) } } : f))
  const setVocab = (index, key, value) => {
    const v = [...(form.vocabulary || [])]
    if (!v[index]) v[index] = {}
    v[index] = { ...v[index], [key]: value }
    setForm((f) => (f ? { ...f, vocabulary: v } : f))
  }
  const addVocab = () => setForm((f) => (f ? { ...f, vocabulary: [...(f.vocabulary || []), {}] } : f))
  const removeVocab = (i) => setForm((f) => (f ? { ...f, vocabulary: (f.vocabulary || []).filter((_, idx) => idx !== i) } : f))
  const addVocabBulk = () => {
    const lines = vocabQuickText.split(/\n/).map((s) => s.trim()).filter(Boolean)
    const newItems = lines.map((line) => {
      const sep = line.includes(' - ') ? ' - ' : line.includes('\t') ? '\t' : ','
      const idx = line.indexOf(sep)
      const word = idx >= 0 ? line.slice(0, idx).trim() : line
      const meaning = idx >= 0 ? line.slice(idx + sep.length).trim() : ''
      return { word, meaning }
    }).filter((v) => v.word)
    if (newItems.length === 0) return
    setForm((f) => (f ? { ...f, vocabulary: [...(f.vocabulary || []), ...newItems] } : f))
    setVocabQuickText('')
  }
  const addQuestionsBulk = (n) => {
    const base = (form.questions || []).length
    const newQs = Array.from({ length: n }, (_, i) => ({
      id: `q-${base + i}`,
      question: '',
      type: 'multiple_choice',
      options: [{ value: 'A', text: '' }, { value: 'B', text: '' }],
      correctAnswer: '',
      explanation: '',
      points: 10,
    }))
    setForm((f) => (f ? { ...f, questions: [...(f.questions || []), ...newQs] } : f))
  }

  const setQuestion = (index, key, value) => {
    const q = [...(form.questions || [])]
    if (!q[index]) q[index] = { id: `q-${index}`, question: '', type: 'multiple_choice', options: [{ value: 'A', text: '' }, { value: 'B', text: '' }], correctAnswer: '', explanation: '', points: 10 }
    const next = { ...q[index], [key]: key === 'points' ? (value === '' ? 10 : +value || 10) : value }
    if (key === 'type' && value === 'multiple_choice' && (!next.options || next.options.length === 0)) next.options = [{ value: 'A', text: '' }, { value: 'B', text: '' }]
    q[index] = next
    setForm((f) => (f ? { ...f, questions: q } : f))
  }
  const addQuestion = () => {
    const q = [...(form.questions || []), { id: `q-${form.questions?.length || 0}`, question: '', type: 'multiple_choice', options: [{ value: 'A', text: '' }, { value: 'B', text: '' }], correctAnswer: '', explanation: '', points: 10 }]
    setForm((f) => (f ? { ...f, questions: q } : f))
  }
  const removeQuestion = (i) => setForm((f) => (f ? { ...f, questions: (f.questions || []).filter((_, idx) => idx !== i) } : f))
  const setQuestionOption = (qIndex, optIndex, key, value) => {
    const q = [...(form.questions || [])]
    if (!q[qIndex]?.options) q[qIndex] = { ...q[qIndex], options: [] }
    const opts = [...(q[qIndex].options || [])]
    if (!opts[optIndex]) opts[optIndex] = { value: '', text: '' }
    opts[optIndex] = { ...opts[optIndex], [key]: value }
    q[qIndex] = { ...q[qIndex], options: opts }
    setForm((f) => (f ? { ...f, questions: q } : f))
  }
  const addQuestionOption = (qIndex) => {
    const q = [...(form.questions || [])]
    const opts = [...(q[qIndex]?.options || []), { value: String.fromCharCode(65 + (q[qIndex]?.options?.length || 0)), text: '' }]
    q[qIndex] = { ...q[qIndex], options: opts }
    setForm((f) => (f ? { ...f, questions: q } : f))
  }
  const removeQuestionOption = (qIndex, optIndex) => {
    const q = [...(form.questions || [])]
    const opts = (q[qIndex]?.options || []).filter((_, i) => i !== optIndex)
    q[qIndex] = { ...q[qIndex], options: opts }
    setForm((f) => (f ? { ...f, questions: q } : f))
  }

  const save = async (statusOverride) => {
    if (!form?.title) return
    setError('')
    setSuccessMessage('')
    setLoading(true)
    const payload = statusOverride ? { ...form, status: statusOverride } : { ...form }
    if (payload.estimatedTime != null) payload.time = `${payload.estimatedTime}m`
    if (Array.isArray(payload.questions)) payload.totalQuestions = payload.questions.length
    try {
      if (isEdit) {
        await lessonsService.update(id, payload)
        if (isPractice) {
          setSuccessMessage(t('manageLessons.practiceUpdated'))
          setTimeout(() => navigate(ROUTES.SKILLS.READING), 1500)
        } else {
          setSuccessMessage(t('manageLessons.lessonUpdated'))
          setTimeout(() => navigate(ROUTES.LESSONS), 1500)
        }
      } else {
        await lessonsService.create(payload)
        if (isPractice) {
          setSuccessMessage(t('manageLessons.practiceAdded'))
          setTimeout(() => navigate(ROUTES.SKILLS.READING), 1500)
        } else {
          navigate(ROUTES.LESSONS)
        }
      }
    } catch (e) {
      setError(e.message || t('manageLessons.saveFailed'))
    } finally {
      setLoading(false)
    }
  }

  const backLink = isPractice ? ROUTES.SKILLS.READING : ROUTES.LESSONS
  const pageTitle = isEdit
    ? (isPractice ? t('manageLessons.editPractice') : t('manageLessons.editLesson'))
    : (isPractice ? t('manageLessons.pageTitleAddPractice') : t('manageLessons.pageTitleAddLesson'))

  if (loadingLesson) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 flex justify-center items-center min-h-[200px]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      {error && (
        <div className="mb-6 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-6 py-3 px-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined">check_circle</span>
          {successMessage}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link to={backLink} className="hover:text-primary transition-colors">{t('manageLessons.back')}</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-gray-400">{isPractice ? t('manageLessons.skillsLabel') : t('manageLessons.lessonsLabel')}</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{pageTitle}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => save('draft')} disabled={loading} className="px-5 py-2.5 rounded-xl border border-border-dark font-medium hover:bg-white/5 transition-all text-gray-400 disabled:opacity-50">
            {t('manageLessons.saveDraft')}
          </button>
          <button type="button" onClick={() => save('published')} disabled={loading} className="px-6 py-2.5 rounded-xl bg-primary text-background-dark font-bold hover:opacity-90 transition-all disabled:opacity-50">
            {isPractice ? t('manageLessons.publishPractice') : t('manageLessons.publishLesson')}
          </button>
        </div>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-8" onSubmit={(e) => e.preventDefault()}>
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-card-dark rounded-2xl border border-border-dark shadow-sm">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-primary">description</span>
              {t('manageLessons.basicInfo')}
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('manageLessons.title')} <span className="text-red-500">*</span></label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-white"
                  placeholder={t('manageLessons.titlePlaceholder')}
                  type="text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('manageLessons.slug')}</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-border-dark bg-white/5 text-gray-400 text-sm">/lessons/</span>
                  <input value={form.slug || ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="flex-1 bg-background-dark border border-border-dark rounded-r-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary" placeholder={t('manageLessons.slugPlaceholder')} type="text" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('manageLessons.shortDesc')}</label>
                <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white resize-none outline-none focus:ring-2 focus:ring-primary" placeholder={t('manageLessons.shortDescPlaceholder')} rows={3} />
              </div>
            </div>
          </div>

          {form.skill === 'reading' && (
            <div className="p-6 bg-card-dark rounded-2xl border border-border-dark">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-primary">menu_book</span>
                {t('manageLessons.readingContent')}
              </h2>
              <textarea value={form.content?.text || ''} onChange={(e) => setContent('text', e.target.value)} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white min-h-[200px] outline-none focus:ring-2 focus:ring-primary" placeholder={t('manageLessons.readingContentPlaceholder')} rows={10} />
              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-2">{t('manageLessons.translationVi')}</label>
                <textarea value={form.content?.translationVi || ''} onChange={(e) => setContent('translationVi', e.target.value)} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white min-h-[120px] outline-none focus:ring-2 focus:ring-primary resize-none" placeholder={t('manageLessons.translationViPlaceholder')} rows={5} />
              </div>
              <div className="mt-4 pt-4 border-t border-border-dark">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">{t('manageLessons.vocabularyOptional')}</h3>
                {(form.vocabulary || []).map((v, i) => (
                  <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 p-2 rounded-lg bg-background-dark/50">
                    <input value={v.word || ''} onChange={(e) => setVocab(i, 'word', e.target.value)} placeholder={t('manageLessons.word')} className="bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white" />
                    <input value={v.meaning || ''} onChange={(e) => setVocab(i, 'meaning', e.target.value)} placeholder={t('manageLessons.meaning')} className="bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white md:col-span-2" />
                    <button type="button" onClick={() => removeVocab(i)} className="text-red-400 text-sm">{t('manageLessons.delete')}</button>
                  </div>
                ))}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                <button type="button" onClick={addVocab} className="text-primary text-sm font-medium">{t('manageLessons.addVocab')}</button>
                <span className="text-gray-500 text-xs">|</span>
                <span className="text-xs text-gray-500">{t('manageLessons.vocabQuickAdd')}:</span>
                <textarea value={vocabQuickText} onChange={(e) => setVocabQuickText(e.target.value)} placeholder={t('manageLessons.vocabQuickAddPlaceholder')} className="flex-1 min-w-[200px] h-20 bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 resize-none" />
                <button type="button" onClick={addVocabBulk} disabled={!vocabQuickText.trim()} className="px-3 py-1.5 bg-primary/20 text-primary text-xs font-medium rounded-lg hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed">
                  {t('manageLessons.vocabQuickAddBtn')}
                </button>
              </div>
              </div>
            </div>
          )}

          {form.skill === 'listening' && (
            <div className="p-6 bg-card-dark rounded-2xl border border-border-dark space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-primary">headset</span>
                {t('manageLessons.listeningContent')}
              </h2>
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t('manageLessons.audioFile')}</label>
                <label className="flex flex-col items-center justify-center p-6 rounded-xl bg-background-dark border-2 border-dashed border-border-dark hover:border-primary/50 cursor-pointer">
                  <input type="file" accept="audio/*" onChange={(e) => onFileChange(e, 'content.audioUrl')} disabled={uploading} className="hidden" />
                  {form.content?.audioUrl ? <span className="text-primary">{t('manageLessons.audioUploaded')}</span> : <span className="text-gray-400">{uploading ? t('manageLessons.uploading') : t('manageLessons.clickUploadAudio')}</span>}
                </label>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-400">{t('manageLessons.transcript')}</label>
                  <button
                    type="button"
                    onClick={() => {
                      setScriptModalValue(form.content?.transcript || '')
                      setShowScriptModal(true)
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-primary border border-primary/40 hover:bg-primary/10"
                  >
                    <span className="material-symbols-outlined text-base">open_in_full</span>
                    {t('manageLessons.scriptExpand')}
                  </button>
                </div>
                <textarea value={form.content?.transcript || ''} onChange={(e) => setContent('transcript', e.target.value)} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white min-h-[100px] resize-none outline-none focus:ring-2 focus:ring-primary" placeholder={t('manageLessons.transcriptPlaceholder')} rows={4} />
              </div>
              {showScriptModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowScriptModal(false)}>
                  <div className="bg-card-dark border border-border-dark rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 border-b border-border-dark flex justify-between items-center">
                      <span className="text-sm font-semibold text-white">{t('manageLessons.scriptModalTitle')}</span>
                      <button type="button" onClick={() => setShowScriptModal(false)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-background-dark">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                    <div className="flex-1 overflow-hidden p-4">
                      <textarea
                        value={scriptModalValue}
                        onChange={(e) => setScriptModalValue(e.target.value)}
                        className="w-full h-full min-h-[60vh] bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white resize-none outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                        placeholder={t('manageLessons.transcriptPlaceholder')}
                        autoFocus
                      />
                    </div>
                    <div className="p-4 border-t border-border-dark flex justify-end gap-2">
                      <button type="button" onClick={() => setShowScriptModal(false)} className="px-4 py-2 rounded-xl text-sm border border-border-dark text-gray-400 hover:bg-background-dark">
                        {t('manageLessons.cancel')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setContent('transcript', scriptModalValue)
                          setShowScriptModal(false)
                        }}
                        className="px-4 py-2 rounded-xl text-sm bg-primary text-white hover:bg-primary/90"
                      >
                        {t('manageLessons.apply')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('manageLessons.durationSeconds')}</label>
                  <input type="number" value={form.content?.duration ?? ''} onChange={(e) => setContent('duration', e.target.value ? +e.target.value : undefined)} className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white" placeholder="180" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('manageLessons.accent')}</label>
                  <select value={form.content?.accent || ''} onChange={(e) => setContent('accent', e.target.value)} className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white">
                    <option value="">—</option>
                    <option value="american">American</option>
                    <option value="british">British</option>
                    <option value="australian">Australian</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-400">{t('manageLessons.chaptersTime')}</label>
                  <button type="button" onClick={addChapter} className="text-primary text-sm">{t('manageLessons.addChapter')}</button>
                </div>
                {(form.content?.chapters || []).map((ch, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={ch.label || ''} onChange={(e) => setChapter(i, 'label', e.target.value)} placeholder={t('manageLessons.labelPlaceholder')} className="flex-1 bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white" />
                    <input value={ch.time || ''} onChange={(e) => setChapter(i, 'time', e.target.value)} placeholder="0:00" className="w-20 bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white" />
                    <button type="button" onClick={() => removeChapter(i)} className="text-red-400 p-2"><span className="material-symbols-outlined text-sm">close</span></button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border-dark">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">{t('manageLessons.vocabularyOptional')}</h3>
                {(form.vocabulary || []).map((v, i) => (
                  <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 p-2 rounded-lg bg-background-dark/50">
                    <input value={v.word || ''} onChange={(e) => setVocab(i, 'word', e.target.value)} placeholder={t('manageLessons.word')} className="bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white" />
                    <input value={v.meaning || ''} onChange={(e) => setVocab(i, 'meaning', e.target.value)} placeholder={t('manageLessons.meaning')} className="bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white md:col-span-2" />
                    <button type="button" onClick={() => removeVocab(i)} className="text-red-400 text-sm">{t('manageLessons.delete')}</button>
                  </div>
                ))}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <button type="button" onClick={addVocab} className="text-primary text-sm font-medium">{t('manageLessons.addVocab')}</button>
                  <span className="text-gray-500 text-xs">|</span>
                  <span className="text-xs text-gray-500">{t('manageLessons.vocabQuickAdd')}:</span>
                  <textarea value={vocabQuickText} onChange={(e) => setVocabQuickText(e.target.value)} placeholder={t('manageLessons.vocabQuickAddPlaceholder')} className="flex-1 min-w-[200px] h-20 bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 resize-none" />
                  <button type="button" onClick={addVocabBulk} disabled={!vocabQuickText.trim()} className="px-3 py-1.5 bg-primary/20 text-primary text-xs font-medium rounded-lg hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed">
                    {t('manageLessons.vocabQuickAddBtn')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {form.skill === 'writing' && (
            <div className="p-6 bg-card-dark rounded-2xl border border-border-dark space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-primary">edit_note</span>
                {t('manageLessons.writingContent')}
              </h2>
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t('manageLessons.prompt')}</label>
                <textarea value={form.content?.prompt || ''} onChange={(e) => setContent('prompt', e.target.value)} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white min-h-[80px] resize-none outline-none focus:ring-2 focus:ring-primary" placeholder={t('manageLessons.promptPlaceholder')} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('manageLessons.wordLimitMin')}</label>
                  <input type="number" value={form.content?.wordLimit?.min ?? ''} onChange={(e) => setContent('wordLimit', { ...form.content?.wordLimit, min: e.target.value ? +e.target.value : undefined })} className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white" placeholder="100" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('manageLessons.wordLimitMax')}</label>
                  <input type="number" value={form.content?.wordLimit?.max ?? ''} onChange={(e) => setContent('wordLimit', { ...form.content?.wordLimit, max: e.target.value ? +e.target.value : undefined })} className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white" placeholder="150" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t('manageLessons.sampleAnswer')}</label>
                <textarea value={form.content?.sampleAnswer || ''} onChange={(e) => setContent('sampleAnswer', e.target.value)} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white min-h-[80px] resize-none outline-none focus:ring-2 focus:ring-primary" placeholder={t('manageLessons.sampleAnswerPlaceholder')} rows={3} />
              </div>
            </div>
          )}

          {(form.skill === 'reading' || form.skill === 'listening') && (
            <div className="p-6 bg-card-dark rounded-2xl border border-border-dark">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-primary">quiz</span>
                {t('manageLessons.questionsSection')}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <p className="text-xs text-gray-500 mr-2">{t('manageLessons.questionsHint')}</p>
                <span className="text-gray-500 text-xs">|</span>
                <span className="text-xs text-gray-500">{t('manageLessons.addQuestionsBulk')}:</span>
                <button type="button" onClick={() => addQuestionsBulk(3)} className="px-3 py-1.5 bg-primary/20 text-primary text-xs font-medium rounded-lg hover:bg-primary/30">
                  {t('manageLessons.add3Questions')}
                </button>
                <button type="button" onClick={() => addQuestionsBulk(5)} className="px-3 py-1.5 bg-primary/20 text-primary text-xs font-medium rounded-lg hover:bg-primary/30">
                  {t('manageLessons.add5Questions')}
                </button>
              </div>
              {(form.questions || []).map((q, qi) => (
                <div key={qi} className="mb-6 p-4 rounded-xl bg-background-dark/50 border border-border-dark">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="text-xs font-bold text-gray-400">#{qi + 1}</span>
                    <button type="button" onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-300 text-sm">{t('manageLessons.delete')}</button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">{t('manageLessons.questionText')}</label>
                      <input value={q.question || ''} onChange={(e) => setQuestion(qi, 'question', e.target.value)} className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white" placeholder="e.g. What is the main idea?" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">{t('manageLessons.questionType')}</label>
                        <select value={q.type || 'multiple_choice'} onChange={(e) => setQuestion(qi, 'type', e.target.value)} className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white">
                          <option value="multiple_choice">{t('manageLessons.questionTypeMultiple')}</option>
                          <option value="true_false">{t('manageLessons.questionTypeTrueFalse')}</option>
                          <option value="fill_blank">{t('manageLessons.questionTypeFillBlank')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">{t('manageLessons.points')}</label>
                        <input type="number" min={1} value={q.points ?? 10} onChange={(e) => setQuestion(qi, 'points', e.target.value)} className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white" />
                      </div>
                    </div>
                    {(q.type === 'multiple_choice' && (q.options || []).length > 0) && (
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">{t('manageLessons.option')}</label>
                        {(q.options || []).map((opt, oi) => (
                          <div key={oi} className="flex gap-2 mb-2">
                            <input value={opt.value || ''} onChange={(e) => setQuestionOption(qi, oi, 'value', e.target.value)} placeholder="A" className="w-10 bg-background-dark border border-border-dark rounded-lg px-2 py-1.5 text-sm text-white" />
                            <input value={opt.text || ''} onChange={(e) => setQuestionOption(qi, oi, 'text', e.target.value)} placeholder="Answer text" className="flex-1 bg-background-dark border border-border-dark rounded-lg px-3 py-1.5 text-sm text-white" />
                            <button type="button" onClick={() => removeQuestionOption(qi, oi)} className="text-red-400 p-1"><span className="material-symbols-outlined text-sm">close</span></button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addQuestionOption(qi)} className="text-primary text-xs mt-1">{t('manageLessons.addOption')}</button>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">{t('manageLessons.correctAnswer')}</label>
                      {q.type === 'true_false' ? (
                        <select value={q.correctAnswer || ''} onChange={(e) => setQuestion(qi, 'correctAnswer', e.target.value)} className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white">
                          <option value="">—</option>
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      ) : (
                        <input value={q.correctAnswer ?? ''} onChange={(e) => setQuestion(qi, 'correctAnswer', e.target.value)} className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white" placeholder={q.type === 'multiple_choice' ? 'e.g. A' : 'Correct answer'} />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">{t('manageLessons.explanation')}</label>
                      <input value={q.explanation || ''} onChange={(e) => setQuestion(qi, 'explanation', e.target.value)} className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white" placeholder="Optional" />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addQuestion} className="text-primary text-sm font-medium">{t('manageLessons.addQuestion')}</button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-card-dark rounded-2xl border border-border-dark">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">{t('manageLessons.thumbnail')}</h2>
            <label className="aspect-video rounded-xl bg-background-dark border-2 border-dashed border-border-dark flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 block overflow-hidden">
              <input type="file" accept="image/*" onChange={(e) => onFileChange(e, 'thumbnail')} disabled={uploading} className="hidden" />
              {form.thumbnail ? <img src={form.thumbnail} alt="" className="w-full h-full object-cover" /> : (
                <div className="flex flex-col items-center text-gray-400 p-4">
                  <span className="material-symbols-outlined text-4xl mb-2">cloud_upload</span>
                  <span className="text-sm">{t('manageLessons.clickUploadImage')}</span>
                </div>
              )}
            </label>
          </div>
          <div className="p-6 bg-card-dark rounded-2xl border border-border-dark space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">{t('manageLessons.classification')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5 uppercase">{t('manageLessons.skill')}</label>
                <select value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary">
                  <option value="reading">Reading</option>
                  <option value="listening">Listening</option>
                  <option value="writing">Writing</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase">{t('manageLessons.level')}</label>
                <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary">
                  {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lv) => <option key={lv} value={lv}>{lv} - {t(`manageLessons.${LEVEL_KEYS[lv]}`)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase">{t('manageLessons.topic')}</label>
                <input value={form.topic || ''} onChange={(e) => setForm({ ...form, topic: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary" placeholder={t('manageLessons.topicPlaceholder')} type="text" />
              </div>
            </div>
            {isPractice && (
              <>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase">{t('manageLessons.practiceType')}</label>
                  <p className="text-[10px] text-gray-500 mb-1">{t('manageLessons.practiceTypeHint')}</p>
                  <input value={form.practiceType || ''} onChange={(e) => setForm({ ...form, practiceType: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-white" placeholder={t('manageLessons.practiceTypePlaceholder')} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase">{t('manageLessons.length')}</label>
                  <p className="text-[10px] text-gray-500 mb-1">{t('manageLessons.lengthHint')}</p>
                  <input value={form.length || ''} onChange={(e) => setForm({ ...form, length: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-white" placeholder={t('manageLessons.lengthPlaceholder')} />
                </div>
              </>
            )}
            <div className="pt-2">
              <label className="block text-xs text-gray-400 mb-1.5 uppercase">{t('manageLessons.xpAndTime')}</label>
              <p className="text-[10px] text-gray-500 mb-2">{t('manageLessons.xpAndTimeHint')}</p>
              <div className="flex justify-between items-center p-3 bg-background-dark/50 rounded-xl border border-border-dark mb-2">
                <span className="text-sm text-gray-400">{t('manageLessons.xpReward')}</span>
                <input type="number" min={0} value={form.xpReward ?? 50} onChange={(e) => setForm({ ...form, xpReward: +e.target.value || 50 })} className="w-16 bg-transparent border-none text-right text-white font-bold focus:ring-0" />
              </div>
              <div className="flex justify-between items-center p-3 bg-background-dark/50 rounded-xl border border-border-dark">
                <span className="text-sm text-gray-400">{t('manageLessons.minutes')}</span>
                <input type="number" min={1} value={form.estimatedTime ?? 15} onChange={(e) => setForm({ ...form, estimatedTime: +e.target.value || 15 })} className="w-16 bg-transparent border-none text-right text-white font-bold focus:ring-0" />
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="mt-8 flex justify-between pt-6 border-t border-border-dark">
        <Link to={backLink} className="px-6 py-3 rounded-xl border border-border-dark font-medium hover:bg-white/5 text-gray-400 transition-all">
          {t('manageLessons.cancel')}
        </Link>
        <button type="button" onClick={() => save(form.status)} disabled={loading} className="px-8 py-3 rounded-xl bg-primary text-background-dark font-bold hover:opacity-90 disabled:opacity-50 transition-all">
          {t('manageLessons.save')}
        </button>
      </div>
    </div>
  )
}
