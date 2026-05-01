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
          ? 'max-w-[1440px] mx-auto px-6 lg:px-10 pt-2 pb-6 min-h-[min(920px,calc(100dvh-7rem))] flex flex-col overflow-hidden'
          : 'max-w-[1440px] mx-auto px-6 lg:px-10 pt-2 pb-6 h-[calc(100vh-80px)] overflow-hidden flex flex-col'
      }
    >
      <div className="mb-3 shrink-0 rounded-[1.5rem] border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark px-6 py-4 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary/5 dark:from-primary/10 to-transparent pointer-events-none" />
        
        <div className="flex items-start gap-6 relative z-10">
          <div className="hidden sm:flex size-14 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 items-center justify-center shadow-lg transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-4xl text-amber-500 dark:text-amber-300 drop-shadow-sm dark:drop-shadow-[0_0_18px_rgba(250,204,21,0.65)]">
              emoji_events
            </span>
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">
              {t('header.achievements')}
            </h1>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-300/80 max-w-2xl">
              {t('achievementsPage.subtitle')}
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2 text-right">
            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
              {t('achievementsPage.categoryCount', {
                count: (activeCategory?.items || []).length,
                defaultValue: `${(activeCategory?.items || []).length} Achievements`,
              })}
            </span>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-300/60 uppercase tracking-[0.2em]">
              {t('achievementsPage.currentCategory', {
                title: activeCategory?.title || '',
                defaultValue: `Category: ${activeCategory?.title || ''}`,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-11 gap-3">
        <section className="lg:col-span-5 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-[1.5rem] p-5 space-y-4 h-full min-h-0 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col">
          <div className="flex flex-col gap-4 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {activeCategory?.title ||
                  t('achievementsPage.listTitle', { defaultValue: 'Achievements' })}
              </h2>
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-background-dark/50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 shadow-inner">
                <span className="material-symbols-outlined text-lg text-amber-500 dark:text-amber-400">
                  stars
                </span>
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

        <section className="lg:col-span-6 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-950 dark:to-black border border-slate-200 dark:border-border-dark rounded-[1.5rem] p-5 h-full min-h-0 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-y-auto overflow-x-hidden custom-scrollbar">
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

