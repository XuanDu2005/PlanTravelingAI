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
      await adminService.publish(id);
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
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 dark:text-slate-100">
            {t('admin.recsTitle')}
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-slate-400">{t('admin.recsDesc')}</p>
        </div>
        <Link to="/admin/recommendations/new" className="btn-primary">
          {t('admin.newRec')}
        </Link>
      </header>

      {recs.length === 0 ? (
        <EmptyState
          title={t('admin.recsEmptyTitle')}
          description={t('admin.recsEmptyDesc')}
          action={
            <Link to="/admin/recommendations/new" className="btn-primary mt-2">
              {t('admin.recsEmptyCta')}
            </Link>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-ink-100 text-sm dark:divide-surface-100">
              <thead className="bg-ink-100/40 text-left text-xs uppercase tracking-wide text-ink-500 dark:bg-surface-100 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">{t('admin.colTitle')}</th>
                  <th className="px-5 py-3 font-medium">
                    {t('admin.colDestination')}
                  </th>
                  <th className="px-5 py-3 font-medium">
                    {t('admin.colRecStatus')}
                  </th>
                  <th className="px-5 py-3 font-medium">{t('admin.colCreated')}</th>
                  <th className="px-5 py-3 font-medium text-right">
                    {t('admin.colActions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-surface-100">
                {recs.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-surface-100">
                    <td className="px-5 py-3 font-medium text-ink-900 dark:text-slate-100">
                      {r.title}
                    </td>
                    <td className="px-5 py-3 text-ink-700 dark:text-slate-200">{r.destination}</td>
                    <td className="px-5 py-3">
                      {r.isPublished ? (
                        <span className="badge-success">
                          {t('admin.statusPublished')}
                        </span>
                      ) : (
                        <span className="badge-muted">{t('admin.statusDraft')}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-ink-500 dark:text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/recommendations/${r.id}/edit`}
                          className="btn-soft"
                        >
                          {t('common.edit')}
                        </Link>
                        {!r.isPublished && (
                          <button
                            onClick={() => handlePublish(r.id)}
                            className="btn-ghost"
                          >
                            {t('admin.publish')}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="btn-danger"
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
        </div>
      )}
    </div>
  );
}
