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
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 dark:text-slate-100">
            {t('myTrips.title')}
          </h1>
          <p className="text-sm text-ink-500 dark:text-slate-400">
            {tab === 'trips'
              ? t('myTrips.subtitle', { count: trips?.length ?? 0 })
              : t('favorites.subtitle', { count: favRecs?.length ?? 0 })}
          </p>
        </div>
        <Link to="/create-trip" className="btn-primary">
          {t('myTrips.newTrip')}
        </Link>
      </header>

      <div className="flex flex-wrap gap-1 rounded-full bg-slate-100 p-1 text-xs dark:bg-surface-100">
        <TabButton
          active={tab === 'trips'}
          onClick={() => setTab('trips')}
          label={t('myTrips.tabTrips')}
          icon="🧳"
        />
        <TabButton
          active={tab === 'favorites'}
          onClick={() => setTab('favorites')}
          label={t('myTrips.tabFavorites')}
          icon="♥"
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
  icon: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition ${
        active
          ? 'bg-white text-brand-700 shadow dark:bg-surface-200 dark:text-brand-300'
          : 'text-ink-600 hover:text-ink-900 dark:text-slate-400 dark:hover:text-slate-100'
      }`}
    >
      <span aria-hidden className={active && icon === '♥' ? 'text-rose-500' : ''}>
        {icon}
      </span>
      {label}
      {typeof count === 'number' && count > 0 && (
        <span
          className={`inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
            active
              ? 'bg-brand-600 text-white dark:bg-brand-500'
              : 'bg-slate-200 text-ink-700 dark:bg-surface-100 dark:text-slate-200'
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
      <EmptyState
        title={t('myTrips.emptyTitle')}
        description={t('myTrips.emptyDesc')}
        action={
          <Link to="/create-trip" className="btn-primary mt-2">
            {t('myTrips.emptyCta')}
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => {
        const upcoming = new Date(trip.startDate) >= today;
        const n = nights(trip.startDate, trip.endDate);
        return (
          <article key={trip.id} className="card flex flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-ink-900 dark:text-slate-100">
                  {trip.destination}
                </h3>
                <p className="text-xs text-ink-500 dark:text-slate-400">
                  {fmtDate(trip.startDate)} - {fmtDate(trip.endDate)} ·{' '}
                  {t('myTrips.days', { count: n })}
                </p>
              </div>
              <span className={statusBadge[trip.status]}>
                {t(`status.${trip.status}`)}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-ink-500 dark:text-slate-400">
              <div>
                <dt className="uppercase tracking-wide text-ink-300 dark:text-slate-500">
                  {t('myTrips.travelers')}
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink-700 dark:text-slate-200">
                  {trip.travelers}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wide text-ink-300 dark:text-slate-500">
                  {t('myTrips.budget')}
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink-700 dark:text-slate-200">
                  {formatBudgetLabel(trip.budget, t)}
                </dd>
              </div>
            </dl>

            {trip.preferences && (
              <p className="mt-3 line-clamp-2 text-xs text-ink-500 dark:text-slate-400">
                “{trip.preferences}”
              </p>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4 dark:border-surface-100">
              <span className={upcoming ? 'badge-success' : 'badge-muted'}>
                {upcoming ? t('myTrips.upcoming') : t('myTrips.past')}
              </span>
              <div className="flex gap-2">
                <Link to={`/trips/${trip.id}`} className="btn-soft">
                  {t('myTrips.view')}
                </Link>
                <button onClick={() => onDelete(trip.id)} className="btn-danger">
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recs.map((rec) => (
        <article key={rec.id} className="card flex flex-col overflow-hidden">
          <div className="relative aspect-[16/11] overflow-hidden bg-ink-100 dark:bg-surface-100">
            {rec.image ? (
              <img
                src={rec.image}
                alt={rec.title}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-brand-50 text-4xl dark:bg-brand-900/30">
                ✈️
              </div>
            )}
            <FavoriteButton recommendationId={rec.id} variant="inline" />
          </div>

          <div className="space-y-2 p-5">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                ★ {rec.rating.toFixed(1)}
                <span className="font-normal text-amber-700/70 dark:text-amber-300/70">
                  ({rec.reviewCount})
                </span>
              </span>
              <span className="text-ink-500 dark:text-slate-400">{rec.destination}</span>
            </div>
            <h3 className="text-base font-semibold text-ink-900 dark:text-slate-100">
              {rec.title}
            </h3>
            <p className="line-clamp-2 text-sm text-ink-500 dark:text-slate-400">
              {rec.description}
            </p>
            <div className="flex items-center justify-between border-t border-ink-100 pt-3 dark:border-surface-100">
              <span className="text-lg font-bold text-brand-700 dark:text-brand-300">
                {formatVND(rec.price)}
              </span>
              <Link to={`/recommendations/${rec.id}`} className="btn-soft">
                {t('myTrips.view')}
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
