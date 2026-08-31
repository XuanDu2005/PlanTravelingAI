import { FormEvent, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/AuthContext';
import { cn } from '@/lib/utils';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Gift, 
  Shield, 
  Check, 
  ArrowLeft,
  Compass
} from 'lucide-react';

interface AuthSwitchProps {
  initialMode?: 'login' | 'register';
  className?: string;
  onSuccess?: () => void;
}

export default function AuthSwitch({
  initialMode = 'login',
  className,
  onSuccess,
}: AuthSwitchProps) {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setErrorMsg(t('auth.passwordMismatch') || 'Mật khẩu xác nhận không khớp');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success(t('auth.loginSuccess') || 'Đăng nhập thành công!');
      } else {
        await register(name, email, password);
        toast.success(t('auth.accountCreated') || 'Tạo tài khoản thành công!');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const errorData = (err as { response?: { status?: number; data?: { message?: string; code?: string } } })?.response?.data;
      const status = (err as { response?: { status?: number } })?.response?.status;

      if (status === 403 || errorData?.code === 'ACCOUNT_LOCKED') {
        setErrorMsg('Tài khoản đã bị tạm khóa. Vui lòng liên hệ hỗ trợ.');
      } else if (status === 401 || status === 400) {
        setErrorMsg(mode === 'login' ? 'Email hoặc mật khẩu không chính xác' : errorData?.message || 'Thông tin đăng ký không hợp lệ');
      } else {
        setErrorMsg('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  return (
    <div className={cn('w-full max-w-[1180px] mx-auto rounded-[38px] bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-[0_30px_90px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.85)] backdrop-blur-3xl overflow-hidden relative select-none min-h-[670px]', className)}>
      
      {/* ========================================================================= */}
      {/* 🎭 SLIDING TRAVEL VISUAL CURTAIN (BỨC TRANH DU LỊCH TRƯỢT NGHỆ THUẬT 3D) */}
      {/* ========================================================================= */}
      <div 
        className={cn(
          'hidden md:flex absolute top-0 bottom-0 w-[50%] z-30 transition-transform duration-700 ease-in-out overflow-hidden flex-col justify-between p-10 lg:p-12 text-white select-none shadow-2xl',
          mode === 'login' ? 'translate-x-0 left-0' : 'translate-x-full left-0'
        )}
      >
        {/* Scenic Paris / Island Travel Image */}
        <img
          src={
            mode === 'login'
              ? 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1400&q=85'
              : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=85'
          }
          alt="Travel Destination"
          className="absolute inset-0 h-full w-full object-cover scale-105 transition-all duration-700 ease-out"
        />
        
        {/* Soft Vignette Overlay with Ambient Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/40" />


        {/* 1. Top Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30 border border-white/20 backdrop-blur-md">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-sm font-sans block leading-tight">
              TravelMind
            </span>
            <span className="text-[10px] font-semibold text-cyan-300 tracking-wider uppercase">
              AI Travel Platform
            </span>
          </div>
        </div>

        {/* 2. Middle Content - Artistic Dual Typography */}
        <div className="relative z-10 space-y-4 my-auto max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-cyan-300">
            <span>✨</span>
            <span>Trợ lý du lịch AI thế hệ mới</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
            {mode === 'login' ? (
              <>
                Chào mừng bạn trở lại, <br />
                <span className="font-display italic font-normal bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-200 bg-clip-text text-transparent">
                  hành trình đang chờ đón.
                </span>
              </>
            ) : (
              <>
                Khởi đầu phiêu lưu mới, <br />
                <span className="font-display italic font-normal bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-200 bg-clip-text text-transparent">
                  theo cách của riêng bạn.
                </span>
              </>
            )}
          </h2>
          <p className="text-xs lg:text-sm text-slate-200/90 leading-relaxed font-normal">
            {mode === 'login'
              ? 'Đăng nhập để đồng bộ lịch trình và mở khóa những gợi ý độc quyền từ AI.'
              : 'Tạo tài khoản miễn phí để sở hữu trợ lý AI lập kế hoạch cá nhân hóa.'}
          </p>
        </div>

        {/* 3. Bottom Minimal Switch CTA Card */}
        <div className="relative z-10 p-4 rounded-2xl bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-cyan-300 border border-blue-400/30">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-tight">
                {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {mode === 'login' ? 'Khám phá miễn phí ngay' : 'Đăng nhập để tiếp tục'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErrorMsg(null);
            }}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span>{mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}</span>
            {mode === 'login' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 📝 UNDERLYING 2-COLUMN FORMS (REGISTER LEFT | LOGIN RIGHT) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full min-h-[670px]">
        
        {/* ------------------------------------------------------------------------- */}
        {/* 1. REGISTER FORM (LEFT SIDE OF CONTAINER) */}
        {/* ------------------------------------------------------------------------- */}
        <div className={cn(
          'flex flex-col justify-center p-8 sm:p-10 lg:p-12 transition-opacity duration-500 relative',
          mode === 'register' ? 'opacity-100 z-20' : 'md:opacity-0 md:pointer-events-none'
        )}>
          {/* Ambient Glow */}
          <div className="absolute top-1/4 left-1/4 -z-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="w-full max-w-sm mx-auto space-y-4">

            {/* Header with Artistic Typography */}
            <div className="space-y-1">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-blue-500 dark:text-cyan-400">
                TravelMind
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans leading-tight">
                Tạo tài khoản{' '}
                <span className="font-serif italic font-normal bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  mới.
                </span>
              </h1>
            </div>

            {errorMsg && mode === 'register' && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-xs focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="youremail@example.com"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-xs focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-xs focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-xs focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
                    title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Apple iOS 3D Liquid Glass Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative w-full inline-flex items-center justify-between rounded-full bg-gradient-to-b from-[#4387f6] via-[#2563eb] to-[#1a4ecb] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(37,99,235,0.45),inset_0_2px_3px_rgba(255,255,255,0.7),inset_0_-2px_3px_rgba(0,0,0,0.2)] border-t border-b border-white/60 border-t-white/85 border-b-blue-900/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(37,99,235,0.6)] active:scale-98 disabled:opacity-50 cursor-pointer overflow-hidden"
                >
                  {/* Top Dome Reflection */}
                  <span className="pointer-events-none absolute inset-x-3 top-1 h-[45%] rounded-full bg-gradient-to-b from-white/60 via-white/15 to-transparent" />
                  {/* Bottom Rim Reflection */}
                  <span className="pointer-events-none absolute inset-x-5 bottom-1 h-[25%] rounded-full bg-gradient-to-t from-white/35 to-transparent" />

                  <div className="flex items-center gap-2 relative z-10">
                    <span className="text-sm filter drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]">✨</span>
                    <span className="font-outfit font-extrabold tracking-tight text-white drop-shadow-xs">
                      {submitting ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
                    </span>
                  </div>

                  {/* Glass Sphere Arrow Circle */}
                  <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-white/40 to-white/10 border border-white/70 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.9)] backdrop-blur-md transition-transform duration-300 group-hover:translate-x-1 overflow-hidden">
                    <span className="pointer-events-none absolute inset-x-0.5 top-0 h-[40%] rounded-full bg-gradient-to-b from-white/80 to-transparent" />
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>
              </div>
            </form>

            <div className="text-center pt-2 md:hidden">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
              >
                Đã có tài khoản? Đăng nhập ngay
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* 2. LOGIN FORM (RIGHT SIDE OF CONTAINER) */}
        {/* ------------------------------------------------------------------------- */}
        <div className={cn(
          'flex flex-col justify-center p-8 sm:p-10 lg:p-12 transition-opacity duration-500 relative',
          mode === 'login' ? 'opacity-100 z-20' : 'md:opacity-0 md:pointer-events-none'
        )}>
          {/* Ambient Glow */}
          <div className="absolute top-1/4 right-1/4 -z-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="w-full max-w-sm mx-auto space-y-4">

            {/* Header with Artistic Touch */}
            <div className="space-y-1">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-blue-500 dark:text-cyan-400">
                TravelMind
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans leading-tight">
                Chào mừng{' '}
                <span className="font-serif italic font-normal bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  trở lại.
                </span>
              </h1>
            </div>

            {errorMsg && mode === 'login' && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Main Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="youremail@example.com"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-xs focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mật khẩu
                  </label>
                  <a
                    href="mailto:contact@travelmind.com?subject=Quen%20mat%20khau"
                    className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu của bạn"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-xs focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={cn(
                    'h-4 w-4 rounded-md flex items-center justify-center transition border cursor-pointer',
                    rememberMe 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs' 
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                  )}
                >
                  {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <span 
                  onClick={() => setRememberMe(!rememberMe)}
                  className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none"
                >
                  Ghi nhớ đăng nhập
                </span>
              </div>

              {/* Apple iOS 3D Liquid Glass Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative w-full inline-flex items-center justify-between rounded-full bg-gradient-to-b from-[#4387f6] via-[#2563eb] to-[#1a4ecb] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(37,99,235,0.45),inset_0_2px_3px_rgba(255,255,255,0.7),inset_0_-2px_3px_rgba(0,0,0,0.2)] border-t border-b border-white/60 border-t-white/85 border-b-blue-900/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(37,99,235,0.6)] active:scale-98 disabled:opacity-50 cursor-pointer overflow-hidden"
                >
                  {/* Top Dome Reflection */}
                  <span className="pointer-events-none absolute inset-x-3 top-1 h-[45%] rounded-full bg-gradient-to-b from-white/60 via-white/15 to-transparent" />
                  {/* Bottom Rim Reflection */}
                  <span className="pointer-events-none absolute inset-x-5 bottom-1 h-[25%] rounded-full bg-gradient-to-t from-white/35 to-transparent" />

                  <div className="flex items-center gap-2 relative z-10">
                    <span className="text-sm filter drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]">✨</span>
                    <span className="font-outfit font-extrabold tracking-tight text-white drop-shadow-xs">
                      {submitting ? 'Đang đăng nhập...' : 'Đăng nhập ngay'}
                    </span>
                  </div>

                  {/* Glass Sphere Arrow Circle */}
                  <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-white/40 to-white/10 border border-white/70 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.9)] backdrop-blur-md transition-transform duration-300 group-hover:translate-x-1 overflow-hidden">
                    <span className="pointer-events-none absolute inset-x-0.5 top-0 h-[40%] rounded-full bg-gradient-to-b from-white/80 to-transparent" />
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>
              </div>
            </form>

            {/* Quick Demo Account Box (Artistic Glassmorphism) */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 backdrop-blur-md space-y-2 pt-2.5 shadow-xs">
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Tài khoản dùng thử 1-chạm
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* User Alex Card */}
                <button
                  type="button"
                  onClick={() => fillDemoAccount('user@travelmind.local', 'User@123456')}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 hover:border-blue-400 dark:hover:border-cyan-500 shadow-xs hover:shadow-md transition-all text-left cursor-pointer group hover:scale-[1.02]"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 border border-blue-100 dark:border-blue-800/60 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400">
                      User: Alex
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Khách du lịch
                    </div>
                  </div>
                </button>

                {/* Admin Demo Card */}
                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin@travelmind.local', 'Admin@123456')}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 hover:border-purple-400 dark:hover:border-purple-500 shadow-xs hover:shadow-md transition-all text-left cursor-pointer group hover:scale-[1.02]"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/60 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      Admin: Demo
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Quản trị viên
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Bottom Security Assurance */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-0.5 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Bảo mật tuyệt đối chuẩn mã hóa 256-bit SSL</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
