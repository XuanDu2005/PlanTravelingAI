import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/AuthContext';
import { authService } from '@/services';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import ProfileEditModal from '@/components/ProfileEditModal';
import { UserProfile } from '@/types';

const ICON_DASHBOARD = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);
const ICON_TRIPS = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <path d="M3 7l9-4 9 4-9 4-9-4z" />
    <path d="M3 12l9 4 9-4" />
    <path d="M3 17l9 4 9-4" />
  </svg>
);
const ICON_ANALYTICS = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <path d="M8 15l3-3 3 3 5-6" />
  </svg>
);
const ICON_RECS = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
  </svg>
);
const ICON_USERS = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <circle cx="9" cy="8" r="4" />
    <path d="M2 21c0-4 4-6 7-6s7 2 7 6" />
    <circle cx="17" cy="6" r="3" />
    <path d="M22 18c0-3-2-4-5-4" />
  </svg>
);
const ICON_SETTINGS = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .3 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const ICON_HERO = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <rect x="3" y="3" width="18" height="14" rx="2" />
    <path d="M3 17l5-5 4 4 3-3 6 6" />
    <circle cx="9" cy="9" r="1.5" fill="currentColor" />
  </svg>
);

const links = [
  { to: '/admin/dashboard', labelKey: 'admin.navDashboard', icon: ICON_DASHBOARD },
  { to: '/admin/trips', labelKey: 'admin.navTrips', icon: ICON_TRIPS },
  { to: '/admin/users', labelKey: 'admin.navUsers', icon: ICON_USERS },
  { to: '/admin/recommendations', labelKey: 'admin.navRecommendations', icon: ICON_RECS },
  { to: '/admin/hero', labelKey: 'admin.navHero', icon: ICON_HERO },
  { to: '/admin/analytics', labelKey: 'admin.navAnalytics', icon: ICON_ANALYTICS },
  { to: '/admin/settings', labelKey: 'admin.navSettings', icon: ICON_SETTINGS },
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
  const dim = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-10 w-10 text-base';
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${dim} rounded-full object-cover ring-1 ring-white/20`}
      />
    );
  }
  return (
    <div
      className={`grid place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-bold text-white ring-1 ring-white/20 ${dim}`}
    >
      {(name?.charAt(0) ?? 'A').toUpperCase()}
    </div>
  );
}

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // When the modal opens, fetch the full profile (with avatar) so the modal
  // starts from the latest server state, even right after a previous save.
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
    <div className="min-h-screen bg-slate-100 transition-colors duration-200 dark:bg-surface-300">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-[#0c1424] text-slate-100 md:flex dark:bg-surface-400">
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="flex items-center gap-3 px-5 py-6 text-left transition hover:bg-white/5"
          title={t('profileEdit.openTooltip')}
        >
          <AvatarCircle src={user?.avatar} name={user?.name ?? 'Admin'} size="md" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">{user?.name ?? 'Admin'}</p>
            <p className="truncate text-xs text-slate-400">{user?.email ?? ''}</p>
          </div>
        </button>

        <nav className="flex-1 space-y-1 px-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span className="grid h-5 w-5 place-items-center">{link.icon}</span>
              <span className="flex-1">{t(link.labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <Link to="/" className="text-xs text-slate-400 hover:text-white">
            ← {t('admin.viewSite')}
          </Link>
        </div>
      </aside>

      <div className="md:ml-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white transition-colors duration-200 dark:border-surface-100 dark:bg-surface-300">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="relative w-full max-w-md">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                🔍
              </span>
              <input
                type="search"
                placeholder={t('admin.searchPlaceholder')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-surface-100 dark:bg-surface-200 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-400 dark:focus:bg-surface-200 dark:focus:ring-brand-900/40"
              />
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-ink-700 hover:bg-slate-50 dark:border-surface-100 dark:bg-surface-200 dark:text-slate-200 dark:hover:bg-surface-100"
                aria-label="notifications"
              >
                🔔
              </button>
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="hidden items-center gap-2 rounded-full bg-slate-100 px-2 py-1.5 transition hover:bg-slate-200 dark:bg-surface-100 dark:hover:bg-surface-100/70 sm:flex"
                title={t('profileEdit.openTooltip')}
              >
                <AvatarCircle
                  src={user?.avatar}
                  name={user?.name ?? user?.email ?? 'A'}
                  size="sm"
                />
                <span className="pr-1 text-sm font-medium text-ink-700 dark:text-slate-200">
                  {user?.name ?? user?.email}
                </span>
              </button>
              <button
                type="button"
                className="btn-ghost !py-1.5"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8">
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