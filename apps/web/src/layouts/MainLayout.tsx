import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ProfileEditModal from '@/components/ProfileEditModal';
import ThemeToggle from '@/components/ThemeToggle';
import ChatWidget from '@/components/chat/ChatWidget';
import { authService } from '@/services';
import { UserProfile } from '@/types';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!profileOpen) return;
    authService
      .getProfile()
      .then(setProfile)
      .catch(() => undefined);
  }, [profileOpen]);

  const links = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/recommendations', label: t('nav.recommendations'), end: false },
    ...(user
      ? [
          { to: '/create-trip', label: t('nav.createTrip'), end: false },
          { to: '/trips', label: t('nav.myTrips'), end: false },
        ]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderUserAvatar = (size: 'sm' | 'md') => {
    const dim = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-10 w-10 text-base';
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.name ?? user.email}
          className={`${dim} rounded-full object-cover`}
        />
      );
    }
    return (
      <div
        className={`grid place-items-center rounded-full bg-brand-600 font-semibold text-white ${dim}`}
      >
        {(user?.name ?? user?.email ?? 'A').charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-200 dark:bg-surface-300">
      <header className="sticky top-0 z-30 border-b border-ink-100/80 bg-white/85 backdrop-blur transition-colors duration-200 dark:border-surface-100 dark:bg-surface-300/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="TravelMind"
              className="h-10 w-10 rounded-xl object-cover shadow"
            />
            <span className="text-base font-semibold tracking-tight text-ink-900 dark:text-slate-100">
              {t('common.appName')}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200'
                      : 'text-ink-700 hover:bg-ink-100/60 dark:text-slate-200 dark:hover:bg-surface-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-brand-50 px-2 py-1.5 text-sm transition hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50"
                  title={t('profileEdit.openTooltip')}
                >
                  {renderUserAvatar('sm')}
                  <span className="text-brand-800 dark:text-brand-200">
                    {user.name ?? user.email}
                  </span>
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={(e) => e.stopPropagation()}
                      className="ml-1 badge-success"
                    >
                      {t('nav.admin')}
                    </Link>
                  )}
                </button>
                <Link to="/profile" className="btn-ghost" title={t('nav.profile')}>
                  {t('nav.profile')}
                </Link>
                <LanguageSwitcher />
                <ThemeToggle />
                <button onClick={handleLogout} className="btn-ghost">
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <LanguageSwitcher />
                <ThemeToggle />
                <Link to="/login" className="btn-ghost">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn-primary">
                  {t('nav.signup')}
                </Link>
              </>
            )}
          </div>

          <button
            className="grid h-9 w-9 place-items-center rounded-lg border border-ink-100 bg-white text-ink-700 transition hover:bg-ink-100/60 md:hidden dark:border-surface-100 dark:bg-surface-200 dark:text-slate-200 dark:hover:bg-surface-100"
            onClick={() => setMenuOpen((s) => !s)}
            aria-label={t('common.back')}
          >
            <span aria-hidden>☰</span>
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-ink-100 bg-white px-4 py-3 transition-colors duration-200 dark:border-surface-100 dark:bg-surface-300 md:hidden">
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200'
                        : 'text-ink-700 dark:text-slate-200'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-2 flex flex-col gap-2">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setProfileOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-left text-sm dark:bg-brand-900/30"
                  >
                    {renderUserAvatar('sm')}
                    <span className="flex-1 text-brand-800 dark:text-brand-200">
                      {user.name ?? user.email}
                    </span>
                    <span className="text-xs text-brand-700 dark:text-brand-300">✎</span>
                  </button>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="btn-soft"
                  >
                    {t('nav.profile')}
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="btn-soft"
                    >
                      {t('nav.admin')}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="btn-ghost"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="btn-ghost"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="btn-primary"
                  >
                    {t('nav.signup')}
                  </Link>
                </>
              )}
              <div className="flex items-center gap-2 pt-2">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>

      <footer className="border-t border-ink-100 bg-white transition-colors duration-200 dark:border-surface-100 dark:bg-surface-300">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm text-ink-500 sm:grid-cols-2 md:grid-cols-4 sm:px-6 dark:text-slate-400">
          <div>
            <h4 className="text-sm font-semibold text-ink-900 dark:text-slate-100">
              {t('common.appName')}
            </h4>
            <p className="mt-2 text-xs text-ink-500 dark:text-slate-400">{t('footer.tagline')}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink-900 dark:text-slate-100">
              {t('footer.about')}
            </h4>
            <ul className="mt-2 space-y-1 text-xs">
              <li>{t('footer.aboutUs')}</li>
              <li>{t('footer.careers')}</li>
              <li>{t('footer.press')}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink-900 dark:text-slate-100">
              {t('footer.support')}
            </h4>
            <ul className="mt-2 space-y-1 text-xs">
              <li>{t('footer.helpCenter')}</li>
              <li>{t('footer.safety')}</li>
              <li>{t('footer.cancellation')}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink-900 dark:text-slate-100">
              {t('footer.contact')}
            </h4>
            <ul className="mt-2 space-y-1 text-xs">
              <li>contact@travelmind.local</li>
              <li>+84 123 456 789</li>
              <li>{t('footer.social')}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-ink-100 dark:border-surface-100">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-ink-500 sm:flex-row sm:px-6 dark:text-slate-400">
            <span>
              © {new Date().getFullYear()} {t('common.appName')}.{' '}
              {t('footer.rights')}
            </span>
            <span>{t('footer.legal')}</span>
          </div>
        </div>
      </footer>

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