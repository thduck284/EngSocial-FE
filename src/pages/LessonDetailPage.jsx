import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lessonsService } from '../services'
import { DashboardCard } from '../components/dashboard/DashboardCard'
import toast from 'react-hot-toast'

export function LessonDetailPage() {
  const { t } = useTranslation()
  const { skill, id } = useParams() 
  const location = useLocation()
  const navigate = useNavigate()
  
  const category = location.pathname.startsWith('/practice') ? 'practice' : 'lesson'
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    lessonsService.getById(id)
      .then(res => {
        setLesson(res.data)
      })
      .catch(err => {
        console.error('Failed to fetch lesson details:', err)
        toast.error(t('common.error'))
        navigate('/home')
      })
      .finally(() => setLoading(false))
  }, [id, navigate, t])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">progress_activity</span>
        <p className="text-slate-500 dark:text-[#92bbc9]">{t('common.loading')}</p>
      </div>
    )
  }

  if (!lesson) return null

  const handleStart = () => {
    navigate(`/${category}/${skill}/${id}/study`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-[#92bbc9] hover:text-primary transition-colors group"
      >
        <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
        {t('dashboard.back') || 'Quay lại'}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Thumbnail & Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard className="overflow-hidden">
            <div className="aspect-video w-full relative">
              <img 
                src={lesson.thumbnail || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000&auto=format&fit=crop'} 
                alt={lesson.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 bg-primary text-[#111e22] text-xs font-bold rounded-full shadow-lg">
                  {lesson.level}
                </span>
                <span className="px-3 py-1 bg-white/90 dark:bg-[#111e22]/90 backdrop-blur text-slate-900 dark:text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    {skill === 'reading' ? 'menu_book' : skill === 'listening' ? 'headphones' : 'edit_note'}
                  </span>
                  {t(`skills.${skill}`)}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h1 className="text-2xl lg:text-3xl font-bold mb-3">{lesson.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-slate-500 dark:text-[#92bbc9]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-yellow-500 text-lg fill-icon">star</span>
                  <span className="font-bold text-slate-900 dark:text-white">{lesson.rating || '0.0'}</span>
                  <span>({lesson.ratingCount || 0} {t('search.reviewsCount')})</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">group</span>
                  <span className="font-medium">{lesson.completionCount?.toLocaleString() || 0} {t('dashboard.views')}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium capitalize text-primary">
                  <span className="material-symbols-outlined text-lg">category</span>
                  {lesson.topic}
                </span>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-lg font-bold mb-2">{t('common.description')}</h3>
                <p className="text-slate-600 dark:text-[#92bbc9] leading-relaxed">
                  {lesson.description || t('dashboard.lessonDescriptionFallback')}
                </p>
              </div>
            </div>
          </DashboardCard>

          {/* Vocabulary/Preview Section could go here */}
        </div>

        {/* Right Column: Actions & Stats */}
        <div className="space-y-6">
          <DashboardCard className="p-6 sticky top-24">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-[#233f48] rounded-xl text-center">
                  <span className="material-symbols-outlined text-primary mb-1">schedule</span>
                  <p className="text-[10px] text-slate-500 dark:text-[#92bbc9] uppercase font-bold">{t('dashboard.minutes')}</p>
                  <p className="text-sm font-bold">{lesson.estimatedTime || 15} {t('common.minutesShort')}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#233f48] rounded-xl text-center">
                  <span className="material-symbols-outlined text-primary mb-1">military_tech</span>
                  <p className="text-[10px] text-slate-500 dark:text-[#92bbc9] uppercase font-bold">Reward</p>
                  <p className="text-sm font-bold">+{lesson.xpReward || 50} XP</p>
                </div>
              </div>

              <button
                onClick={handleStart}
                className="w-full py-4 bg-primary hover:bg-primary-dark text-[#111e22] font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
              >
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">play_arrow</span>
                {t('buttons.start')}
              </button>

              <div className="pt-6 border-t border-slate-100 dark:border-[#325a67] space-y-4">
                <h4 className="font-bold text-sm mb-3">{t('lessonDetail.benefitsTitle')}</h4>
                <div className="space-y-3">
                  {[
                    t('lessonDetail.benefit1'),
                    t('lessonDetail.benefit2'),
                    t('lessonDetail.benefit3'),
                    t('lessonDetail.benefit4')
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs text-slate-600 dark:text-[#92bbc9]">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  )
}
