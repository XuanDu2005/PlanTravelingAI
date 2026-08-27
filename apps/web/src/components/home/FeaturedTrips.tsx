import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { recommendationService } from '@/services';
import type { RecCategory, RecommendationSummary } from '@/types';
import TripCard, { type TripCardData } from './TripCard';

type HomeCategory = 'all' | 'bien' | 'thanh-pho' | 'nui-rung' | 'nghi-duong';
type SortMode = 'popular' | 'rating' | 'price';
type ViewMode = 'grid' | 'list';

const PAGE_SIZE = 7;
const CATEGORIES: Array<{ key: HomeCategory; labelKey: string; icon: ReactNode }> = [
  { key: 'all', labelKey: 'home.featuredTabPopular', icon: <span>●</span> },
  { key: 'bien', labelKey: 'home.featuredTabBeach', icon: <span>≋</span> },
  { key: 'thanh-pho', labelKey: 'home.featuredTabCity', icon: <span>▦</span> },
  { key: 'nui-rung', labelKey: 'home.featuredTabMountain', icon: <span>△</span> },
  { key: 'nghi-duong', labelKey: 'home.featuredTabResort', icon: <span>♧</span> },
];

function toHomeCategory(category: RecCategory): Exclude<HomeCategory, 'all'> {
  if (category === 'BEACH') return 'bien';
  if (category === 'CULTURE') return 'thanh-pho';
  if (category === 'RESORT') return 'nghi-duong';
  return 'nui-rung';
}

