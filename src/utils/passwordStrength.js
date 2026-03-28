/** Cùng quy tắc với validatePassword: ít nhất 1 chữ thường, 1 hoa, 1 số */
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/

/**
 * @param {string} [password]
 * @returns {{ bars: number, hintKey: string | null }} bars: 0–4
 */
export function getPasswordStrengthMeta(password) {
  const s = password ?? ''
  if (!s) return { bars: 0, hintKey: null }
  if (s.length < 4) return { bars: 1, hintKey: 'auth.passwordStrengthHintShort' }
  if (s.length < 8) return { bars: 2, hintKey: 'auth.passwordStrengthHintMinLength' }
  if (!PASSWORD_RULE.test(s)) return { bars: 2, hintKey: 'auth.passwordStrengthHintRule' }
  if (s.length >= 12 || /[^A-Za-z0-9]/.test(s)) return { bars: 4, hintKey: 'auth.passwordStrengthHintStrong' }
  return { bars: 3, hintKey: 'auth.passwordStrengthHintGood' }
}
