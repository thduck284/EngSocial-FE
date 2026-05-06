import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lessonsService } from '../services'
import { showEngSuccessToast, showEngErrorToast } from '../utils/showEngToast'
import { formatPostTime } from '../utils/dateTime'
import { useAuth } from '../context/AuthContext'

export function LessonReviewPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [lesson, setLesson] = useState(null)
  const [reviews, setReviews] = useState([])
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)

  // Stats
  const [avgRating, setAvgRating] = useState(0)
  const [ratingDist, setRatingDist] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 })

  // Form
  const [rating, setRating] = useState(10)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [myReview, setMyReview] = useState(null)

  const fetchLesson = useCallback(async () => {
    try {
      const res = await lessonsService.getById(id)
      setLesson(res?.data || res)
    } catch {
      // ignore
    }
  }, [id])

  const fetchReviews = useCallback(async (pageNum = 1, append = false) => {
    try {
      const res = await lessonsService.getReviews(id, { page: pageNum, limit: 10 })
      const list = res?.data?.data || res?.data || []
      const pg = res?.data?.pagination || {}

      if (append) setReviews(prev => [...prev, ...list])
      else setReviews(list)

      setPagination({
        currentPage: pg.currentPage || pageNum,
        totalPages: pg.totalPages || 1,
        total: pg.total || list.length,
      })

      if (!append && list.length > 0) {
        const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 }
        list.forEach(r => { if (r.rating >= 1 && r.rating <= 10) dist[r.rating]++ })
        setRatingDist(dist)
        const sum = list.reduce((acc, r) => acc + r.rating, 0)
        setAvgRating(list.length ? (sum / list.length).toFixed(1) : 0)
      }

      if (user?.id && !append) {
        const mine = list.find(r => String(r.user?.id) === String(user.id) || String(r.userId) === String(user.id))
        if (mine) {
          setMyReview(mine)
          setRating(mine.rating)
          setComment(mine.comment || '')
        }
      }
    } catch (err) {
      console.error(err)
    }
  }, [id, user?.id])

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    Promise.all([fetchLesson(), fetchReviews(1)]).finally(() => setLoading(false))
  }, [fetchLesson, fetchReviews])

  const handleLoadMore = async () => {
    const next = page + 1
    setPage(next)
    setLoadingMore(true)
    await fetchReviews(next, true)
    setLoadingMore(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) return
    setSubmitting(true)
    try {
      await lessonsService.addReview(id, { rating, comment })
      showEngSuccessToast(t('lessons.reviewSubmitted'))
      setComment('')
      setRating(10)
      setPage(1)
      await fetchReviews(1)
    } catch (err) {
      showEngErrorToast(err?.response?.data?.message || err?.message || t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  const totalReviews = pagination.total || reviews.length
  const hasMore = pagination.currentPage < pagination.totalPages

  return (
    <div className="min-h-screen bg-background-dark text-white font-display">
      <main className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          
          {/* LEFT BAR: Lesson Info */}
          <aside className="col-span-12 lg:col-span-3 lg:sticky lg:top-6 lg:self-start lg:h-fit space-y-6">
            <div className="bg-card-dark rounded-xl border border-border-dark overflow-hidden shadow-xl">
              <div className="relative aspect-video">
                {lesson?.thumbnail ? (
                  <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-5xl opacity-50">menu_book</span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <button
                    onClick={() => navigate(-1)}
                    className="size-10 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-xl text-white flex items-center justify-center transition-all border border-white/10"
                  >
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded border ${
                      lesson?.skill === 'reading' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      lesson?.skill === 'listening' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {lesson?.skill ? t(`skills.${lesson.skill}`) : '...'}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-800 text-gray-300 text-[10px] font-black uppercase tracking-wider rounded border border-white/5">
                      {lesson?.level || '—'}
                    </span>
                  </div>
                  {loading ? (
                    <div className="space-y-2 pt-2">
                      <div className="h-6 bg-gray-700 rounded-md w-full animate-pulse" />
                      <div className="h-4 bg-gray-700 rounded-md w-3/4 animate-pulse" />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-xl font-black text-white leading-tight pt-1">{lesson?.title || `Lesson #${id}`}</h1>
                      <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                        {lesson?.description || t('lessons.noDescription')}
                      </p>
                    </>
                  )}
                </div>

                <div className="pt-4 border-t border-border-dark">
                  <Link
                    to={`/lesson/${lesson?.skill}/${lesson?.id}`}
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-background-dark font-black rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                  >
                    <span className="material-symbols-outlined text-lg">play_circle</span>
                    {t('buttons.start')}
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
              <h4 className="text-xs font-bold text-primary flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-sm">info</span>
                {t('lessons.whyReview')}
              </h4>
              <p className="text-[11px] text-gray-400 leading-relaxed italic">
                {t('lessons.reviewHint')}
              </p>
            </div>
          </aside>

          {/* MAIN: Reviews & Form */}
          <section className="col-span-12 lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between gap-4 py-2">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">chat_bubble</span>
                {t('lessons.reviews')}
                <span className="px-2.5 py-0.5 bg-card-dark rounded-lg text-xs font-bold text-gray-500 border border-border-dark leading-none">
                  {totalReviews}
                </span>
              </h2>
            </div>

            {/* Write Review Section */}
            <div className="bg-card-dark rounded-xl border border-border-dark overflow-hidden group focus-within:border-primary/40 transition-all shadow-lg">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=13b6ec&color=fff`} 
                      className="size-10 rounded-lg object-cover border border-border-dark" 
                      alt="" 
                    />
                    <div>
                      <h3 className="text-base font-bold text-white mb-0.5">
                        {myReview ? t('lessons.editReview') : t('lessons.leaveReview')}
                      </h3>
                      <p className="text-[11px] text-gray-500 italic">{t('lessons.starsHint')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-background-dark border border-border-dark p-2 rounded-lg">
                    <StarRow value={rating} onChange={setRating} size="text-xl" count={10} />
                    <span className="text-xs font-black text-yellow-500 w-6 text-center">{rating}</span>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t('lessons.reviewPlaceholder')}
                    rows={4}
                    className="w-full bg-background-dark border border-border-dark rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-gray-600 resize-none transition-all outline-none font-medium"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !rating}
                    className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-background-dark font-black rounded-lg text-sm transition-all shadow-lg shadow-primary/10 disabled:opacity-50 active:scale-95"
                  >
                    {submitting ? (
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-lg">send</span>
                    )}
                    {submitting ? '...' : t('lessons.submitReview')}
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              {loading ? (
                [1, 2, 3].map(i => <ReviewSkeleton key={i} />)
              ) : reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-card-dark/50 rounded-xl border border-dashed border-border-dark text-gray-500 gap-4">
                  <div className="size-20 bg-card-dark rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl opacity-20">rate_review</span>
                  </div>
                  <p className="text-sm font-medium">{t('lessons.noReviews')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <ReviewCard 
                      key={rev.id} 
                      review={rev} 
                      isMe={user?.id && (String(rev.user?.id) === String(user.id) || String(rev.userId) === String(user.id))} 
                    />
                  ))}
                </div>
              )}

              {hasMore && (
                <div className="flex justify-center pt-8">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-8 py-3 bg-card-dark hover:bg-gray-700 border border-border-dark text-gray-300 hover:text-white rounded-lg text-sm font-black transition-all disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-lg">expand_more</span>
                    )}
                    {t('lessons.loadMoreReviews')}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT BAR: Statistics */}
          <aside className="col-span-12 lg:col-span-3 lg:sticky lg:top-6 lg:self-start lg:h-fit space-y-6">
            <div className="bg-card-dark rounded-xl border border-border-dark p-6 shadow-xl">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">insights</span>
                {t('lessons.ratingOverview')}
              </h3>

              <div className="flex flex-col items-center gap-2 py-6 bg-background-dark/50 rounded-xl border border-border-dark mb-6">
                <div className="flex flex-col items-center">
                  <span className="text-6xl font-black text-white">{avgRating || '0'}</span>
                  <div className="mt-2">
                    <StarRow value={Math.round(Number(avgRating))} readOnly size="text-base" count={10} />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mt-2">
                  {totalReviews} {t('lessons.reviews').toLowerCase()}
                </span>
              </div>

              <div className="space-y-3 px-1">
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(s => {
                  const count = ratingDist[s] || 0;
                  const pct = Math.round((count / (totalReviews || 1)) * 100);
                  return (
                    <div key={s} className="space-y-1 group">
                      <div className="flex justify-between text-[9px] font-black uppercase text-gray-500 tracking-wider">
                        <span className="group-hover:text-gray-300 transition-colors">{s} {t('common.stars') || 'Stars'}</span>
                        <span className="group-hover:text-primary transition-colors">{t('lessons.reviewsCount', { count: count || 0 })}</span>
                      </div>
                      <div className="h-1.5 bg-background-dark rounded-full overflow-hidden border border-border-dark flex items-center p-[1px]">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(19,182,236,0.3)]" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  )
}

function StarRow({ value, onChange, readOnly = false, size = 'text-3xl', count = 5 }) {
  const [hovered, setHovered] = useState(0)
  const starsArray = Array.from({ length: count }, (_, i) => i + 1)
  
  return (
    <div className="flex items-center gap-0.5">
      {starsArray.map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`material-symbols-outlined transition-all duration-300 ${size} ${
            star <= (hovered || value)
              ? 'text-yellow-400 scale-105'
              : 'text-gray-800'
          } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          style={{ fontVariationSettings: star <= (hovered || value) ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review, isMe }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 200;
  const isLong = review.comment?.length > maxLength;
  const displayComment = isExpanded ? review.comment : review.comment?.slice(0, maxLength);

  return (
    <div
      className={`group bg-card-dark rounded-xl border p-6 flex gap-5 transition-all hover:shadow-xl ${
        isMe ? 'border-primary/30 bg-primary/[0.02]' : 'border-border-dark hover:border-border-dark/60'
      }`}
    >
      <div className="relative shrink-0">
        <img
          src={review.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'User')}&background=13b6ec&color=fff`}
          alt={review.user?.name}
          className="size-12 rounded-lg object-cover border-2 border-border-dark group-hover:border-primary/30 transition-colors"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <h4 className="font-black text-sm text-white hover:text-primary transition-colors cursor-pointer">{review.user?.name || 'User'}</h4>
            {isMe && <span className="text-[9px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider">{t('lessons.yourReview')}</span>}
            <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{formatPostTime(review.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1 bg-background-dark/50 px-2 py-1 rounded-lg border border-border-dark group-hover:border-primary/10 transition-colors">
            <span className="material-symbols-outlined text-[14px] text-yellow-500 fill-icon">star</span>
            <span className="text-xs font-black text-white">{review.rating}</span>
          </div>
        </div>
        {review.comment && (
          <div className="space-y-2">
            <p className="text-[13px] text-gray-300 whitespace-pre-wrap break-words leading-relaxed group-hover:text-white transition-colors duration-300">
              {displayComment}
              {!isExpanded && isLong && '...'}
            </p>
            {isLong && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 transition-all"
              >
                {isExpanded ? t('common.showLess') : t('common.showMore')}
                <span className="material-symbols-outlined text-sm">
                  {isExpanded ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewSkeleton() {
  return (
    <div className="bg-card-dark rounded-xl border border-border-dark p-6 space-y-4 animate-pulse">
      <div className="flex gap-4">
        <div className="size-12 rounded-lg bg-white/5" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-white/5 rounded w-1/4" />
          <div className="h-3 bg-white/5 rounded w-1/6" />
        </div>
      </div>
      <div className="h-16 bg-white/5 rounded" />
    </div>
  )
}
