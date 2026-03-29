import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { challengesService } from '../services'
import { ROUTES } from '../constants'

function toDateInput(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString().slice(0, 10)
}

export function ManageChallengesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id, userId } = useParams()
  const isEdit = Boolean(id)
  const listPath = userId != null && userId !== '' ? ROUTES.MANAGE_CHALLENGES(userId) : ROUTES.QUESTS
  const [loading, setLoading] = useState(false)
  const [loadingChallenge, setLoadingChallenge] = useState(isEdit)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    title: '',
    titleVi: '',
    description: '',
    descriptionVi: '',
    type: 'weekly',
    skill: 'all',
    requirement: { type: 'lessons', target: 5 },
    xpReward: 100,
    startDate: toDateInput(new Date()),
    endDate: toDateInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    status: 'active',
    icon: 'emoji_events',
    color: '#22C55E',
  })

  useEffect(() => {
    if (!isEdit) return
    setLoadingChallenge(true)
    challengesService
      .getById(id)
      .then((res) => {
        const c = res?.data?.challenge ?? res?.challenge ?? res?.data
        if (!c) return
        setForm({
          title: c.title ?? '',
          titleVi: c.titleVi ?? '',
          description: c.description ?? '',
          descriptionVi: c.descriptionVi ?? '',
          type: c.type ?? 'weekly',
          skill: c.skill ?? 'all',
          requirement: {
            type: c.requirement?.type ?? 'lessons',
            target: c.requirement?.target ?? 5,
          },
          xpReward: c.xpReward ?? 100,
          startDate: toDateInput(c.startDate),
          endDate: toDateInput(c.endDate),
          status: c.status ?? 'active',
          icon: c.icon ?? 'emoji_events',
          color: c.color ?? '#22C55E',
        })
      })
      .catch(() => setError(t('common.loadFailed')))
      .finally(() => setLoadingChallenge(false))
  }, [id, isEdit, t])

  const save = async () => {
    setError(null)
    if (!form.title?.trim()) {
      setError(t('manageQuests.title') + ' is required')
      return
    }
    setLoading(true)
    try {
      const body = {
        ...form,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      }
      if (isEdit) {
        await challengesService.update(id, body)
      } else {
        await challengesService.create(body)
      }
      navigate(listPath)
    } catch (e) {
      setError(e?.message || t('common.saveFailed'))
    } finally {
      setLoading(false)
    }
  }

  if (loadingChallenge) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 flex justify-center items-center min-h-[200px]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {error && (
        <div className="mb-6 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link to={listPath} className="hover:text-primary transition-colors">{t('manageQuests.back')}</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-gray-400">{t('manageChallenges.listTitle')}</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            {isEdit ? t('manageChallenges.editChallenge') : t('manageChallenges.addChallenge')}
          </h1>
        </div>
        <button type="button" onClick={save} disabled={loading || loadingChallenge} className="px-4 py-2 rounded-lg bg-primary text-background-dark text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all">
          {loading ? t('manageQuests.saving') : isEdit ? t('manageQuests.update') : t('manageChallenges.saveNew')}
        </button>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-card-dark rounded-2xl border border-border-dark">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-primary">emoji_events</span>
            Challenge info
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">{t('manageQuests.title')} <span className="text-red-500">*</span></label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary" placeholder="Challenge title" type="text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Title (VI)</label>
              <input value={form.titleVi || ''} onChange={(e) => setForm({ ...form, titleVi: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary" placeholder="Tiêu đề (tiếng Việt)" type="text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">{t('manageQuests.description')}</label>
              <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white resize-none outline-none focus:ring-2 focus:ring-primary" placeholder="Description" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Description (VI)</label>
              <textarea value={form.descriptionVi || ''} onChange={(e) => setForm({ ...form, descriptionVi: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white resize-none outline-none focus:ring-2 focus:ring-primary" placeholder="Mô tả (tiếng Việt)" rows={2} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary">
                  <option value="special">One-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('manageQuests.skill')}</label>
                <select value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary">
                  <option value="all">{t('manageQuests.skillAll')}</option>
                  <option value="reading">Reading</option>
                  <option value="listening">Listening</option>
                  <option value="writing">Writing</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Requirement type</label>
                <select value={form.requirement?.type} onChange={(e) => setForm({ ...form, requirement: { ...form.requirement, type: e.target.value } })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary">
                  <option value="lessons">Lessons</option>
                  <option value="time">Time (min)</option>
                  <option value="score">Score/XP</option>
                  <option value="streak">Streak (days)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Target</label>
                <input type="number" min={0} value={form.requirement?.target ?? 0} onChange={(e) => setForm({ ...form, requirement: { ...form.requirement, target: +e.target.value || 0 } })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('manageQuests.xpReward')}</label>
                <input type="number" min={0} value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: +e.target.value || 0 })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Icon</label>
                <input value={form.icon || ''} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary" placeholder="emoji_events" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Start date</label>
                <input type="date" value={form.startDate || ''} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">End date</label>
                <input type="date" value={form.endDate || ''} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary">
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Color</label>
                <input type="text" value={form.color || ''} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary" placeholder="#22C55E" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between pt-6 border-t border-border-dark">
        <Link to={listPath} className="px-4 py-2 rounded-lg border border-border-dark text-sm font-medium hover:bg-white/5 text-gray-400 transition-all">
          {t('manageQuests.cancel')}
        </Link>
        <button type="button" onClick={save} disabled={loading} className="px-6 py-2 rounded-lg bg-primary text-background-dark text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all">
          {loading ? t('manageQuests.saving') : isEdit ? t('manageQuests.update') : t('manageChallenges.saveNew')}
        </button>
      </div>
    </div>
  )
}
