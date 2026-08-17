import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/AuthContext';

type LoginErrorState =
  | { kind: 'locked' }
  | { kind: 'invalid' }
  | { kind: 'unknown' }
  | null;

export default function LoginPage() {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<LoginErrorState>(null);

  if (user) return <Navigate to={from} replace />;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success(t('auth.loginSuccess'));
      navigate(from, { replace: true });
    } catch (err) {
      const status = (err as { response?: { status?: number; data?: { code?: string } } })
        ?.response?.status;
      const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
      if (status === 403 || code === 'ACCOUNT_LOCKED') {
        setError({ kind: 'locked' });
      } else if (status === 401) {
        setError({ kind: 'invalid' });
      } else {
        setError({ kind: 'unknown' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-card transition-colors duration-200 dark:bg-surface-200 dark:shadow-cardDark md:grid-cols-2">
      <div className="relative hidden h-full min-h-[520px] md:block">
        <img
          src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1400&q=80"
          alt="Travel"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/70 via-brand-700/50 to-brand-500/40" />
        <div className="absolute inset-x-0 bottom-0 p-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {t('auth.heroBadge')}
          </div>
          <h2 className="mt-4 text-2xl font-semibold leading-tight">
            {t('auth.heroTitle')}
          </h2>
          <p className="mt-2 max-w-sm text-sm text-white/85">
            {t('auth.heroDesc')}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="TravelMind"
              className="h-10 w-10 rounded-xl object-cover shadow"
            />
            <span className="text-base font-semibold text-ink-900 dark:text-slate-100">
              {t('common.appName')}
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-ink-900 dark:text-slate-100">
              {t('auth.loginTitle')}
            </h1>
            <p className="mt-1 text-sm text-ink-500 dark:text-slate-400">{t('auth.loginDesc')}</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <LoginErrorBanner state={error} onDismiss={() => setError(null)} />}
            <div>
              <label className="label">{t('auth.emailOrPhone')}</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 dark:text-slate-500">
                  ✉
                </span>
                <input
                  type="email"
                  required
                  className="input pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label !mb-0">{t('auth.password')}</label>
                <a
                  href="#"
                  className="text-xs font-medium text-brand-700 hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  {t('auth.forgot')}
                </a>
              </div>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 dark:text-slate-500">
                  🔒
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="input pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={submitting}
            >
              {submitting ? t('auth.signingIn') : t('auth.signIn')}
            </button>
          </form>

          <div className="flex items-center gap-3 text-xs text-ink-300 dark:text-slate-500">
            <span className="h-px flex-1 bg-ink-100 dark:bg-surface-100" />
            {t('auth.orContinueWith')}
            <span className="h-px flex-1 bg-ink-100 dark:bg-surface-100" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" disabled className="btn-ghost opacity-60">
              <span aria-hidden>🇬</span> Google
            </button>
            <button type="button" disabled className="btn-ghost opacity-60">
              <span aria-hidden>📘</span> Facebook
            </button>
          </div>

          <p className="text-center text-sm text-ink-500 dark:text-slate-400">
            {t('auth.noAccount')}{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-700 hover:underline dark:text-brand-300"
            >
              {t('auth.signupNow')}
            </Link>
          </p>

          <div className="rounded-xl border border-dashed border-ink-100 bg-slate-50 p-3 text-center text-xs text-ink-500 dark:border-surface-100 dark:bg-surface-100 dark:text-slate-300">
            <span className="font-semibold">{t('auth.demoAdmin')}:</span>{' '}
            admin@travelmind.local / Admin@123456
            <br />
            <span className="font-semibold">{t('auth.demoUser')}:</span>{' '}
            user@travelmind.local / User@123456
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginErrorBanner({ state, onDismiss }: { state: LoginErrorState; onDismiss: () => void }) {
  const { t } = useTranslation();

  if (!state) return null;

  const config: Record<NonNullable<LoginErrorState>['kind'], {
    icon: string;
    title: string;
    description: string;
    className: string;
  }> = {
    locked: {
      icon: '🔒',
      title: t('auth.lockedTitle'),
      description: t('auth.lockedDesc'),
      className:
        'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-700/40 dark:bg-rose-900/30 dark:text-rose-200',
    },
    invalid: {
      icon: '⚠️',
      title: t('auth.invalidTitle'),
      description: t('auth.invalidDesc'),
      className:
        'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700/40 dark:bg-amber-900/30 dark:text-amber-200',
    },
    unknown: {
      icon: '⚠️',
      title: t('auth.errorTitle'),
      description: t('auth.errorDesc'),
      className:
        'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-700/40 dark:bg-rose-900/30 dark:text-rose-200',
    },
  };

  const c = config[state.kind];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${c.className}`}
    >
      <span aria-hidden className="text-base leading-none">
        {c.icon}
      </span>
      <div className="flex-1">
        <p className="font-semibold">{c.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed opacity-90">{c.description}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-full p-1 text-current opacity-70 hover:opacity-100"
        aria-label={t('common.cancel')}
      >
        ✕
      </button>
    </div>
  );
}