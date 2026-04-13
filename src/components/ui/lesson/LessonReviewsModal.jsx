import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { lessonsService } from '../../../services'
import { showEngSuccessToast, showEngErrorToast } from '../../../utils/showEngToast'
import { formatPostTime } from '../../../utils/dateTime'

export function LessonReviewsModal({ open, onClose, lessonId, lessonTitle }) {
  const { t } = useTranslation()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  
  // Rating form
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchReviews = async (pageNum = 1) => {
    if (!lessonId) return
    setLoading(true)
    try {
      const res = await lessonsService.getReviews(lessonId, { page: pageNum, limit: 10 })
      const list = res?.data?.data || res?.data || []
      const pagination = res?.data?.pagination || {}
      
      if (pageNum === 1) setReviews(list)
      else setReviews(prev => [...prev, ...list])
      
      setHasMore(pagination.currentPage < pagination.totalPages)
    } catch (err) {
      console.error('Failed to fetch reviews', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && lessonId) {
      setPage(1)
      setReviews([])
      setRating(5)
      setComment('')
      fetchReviews(1)
    }
  }, [open, lessonId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) return
    setSubmitting(true)
    try {
      const res = await lessonsService.addReview(lessonId, { rating, comment })
      showEngSuccessToast(t('lessons.reviewSubmitted') || 'Đánh giá thành công!')
      setComment('')
      setRating(5)
      // Refresh list
      setPage(1)
      fetchReviews(1)
    } catch (err) {
      showEngErrorToast(err?.message || t('common.error') || 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto custom-scrollbar" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#111e22] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-[#325a67]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#325a67] sticky top-0 bg-white dark:bg-[#111e22] z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-500">star</span>
              {t('lessons.reviews') || 'Đánh giá'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#92bbc9] mt-0.5 max-w-[300px] sm:max-w-md truncate">
              {lessonTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <form className="mb-8 bg-slate-50 dark:bg-[#1a353d] p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-[#325a67]" onSubmit={handleSubmit}>
            <h3 className="text-sm font-bold text-slate-700 dark:text-gray-300 mb-3">{t('lessons.leaveReview') || 'Viết đánh giá của bạn'}</h3>
            <div className="flex items-center gap-1.5 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`material-symbols-outlined text-2xl transition-all hover:scale-110 ${star <= rating ? 'text-yellow-500 fill-yellow-500 font-variation-fill' : 'text-slate-300 dark:text-gray-600'}`}
                >
                  star
                </button>
              ))}
              <span className="ml-3 text-xs font-bold text-slate-500 dark:text-[#92bbc9]">{rating}/5</span>
            </div>
            
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('lessons.reviewPlaceholder') || 'Chia sẻ cảm nhận của bạn về bài học này...'}
              rows={3}
              className="w-full bg-white dark:bg-[#111e22] border border-slate-200 dark:border-[#325a67] rounded-xl p-3 text-sm focus:ring-primary focus:border-primary text-slate-800 dark:text-white mb-3"
            />
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !rating}
                className="px-5 py-2 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-lg text-sm transition-all shadow shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">send</span>
                )}
                {t('lessons.submitReview') || 'Gửi đánh giá'}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-gray-300 border-b border-slate-200 dark:border-[#325a67] pb-2 mb-4">
              {t('lessons.allReviews') || 'Tất cả đánh giá'} ({reviews.length})
            </h3>
            
            {loading && page === 1 && (
              <div className="flex justify-center py-8">
                <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
              </div>
            )}
            
            {!loading && reviews.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-gray-500 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl">rate_review</span>
                <p className="text-sm">{t('lessons.noReviews') || 'Chưa có đánh giá nào. Hãy là người đầu tiên!'}</p>
              </div>
            )}
            
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl border border-slate-100 dark:border-[#325a67]/50 bg-white dark:bg-card-dark flex gap-3 sm:gap-4">
                <img 
                  src={rev.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.user?.name || 'User')}&background=13b6ec&color=fff`} 
                  alt={rev.user?.name} 
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-[#325a67]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{rev.user?.name}</h4>
                    <span className="text-[10px] text-slate-500 dark:text-[#92bbc9]">{formatPostTime(rev.createdAt)}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star} 
                        className={`material-symbols-outlined text-[14px] ${star <= rev.rating ? 'text-yellow-500 fill-yellow-500 font-variation-fill' : 'text-slate-200 dark:text-gray-700'}`}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  {rev.comment && (
                    <p className="text-sm text-slate-600 dark:text-gray-300 break-words whitespace-pre-wrap">{rev.comment}</p>
                  )}
                </div>
              </div>
            ))}

            {hasMore && reviews.length > 0 && (
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={() => {
                    const nextPage = page + 1
                    setPage(nextPage)
                    fetchReviews(nextPage)
                  }}
                  disabled={loading}
                  className="px-4 py-2 border border-slate-200 dark:border-[#325a67] rounded-lg text-sm text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-medium disabled:opacity-50"
                >
                  {loading ? '...' : t('lessons.loadMoreReviews') || 'Tải thêm'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
