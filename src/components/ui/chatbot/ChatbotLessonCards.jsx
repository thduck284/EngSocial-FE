import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toAbsoluteLessonUrl } from '../../../utils/chatbotMessage'

const PLACEHOLDER_GRADIENT = 'linear-gradient(135deg, #1e3a5f 0%, #0d2137 100%)'

/** Chỉ nhận bài đã xác minh qua API (ChatbotAiMessage). */
export function ChatbotLessonCards({ items }) {
  const { t } = useTranslation()

  if (!items?.length) return null

  return (
    <div className="mt-4 pt-3 border-t border-[#325a67]/80">
      <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-base">menu_book</span>
        {t('chatbot.lessonSuggestions', 'Bài học & luyện tập trên EngSocial')}
      </p>
      <div className="grid gap-2 sm:grid-cols-1">
        {items.map((lesson) => (
          <Link
            key={lesson.href || lesson.path}
            to={lesson.href || lesson.path}
            className="group flex gap-3 rounded-xl border border-[#325a67] bg-[#0a1f2a]/80 p-2.5 hover:border-primary/60 hover:bg-primary/5 transition-all"
          >
            <div
              className="w-20 h-20 shrink-0 rounded-lg bg-cover bg-center shadow-inner"
              style={{
                backgroundImage: lesson.thumbnail
                  ? `url('${lesson.thumbnail}')`
                  : PLACEHOLDER_GRADIENT,
              }}
            />
            <div className="flex-1 min-w-0 py-0.5">
              <p className="text-sm font-semibold text-white group-hover:text-primary line-clamp-2 leading-snug">
                {lesson.title || lesson.slug}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
                {[
                  lesson.category === 'practice'
                    ? t('chatbot.practice', 'Luyện tập')
                    : t('chatbot.lesson', 'Bài học'),
                  lesson.skill,
                  lesson.level,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {lesson.description && (
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{lesson.description}</p>
              )}
              <p className="text-[10px] text-sky-400/90 mt-1.5 break-all leading-relaxed group-hover:underline">
                {lesson.absoluteUrl || toAbsoluteLessonUrl(lesson.path)}
              </p>
            </div>
            <span className="material-symbols-outlined text-gray-500 group-hover:text-primary shrink-0 self-center text-lg">
              open_in_new
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
