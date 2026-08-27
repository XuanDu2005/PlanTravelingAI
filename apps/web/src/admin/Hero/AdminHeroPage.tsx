import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { heroService } from '@/services';
import { AdminHeroSlide } from '@/types';
import { useConfirm } from '@/components/ConfirmProvider';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

export default function AdminHeroPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [slides, setSlides] = useState<AdminHeroSlide[] | null>(null);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ open: boolean; src?: AdminHeroSlide | null }>({
    open: false,
  });

  const load = useCallback(async () => {
    try {
      setSlides(await heroService.listAll());
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (imageUrl: string) => {
    if (draft.src) {
      const updated = await heroService.update(draft.src.id, { imageUrl });
      setSlides((prev) =>
        prev ? prev.map((s) => (s.id === updated.id ? updated : s)) : prev,
      );
      toast.success(t('admin.heroUpdateSuccess'));
    } else {
      const created = await heroService.create({ imageUrl });
      setSlides((prev) => (prev ? [...prev, created] : [created]));
      toast.success(t('admin.heroCreateSuccess'));
    }
    setDraft({ open: false });
  };

  const handleDelete = async (slide: AdminHeroSlide) => {
    const ok = await confirm({
      title: t('admin.heroDeleteConfirmTitle'),
      description: t('admin.heroDeleteConfirm', { id: slide.id }),
      confirmLabel: t('admin.heroDelete'),
      variant: 'danger',
    });
    if (!ok) return;
    setBusyId(slide.id);
    try {
      await heroService.remove(slide.id);
      setSlides((prev) => (prev ? prev.filter((s) => s.id !== slide.id) : prev));
      toast.success(t('admin.heroDeleteSuccess'));
    } catch {
      toast.error(t('admin.heroDeleteError'));
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (slide: AdminHeroSlide) => {
    setBusyId(slide.id);
    try {
      const updated = await heroService.update(slide.id, { isActive: !slide.isActive });
      setSlides((prev) =>
        prev ? prev.map((s) => (s.id === updated.id ? updated : s)) : prev,
      );
    } catch {
      toast.error(t('admin.heroUpdateError'));
    } finally {
      setBusyId(null);
    }
  };

  const handleMove = async (slide: AdminHeroSlide, direction: 'up' | 'down') => {
    setBusyId(slide.id);
    try {
      await heroService.move(slide.id, direction);
      await load();
    } catch {
      toast.error(t('admin.heroMoveError'));
    } finally {
      setBusyId(null);
    }
  };

  if (error) return <ErrorState message={t('admin.heroError')} />;
  if (!slides) return <LoadingState message={t('admin.heroLoading')} />;

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Tổng số: <strong className="text-slate-900 dark:text-white">{slides.length}</strong> slide
        </span>
        <button
          type="button"
          onClick={() => setDraft({ open: true, src: null })}
          className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
        >
          <span className="text-sm font-bold">+</span>
          <span>{t('admin.heroAdd')}</span>
        </button>
      </div>

      {slides.length === 0 ? (
        <EmptyState
          title={t('admin.heroEmptyTitle')}
          description={t('admin.heroEmptyDesc')}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0D1527] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 w-28">{t('admin.heroColOrder')}</th>
                  <th className="px-5 py-3.5 w-36">{t('admin.heroColPreview')}</th>
                  <th className="px-5 py-3.5">{t('admin.heroColUrl')}</th>
                  <th className="px-5 py-3.5 w-36">{t('admin.heroColStatus')}</th>
                  <th className="px-5 py-3.5 text-right w-48">{t('admin.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {slides.map((slide, idx) => {
                  const rowBusy = busyId === slide.id;
                  const canMoveUp = idx > 0;
                  const canMoveDown = idx < slides.length - 1;
                  return (
                    <tr
                      key={slide.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-3.5 align-middle">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={!canMoveUp || rowBusy}
                            onClick={() => handleMove(slide, 'up')}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 disabled:opacity-30 cursor-pointer shadow-2xs"
                            title={t('admin.heroMoveUp')}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={!canMoveDown || rowBusy}
                            onClick={() => handleMove(slide, 'down')}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 disabled:opacity-30 cursor-pointer shadow-2xs"
                            title={t('admin.heroMoveDown')}
                          >
                            ↓
                          </button>
                          <span className="ml-1 text-xs font-mono font-bold text-slate-400">
                            #{slide.sortOrder}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 align-middle">
                        <div className="h-12 w-20 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-2xs">
                          <img
                            src={slide.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.opacity = '0.3';
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 align-middle">
                        <p className="max-w-md truncate font-mono text-xs text-slate-600 dark:text-slate-300">
                          {slide.imageUrl}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 align-middle">
                        {slide.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-[11px] font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {t('admin.statusActive')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-2.5 py-0.5 text-[11px] font-semibold">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            {t('admin.statusLocked')}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(slide)}
                            disabled={rowBusy}
                            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-40"
                          >
                            {slide.isActive ? t('admin.heroDeactivate') : t('admin.heroActivate')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDraft({ open: true, src: slide })}
                            disabled={rowBusy}
                            className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-cyan-300 hover:bg-blue-100 cursor-pointer disabled:opacity-40"
                          >
                            {t('admin.heroEdit')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(slide)}
                            disabled={rowBusy}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 cursor-pointer disabled:opacity-40"
                          >
                            {t('common.delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Hiển thị <strong>{slides.length}</strong> slide trình chiếu</span>
          </div>
        </div>
      )}

      {draft.open && (
        <HeroSlideFormModal
          src={draft.src ?? null}
          onConfirm={handleSave}
          onClose={() => setDraft({ open: false })}
        />
      )}
    </div>
  );
}

function HeroSlideFormModal({
  src,
  onConfirm,
  onClose,
}: {
  src: AdminHeroSlide | null;
  onConfirm: (imageUrl: string) => Promise<void> | void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [url, setUrl] = useState(src?.imageUrl ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const valid = /^https?:\/\/\S+/i.test(url.trim());

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      await onConfirm(url.trim());
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
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6 space-y-4"
      >
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {src ? t('admin.heroEditTitle') : t('admin.heroAddTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('admin.heroFormHint')}
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {t('admin.heroUrlLabel')}
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            required
            autoFocus
            className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition"
          />
          {touched && !valid && (
            <p className="mt-1 text-xs text-rose-500 font-medium">
              {t('admin.heroUrlInvalid')}
            </p>
          )}
        </div>

        {valid && (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-40 shadow-xs">
            <img
              src={url}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.opacity = '0.3';
              }}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
            disabled={submitting}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting || !valid}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {submitting ? t('admin.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
