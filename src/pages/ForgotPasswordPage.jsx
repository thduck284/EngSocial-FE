import { useState } from 'react'
import { Link } from 'react-router-dom'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: call API gửi mã
  }

  return (
    <div className="bg-textured text-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card-dark rounded-2xl overflow-hidden shadow-2xl border border-slate-800 p-8 md:p-12">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 text-primary mb-2">
            <div className="size-12">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path
                  d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">EngSocial</h1>
          </div>
        </div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-3">Quên mật khẩu?</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn để đặt lại mật khẩu.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2" htmlFor="email">
              Email của bạn
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-500 group-focus-within:text-primary transition-colors text-xl">
                mail
              </span>
              <input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:border-primary focus:ring-0 input-glow transition-all placeholder-slate-600"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3.5 bg-primary hover:brightness-110 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-primary/20 text-base"
          >
            Gửi mã xác nhận
          </button>
        </form>
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-primary font-medium transition-colors group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
      <div className="fixed -top-20 -left-20 size-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed -bottom-20 -right-20 size-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  )
}
