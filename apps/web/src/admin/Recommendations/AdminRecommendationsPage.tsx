import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/services';
import { RecommendationSummary } from '@/types';
import { useConfirm } from '@/components/ConfirmProvider';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

export default function AdminRecommendationsPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [recs, setRecs] = useState<RecommendationSummary[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      setRecs(await adminService.listRecommendations());
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handlePublish = async (id: string) => {
    try {
      await adminService.publishRecommendation(id, true);
      toast.success(t('admin.published_toast'));
      load();
    } catch {
      /* toast */
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: t('admin.deleteConfirm'),
      confirmLabel: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminService.deleteRecommendation(id);
      toast.success(t('admin.delete_toast'));
      load();
    } catch {
      /* toast */
    }
  };

  if (error) return <ErrorState message={t('admin.recsError')} />;
  if (recs === null) return <LoadingState message={t('admin.recsLoading')} />;

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Tổng số: <strong className="text-slate-900 dark:text-white">{recs.length}</strong> gợi ý hành trình
        </span>
        <Link
          to="/admin/recommendations/new"
          className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
        >
          <span className="text-sm font-bold">+</span>
          <span>{t('admin.newRec')}</span>
        </Link>
      </div>

      {recs.length === 0 ? (
        <EmptyState
          title={t('admin.recsEmptyTitle')}
          description={t('admin.recsEmptyDesc')}
          action={
            <Link
              to="/admin/recommendations/new"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white mt-3"
            >
              {t('admin.recsEmptyCta')}
            </Link>
          }
        />
      ) : (
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0D1527] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">{t('admin.colTitle')}</th>
                  <th className="px-5 py-3.5">{t('admin.colDestination')}</th>
                  <th className="px-5 py-3.5">{t('admin.colRecStatus')}</th>
                  <th className="px-5 py-3.5">{t('admin.colCreated')}</th>
                  <th className="px-5 py-3.5 text-right">{t('admin.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {recs.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {r.title}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                      {r.destination}
                    </td>
                    <td className="px-5 py-3.5">
                      {r.isPublished ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-[11px] font-bold">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {t('admin.statusPublished')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 text-[11px] font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          {t('admin.statusDraft')}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/recommendations/${r.id}/edit`}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                        >
                          {t('common.edit')}
                        </Link>
                        {!r.isPublished && (
                          <button
                            type="button"
                            onClick={() => handlePublish(r.id)}
                            className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-cyan-300 hover:bg-blue-100 transition cursor-pointer"
                          >
                            {t('admin.publish')}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 transition cursor-pointer"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Hiển thị <strong>{recs.length}</strong> gợi ý hành trình</span>
          </div>
        </div>
      )}
    </div>
  );
}
