import { Link, useParams } from 'react-router-dom'
import {
  mockLessonChapters,
  mockQuizOptions,
  mockVocabCard,
  mockLessonLeaderboard,
} from '../raw'

export function ListeningLessonPage() {
  const { id } = useParams()

  return (
    <main className="max-w-[1440px] mx-auto p-6 grid grid-cols-12 gap-6">
      {/* Left sidebar */}
      <aside className="col-span-12 lg:col-span-3 space-y-6">
        <div className="bg-card-dark rounded-2xl border border-border-dark flex flex-col">
          <div className="p-5 border-b border-border-dark">
            <h3 className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-xs">
              <span className="material-symbols-outlined text-primary text-xl">account_tree</span>
              Topic Navigation
            </h3>
          </div>
          <div className="p-2 space-y-1">
            {mockLessonChapters.map((ch) => (
              <button
                key={ch.id}
                type="button"
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                  ch.active
                    ? 'text-primary bg-primary/10 border-r-[3px] border-r-primary'
                    : 'hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {ch.done ? (
                    <span className="material-symbols-outlined text-green-500 text-lg fill-icon">check_circle</span>
                  ) : ch.active ? (
                    <span className="material-symbols-outlined text-primary text-lg animate-pulse">play_circle</span>
                  ) : (
                    <span className="material-symbols-outlined text-gray-500 text-lg">radio_button_unchecked</span>
                  )}
                  <span className={`text-sm ${ch.active ? 'font-bold' : 'font-medium text-gray-400'}`}>{ch.label}</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400">{ch.time}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card-dark rounded-2xl border border-border-dark overflow-hidden">
          <div className="p-5 border-b border-border-dark">
            <h3 className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-xs">
              <span className="material-symbols-outlined text-primary text-xl">edit_note</span>
              My Study Notes
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <input
              type="text"
              placeholder="Note Title..."
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-1 focus:ring-primary focus:border-primary outline-none placeholder-gray-500"
            />
            <div className="border border-border-dark rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all bg-background-dark">
              <div className="flex items-center gap-1 p-1.5 bg-gray-800/50 border-b border-border-dark">
                <button type="button" className="p-1.5 hover:bg-gray-700 rounded transition-all text-gray-400 hover:text-primary">
                  <span className="material-symbols-outlined text-lg">format_bold</span>
                </button>
                <button type="button" className="p-1.5 hover:bg-gray-700 rounded transition-all text-gray-400 hover:text-primary">
                  <span className="material-symbols-outlined text-lg">format_italic</span>
                </button>
                <button type="button" className="p-1.5 hover:bg-gray-700 rounded transition-all text-gray-400 hover:text-primary">
                  <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
                </button>
                <div className="w-px h-4 bg-gray-600 mx-1" />
                <button type="button" className="p-1.5 hover:bg-gray-700 rounded transition-all text-gray-400 hover:text-primary">
                  <span className="material-symbols-outlined text-lg">link</span>
                </button>
              </div>
              <textarea
                placeholder="Start typing your insights here..."
                className="w-full h-32 bg-transparent border-none p-4 text-sm focus:ring-0 outline-none resize-none placeholder-gray-500"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Category</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="px-3 py-1 text-[10px] font-bold rounded-full border border-primary bg-primary/10 text-primary">
                  Grammar
                </button>
                <button type="button" className="px-3 py-1 text-[10px] font-bold rounded-full border border-border-dark text-gray-400 hover:border-primary/50 hover:text-primary transition-all">
                  Vocabulary
                </button>
                <button type="button" className="px-3 py-1 text-[10px] font-bold rounded-full border border-border-dark text-gray-400 hover:border-primary/50 hover:text-primary transition-all">
                  Idea
                </button>
              </div>
            </div>
            <button type="button" className="w-full py-2.5 bg-primary text-background-dark font-bold text-sm rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">save</span>
              Save Note
            </button>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex gap-4 items-start">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary font-bold">lightbulb</span>
          </div>
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Listening Tip</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Try visualizing the speaker&apos;s environment. Mental imagery helps create stronger neural connections, making it easier to recall specific vocabulary used in context later.
            </p>
          </div>
        </div>
      </aside>

      {/* Center - player + quiz */}
      <div className="col-span-12 lg:col-span-6 space-y-6">
        <div className="bg-card-dark rounded-3xl overflow-hidden border border-border-dark">
          <div className="relative h-72 overflow-hidden">
            <img
              alt="Global Tech Trends"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4HGxIdV3l5X2mkEfiDcHWc2Y5aGHTz2uKSFV1cxjanokQtrBTJwUSKVy0ZIa_BAl54BFADXdywZkVEGqeYH6AXQ7sXrTLZZuQZwZ18ze7GKTQBsRoDSL5S87sB9tE5-qqfQq9E5O0i1ainzpepCs8YqOXSO06GzgPidQm19jGW-7LzvP3uh21RkqF4Qiftao5ScjbX6DvlPiAoSG2g-bQNmzXcqEZcpRKjV4Ag4tn6q16GpFb8tTsGG8FKmg2kDbYpfIzJR7AZcH1"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent" />
            <div className="absolute top-5 left-5">
              <span className="bg-primary text-background-dark text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                Audio Content
              </span>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-3xl font-black text-white mb-4">Global Tech Trends: AI Evolution</h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="material-symbols-outlined text-primary text-sm">signal_cellular_alt</span>
                  <span className="text-xs font-bold text-white">Difficulty: B2</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="material-symbols-outlined text-primary text-sm">public</span>
                  <span className="text-xs font-bold text-white">Accent: American</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                  <span className="text-xs font-bold text-white">Duration: 12m</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="material-symbols-outlined text-primary text-sm">quiz</span>
                  <span className="text-xs font-bold text-white">Total: 10 Questions</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 bg-gray-800/30 border-b border-border-dark">
            <div className="flex items-center gap-6">
              <button type="button" className="w-14 h-14 flex items-center justify-center rounded-full bg-primary text-background-dark hover:scale-105 transition-transform shadow-lg">
                <span className="material-symbols-outlined text-3xl fill-icon">play_arrow</span>
              </button>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Playback Progress</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary">04:12</span>
                    <span className="text-xs font-bold text-gray-400">/ 12:45</span>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-gray-700 rounded-full relative cursor-pointer group">
                  <div className="absolute left-0 top-0 h-full w-[35%] bg-primary rounded-full" />
                  <div className="absolute left-[35%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full group-hover:scale-125 transition-transform" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button type="button" className="text-gray-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">replay_10</span>
                </button>
                <div className="h-8 w-px bg-gray-600" />
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 text-xl">volume_up</span>
                  <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-primary rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex justify-between items-start gap-6">
              <div className="space-y-3 flex-1">
                <span className="inline-block px-3 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                  Question 01 of 10
                </span>
                <h1 className="text-xl font-bold leading-snug text-white">
                  Based on the audio content, what is the primary factor driving the current &quot;AI Revolution&quot; according to the speaker?
                </h1>
              </div>
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 border-primary/20 bg-primary/5 shrink-0">
                <span className="text-[10px] font-bold text-primary uppercase leading-none mb-1">Timer</span>
                <span className="text-xl font-black text-primary leading-none">60s</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {mockQuizOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    opt.correct
                      ? 'border-2 border-primary bg-primary/5'
                      : 'border-border-dark hover:border-primary hover:bg-gray-800/40'
                  }`}
                >
                  <input type="radio" name="quiz" className="hidden peer" defaultChecked={opt.correct} />
                  <div className="relative w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 border-primary bg-primary">
                    <div className="w-2.5 h-2.5 rounded-full bg-white scale-100" />
                  </div>
                  <span className={`font-medium ${opt.correct ? 'font-bold text-white' : 'text-gray-400'}`}>
                    {opt.text}
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-4 pt-6 flex items-center justify-between border-t border-border-dark">
              <button type="button" className="px-6 py-3 flex items-center gap-2 rounded-2xl text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="font-bold">Previous</span>
              </button>
              <div className="flex gap-4">
                <button type="button" className="px-8 py-3 rounded-2xl border border-border-dark font-bold hover:bg-gray-700 transition-all">
                  Next
                </button>
                <button type="button" className="px-10 py-3 rounded-2xl bg-primary text-background-dark font-black hover:brightness-110 transition-all active:scale-95">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <aside className="col-span-12 lg:col-span-3 space-y-6">
        <div className="bg-card-dark rounded-2xl p-5 border border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2 uppercase tracking-wider text-xs text-white">
              <span className="material-symbols-outlined text-primary text-xl">style</span>
              Key Vocabulary
            </h3>
            <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded">{mockVocabCard.progress}</span>
          </div>
          <div className="space-y-4">
            <div className="p-5 bg-gray-800/80 rounded-2xl border-2 border-primary/20 relative group cursor-pointer hover:border-primary transition-all">
              <div className="mb-3">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Active Word</span>
                <h4 className="text-xl font-black text-white">{mockVocabCard.word}</h4>
                <p className="text-[11px] text-gray-500 italic font-medium">{mockVocabCard.phonetic}</p>
              </div>
              <div className="pt-3 border-t border-gray-600">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Meaning</span>
                <p className="text-sm leading-relaxed text-gray-300 mt-1">{mockVocabCard.meaning}</p>
              </div>
              <button type="button" className="absolute top-4 right-4 text-gray-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">volume_up</span>
              </button>
            </div>
            <div className="flex justify-center gap-3">
              <button type="button" className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button type="button" className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card-dark rounded-2xl p-5 border border-border-dark">
          <h3 className="flex items-center gap-2 font-bold mb-4 uppercase tracking-wider text-xs text-white">
            <span className="material-symbols-outlined text-orange-400">emoji_events</span>
            Weekly Leaderboard
          </h3>
          <div className="space-y-3">
            {mockLessonLeaderboard.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  user.rank === 1 ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {user.rank === 1 ? (
                      <img
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border-2 border-amber-500"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFxvwb_V3cX3qo4jc2iqwsYSF58Vogud4GgCWmY5oZL7aSDNmcZAQRmhwE-fhejXtlKlavTY7CIjJ0XXKit2ehZu9b1_kAouSONwgAptSXZ7blu5peijn0CjdxvTr-40H9-C1nHQykK6V7Jmmw2OMtfa1M2_PO5IOCq5e22soosJ-AymJmioYxosh4m99GleDCRre38H5ytORBXDSSDZ27CvuS0S3-rRH54SPkbUgtlUQQMBu4EcAK7GPWF7YakgrFJoDs6KbwCndu"
                      />
                    ) : user.rank === 2 ? (
                      <img
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-500"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSt41woVTSo2psosnpS1Mz_cgGlnsOONUZ4kmFSFq_U0T3_YUNnStlUS-t4Og1djYwbWhRQ_X2VWcPoyd8NdZral0xdAh9FFFGBa3jQUMv3PEUHU3nLdfNNDYZRbHnOAWZ8BlDpdXm3DuZW4M-ZISpEzle1tS6AnBvMRJ4wELd4NQbqYRHxNktZZ3LMnpl6wPY18D6nk1C2-N_W-fd7_E1WkdXsV5We2wkWmcWZ32FdhDViSSFBYs7MaqHbsz_RpGF4GuhAS55uXjD"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border-2 border-orange-400/50">
                        JD
                      </div>
                    )}
                    <span
                      className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-card-dark ${
                        user.rank === 1 ? 'bg-amber-500 text-white' : user.rank === 2 ? 'bg-gray-500 text-white' : 'bg-orange-400 text-white'
                      }`}
                    >
                      {user.rank}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <p className={`text-[10px] font-bold ${user.rank === 1 ? 'text-amber-500' : 'text-gray-500'}`}>{user.xp}</p>
                  </div>
                </div>
                {user.rank === 1 && <span className="material-symbols-outlined text-amber-500 text-xl fill-icon">star</span>}
                {user.rank === 2 && <span className="text-[10px] font-black text-green-500">+12%</span>}
                {user.rank === 3 && <span className="text-[10px] font-black text-green-500">+5%</span>}
              </div>
            ))}
          </div>
          <Link
            to="/"
            className="block w-full mt-4 py-2.5 text-xs font-black text-primary hover:bg-primary/10 rounded-xl transition-all border border-transparent hover:border-primary/20 text-center"
          >
            View Full Rankings
          </Link>
        </div>
      </aside>
    </main>
  )
}
