import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/AuthContext';
import ProfileEditModal from '@/components/ProfileEditModal';
import ChatWidget from '@/components/chat/ChatWidget';
import NotificationBell from '@/components/NotificationBell';
import ThemeToggle from '@/components/ThemeToggle';
import { authService } from '@/services';
import { UserProfile } from '@/types';
import BrandLogo from '@/components/BrandLogo';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Legal modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const isHideFooter =
    location.pathname.startsWith('/about') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register');

  useEffect(() => {
    if (!profileOpen) return;
    authService
      .getProfile()
      .then(setProfile)
      .catch(() => undefined);
  }, [profileOpen]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setMenuOpen(false);
  }, [location.pathname]);

  const navTabs = [
    {
      to: '/',
      label: t('nav.home'),
      end: true,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      to: '/recommendations',
      label: t('nav.recommendations'),
      end: false,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      to: '/about',
      label: t('nav.about'),
      end: true,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900 transition-colors duration-300 dark:bg-[#050B18] dark:text-slate-100 flex flex-col justify-between">

      {/* Top Floating Dual-Island Glass Navbar (Nằm trên đỉnh Page 1, luôn hiển thị trọn vẹn) */}
      <header className="absolute top-0 left-0 right-0 z-50 w-full pt-3 sm:pt-5 px-4 sm:px-8 pointer-events-none">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">

          {/* Left Floating Island: Logo & Navigation Tabs */}
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-4 rounded-full bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/90 dark:border-slate-700/60 p-1.5 sm:px-4 sm:py-2 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-black/40">

            {/* Logo Emblem & Brand Name */}
            <BrandLogo to="/" size="md" className="pr-1" />

            {/* Vertical Divider */}
            <div className="hidden sm:block h-5 w-[1px] bg-slate-200/90 dark:bg-slate-700/80" />

            {/* Navigation Tab Links with Icons */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {navTabs.map((tab, idx) => (
                <NavLink
                  key={idx}
                  to={tab.to}
                  end={tab.end}
                  title={tab.label}
                  className={({ isActive }: { isActive: boolean }) =>
                    `flex items-center rounded-full transition-all duration-300 ease-in-out text-xs sm:text-sm font-semibold overflow-hidden ${
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-sm shadow-blue-500/10 border border-slate-200/60 dark:border-slate-700/80 font-bold px-3.5 py-1.5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/50 px-2.5 py-2'
                    }`
                  }
                >
                  {({ isActive }: { isActive: boolean }) => (
                    <>
                      <span className="shrink-0">{tab.icon}</span>
                      {/* Label: always visible when logged out, or only when active when logged in */}
                      <span
                        className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
                          !user || isActive
                            ? 'max-w-[140px] opacity-100 pl-2'
                            : 'max-w-0 opacity-0 pl-0'
                        }`}
                      >
                        {tab.label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}

              {/* Logged in additional trips links */}
              {user && (
                <>
                  <NavLink
                    to="/create-trip"
                    title={t('nav.createTrip')}
                    className={({ isActive }: { isActive: boolean }) =>
                      `flex items-center rounded-full transition-all duration-300 ease-in-out text-xs sm:text-sm font-semibold overflow-hidden ${
                        isActive
                          ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-sm shadow-blue-500/10 border border-slate-200/60 dark:border-slate-700/80 font-bold px-3.5 py-1.5'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/50 px-2.5 py-2'
                      }`
                    }
                  >
                    {({ isActive }: { isActive: boolean }) => (
                      <>
                        <span className="shrink-0">
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                        </span>
                        <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${isActive ? 'max-w-[140px] opacity-100 pl-2' : 'max-w-0 opacity-0 pl-0'}`}>
                          {t('nav.createTrip')}
                        </span>
                      </>
                    )}
                  </NavLink>
                  <NavLink
                    to="/trips"
                    title={t('nav.myTrips')}
                    className={({ isActive }: { isActive: boolean }) =>
                      `flex items-center rounded-full transition-all duration-300 ease-in-out text-xs sm:text-sm font-semibold overflow-hidden ${
                        isActive
                          ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-sm shadow-blue-500/10 border border-slate-200/60 dark:border-slate-700/80 font-bold px-3.5 py-1.5'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/50 px-2.5 py-2'
                      }`
                    }
                  >
                    {({ isActive }: { isActive: boolean }) => (
                      <>
                        <span className="shrink-0">
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                        </span>
                        <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${isActive ? 'max-w-[140px] opacity-100 pl-2' : 'max-w-0 opacity-0 pl-0'}`}>
                          {t('nav.myTrips')}
                        </span>
                      </>
                    )}
                  </NavLink>
                </>
              )}

            </nav>

          </div>

          {/* Right Floating Island: Controls, Theme Toggle & Auth Buttons */}
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 rounded-full bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/90 dark:border-slate-700/60 p-1.5 sm:px-3 sm:py-2 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-black/40">

            {/* Language Toggle with Vietnam 🇻🇳 & UK 🇬🇧 Flag Icons (Elongated Bar & Delicate Icons) */}
            <div className="flex items-center justify-between w-20 sm:w-21 h-8 rounded-full bg-slate-100/90 dark:bg-slate-800/90 px-1 py-0.5 border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
              {/* Vietnam Flag Option */}
              <button
                type="button"
                onClick={() => { if (i18n.language !== 'vi') void i18n.changeLanguage('vi'); }}
                className={`flex items-center justify-center h-6.5 w-8 rounded-full transition-all duration-200 cursor-pointer ${
                  i18n.language === 'vi'
                    ? 'bg-white dark:bg-slate-700 shadow-sm ring-1 ring-blue-500/50'
                    : 'opacity-35 hover:opacity-85'
                }`}
                title={t('common.languageVi')}
                aria-label={t('common.languageVi')}
              >
                <div className="h-[16px] w-[16px] rounded-full overflow-hidden shadow-xs ring-0.5 ring-black/10 flex items-center justify-center">
                  <svg viewBox="0 0 30 20" className="w-full h-full object-cover scale-125">
                    <rect width="30" height="20" fill="#da251d" />
                    <polygon points="15,4 16.545,8.755 21.548,8.755 17.501,11.695 19.047,16.45 15,13.51 10.953,16.45 12.499,11.695 8.452,8.755 13.455,8.755" fill="#ffff00" />
                  </svg>
                </div>
              </button>

              {/* UK Flag Option */}
              <button
                type="button"
                onClick={() => { if (i18n.language !== 'en') void i18n.changeLanguage('en'); }}
                className={`flex items-center justify-center h-6.5 w-8 rounded-full transition-all duration-200 cursor-pointer ${
                  i18n.language === 'en'
                    ? 'bg-white dark:bg-slate-700 shadow-sm ring-1 ring-blue-500/50'
                    : 'opacity-35 hover:opacity-85'
                }`}
                title={t('common.languageEn')}
                aria-label={t('common.languageEn')}
              >
                <div className="h-[16px] w-[16px] rounded-full overflow-hidden shadow-xs ring-0.5 ring-black/10 flex items-center justify-center">
                  <svg viewBox="0 0 60 30" className="w-full h-full object-cover scale-125">
                    <rect width="60" height="30" fill="#012169" />
                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2" />
                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
                    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Day / Night Theme Toggle with Clouds ☁️ & Stars ✨ */}
            <ThemeToggle />

            {user && <NotificationBell />}

            {/* Auth State & Buttons */}
            {user ? (
              <>
                {/* Admin Badge Link */}
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_2px_10px_rgba(124,58,237,0.4)] hover:shadow-[0_4px_14px_rgba(124,58,237,0.55)] transition-all hover:scale-105 cursor-pointer border border-violet-400/30"
                  >
                    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                    {t('nav.admin')}
                  </Link>
                )}

                {/* User Profile Chip */}
                <button
                  type="button"
                  onClick={() => setProfileOpen(true)}
                  className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 pl-1 pr-3 py-1 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-cyan-700 transition-all duration-200 cursor-pointer"
                  title={t('profileEdit.openTooltip')}
                >
                  {/* Avatar with ring */}
                  <div className="relative shrink-0">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name ?? user.email}
                        className="h-7 w-7 rounded-full object-cover ring-2 ring-blue-500/40 group-hover:ring-blue-500/70 transition-all"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-500 text-white text-xs font-bold grid place-items-center shadow-sm ring-2 ring-blue-500/30 group-hover:ring-blue-500/60 transition-all">
                        {(user?.name ?? user?.email ?? 'A').charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Online dot */}
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-800 shadow-sm" />
                  </div>
                  {/* Name */}
                  <span className="hidden sm:block text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors max-w-[80px] truncate">
                    {user.name ?? user.email}
                  </span>
                  {/* Chevron */}
                  <svg className="w-3 h-3 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200/60 dark:hover:border-rose-800/50 transition-all duration-200 cursor-pointer"
                  title={t('nav.logout')}
                >
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  <span className="hidden sm:inline">{t('nav.logout')}</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="group relative inline-flex items-center justify-between gap-2.5 rounded-full bg-gradient-to-b from-[#4387f6] via-[#2563eb] to-[#1a4ecb] px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-[0_6px_20px_rgba(37,99,235,0.4),inset_0_1.5px_2px_rgba(255,255,255,0.7),inset_0_-1.5px_2px_rgba(0,0,0,0.2)] border-t border-b border-white/60 border-t-white/80 border-b-blue-900/40 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_25px_rgba(37,99,235,0.55)] active:scale-95 cursor-pointer overflow-hidden"
              >
                {/* Lớp phản quang vòm kính bong bóng phía trên */}
                <span className="pointer-events-none absolute inset-x-2 top-0.5 h-[45%] rounded-full bg-gradient-to-b from-white/60 via-white/15 to-transparent" />
                {/* Lớp phản quang ánh sáng mép đáy */}
                <span className="pointer-events-none absolute inset-x-3 bottom-0.5 h-[25%] rounded-full bg-gradient-to-t from-white/35 to-transparent" />

                <div className="flex items-center gap-1.5 relative z-10">
                  <span className="text-sm filter drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]">✨</span>
                  <span className="font-outfit font-bold tracking-tight text-white drop-shadow-xs">
                    Bắt đầu ngay
                  </span>
                </div>

                {/* Nút tròn kính mờ bong bóng chứa mũi tên */}
                <div className="relative z-10 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gradient-to-b from-white/40 to-white/10 border border-white/70 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.9)] backdrop-blur-md transition-transform duration-300 group-hover:translate-x-0.5 overflow-hidden">
                  <span className="pointer-events-none absolute inset-x-0.5 top-0 h-[40%] rounded-full bg-gradient-to-b from-white/80 to-transparent" />
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </Link>
            )}

            {/* Mobile Hamburger toggle button */}
            <button
              className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 lg:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              onClick={() => setMenuOpen((s) => !s)}
              aria-label="Toggle Menu"
            >
              <span className="text-sm font-bold">☰</span>
            </button>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="pointer-events-auto mt-2 mx-auto max-w-[1400px] rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-xl backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/95 lg:hidden">
            <nav className="flex flex-col gap-1.5">
              {navTabs.map((tab, idx) => (
                <NavLink
                  key={idx}
                  to={tab.to}
                  end={tab.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }: { isActive: boolean }) =>
                    `flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-cyan-300'
                        : 'text-slate-700 dark:text-slate-200'
                    }`
                  }
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </NavLink>
              ))}
              {user && (
                <>
                  <NavLink to="/create-trip" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200"><span>✨</span><span>{t('nav.createTrip')}</span></NavLink>
                  <NavLink to="/trips" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200"><span>🧳</span><span>{t('nav.myTrips')}</span></NavLink>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="w-full flex-1">
        <Outlet />
      </main>

      {/* ========================================================================= */}
      {/* 📋 SIMPLE FOOTER */}
      {/* ========================================================================= */}
      {!isHideFooter && (
        <footer className="relative border-t border-slate-200/70 bg-white/80 backdrop-blur px-4 py-6 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70 sm:px-8">
          <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-5">
            {/* Top row: brand (left) + contact (right) */}
            <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Brand */}
              <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <img src="/logo.png" alt="TravelMind" className="h-8 w-8 rounded-lg object-cover" />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">TravelMind</span>
                  <span>{t('footerExtra.copyright')}</span>
                </div>
              </div>

              {/* Contact info */}
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <a href="mailto:contact@travelmind.com" className="group flex items-center gap-1.5 transition hover:text-blue-600 dark:hover:text-cyan-400">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:bg-blue-100 dark:bg-blue-900/40 dark:text-cyan-400 dark:group-hover:bg-blue-900/60">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
                  </span>
                  <span>contact@travelmind.com</span>
                </a>
                <a href="tel:+84123456789" className="group flex items-center gap-1.5 transition hover:text-blue-600 dark:hover:text-cyan-400">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:bg-blue-100 dark:bg-blue-900/40 dark:text-cyan-400 dark:group-hover:bg-blue-900/60">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </span>
                  <span>+84 123 456 789</span>
                </a>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-slate-200/80 dark:bg-slate-800" />

            {/* Bottom row: social icons (left) + legal links (right) */}
            <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-between">
              {/* Social icons */}
              <div className="flex items-center gap-2.5">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1877F2] text-white shadow-md shadow-blue-500/25 transition hover:scale-110 active:scale-95 cursor-pointer"
                  title="Facebook"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-md shadow-rose-500/30 transition hover:scale-110 active:scale-95 cursor-pointer"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>

              {/* Legal links */}
              <div className="flex items-center gap-5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="hover:text-blue-600 dark:hover:text-cyan-400 transition cursor-pointer"
                >
                  {t('footerExtra.privacy')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal('terms')}
                  className="hover:text-blue-600 dark:hover:text-cyan-400 transition cursor-pointer"
                >
                  {t('footerExtra.terms')}
                </button>
              </div>
            </div>
          </div>
        </footer>
      )}

        {/* Modal: Chính sách bảo mật (Privacy Policy) */}
        {activeModal === 'privacy' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-left space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-outfit text-xl font-extrabold text-slate-900 dark:text-white">
                  {t('footerExtra.privacyTitle')}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                <p>
                  {t('footerExtra.privacyP1')}
                </p>
                <p>
                  {t('footerExtra.privacyP2')}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition"
                >
                  {t('footerExtra.understood')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Điều khoản dịch vụ (Terms) */}
        {activeModal === 'terms' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-left space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-outfit text-xl font-extrabold text-slate-900 dark:text-white">
                  {t('footerExtra.termsTitle')}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                <p>
                  {t('footerExtra.termsText')}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition"
                >
                  {t('footerExtra.understood')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Cài đặt Cookie (Cookies) - removed for simpler footer */}

      {/* Modals & Global Widgets */}
      <ProfileEditModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
        onSaved={(p) => setProfile(p)}
      />
      {user && <ChatWidget />}
    </div>
  );
}
