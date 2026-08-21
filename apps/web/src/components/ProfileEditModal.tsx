import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { authService } from '@/services';
import { useAuth } from '@/store/AuthContext';
import { UserProfile } from '@/types';

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onSaved: (profile: UserProfile) => void;
}

const MAX_DATA_URL_LENGTH = 1_900_000; // ~1.4MB base64 of a 1MB image

function AvatarPreview({ src, alt }: { src: string; alt: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className="h-20 w-20 rounded-full object-cover ring-2 ring-white dark:ring-surface-300"
      />
    );
  }
  return (
    <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-2xl font-bold text-white ring-2 ring-white dark:ring-surface-300">
      {alt.charAt(0).toUpperCase()}
    </div>
  );
}

export default function ProfileEditModal({
  open,
  onClose,
  profile,
  onSaved,
}: ProfileEditModalProps) {
  const { t } = useTranslation();
  const { refresh } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(profile?.name ?? '');
    setAvatar(profile?.avatar ?? '');
    setAvatarUrl('');
  }, [open, profile]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('profileEdit.avatarInvalidType'));
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error(t('profileEdit.avatarTooLarge'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      if (dataUrl.length > MAX_DATA_URL_LENGTH) {
        toast.error(t('profileEdit.avatarTooLarge'));
        return;
      }
      setAvatar(dataUrl);
      setAvatarUrl('');
    };
    reader.readAsDataURL(file);
  };

  const handleUseUrl = () => {
    const trimmed = avatarUrl.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      toast.error(t('profileEdit.avatarInvalidUrl'));
      return;
    }
    setAvatar(trimmed);
    setAvatarUrl('');
  };

  const handleRemove = () => {
    setAvatar('');
    setAvatarUrl('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      toast.error(t('settings.nameTooShort'));
      return;
    }
    setSaving(true);
    try {
      const payload: { name?: string; avatar?: string } = {};
      if (trimmedName !== profile.name) payload.name = trimmedName;
      if (avatar !== profile.avatar) payload.avatar = avatar;
      const updated = await authService.updateProfile(payload);
      await refresh();
      onSaved(updated);
      toast.success(t('profileEdit.saved'));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-sm dark:bg-black/70"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="card w-full max-w-md p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink-900 dark:text-slate-100">
              {t('profileEdit.title')}
            </h2>
            <p className="mt-1 text-sm text-ink-500 dark:text-slate-400">
              {t('profileEdit.subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-ink-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-surface-100"
            aria-label="close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div className="flex flex-col items-center gap-3">
            <AvatarPreview src={avatar} alt={name || profile?.name || 'A'} />
            <div className="flex flex-wrap justify-center gap-2">
              <label className="btn-soft cursor-pointer">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
                📷 {t('profileEdit.upload')}
              </label>
              {avatar && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="btn-ghost"
                >
                  {t('profileEdit.remove')}
                </button>
              )}
            </div>
            <div className="flex w-full items-center gap-2">
              <input
                type="url"
                placeholder={t('profileEdit.avatarUrlPlaceholder')}
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-surface-100 dark:bg-surface-200 dark:text-slate-100 dark:focus:border-brand-400 dark:focus:ring-brand-900/40"
              />
              <button
                type="button"
                onClick={handleUseUrl}
                disabled={!avatarUrl.trim()}
                className="btn-ghost disabled:opacity-50"
              >
                {t('profileEdit.useUrl')}
              </button>
            </div>
            <p className="text-xs text-ink-400 dark:text-slate-500">{t('profileEdit.avatarHint')}</p>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-ink-700 dark:text-slate-200">
              {t('settings.fieldName')}
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-surface-100 dark:bg-surface-200 dark:text-slate-100 dark:focus:border-brand-400 dark:focus:ring-brand-900/40"
            />
          </label>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? t('settings.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}