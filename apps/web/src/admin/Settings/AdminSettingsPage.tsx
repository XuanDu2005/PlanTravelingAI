import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/services';
import { UserProfile } from '@/types';
import { useAuth } from '@/store/AuthContext';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import ProfileEditModal from '@/components/ProfileEditModal';

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    authService
      .getProfile()
      .then((p) => {
        setProfile(p);
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
      await authService.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success(t('settings.passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  if (loadError) return <ErrorState message={t('settings.loadError')} />;
  if (!profile) return <LoadingState message={t('settings.loading')} />;

  const isLocked = profile.status === 'LOCKED';
  const displayName = profile.name?.trim() || profile.email;
  const initial = (profile.name ?? profile.email ?? 'A').charAt(0).toUpperCase();

  return (
    <div className="space-y-4 max-w-4xl">

      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0D1527] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white text-lg shadow-sm hover:opacity-90 transition cursor-pointer"
              title={t('profileEdit.openTooltip')}
            >
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initial}</span>
              )}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {profile.name}
                </h2>
                <span className="rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[11px] font-bold">
                  {profile.role === 'ADMIN' ? t('settings.roleAdmin') : t('settings.roleUser')}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    isLocked
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                  }`}
                >
                  {isLocked ? t('settings.statusLocked') : t('settings.statusActive')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">{profile.email}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t('settings.joinedOn', {
                  date: new Date(profile.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }),
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="flex-1 sm:flex-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs"
            >
              ✎ {t('profileEdit.open')}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex-1 sm:flex-none rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 transition cursor-pointer"
            >
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </div>

      {/* Security Section Card */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0D1527] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t('settings.securitySection')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('settings.securityDesc')}
          </p>
        </div>

        <form onSubmit={handleSavePassword} className="space-y-4 pt-1">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('settings.fieldCurrentPassword')}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-3.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('settings.fieldNewPassword')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Ít nhất 8 ký tự"
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-3.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('settings.fieldConfirmPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu mới"
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-3.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {savingPassword ? t('settings.saving') : t('settings.changePassword')}
            </button>
          </div>
        </form>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
        onSaved={(p) => setProfile(p)}
      />
    </div>
  );
}