import { formatBudgetLabel } from '@/utils/format';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/services';
import { AdminTrip } from '@/types';
import { useConfirm } from '@/components/ConfirmProvider';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

type StatusFilter = 'ALL' | 'DRAFT' | 'GENERATED' | 'ARCHIVED';

const STATUS_FILTERS: StatusFilter[] = ['ALL', 'GENERATED', 'DRAFT', 'ARCHIVED'];

function formatDateRange(startIso: string, endIso: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  return `${fmt(startIso)} - ${fmt(endIso)}`;
}

function statusBadge(status: AdminTrip['status'], t: (k: string) => string) {
  switch (status) {
    case 'DRAFT':
      return <span className="badge-muted">{t('status.DRAFT')}</span>;
    case 'ARCHIVED':
      return <span className="badge-warning">{t('status.ARCHIVED')}</span>;
    case 'GENERATED':
    default:
      return <span className="badge-success">{t('status.GENERATED')}</span>;
  }
}

export default function AdminTripsPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [trips, setTrips] = useState<AdminTrip[] | null>(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setTrips(await adminService.listTrips());
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: t('admin.deleteTripConfirm'),
      confirmLabel: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      setDeletingId(id);
      await adminService.deleteTrip(id);
      setTrips((prev) => (prev ? prev.filter((t) => t.id !== id) : prev));
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    if (!trips) return [];
    const q = query.trim().toLowerCase();
    return trips.filter((trip) => {
      if (filter !== 'ALL' && trip.status !== filter) return false;
      if (!q) return true;
      return (
        trip.destination.toLowerCase().includes(q) ||
        trip.user.name.toLowerCase().includes(q) ||
        trip.user.email.toLowerCase().includes(q)
      );
    });
  }, [trips, filter, query]);

  if (error) return <ErrorState message={t('admin.tripsError')} />;
  if (trips === null) return <LoadingState message={t('admin.tripsLoading')} />;

  const count = filtered.length;
  const totalCount = trips.length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 dark:text-slate-100">
            {t('admin.tripsTitle')}
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-slate-400">
            {t('admin.tripsSubtitle', { count: totalCount })}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('admin.tripsSearchPlaceholder')}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-surface-100 dark:bg-surface-200 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-400 dark:focus:ring-brand-900/40"
          />
        </div>
        <div className="flex flex-wrap gap-1 rounded-full bg-slate-100 p-1 text-xs dark:bg-surface-100">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1 font-medium transition ${
                filter === s
                  ? 'bg-white text-brand-700 shadow dark:bg-surface-200 dark:text-brand-300'
                  : 'text-ink-600 hover:text-ink-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {s === 'ALL' ? t('admin.tripsFilterAll') : t(`status.${s}`)}
            </button>
          ))}
        </div>
      </div>

      {totalCount === 0 ? (
        <EmptyState
          title={t('admin.tripsEmptyTitle')}
          description={t('admin.tripsEmptyDesc')}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-ink-100 text-sm dark:divide-surface-100">
              <thead className="bg-ink-100/40 text-left text-xs uppercase tracking-wide text-ink-500 dark:bg-surface-100 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">
                    {t('admin.colDestination')}
                  </th>
                  <th className="px-5 py-3 font-medium">{t('admin.colTripUser')}</th>
                  <th className="px-5 py-3 font-medium">{t('admin.colTripDates')}</th>
                  <th className="px-5 py-3 font-medium">{t('admin.colTripTravelers')}</th>
                  <th className="px-5 py-3 font-medium">{t('admin.colTripBudget')}</th>
                  <th className="px-5 py-3 font-medium">{t('admin.colRecStatus')}</th>
                  <th className="px-5 py-3 font-medium">{t('admin.colCreated')}</th>
                  <th className="px-5 py-3 font-medium text-right">
                    {t('admin.colActions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-surface-100">
                {filtered.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50 dark:hover:bg-surface-100">
                    <td className="px-5 py-3 font-medium text-ink-900 dark:text-slate-100">
                      {trip.destination}
                    </td>
                    <td className="px-5 py-3 text-ink-700 dark:text-slate-200">
                      <div className="font-medium text-ink-900 dark:text-slate-100">{trip.user.name}</div>
                      <div className="text-xs text-ink-500 dark:text-slate-400">{trip.user.email}</div>
                    </td>
                    <td className="px-5 py-3 text-ink-700 dark:text-slate-200">
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </td>
                    <td className="px-5 py-3 text-ink-700 dark:text-slate-200">
                      {trip.travelers} {t('admin.tripsTravelersUnit')}
                    </td>
                    <td className="px-5 py-3 text-ink-700 dark:text-slate-200">{formatBudgetLabel(trip.budget, t)}</td>
                    <td className="px-5 py-3">{statusBadge(trip.status, t)}</td>
                    <td className="px-5 py-3 text-ink-500 dark:text-slate-400">
                      {new Date(trip.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(trip.id)}
                        disabled={deletingId === trip.id}
                        className="btn-danger disabled:opacity-50"
                      >
                        {deletingId === trip.id
                          ? t('admin.tripsDeleting')
                          : t('common.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="border-t border-ink-100 px-5 py-6 text-center text-sm text-ink-500 dark:border-surface-100 dark:text-slate-400">
              {t('admin.tripsNoMatch', { count })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
