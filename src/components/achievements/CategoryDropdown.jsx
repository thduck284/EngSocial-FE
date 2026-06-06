export function CategoryDropdown({
  categories,
  activeCategoryId,
  activeCategoryTitle,
  open,
  setOpen,
  dropdownRef,
  onSelectCategory,
}) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-50 shadow-sm hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/70 transition-colors flex items-center gap-2"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-[18px] text-primary dark:text-sky-300">
          category
        </span>
        <span className="truncate">{activeCategoryTitle}</span>
        <span className="ml-auto material-symbols-outlined text-[20px] text-slate-400 dark:text-slate-300">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark shadow-sm animate-in fade-in zoom-in duration-200"
        >
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {categories.map((c) => {
              const active = c.id === activeCategoryId
              return (
                <button
                  key={c.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onSelectCategory(c.id)
                    setOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 border-b border-slate-100 dark:border-border-dark last:border-b-0 transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-background-dark/60'
                  }`}
                >
                  <span className={`inline-flex size-6 items-center justify-center rounded-full border text-[10px] font-bold ${
                    active 
                      ? 'border-primary/30 bg-primary/20 text-primary' 
                      : 'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/70 text-slate-500 dark:text-slate-200'
                  }`}>
                    {c.title?.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">
                      {c.title}
                    </div>
                    {c.description ? (
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 italic">
                        {c.description}
                      </div>
                    ) : null}
                  </div>
                  {active && (
                    <span className="material-symbols-outlined text-sm text-primary dark:text-sky-400">check</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

