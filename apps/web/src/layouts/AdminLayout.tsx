import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/AuthContext';
import { authService } from '@/services';
import ProfileEditModal from '@/components/ProfileEditModal';
import ThemeToggle from '@/components/ThemeToggle';
import { UserProfile } from '@/types';
import BrandLogo from '@/components/BrandLogo';

const links = [
  {
    to: '/admin/dashboard',
    labelKey: 'admin.navDashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/admin/trips',
    labelKey: 'admin.navTrips',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    to: '/admin/users',
    labelKey: 'admin.navUsers',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
        <circle cx="19" cy="8" r="3" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      </svg>
    ),
  },
  {
    to: '/admin/recommendations',
    labelKey: 'admin.navRecommendations',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    to: '/admin/hero',
    labelKey: 'admin.navHero',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
        <rect x="3" y="3" width="18" height="14" rx="2" />
        <path d="M3 17l5-5 4 4 3-3 6 6" />
        <circle cx="9" cy="9" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: '/admin/analytics',
    labelKey: 'admin.navAnalytics',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    to: '/admin/settings',
    labelKey: 'admin.navSettings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .3 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

function AvatarCircle({
  src,
  name,
  size,
}: {
  src?: string;
  name: string;
  size: 'sm' | 'md';
}) {
  const dim = size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-9 w-9 text-xs font-bold';
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${dim} rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700`}
      />
    );
  }
  return (
    <div
      className={`grid place-items-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white shadow-xs ${dim}`}
    >
      {(name?.charAt(0) ?? 'A').toUpperCase()}
    </div>
  );
}

export default function AdminLayout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!profileOpen) return;
    authService
      .getProfile()
      .then(setProfile)
      .catch(() => undefined);
  }, [profileOpen]);

  const handleSaved = (next: UserProfile) => {
    setProfile(next);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090E1A] text-slate-900 dark:text-slate-100 font-sans antialiased flex">
      
      {/* 1. Professional Collapsible SaaS Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 hidden flex-col bg-white dark:bg-[#0D1527] border-r border-slate-200/90 dark:border-slate-800/90 z-30 shadow-xs md:flex transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className={`flex items-center h-16 border-b border-slate-100 dark:border-slate-800/80 shrink-0 ${
          collapsed ? 'justify-center px-2' : 'justify-between px-5'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogo
              to="/admin/dashboard"
              size="sm"
              showText={!collapsed}
              adminBadge={!collapsed}
            />
          </div>

          {/* Collapse / Expand Toggle Button */}
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Thu gọn thanh bên"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="flex justify-center pt-3 pb-1">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-cyan-300 transition cursor-pointer shadow-2xs"
              title="Mở rộng thanh bên"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        )}

        {/* Section Header */}
        {!collapsed && (
          <div className="px-5 pt-5 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Quản trị hệ thống</p>
          </div>
        )}

        {/* Navigation Section */}
        <nav className={`flex-1 space-y-1.5 overflow-y-auto ${collapsed ? 'px-2 pt-2' : 'px-3 py-1'}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              title={collapsed ? t(link.labelKey) : undefined}
              className={({ isActive }: { isActive: boolean }) =>
                `flex items-center rounded-xl text-xs font-semibold transition-all duration-150 ${
                  collapsed ? 'justify-center h-11 w-full' : 'gap-3 px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <span className="flex items-center justify-center shrink-0 w-5 h-5">{link.icon}</span>
              {!collapsed && <span className="flex-1 truncate">{t(link.labelKey)}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Website Link */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 p-3">
          <Link
            to="/"
            title={collapsed ? t('admin.viewSite') : undefined}
            className={`flex items-center rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${
              collapsed ? 'justify-center h-10 w-full' : 'gap-2 px-3 py-2'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            {!collapsed && <span>{t('admin.viewSite')}</span>}
          </Link>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
        collapsed ? 'md:pl-20' : 'md:pl-64'
      }`}>
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0D1527]/90 backdrop-blur-md transition-colors flex items-center justify-between px-5 sm:px-8 gap-4 shadow-2xs">
          
          {/* Left Header Spacer */}
          <div />

          {/* Right Header Controls matching the main site */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Exact Flag Toggle from Main Site (🇻🇳 Vietnam & 🇬🇧 UK) */}
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

            {/* Notification */}
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs"
              aria-label="notifications"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>

            {/* User Chip */}
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 pl-1 pr-3 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer sm:flex shadow-2xs"
              title={t('profileEdit.openTooltip')}
            >
              <AvatarCircle
                src={user?.avatar}
                name={user?.name ?? user?.email ?? 'A'}
                size="sm"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {user?.name ?? user?.email}
              </span>
            </button>

            {/* Logout */}
            <button
              type="button"
              className="rounded-full border border-rose-200/80 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 px-3.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition cursor-pointer"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              {t('nav.logout')}
            </button>
          </div>
        </header>

        {/* Content View */}
        <main className="p-5 sm:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <ProfileEditModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
        onSaved={handleSaved}
      />
    </div>
  );
}