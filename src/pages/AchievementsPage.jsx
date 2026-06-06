import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext.jsx'
import { CategoryDropdown } from '../components/achievements/CategoryDropdown'
import { AchievementsList } from '../components/achievements/AchievementsList'
import { AchievementDetails } from '../components/achievements/AchievementDetails'
import { AchievementFormModal } from '../components/achievements/AchievementFormModal'
import { useAchievementsCatalog } from '../hooks/useAchievementsCatalog'

/** @param {{ embedded?: boolean }} props — embedded: trong khu /mod/:userId (không có AppHeader) */
export function AchievementsPage({ embedded = false }) {
  const { t, i18n } = useTranslation()
  const { isModerator } = useAuth()
  /** Trang /achievements: admin như user; quản catalog trong /mod/.../achievements (moderator). */
  const canManage = isModerator

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

    addModalSuggestions,

    editOpen,
    setEditOpen,
    editForm,
    setEditForm,
    openEditForAchievement,
    saveEditAchievement,

    deleteActiveAchievement,
    goToAchievementLink,
  } = useAchievementsCatalog(t, i18n.language)

  return (
    <main
      className={
        embedded
          ? 'max-w-[1440px] mx-auto p-6 min-h-[min(920px,calc(100dvh-7rem))] flex flex-col overflow-hidden'
          : 'max-w-[1440px] mx-auto p-6 h-[calc(100vh-80px)] overflow-hidden flex flex-col'
      }
    >
      <div className="mb-4 shrink-0 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark px-5 py-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex size-10 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl text-amber-500">emoji_events</span>
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('header.achievements')}</h1>
            <p className="text-xs text-slate-500 dark:text-gray-400 max-w-2xl">{t('achievementsPage.subtitle')}</p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-0.5 text-right shrink-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {t('achievementsPage.categoryCount', {
                count: (activeCategory?.items || []).length,
                defaultValue: `${(activeCategory?.items || []).length} Achievements`,
              })}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-gray-400">
              {t('achievementsPage.currentCategory', {
                title: activeCategory?.title || '',
                defaultValue: `Category: ${activeCategory?.title || ''}`,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-11 gap-6">
        <section className="lg:col-span-5 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 space-y-4 h-full min-h-0 shadow-sm overflow-hidden flex flex-col">
          <div className="flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {activeCategory?.title ||
                  t('achievementsPage.listTitle', { defaultValue: 'Achievements' })}
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:text-gray-400">
                <span className="material-symbols-outlined text-sm text-amber-500">stars</span>
                {t('achievementsPage.categoryCount', {
                  count: (activeCategory?.items || []).length,
                  defaultValue: `${(activeCategory?.items || []).length} items`,
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
          </div>



          <div className="flex-1 min-h-0 overflow-hidden">
            <AchievementsList
              t={t}
              items={activeCategory?.items || []}
              activeId={activeAchievementId}
              onSelect={setActiveAchievementId}
            />
          </div>
        </section>

        <section className="lg:col-span-6 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 h-full min-h-0 shadow-sm overflow-y-auto overflow-x-hidden custom-scrollbar">
          <AchievementDetails
            t={t}
            achievement={achievement}
            category={!achievement ? activeCategory : undefined}
            onGoToLink={goToAchievementLink}
            onEdit={canManage ? openEditForAchievement : undefined}
            onDelete={canManage ? deleteActiveAchievement : undefined}
            canManage={canManage}
          />
        </section>
      </div>

      {canManage ? (
        <AchievementFormModal
          open={editOpen}
          title={t('achievementsPage.editAchievement', {
            defaultValue: 'Edit Achievement',
          })}
          subtitle={`Category: ${activeCategory?.title || ''}`}
          accent="amber"
          form={editForm}
          setForm={setEditForm}
          onClose={() => setEditOpen(false)}
          onSubmit={saveEditAchievement}
          submitText={t('achievementsPage.submitSave', { defaultValue: 'Save Changes' })}
          variant="edit"
          locale={i18n.language}
          suggestions={addModalSuggestions}
        />
      ) : null}
    </main>
  )
}

