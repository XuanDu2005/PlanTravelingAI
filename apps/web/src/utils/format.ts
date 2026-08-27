/**
 * Format an integer amount as Vietnamese Dong (VND).
 * Example: 2800000 -> "2.800.000 ₫"
 */
export function formatVND(amount: number): string {
  if (!Number.isFinite(amount)) return '0 ₫';
  const formatted = new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  return `${formatted} ₫`;
}

/**
 * Format a budget value for display. The backend now stores budgets as a raw
 * VND integer, so this just renders the amount in VND. Kept for backwards
 * compatibility with any caller passing a legacy tier label.
 */
export function formatBudgetLabel(
  budget: number | string,
  _t?: (key: string) => string,
): string {
  if (typeof budget === 'number') return formatVND(budget);
  // Legacy string tiers (Budget / Mid-range / Premium / Luxury) are no longer
  // emitted by the form, but we still display them gracefully if old data
  // surfaces.
  if (typeof budget === 'string' && budget.trim().length > 0 && Number.isFinite(Number(budget))) {
    return formatVND(Number(budget));
  }
  return budget;
}
