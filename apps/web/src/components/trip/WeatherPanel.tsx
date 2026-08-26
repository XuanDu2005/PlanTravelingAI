import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { weatherService } from '@/services';
import type {
  Trip,
  WeatherDayAdvice,
  WeatherDayForecast,
  WeatherForecastResponse,
} from '@/types';

interface WeatherPanelProps {
  trip: Trip;
}

const LEVEL_STYLES: Record<
  WeatherDayAdvice['level'],
  { bg: string; text: string; border: string; dot: string }
> = {
  INFO: {
    bg: 'bg-sky-50 dark:bg-sky-500/10',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200/70 dark:border-sky-700/40',
    dot: 'bg-sky-500',
  },
  CAUTION: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200/70 dark:border-amber-700/40',
    dot: 'bg-amber-500',
  },
  WARNING: {
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200/70 dark:border-rose-700/40',
    dot: 'bg-rose-500',
  },
};

function formatTime(iso: string): string {
  if (!iso) return '--:--';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--:--';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatWeekday(date: string, locale: string): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

export default function WeatherPanel({ trip }: WeatherPanelProps) {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<WeatherForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itineraryDays = useMemo(() => {
    const days = trip.itinerary?.content?.days;
    if (!Array.isArray(days)) return undefined;
    return days.map((d) => ({
      day: d.day,
      date: d.date,
      theme: d.theme,
    }));
  }, [trip.itinerary?.content?.days]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    weatherService
      .forecast({
        destination: trip.destination,
        startDate: trip.startDate.slice(0, 10),
        endDate: trip.endDate.slice(0, 10),
        itineraryDays,
      })
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const message =
            err?.response?.data?.message ?? err?.message ?? t('workspace.weather.error');
          setError(message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [trip.destination, trip.startDate, trip.endDate, itineraryDays, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-slate-200/80 bg-white p-12 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
        <span className="grid h-8 w-8 animate-spin place-items-center rounded-full border-2 border-sky-400 border-t-transparent" />
        <span>{t('workspace.weather.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-700/40 dark:bg-rose-500/10 dark:text-rose-300">
        <strong className="font-bold">{t('workspace.weather.errorTitle')}</strong>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  if (!data || data.days.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
        {t('workspace.weather.noData')}
      </div>
    );
  }

  const { resolvedLocation, days, itineraryAlignment } = data;
  const alignmentByDate = new Map(
    (itineraryAlignment ?? []).map((a) => [a.date, a]),
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="overflow-hidden rounded-3xl border border-sky-200/60 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5 dark:border-sky-700/40 dark:from-sky-500/10 dark:via-slate-900 dark:to-cyan-500/5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-300">
              <span aria-hidden>🌤️</span>
              <span>{t('workspace.weather.forecastTitle')}</span>
            </div>
            <h3 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
              {resolvedLocation.name}
              {resolvedLocation.admin1 ? `, ${resolvedLocation.admin1}` : ''}
              {resolvedLocation.country ? ` · ${resolvedLocation.country}` : ''}
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {t('workspace.weather.forecastDescription')}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="rounded-full bg-white/80 px-3 py-1 font-bold text-slate-700 shadow-sm dark:bg-slate-800/80 dark:text-slate-200">
              {new Date(data.fetchedAt).toLocaleString(
                i18n.language === 'en' ? 'en-US' : 'vi-VN',
              )}
            </span>
            <span>{t('workspace.weather.coordinates', { lat: resolvedLocation.latitude.toFixed(2), lon: resolvedLocation.longitude.toFixed(2) })}</span>
          </div>
        </div>
      </div>

      {/* Forecast cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {days.map((day) => (
          <ForecastCard
            key={day.date}
            day={day}
            weekday={formatWeekday(day.date, i18n.language)}
            alignment={alignmentByDate.get(day.date)}
          />
        ))}
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500">
        {t('workspace.weather.attribution')}
      </p>
    </div>
  );
}

interface ForecastCardProps {
  day: WeatherDayForecast;
  weekday: string;
  alignment?: { day: number; theme: string };
}

function ForecastCard({ day, weekday, alignment }: ForecastCardProps) {
  const { t } = useTranslation();
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/70 dark:bg-slate-900">
      <header className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {alignment ? `${t('workspace.weather.dayLabel')} ${alignment.day}` : weekday.split(' ')[0]}
          </div>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white">{weekday}</div>
        </div>
        <span aria-hidden className="text-3xl drop-shadow-sm">
          {day.weatherEmoji}
        </span>
      </header>

      {alignment?.theme && (
        <p className="mt-1 truncate text-[11px] font-medium italic text-slate-500 dark:text-slate-400">
          {alignment.theme}
        </p>
      )}

      <div className="mt-3 flex items-end gap-2">
        <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">
          {day.temperatureMax}°
        </span>
        <span className="mb-1 text-sm tabular-nums text-slate-400">/ {day.temperatureMin}°</span>
      </div>
      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        {day.weatherLabel}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
        <Stat icon="💧" label={t('workspace.weather.rain')} value={`${day.precipitationSum} mm`} />
        <Stat icon="🧴" label={t('workspace.weather.uv')} value={`${day.uvIndexMax}`} />
        <Stat icon="💨" label={t('workspace.weather.wind')} value={`${day.windSpeedMax} km/h`} />
        <Stat
          icon="🌅"
          label={t('workspace.weather.sun')}
          value={`${formatTime(day.sunrise)} – ${formatTime(day.sunset)}`}
        />
      </dl>

      <ul className="mt-3 space-y-1.5">
        {day.advice.map((advice, idx) => {
          const style = LEVEL_STYLES[advice.level];
          return (
            <li
              key={`${day.date}-${idx}`}
              className={`flex items-start gap-2 rounded-xl border px-2.5 py-1.5 text-[11px] leading-4 ${style.bg} ${style.text} ${style.border}`}
            >
              <span
                aria-hidden
                className={`mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`}
              />
              <span>
                <span aria-hidden className="mr-1">{advice.icon}</span>
                {advice.text}
              </span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/60">
      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        <span aria-hidden>{icon}</span>
        <span>{label}</span>
      </span>
      <span className="mt-0.5 truncate text-[11px] font-bold tabular-nums text-slate-700 dark:text-slate-100">
        {value}
      </span>
    </div>
  );
}