import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/services';
import { AdminDashboardStats, RecommendationSummary } from '@/types';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

interface StatItem {
  key: 'totalUsers' | 'totalTrips' | 'totalRecommendations' | 'publishedRecommendations';
  labelKey: string;
  icon: string;
  bg: string;
  trend: string;
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [error, setError] = useState(false);
  const [recentRecs, setRecentRecs] = useState<RecommendationSummary[]>([]);

  useEffect(() => {
    adminService
      .dashboard()
      .then(setStats)
      .catch(() => setError(true));
    adminService
      .listRecommendations()
      .then((rs) => setRecentRecs(rs.slice(0, 5)))
      .catch(() => undefined);
  }, []);

  const items: StatItem[] = useMemo(
    () => [
      {
        key: 'totalUsers',
        labelKey: 'admin.totalUsers',
        icon: '👥',
        bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        trend: '+12.5%',
      },
      {
        key: 'totalTrips',
        labelKey: 'admin.totalTrips',
        icon: '🧳',
        bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        trend: '+8.3%',
      },
      {
        key: 'totalRecommendations',
        labelKey: 'admin.totalRecs',
        icon: '🌍',
        bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        trend: '+24.0%',
      },
      {
        key: 'publishedRecommendations',
        labelKey: 'admin.published',
        icon: '🚀',
        bg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
        trend: '+5.1%',
      },
    ],
    [],
  );

  if (error) return <ErrorState message={t('admin.recsError')} />;
  if (!stats) return <LoadingState message={t('admin.recsLoading')} />;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 dark:text-slate-100">
            {t('admin.greeting', { name: 'Admin' })}
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-slate-400">
            {t('admin.dashboardDesc')}
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          {t('admin.systemHealthy')}
        </span>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.key} className="card p-5">
            <div className="flex items-center justify-between">
              <span
                className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl ${it.bg}`}
              >
                {it.icon}
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                ↑ {it.trend}
              </span>
            </div>
            <p className="mt-4 text-sm text-ink-500 dark:text-slate-400">{t(it.labelKey)}</p>
            <p className="mt-1 text-3xl font-bold text-ink-900 dark:text-slate-100">
              {stats[it.key].toLocaleString('vi-VN')}
            </p>
          </div>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900 dark:text-slate-100">
              {t('admin.recentRecs')}
            </h2>
            <a
              href="/admin/recommendations"
              className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300"
            >
              {t('common.viewAll')} →
            </a>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-surface-100">
            <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-surface-100">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-500 dark:bg-surface-100 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2.5 font-medium">{t('admin.colTitle')}</th>
                  <th className="px-4 py-2.5 font-medium">
                    {t('admin.colDestination')}
                  </th>
                  <th className="px-4 py-2.5 font-medium">
                    {t('admin.colRecStatus')}
                  </th>
                  <th className="px-4 py-2.5 font-medium">
                    {t('admin.colCreated')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-surface-100">
                {recentRecs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-ink-500 dark:text-slate-400"
                    >
                      {t('admin.recsEmptyTitle')}
                    </td>
                  </tr>
                ) : (
                  recentRecs.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-surface-100">
                      <td className="px-4 py-3 font-medium text-ink-900 dark:text-slate-100">
                        {r.title}
                      </td>
                      <td className="px-4 py-3 text-ink-700 dark:text-slate-200">
                        {r.destination}
                      </td>
                      <td className="px-4 py-3">
                        {r.isPublished ? (
                          <span className="badge-success">
                            {t('admin.statusPublished')}
                          </span>
                        ) : (
                          <span className="badge-muted">
                            {t('admin.statusDraft')}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-500 dark:text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink-900 dark:text-slate-100">
            {t('admin.quickActions')}
          </h2>
          <p className="mt-1 text-sm text-ink-500 dark:text-slate-400">
            {t('admin.quickActionsDesc')}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <a href="/admin/recommendations/new" className="btn-primary">
              {t('admin.newRec')}
            </a>
            <a href="/admin/recommendations" className="btn-ghost">
              {t('admin.manageRecs')}
            </a>
            <a href="/admin/users" className="btn-ghost">
              {t('admin.viewUsers')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}