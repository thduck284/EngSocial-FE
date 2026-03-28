/** Ngày sinh tối đa = hôm nay (theo giờ local), không chọn tương lai */
export function getDobMaxIsoDateLocal() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

/** Ngày sinh tối thiểu: 120 năm trước (1/1 năm đó) */
export function getDobMinIsoDateLocal() {
  const n = new Date()
  n.setFullYear(n.getFullYear() - 120)
  return `${n.getFullYear()}-01-01`
}
