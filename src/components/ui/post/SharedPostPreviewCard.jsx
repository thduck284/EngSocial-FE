import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DEFAULT_AVATAR } from '../../../constants/ui'
import { ROUTES } from '../../../constants'
import { formatPostTime } from '../../../utils/dateTime'
import { PostContentBody } from './PostContentBody'

export function SharedPostPreviewCard({
  sharedPost,
  sharedMentions,
  contentExpanded,
  onToggleContentExpanded,
  onOpenMentions,
  onOpenImageViewer,
}) {
  const { t } = useTranslation()
  if (!sharedPost) return null

  const firstSharedMention = sharedMentions.length > 0 ? sharedMentions[0] : null
  const firstSharedMentionId = firstSharedMention
    ? (firstSharedMention.id ??
      (typeof firstSharedMention === 'string' ? firstSharedMention : null))
    : null
  const sharedOthersCount = sharedMentions.length > 1 ? sharedMentions.length - 1 : 0
  const sharedContent =
    sharedPost.content != null ? String(sharedPost.content) : ''
  const isLongSharedContent = sharedContent.length > 300
  const sharedContentPreview =
    isLongSharedContent && !contentExpanded
      ? sharedContent.slice(0, 300)
      : sharedContent

  return (
    <div className="mt-4 rounded-xl border border-slate-200 dark:border-[#325a67] bg-slate-50 dark:bg-[#0b1518] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-[#325a67]">
        <span className="material-symbols-outlined text-primary text-lg">
          repeat
        </span>
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {t('dashboard.sharedAPost') || 'Da chia se mot bai viet'}
        </span>
      </div>
      <div className="p-4">
        <div className="flex gap-3 mb-3">
          <Link to={sharedPost.author?.id ?? sharedPost.author?._id ? ROUTES.PROFILE_USER(sharedPost.author?.id ?? sharedPost.author?._id) : '#'}>
            <img
              src={
                sharedPost.author?.avatar ||
                (sharedPost.author?.name
                  ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      sharedPost.author.name,
                    )}&background=13b6ec&color=fff`
                  : DEFAULT_AVATAR)
              }
              alt=""
              className="size-9 rounded-full object-cover bg-slate-300 shrink-0 hover:opacity-80 transition-opacity"
            />
          </Link>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex flex-wrap items-baseline gap-x-1">
              <Link
                to={sharedPost.author?.id ?? sharedPost.author?._id ? ROUTES.PROFILE_USER(sharedPost.author?.id ?? sharedPost.author?._id) : '#'}
                className="text-sm hover:text-primary transition-colors"
              >
                {sharedPost.author?.name || 'User'}
              </Link>
              {firstSharedMention && firstSharedMentionId && (
                <>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {t('dashboard.with')}
                  </span>
                  <Link
                    to={ROUTES.PROFILE_USER(firstSharedMentionId)}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    {firstSharedMention.name || firstSharedMentionId}
                  </Link>
                  {sharedOthersCount > 0 && (
                    <>
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {t('dashboard.and')}
                      </span>
                      <button
                        type="button"
                        onClick={onOpenMentions}
                        className="text-sm font-bold text-primary hover:underline ml-0.5"
                      >
                        {t('dashboard.othersCount', { count: sharedOthersCount })}
                      </button>
                    </>
                  )}
                </>
              )}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {formatPostTime(sharedPost.createdAt)}
            </p>
          </div>
        </div>

        {sharedContent && (
          <div className="text-sm text-slate-800 dark:text-slate-200">
            <p className="whitespace-pre-wrap">
              <PostContentBody
                content={sharedContentPreview}
                mentions={sharedMentions}
              />
              {isLongSharedContent && !contentExpanded && ' ... '}
            </p>
            {isLongSharedContent && (
              <button
                type="button"
                onClick={onToggleContentExpanded}
                className="mt-1 text-primary font-medium hover:underline"
              >
                {contentExpanded
                  ? t('dashboard.seeLess') || 'Thu gon'
                  : t('dashboard.seeMore') || 'Xem them'}
              </button>
            )}
          </div>
        )}

        {Array.isArray(sharedPost.images) && sharedPost.images.length > 0 && (
          <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-[#325a67] flex flex-wrap gap-1">
            {sharedPost.images.map((url, i) => (
              <button
                key={`shared-img-${i}-${url.slice(0, 40)}`}
                type="button"
                onClick={() => onOpenImageViewer(i)}
                className="flex-1 min-w-0 cursor-pointer block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded overflow-hidden"
              >
                <img
                  src={url}
                  alt=""
                  className="w-full max-h-64 object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}

        {sharedPost.video &&
          typeof sharedPost.video === 'string' &&
          sharedPost.video.trim() && (
            <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-[#325a67]">
              <video
                src={sharedPost.video}
                controls
                className="w-full max-h-80"
                preload="metadata"
              />
            </div>
          )}

        {Array.isArray(sharedPost.documents) &&
          sharedPost.documents.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {sharedPost.documents.map((doc, i) => {
                const url = typeof doc === 'string' ? doc : doc?.url
                const name = typeof doc === 'string' ? '' : doc?.name || ''
                if (!url || typeof url !== 'string') return null
                const label = name || t('dashboard.document') + ` ${i + 1}`
                return (
                  <a
                    key={`shared-doc-${i}-${url.slice(0, 40)}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-[#111e22] border border-slate-200 dark:border-[#325a67] text-sm font-medium text-primary hover:underline max-w-full min-w-0"
                    title={name || undefined}
                  >
                    <span className="material-symbols-outlined text-lg shrink-0">
                      description
                    </span>
                    <span className="truncate">{label}</span>
                  </a>
                )
              })}
            </div>
          )}
      </div>
    </div>
  )
}
