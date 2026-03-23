export function DashboardCard({ className = '', children, ...rest }) {
  return (
    <div
      className={`bg-white dark:bg-[#111e22] rounded-xl border border-slate-200 dark:border-[#325a67] ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

