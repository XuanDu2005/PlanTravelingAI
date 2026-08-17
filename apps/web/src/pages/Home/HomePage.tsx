import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { heroService, recommendationService } from '@/services';
import { Recommendation, RecCategory } from '@/types';
import { formatVND } from '@/utils/format';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import HeroSlideshow, { Slide } from '@/components/HeroSlideshow';

const STYLES: Array<{
  key: 'nature' | 'culture' | 'resort';
  category: RecCategory;
  icon: string;
  iconBg: string;
}> = [
  {
    key: 'nature',
    category: 'NATURE',
    icon: '🌿',
    iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  {
    key: 'culture',
    category: 'CULTURE',
    icon: '🏛️',
    iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  {
    key: 'resort',
    category: 'RESORT',
    icon: '🏝️',
    iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  },
];

function categoryBadgeClasses(cat: RecCategory): string {
  switch (cat) {
    case 'NATURE':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'CULTURE':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    case 'RESORT':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
    case 'ADVENTURE':
      return 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300';
    case 'BEACH':
      return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300';
    default:
      return 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200';
  }
}

export default function HomePage() {
  const { t } = useTranslation();
  const [recs, setRecs] = useState<Recommendation[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    recommendationService
      .list()
      .then(async (summaries) => {
        const top = summaries.slice(0, 3);
        const detailed = await Promise.all(
          top.map((s) =>
            recommendationService.byId(s.id).catch(() => null),
          ),
        );
        if (!cancelled) {
          // Fall back to summary if detail fetch failed
          setRecs(
            detailed.map((d, i) => (d ? { ...summaries[i], ...d } : { ...summaries[i], content: null })) as Recommendation[],
          );
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-20">
      <Hero />

      <section>
        <SectionHeader
          title={t('home.stylesTitle')}
          subtitle={t('home.stylesSubtitle')}
          right={
            <Link to="/recommendations" className="text-sm font-semibold text-brand-700 hover:underline">
              {t('home.stylesAll')} →
            </Link>
          }
        />
        <div className="grid gap-5 md:grid-cols-3">
          {STYLES.map((s) => (
            <Link
              key={s.key}
              to={`/recommendations`}
              className="card group flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span
                className={`grid h-14 w-14 place-items-center rounded-full text-2xl ${s.iconBg}`}
              >
                {s.icon}
              </span>
              <div>
                <h3 className="text-base font-semibold text-ink-900 dark:text-slate-100">
                  {t(`home.style${s.key.charAt(0).toUpperCase() + s.key.slice(1)}Title`)}
                </h3>
                <p className="mt-0.5 text-xs text-ink-500 dark:text-slate-400">
                  {t(`home.style${s.key.charAt(0).toUpperCase() + s.key.slice(1)}Desc`)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title={t('home.featuredTitle')}
          subtitle={t('home.featuredSubtitle')}
          right={
            <Link to="/recommendations" className="text-sm font-semibold text-brand-700 hover:underline">
              {t('home.featuredAll')} →
            </Link>
          }
        />
        {error ? (
          <ErrorState message={t('home.errorRecs')} />
        ) : recs === null ? (
          <LoadingState message={t('home.loadingRecs')} />
        ) : recs.length === 0 ? (
          <EmptyState
            title={t('home.emptyRecsTitle')}
            description={t('home.emptyRecsDesc')}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recs.slice(0, 3).map((rec) => (
              <FeaturedCard key={rec.id} rec={rec} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Hero() {
  const { t } = useTranslation();
  const [slides, setSlides] = useState<Slide[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    heroService
      .listActiveSlides()
      .then((rows) => {
        if (!cancelled) setSlides(rows.map((r) => ({ src: r.imageUrl })));
      })
      .catch(() => {
        if (!cancelled) setSlides([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="grid items-center gap-10 rounded-3xl bg-white px-6 py-12 shadow-card transition-colors duration-200 dark:bg-surface-200 dark:shadow-cardDark sm:px-10 sm:py-16 md:grid-cols-[1.1fr_1fr]">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
          {t('home.heroBadge')}
        </span>
        <h1 className="mt-5 text-4xl font-semibold leading-tight text-ink-900 dark:text-slate-100 sm:text-5xl">
          {t('home.heroTitle1')}
          <br />
          <span className="text-brand-700 dark:text-brand-300">{t('home.heroTitle2')}</span>
        </h1>
        <p className="mt-4 max-w-lg text-base text-ink-500 dark:text-slate-400 sm:text-lg">
          {t('home.heroDesc')}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/recommendations" className="btn-primary">
            {t('home.ctaPrimary')}
          </Link>
          <Link to="/create-trip" className="btn-ghost">
            {t('home.ctaSecondary')}
          </Link>
        </div>
      </div>
      {slides && slides.length > 0 && (
        <HeroSlideshow slides={slides} interval={2000} caption={t('home.slideCaption')} />
      )}
    </section>
  );
}

function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-ink-900 dark:text-slate-100 sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 max-w-xl text-sm text-ink-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}

function FeaturedCard({ rec }: { rec: Recommendation }) {
  const { t } = useTranslation();
  const itineraryDays = rec.content?.days ?? [];
  const previewDays = itineraryDays.slice(0, 2);

  return (
    <article className="card group overflow-hidden">
      <div className="relative aspect-[16/11] overflow-hidden bg-ink-100 dark:bg-surface-100">
        {rec.image ? (
          <img
            src={rec.image}
            alt={rec.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-brand-50 text-4xl dark:bg-brand-900/30">
            ✈️
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${categoryBadgeClasses(rec.category)}`}
          >
            {t(`discover.category${rec.category.charAt(0) + rec.category.slice(1).toLowerCase()}`)}
          </span>
        </div>
        {rec.daysCount > 0 && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink-700 shadow dark:bg-surface-200/95 dark:text-slate-100">
              🗓 {rec.daysCount} {t('discover.daysShort', { count: rec.daysCount })}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            ★ {rec.rating.toFixed(1)}
            <span className="font-normal text-amber-700/70 dark:text-amber-300/70">({rec.reviewCount})</span>
          </span>
          <span className="text-ink-500 dark:text-slate-400">{rec.destination}</span>
        </div>

        <h3 className="text-base font-semibold text-ink-900 group-hover:text-brand-700 dark:text-slate-100 dark:group-hover:text-brand-300">
          {rec.title}
        </h3>
        <p className="line-clamp-2 text-sm text-ink-500 dark:text-slate-400">{rec.description}</p>

        {previewDays.length > 0 && (
          <div className="space-y-2 rounded-lg bg-ink-50 p-3 text-xs dark:bg-surface-100">
            {previewDays.map((d) => (
              <div key={d.day}>
                <p className="font-semibold text-brand-700 dark:text-brand-300">Ngày {d.day}</p>
                <ul className="mt-1 space-y-0.5 text-ink-600 dark:text-slate-300">
                  {d.activities.slice(0, 2).map((a, idx) => (
                    <li key={idx} className="flex gap-1.5">
                      <span className="font-medium text-ink-700 dark:text-slate-100">{a.time}</span>
                      <span className="line-clamp-1">{a.title}</span>
                    </li>
                  ))}
                  {d.activities.length > 2 && (
                    <li className="text-ink-400 italic dark:text-slate-500">+{d.activities.length - 2} hoạt động</li>
                  )}
                </ul>
              </div>
            ))}
            {itineraryDays.length > previewDays.length && (
              <p className="pt-1 text-[11px] text-ink-400 dark:text-slate-500">
                + {itineraryDays.length - previewDays.length} ngày nữa...
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-ink-100 pt-3 dark:border-surface-100">
          <div>
            <span className="text-lg font-bold text-brand-700 dark:text-brand-300">{formatVND(rec.price)}</span>
            <span className="text-xs text-ink-500 dark:text-slate-400"> {t('discover.perPerson')}</span>
          </div>
          <Link
            to={`/recommendations/${rec.id}`}
            className="btn-view-detail"
          >
            {t('discover.viewDetail')}
            <svg
              className="arrow h-3.5 w-3.5"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M4 10h12m0 0l-5-5m5 5l-5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}