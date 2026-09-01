import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { recommendationService } from '@/services';
import { Recommendation, RecommendationReview } from '@/types';
import ItineraryView from '@/components/ItineraryView';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { useAuth } from '@/store/AuthContext';
import { localReviews } from '@/store/localReviews';
import toast from 'react-hot-toast';

export default function RecommendationDetailPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [error, setError] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const INITIAL_REVIEWS = 5;
  const COLLAPSED_HEIGHT = '440px';

  /**
   * Merge backend response with locally persisted reviews.
   * The API only returns review aggregates (count + avg rating); review
   * content is stored client-side per recommendation.
   */
  const mergeReviews = (recommendation: Recommendation): Recommendation => {
    const local = localReviews.list(recommendation.id);
    const remote = recommendation.reviews ?? [];
    const seen = new Set<string>();
    const merged = [...local, ...remote].filter((item) => {
      const key = `${item.userName}|${item.content}|${item.createdAt}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    merged.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    // Recompute the average rating from the actual review set so local-only
    // reviews are reflected in the header (the backend aggregate may be
    // stale or missing when reviews were added from a different device).
    const computedAverage =
      merged.length > 0
        ? Number(
            (
              merged.reduce((sum, item) => sum + item.rating, 0) / merged.length
            ).toFixed(2),
          )
        : recommendation.rating;

    return {
      ...recommendation,
      reviews: merged,
      reviewCount: Math.max(recommendation.reviewCount, merged.length),
      rating: computedAverage,
    };
  };

  const reviews = rec?.reviews ?? [];
  const visibleReviews = useMemo(
    () => (showAllReviews ? reviews : reviews.slice(0, INITIAL_REVIEWS)),
    [reviews, showAllReviews],
  );
  const hiddenCount = Math.max(reviews.length - INITIAL_REVIEWS, 0);
  const canExpand = reviews.length > INITIAL_REVIEWS;

  const submitReview = async (event: FormEvent) => {
    event.preventDefault();
    if (!id || review.trim().length < 3) return;
    setSubmitting(true);
    try {
      const updated = await recommendationService.review(id, rating, review);
      // Build the optimistic review entry so the list updates even if the
      // backend response does not include the freshly created review.
      const optimisticReview: RecommendationReview = {
        id: `${updated.id}-review-${Date.now()}`,
        recommendationId: updated.id,
        userId: user?.id ?? 'self',
        userName: user?.name || user?.email || t('reviews.anonymous'),
        rating,
        content: review,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // Persist to local storage so the review survives page reloads (the
      // backend intentionally stores only review aggregates, not content).
      localReviews.add(updated.id, optimisticReview);
      setRec((prev) => {
        const base = prev ?? updated;
        const local = localReviews.list(updated.id);
        const seen = new Set<string>();
        const merged = [...local, ...(updated.reviews ?? [])].filter((item) => {
          const key = `${item.userName}|${item.content}|${item.createdAt}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        merged.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        // Always recompute the average from the reviews we actually render.
        // The backend aggregate is kept across many submissions that we
        // cannot see client-side (review content is not persisted on the
        // server), so trusting it would make the header disagree with the
        // visible cards.
        const fallbackRating =
          merged.length > 0
            ? Number(
                (
                  merged.reduce((sum, item) => sum + item.rating, 0) /
                  merged.length
                ).toFixed(2),
              )
            : updated.rating;
        return {
          ...base,
          ...updated,
          reviews: merged,
          reviewCount: Math.max(base.reviewCount, updated.reviewCount, merged.length),
          rating: fallbackRating,
        };
      });
      setReview('');
      toast.success(t('reviews.thankYou'));
    } catch {
      /* handled by interceptor */
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    setRec(null);
    setError(false);
    recommendationService
      .byId(id)
      .then(mergeReviews)
      .then(setRec)
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-20 sm:px-8 sm:pt-22">
        <ErrorState
          message={t('recs.notFoundDesc')}
          title={t('recs.notFoundTitle')}
        />
      </div>
    );
  }
  if (!rec) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-20 sm:px-8 sm:pt-22">
        <LoadingState message={t('recs.loadingDetail')} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-5 px-4 pb-20 pt-20 sm:px-8 sm:pt-22">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-600/10 via-indigo-500/8 to-cyan-500/10 blur-[100px] rounded-full" />
      </div>

      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 dark:border-slate-700 dark:bg-slate-800/90 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:border-blue-400 hover:text-blue-600 dark:hover:text-cyan-300 transition cursor-pointer backdrop-blur-md"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>{t('tripDetail.back').replace('← ', '')}</span>
        </button>

        <Link
          to="/recommendations"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 dark:border-slate-700 dark:bg-slate-800/80 px-4 py-2 text-xs font-bold text-blue-600 dark:text-cyan-300 shadow-xs hover:border-blue-400 transition"
        >
          <span>{t('recs.allRecs')}</span>
          <span>→</span>
        </Link>
      </div>

      {/* Hero Header Banner */}
      <header className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] border border-slate-200/80 dark:border-slate-700/60 shadow-xl bg-slate-900">
        <div className="relative aspect-[16/7] min-h-[360px] sm:min-h-[440px] max-h-[540px] w-full overflow-hidden">
          {rec.image ? (
            <img
              src={rec.image}
              alt={rec.title}
              className="h-full w-full object-cover scale-105 transition-transform duration-700 hover:scale-100"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900" />
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

          {/* Banner Content */}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 text-white space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white border border-white/30">
                {rec.destination}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/30 backdrop-blur-md px-3 py-1 text-xs font-bold text-amber-200 border border-amber-400/30">
                ★ {rec.rating.toFixed(1)} ({rec.reviewCount})
              </span>
            </div>

            <h1 className="font-outfit text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {rec.title}
            </h1>

            <p className="max-w-2xl text-xs sm:text-sm text-slate-200/90 font-medium leading-relaxed">
              {rec.description}
            </p>
          </div>
        </div>
      </header>

      {/* Itinerary Timeline */}
      <section>
        <ItineraryView content={rec.content ?? null} basePrice={rec.price} />
      </section>

      {/* Reviews & Feedback Section */}
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Reviews List */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-end justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500 dark:text-cyan-400">
                {t('reviews.community')}
              </p>
              <h2 className="mt-1 font-outfit text-2xl font-extrabold text-slate-900 dark:text-white">
                {t('reviews.title')}
              </h2>
            </div>
            <div className="text-right">
              <strong className="font-outfit text-3xl font-black text-amber-500">
                {rec.rating.toFixed(1)}
              </strong>
              <p className="text-xs text-slate-400">
                {t('reviews.count', { count: rec.reviewCount })}
              </p>
            </div>
          </div>

          <div
            className={`mt-6 pr-1 ${canExpand && !showAllReviews ? 'overflow-y-auto pr-2' : ''}`}
            style={
              canExpand && !showAllReviews
                ? { maxHeight: COLLAPSED_HEIGHT, scrollbarWidth: 'thin' }
                : undefined
            }
          >
            <div className="space-y-4">
              {visibleReviews.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-xs">
                        {item.userName[0]?.toUpperCase()}
                      </span>
                      <div>
                        <strong className="block text-sm font-bold text-slate-900 dark:text-white">
                          {item.userName}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString(
                            i18n.language === 'en' ? 'en-US' : 'vi-VN',
                          )}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-amber-400">
                      {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                    {item.content}
                  </p>
                </article>
              ))}

              {!reviews.length && (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/80 p-8 text-center text-sm text-slate-400">
                  {t('reviews.empty')}
                </div>
              )}
            </div>
          </div>

          {canExpand && (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllReviews((value) => !value)}
                aria-expanded={showAllReviews}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition hover:scale-[1.03] hover:border-blue-400 hover:text-blue-600 dark:hover:text-cyan-300 active:scale-95 cursor-pointer"
              >
                {showAllReviews ? (
                  <>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    {t('reviews.collapse')}
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    {t('reviews.showMore', { count: hiddenCount })}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Submit Review Card */}
        <aside className="rounded-3xl border border-slate-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-sm h-fit space-y-4">
          {user ? (
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-white">
                  {t('reviews.shareTitle')}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t('reviews.shareDescription')}
                </p>
              </div>

              {/* Star Selector */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={t('reviews.starAria', { count: value })}
                    className={`text-2xl transition hover:scale-110 cursor-pointer ${
                      value <= rating
                        ? 'text-amber-400'
                        : 'text-slate-200 dark:text-slate-700'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 min-h-[110px] resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder={t('reviews.placeholder')}
                required
                minLength={3}
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:scale-[1.02] active:scale-95 transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? t('reviews.submitting') : t('reviews.submit')}
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-3">
              <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-white">
                {t('reviews.experienced')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('reviews.loginDescription')}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:scale-105 transition"
              >
                {t('nav.login')}
              </Link>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
