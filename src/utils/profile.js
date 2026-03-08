/**
 * Format date for HTML input[type="date"] (YYYY-MM-DD)
 */
export function formatDateForInput(date) {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}
