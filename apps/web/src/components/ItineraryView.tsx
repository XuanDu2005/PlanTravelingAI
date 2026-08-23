import { GeneratedItinerary, ItineraryActivity, ItineraryDay } from '@/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  content: GeneratedItinerary | null | undefined;
}

const CATEGORY_GRADIENT: Record<string, string> = {
  FOOD: 'from-amber-400 to-orange-500',
  SIGHTSEEING: 'from-sky-400 to-blue-500',
  CULTURE: 'from-purple-400 to-fuchsia-500',
  NATURE: 'from-emerald-400 to-green-500',
  SHOPPING: 'from-pink-400 to-rose-500',
  RELAX: 'from-cyan-400 to-teal-500',
  NIGHTLIFE: 'from-indigo-500 to-purple-600',
  TRANSPORT: 'from-slate-400 to-gray-500',
};

const CATEGORY_ICON: Record<string, string> = {
  FOOD: '🍜',
  SIGHTSEEING: '📸',
  CULTURE: '🏛️',
  NATURE: '🌿',
  SHOPPING: '🛍️',
  RELAX: '☕',
  NIGHTLIFE: '🌙',
  TRANSPORT: '🚗',
};

const CATEGORY_LABEL: Record<string, string> = {
  FOOD: 'Ẩm thực',
  SIGHTSEEING: 'Tham quan',
  CULTURE: 'Văn hóa',
  NATURE: 'Thiên nhiên',
  SHOPPING: 'Mua sắm',
  RELAX: 'Thư giãn',
  NIGHTLIFE: 'Về đêm',
  TRANSPORT: 'Di chuyển',
};

export default function ItineraryView({ content }: Props) {
  const { t } = useTranslation();
  const days: ItineraryDay[] = useMemo(() => {
    if (!content?.days) return [];
    return [...content.days].sort((a, b) => a.day - b.day);
  }, [content]);

  if (!content) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-ink-500 shadow-card dark:bg-surface-200 dark:text-slate-400 dark:shadow-cardDark">
        {t('itinerary.empty')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {content.coverImage && (
        <div className="overflow-hidden rounded-2xl shadow-card dark:shadow-cardDark">
          <img
            src={content.coverImage}
            alt={content.title}
            className="h-64 w-full object-cover sm:h-80"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="rounded-2xl bg-brand-50 px-6 py-5 dark:bg-brand-900/30">
        <h2 className="text-xl font-semibold text-brand-800 dark:text-brand-100">{content.title}</h2>
        {content.summary && (
          <p className="mt-1 text-sm text-brand-700 dark:text-brand-200">{content.summary}</p>
        )}
      </div>

      {days.map((day) => (
        <article key={day.day} className="rounded-2xl bg-white p-6 shadow-card transition-colors duration-200 dark:bg-surface-200 dark:shadow-cardDark">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink-900 dark:text-slate-100">
                {t('itinerary.dayLabel', { n: day.day })}
              </h3>
              <p className="text-xs text-ink-500 dark:text-slate-400">
                {day.date}
                {day.theme && (
                  <span className="ml-2 inline-flex rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-900/50 dark:text-brand-200">
                    {day.theme}
                  </span>
                )}
              </p>
            </div>
            <span className="badge">
              {t('itinerary.activities', { count: day.activities.length })}
            </span>
          </header>

          <ol className="space-y-4 border-l-2 border-brand-100 pl-6 dark:border-brand-900/40">
            {day.activities.map((activity, idx) => (
              <ActivityCard key={`${activity.time}-${idx}`} activity={activity} />
            ))}
          </ol>
        </article>
      ))}

      {content.tips && content.tips.length > 0 && (
        <section className="rounded-2xl bg-amber-50 p-6 shadow-card transition-colors duration-200 dark:bg-amber-900/20 dark:shadow-cardDark">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-amber-900 dark:text-amber-200">
            <span aria-hidden>💡</span>
            Mẹo hữu ích cho chuyến đi
          </h3>
          <ul className="space-y-2 text-sm text-amber-900 dark:text-amber-100">
            {content.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ActivityCard({ activity }: { activity: ItineraryActivity }) {
  const gradient =
    CATEGORY_GRADIENT[activity.category] ?? 'from-brand-400 to-brand-600';
  const icon = CATEGORY_ICON[activity.category] ?? '📍';
  const label = CATEGORY_LABEL[activity.category] ?? activity.category;

  return (
    <li className="relative">
      <span
        className={`absolute -left-[34px] top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-sm text-white shadow`}
      >
        {icon}
      </span>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white dark:border-surface-100 dark:bg-surface-100">
        {activity.imageUrl && (
          <img
            src={activity.imageUrl}
            alt={activity.title}
            className="h-44 w-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        )}

        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="flex-1">
              <span className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                {label}
              </span>
              <h4 className="mt-1 text-base font-semibold text-ink-900 dark:text-slate-100">
                {activity.title}
              </h4>
            </div>
            <span className="shrink-0 rounded-md bg-brand-500 px-2 py-1 text-xs font-semibold text-white">
              {activity.time}
            </span>
          </div>

          {activity.description && (
            <p className="mb-3 text-sm text-ink-600 dark:text-slate-300">{activity.description}</p>
          )}

          <div className="grid gap-2 text-xs text-ink-600 sm:grid-cols-3 dark:text-slate-300">
            {activity.location && (
              <div className="flex items-start gap-1.5">
                <span className="mt-0.5 text-brand-600 dark:text-brand-300" aria-hidden>
                  📍
                </span>
                <span className="line-clamp-2">{activity.location}</span>
              </div>
            )}
            {activity.transport && (
              <div className="flex items-start gap-1.5">
                <span className="mt-0.5 text-brand-600 dark:text-brand-300" aria-hidden>
                  🚗
                </span>
                <span>{activity.transport}</span>
              </div>
            )}
            {activity.estimatedCost && (
              <div className="flex items-start gap-1.5">
                <span className="mt-0.5 text-brand-600 dark:text-brand-300" aria-hidden>
                  💰
                </span>
                <span className="font-medium text-ink-900 dark:text-slate-100">
                  {activity.estimatedCost}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
