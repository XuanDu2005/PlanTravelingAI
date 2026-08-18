import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/services';
import { AdminAnalytics } from '@/types';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

const CATEGORY_COLORS: Record<string, string> = {
  NATURE: '#34d399',
  CULTURE: '#f59e0b',
  RESORT: '#a78bfa',
  ADVENTURE: '#fb7185',
  BEACH: '#22d3ee',
};
const CATEGORY_FALLBACK = '#94a3b8';

function BarChart({
  data,
  color,
}: {
  data: { label: string; count: number }[];
  color: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const width = 480;
  const height = 200;
  const padX = 28;
  const padY = 24;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const barWidth = data.length > 0 ? innerW / data.length - 8 : 0;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-48 w-full"
      role="img"
      aria-label="monthly chart"
    >
      {/* y-axis grid lines */}
      {[0.25, 0.5, 0.75, 1].map((p) => (
        <line
          key={p}
          x1={padX}
          x2={width - padX}
          y1={padY + innerH * (1 - p)}
          y2={padY + innerH * (1 - p)}
          stroke="#e2e8f0"
          strokeDasharray="4 4"
        />
      ))}
      {data.map((d, idx) => {
        const h = (d.count / max) * innerH;
        const x = padX + idx * (innerW / data.length) + 4;
        const y = padY + innerH - h;
        return (
          <g key={idx}>
            <rect
              x={x}
              y={y}
              width={Math.max(0, barWidth)}
              height={Math.max(0, h)}
              rx={6}
              fill={color}
            />
            {d.count > 0 && (
              <text
                x={x + barWidth / 2}
                y={y - 4}
                textAnchor="middle"
                className="fill-ink-700 text-[10px] font-medium"
              >
                {d.count}
              </text>
            )}
            <text
              x={x + barWidth / 2}
              y={padY + innerH + 14}
              textAnchor="middle"
              className="fill-ink-500 text-[10px]"
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
  const radius = 70;
  const stroke = 26;
  const c = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 200 200" className="h-40 w-40" role="img" aria-label="category donut">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        {slices.map((s, i) => {
          const dash = (s.value / total) * c;
          const seg = (
            <circle
              key={i}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 100 100)"
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return seg;
        })}
        <text
          x="100"
          y="98"
          textAnchor="middle"
          className="fill-ink-900 text-2xl font-bold"
        >
          {total}
        </text>
        <text
          x="100"
          y="118"
          textAnchor="middle"
          className="fill-ink-500 text-[11px]"
        >
          total
        </text>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ background: s.color }}
            />
            <span className="font-medium text-ink-800">{s.label}</span>
            <span className="text-ink-500">({s.value})</span>
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
      hint: t('admin.totalUsersHint'),
      value: analytics.totals.users,
      icon: '👥',
      bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    {
      key: 'trips',
      label: t('admin.totalTrips'),
      hint: t('admin.totalTripsHint'),
      value: analytics.totals.trips,
      icon: '🧳',
      bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    {
      key: 'recommendations',
      label: t('admin.totalRecs'),
      hint: t('admin.totalRecsHint'),
      value: analytics.totals.recommendations,
      icon: '🌍',
      bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
    {
      key: 'published',
      label: t('admin.published'),
      hint: t('admin.publishedHint'),
      value: analytics.totals.publishedRecommendations,
      icon: '🚀',
      bg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    },
    {
      key: 'favorites',
      label: t('admin.totalFavorites'),
      hint: t('admin.favoritesHint'),
      value: analytics.totals.favorites,
      icon: '⭐',
      bg: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    },
    {
      key: 'locked',
      label: t('admin.totalLocked'),
      hint: t('admin.lockedHint'),
      value: analytics.totals.lockedUsers,
      icon: '🔒',
      bg: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 dark:text-slate-100">
            {t('admin.analyticsTitle')}
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-slate-400">
            {t('admin.analyticsDesc')}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            totalTripsTrend >= 0
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
          }`}
        >
          {totalTripsTrend >= 0 ? '↑' : '↓'} {Math.abs(totalTripsTrend)}{' '}
          {t('admin.analyticsTrendVsPrev')}
        </span>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((s) => (
          <div key={s.key} className="card p-5">
            <div className="flex items-center justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-xl text-xl ${s.bg}`}>
                {s.icon}
              </span>
            </div>
            <p className="mt-3 text-xs uppercase tracking-wide text-ink-500 dark:text-slate-400">
              {s.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-ink-900 dark:text-slate-100">
              {s.value.toLocaleString('vi-VN')}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-400 dark:text-slate-500">{s.hint}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900 dark:text-slate-100">
              {t('admin.analyticsTripsTitle')}
            </h2>
            <p className="text-xs text-ink-500 dark:text-slate-400">{t('admin.analyticsLastSix')}</p>
          </div>
          <BarChart
            data={analytics.monthlyTrips}
            color="#10b981"
          />
        </div>

        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink-900 dark:text-slate-100">
            {t('admin.analyticsCatsTitle')}
          </h2>
          <p className="mt-0.5 text-xs text-ink-500 dark:text-slate-400">
            {t('admin.analyticsCatsDesc')}
          </p>
          {categorySlices.length === 0 ? (
            <p className="mt-6 text-sm text-ink-500 dark:text-slate-400">{t('admin.recsEmptyTitle')}</p>
          ) : (
            <div className="mt-4">
              <DonutChart slices={categorySlices} />
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink-900 dark:text-slate-100">
            {t('admin.analyticsTopDestTitle')}
          </h2>
          <p className="mt-0.5 text-xs text-ink-500 dark:text-slate-400">
            {t('admin.analyticsTopDestDesc')}
          </p>
          {analytics.topTripDestinations.length === 0 ? (
            <p className="mt-6 text-sm text-ink-500 dark:text-slate-400">{t('admin.recsEmptyTitle')}</p>
          ) : (
            <ol className="mt-4 space-y-2">
              {analytics.topTripDestinations.map((d, idx) => {
                const max = Math.max(...analytics.topTripDestinations.map((x) => x.count));
                const pct = Math.round((d.count / Math.max(1, max)) * 100);
                return (
                  <li key={d.destination} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink-900 dark:text-slate-100">
                        <span className="mr-2 inline-block w-5 text-ink-400 dark:text-slate-500">
                          {idx + 1}.
                        </span>
                        {d.destination}
                      </span>
                      <span className="text-ink-500 dark:text-slate-400">{d.count}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-surface-100">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink-900 dark:text-slate-100">
            {t('admin.analyticsRecentActivity')}
          </h2>
          <p className="mt-0.5 text-xs text-ink-500 dark:text-slate-400">
            {t('admin.analyticsRecentDesc')}
          </p>
          <ul className="mt-4 divide-y divide-slate-100 dark:divide-surface-100">
            {analytics.recentTrips.map((t2) => (
              <li key={t2.id} className="flex items-start gap-3 py-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 text-sm dark:bg-emerald-900/40 dark:text-emerald-300">
                  �
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink-900 dark:text-slate-100">
                    <span className="font-medium">{t2.user.name}</span>{' '}
                    <span className="text-ink-500 dark:text-slate-400">{t('admin.analyticsCreatedTrip')}</span>{' '}
                    <span className="font-medium">{t2.destination}</span>
                  </p>
                  <p className="text-xs text-ink-400 dark:text-slate-500">
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
              <li key={u.id} className="flex items-start gap-3 py-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700 text-sm dark:bg-blue-900/40 dark:text-blue-300">
                  👤
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink-900 dark:text-slate-100">
                    <span className="font-medium">{u.name}</span>{' '}
                    <span className="text-ink-500 dark:text-slate-400">{t('admin.analyticsSignedUp')}</span>
                  </p>
                  <p className="truncate text-xs text-ink-400 dark:text-slate-500">{u.email}</p>
                </div>
              </li>
            ))}
            {analytics.recentTrips.length === 0 &&
              analytics.recentSignups.length === 0 && (
                <li className="py-3 text-sm text-ink-500 dark:text-slate-400">
                  {t('admin.recsEmptyTitle')}
                </li>
              )}
          </ul>
        </div>
      </section>
    </div>
  );
}
