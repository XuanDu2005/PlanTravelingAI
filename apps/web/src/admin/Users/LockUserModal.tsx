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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-5 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans">
            {title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {reasonLabel}
            </label>
            <textarea
              ref={inputRef}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={reasonHint}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
            />
            <span className="mt-0.5 block text-right text-[10px] text-slate-400">
              {reason.length}/500
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
              disabled={submitting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition disabled:opacity-50 cursor-pointer ${
                isLock
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {submitting ? t('admin.saving') : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
