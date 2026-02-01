import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout, SocialButtons } from '../components/layout/AuthLayout'

const loginLeftContent = (
  <>
    <h2 className="text-3xl font-bold leading-tight mb-4">
      Master English,<br />Connect with the World.
    </h2>
    <p className="text-slate-400 text-lg mb-8">
      Tham gia cùng hơn 50,000 học viên mỗi ngày để rèn luyện kỹ năng và chia sẻ kiến thức.
    </p>
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">groups</span>
        <span className="text-sm font-medium text-slate-300">Cộng đồng học tập năng động</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">auto_graph</span>
        <span className="text-sm font-medium text-slate-300">Theo dõi tiến độ học tập chi tiết</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">forum</span>
        <span className="text-sm font-medium text-slate-300">Luyện nói cùng người bản xứ</span>
      </div>
    </div>
  </>
)

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: call auth API
  }

  return (
    <AuthLayout leftContent={loginLeftContent}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Chào mừng trở lại</h2>
        <p className="text-slate-400 text-sm">Vui lòng đăng nhập để tiếp tục hành trình của bạn.</p>
      </div>
      <SocialButtons onGoogle={() => {}} onFacebook={() => {}} />
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="email">
            Email hoặc Tên đăng nhập
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 group-focus-within:text-primary transition-colors text-xl">
              alternate_email
            </span>
            <input
              id="email"
              type="text"
              placeholder="yourname@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:border-primary focus:ring-0 input-glow transition-all placeholder-slate-600"
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-400" htmlFor="password">
              Mật khẩu
            </label>
            <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 group-focus-within:text-primary transition-colors text-xl">
              lock
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-10 py-2.5 focus:border-primary focus:ring-0 input-glow transition-all placeholder-slate-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
            >
              <span className="material-symbols-outlined text-xl">visibility</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <input
            id="remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary/20"
          />
          <label className="text-xs text-slate-400 cursor-pointer" htmlFor="remember">
            Ghi nhớ đăng nhập
          </label>
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-primary hover:brightness-110 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
        >
          Đăng nhập
        </button>
      </form>
      <div className="mt-8 pt-6 border-t border-slate-800 text-center">
        <p className="text-sm text-slate-400">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
