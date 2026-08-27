import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/services';
import { AdminDashboardStats, RecommendationSummary } from '@/types';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { Link } from 'react-router-dom';

interface StatItem {
  key: 'totalUsers' | 'totalTrips' | 'totalRecommendations' | 'publishedRecommendations';
  labelKey: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
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
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="7" r="4" />
            <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
            <circle cx="19" cy="8" r="3" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          </svg>
        ),
        iconBg: 'bg-blue-50 dark:bg-blue-950/50',
        iconColor: 'text-blue-600 dark:text-blue-400',
        trend: '+12.5%',
      },
      {
        key: 'totalTrips',
        labelKey: 'admin.totalTrips',
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
        ),
        iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        trend: '+8.3%',
      },
      {
        key: 'totalRecommendations',
        labelKey: 'admin.totalRecs',
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        ),
        iconBg: 'bg-amber-50 dark:bg-amber-950/50',
        iconColor: 'text-amber-600 dark:text-amber-400',
        trend: '+24.0%',
      },
      {
        key: 'publishedRecommendations',
        labelKey: 'admin.published',
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ),
        iconBg: 'bg-indigo-50 dark:bg-indigo-950/50',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        trend: '+5.1%',
      },
    ],
    [],
  );

  if (error) return <ErrorState message={t('admin.recsError')} />;
  if (!stats) return <LoadingState message={t('admin.recsLoading')} />;

  return (
    <div className="space-y-4">
      {/* System Status Row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Tổng quan chỉ số hoạt động
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t('admin.systemHealthy')}</span>
        </span>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div
            key={it.key}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t(it.labelKey)}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${it.iconBg} ${it.iconColor}`}
              >
                {it.icon}
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats[it.key].toLocaleString('vi-VN')}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ↑ {it.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Recs Table + Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Table Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('admin.recentRecs')}
            </h2>
            <Link
              to="/admin/recommendations"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t('common.viewAll')} →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">{t('admin.colTitle')}</th>
                  <th className="px-4 py-2.5">{t('admin.colDestination')}</th>
                  <th className="px-4 py-2.5">{t('admin.colRecStatus')}</th>
                  <th className="px-4 py-2.5 text-right">{t('admin.colCreated')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentRecs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-xs text-slate-400">
                      {t('admin.recsEmptyTitle')}
                    </td>
                  </tr>
                ) : (
                  recentRecs.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100">
                        {r.title}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                        {r.destination}
                      </td>
                      <td className="px-4 py-2.5">
                        {r.isPublished ? (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                            {t('admin.statusPublished')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                            {t('admin.statusDraft')}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('admin.quickActions')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('admin.quickActionsDesc')}
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <Link
              to="/admin/recommendations/new"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition"
            >
              <span>+</span>
              <span>{t('admin.newRec')}</span>
            </Link>
            <Link
              to="/admin/recommendations"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
            >
              <span>{t('admin.manageRecs')}</span>
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
            >
              <span>{t('admin.viewUsers')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}