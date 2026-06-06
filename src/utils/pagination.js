/** Trang hiển thị trên thanh phân trang (có ellipsis khi nhiều trang). */
export function getVisiblePageNumbers(current, total) {
  if (total <= 1) return [1]
  if (total <= 9) return Array.from({ length: total }, (_, i) => i + 1)

  const raw = new Set([1, total])
  for (let i = current - 2; i <= current + 2; i += 1) {
    if (i >= 1 && i <= total) raw.add(i)
  }
  const sorted = [...raw].sort((a, b) => a - b)
  const out = []
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('…')
    out.push(sorted[i])
  }
  return out
}
