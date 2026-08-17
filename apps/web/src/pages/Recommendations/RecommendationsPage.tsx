import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { recommendationService } from '@/services';
import { RecommendationSummary, RecCategory } from '@/types';
import { formatVND } from '@/utils/format';
import FavoriteButton from '@/components/FavoriteButton';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

const CATEGORY_FILTERS: Array<{ value: RecCategory | 'ALL'; labelKey: string }> = [
  { value: 'ALL', labelKey: 'discover.categoryAll' },
  { value: 'NATURE', labelKey: 'discover.categoryNature' },
  { value: 'CULTURE', labelKey: 'discover.categoryCulture' },
  { value: 'RESORT', labelKey: 'discover.categoryResort' },
  { value: 'ADVENTURE', labelKey: 'discover.categoryAdventure' },
  { value: 'BEACH', labelKey: 'discover.categoryBeach' },
];

const PAGE_SIZE = 6;

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

function categoryLabelKey(cat: RecCategory): string {
  return `discover.category${cat.charAt(0) + cat.slice(1).toLowerCase()}`;
}

export default function RecommendationsPage() {
  const { t } = useTranslation();
  const [recs, setRecs] = useState<RecommendationSummary[] | null>(null);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<RecCategory | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    recommendationService
      .list()
      .then(setRecs)
      .catch(() => setError(true));
  }, []);

  const filtered = useMemo(() => {
    if (!recs) return [];
    return recs.filter((r) => {
      if (activeCategory !== 'ALL' && r.category !== activeCategory) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const hay = `${r.title} ${r.destination} ${r.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [recs, activeCategory, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (error) return <ErrorState message={t('recs.error')} />;
  if (recs === null) return <LoadingState message={t('recs.loading')} />;

  return (
    <div className="space-y-8">
      <DiscoverHeader />

      <FilterBar
        query={query}
        onQuery={setQuery}
        active={activeCategory}
        onActive={setActiveCategory}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title={t('discover.emptyTitle')}
          description={t('discover.emptyDesc')}
        />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>

          <Pagination
            page={safePage}
            pageCount={pageCount}
            onChange={(p) => setPage(p)}
          />
        </>
      )}
    </div>
  );
}

function DiscoverHeader() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden rounded-3xl bg-white shadow-card transition-colors duration-200 dark:bg-surface-200 dark:shadow-cardDark">
      <div className="grid gap-6 px-6 py-10 sm:px-10 sm:py-14 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
            {t('discover.heroBadge')}
          </span>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-ink-900 dark:text-slate-100 sm:text-4xl">
            {t('discover.heroTitle')}
          </h1>
          <p className="mt-3 max-w-lg text-sm text-ink-500 dark:text-slate-400 sm:text-base">
            {t('discover.heroDesc')}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#discover-grid" className="btn-primary">
              {t('discover.heroCta')}
            </a>
            <Link to="/create-trip" className="btn-ghost">
              {t('discover.heroCtaSecondary')}
            </Link>
          </div>
        </div>
        <div className="relative hidden h-64 overflow-hidden rounded-3xl md:block">
          <img
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80"
            alt="Travel landscape"
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/30 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}

function FilterBar({
  query,
  onQuery,
  active,
  onActive,
}: {
  query: string;
  onQuery: (v: string) => void;
  active: RecCategory | 'ALL';
  onActive: (v: RecCategory | 'ALL') => void;
}) {
  const { t } = useTranslation();
  return (
    <section
      id="discover-grid"
      className="rounded-2xl bg-white p-4 shadow-card transition-colors duration-200 dark:bg-surface-200 dark:shadow-cardDark sm:p-5"
    >
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 dark:text-slate-500">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={t('discover.searchPlaceholder')}
          className="input pl-10"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onActive(f.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              active === f.value
                ? 'bg-brand-600 text-white shadow dark:bg-brand-500'
                : 'bg-ink-100/60 text-ink-700 hover:bg-ink-100 dark:bg-surface-100 dark:text-slate-200 dark:hover:bg-surface-100/80'
            }`}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>
    </section>
  );
}

function RecommendationCard({ rec }: { rec: RecommendationSummary }) {
  const { t } = useTranslation();

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
            {t(categoryLabelKey(rec.category))}
          </span>
        </div>
        <FavoriteButton recommendationId={rec.id} variant="overlay" />
        {rec.daysCount > 0 && (
          <div className="absolute right-3 bottom-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink-900 shadow dark:bg-surface-200/95 dark:text-slate-100">
              <span aria-hidden>🕒</span>
              {t('discover.daysShort', { count: rec.daysCount })}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            ★ {rec.rating.toFixed(1)}
            <span className="font-normal text-amber-700/70 dark:text-amber-300/70">
              ({rec.reviewCount})
            </span>
          </span>
          <span className="text-ink-500 dark:text-slate-400">{rec.destination}</span>
        </div>

        <h3 className="text-base font-semibold text-ink-900 group-hover:text-brand-700 dark:text-slate-100 dark:group-hover:text-brand-300">
          {rec.title}
        </h3>
        <p className="line-clamp-2 text-sm text-ink-500 dark:text-slate-400">{rec.description}</p>

        <div className="flex items-center justify-between border-t border-ink-100 pt-3 dark:border-surface-100">
          <div>
            <span className="text-lg font-bold text-brand-700 dark:text-brand-300">
              {formatVND(rec.price)}
            </span>
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

function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (p: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="btn-ghost !px-4 disabled:opacity-40"
      >
        ← {t('discover.prev')}
      </button>
      <span className="text-sm text-ink-500 dark:text-slate-400">
        {t('discover.page')} {page} / {pageCount}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page >= pageCount}
        className="btn-primary !px-4 disabled:opacity-40"
      >
        {t('discover.next')} →
      </button>
    </div>
  );
}