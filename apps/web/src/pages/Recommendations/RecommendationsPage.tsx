import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { recommendationService } from '@/services';
import { RecommendationSummary, RecCategory } from '@/types';
import { formatVND } from '@/utils/format';
import FavoriteButton from '@/components/FavoriteButton';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

const CATEGORY_FILTERS: Array<{
  value: RecCategory | 'ALL';
  labelKey: string;
  icon: React.ReactNode;
}> = [
  {
    value: 'ALL',
    labelKey: 'discover.categoryAll',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    value: 'NATURE',
    labelKey: 'discover.categoryNature',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    ),
  },
  {
    value: 'CULTURE',
    labelKey: 'discover.categoryCulture',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="21" x2="21" y2="21" />
        <line x1="6" y1="18" x2="6" y2="9" />
        <line x1="10" y1="18" x2="10" y2="9" />
        <line x1="14" y1="18" x2="14" y2="9" />
        <line x1="18" y1="18" x2="18" y2="9" />
        <polygon points="12 2 20 7 4 7" />
      </svg>
    ),
  },
  {
    value: 'RESORT',
    labelKey: 'discover.categoryResort',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22v-9" />
        <path d="M12 13a7 7 0 0 0-7-7c0 4 3 7 7 7z" />
        <path d="M12 13a7 7 0 0 1 7-7c0 4-3 7-7 7z" />
      </svg>
    ),
  },
  {
    value: 'ADVENTURE',
    labelKey: 'discover.categoryAdventure',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
      </svg>
    ),
  },
  {
    value: 'BEACH',
    labelKey: 'discover.categoryBeach',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12c3-2.5 6 2.5 9 0s6-2.5 9 0 6 2.5 9 0" />
        <path d="M2 17c3-2.5 6 2.5 9 0s6-2.5 9 0 6 2.5 9 0" />
      </svg>
    ),
  },
];

const PAGE_SIZE = 6;

function recommendationAudience(rec: RecommendationSummary) {
  if (rec.category === 'RESORT') return { min: 2, max: 6 };
  if (rec.category === 'ADVENTURE') return { min: 2, max: 8 };
  if (rec.category === 'BEACH') return { min: 2, max: 12 };
  return { min: 1, max: 10 };
}

function categoryBadgeClasses(cat: RecCategory): string {
  switch (cat) {
    case 'NATURE':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60';
    case 'CULTURE':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60';
    case 'RESORT':
      return 'bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60';
    case 'ADVENTURE':
      return 'bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60';
    case 'BEACH':
      return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60';
    default:
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60';
  }
}

