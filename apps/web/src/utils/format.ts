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
 * Translate a raw budget value (stored in the DB / submitted by the form)
 * into a human-readable, locale-aware label.
 *
 * Supported raw values: "Budget" | "Mid-range" | "Premium" | "Luxury"
 */
export function formatBudgetLabel(budget: string, t: (key: string) => string): string {
  switch (budget) {
    case 'Budget':
      return t('createTrip.budgetBudget');
    case 'Mid-range':
      return t('createTrip.budgetMid');
    case 'Premium':
      return t('createTrip.budgetPremium');
    case 'Luxury':
      return t('createTrip.budgetLuxury');
    default:
      return budget;
  }
}
