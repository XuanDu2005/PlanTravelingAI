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
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 dark:text-slate-100">
            {t('admin.heroTitle')}
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-slate-400">
            {t('admin.heroSubtitle', { count: slides.length })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDraft({ open: true, src: null })}
          className="btn-primary"
        >
          + {t('admin.heroAdd')}
        </button>
      </header>

      {slides.length === 0 ? (
        <EmptyState
          title={t('admin.heroEmptyTitle')}
          description={t('admin.heroEmptyDesc')}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-ink-100 text-sm dark:divide-surface-100">
              <thead className="bg-ink-100/40 text-left text-xs uppercase tracking-wide text-ink-500 dark:bg-surface-100 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">{t('admin.heroColOrder')}</th>
                  <th className="px-5 py-3 font-medium">{t('admin.heroColPreview')}</th>
                  <th className="px-5 py-3 font-medium">{t('admin.heroColUrl')}</th>
                  <th className="px-5 py-3 font-medium">{t('admin.heroColStatus')}</th>
                  <th className="px-5 py-3 font-medium text-right">{t('admin.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-surface-100">
                {slides.map((slide, idx) => {
                  const rowBusy = busyId === slide.id;
                  const canMoveUp = idx > 0;
                  const canMoveDown = idx < slides.length - 1;
                  return (
                    <tr
                      key={slide.id}
                      className="hover:bg-slate-50 dark:hover:bg-surface-100"
                    >
                      <td className="px-5 py-3 align-middle text-ink-700 dark:text-slate-200">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={!canMoveUp || rowBusy}
                            onClick={() => handleMove(slide, 'up')}
                            className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 bg-white text-ink-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-surface-100 dark:bg-surface-200 dark:text-slate-200"
                            aria-label={t('admin.heroMoveUp')}
                            title={t('admin.heroMoveUp')}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={!canMoveDown || rowBusy}
                            onClick={() => handleMove(slide, 'down')}
                            className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 bg-white text-ink-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-surface-100 dark:bg-surface-200 dark:text-slate-200"
                            aria-label={t('admin.heroMoveDown')}
                            title={t('admin.heroMoveDown')}
                          >
                            ↓
                          </button>
                          <span className="ml-2 text-xs text-ink-400 dark:text-slate-500">
                            #{slide.sortOrder}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 align-middle">
                        <div className="h-12 w-20 overflow-hidden rounded-lg bg-slate-100 dark:bg-surface-100">
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
                      <td className="px-5 py-3 align-middle">
                        <p className="max-w-xs truncate font-mono text-xs text-ink-700 dark:text-slate-200">
                          {slide.imageUrl}
                        </p>
                      </td>
                      <td className="px-5 py-3 align-middle">
                        {slide.isActive ? (
                          <span className="badge-success">{t('admin.statusActive')}</span>
                        ) : (
                          <span className="badge-warning">{t('admin.statusLocked')}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(slide)}
                            disabled={rowBusy}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-ink-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-surface-100 dark:bg-surface-200 dark:text-slate-200 dark:hover:bg-surface-100"
                          >
                            {slide.isActive ? t('admin.heroDeactivate') : t('admin.heroActivate')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDraft({ open: true, src: slide })}
                            disabled={rowBusy}
                            className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 disabled:opacity-50 dark:border-brand-700/40 dark:bg-brand-900/30 dark:text-brand-200 dark:hover:bg-brand-900/50"
                          >
                            {t('admin.heroEdit')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(slide)}
                            disabled={rowBusy}
                            className="btn-danger disabled:opacity-50"
                          >
                            {t('admin.deleteUser')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-sm dark:bg-black/70"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-md space-y-4 p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-ink-900 dark:text-slate-100">
          {src ? t('admin.heroEditTitle') : t('admin.heroAddTitle')}
        </h2>
        <p className="text-xs text-ink-500 dark:text-slate-400">
          {t('admin.heroFormHint')}
        </p>

        <label className="block">
          <span className="text-xs font-medium text-ink-700 dark:text-slate-200">
            {t('admin.heroUrlLabel')}
          </span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            required
            autoFocus
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-surface-100 dark:bg-surface-200 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-400 dark:focus:ring-brand-900/40"
          />
          {touched && !valid && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
              {t('admin.heroUrlInvalid')}
            </p>
          )}
        </label>

        {valid && (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-surface-100">
            <img
              src={url}
              alt=""
              className="h-40 w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.opacity = '0.3';
              }}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
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
            disabled={submitting || !valid}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? t('admin.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
