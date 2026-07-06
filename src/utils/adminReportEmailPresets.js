import { viTemplates } from '../locales/reportEmailTemplates/vi.js'
import { enTemplates } from '../locales/reportEmailTemplates/en.js'

const HELP_URL = 'https://engsocial-fe.onrender.com/help'
const TARGET_TYPES = ['post', 'message', 'conversation', 'user']

const TARGET_LABELS = {
  vi: {
    post: 'bài viết',
    message: 'tin nhắn',
    conversation: 'cuộc trò chuyện / nhóm chat',
    user: 'tài khoản người dùng',
  },
  en: {
    post: 'post',
    message: 'message',
    conversation: 'conversation / group chat',
    user: 'user account',
  },
}

function fill(text, vars) {
  return String(text || '').replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '')
}

function normalizeType(targetType) {
  return TARGET_TYPES.includes(targetType) ? targetType : 'post'
}

function mapSideList(list, prefix, vars) {
  return (list || []).map((item, index) => ({
    id: `${prefix}_${index}`,
    label: item.label,
    text: fill(item.body, vars),
  }))
}

export function getReportEmailPresets(lang, status, targetType, { reason = '' } = {}) {
  const locale = lang === 'en' ? 'en' : 'vi'
  const type = normalizeType(targetType)
  const side = status === 'reviewed' ? 'reviewed' : 'dismissed'
  const bank = locale === 'en' ? enTemplates : viTemplates
  const block = bank?.[type]?.[side] || bank?.post?.[side] || { reporter: [], reported: [] }

  const vars = {
    targetType: TARGET_LABELS[locale][type] || type,
    targetLabel: TARGET_LABELS[locale][type] || type,
    reason: reason || (locale === 'en' ? '(not provided)' : '(không ghi rõ)'),
    helpUrl: HELP_URL,
  }

  return {
    reporter: mapSideList(block.reporter, `${type}_${side}_reporter`, vars),
    reported: mapSideList(block.reported, `${type}_${side}_reported`, vars),
  }
}

export { HELP_URL }
