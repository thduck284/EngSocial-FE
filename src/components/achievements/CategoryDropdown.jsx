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
        className="w-full rounded-xl border border-slate-700/90 bg-gradient-to-b from-slate-900/90 to-slate-950 px-3 py-2.5 text-sm font-semibold text-slate-50 shadow-[0_10px_30px_rgba(15,23,42,0.55)] hover:border-slate-500/80 focus:outline-none focus:ring-2 focus:ring-sky-500/70 transition-colors flex items-center gap-2"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-[18px] text-sky-300">
          category
        </span>
        <span className="truncate">{activeCategoryTitle}</span>
        <span className="ml-auto material-symbols-outlined text-[20px] text-slate-300">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
        >
          <div>
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
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-2 border-b border-slate-800/60 last:border-b-0 ${
                    active
                      ? 'bg-sky-500/15 text-sky-100'
                      : 'bg-slate-950 text-slate-100 hover:bg-slate-900/60'
                  }`}
                >
                  <span className="inline-flex size-6 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/70 text-[11px] text-slate-200">
                    {c.title?.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {c.title}
                    </div>
                    {c.description ? (
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {c.description}
                      </div>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

