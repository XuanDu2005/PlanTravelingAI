import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { tripService, favoriteService } from '@/services';
import { Trip, RecommendationSummary } from '@/types';
import { useConfirm } from '@/components/ConfirmProvider';
import { useFavorites } from '@/store/FavoritesProvider';
import FavoriteButton from '@/components/FavoriteButton';
import { formatBudgetLabel, formatVND } from '@/utils/format';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

const statusBadge: Record<Trip['status'], string> = {
  DRAFT: 'badge-muted',
  GENERATED: 'badge-success',
  ARCHIVED: 'badge-warning',
};

const today = new Date();

type Tab = 'trips' | 'favorites';

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function nights(start: string, end: string) {
  return Math.max(
    0,
    Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1,
  );
}

export default function MyTripsPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const favorites = useFavorites();
  const [tab, setTab] = useState<Tab>('trips');

  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [tripsError, setTripsError] = useState(false);

  const [favRecs, setFavRecs] = useState<RecommendationSummary[] | null>(null);
  const [favError, setFavError] = useState(false);

  const load = useCallback(async () => {
    setTrips(null);
    setTripsError(false);
    try {
      setTrips(await tripService.list());
    } catch {
      setTripsError(true);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    setFavRecs(null);
    setFavError(false);
    try {
      setFavRecs(await favoriteService.list());
    } catch {
      setFavError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (tab !== 'favorites') return;
    loadFavorites();
  }, [tab, loadFavorites]);

  // Keep the displayed list in sync with the global favorites set so that
  // heart toggles from a child card immediately drop the card from the view.
  const currentIds = favRecs?.map((r) => r.id).join('|') ?? '';
  const favIds = Array.from(favorites.ids).join('|');
  useEffect(() => {
    if (tab !== 'favorites' || !favRecs) return;
    if (currentIds === favIds) return;
    setFavRecs((prev) =>
      prev ? prev.filter((r) => favorites.ids.has(r.id)) : prev,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, favIds]);

  const handleDeleteTrip = async (id: string) => {
    const ok = await confirm({
      title: t('myTrips.deleteConfirm'),
      confirmLabel: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await tripService.remove(id);
      toast.success(t('myTrips.deleteSuccess'));
      setTrips((prev) => prev?.filter((x) => x.id !== id) ?? null);
    } catch {
      /* toast handled */
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-4 pb-20 pt-20 sm:px-8 sm:pt-22">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[500px] h-[300px] bg-gradient-to-l from-blue-600/8 via-indigo-500/5 to-transparent blur-[90px] rounded-full" />
      </div>

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
            {t('myTrips.title').split(' ').slice(0, -1).join(' ')}{' '}
            <span className="font-serif italic font-normal bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              {t('myTrips.title').split(' ').slice(-1)[0]}
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {tab === 'trips'
              ? t('myTrips.subtitle', { count: trips?.length ?? 0 })
              : t('favorites.subtitle', { count: favRecs?.length ?? 0 })}
          </p>
        </div>

        {/* New Trip Button — Apple iOS Glass */}
        <Link
          to="/create-trip"
          className="group relative inline-flex items-center justify-between gap-3 rounded-full bg-gradient-to-b from-[#4387f6] via-[#2563eb] to-[#1a4ecb] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(37,99,235,0.4),inset_0_1.5px_2px_rgba(255,255,255,0.7),inset_0_-1.5px_2px_rgba(0,0,0,0.2)] border-t border-b border-white/60 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_10px_28px_rgba(37,99,235,0.55)] active:scale-95 overflow-hidden"
        >
          <span className="pointer-events-none absolute inset-x-3 top-0.5 h-[45%] rounded-full bg-gradient-to-b from-white/60 via-white/15 to-transparent" />
          <span className="relative z-10 flex items-center gap-1.5">
            <span className="text-sm">✨</span>
            <span>{t('myTrips.newTrip')}</span>
          </span>
          <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-white/40 to-white/10 border border-white/70 overflow-hidden transition-transform group-hover:translate-x-0.5">
            <span className="absolute inset-x-0.5 top-0 h-[40%] rounded-full bg-gradient-to-b from-white/80 to-transparent" />
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>
        </Link>
      </header>

      {/* Tabs */}
      <div className="flex gap-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 p-1.5 max-w-fit border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
        <TabButton
          active={tab === 'trips'}
          onClick={() => setTab('trips')}
          label={t('myTrips.tabTrips')}
          icon={<svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>}
        />
        <TabButton
          active={tab === 'favorites'}
          onClick={() => setTab('favorites')}
          label={t('myTrips.tabFavorites')}
          icon={<svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill={tab === 'favorites' ? '#f43f5e' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
          count={favorites.ids.size}
        />
      </div>

      {tab === 'trips' ? (
        <TripsTab
          trips={trips}
          error={tripsError}
          onDelete={handleDeleteTrip}
        />
      ) : (
        <FavoritesTab recs={favRecs} error={favError} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  icon,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
        active
          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-300 shadow-md shadow-blue-500/10 border border-slate-200/60 dark:border-slate-700/60'
          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/40'
      }`}
    >
      <span aria-hidden>{icon}</span>
      {label}
      {typeof count === 'number' && count > 0 && (
        <span
          className={`inline-flex h-4.5 min-w-[1.1rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
            active
              ? 'bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950'
              : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function TripsTab({
  trips,
  error,
  onDelete,
}: {
  trips: Trip[] | null;
  error: boolean;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation();
  if (error) return <ErrorState message={t('myTrips.error')} />;
  if (trips === null) return <LoadingState message={t('myTrips.loading')} />;
  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-6 relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/60 dark:to-indigo-900/40 border border-blue-200/60 dark:border-blue-800/50 flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-blue-400 dark:text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs shadow-md">0</div>
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t('myTrips.emptyTitle')}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mb-8">{t('myTrips.emptyDesc')}</p>
        <Link
          to="/create-trip"
          className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-[#4387f6] via-[#2563eb] to-[#1a4ecb] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(37,99,235,0.4),inset_0_1.5px_2px_rgba(255,255,255,0.7)] border-t border-white/60 transition-all hover:scale-[1.03] active:scale-95 overflow-hidden"
        >
          <span className="pointer-events-none absolute inset-x-3 top-0.5 h-[45%] rounded-full bg-gradient-to-b from-white/60 to-transparent" />
          <span className="relative z-10 flex items-center gap-1.5"><span>✨</span>{t('myTrips.emptyCta')}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => {
        const upcoming = new Date(trip.startDate) >= today;
        const n = nights(trip.startDate, trip.endDate);
        return (
          <article key={trip.id} className="group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
            {/* Top glow line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 dark:via-cyan-500/40 to-transparent" />

            <div className="relative p-5 pb-4">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blue-50/60 dark:from-blue-950/20 to-transparent rounded-t-3xl" />
              <div className="relative flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate tracking-tight">
                    {trip.destination}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {fmtDate(trip.startDate)} → {fmtDate(trip.endDate)} · {t('myTrips.days', { count: n })}
                  </p>
                </div>
                <span className={`shrink-0 ${statusBadge[trip.status]}`}>
                  {t(`status.${trip.status}`)}
                </span>
              </div>
            </div>

            <div className="px-5 pb-4 flex-1">
              <dl className="grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 px-3 py-2.5">
                  <dt className="uppercase tracking-widest text-[9px] font-bold text-slate-400">{t('myTrips.travelers')}</dt>
                  <dd className="mt-1 text-sm font-black text-slate-900 dark:text-white">{trip.travelers}</dd>
                </div>
                <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 px-3 py-2.5">
                  <dt className="uppercase tracking-widest text-[9px] font-bold text-slate-400">{t('myTrips.budget')}</dt>
                  <dd className="mt-1 text-sm font-black text-slate-900 dark:text-white">{formatBudgetLabel(trip.budget, t)}</dd>
                </div>
              </dl>

              {trip.preferences && (
                <p className="mt-3 line-clamp-2 text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                  &ldquo;{trip.preferences}&rdquo;
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100/80 dark:border-slate-700/50 px-5 py-3.5">
              <span className={upcoming
                ? 'inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400'
                : 'inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400'}>
                {upcoming ? t('myTrips.upcoming') : t('myTrips.past')}
              </span>
              <div className="flex gap-2">
                <Link
                  to={`/trips/${trip.id}`}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-sm shadow-blue-500/30"
                >
                  {t('myTrips.view')}
                </Link>
                <button
                  onClick={() => onDelete(trip.id)}
                  className="rounded-xl border border-rose-200/80 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 transition cursor-pointer"
                >
                  {t('myTrips.delete')}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}


function FavoritesTab({
  recs,
  error,
}: {
  recs: RecommendationSummary[] | null;
  error: boolean;
}) {
  const { t } = useTranslation();
  if (error) return <ErrorState message={t('favorites.error')} />;
  if (recs === null) return <LoadingState message={t('favorites.loading')} />;
  if (recs.length === 0) {
    return (
      <EmptyState
        title={t('favorites.emptyTitle')}
        description={t('favorites.emptyDesc')}
        action={
          <Link to="/recommendations" className="btn-primary mt-2">
            {t('favorites.emptyCta')}
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {recs.map((rec) => (
        <article key={rec.id} className="overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between hover:shadow-xl transition duration-300">
          <div>
            <div className="relative aspect-[16/11] overflow-hidden bg-slate-100 dark:bg-slate-800">
              {rec.image ? (
                <img
                  src={rec.image}
                  alt={rec.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-blue-50 text-4xl dark:bg-blue-900/30">
                  ✈️
                </div>
              )}
              <FavoriteButton recommendationId={rec.id} variant="inline" />
            </div>

            <div className="space-y-2.5 p-6">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  ★ {rec.rating.toFixed(1)}
                  <span className="font-normal text-amber-700/70 dark:text-amber-300/70">
                    ({rec.reviewCount})
                  </span>
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">📍 {rec.destination}</span>
              </div>
              <h3 className="font-outfit text-lg font-black text-slate-900 dark:text-white">
                {rec.title}
              </h3>
              <p className="line-clamp-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {rec.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 p-6 pt-4">
            <span className="font-outfit text-lg font-black text-blue-600 dark:text-cyan-300">
              {formatVND(rec.price)}
            </span>
            <Link
              to={`/recommendations/${rec.id}`}
              className="rounded-xl bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 px-4 py-2 text-xs font-bold text-blue-700 dark:text-cyan-300 hover:bg-blue-100 transition"
            >
              {t('myTrips.view')}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
