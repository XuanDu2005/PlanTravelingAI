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
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(profile?.name ?? '');
    setAvatar(profile?.avatar ?? '');
    setAvatarUrl('');
    setShowUrlInput(false);
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
    setShowUrlInput(false);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 px-4 py-6 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-[28px] border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0D1527] p-6 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl text-left transition-all animate-in zoom-in-95 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {t('profileEdit.title')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="close"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            
            {/* Interactive Avatar Circle with Camera Overlay */}
            <div
              onClick={() => fileRef.current?.click()}
              className="group relative h-24 w-24 rounded-full cursor-pointer overflow-hidden ring-4 ring-blue-500/20 dark:ring-cyan-500/20 hover:ring-blue-500/40 transition-all shadow-lg"
              title={t('profileEdit.avatarTooltip')}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={name || profile?.name || 'A'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-3xl font-black text-white">
                  {(name || profile?.name || profile?.email || 'A').charAt(0).toUpperCase()}
                </div>
              )}

              {/* Hover Camera Icon Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 backdrop-blur-[1px]">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className="text-[9px] font-bold mt-1">{t('profileEdit.changeAvatar')}</span>
              </div>
            </div>

            {/* Avatar Action Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
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

              {/* Upload Button */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:text-cyan-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition cursor-pointer shadow-2xs"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>{t('profileEdit.upload')}</span>
              </button>

              {/* Link URL Toggle */}
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                <span>{t('profileEdit.pasteUrl')}</span>
              </button>

              {/* Remove Avatar Button */}
              {avatar && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  <span>{t('profileEdit.remove')}</span>
                </button>
              )}
            </div>

            {/* Optional URL Input Bar */}
            {showUrlInput && (
              <div className="flex w-full items-center gap-2 animate-in fade-in">
                <input
                  type="url"
                  placeholder={t('profileEdit.urlPlaceholder')}
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleUseUrl}
                  disabled={!avatarUrl.trim()}
                  className="h-9 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold disabled:opacity-40 transition cursor-pointer"
                >
                  {t('profileEdit.useUrl')}
                </button>
              </div>
            )}
          </div>

          {/* Full Name Input Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('settings.fieldName')}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg>
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={t('profileEdit.namePlaceholder')}
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 pl-10 pr-3 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/15 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 active:scale-95 disabled:opacity-50 transition cursor-pointer"
            >
              {saving ? t('settings.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}