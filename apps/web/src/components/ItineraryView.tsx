import { GeneratedItinerary, ItineraryActivity, ItineraryDay } from '@/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  content: GeneratedItinerary | null | undefined;
  basePrice?: number;
}

const FALLBACK_COST: Record<string, number> = {
  FOOD: 180000,
  SIGHTSEEING: 150000,
  CULTURE: 150000,
  NATURE: 180000,
  SHOPPING: 300000,
  RELAX: 350000,
  NIGHTLIFE: 250000,
  TRANSPORT: 200000,
};

function activityCostAmount(activity: ItineraryActivity): number {
  const raw = activity.estimatedCost?.trim();
  if (raw && /miễn phí|free/i.test(raw)) return 0;
  if (raw) {
    const numeric = raw.match(/\d[\d.,]*/)?.[0]?.replace(/\D/g, '');
    if (numeric) return Number(numeric);
  }
  return FALLBACK_COST[activity.category] ?? FALLBACK_COST.SIGHTSEEING;
}

export default function ItineraryView({ content, basePrice }: Props) {
  const { t, i18n } = useTranslation();
  const days: ItineraryDay[] = useMemo(() => {
    if (!content?.days) return [];
    return [...content.days].sort((a, b) => a.day - b.day);
  }, [content]);
  const activityEstimate = useMemo(
    () => days.reduce(
      (total, day) => total + day.activities.reduce((dayTotal, activity) => dayTotal + activityCostAmount(activity), 0),
      0,
    ),
    [days],
  );
  const formatVnd = (amount: number) => new Intl.NumberFormat(
    i18n.language === 'en' ? 'en-US' : 'vi-VN',
    { style: 'currency', currency: 'VND', maximumFractionDigits: 0 },
  ).format(amount);

  if (!content) {
    return (
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/80 p-8 text-center text-sm text-slate-500 backdrop-blur-xl">
        {t('itinerary.empty')}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Summary highlight box */}
      {content.summary && (
        <div className="rounded-3xl border border-blue-100 dark:border-blue-900/40 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-cyan-50/70 dark:from-blue-950/40 dark:via-slate-900/40 dark:to-cyan-950/40 p-6 backdrop-blur-md">
          <h2 className="font-outfit text-lg font-bold text-slate-900 dark:text-white">
            {content.title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
            {content.summary}
          </p>
        </div>
      )}

      {/* Pricing overview */}
      <section className="grid gap-3 sm:grid-cols-2">
        {typeof basePrice === 'number' && basePrice > 0 && (
          <div className="flex items-center justify-between rounded-2xl border border-blue-200/70 bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-lg shadow-blue-500/20 dark:border-blue-500/30">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-100">{t('itinerary.packagePrice')}</p>
              <p className="mt-1 text-2xl font-black">{formatVnd(basePrice)}</p>
              <p className="mt-0.5 text-[11px] text-blue-100">{t('itinerary.perPerson')}</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-2xl backdrop-blur">₫</div>
          </div>
        )}
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200/70 bg-emerald-50/90 p-5 dark:border-emerald-800/60 dark:bg-emerald-950/30">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">{t('itinerary.activityEstimate')}</p>
            <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">{formatVnd(activityEstimate)}</p>
            <p className="mt-0.5 text-[11px] text-emerald-600/80 dark:text-emerald-400/80">{t('itinerary.estimateNote')}</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-2xl dark:bg-emerald-900/60">💳</div>
        </div>
      </section>

      {/* Days Loop */}
      {days.map((day) => (
        <article
          key={day.day}
          className="rounded-3xl border border-slate-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm transition-all duration-300"
        >
          {/* Day Header */}
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-outfit text-base font-black text-white shadow-md shadow-blue-500/25">
                {day.day}
              </div>
              <div>
                <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-white">
                  {t('itinerary.dayLabel', { n: day.day })}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {day.date}
                  {day.theme && (
                    <span className="ml-2 inline-flex rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-cyan-300">
                      {day.theme}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/70 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                {t('itinerary.dayEstimate')}: {formatVnd(day.activities.reduce((total, activity) => total + activityCostAmount(activity), 0))}
              </span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50">
                {t('itinerary.activities', { count: day.activities.length })}
              </span>
            </div>
          </header>

          {/* Activities List with clean timeline */}
          <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2 border-blue-100 dark:border-slate-700/60 ml-3">
            {day.activities.map((activity, idx) => (
              <ActivityCard
                key={`${activity.time}-${idx}`}
                activity={activity}
                index={idx + 1}
              />
            ))}
          </div>
        </article>
      ))}

      {/* Travel Tips Box */}
      {content.tips && content.tips.length > 0 && (
        <section className="rounded-3xl border border-amber-200/70 dark:border-amber-900/50 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-amber-50/70 dark:from-amber-950/30 dark:via-slate-900 dark:to-amber-950/20 p-6 sm:p-8 backdrop-blur-xl">
          <h3 className="mb-4 flex items-center gap-2 font-outfit text-base font-bold text-amber-900 dark:text-amber-200">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>Mẹo hữu ích cho chuyến đi</span>
          </h3>
          <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
            {content.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3 font-medium leading-relaxed">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ActivityCard({
  activity,
  index,
}: {
  activity: ItineraryActivity;
  index: number;
}) {
  const { t, i18n } = useTranslation();
  const hasDeclaredCost = Boolean(activity.estimatedCost?.trim());
  const estimatedCost = hasDeclaredCost
    ? activity.estimatedCost
    : `~${new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN').format(activityCostAmount(activity))} ₫/${t('itinerary.person')}`;

  // Google Maps Search URL
  const googleMapsUrl = activity.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`
    : null;

  return (
    <div className="relative group">
      {/* Clean Timeline dot */}
      <span className="absolute -left-[31px] sm:-left-[39px] top-4 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-800 border-2 border-blue-500 text-[10px] font-bold text-blue-600 dark:text-cyan-400 shadow-sm">
        {index}
      </span>

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-700/60 bg-white/95 dark:bg-slate-800/80 backdrop-blur-md shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row">
        {/* Category accent strip (no photo) */}
        <div className="relative h-2 md:h-auto md:w-2 shrink-0 bg-gradient-to-b from-blue-500 via-indigo-500 to-violet-500" aria-hidden="true" />

        {/* Content Details */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                {activity.title}
              </h4>
              <span className="hidden md:inline-flex shrink-0 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 px-3 py-1 text-xs font-bold text-blue-600 dark:text-cyan-400 shadow-xs">
                {activity.time}
              </span>
            </div>

            {activity.description && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {activity.description}
              </p>
            )}
          </div>

          {activity.suggestedPlaces && activity.suggestedPlaces.length > 0 && (
            <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50 to-orange-50/70 p-4 dark:border-amber-800/60 dark:from-amber-950/35 dark:to-orange-950/20">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-amber-900 dark:text-amber-200">🍜 {t('itinerary.famousRestaurants')}</p>
                  <p className="mt-0.5 text-[10px] text-amber-700/75 dark:text-amber-300/70">{t('itinerary.restaurantHint')}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-amber-700 shadow-sm dark:bg-slate-900/60 dark:text-amber-300">
                  {activity.suggestedPlaces.length} {t('itinerary.options')}
                </span>
              </div>
              <div className="grid gap-2 lg:grid-cols-3">
                {activity.suggestedPlaces.map((place) => {
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${place.address}`)}`;
                  return (
                    <a
                      key={`${place.name}-${place.address}`}
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/restaurant rounded-xl border border-amber-100 bg-white/90 p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md dark:border-amber-900/50 dark:bg-slate-900/75"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <strong className="text-xs font-black text-slate-900 group-hover/restaurant:text-amber-700 dark:text-white dark:group-hover/restaurant:text-amber-300">{place.name}</strong>
                        <span className="shrink-0 text-[10px] text-blue-600 dark:text-cyan-400">↗</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[10px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">📍 {place.address}</p>
                      <p className="mt-1 text-[10px] text-slate-600 dark:text-slate-300">{place.specialty}</p>
                      <p className="mt-2 font-bold text-[10px] text-emerald-700 dark:text-emerald-400">{place.priceRange}</p>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Activity Location & Transport & Cost */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
            {/* Google Maps Location Interactive Link */}
            {activity.location && (
              <a
                href={googleMapsUrl!}
                target="_blank"
                rel="noopener noreferrer"
                title="Mở vị trí và xem chỉ đường trên Google Maps"
                className="group/map inline-flex items-center gap-1.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 px-3 py-1.5 font-bold text-blue-700 dark:text-cyan-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5 text-rose-500 group-hover/map:text-white transition-colors shrink-0"
                  fill="currentColor"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="font-semibold">{activity.location}</span>
                <span className="text-[10px] opacity-75 group-hover/map:opacity-100">
                  🗺️ Google Maps ↗
                </span>
              </a>
            )}

            {/* Transport info */}
            {activity.transport && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 font-medium text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 11l2-5h10l2 5"/></svg>
                <span>{activity.transport}</span>
              </span>
            )}

            {/* Estimated cost */}
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              <span>{t('itinerary.estimatedCost')}: {estimatedCost}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
