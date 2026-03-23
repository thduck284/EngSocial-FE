import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext.jsx'
import { CategoryDropdown } from '../components/achievements/CategoryDropdown'
import { AchievementsList } from '../components/achievements/AchievementsList'
import { AchievementDetails } from '../components/achievements/AchievementDetails'
import { AchievementFormModal } from '../components/achievements/AchievementFormModal'
import { useAchievementsCatalog } from '../hooks/useAchievementsCatalog'

export function AchievementsPage() {
  const { t } = useTranslation()
  const { isModerator, isAdmin } = useAuth()
  const canManage = isModerator || isAdmin

  const {
    categories,
    activeCategoryId,
    activeCategory,
    achievement,
    activeAchievementId,

    categoryOpen,
    setCategoryOpen,
    categoryRef,
    selectCategory,

    setActiveAchievementId,

    addOpen,
    setAddOpen,
    addForm,
    setAddForm,
    addAchievementToActiveCategory,

    editOpen,
    setEditOpen,
    editForm,
    setEditForm,
    openEditForAchievement,
    saveEditAchievement,

    deleteActiveAchievement,
    goToAchievementLink,
  } = useAchievementsCatalog()

  return (
    <main className="max-w-[1400px] mx-auto px-4 lg:px-10 py-4 h-[calc(100vh-80px)] overflow-hidden flex flex-col">
      <div className="mb-3 shrink-0 rounded-2xl border border-primary/25 bg-gradient-to-r from-indigo-500/20 via-sky-500/10 to-emerald-400/10 px-5 py-4 lg:px-7 lg:py-5 shadow-[0_18px_60px_rgba(15,23,42,0.65)]">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex size-11 rounded-2xl bg-black/40 border border-white/10 items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-3xl text-amber-300 drop-shadow-[0_0_18px_rgba(250,204,21,0.65)]">
              emoji_events
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-black/30 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-sky-200">
                {t('achievementsPage.badgeLabel', { defaultValue: 'Achievements' })}
              </span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
              {t('header.achievements')}
            </h1>
            <p className="mt-1 text-[13px] lg:text-sm text-slate-200/80">
              {t('achievementsPage.subtitle')}
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-1 text-right text-[11px] text-slate-200/80">
            <span className="font-semibold">
              {t('achievementsPage.categoryCount', {
                count: (activeCategory?.items || []).length,
                defaultValue: `${(activeCategory?.items || []).length} thành tựu`,
              })}
            </span>
            <span className="text-slate-300/70">
              {t('achievementsPage.currentCategory', {
                title: activeCategory?.title || '',
                defaultValue: `Danh mục: ${activeCategory?.title || ''}`,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-11 gap-4">
        <section className="lg:col-span-5 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-3 h-full min-h-0 shadow-[0_18px_40px_rgba(15,23,42,0.85)] overflow-hidden">
          <div className="flex flex-col gap-2 mb-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-50">
                {activeCategory?.title ||
                  t('achievementsPage.listTitle', { defaultValue: 'Achievements' })}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/90 bg-slate-900/80 px-2.5 py-0.5 text-[11px] text-slate-300">
                <span className="material-symbols-outlined text-[15px] text-amber-300">
                  stars
                </span>
                {t('achievementsPage.categoryCount', {
                  count: (activeCategory?.items || []).length,
                  defaultValue: `${(activeCategory?.items || []).length} thành tựu`,
                })}
              </span>
            </div>

            <CategoryDropdown
              categories={categories}
              activeCategoryId={activeCategoryId}
              activeCategoryTitle={activeCategory?.title}
              open={categoryOpen}
              setOpen={setCategoryOpen}
              dropdownRef={categoryRef}
              onSelectCategory={selectCategory}
            />

            {canManage ? (
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="w-full rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-2.5 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/20 hover:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add_circle
                </span>
                {t('achievementsPage.addAchievement', {
                  defaultValue: 'Thêm achievement',
                })}
              </button>
            ) : null}
          </div>

          <p className="text-[11px] text-slate-400 mb-2">
            {t('achievementsPage.listHint', {
              defaultValue:
                'Chọn một achievement trong danh sách để xem chi tiết và phần thưởng.',
            })}
          </p>

          <AchievementsList
            t={t}
            items={activeCategory?.items || []}
            activeId={activeAchievementId}
            onSelect={setActiveAchievementId}
          />
        </section>

        <section className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-slate-950 to-black border border-slate-800/80 rounded-2xl p-5 h-full min-h-0 shadow-[0_24px_60px_rgba(15,23,42,0.9)] overflow-hidden">
          <AchievementDetails
            t={t}
            achievement={achievement}
            onGoToLink={goToAchievementLink}
            onEdit={canManage ? openEditForAchievement : undefined}
            onDelete={canManage ? deleteActiveAchievement : undefined}
            canManage={canManage}
          />
        </section>
      </div>

      {canManage && (
        <>
          <AchievementFormModal
            open={addOpen}
            title={t('achievementsPage.addAchievement', {
              defaultValue: 'Thêm achievement',
            })}
            subtitle={`Danh mục: ${activeCategory?.title || ''}`}
            accent="emerald"
            form={addForm}
            setForm={setAddForm}
            onClose={() => setAddOpen(false)}
            onSubmit={addAchievementToActiveCategory}
            submitText="Thêm"
          />

          <AchievementFormModal
            open={editOpen}
            title={t('achievementsPage.editAchievement', {
              defaultValue: 'Chỉnh sửa achievement',
            })}
            subtitle={`Danh mục: ${activeCategory?.title || ''}`}
            accent="amber"
            form={editForm}
            setForm={setEditForm}
            onClose={() => setEditOpen(false)}
            onSubmit={saveEditAchievement}
            submitText="Lưu"
          />
        </>
      )}
    </main>
  )
}

