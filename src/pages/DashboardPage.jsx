import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { rawService, communityService, friendsService } from '../services'
import { CreatePostModal } from '../components/CreatePostModal'
import { ROUTES } from '../constants'
import { DEFAULT_AVATAR } from '../constants/ui'
import { formatPostTime } from '../utils/dateTime'

export function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [raw, setRaw] = useState({
    skillStats: [],
    featuredLessons: [],
    goals: [],
    suggestedGroups: [],
  })
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [onlineFriends, setOnlineFriends] = useState([])
  const [friendTab, setFriendTab] = useState('suggestions')
  const [suggestionsList, setSuggestionsList] = useState([])
  const [sentRequestsList, setSentRequestsList] = useState([])
  const [receivedRequestsList, setReceivedRequestsList] = useState([])
  const [friendTabLoading, setFriendTabLoading] = useState(false)
  const [friendSelectOpen, setFriendSelectOpen] = useState(false)
  const friendSelectRef = useRef(null)

  useEffect(() => {
    communityService.getPosts({ limit: 20 })
      .then((res) => {
        const list = res?.data ?? []
        setPosts(Array.isArray(list) ? list : [])
      })
      .catch(() => setPosts([]))
      .finally(() => setPostsLoading(false))
  }, [])

  const handlePostFromModal = (newPost) => {
    setPosts((prev) => [newPost, ...prev])
  }

  useEffect(() => {
    rawService.getDashboard()
      .then((res) => {
        const d = res?.data || {}
        setRaw({
          skillStats: d.skillStats || [],
          featuredLessons: d.featuredLessons || [],
          goals: d.goals || [],
          suggestedGroups: d.suggestedGroups || [],
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    friendsService.getList({ limit: 8 })
      .then((res) => {
        const list = res?.data?.data ?? res?.data ?? []
        setOnlineFriends(Array.isArray(list) ? list : [])
      })
      .catch(() => setOnlineFriends([]))
  }, [])

  const loadFriendTabData = (tab) => {
    setFriendTabLoading(true)
    if (tab === 'suggestions') {
      friendsService.search({ limit: 10 })
        .then((res) => {
          const list = res?.data?.data ?? res?.data ?? []
          const arr = Array.isArray(list) ? list : []
          setSuggestionsList(arr.filter((u) => u.friendStatus === 'none'))
        })
        .catch(() => setSuggestionsList([]))
        .finally(() => setFriendTabLoading(false))
    } else if (tab === 'sent') {
      friendsService.getSentRequests({ limit: 10 })
        .then((res) => {
          const list = res?.data?.data ?? res?.data ?? []
          setSentRequestsList(Array.isArray(list) ? list : [])
        })
        .catch(() => setSentRequestsList([]))
        .finally(() => setFriendTabLoading(false))
    } else {
      friendsService.getPendingRequests({ limit: 10 })
        .then((res) => {
          const list = res?.data?.data ?? res?.data ?? []
          setReceivedRequestsList(Array.isArray(list) ? list : [])
        })
        .catch(() => setReceivedRequestsList([]))
        .finally(() => setFriendTabLoading(false))
    }
  }

  useEffect(() => {
    loadFriendTabData(friendTab)
  }, [friendTab])

  useEffect(() => {
    if (!friendSelectOpen) return
    const handleClickOutside = (e) => {
      if (friendSelectRef.current && !friendSelectRef.current.contains(e.target)) setFriendSelectOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [friendSelectOpen])
  const displayAvatar = user?.avatar || (user?.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
  const displayName = user?.name || 'User'
  return (
    <main className="max-w-[1440px] mx-auto grid grid-cols-12 gap-6 p-6">
        {/* Left Sidebar */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-[#111e22] rounded-xl p-5 border border-slate-200 dark:border-[#325a67]">
            <div className="flex items-center gap-4 mb-4">
              <img src={displayAvatar} alt="" className="size-14 rounded-full object-cover" />
              <div>
                <h2 className="font-bold text-lg">{displayName}</h2>
                <p className="text-primary text-sm font-medium">{t('dashboard.level')} 15 · {t('dashboard.learner')}</p>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>{t('dashboard.xpProgress')}</span>
                <span>65%</span>
              </div>
              <div className="h-2 w-full bg-[#325a67] rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '65%' }} />
              </div>
              <p className="text-[10px] text-[#92bbc9]">350/500 XP {t('dashboard.xpToLevel')} 16</p>
            </div>
            <Link
              to="/profile"
              className="block w-full py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all rounded-lg font-bold text-sm text-center"
            >
              {t('dashboard.viewFullProfile')}
            </Link>
          </div>
          <div className="bg-white dark:bg-[#111e22] rounded-xl p-5 border border-slate-200 dark:border-[#325a67]">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">query_stats</span>
              {t('dashboard.weeklyStats')}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {raw.skillStats.map(({ icon, label, value, change, changeColor, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#233f48] rounded-lg hover:bg-slate-100 dark:hover:bg-[#325a67] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${icon === 'menu_book' ? 'text-blue-400' : icon === 'headset' ? 'text-orange-400' : 'text-emerald-400'}`}>
                      {icon}
                    </span>
                    <span className="text-sm font-medium">{t(label)}</span>
                  </div>
                  <span className="font-bold text-sm">
                    {value} <span className={`text-[10px] ml-1 ${changeColor}`}>{change}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-[#111e22] rounded-xl p-5 border border-slate-200 dark:border-[#325a67]">
            <h3 className="font-bold text-sm mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">target</span>
                {t('dashboard.todayGoals')}
              </div>
              <span className="text-[10px] text-primary">2/3 {t('dashboard.completed')}</span>
            </h3>
            <div className="space-y-1">
              {raw.goals.map(({ done, labelKey }) => (
                <label key={labelKey} className="flex items-center gap-3 py-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    defaultChecked={done}
                    className="rounded border-primary text-primary focus:ring-primary/20 bg-transparent"
                  />
                  <span className={`text-sm ${done ? 'line-through text-[#92bbc9]' : ''}`}>{t(labelKey)}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-[#111e22] rounded-xl p-5 border border-slate-200 dark:border-[#325a67]">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">groups</span>
              {t('dashboard.studyGroups')}
            </h3>
            <div className="space-y-4">
              {raw.suggestedGroups.map(({ icon, title, members, color }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className={`size-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-white">{icon}</span>
                  </div>
                  <div className="text-xs min-w-0">
                    <p className="font-bold line-clamp-1">{title}</p>
                    <p className="text-[#92bbc9]">{members}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-[#111e22] rounded-xl p-5 border border-slate-200 dark:border-[#325a67]">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">menu_book</span>
              {t('dashboard.featuredLessons')}
            </h3>
            <div className="space-y-4">
              {raw.featuredLessons.map(({ title, icon, skill, level, to, learners }) => (
                <Link key={title} to={to} className="block group">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-semibold group-hover:text-primary transition-colors">{title}</h4>
                    <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-500 text-[9px] font-bold rounded uppercase shrink-0 ml-2">
                      {level}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 dark:text-[#92bbc9]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        {icon === 'menu_book' ? 'menu_book' : icon === 'headset' ? 'headset' : 'edit_note'}
                      </span>
                      {t(`skills.${skill.toLowerCase()}`)}
                    </span>
                    <span>• {learners} {t('dashboard.views')}</span>
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/lesson" className="block w-full mt-4 py-2 text-xs font-bold text-primary hover:underline text-center">
              {t('dashboard.viewAllLessons')}
            </Link>
          </div>
          <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-5 border border-primary/20">
            <h3 className="font-bold text-sm text-primary mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg fill-icon">emoji_events</span>
              {t('dashboard.ongoingChallenge')}
            </h3>
            <div className="space-y-3">
              <div className="text-xs">
                <p className="font-semibold">Vua Từ Vựng Tuần 48</p>
                <div className="flex items-center justify-between mt-1 text-[#92bbc9]">
                  <span>Kết thúc sau: 2 ngày</span>
                  <span>Top 5%</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
        {/* Main Feed */}
        <section className="col-span-12 lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-[#111e22] rounded-xl p-5 border border-slate-200 dark:border-[#325a67]">
            <div className="flex gap-4">
              <img src={displayAvatar} alt="" className="size-10 rounded-full object-cover shrink-0" />
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="flex-1 text-left bg-slate-50 dark:bg-[#233f48] rounded-xl px-4 py-3 text-sm text-slate-400 dark:text-[#92bbc9] hover:bg-slate-100 dark:hover:bg-[#325a67] transition-colors"
              >
                {t('dashboard.postPlaceholder')}
              </button>
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-[#325a67]">
              <div className="flex gap-1">
                <button type="button" onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#233f48] rounded-lg text-xs font-medium text-slate-500 dark:text-[#92bbc9] transition-colors">
                  <span className="material-symbols-outlined text-green-500 text-lg">image</span> {t('dashboard.image')}
                </button>
                <button type="button" onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#233f48] rounded-lg text-xs font-medium text-slate-500 dark:text-[#92bbc9] transition-colors">
                  <span className="material-symbols-outlined text-red-500 text-lg">videocam</span> {t('dashboard.video')}
                </button>
                <button type="button" onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#233f48] rounded-lg text-xs font-medium text-slate-500 dark:text-[#92bbc9] transition-colors">
                  <span className="material-symbols-outlined text-blue-500 text-lg">description</span> {t('dashboard.document')}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:brightness-110 transition-all"
              >
                {t('dashboard.createPost') || 'Tạo bài viết'}
              </button>
            </div>
          </div>

          <CreatePostModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handlePostFromModal}
          />
          <div className="flex items-center gap-4 bg-white/50 dark:bg-transparent p-1 rounded-xl">
            <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-[#111e22] rounded-xl border border-slate-200 dark:border-[#325a67]">
              <button className="px-6 py-2 bg-white dark:bg-[#233f48] rounded-lg text-sm font-bold shadow-sm">
                {t('dashboard.all')}
              </button>
              <button className="px-6 py-2 hover:bg-white/50 dark:hover:bg-[#233f48]/50 rounded-lg text-sm font-medium text-slate-500 dark:text-[#92bbc9]">
                {t('dashboard.following')}
              </button>
              <button className="px-6 py-2 hover:bg-white/50 dark:hover:bg-[#233f48]/50 rounded-lg text-sm font-medium text-slate-500 dark:text-[#92bbc9]">
                {t('dashboard.popular')}
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-[#92bbc9] cursor-pointer">
              {t('dashboard.newest')} <span className="material-symbols-outlined text-lg">expand_more</span>
            </div>
          </div>
          {/* Feed posts */}
          {postsLoading ? (
            <div className="bg-white dark:bg-[#111e22] rounded-xl border border-slate-200 dark:border-[#325a67] p-8 text-center">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
              <p className="text-sm text-slate-500 dark:text-[#92bbc9] mt-2">{t('dashboard.loading') || 'Đang tải...'}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white dark:bg-[#111e22] rounded-xl border border-slate-200 dark:border-[#325a67] p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-[#92bbc9]">edit_note</span>
              <p className="text-sm text-slate-500 dark:text-[#92bbc9] mt-2">{t('dashboard.noPosts') || 'Chưa có bài viết. Hãy viết bài đầu tiên phía trên!'}</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-[#111e22] rounded-xl border border-slate-200 dark:border-[#325a67] overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <img
                        src={post.author?.avatar || (post.author?.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)}
                        alt=""
                        className="size-11 rounded-full object-cover bg-slate-300"
                      />
                      <div>
                        <h4 className="font-bold text-sm">{post.author?.name || 'User'}</h4>
                        <p className="text-xs text-slate-400 dark:text-[#92bbc9]">{formatPostTime(post.createdAt)} • {post.visibility === 'public' ? (t('dashboard.public') || 'Công khai') : post.visibility}</p>
                      </div>
                    </div>
                    <button type="button" className="text-slate-400 dark:text-[#92bbc9] hover:bg-slate-100 dark:hover:bg-[#233f48] rounded p-1">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  {post.images?.length > 0 && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-[#325a67]">
                      <img alt="" className="w-full max-h-64 object-cover" src={post.images[0]} />
                    </div>
                  )}
                  {post.video && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-[#325a67]">
                      <video src={post.video} controls className="w-full max-h-80" />
                    </div>
                  )}
                  {post.documents?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.documents.map((url, i) => (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#233f48] text-sm font-medium text-primary hover:underline">
                          <span className="material-symbols-outlined text-lg">description</span>
                          {t('dashboard.document')} {i + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="px-5 py-3 border-t border-slate-100 dark:border-[#325a67] flex items-center justify-between">
                  <div className="flex gap-6">
                    <button type="button" className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-[#92bbc9] hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-xl">favorite</span> {post.likeCount ?? 0}
                    </button>
                    <button type="button" className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-[#92bbc9] hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-xl">chat_bubble</span> {post.commentCount ?? 0}
                    </button>
                    <button type="button" className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-[#92bbc9] hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-xl">share</span>
                    </button>
                  </div>
                  <button type="button" className="text-slate-500 dark:text-[#92bbc9] hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">bookmark</span>
                  </button>
                </div>
              </div>
            ))
          )}
          {/* Gợi ý bài học cho bạn */}
          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-[#325a67]" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-[#92bbc9] uppercase tracking-widest">
              {t('dashboard.suggestedLessons')}
            </span>
            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-[#325a67]" />
          </div>
          <Link
            to="/lesson"
            className="block bg-gradient-to-br from-[#111e22] to-[#1a353d] dark:from-[#111e22] dark:to-[#1a353d] rounded-xl border border-primary/30 p-5 relative overflow-hidden group hover:border-primary/50 transition-colors"
          >
            <div className="relative z-10 flex gap-6">
              <div
                className="w-1/3 aspect-video rounded-lg bg-cover bg-center shrink-0"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDKqQRcZ2qEUm_G9civhe_WEXiHigCQOkb56jFE6xSQfjLEgB0aZByKocBA4xPNZtFhRTG5TuqjG1kogq3KdZD8cfD6VINztDQdUM2TAwY9Yn8HNzzMjl5yzHc7Eo5SkMYsiTiC4t_f5lxm-nTX1rNn7IXUmFieoc2KhtrWo9kc6a9H8sw20XyDiswbiBiG62iFjYbKEQB7Q63k7DzND2sbrO4hI5jhmTwYkzUtLGuY2cCIhPb8rZ-OelYJqRfAU20NTYUtHW7CqXmW')`,
                }}
              />
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-primary text-[#111e22] text-[10px] font-bold rounded">{t('dashboard.featured')}</span>
                  <span className="text-xs text-primary font-medium">{t('dashboard.by')} {t('dashboard.team')}</span>
                </div>
                <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                  Mastering Business English: Email Etiquette
                </h4>
                <p className="text-xs text-slate-400 dark:text-[#92bbc9] line-clamp-2">
                  Nâng tầm kỹ năng viết email chuyên nghiệp với bộ quy tắc giao tiếp công sở hiện đại...
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <span className="px-4 py-1.5 bg-primary text-[#111e22] font-bold text-xs rounded-lg">
                    {t('dashboard.learnNow')}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-[#92bbc9] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">schedule</span> 15 {t('dashboard.minutes')}
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
          </Link>
        </section>
        {/* Right Sidebar */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-[#111e22] rounded-xl p-5 border border-slate-200 dark:border-[#325a67]">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="font-bold text-sm shrink-0">{t('dashboard.friendSuggestions')}</h3>
              <div className="relative min-w-0 max-w-[220px]" ref={friendSelectRef}>
                <button
                  type="button"
                  onClick={() => setFriendSelectOpen((o) => !o)}
                  className="w-full flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-[#325a67] bg-slate-50 dark:bg-[#233f48] hover:bg-slate-100 dark:hover:bg-[#2d4a54] px-2.5 py-0.5 text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-primary shrink-0 text-lg">
                    {friendTab === 'suggestions' ? 'person_add' : friendTab === 'sent' ? 'send' : 'mail'}
                  </span>
                  <span className="flex-1 text-[11px] font-medium text-slate-700 dark:text-[#92bbc9] truncate">
                    {friendTab === 'suggestions' ? t('dashboard.friendSuggestions') : friendTab === 'sent' ? t('dashboard.friendSentRequests') : t('dashboard.friendReceivedRequests')}
                  </span>
                  <span className={`material-symbols-outlined text-slate-400 dark:text-[#92bbc9] text-base shrink-0 transition-transform ${friendSelectOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {friendSelectOpen && (
                  <div className="absolute right-0 left-0 top-full z-10 mt-1.5 rounded-xl border border-slate-200 dark:border-[#325a67] bg-white dark:bg-[#111e22] shadow-lg py-1 overflow-hidden">
                    {[
                      { value: 'suggestions', label: t('dashboard.friendSuggestions'), icon: 'person_add' },
                      { value: 'sent', label: t('dashboard.friendSentRequests'), icon: 'send' },
                      { value: 'received', label: t('dashboard.friendReceivedRequests'), icon: 'mail' },
                    ].map(({ value, label, icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => { setFriendTab(value); setFriendSelectOpen(false) }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors ${
                          friendTab === value
                            ? 'bg-primary/10 text-primary dark:bg-primary/20'
                            : 'text-slate-700 dark:text-[#92bbc9] hover:bg-slate-50 dark:hover:bg-[#233f48]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{icon}</span>
                        <span className="truncate">{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4 min-h-[80px]">
              {friendTabLoading ? (
                <div className="flex items-center justify-center py-6">
                  <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
                </div>
              ) : friendTab === 'suggestions' ? (
                suggestionsList.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-[#92bbc9] py-2">{t('dashboard.noSuggestions')}</p>
                ) : (
                  suggestionsList.map((u) => {
                    const id = u?.id ?? u?._id
                    const name = u?.name || 'User'
                    const avatar = u?.avatar || (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
                    return (
                      <div key={id} className="flex items-center justify-between">
                        <Link to={id ? `/profile/${id}` : '#'} className="flex items-center gap-3 min-w-0">
                          <img src={avatar} alt="" className="size-9 rounded-full object-cover shrink-0" />
                          <div className="text-xs min-w-0">
                            <p className="font-bold truncate">{name}</p>
                            {u.mutualFriendsCount != null && u.mutualFriendsCount > 0 && (
                              <p className="text-[#92bbc9]">{u.mutualFriendsCount} {t('dashboard.mutualFriends')}</p>
                            )}
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            friendsService.sendRequest(id).then(() => loadFriendTabData('suggestions'))
                          }}
                          className="material-symbols-outlined text-primary hover:bg-primary/10 rounded-full p-1 transition-colors shrink-0"
                          title={t('dashboard.friendSuggestions')}
                        >
                          person_add
                        </button>
                      </div>
                    )
                  })
                )
              ) : friendTab === 'sent' ? (
                sentRequestsList.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-[#92bbc9] py-2">Chưa có lời mời đã gửi.</p>
                ) : (
                  sentRequestsList.map((r) => {
                    const to = r?.to || {}
                    const id = to?.id ?? to?._id
                    const name = to?.name || 'User'
                    const avatar = to?.avatar || (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
                    return (
                      <div key={r.friendshipId} className="flex items-center justify-between">
                        <Link to={id ? `/profile/${id}` : '#'} className="flex items-center gap-3 min-w-0">
                          <img src={avatar} alt="" className="size-9 rounded-full object-cover shrink-0" />
                          <p className="text-xs font-bold truncate">{name}</p>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            friendsService.cancelRequest(r.friendshipId).then(() => loadFriendTabData('sent'))
                          }}
                          className="text-xs font-medium text-amber-500 hover:bg-amber-500/10 px-2 py-1 rounded transition-colors shrink-0"
                        >
                          {t('userProfile.cancelRequest')}
                        </button>
                      </div>
                    )
                  })
                )
              ) : (
                receivedRequestsList.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-[#92bbc9] py-2">{t('dashboard.noReceivedRequests')}</p>
                ) : (
                  receivedRequestsList.map((r) => {
                    const from = r?.from || {}
                    const id = from?.id ?? from?._id
                    const name = from?.name || 'User'
                    const avatar = from?.avatar || (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
                    return (
                      <div key={r.friendshipId} className="flex items-center justify-between">
                        <Link to={id ? `/profile/${id}` : '#'} className="flex items-center gap-3 min-w-0">
                          <img src={avatar} alt="" className="size-9 rounded-full object-cover shrink-0" />
                          <p className="text-xs font-bold truncate">{name}</p>
                        </Link>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              friendsService.acceptRequest(r.friendshipId).then(() => loadFriendTabData('received'))
                            }}
                            className="material-symbols-outlined text-green-500 hover:bg-green-500/10 rounded-full p-1 transition-colors"
                            title={t('dashboard.acceptRequest')}
                          >
                            check
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              friendsService.cancelRequest(r.friendshipId).then(() => loadFriendTabData('received'))
                            }}
                            className="material-symbols-outlined text-red-400 hover:bg-red-500/10 rounded-full p-1 transition-colors"
                            title={t('userProfile.cancelRequest')}
                          >
                            close
                          </button>
                        </div>
                      </div>
                    )
                  })
                )
              )}
            </div>
            <Link to="/friends" className="block w-full mt-4 py-2 text-xs font-bold text-primary hover:underline text-center">
              {t('dashboard.viewAllSuggestions')}
            </Link>
          </div>
          <div className="bg-white dark:bg-[#111e22] rounded-xl p-5 border border-slate-200 dark:border-[#325a67]">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">people</span>
              {t('dashboard.friendsOnline')}
              <Link
                to={ROUTES.MESSAGES}
                className="ml-auto p-1 rounded-lg text-slate-500 hover:bg-primary/10 hover:text-primary transition-colors"
                title={t('messages.title')}
              >
                <span className="material-symbols-outlined text-lg">chat_bubble</span>
              </Link>
            </h3>
            <div className="space-y-3">
              {onlineFriends.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-[#92bbc9]">{t('dashboard.noFriendsOnline')}</p>
              ) : (
                onlineFriends.map((item) => {
                  const u = item?.user || item
                  const id = u?.id ?? u?._id
                  const name = u?.name || 'User'
                  const avatar = u?.avatar || (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#233f48] transition-colors group"
                    >
                      <Link to={id ? `/profile/${id}` : '#'} className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative shrink-0">
                          <img src={avatar} alt="" className="size-9 rounded-full object-cover" />
                          <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#111e22]" title={t('userProfile.online')} />
                        </div>
                        <span className="text-sm font-medium truncate">{name}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => navigate(`${ROUTES.MESSAGES}?with=${encodeURIComponent(id)}`, { state: { withUser: { id, name, avatar } } })}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors shrink-0"
                        title={t('messages.title')}
                      >
                        <span className="material-symbols-outlined text-lg">chat_bubble</span>
                      </button>
                    </div>
                  )
                })
              )}
            </div>
            {onlineFriends.length > 0 && (
              <Link to="/friends" className="block w-full mt-4 py-2 text-xs font-bold text-primary hover:underline text-center">
                {t('dashboard.viewAllFriends')}
              </Link>
            )}
          </div>
          <div className="bg-white dark:bg-[#111e22] rounded-xl p-5 border border-slate-200 dark:border-[#325a67]">
            <h3 className="font-bold text-sm mb-4 flex items-center justify-between">
              {t('dashboard.weeklyLeaderboard')}
              <span className="material-symbols-outlined text-yellow-500 text-lg">military_tech</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-yellow-500/5 rounded-lg border border-yellow-500/10">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-yellow-500 w-4">1</span>
                  <div className="size-8 rounded-full bg-slate-300 bg-cover bg-center" />
                  <span className="text-xs font-bold">Minh Anh</span>
                </div>
                <span className="text-xs font-semibold">2,450 XP</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-400 w-4 text-xs">2</span>
                  <div className="size-8 rounded-full bg-slate-300 bg-cover bg-center" />
                  <span className="text-xs font-medium">David H.</span>
                </div>
                <span className="text-xs">2,120 XP</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-400 w-4 text-xs">3</span>
                  <div className="size-8 rounded-full bg-slate-300 bg-cover bg-center" />
                  <span className="text-xs font-medium">Trung T.</span>
                </div>
                <span className="text-xs">1,980 XP</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#325a67]">
              <div className="flex items-center justify-between px-2 text-primary font-bold">
                <div className="flex items-center gap-3">
                  <span className="w-4 text-xs">12</span>
                  <span className="text-xs">{t('dashboard.yourRank')}</span>
                </div>
                <span className="text-xs">350 XP</span>
              </div>
            </div>
          </div>
        </aside>
      </main>
  )
}
