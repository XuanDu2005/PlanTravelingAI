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
  return `${fmt(startIso)} → ${fmt(endIso)}`;
}

function statusBadge(status: AdminTrip['status'], t: (k: string) => string) {
  switch (status) {
    case 'DRAFT':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          {t('status.DRAFT')}
        </span>
      );
    case 'ARCHIVED':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {t('status.ARCHIVED')}
        </span>
      );
    case 'GENERATED':
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {t('status.GENERATED')}
        </span>
      );
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
    <div className="space-y-4">

      {/* Filter & Search Toolbar Card */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0D1527] p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('admin.tripsSearchPlaceholder')}
            className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/80 pl-10 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition"
          />
        </div>

        {/* High Contrast Status Filter Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                filter === s
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
        /* Trips Data Table */
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0D1527] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">{t('admin.colDestination')}</th>
                  <th className="px-5 py-3.5">{t('admin.colTripUser')}</th>
                  <th className="px-5 py-3.5">{t('admin.colTripDates')}</th>
                  <th className="px-5 py-3.5">{t('admin.colTripTravelers')}</th>
                  <th className="px-5 py-3.5">{t('admin.colTripBudget')}</th>
                  <th className="px-5 py-3.5">{t('admin.colRecStatus')}</th>
                  <th className="px-5 py-3.5">{t('admin.colCreated')}</th>
                  <th className="px-5 py-3.5 text-right">{t('admin.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filtered.map((trip) => (
                  <tr
                    key={trip.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {trip.destination}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {trip.user.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{trip.user.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-200 font-semibold">
                      {trip.travelers} {t('admin.tripsTravelersUnit')}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {formatBudgetLabel(trip.budget, t)}
                    </td>
                    <td className="px-5 py-3.5">{statusBadge(trip.status, t)}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      {new Date(trip.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(trip.id)}
                        disabled={deletingId === trip.id}
                        className="rounded-lg px-3 py-1.5 text-xs font-bold border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 transition cursor-pointer disabled:opacity-40"
                      >
                        {deletingId === trip.id ? t('admin.tripsDeleting') : t('common.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-slate-400">
              {t('admin.tripsNoMatch', { count })}
            </div>
          ) : (
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Hiển thị <strong>{filtered.length}</strong> / <strong>{totalCount}</strong> chuyến đi</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
