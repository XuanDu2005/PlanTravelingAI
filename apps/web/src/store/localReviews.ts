/**
 * Local-only review store.
 *
 * The backend currently keeps only review aggregates (count + average rating)
 * and does NOT persist review content. To keep the UI showing the full list
 * across reloads we mirror reviews in localStorage on a per-recommendation
 * basis. Each user's reviews stay on their own device, which is acceptable
 * given the backend intentionally drops them.
 */
import type { RecommendationReview } from '@/types/index';

const STORAGE_KEY = 'travelmind.reviews.v2';

type ReviewMap = Record<string, RecommendationReview[]>;

const readAll = (): ReviewMap => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReviewMap) : {};
  } catch {
    return {};
  }
};

const writeAll = (map: ReviewMap) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* quota or private mode — silently ignore */
  }
};

export const localReviews = {
  list(recommendationId: string): RecommendationReview[] {
    return readAll()[recommendationId] ?? [];
  },

  add(recommendationId: string, review: RecommendationReview): RecommendationReview[] {
    const map = readAll();
    const current = map[recommendationId] ?? [];
    const next = [review, ...current.filter((item) => item.id !== review.id)];
    map[recommendationId] = next;
    writeAll(map);
    return next;
  },
};
