import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/AuthContext';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    setSubmitting(true);
    try {
      await register(name, email, password);
      toast.success(t('auth.accountCreated'));
      navigate('/', { replace: true });
    } catch {
      /* toast handled by interceptor */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-md gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-ink-900 dark:text-slate-100">
          {t('auth.registerTitle')}
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-slate-400">{t('auth.registerDesc')}</p>
      </div>

      <form className="card space-y-4 p-6" onSubmit={handleSubmit}>
        <div>
          <label className="label">{t('auth.name')}</label>
          <input
            required
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('auth.namePlaceholder')}
            autoComplete="name"
          />
        </div>
        <div>
          <label className="label">{t('auth.email')}</label>
          <input
            required
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label">{t('auth.password')}</label>
          <input
            required
            minLength={6}
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.passwordPlaceholder')}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="label">{t('auth.confirmPassword')}</label>
          <input
            required
            minLength={6}
            type="password"
            className="input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={t('auth.confirmPasswordPlaceholder')}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? t('auth.creating') : t('auth.createAccountBtn')}
        </button>
        <p className="text-center text-sm text-ink-500 dark:text-slate-400">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-brand-700 hover:underline dark:text-brand-300">
            {t('auth.signInLink')}
          </Link>
        </p>
      </form>
    </div>
  );
}
