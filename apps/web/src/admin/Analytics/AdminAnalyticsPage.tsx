import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/services';
import { AdminAnalytics } from '@/types';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

const CATEGORY_COLORS: Record<string, string> = {
  NATURE: '#10b981',
  CULTURE: '#f59e0b',
  RESORT: '#8b5cf6',
  ADVENTURE: '#f43f5e',
  BEACH: '#06b6d4',
};
const CATEGORY_FALLBACK = '#64748b';

function BarChart({
  data,
  color,
}: {
  data: { label: string; count: number }[];
  color: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const width = 480;
  const height = 180;
  const padX = 24;
  const padY = 20;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const barWidth = data.length > 0 ? innerW / data.length - 12 : 0;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-44 w-full"
      role="img"
      aria-label="monthly chart"
    >
      {[0.25, 0.5, 0.75, 1].map((p) => (
        <line
          key={p}
          x1={padX}
          x2={width - padX}
          y1={padY + innerH * (1 - p)}
          y2={padY + innerH * (1 - p)}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeDasharray="3 3"
        />
      ))}
      {data.map((d, idx) => {
        const h = (d.count / max) * innerH;
        const x = padX + idx * (innerW / data.length) + 6;
        const y = padY + innerH - h;
        return (
          <g key={idx}>
            <rect
              x={x}
              y={y}
              width={Math.max(0, barWidth)}
              height={Math.max(0, h)}
              rx={4}
              fill={color}
            />
            {d.count > 0 && (
              <text
                x={x + barWidth / 2}
                y={y - 4}
                textAnchor="middle"
                className="fill-slate-700 dark:fill-slate-200 text-[10px] font-bold"
              >
                {d.count}
              </text>
            )}
            <text
              x={x + barWidth / 2}
              y={padY + innerH + 14}
              textAnchor="middle"
              className="fill-slate-400 text-[10px] font-medium"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({
  slices,
}: {
  slices: { label: string; value: number; color: string }[];
}) {
  const total = Math.max(1, slices.reduce((s, x) => s + x.value, 0));
  const radius = 55;
  const stroke = 18;
  const c = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 160 160" className="h-36 w-36 shrink-0" role="img" aria-label="category donut">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-100 dark:text-slate-800"
          strokeWidth={stroke}
        />
        {slices.map((s, i) => {
          const dash = (s.value / total) * c;
          const seg = (
            <circle
              key={i}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 80 80)"
            />
          );
          offset += dash;
          return seg;
        })}
        <text
          x="80"
          y="78"
          textAnchor="middle"
          className="fill-slate-900 dark:fill-white text-xl font-bold font-sans"
        >
          {total}
        </text>
        <text
          x="80"
          y="94"
          textAnchor="middle"
          className="fill-slate-400 text-[10px] font-medium uppercase"
        >
          Total
        </text>
      </svg>
      <ul className="space-y-1.5 text-xs flex-1">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: s.color }}
              />
              <span className="text-slate-700 dark:text-slate-200 font-medium">{s.label}</span>
            </div>
            <span className="font-mono text-slate-500">({s.value})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    adminService
      .analytics()
      .then(setAnalytics)
      .catch(() => setError(true));
  }, []);

  const categorySlices = useMemo(() => {
    if (!analytics) return [];
    return analytics.recsByCategory.map((c) => ({
      label: t(`discover.category${c.category.charAt(0) + c.category.slice(1).toLowerCase()}`),
      value: c.count,
      color: CATEGORY_COLORS[c.category] ?? CATEGORY_FALLBACK,
    }));
  }, [analytics, t]);

  if (error) return <ErrorState message={t('admin.analyticsError')} />;
  if (!analytics) return <LoadingState message={t('admin.analyticsLoading')} />;

  const totalTripsTrend =
    analytics.monthlyTrips.length >= 2
      ? analytics.monthlyTrips[analytics.monthlyTrips.length - 1].count -
        analytics.monthlyTrips[analytics.monthlyTrips.length - 2].count
      : 0;

  const statCards = [
    {
      key: 'users',
      label: t('admin.totalUsers'),
      value: analytics.totals.users,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/></svg>
      ),
      bg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
    },
    {
      key: 'trips',
      label: t('admin.totalTrips'),
      value: analytics.totals.trips,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
      ),
      bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'recommendations',
      label: t('admin.totalRecs'),
      value: analytics.totals.recommendations,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      ),
      bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
    },
    {
      key: 'published',
      label: t('admin.published'),
      value: analytics.totals.publishedRecommendations,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      ),
      bg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400',
    },
    {
      key: 'favorites',
      label: t('admin.totalFavorites'),
      value: analytics.totals.favorites,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      ),
      bg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400',
    },
    {
      key: 'locked',
      label: t('admin.totalLocked'),
      value: analytics.totals.lockedUsers,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      ),
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Trend Row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Chỉ số phân tích toàn diện
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
            totalTripsTrend >= 0
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
          }`}
        >
          <span>{totalTripsTrend >= 0 ? '↑' : '↓'} {Math.abs(totalTripsTrend)}</span>
          <span>{t('admin.analyticsTrendVsPrev')}</span>
        </span>
      </div>

      {/* 6 Metric Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((s) => (
          <div
            key={s.key}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {s.label}
              </span>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.bg}`}
              >
                {s.icon}
              </div>
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
              {s.value.toLocaleString('vi-VN')}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Monthly Trips Chart */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('admin.analyticsTripsTitle')}
            </h2>
            <span className="text-[11px] text-slate-400">{t('admin.analyticsLastSix')}</span>
          </div>
          <BarChart data={analytics.monthlyTrips} color="#3b82f6" />
        </div>

        {/* Categories Donut Chart */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-2">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('admin.analyticsCatsTitle')}
            </h2>
          </div>
          {categorySlices.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">{t('admin.recsEmptyTitle')}</p>
          ) : (
            <DonutChart slices={categorySlices} />
          )}
        </div>
      </div>

      {/* Top Destinations & Activity Feed */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Destinations */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('admin.analyticsTopDestTitle')}
            </h2>
          </div>

          {analytics.topTripDestinations.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">{t('admin.recsEmptyTitle')}</p>
          ) : (
            <ol className="space-y-2">
              {analytics.topTripDestinations.map((d, idx) => {
                const max = Math.max(...analytics.topTripDestinations.map((x) => x.count));
                const pct = Math.round((d.count / Math.max(1, max)) * 100);
                return (
                  <li key={d.destination} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        <span className="inline-block w-4 font-mono text-slate-400">
                          {idx + 1}.
                        </span>
                        {d.destination}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        {d.count} chuyến
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('admin.analyticsRecentActivity')}
            </h2>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {analytics.recentTrips.map((t2) => (
              <li key={t2.id} className="flex items-start gap-2.5 py-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 text-xs">
                  ✓
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-800 dark:text-slate-200">
                    <strong className="font-semibold text-slate-900 dark:text-white">{t2.user.name}</strong>{' '}
                    <span className="text-slate-500">{t('admin.analyticsCreatedTrip')}</span>{' '}
                    <strong className="font-semibold text-blue-600 dark:text-blue-400">{t2.destination}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(t2.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </li>
            ))}
            {analytics.recentSignups.map((u) => (
              <li key={u.id} className="flex items-start gap-2.5 py-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 text-xs">
                  👤
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-800 dark:text-slate-200">
                    <strong className="font-semibold text-slate-900 dark:text-white">{u.name}</strong>{' '}
                    <span className="text-slate-500">{t('admin.analyticsSignedUp')}</span>
                  </p>
                  <p className="truncate text-[10px] text-slate-400">{u.email}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
