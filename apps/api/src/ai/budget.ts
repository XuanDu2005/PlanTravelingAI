import type { TripItineraryInput } from './ai.types';

export type BudgetTier = 'backpacker' | 'budget' | 'mid' | 'premium' | 'luxury';

export interface BudgetBreakdown {
  /** Total budget as supplied by the user (VND). */
  total: number;
  /** Number of days in the trip (always >= 1). */
  days: number;
  /** Number of travellers (always >= 1). */
  travelers: number;
  /** Average allowed spend per traveller per day (VND). */
  perPersonPerDay: number;
  /** Average allowed spend per day across all travellers (VND). */
  perDay: number;
  /** Tier the budget falls into. */
  tier: BudgetTier;
  /** Human-readable VND label for prompts. */
  totalLabel: string;
  perPersonPerDayLabel: string;
}

const TIER_THRESHOLDS: Array<{ tier: BudgetTier; maxPerPersonPerDay: number }> = [
  { tier: 'backpacker', maxPerPersonPerDay: 400_000 },
  { tier: 'budget', maxPerPersonPerDay: 900_000 },
  { tier: 'mid', maxPerPersonPerDay: 1_800_000 },
  { tier: 'premium', maxPerPersonPerDay: 3_500_000 },
  { tier: 'luxury', maxPerPersonPerDay: Number.POSITIVE_INFINITY },
];

export const TIER_GUIDANCE: Record<BudgetTier, string> = {
  backpacker:
    'Tier TIET KIEM (backpacker): ưu tiên hoạt động miễn phí hoặc rẻ (<100k/người), ở hostel/nhà nghỉ, ăn quán bình dân, đi xe khách/Grab bike. Tránh resort, spa, tour cao cấp.',
  budget:
    'Tier BINH DAN: khách sạn 2-3 sao, ăn quán phổ thông, đi grab car khi cần, một vài hoạt động trải nghiệm vừa phải.',
  mid:
    'Tier TRUNG BINH KHÁ: khách sạn 3-4 sao, nhà hàng tầm trung, có dịch vụ trải nghiệm đáng tiền, có thể dùng tour nửa ngày.',
  premium:
    'Tier CAO CAP: khách sạn 4-5 sao, nhà hàng chất lượng cao, riêng tư hóa trải nghiệm (private tour, spa, yacht ngắn, fine-dining).',
  luxury:
    'Tier SANG TRONG: ưu tiên resort 5 sao trở lên / villa riêng, fine-dining, private guide, private transport, trải nghiệm độc quyền. Không giới hạn chi phí đơn lẻ.',
};

function daysBetween(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
}

export function classifyBudget(perPersonPerDay: number): BudgetTier {
  for (const { tier, maxPerPersonPerDay } of TIER_THRESHOLDS) {
    if (perPersonPerDay <= maxPerPersonPerDay) return tier;
  }
  return 'luxury';
}

export function computeBudgetBreakdown(input: Pick<TripItineraryInput, 'budget' | 'travelers' | 'startDate' | 'endDate'>): BudgetBreakdown {
  const total = Math.max(0, Math.floor(input.budget || 0));
  const travelers = Math.max(1, Math.floor(input.travelers || 1));
  const days = daysBetween(input.startDate, input.endDate);
  const perDay = Math.round(total / days);
  const perPersonPerDay = Math.round(perDay / travelers);
  const tier = classifyBudget(perPersonPerDay);
  return {
    total,
    days,
    travelers,
    perDay,
    perPersonPerDay,
    tier,
    totalLabel: formatVnd(total),
    perPersonPerDayLabel: formatVnd(perPersonPerDay),
  };
}

function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} VND`;
}