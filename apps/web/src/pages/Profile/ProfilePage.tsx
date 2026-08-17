import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { authService } from '@/services';
import { UserProfile } from '@/types';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import ProfileEditModal from '@/components/ProfileEditModal';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [savingLanguage, setSavingLanguage] = useState(false);

  useEffect(() => {
    authService
      .getProfile()
      .then((p) => {
        setProfile(p);
        setLanguage(p.language === 'en' ? 'en' : 'vi');
      })
      .catch(() => setLoadError(true));
  }, []);

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error(t('settings.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('settings.passwordMismatch'));
      return;
    }
    setSavingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success(t('settings.passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLanguageChange = async (next: 'vi' | 'en') => {
    if (next === language) return;
    setLanguage(next);
    void i18n.changeLanguage(next);
    setSavingLanguage(true);
    try {
      const updated = await authService.updateProfile({ language: next });
      setProfile(updated);
      toast.success(t('settings.languageSaved'));
    } catch {
      const prev = language;
      setLanguage(prev);
      void i18n.changeLanguage(prev);
    } finally {
      setSavingLanguage(false);
    }
  };

  if (loadError) return <ErrorState message={t('settings.loadError')} />;
  if (!profile) return <LoadingState message={t('settings.loading')} />;

  const displayName = profile.name?.trim() || profile.email;
  const initial = (profile.name ?? profile.email ?? 'A').charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900 dark:text-slate-100">
          {t('settings.title')}
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-slate-400">{t('settings.subtitle')}</p>
      </header>

      <section className="card p-6">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-2xl ring-2 ring-transparent transition hover:ring-brand-300 dark:hover:ring-brand-400"
            title={t('profileEdit.openTooltip')}
          >
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-400 to-brand-700 text-2xl font-bold text-white">
                {initial}
              </div>
            )}
            <span className="absolute bottom-0 right-0 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[10px] text-white shadow ring-2 ring-white dark:ring-surface-200">
              ✎
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-ink-900 dark:text-slate-100">
              {profile.name}
            </h2>
            <p className="text-sm text-ink-500 dark:text-slate-400">{profile.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="badge-success">
                {profile.role === 'ADMIN' ? t('settings.roleAdmin') : t('settings.roleUser')}
              </span>
              <span className="badge">
                {t('settings.joinedOn', {
                  date: new Date(profile.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }),
                })}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="btn-soft"
            >
              ✎ {t('profileEdit.open')}
            </button>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-base font-semibold text-ink-900 dark:text-slate-100">
          {t('settings.securitySection')}
        </h2>
        <p className="mt-0.5 text-sm text-ink-500 dark:text-slate-400">{t('settings.securityDesc')}</p>
        <form onSubmit={handleSavePassword} className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs font-medium text-ink-700 dark:text-slate-200">
              {t('settings.fieldCurrentPassword')}
            </span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-surface-100 dark:bg-surface-200 dark:text-slate-100 dark:focus:border-brand-400 dark:focus:ring-brand-900/40"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink-700 dark:text-slate-200">
              {t('settings.fieldNewPassword')}
            </span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-surface-100 dark:bg-surface-200 dark:text-slate-100 dark:focus:border-brand-400 dark:focus:ring-brand-900/40"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink-700 dark:text-slate-200">
              {t('settings.fieldConfirmPassword')}
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-surface-100 dark:bg-surface-200 dark:text-slate-100 dark:focus:border-brand-400 dark:focus:ring-brand-900/40"
            />
          </label>
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={savingPassword}
              className="btn-primary disabled:opacity-50"
            >
              {savingPassword ? t('settings.saving') : t('settings.changePassword')}
            </button>
          </div>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="text-base font-semibold text-ink-900 dark:text-slate-100">
          {t('settings.preferencesSection')}
        </h2>
        <p className="mt-0.5 text-sm text-ink-500 dark:text-slate-400">
          {t('settings.preferencesDesc')}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(['vi', 'en'] as const).map((lng) => (
            <button
              key={lng}
              type="button"
              onClick={() => handleLanguageChange(lng)}
              disabled={savingLanguage}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 ${
                language === lng
                  ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-200 dark:bg-brand-900/30 dark:text-brand-200 dark:ring-brand-700/40'
                  : 'border-slate-200 bg-white text-ink-700 hover:border-brand-200 dark:border-surface-100 dark:bg-surface-200 dark:text-slate-200 dark:hover:border-brand-400'
              }`}
            >
              <span aria-hidden>🌐</span>
              {lng === 'vi' ? t('common.languageVi') : t('common.languageEn')}
              {language === lng && (
                <span className="text-xs text-brand-700 dark:text-brand-300">✓</span>
              )}
            </button>
          ))}
        </div>
      </section>

      <ProfileEditModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
        onSaved={(p) => setProfile(p)}
      />
    </div>
  );
}