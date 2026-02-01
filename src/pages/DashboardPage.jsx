import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  mockSkillStats,
  mockFeaturedLessons,
  mockGoals,
  mockSuggestedGroups,
} from '../raw'

export function DashboardPage() {
  const { t } = useTranslation()
  return (
    <main className="max-w-[1440px] mx-auto grid grid-cols-12 gap-6 p-6">
        {/* Left Sidebar */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-[#111e22] rounded-xl p-5 border border-slate-200 dark:border-[#325a67]">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="size-14 rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCAGuekdnsUYQCD94kbmMXxQJIDdIL4jHmobUmicR2MrPfQNMNAHt1kh0f2sg8KDXoj-4wFBbRYsgI1WbW-etIl-yQvA0npLHwU5-psosYe42Zf-u1nGm-4eK0pVqMXYmEKVC8MhkwXthJnRKaH-EoBfm3gWmvne6dTEuU1S70MJ3sO7Fsyqh9kAGMKeVDiBHjwq2urcm0BHfZTetlVH9UGz2bsuj_XT1DHSQgFMLJJ94QzJVdWWfZbxDIB4c8jvKQC7eoFNDQB5RHl')`,
                }}
              />
              <div>
                <h2 className="font-bold text-lg">John Doe</h2>
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
              {mockSkillStats.map(({ icon, label, value, change, changeColor, to }) => (
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
              {mockGoals.map(({ done, labelKey }) => (
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
            <div className="flex gap-4 mb-4">
              <div
                className="size-10 rounded-full bg-cover bg-center shrink-0"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCzY9JpbDHTO2wc21xH1QgNC1gOoaGEVwLvMEIQs1Qs0T_P7MzuFavuf6Y_KBhYbp9GpsDTpMDHO34x_VqM3RLxgP24TmDd0FUK4f62vq8PbbKmkepzoYCJNY_OAm6ntHBVrl-EjVmLLebnLNTnQhDYem-Hffxw64l3TSt9YzQ1UNO1AePqW7XkKIFQnYBLQ36asXLUXTtZyjPft0GfSnviugX-qRsIxmvSdCElpXSJUGrnN9xFWV0GDFeyKeNzIespYn44loFnCQgt')`,
                }}
              />
              <div className="flex-1 bg-slate-50 dark:bg-[#233f48] rounded-xl px-4 py-2 text-slate-400 dark:text-[#92bbc9] text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-[#325a67] transition-colors">
                {t('dashboard.postPlaceholder')}
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#325a67]">
              <div className="flex gap-1">
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#233f48] rounded-lg text-xs font-medium transition-colors">
                  <span className="material-symbols-outlined text-green-500 text-lg">image</span> {t('dashboard.image')}
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#233f48] rounded-lg text-xs font-medium transition-colors">
                  <span className="material-symbols-outlined text-red-500 text-lg">videocam</span> {t('dashboard.video')}
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#233f48] rounded-lg text-xs font-medium transition-colors">
                  <span className="material-symbols-outlined text-blue-500 text-lg">description</span> {t('dashboard.document')}
                </button>
              </div>
              <button className="px-5 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:brightness-110 transition-all">
                {t('dashboard.post')}
              </button>
            </div>
          </div>
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
          {/* Sample post */}
          <div className="bg-white dark:bg-[#111e22] rounded-xl border border-slate-200 dark:border-[#325a67] overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div
                    className="size-11 rounded-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDEX2J4BDuSA0P-UyZIHU075ztfDY1w4UoDRuab_pHxwgn_KL9V_W_HOqHc4IoJFA23uNc7xO_W7Imc_rfJEyHM22WUS97S30371NzDaYPcxUOCAMQupzcJb8SGXcaQV7jWlvT56e7ozPunmMJX71T84STM6UQaYO5U_tIkxTELxnk3oEk6mDMUZeoHynKyTVkzY1GjiBLpj0ZR_a6cgZ7PCpbl_WkaPZcYor-l0pY3f6lUXJIYJzN3jMHHgimWvjI5V_NSPzEkuKjW')`,
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm">Elena Rodriguez</h4>
                      <span className="material-symbols-outlined text-primary text-[16px] fill-icon">verified</span>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">
                        READING
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-[#92bbc9]">2 giờ trước • Công khai</p>
                  </div>
                </div>
                <button className="text-slate-400 dark:text-[#92bbc9]">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                Vừa mới hoàn thành bài đọc về &quot;Modern Architecture&quot; trên BBC Learning English. Có rất nhiều từ
                vựng mới về bền vững (sustainability) và cấu trúc (framework). Mọi người cùng thảo luận nhé! 📚✨
              </p>
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-[#325a67]">
                <img
                  alt="Architecture study"
                  className="w-full h-64 object-cover"
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
                />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 dark:border-[#325a67] flex items-center justify-between">
              <div className="flex gap-6">
                <button className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-[#92bbc9] hover:text-red-500 transition-colors">
                  <span className="material-symbols-outlined text-xl">favorite</span> 124
                </button>
                <button className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-[#92bbc9] hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">chat_bubble</span> 42
                </button>
                <button className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-[#92bbc9] hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">share</span>
                </button>
              </div>
              <button className="text-slate-500 dark:text-[#92bbc9] hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">bookmark</span>
              </button>
            </div>
            <div className="px-5 py-4 bg-slate-50 dark:bg-[#111e22]/50 border-t border-slate-100 dark:border-[#325a67] flex gap-3">
              <div
                className="size-8 rounded-full bg-cover bg-center shrink-0"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDPFWhZ-rs5LZv31txw6cm5gzHY8FdK7YTJrPa9fwKDd3eN6Xqmfl_wjWQ7wI6Yhm8AtpDcy6fJHO5qMbc6EaZuHpsrpbnn0HYMK9rTcWYEdWClOXMwGOtf4UNPUNEuZvVdO1yjR-fvOY4-e61yl0pKpnQW1im8IghmH8zjAnlG22bwdWDBxh8m8R8TPz3p-F6jG16qcg6vgS4eboFH1E5iC-2msE4m0L5kN3b73lUbQHr-nz5p8p1r-9nFISlDCQ7NP2xdegTOc1_e')`,
                }}
              />
              <input
                type="text"
                placeholder="Viết bình luận..."
                className="flex-1 bg-white dark:bg-[#233f48] border border-slate-200 dark:border-none rounded-lg px-4 py-1.5 text-sm focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>
          {/* Gợi ý bài học cho bạn */}
          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-[#325a67]" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-[#92bbc9] uppercase tracking-widest">
              {t('dashboard.suggestedLessons')}
            </span>
            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-[#325a67]" />
          </div>
          <Link
            to="/skills/writing"
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
          <div className="bg-white dark:bg-[#111e22] rounded-xl p-4 border border-slate-200 dark:border-[#325a67]">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 dark:text-[#92bbc9] text-xl">
                search
              </span>
              <input
                type="text"
                placeholder={t('dashboard.quickSearch')}
                className="w-full bg-slate-50 dark:bg-[#233f48] border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="bg-white dark:bg-[#111e22] rounded-xl p-5 border border-slate-200 dark:border-[#325a67]">
            <h3 className="font-bold text-sm mb-4">{t('dashboard.friendSuggestions')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="size-9 rounded-full bg-cover bg-center bg-slate-300"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAoXGEnJoxgQxywYi4WPAOtB40WXq8kh7fTyMwuGC7gYFcPp-B8qbQSmv6GuXs2p8IxvtC370Z0WAKCeDg2V1nGjZ4wz1c_QdyvecDrnCWfENaMpRxjidsw1gwYH__A52WrC_AT7egrH4lVh_cHhbYZpfQRVyPrvHFJ9vanYhKSpeBxJjI7eQOOUdkJ7er9keiH4rNw6O2KKUJ6m2y3YWtHLNhxep-iokctHHSC339RpsrOn73tZt4vy40SleGpbtqCGFhiwfZJtg2G')`,
                    }}
                  />
                  <div className="text-xs">
                    <p className="font-bold">Alex Thompson</p>
                    <p className="text-[#92bbc9]">8 {t('dashboard.mutualFriends')}</p>
                  </div>
                </div>
                <button className="material-symbols-outlined text-primary hover:bg-primary/10 rounded-full p-1 transition-colors">
                  person_add
                </button>
              </div>
            </div>
            <Link to="/friends" className="block w-full mt-4 py-2 text-xs font-bold text-primary hover:underline text-center">
              {t('dashboard.viewAllSuggestions')}
            </Link>
          </div>
          <div className="bg-white dark:bg-[#111e22] rounded-xl p-5 border border-slate-200 dark:border-[#325a67]">
            <h3 className="font-bold text-sm mb-4">{t('dashboard.studyGroups')}</h3>
            <div className="space-y-4">
              {mockSuggestedGroups.map(({ icon, title, members, color }) => (
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
            <h3 className="font-bold text-sm mb-4">{t('dashboard.featuredLessons')}</h3>
            <div className="space-y-4">
              {mockFeaturedLessons.map(({ title, icon, skill, level, to, learners }) => (
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
            <Link to="/skills/reading" className="block w-full mt-4 py-2 text-xs font-bold text-primary hover:underline text-center">
              {t('dashboard.viewAllSkills')}
            </Link>
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
