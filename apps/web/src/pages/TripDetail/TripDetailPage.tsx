import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tripService } from '@/services';
import { Trip } from '@/types';
import { formatBudgetLabel } from '@/utils/format';
import ItineraryView from '@/components/ItineraryView';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

export default function TripDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setTrip(null);
    setError(false);
    tripService
      .byId(id)
      .then(setTrip)
      .catch(() => setError(true));
  }, [id]);

  if (error) return <ErrorState message={t('tripDetail.error')} />;
  if (!trip) return <LoadingState message={t('tripDetail.loading')} />;

  const days = trip.itinerary?.content?.days?.length ?? 0;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 shadow-sm transition-all duration-200 hover:-translate-x-0.5 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-surface-100 dark:bg-surface-200 dark:text-slate-100 dark:hover:border-brand-400 dark:hover:bg-brand-900/30 dark:hover:text-brand-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9.78 4.22a.75.75 0 0 1 0 1.06L6.56 8.5H16a.75.75 0 0 1 0 1.5H6.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
          {t('tripDetail.back').replace('← ', '')}
        </button>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="badge">{trip.destination}</span>
            <h1 className="mt-2 text-3xl font-semibold text-ink-900 dark:text-slate-100">
              {trip.itinerary?.title ??
                t('tripDetail.defaultTitle', { destination: trip.destination })}
            </h1>
            <p className="mt-1 text-sm text-ink-500 dark:text-slate-400">
              {formatRange(trip.startDate, trip.endDate)} ·{' '}
              {t('tripDetail.days', { count: days })} ·{' '}
              {t('tripDetail.travelers', { count: trip.travelers })}
            </p>
          </div>
          <Link to="/trips" className="btn-ghost">
            {t('tripDetail.allTrips')}
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('tripDetail.statDestination')}
          value={trip.destination}
        />
        <StatCard label={t('tripDetail.statBudget')} value={formatBudgetLabel(trip.budget, t)} />
        <StatCard
          label={t('tripDetail.statTravelers')}
          value={`${trip.travelers}`}
        />
        <StatCard
          label={t('tripDetail.statStatus')}
          value={t(`status.${trip.status}`)}
          hint={
            days
              ? t('tripDetail.itineraryDays', { count: days })
              : t('tripDetail.itineraryDraft')
          }
        />
      </section>

      {trip.preferences && (
        <section className="card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500 dark:text-slate-400">
            {t('tripDetail.preferences')}
          </h2>
          <p className="mt-2 text-sm text-ink-700 dark:text-slate-200">{trip.preferences}</p>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-semibold text-ink-900 dark:text-slate-100">
          {t('tripDetail.itineraryTitle')}
        </h2>
        <ItineraryView content={trip.itinerary?.content ?? null} />
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wide text-ink-300 dark:text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-ink-900 dark:text-slate-100">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

function formatRange(start: string, end: string) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  return `${fmt(start)} - ${fmt(end)}`;
}
