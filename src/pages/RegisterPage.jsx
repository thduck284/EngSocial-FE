import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout, SocialButtons } from '../components/layout/AuthLayout'

const registerLeftContent = (
  <>
    <h2 className="text-4xl font-bold leading-tight mb-8">Join EngSocial Today.</h2>
    <div className="space-y-6">
      {[
        { icon: 'map', title: 'Personalized Learning Roadmaps', desc: 'Lộ trình học tập cá nhân hóa theo trình độ.' },
        { icon: 'public', title: 'Active Global Community', desc: 'Kết nối với học viên trên toàn thế giới.' },
        { icon: 'school', title: 'Expert-led Lessons', desc: 'Bài giảng chất lượng từ các chuyên gia.' },
        { icon: 'analytics', title: 'Skill Performance Tracking', desc: 'Phân tích và theo dõi tiến độ kỹ năng.' },
      ].map(({ icon, title, desc }) => (
        <div key={icon} className="flex items-center gap-4 group">
          <span className="material-symbols-outlined text-primary bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
            {icon}
          </span>
          <div>
            <span className="block text-base font-semibold text-slate-200">{title}</span>
            <span className="text-sm text-slate-400">{desc}</span>
          </div>
        </div>
      ))}
    </div>
  </>
)

export function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: call auth API
  }

  return (
    <AuthLayout leftContent={registerLeftContent}>
      <div className="mb-8 text-center md:text-left max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">Tạo tài khoản mới</h2>
        <p className="text-slate-400 text-sm">Bắt đầu hành trình chinh phục tiếng Anh của bạn.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl transition-colors text-sm"
        >
          <img alt="Google" className="w-5 h-5" src="https://www.google.com/favicon.ico" />
          Google
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold rounded-xl transition-colors text-sm"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>
      </div>
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card-dark px-3 text-slate-500">Hoặc đăng ký bằng email</span>
        </div>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="fullname">
            Họ và tên
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 group-focus-within:text-primary transition-colors text-xl">
              person
            </span>
            <input
              id="fullname"
              type="text"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:border-primary focus:ring-0 input-glow transition-all placeholder-slate-600"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="email">
            Địa chỉ Email
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 group-focus-within:text-primary transition-colors text-xl">
              alternate_email
            </span>
            <input
              id="email"
              type="email"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:border-primary focus:ring-0 input-glow transition-all placeholder-slate-600"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="password">
            Mật khẩu
          </label>
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
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1 w-1/4 rounded transition-all ${i <= 2 ? 'bg-primary' : 'bg-slate-700'}`}
              />
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Mật khẩu trung bình</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="confirm-password">
            Xác nhận mật khẩu
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 group-focus-within:text-primary transition-colors text-xl">
              shield_lock
            </span>
            <input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:border-primary focus:ring-0 input-glow transition-all placeholder-slate-600"
            />
          </div>
        </div>
        <div className="flex items-start gap-2 py-2">
          <input
            id="terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary/20"
          />
          <label className="text-xs text-slate-400 cursor-pointer leading-relaxed" htmlFor="terms">
            Tôi đồng ý với <Link to="/term" className="text-primary hover:underline">Điều khoản</Link> &{' '}
            <Link to="/term" className="text-primary hover:underline">Chính sách bảo mật</Link> của EngSocial.
          </label>
        </div>
        <button
          type="submit"
          className="w-full py-3.5 bg-primary hover:brightness-110 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-primary/20 text-base"
        >
          Đăng ký ngay
        </button>
      </form>
      <div className="mt-8 pt-6 border-t border-slate-800 text-center">
        <p className="text-sm text-slate-400">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
