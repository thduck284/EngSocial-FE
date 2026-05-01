export function DashboardSectionHeader({ icon, title, rightSlot = null, className = '' }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2 min-w-0">
        {icon ? (
          <span className="material-symbols-outlined text-primary dark:text-[#58d1ec] text-lg shrink-0">
            {icon}
          </span>
        ) : null}
        <h3 className="font-bold text-sm text-slate-900 dark:text-[#e0f1f6] truncate">{title}</h3>
      </div>
      {rightSlot}
    </div>
  )
}
