export function DashboardSectionHeader({ icon, title, rightSlot = null, className = '' }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2 min-w-0">
        {icon ? (
          <span className="material-symbols-outlined text-primary text-lg shrink-0">
            {icon}
          </span>
        ) : null}
        <h3 className="font-bold text-sm truncate">{title}</h3>
      </div>
      {rightSlot}
    </div>
  )
}

