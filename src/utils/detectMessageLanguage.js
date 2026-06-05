/**
 * Đoán ngôn ngữ tin nhắn user (không phụ thuộc ngôn ngữ UI app).
 * @returns {'en'|'vi'}
 */
export function detectMessageLanguage(text) {
  const s = String(text || '').trim()
  if (!s) return 'vi'
  if (
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/iu.test(
      s,
    )
  ) {
    return 'vi'
  }
  return 'en'
}
