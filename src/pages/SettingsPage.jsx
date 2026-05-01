import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../constants'
import { useAuth } from '../context/AuthContext'
import { LanguageSwitcher } from '../components/ui/common/LanguageSwitcher'

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const isVi = i18n.language?.startsWith('vi')
  
  const [activeTab, setActiveTab] = useState('account')
  
  // Settings state (mocking persistence)
  const [settings, setSettings] = useState({
    darkMode: document.documentElement.classList.contains('dark'),
    sfx: localStorage.getItem('game_sfx') !== 'false',
    music: localStorage.getItem('game_music') !== 'false',
    profilePublic: true,
    emailNotifications: true,
  })

  const toggleSetting = (key) => {
    const newValue = !settings[key]
    setSettings(prev => ({ ...prev, [key]: newValue }))
    
    if (key === 'darkMode') {
      if (newValue) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    } else if (key === 'sfx') {
      localStorage.setItem('game_sfx', newValue)
    } else if (key === 'music') {
      localStorage.setItem('game_music', newValue)
    }
  }

  const tabs = [
    { id: 'account', icon: 'person', label: t('settings.account') },
    { id: 'appearance', icon: 'palette', label: t('settings.appearance') },
    { id: 'notifications', icon: 'notifications', label: t('settings.notifications') },
    { id: 'privacy', icon: 'lock', label: t('settings.privacy') },
  ]

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 min-h-[calc(100vh-80px)]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link to={ROUTES.HOME} className="hover:text-primary flex items-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-[18px]">home</span>
              {t('header.home')}
            </Link>
            <span>/</span>
            <span className="text-primary font-medium">{t('settings.title')}</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('settings.subtitle')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t('settings.desc')}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-x-1'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5 p-6 sm:p-10 shadow-sm backdrop-blur-sm">
          
          {activeTab === 'account' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <section>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="size-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">mail</span>
                  </span>
                  {t('settings.loginInfo')}
                </h3>
                <div className="grid gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('settings.currentEmail')}</p>
                      <p className="text-slate-900 dark:text-white font-medium">{user?.email || 'user@example.com'}</p>
                    </div>
                    <button className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-primary border border-slate-200 dark:border-white/10 rounded-lg hover:bg-primary hover:text-white transition-all">
                      {t('settings.change')}
                    </button>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('settings.password')}</p>
                      <p className="text-slate-900 dark:text-white font-medium">••••••••••••</p>
                    </div>
                    <button className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-primary border border-slate-200 dark:border-white/10 rounded-lg hover:bg-primary hover:text-white transition-all">
                      {t('settings.update')}
                    </button>
                  </div>
                </div>
              </section>

              <section className="pt-8 border-t border-slate-100 dark:border-white/5">
                <h3 className="text-lg font-bold text-red-500 mb-4">{t('settings.dangerZone')}</h3>
                <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {t('settings.deleteDesc')}
                  </p>
                  <button className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
                    {t('settings.deleteBtn')}
                  </button>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('settings.language')}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.languageDesc')}</p>
                  </div>
                  <LanguageSwitcher />
                </div>
              </section>

              <section className="pt-10 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('settings.darkMode')}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.darkModeDesc')}</p>
                  </div>
                  <button 
                    onClick={() => toggleSetting('darkMode')}
                    className={`relative w-16 h-8 rounded-full transition-all duration-500 focus:outline-none shadow-inner ${settings.darkMode ? 'bg-primary' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 size-6 bg-white rounded-full transition-all duration-500 transform ${settings.darkMode ? 'left-9 rotate-[360deg]' : 'left-1 rotate-0'} flex items-center justify-center shadow-lg`}>
                      <span className="material-symbols-outlined text-[14px] text-slate-900">
                        {settings.darkMode ? 'dark_mode' : 'light_mode'}
                      </span>
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button 
                    onClick={() => settings.darkMode && toggleSetting('darkMode')}
                    className={`relative group p-4 rounded-2xl border-2 transition-all ${!settings.darkMode ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10' : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 bg-slate-50 dark:bg-white/5'}`}
                  >
                    <div className="aspect-[4/3] rounded-xl bg-slate-100 mb-4 overflow-hidden border border-slate-200 p-2 space-y-2">
                       <div className="h-2 w-1/2 bg-slate-300 rounded-full" />
                       <div className="h-8 w-full bg-white rounded-lg shadow-sm" />
                       <div className="grid grid-cols-2 gap-2">
                          <div className="h-10 bg-white rounded-lg shadow-sm" />
                          <div className="h-10 bg-white rounded-lg shadow-sm" />
                       </div>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">Light Mode</p>
                    <p className="text-xs text-slate-500 mt-1">Clean and professional for daytime use</p>
                    {!settings.darkMode && (
                      <div className="absolute top-4 right-4 size-6 bg-primary text-white rounded-full flex items-center justify-center animate-in zoom-in">
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </div>
                    )}
                  </button>

                  <button 
                    onClick={() => !settings.darkMode && toggleSetting('darkMode')}
                    className={`relative group p-4 rounded-2xl border-2 transition-all ${settings.darkMode ? 'border-primary bg-primary/10 shadow-xl shadow-primary/20' : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 bg-slate-50 dark:bg-white/5'}`}
                  >
                    <div className="aspect-[4/3] rounded-xl bg-[#0a0f12] mb-4 overflow-hidden border border-[#1a1f22] p-2 space-y-2">
                       <div className="h-2 w-1/2 bg-slate-700 rounded-full" />
                       <div className="h-8 w-full bg-[#111e22] rounded-lg border border-[#325a67]" />
                       <div className="grid grid-cols-2 gap-2">
                          <div className="h-10 bg-[#111e22] rounded-lg border border-[#325a67]" />
                          <div className="h-10 bg-[#111e22] rounded-lg border border-[#325a67]" />
                       </div>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">Dark Mode</p>
                    <p className="text-xs text-slate-500 mt-1">Easier on the eyes in low light conditions</p>
                    {settings.darkMode && (
                      <div className="absolute top-4 right-4 size-6 bg-primary text-white rounded-full flex items-center justify-center animate-in zoom-in">
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </div>
                    )}
                  </button>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <section>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">{t('settings.games')}</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">volume_up</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{t('settings.sfx')}</p>
                        <p className="text-xs text-slate-500">SFX in Snake Word, Word Scramble</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleSetting('sfx')}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${settings.sfx ? 'bg-primary' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 size-5 bg-white rounded-full transition-transform duration-300 ${settings.sfx ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">music_note</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{t('settings.music')}</p>
                        <p className="text-xs text-slate-500">Ambient music during study sessions</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleSetting('music')}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${settings.music ? 'bg-primary' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 size-5 bg-white rounded-full transition-transform duration-300 ${settings.music ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </section>

              <section className="pt-8 border-t border-slate-100 dark:border-white/5">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">{t('settings.system')}</h3>
                <div className="flex items-center justify-between p-4">
                  <p className="font-bold text-slate-900 dark:text-white">{t('settings.emailNotif')}</p>
                  <button 
                    onClick={() => toggleSetting('emailNotifications')}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${settings.emailNotifications ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 size-5 bg-white rounded-full transition-transform duration-300 ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4 mb-6">
                  <span className="material-symbols-outlined text-blue-500 mt-0.5">info</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t('settings.privacyNotice')}
                  </p>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{t('settings.publicProfile')}</p>
                      <p className="text-xs text-slate-500">{t('settings.publicProfileDesc')}</p>
                    </div>
                    <button 
                      onClick={() => toggleSetting('profilePublic')}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${settings.profilePublic ? 'bg-primary' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 size-5 bg-white rounded-full transition-transform duration-300 ${settings.profilePublic ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
