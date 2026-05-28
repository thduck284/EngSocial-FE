import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../constants'
import { EntertainmentSnakeWord, SNAKE_COLORS } from '../components/entertainment/EntertainmentSnakeWord'
import { SnakeWordGameArena } from '../components/entertainment/SnakeWordGameArena'

export function EntertainmentSnakeWordPage() {
  const { t, i18n } = useTranslation()
  const isVi = i18n.language?.startsWith('vi')
  const [view, setView] = useState('menu') // 'menu', 'play', 'guide', 'customize'

  const [selectedColorId, setSelectedColorId] = useState(() => {
     return localStorage.getItem('snake_color') || 'cyan'
  })

  const handleSelectColor = (id) => {
     setSelectedColorId(id)
     localStorage.setItem('snake_color', id)
  }

  return (
    <SnakeWordGameArena
      topBar={
        <div className=" SG-lobby-top-bar flex items-center justify-between w-full px-1">
          <Link to={ROUTES.SKILLS.ENTERTAINMENT} className="sg-link-back">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span className="hidden sm:inline">{t('enter.backToGameList')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-cyan-300/80 px-2 py-1 rounded-lg border border-cyan-500/30 bg-cyan-950/40">
              {isVi ? 'Thế giới MMO' : 'MMO World'}
            </span>
          </div>
        </div>
      }
    >
      {view === 'play' && (
         <div className="relative w-full h-full flex flex-col animate-in fade-in zoom-in-95 duration-500">
            <EntertainmentSnakeWord onExit={() => setView('menu')} />
         </div>
      )}

      {view === 'menu' && (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/50 backdrop-blur-md rounded-2xl border border-white/5 p-8 text-center animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
           {/* Background glow */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
           
           <div className="mb-12 relative z-10">
              <h1 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-cyan-500 to-blue-600 mb-4 drop-shadow-[0_0_25px_rgba(34,211,238,0.4)] tracking-tighter">
                SNAKE WORD
              </h1>
              <p className="text-slate-400 text-lg sm:text-xl tracking-[0.3em] uppercase font-black">
                {isVi ? 'Thế giới Đa người chơi' : 'Multiplayer World'}
              </p>
           </div>
           
           <div className="flex flex-col gap-4 w-full max-w-sm relative z-10">
             <button 
               onClick={() => setView('play')}
               className="group relative px-8 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(34,211,238,0.3)] hover:shadow-[0_0_60px_rgba(34,211,238,0.5)] active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
             >
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
               <span className="material-symbols-outlined text-3xl relative z-10">play_arrow</span>
               <span className="relative z-10 tracking-widest uppercase">
                 {isVi ? 'Chơi ngay' : 'Play Now'}
               </span>
             </button>

             <button 
               onClick={() => setView('guide')}
               className="px-8 py-4 bg-slate-800/80 backdrop-blur border border-slate-700/50 hover:bg-slate-700 hover:border-slate-600 text-white rounded-2xl font-bold text-lg hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-3"
             >
               <span className="material-symbols-outlined text-cyan-400">menu_book</span>
               {isVi ? 'Hướng dẫn chơi' : 'How To Play'}
             </button>

             <button 
               onClick={() => setView('customize')}
               className="px-8 py-4 bg-slate-800/80 backdrop-blur border border-slate-700/50 hover:bg-slate-700 hover:border-slate-600 text-white rounded-2xl font-bold text-lg hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-3"
             >
               <span className="material-symbols-outlined text-fuchsia-400">palette</span>
               {isVi ? 'Tùy chỉnh Rắn' : 'Customize Snake'}
             </button>
           </div>
        </div>
      )}

      {view === 'guide' && (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 w-full max-w-2xl mx-auto text-left animate-in fade-in slide-in-from-bottom-8 duration-500 max-h-full overflow-y-auto custom-scrollbar">
           <h2 className="text-2xl sm:text-3xl font-black text-cyan-400 mb-6 w-full text-center tracking-widest uppercase drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0">
             {isVi ? 'Hướng dẫn chơi' : 'How To Play'}
           </h2>
           <div className="space-y-3 text-slate-300 text-sm sm:text-base w-full">
              <div className="flex items-start gap-3 bg-slate-900/80 p-4 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                 <span className="material-symbols-outlined text-cyan-400 text-3xl shrink-0">mouse</span>
                 <div>
                    <strong className="text-white block mb-0.5">{isVi ? 'Điều khiển Rắn' : 'Steer your Snake'}</strong>
                    <p className="text-slate-400 text-sm">
                      {isVi ? 'Di chuyển theo con trỏ chuột hoặc chạm liên tục (360 độ). Không cần nhấn chuột.' : 'Follows your mouse pointer or touch continuously (360 degrees). No clicking required.'}
                    </p>
                 </div>
              </div>
              <div className="flex items-start gap-3 bg-slate-900/80 p-4 rounded-xl border border-white/5 hover:border-amber-400/30 transition-colors">
                 <span className="material-symbols-outlined text-amber-400 text-3xl shrink-0">keyboard_double_arrow_up</span>
                 <div>
                    <strong className="text-white block mb-0.5">{isVi ? 'Tăng tốc' : 'Boost Speed'}</strong>
                    <p className="text-slate-400 text-sm">
                      {isVi ? 'Giữ phím Cách (Space), hoặc nhấn giữ chuột trái (hoặc chạm) để tăng tốc.' : 'Hold Spacebar, or click and hold the Left Mouse Button (or touch) to sprint.'}
                    </p>
                 </div>
              </div>
              <div className="flex items-start gap-3 bg-slate-900/80 p-4 rounded-xl border border-white/5 hover:border-emerald-400/30 transition-colors">
                 <span className="material-symbols-outlined text-emerald-400 text-3xl shrink-0">track_changes</span>
                 <div>
                    <strong className="text-white block mb-0.5">{isVi ? 'Từ mục tiêu' : 'Target Word'}</strong>
                    <p className="text-slate-400 text-sm">
                      {isVi ? 'Xem nghĩa của từ ở góc trên bên trái. Tìm từ tiếng Anh tương ứng trên bản đồ!' : 'Look at the top-left corner for your Target Meaning. Find the matching English word on the map!'}
                    </p>
                 </div>
              </div>
              <div className="flex items-start gap-3 bg-slate-900/80 p-4 rounded-xl border border-white/5 hover:border-rose-500/30 transition-colors">
                 <span className="material-symbols-outlined text-rose-500 text-3xl shrink-0">skull</span>
                 <div>
                    <strong className="text-white block mb-0.5">{isVi ? 'Sinh tồn' : 'Survival'}</strong>
                    <p className="text-slate-400 text-sm">
                      {isVi ? 'Đừng đâm vào thân của người chơi khác. Ăn sai từ sẽ làm giảm chiều dài và điểm số của bạn!' : 'Do not crash into other players\' bodies. Eating wrong words will reduce your length and score!'}
                    </p>
                 </div>
              </div>
           </div>
           <button 
             onClick={() => setView('menu')}
             className="mt-6 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95 border border-white/10 shrink-0"
           >
             {isVi ? 'Quay lại Menu' : 'Back to Menu'}
           </button>
        </div>
      )}

      {view === 'customize' && (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8 w-full max-w-3xl mx-auto text-center animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden max-h-full overflow-y-auto custom-scrollbar">
           <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-[80px] rounded-full pointer-events-none" />
           <span className="material-symbols-outlined text-6xl text-fuchsia-400 mb-4 block shrink-0">palette</span>
           <h2 className="text-3xl sm:text-4xl font-black text-white mb-8 tracking-tighter shrink-0">
             {isVi ? 'Tùy chỉnh Rắn' : 'Customize Your Snake'}
           </h2>
           
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10 w-full shrink-0">
              {SNAKE_COLORS.map(color => (
                 <button
                   key={color.id}
                   onClick={() => handleSelectColor(color.id)}
                   className={`relative p-5 rounded-2xl border-2 transition-all group overflow-hidden ${
                     selectedColorId === color.id 
                       ? 'border-white bg-white/10 scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                       : 'border-white/10 bg-slate-900/50 hover:border-white/30 hover:bg-slate-800'
                   }`}
                 >
                    {selectedColorId === color.id && (
                       <div className="absolute top-2 right-2 bg-white rounded-full p-0.5">
                         <span className="material-symbols-outlined text-[14px] text-slate-900 font-bold block">check</span>
                       </div>
                    )}
                    <div className="flex items-center justify-center gap-1.5 mb-4">
                       <div className="size-8 rounded-full shadow-[0_0_15px_currentColor]" style={{ backgroundColor: color.head, color: color.head }} />
                       <div className="size-6 rounded-full opacity-80" style={{ backgroundColor: color.body }} />
                       <div className="size-4 rounded-full opacity-60" style={{ backgroundColor: color.body }} />
                    </div>
                    <span className="text-sm sm:text-base font-bold text-slate-300 group-hover:text-white transition-colors block">{color.name}</span>
                 </button>
              ))}
           </div>

           <button 
             onClick={() => setView('menu')}
             className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95 border border-white/10 relative z-10 shrink-0"
           >
             {isVi ? 'Lưu & Quay lại' : 'Save & Return'}
           </button>
        </div>
      )}
    </SnakeWordGameArena>
  )
}
