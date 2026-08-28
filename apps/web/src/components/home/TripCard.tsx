import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export interface TripCardData {
  id: string;
  title: string;
  destination: string;
  duration: string;
  rating: number;
  reviewsCount: number | string;
  tag: 'popular' | 'suggested';
  imageUrl: string;
  price?: number;
}

interface TripCardProps {
  trip: TripCardData;
  variant?: 'spotlight' | 'compact';
}

export default function TripCard({ trip, variant = 'compact' }: TripCardProps) {
  const { t } = useTranslation();
  const [bookmarked, setBookmarked] = useState(false);
  const spotlight = variant === 'spotlight';

  return (
    <article
      className={`group relative h-full overflow-hidden bg-slate-900 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/25 ${
        spotlight
          ? 'min-h-[430px] rounded-[28px] border-2 border-blue-500 shadow-[0_18px_45px_rgba(37,99,235,0.22)] lg:min-h-0'
          : 'min-h-[250px] rounded-[20px] border border-slate-300/70 shadow-lg dark:border-slate-700 lg:min-h-0'
      }`}
    >
      {trip.imageUrl ? (
        <img
          src={trip.imageUrl}
          alt={trip.title}
          loading={spotlight ? 'eager' : 'lazy'}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-blue-800 to-slate-950 text-6xl">✈️</div>
      )}
      <div className={`absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-black/25 ${spotlight ? '' : 'group-hover:via-slate-950/45'}`} />

      <div className={`absolute z-10 flex items-center justify-between ${spotlight ? 'left-6 right-6 top-6' : 'left-3.5 right-3.5 top-3.5'}`}>
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-extrabold text-white shadow-md backdrop-blur-md ${spotlight ? 'text-xs' : 'text-[10px]'} ${trip.tag === 'popular' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-blue-600/95'}`}>
          <span>{trip.tag === 'popular' ? '🔥' : '✨'}</span>
          {trip.tag === 'popular' ? t('home.featuredSortPopular') : t('home.featuredSuggested')}
        </span>

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setBookmarked((current) => !current);
          }}
          aria-label={t('home.featuredSave')}
          aria-pressed={bookmarked}
          className={`grid place-items-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-black/60 ${spotlight ? 'h-10 w-10' : 'h-7 w-7'}`}
        >
          <svg className={`${spotlight ? 'h-5 w-5' : 'h-3.5 w-3.5'} ${bookmarked ? 'fill-amber-400 text-amber-400' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5Z" />
          </svg>
        </button>
      </div>

      <div className={`absolute z-10 ${spotlight ? 'bottom-6 left-6 right-6' : 'bottom-3.5 left-3.5 right-3.5'}`}>
        <h3 className={`font-outfit font-black leading-tight text-white drop-shadow-md transition-colors group-hover:text-cyan-300 ${spotlight ? 'text-2xl sm:text-3xl' : 'text-base sm:text-lg'}`}>
          {trip.title}
        </h3>
        <p className={`mt-1 font-bold text-slate-200 ${spotlight ? 'text-xs' : 'text-[10px]'}`}>{trip.duration}</p>

        <div className={`mt-3 flex items-center justify-between border-t border-white/15 ${spotlight ? 'pt-3' : 'pt-2'}`}>
          <span className={`font-extrabold text-amber-400 ${spotlight ? 'text-sm' : 'text-[11px]'}`}>
            ★ {trip.rating.toFixed(1)} <span className="font-medium text-slate-300">({trip.reviewsCount})</span>
          </span>
          <Link
            to={`/recommendations/${trip.id}`}
            aria-label={`${t('discover.viewDetail')} ${trip.title}`}
            className={`flex shrink-0 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-md backdrop-blur-md transition-all duration-300 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/30 group-hover:scale-105 active:scale-95 ${
              spotlight ? 'h-10 w-10' : 'h-8 w-8'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className={`${spotlight ? 'w-5 h-5' : 'w-4 h-4'} transition-transform duration-300 group-hover:translate-x-0.5`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
