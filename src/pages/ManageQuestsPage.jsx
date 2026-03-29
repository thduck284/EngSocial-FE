import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useManageQuestForm } from '../hooks/useManageQuestForm'
import { ROUTES } from '../constants'

export function ManageQuestsPage() {
  const { t } = useTranslation()
  const { id, userId } = useParams()
  const listPath = userId != null && userId !== '' ? ROUTES.MANAGE_QUESTS(userId) : ROUTES.QUESTS
  const { form, setForm, error, loading, loadingQuest, isEdit, save } = useManageQuestForm(id, t)

  if (loadingQuest) {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link to={ROUTES.QUESTS} className="hover:text-primary transition-colors">{t('manageQuests.back')}</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-gray-400">{t('manageQuests.questsLabel')}</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{isEdit ? t('manageQuests.editQuest') : t('manageQuests.addQuest')}</h1>
        </div>
        <button type="button" onClick={save} disabled={loading || loadingQuest} className="px-6 py-2.5 rounded-xl bg-primary text-background-dark font-bold hover:opacity-90 disabled:opacity-50 transition-all">
          {loading ? t('manageQuests.saving') : isEdit ? t('manageQuests.update') : t('manageQuests.saveQuest')}
        </button>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-card-dark rounded-2xl border border-border-dark">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-primary">flag</span>
            {t('manageQuests.questInfo')}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">{t('manageQuests.title')} <span className="text-red-500">*</span></label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('manageQuests.titlePlaceholder')}
                type="text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">{t('manageQuests.description')}</label>
              <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white resize-none outline-none focus:ring-2 focus:ring-primary" placeholder={t('manageQuests.descriptionPlaceholder')} rows={2} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('manageQuests.type')}</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary">
                  <option value="one_time">{t('manageQuests.typeOneTime')}</option>
                  <option value="daily">{t('manageQuests.typeDaily')}</option>
                  <option value="weekly">{t('manageQuests.typeWeekly')}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Target</label>
                <input
                  type="number"
                  min={1}
                  value={form.condition?.target ?? 1}
                  onChange={(e) => setForm({
                    ...form,
                    condition: { ...form.condition, target: +e.target.value || 1 },
                  })}
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary"
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('manageQuests.xpReward')}</label>
                <input type="number" min={0} value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: +e.target.value || 50 })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('manageQuests.icon')}</label>
                <input value={form.icon || 'flag'} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary" placeholder={t('manageQuests.iconPlaceholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Skill</label>
                <select
                  value={form.condition?.filters?.skill || 'all'}
                  onChange={(e) => setForm({
                    ...form,
                    condition: {
                      ...form.condition,
                      filters: { ...(form.condition?.filters || {}), skill: e.target.value },
                    },
                  })}
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">all</option>
                  <option value="reading">Reading</option>
                  <option value="listening">Listening</option>
                  <option value="writing">Writing</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                <select
                  value={form.condition?.filters?.category || 'all'}
                  onChange={(e) => setForm({
                    ...form,
                    condition: {
                      ...form.condition,
                      filters: { ...(form.condition?.filters || {}), category: e.target.value },
                    },
                  })}
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">all</option>
                  <option value="lesson">lesson</option>
                  <option value="practice">practice</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Min progress</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.condition?.filters?.minProgress ?? 100}
                  onChange={(e) => setForm({
                    ...form,
                    condition: {
                      ...form.condition,
                      filters: { ...(form.condition?.filters || {}), minProgress: +e.target.value || 0 },
                    },
                  })}
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Min score percent</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.condition?.filters?.minScorePercent ?? 0}
                  onChange={(e) => setForm({
                    ...form,
                    condition: {
                      ...form.condition,
                      filters: { ...(form.condition?.filters || {}), minScorePercent: +e.target.value || 0 },
                    },
                  })}
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('manageQuests.status')}</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary">
                  <option value="active">{t('manageQuests.statusActive')}</option>
                  <option value="archived">{t('manageQuests.statusArchived')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('manageQuests.order')}</label>
                <input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: +e.target.value || 0 })} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary" />
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
          {t('manageQuests.saveQuestBtn')}
        </button>
      </div>
    </div>
  )
}