export default function FeaturedTrips() {
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState<RecommendationSummary[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<HomeCategory>('all');
  const [sortBy, setSortBy] = useState<SortMode>('popular');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);
    recommendationService.list()
      .then((items) => {
        if (mounted) setRecommendations(items.filter((item) => item.isPublished !== false));
      })
      .catch(() => {
        if (mounted) setError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [reloadKey]);

  const filteredTrips = useMemo(() => {
    const items = recommendations.filter(
      (item) => selectedCategory === 'all' || toHomeCategory(item.category) === selectedCategory,
    );
    return [...items].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating || b.reviewCount - a.reviewCount;
      if (sortBy === 'price') return a.price - b.price;
      return b.reviewCount - a.reviewCount || b.rating - a.rating;
    });
  }, [recommendations, selectedCategory, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filteredTrips.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageTrips = filteredTrips.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const spotlight = pageTrips[0];
  const secondaryTrips = pageTrips.slice(1);

  const asCard = (trip: RecommendationSummary): TripCardData => ({
    id: trip.id,
    title: trip.title,
    destination: trip.destination,
    duration: t('home.featuredDuration', {
      days: trip.daysCount,
      nights: Math.max(0, trip.daysCount - 1),
    }),
    rating: trip.rating,
    reviewsCount: trip.reviewCount,
    tag: trip.reviewCount >= 200 ? 'popular' : 'suggested',
    imageUrl: trip.image,
    price: trip.price,
  });

  const selectCategory = (category: HomeCategory) => {
    setSelectedCategory(category);
    setPage(0);
  };

  return (
    <section
      id="featured-trips"
      className="relative flex min-h-screen w-full snap-start snap-always flex-col overflow-hidden bg-slate-50 px-4 pb-4 pt-7 dark:bg-slate-950 sm:px-8 md:pr-16 lg:h-screen lg:max-h-screen lg:pr-20"
    >
      <div className="pointer-events-none absolute -left-28 top-28 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl" />

      <header className="relative mb-4 flex items-center justify-between gap-4">
        <h2 className="font-outfit text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          {t('home.featuredTitle')}
        </h2>
        <Link
          to="/recommendations"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-blue-200 bg-blue-50/70 px-4 py-2 text-xs font-extrabold text-blue-600 transition-all hover:-translate-y-0.5 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/50 dark:text-cyan-400"
        >
          {t('home.featuredAll')} <span>→</span>
        </Link>
      </header>

      <div className="relative mb-5 flex flex-col justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 sm:flex-row sm:items-center sm:rounded-full">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category.key;
            return (
              <button
                key={category.key}
                type="button"
                onClick={() => selectCategory(category.key)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold transition-all duration-300 ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <span className={`text-sm ${category.key === 'all' ? 'text-current' : ''}`}>{category.icon}</span>
                {t(category.labelKey)}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
          <label className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-2 text-xs text-slate-400 dark:bg-slate-800">
            <span>{t('home.featuredSort')}:</span>
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value as SortMode);
                setPage(0);
              }}
              className="cursor-pointer bg-transparent font-extrabold text-slate-800 outline-none dark:text-white"
            >
              <option value="popular">{t('home.featuredSortPopular')}</option>
              <option value="rating">{t('home.featuredSortRating')}</option>
              <option value="price">{t('home.featuredSortPrice')}</option>
            </select>
          </label>

          <div className="flex rounded-full bg-slate-100 p-1 dark:bg-slate-800">
            <ViewButton active={viewMode === 'grid'} label={t('home.featuredGridView')} onClick={() => setViewMode('grid')}>
              <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
            </ViewButton>
            <ViewButton active={viewMode === 'list'} label={t('home.featuredListView')} onClick={() => setViewMode('list')}>
              <path d="M8 5h12v3H8zM8 11h12v3H8zM8 17h12v3H8zM3 5h3v3H3zM3 11h3v3H3zM3 17h3v3H3z" />
            </ViewButton>
          </div>
        </div>
      </div>

      <div className="relative flex min-h-[430px] flex-1 lg:min-h-0">
        {loading ? (
          <LoadingLayout />
        ) : error ? (
          <StatusPanel icon="☁️" title={t('home.errorRecs')}>
            <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700">
              {t('home.featuredRetry')}
            </button>
          </StatusPanel>
        ) : !spotlight ? (
          <StatusPanel icon="🧭" title={t('home.emptyRecsTitle')}>
            <p className="mt-1 text-sm text-slate-500">{t('home.emptyRecsDesc')}</p>
          </StatusPanel>
        ) : viewMode === 'grid' ? (
          <div key={`${selectedCategory}-${sortBy}-${currentPage}`} className="grid w-full grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="featured-trip-enter min-h-[430px] lg:col-span-5 lg:min-h-0">
              <TripCard trip={asCard(spotlight)} variant="spotlight" />
            </div>
            <div className={`lg:col-span-7 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 ${secondaryTrips.length > 3 ? 'lg:grid-rows-2' : 'lg:grid-rows-1'}`}>
              {secondaryTrips.map((trip, index) => (
                <div key={trip.id} className="featured-trip-enter min-h-[205px] lg:min-h-0" style={{ animationDelay: `${(index + 1) * 65}ms` }}>
                  <TripCard trip={asCard(trip)} variant="compact" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div key={`${selectedCategory}-${sortBy}-${currentPage}-list`} className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageTrips.map((trip, index) => (
              <div key={trip.id} className="featured-trip-enter min-h-[220px]" style={{ animationDelay: `${index * 65}ms` }}>
                <TripCard trip={asCard(trip)} variant="compact" />
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && !error && filteredTrips.length > 0 && (
        <nav className="relative z-30 mx-auto mb-1 mt-3 flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white/95 px-5 shadow-[0_6px_20px_rgba(15,23,42,0.10)] backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95" aria-label={t('home.featuredPagination')}>
          {Array.from({ length: pageCount }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPage(index)}
              aria-label={t('home.featuredPage', { page: index + 1 })}
              aria-current={currentPage === index ? 'page' : undefined}
              className={`group grid h-7 place-items-center rounded-full transition-all duration-300 ${currentPage === index ? 'w-9' : 'w-5'}`}
            >
              <span className={`block h-1.5 rounded-full transition-all duration-300 ${currentPage === index ? 'w-7 bg-blue-600 shadow-sm shadow-blue-500/40' : 'w-1.5 bg-slate-300 group-hover:bg-blue-300 dark:bg-slate-700'}`} />
            </button>
          ))}
        </nav>
      )}
    </section>
  );
}

function ViewButton({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} aria-pressed={active} className={`grid h-8 w-8 place-items-center rounded-full transition ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-blue-600'}`}>
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">{children}</svg>
    </button>
  );
}

function LoadingLayout() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="min-h-[430px] animate-pulse rounded-[28px] bg-slate-200 dark:bg-slate-800 lg:col-span-5 lg:min-h-0" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:col-span-7 lg:grid-rows-2">
        {Array.from({ length: 6 }).map((_, index) => <div key={index} className="min-h-[205px] animate-pulse rounded-[20px] bg-slate-200 dark:bg-slate-800 lg:min-h-0" />)}
      </div>
    </div>
  );
}

function StatusPanel({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return (
    <div className="grid w-full place-items-center rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-slate-700 dark:bg-slate-900/60">
      <div><div className="mb-3 text-4xl">{icon}</div><h3 className="font-black text-slate-900 dark:text-white">{title}</h3>{children}</div>
    </div>
  );
}
