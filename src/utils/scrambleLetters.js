/** Xáo chữ cái cho Word Scramble (tránh trùng thứ tự với từ gốc khi có thể). */
export function scrambleLetters(word) {
  const arr = String(word || '').split('')
  if (arr.length < 2) return String(word || '').toUpperCase()
  let shuffled
  let guard = 0
  do {
    shuffled = [...arr]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    guard++
  } while (shuffled.join('') === word && guard < 50)
  return shuffled.join('').toUpperCase()
}