export default function RecommendationsPage() {
  const { t } = useTranslation();
  const [recs, setRecs] = useState<RecommendationSummary[] | null>(null);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<RecCategory | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('ALL');
  const [guestCount, setGuestCount] = useState('ALL');
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
      if (selectedDuration === '1-3' && (r.daysCount < 1 || r.daysCount > 3)) return false;
      if (selectedDuration === '4-7' && (r.daysCount < 4 || r.daysCount > 7)) return false;
      if (selectedDuration === '7+' && r.daysCount <= 7) return false;
      if (guestCount !== 'ALL') {
        const guests = guestCount === 'group' ? 6 : Number(guestCount);
        const audience = recommendationAudience(r);
        if (guests < audience.min || guests > audience.max) return false;
      }
      return true;
    });
  }, [recs, activeCategory, query, selectedDuration, guestCount]);

  useEffect(() => setPage(1), [activeCategory, query, selectedDuration, guestCount]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (error) return <ErrorState message={t('recs.error')} />;
  if (recs === null) return <LoadingState message={t('recs.loading')} />;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 pt-28 sm:pt-32 pb-12 space-y-8">

      {/* 1. Ultra-Premium Hero Banner Card (Chuẩn 100% Ảnh mẫu) */}
      <DiscoverHeroBanner />

      {/* 2. Search Box with 4 inputs & Category Pills Filter */}
      <FilterBar
        query={query}
        onQuery={setQuery}
        active={activeCategory}
        onActive={setActiveCategory}
        duration={selectedDuration}
        onDuration={setSelectedDuration}
        guests={guestCount}
        onGuests={setGuestCount}
      />

      {/* 3. Results Grid or Custom Empty State matching reference */}
      {filtered.length === 0 ? (
        <div className="my-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-12 text-center shadow-xs backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 mb-4 shadow-sm">
            {/* Luggage icon with sparkles */}
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="7" width="12" height="14" rx="2" />
              <path d="M10 7V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="12" x2="10" y2="16" />
              <line x1="14" y1="12" x2="14" y2="16" />
              <circle cx="18" cy="4" r="1" fill="currentColor" />
              <circle cx="4" cy="18" r="1" fill="currentColor" />
            </svg>
          </div>
          <h3 className="font-outfit text-xl font-bold text-slate-900 dark:text-white">
            {t('discover.emptyTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            {t('discover.emptyDesc')}
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {t('discover.resultsFound', { count: filtered.length })}
            </p>
            {(activeCategory !== 'ALL' || query || selectedDuration !== 'ALL' || guestCount !== 'ALL') && (
              <button
                type="button"
                onClick={() => { setActiveCategory('ALL'); setQuery(''); setSelectedDuration('ALL'); setGuestCount('ALL'); }}
                className="text-xs font-bold text-blue-600 hover:underline dark:text-cyan-400"
              >
                {t('discover.clearFilters')}
              </button>
            )}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>

          {pageCount > 1 && (
            <Pagination
              page={safePage}
              pageCount={pageCount}
              onChange={(p) => setPage(p)}
            />
          )}
        </>
      )}
    </div>
  );
}

{/* ========================================================================= */}
{/* ✈️ DISCOVER HERO BANNER (CHUẨN 100% THEO ẢNH MẪU) */}
{/* ========================================================================= */}
function DiscoverHeroBanner() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] border border-blue-100 dark:border-slate-800 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-sky-50/60 dark:from-[#0B1528] dark:via-[#09101F] dark:to-[#070B16] shadow-xl p-6 sm:p-10 lg:p-12">

      {/* Ambient background glow */}
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-blue-400/10 dark:bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-indigo-400/10 dark:bg-indigo-600/15 blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

        {/* Left Column: Heading, Subtitle & Action Buttons (Spans 6 cols) */}
        <div className="lg:col-span-6 space-y-5 text-left">

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 dark:bg-blue-900/40 border border-blue-200/80 dark:border-blue-700/60 px-3.5 py-1 text-xs font-bold text-blue-700 dark:text-cyan-300 shadow-xs">
            <span>{t('discover.heroBadge')}</span>
          </div>

          {/* Title */}
          <div>
            <h1 className="font-outfit text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 dark:text-white tracking-tight leading-[1.2]">
              {t('discover.heroTitle')} <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300 bg-clip-text text-transparent">
                {t('discover.heroHighlight')}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3 max-w-lg font-medium">
              {t('discover.heroDesc')}
            </p>
          </div>

          {/* 2 Liquid Glass CTA Buttons (Style đồng bộ trang chủ) */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            {/* Primary Liquid Glass Button */}
            <a
              href="#discover-filters"
              className="group relative inline-flex items-center justify-between gap-5 rounded-full bg-gradient-to-b from-[#4387f6] via-[#2563eb] to-[#1a4ecb] pl-6 pr-2.5 py-2 text-white border border-white/60 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.75),inset_0_-2.5px_4px_rgba(15,23,42,0.35),0_10px_24px_-4px_rgba(37,99,235,0.38)] backdrop-blur-2xl transition-all duration-300 hover:scale-105 hover:shadow-[inset_0_2px_3px_rgba(255,255,255,0.9),inset_0_-3px_5px_rgba(15,23,42,0.4),0_14px_30px_-4px_rgba(37,99,235,0.5)] active:scale-95 cursor-pointer overflow-hidden"
            >
              {/* Lớp phản quang vòm kính bong bóng phía trên */}
              <span className="pointer-events-none absolute inset-x-2 top-0.5 h-[45%] rounded-full bg-gradient-to-b from-white/55 via-white/15 to-transparent blur-[0.4px]" />
              
              <span className="font-outfit font-black text-sm tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                {t('discover.heroCta')}
              </span>

              {/* Nút tròn kính mờ bong bóng chứa mũi tên */}
              <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-white/35 to-white/10 border border-white/70 shadow-[inset_0_1px_2px_rgba(255,255,255,0.85),0_2px_8px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-300 group-hover:scale-110 group-hover:from-white/50 group-hover:to-white/20 group-hover:translate-x-0.5 overflow-hidden">
                <svg className="w-4 h-4 text-white transition-transform duration-300 drop-shadow-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </a>

            {/* Secondary Frosted Liquid Glass Button */}
            <Link
              to="/create-trip"
              className="group relative inline-flex items-center justify-between gap-5 rounded-full bg-white/90 dark:bg-slate-900/90 pl-6 pr-2.5 py-2 text-slate-800 dark:text-white border border-slate-200/90 dark:border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-black/40 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-blue-400/80 hover:text-blue-600 dark:hover:text-cyan-300 active:scale-95 cursor-pointer overflow-hidden"
            >
              {/* Top soft gloss reflection */}
              <span className="pointer-events-none absolute inset-x-2 top-0.5 h-[40%] rounded-full bg-gradient-to-b from-white/80 via-white/20 to-transparent blur-[0.5px] dark:from-white/10" />

              <span className="font-outfit font-black text-sm tracking-tight drop-shadow-xs">
                {t('discover.heroCtaSecondary')}
              </span>

              {/* Nút tròn kính mờ phụ */}
              <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-cyan-300 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent group-hover:translate-x-0.5">
                <svg className="w-4 h-4 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 2L12.5 8.5L19 11L12.5 13.5L10 20L7.5 13.5L1 11L7.5 8.5L10 2Z" />
                  <path d="M18 1L19.2 4.2L22.4 5.4L19.2 6.6L18 9.8L16.8 6.6L13.6 5.4L16.8 4.2L18 1Z" />
                  <path d="M18.5 14L19.3 16.3L21.6 17.1L19.3 17.9L18.5 20.2L17.7 17.9L15.4 17.1L17.7 16.3L18.5 14Z" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Airplane Window & Floating Interactive Micro-Cards (Spans 6 cols) */}
        <div className="lg:col-span-6 relative flex items-center justify-center min-h-[320px] sm:min-h-[360px]">

          {/* Subtle Dotted Flight Trajectory Line */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
            <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
              <path
                d="M 20 160 C 100 40, 260 20, 380 90"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
            </svg>
          </div>

          {/* Cruising Miniature Airplane */}
          <div className="absolute top-12 left-10 sm:left-14 -rotate-12 animate-pulse text-blue-600 dark:text-cyan-400">
            <svg className="w-6 h-6 -rotate-45" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>

          {/* Central Airplane Window (Oval Shaped with Realistic Inner Shadow & Sunset view) */}
          <div className="relative w-44 h-64 sm:w-52 sm:h-72 rounded-[90px] p-3.5 bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 shadow-2xl border-4 border-white/90 dark:border-slate-600/80 overflow-hidden flex items-center justify-center">
            {/* Inner Glass Frame */}
            <div className="relative w-full h-full rounded-[80px] overflow-hidden shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1517400508447-f8dd518b86db?w=800&auto=format&fit=crop&q=80"
                alt="Airplane window sunset"
                className="w-full h-full object-cover scale-110 hover:scale-125 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 via-transparent to-sky-500/20" />
              {/* Glass reflection highlight */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/20 blur-md pointer-events-none" />
            </div>
          </div>

          {/* Floating Badge 1: Top Left - Weather */}
          <div className="absolute top-2 left-2 sm:left-4 rounded-2xl border border-white/80 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 px-3.5 py-2 shadow-lg backdrop-blur-xl animate-bounce-subtle text-left">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span>☀️</span>
              <span>{t('discover.todayWeather')}</span>
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              {t('discover.weatherValue')}
            </div>
          </div>

          {/* Floating Badge 2: Bottom Left - Recommended Hotel */}
          <div className="absolute bottom-2 left-0 sm:left-2 rounded-2xl border border-white/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-2 sm:p-2.5 shadow-xl backdrop-blur-xl flex items-center gap-2.5 max-w-[210px] text-left">
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80"
              alt="Hotel thumbnail"
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl object-cover shrink-0"
            />
            <div>
              <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                {t('discover.recommendedHotel')}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {t('discover.bestPriceFrom')} <span className="font-bold text-blue-600 dark:text-cyan-400">900K</span>
              </div>
              <div className="text-[9px] text-amber-500">★★★★★</div>
            </div>
          </div>

          {/* Floating Badge 3: Right Side - Tailored Preference */}
          <div className="absolute bottom-10 right-0 sm:right-2 rounded-2xl border border-white/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-2.5 sm:px-3.5 sm:py-2.5 shadow-xl backdrop-blur-xl flex items-center gap-2.5 text-left">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 shrink-0">
              ❤️
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                {t('discover.tailoredForYou')}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {t('discover.basedOnPreferences')}
              </div>
            </div>
          </div>

          {/* Floating decorative Pin & Sparkle icons */}
          <div className="absolute top-8 right-6 flex h-7 w-7 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shadow-sm border border-purple-200/50">
            ✨
          </div>
          <div className="absolute top-24 right-14 flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 shadow-sm border border-blue-200/50">
            📍
          </div>

        </div>

      </div>

    </section>
  );
}

{/* ========================================================================= */}
{/* 🔍 FILTER & SEARCH BAR (4 TRƯỜNG TÌM KIẾM + CATEGORY PILLS) */}
{/* ========================================================================= */}
function FilterBar({
  query,
  onQuery,
  active,
  onActive,
  duration,
  onDuration,
  guests,
  onGuests,
}: {
  query: string;
  onQuery: (v: string) => void;
  active: RecCategory | 'ALL';
  onActive: (v: RecCategory | 'ALL') => void;
  duration: string;
  onDuration: (v: string) => void;
  guests: string;
  onGuests: (v: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <section id="discover-filters" className="space-y-4">

      {/* 4-Column Search Form Box */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 sm:p-4 shadow-sm backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">

          {/* Field 1: Text Search (Spans 5 cols) */}
          <div className="md:col-span-5 relative flex items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/60 px-3.5 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <span className="text-slate-400 mr-2.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder={t('discover.searchPlaceholder')}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none font-medium"
            />
          </div>

          {/* Field 2: Duration Selector (Spans 3 cols) */}
          <div className="md:col-span-3 relative flex items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/60 px-3.5 py-2.5">
            <span className="text-slate-400 mr-2.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <select
              value={duration}
              onChange={(e) => onDuration(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900">{t('discover.durationAll')}</option>
              <option value="1-3" className="bg-white dark:bg-slate-900">{t('discover.durationShort')}</option>
              <option value="4-7" className="bg-white dark:bg-slate-900">{t('discover.durationMedium')}</option>
              <option value="7+" className="bg-white dark:bg-slate-900">{t('discover.durationLong')}</option>
            </select>
          </div>

          {/* Field 3: Guest Selector (Spans 2 cols) */}
          <div className="md:col-span-2 relative flex items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/60 px-3.5 py-2.5">
            <span className="text-slate-400 mr-2.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <select
              value={guests}
              onChange={(e) => onGuests(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900">{t('discover.guestsAll')}</option>
              <option value="1" className="bg-white dark:bg-slate-900">{t('discover.guestsSolo')}</option>
              <option value="2" className="bg-white dark:bg-slate-900">{t('discover.guestsCouple')}</option>
              <option value="4" className="bg-white dark:bg-slate-900">{t('discover.guestsFamily')}</option>
              <option value="group" className="bg-white dark:bg-slate-900">{t('discover.guestsGroup')}</option>
            </select>
          </div>

          {/* Field 4: Search Button (Spans 2 cols) */}
          <div className="md:col-span-2">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
              </svg>
              <span>{t('discover.search')}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Category Pills (Row 2 matching reference) */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto py-1">
        {CATEGORY_FILTERS.map((f) => {
          const activeItem = active === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => onActive(f.value)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeItem
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 scale-105'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs'
              }`}
            >
              <span>{f.icon}</span>
              <span>{t(f.labelKey)}</span>
            </button>
          );
        })}
      </div>

    </section>
  );
}

{/* ========================================================================= */}
{/* 🗂️ RECOMMENDATION CARD COMPONENT */}
{/* ========================================================================= */}
function RecommendationCard({ rec }: { rec: RecommendationSummary }) {
  const { t } = useTranslation();
  const audience = recommendationAudience(rec);

  return (
    <article className="group relative rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Cover Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        {rec.image ? (
          <img
            src={rec.image}
            alt={rec.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-blue-50 text-4xl dark:bg-blue-950/40">
            ✈️
          </div>
        )}

        {/* Category Pill Overlay */}
        <div className="absolute left-3.5 top-3.5">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold shadow-xs backdrop-blur-md ${categoryBadgeClasses(rec.category)}`}
          >
            {t(`discover.category${rec.category.charAt(0) + rec.category.slice(1).toLowerCase()}`)}
          </span>
        </div>

        {/* Favorite Bookmark */}
        <FavoriteButton recommendationId={rec.id} variant="overlay" />

        {/* Duration badge */}
        {rec.daysCount > 0 && (
          <div className="absolute right-3.5 bottom-3.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 dark:bg-black/80 px-2.5 py-1 text-xs font-bold text-white shadow-md backdrop-blur-md">
              <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{t('discover.daysShort', { count: rec.daysCount })}</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4 text-left">
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            {/* Rating */}
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 font-bold text-amber-700 dark:text-amber-400">
              ★ {rec.rating.toFixed(1)}
              <span className="font-normal text-slate-400">({rec.reviewCount})</span>
            </span>
            {/* Destination */}
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium truncate max-w-[140px]">
              <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate">{rec.destination}</span>
            </span>
          </div>

          <h3 className="font-outfit text-base font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
            {rec.title}
          </h3>
          <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {rec.description}
          </p>
          <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">👥 {t('discover.suitableGuests', { min: audience.min, max: audience.max })}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
          <div>
            <div className="text-[10px] text-slate-400">{t('discover.priceFrom')}</div>
            <span className="text-base font-black text-blue-600 dark:text-cyan-400">
              {formatVND(rec.price)}
            </span>
          </div>

          <Link
            to={`/recommendations/${rec.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1.5 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:bg-blue-600 hover:text-white transition-all duration-200 cursor-pointer group"
          >
            <span>{t('discover.viewDetail')}</span>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

{/* ========================================================================= */}
{/* 📄 PAGINATION COMPONENT */}
{/* ========================================================================= */}
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
    <div className="flex items-center justify-center gap-3 pt-4">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
      >
        ← {t('discover.prev')}
      </button>
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2">
        {page} / {pageCount}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page >= pageCount}
        className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 disabled:opacity-40 transition cursor-pointer"
      >
        {t('discover.next')} →
      </button>
    </div>
  );
}
