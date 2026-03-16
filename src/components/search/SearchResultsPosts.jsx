import { DEFAULT_AVATAR } from '../../constants/ui'
import { formatPostTime } from '../../utils/dateTime'
import { highlightQuerySegments } from '../../utils/search'

export function SearchResultsPosts({ t, posts, postsCount, query }) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-card-dark rounded-xl p-5 border border-transparent hover:border-primary/30 transition-all shadow-sm"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={post.author?.avatar || DEFAULT_AVATAR}
                alt=""
                className="size-10 rounded-full bg-slate-800 object-cover"
              />
              <div>
                <h4 className="font-bold text-sm text-white">{post.author?.name}</h4>
                <p className="text-xs text-gray-400">
                  {formatPostTime(post.createdAt)}
                  {post.groupName && (
                    <>
                      {' '}
                      • <span className="text-primary">{post.groupName}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <button type="button" className="text-gray-400 hover:text-primary">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">
              {highlightQuerySegments(post.content, query).map((seg, i) =>
                seg.type === 'highlight' ? (
                  <span key={i} className="text-primary font-bold">
                    {seg.value}
                  </span>
                ) : (
                  <span key={i}>{seg.value}</span>
                )
              )}
            </p>
            {post.images?.length > 0 && (
              <div className="rounded-lg overflow-hidden border border-border-dark h-48 sm:h-64">
                <img src={post.images[0]} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-border-dark/50 text-gray-400">
            <div className="flex items-center gap-4">
              <button type="button" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <span
                  className={`material-symbols-outlined text-[20px] ${post.liked ? 'fill-current text-primary' : ''}`}
                >
                  thumb_up
                </span>
                <span className="text-xs font-medium">{post.likeCount}</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                <span className="text-xs font-medium">{post.commentCount}</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">share</span>
              </button>
            </div>
            <button
              type="button"
              className={post.saved ? 'text-primary' : 'hover:text-primary transition-colors'}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${post.saved ? 'fill-current' : ''}`}
              >
                bookmark
              </span>
            </button>
          </div>
        </article>
      ))}
      <button
        type="button"
        className="w-full py-3 rounded-xl border-2 border-dashed border-border-dark text-gray-400 hover:border-primary hover:text-primary transition-all font-medium text-sm"
      >
        {t('search.loadMorePosts')}
      </button>
    </div>
  )
}
