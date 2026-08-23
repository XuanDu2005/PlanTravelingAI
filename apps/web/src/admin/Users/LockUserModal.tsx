import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LockUserModalProps {
  open: boolean;
  userName: string;
  /** 'lock' = asking to lock, 'unlock' = asking to unlock. */
  mode: 'lock' | 'unlock';
  /** Apply to the user's status before they can submit. */
  defaultReason?: string;
  onConfirm: (reason: string | undefined) => Promise<void> | void;
  onClose: () => void;
}

export default function LockUserModal({
  open,
  userName,
  mode,
  defaultReason,
  onConfirm,
  onClose,
}: LockUserModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setReason(defaultReason ?? '');
      setSubmitting(false);
      // Focus textarea shortly after the modal mounts so the fallback
      // animation has time to apply.
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open, defaultReason]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const isLock = mode === 'lock';
  const title = isLock
    ? t('admin.lockUserTitle', { name: userName })
    : t('admin.unlockUserTitle', { name: userName });
  const description = isLock
    ? t('admin.lockUserDesc')
    : t('admin.unlockUserDesc');
  const confirmLabel = isLock
    ? t('admin.lockUser')
    : t('admin.unlockUser');
  const reasonLabel = isLock
    ? t('admin.lockReasonLabel')
    : t('admin.unlockReasonLabel');
  const reasonHint = isLock
    ? t('admin.lockReasonHint')
    : t('admin.unlockReasonHint');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const trimmed = reason.trim();
      await onConfirm(trimmed.length > 0 ? trimmed : undefined);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmClass = isLock
    ? 'inline-flex items-center justify-center rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400'
    : 'btn-primary';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-sm dark:bg-black/70"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="card w-full max-w-md p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-ink-900 dark:text-slate-100">
          {title}
        </h2>
        <p className="mt-2 text-sm text-ink-500 dark:text-slate-400">
          {description}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-ink-700 dark:text-slate-200">
              {reasonLabel}
            </span>
            <textarea
              ref={inputRef}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={reasonHint}
              className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-surface-100 dark:bg-surface-200 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-400 dark:focus:ring-brand-900/40"
            />
            <span className="mt-1 block text-right text-xs text-ink-400 dark:text-slate-500">
              {reason.length}/500
            </span>
          </label>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              disabled={submitting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`${confirmClass} disabled:opacity-50`}
            >
              {submitting ? t('admin.saving') : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
