import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { tripService } from '@/services';
import { useNotificationContext } from '@/contexts/NotificationContext';

const today = () => new Date().toISOString().slice(0, 10);

const PRESET_BUDGETS = [
  { label: '3 Tr', value: 3000000 },
  { label: '5 Tr', value: 5000000 },
  { label: '10 Tr', value: 10000000 },
  { label: '20 Tr', value: 20000000 },
  { label: '50 Tr', value: 50000000 },
];

export default function CreateTripPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pushToast } = useNotificationContext();

  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  });
  const [travelers, setTravelers] = useState(2);
  const [budgetAmount, setBudgetAmount] = useState<number>(5000000);

  const budgetHintDays = Math.max(
    1,
    Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1,
  );
  const [preferences, setPreferences] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (new Date(endDate) < new Date(startDate)) {
      toast.error(t('createTrip.dateError'));
      return;
    }
    setSubmitting(true);
    try {
      const trip = await tripService.create({
        destination,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        travelers,
        budget: budgetAmount,
        preferences,
      });
      pushToast({
        title: '🎉 Lịch trình đã sẵn sàng!',
        message: `AI đã tạo xong lịch trình cho ${trip.destination}.`,
        kind: 'success',
        duration: 6000,
      });
      toast.success(t('createTrip.success'));
      navigate(`/trips/${trip.id}`);
    } catch {
      /* handled in interceptor */
    } finally {
      setSubmitting(false);
    }
  };

  const handleBudgetInputChange = (val: string) => {
    const rawNum = parseInt(val.replace(/\D/g, ''), 10);
    if (!isNaN(rawNum)) {
      setBudgetAmount(Math.min(500000000, Math.max(0, rawNum)));
    } else {
      setBudgetAmount(0);
    }
  };

  const adjustBudget = (delta: number) => {
    setBudgetAmount((prev) => Math.min(200000000, Math.max(500000, prev + delta)));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-20 sm:px-6 sm:pt-22">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-600/10 via-indigo-500/8 to-cyan-500/10 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="mb-6 text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight font-sans">
          {t('createTrip.title').split(' ').slice(0, -1).join(' ')}{' '}
          <span className="font-serif italic font-normal bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            {t('createTrip.title').split(' ').slice(-1)[0]}
          </span>
        </h1>
      </header>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="relative rounded-3xl border border-slate-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-6 sm:p-8 space-y-6"
      >
        {/* Top glow line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 dark:via-cyan-500/40 to-transparent rounded-t-3xl" />

        {/* Destination */}
        <div>
          <label className="block text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-2">
            {t('createTrip.destination')}
          </label>
          <div className="relative">
            <input
              required
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={t('createTrip.destinationPlaceholder')}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-2">
              {t('createTrip.startDate')}
            </label>
            <div className="relative">
              <input
                required
                type="date"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-2">
              {t('createTrip.endDate')}
            </label>
            <div className="relative">
              <input
                required
                type="date"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Travelers Stepper */}
        <div>
          <label className="block text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-2">
            {t('createTrip.travelers')}
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 px-4 py-2.5">
            <button
              type="button"
              onClick={() => setTravelers((v) => Math.max(1, v - 1))}
              className="h-8 w-8 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-white font-bold text-base flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 border border-slate-200 dark:border-slate-600 transition cursor-pointer shadow-xs"
            >
              −
            </button>
            <span className="flex-1 text-center text-sm font-bold text-slate-900 dark:text-white">
              {travelers} người
            </span>
            <button
              type="button"
              onClick={() => setTravelers((v) => Math.min(50, v + 1))}
              className="h-8 w-8 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-white font-bold text-base flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 border border-slate-200 dark:border-slate-600 transition cursor-pointer shadow-xs"
            >
              +
            </button>
          </div>
        </div>

        {/* Interactive Custom Budget Slider & Direct Input */}
        <div className="space-y-3 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400">
              {t('createTrip.budget')} (Dự kiến)
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => adjustBudget(-1000000)}
                className="h-6 px-2 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 border border-slate-200 dark:border-slate-600 transition cursor-pointer"
                title="Giảm 1 triệu"
              >
                -1 Tr
              </button>
              <button
                type="button"
                onClick={() => adjustBudget(1000000)}
                className="h-6 px-2 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 border border-slate-200 dark:border-slate-600 transition cursor-pointer"
                title="Tăng 1 triệu"
              >
                +1 Tr
              </button>
            </div>
          </div>

          {/* Amount Display & Direct typing input */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={budgetAmount ? new Intl.NumberFormat('vi-VN').format(budgetAmount) : ''}
              onChange={(e) => handleBudgetInputChange(e.target.value)}
              placeholder="0"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-lg font-black text-blue-600 dark:text-cyan-400 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition pr-12"
            />
            <span className="absolute right-4 text-sm font-bold text-slate-400">
              VNĐ
            </span>
          </div>

          {/* Per-person-per-day hint */}
          <BudgetHint amount={budgetAmount} travelers={travelers} days={budgetHintDays} />

          {/* Range slider */}
          <div className="pt-2 space-y-1.5">
            <input
              type="range"
              min={0}
              max={50000000}
              step={500000}
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
            />
            <div className="relative h-6 mt-1 text-[10px] font-semibold text-slate-400">
              {[
                { value: 0, label: '0', align: 'left' as const },
                { value: 10000000, label: '10 Tr', align: 'center' as const },
                { value: 25000000, label: '25 Tr', align: 'center' as const },
                { value: 50000000, label: '50 Tr+', align: 'right' as const },
              ].map((tick) => {
                const pct = (tick.value / 50000000) * 100;
                const anchorClass =
                  tick.align === 'left'
                    ? ''
                    : tick.align === 'right'
                      ? ''
                      : '-translate-x-1/2';
                const style =
                  tick.align === 'right'
                    ? { right: '0%' }
                    : { left: `${pct}%` };
                return (
                  <span
                    key={tick.value}
                    className={`absolute top-0 whitespace-nowrap ${anchorClass}`}
                    style={style}
                  >
                    <span className="absolute left-1/2 -top-2 h-1.5 w-px bg-slate-300 dark:bg-slate-600" />
                    <span className="block pt-1.5">{tick.label}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold text-slate-400">Mức gợi ý:</span>
            {PRESET_BUDGETS.map((preset) => {
              const active = budgetAmount === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setBudgetAmount(preset.value)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-blue-300'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferences */}
        <div>
          <label className="block text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-2">
            {t('createTrip.preferences')}
          </label>
          <textarea
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 min-h-[100px] resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder={t('createTrip.preferencesPlaceholder')}
          />
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
            {t('createTrip.footerNote')}
          </p>

          {/* Apple iOS 3D Liquid Glass Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="group relative inline-flex items-center justify-between gap-3 rounded-full bg-gradient-to-b from-[#4387f6] via-[#2563eb] to-[#1a4ecb] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(37,99,235,0.45),inset_0_2px_3px_rgba(255,255,255,0.7),inset_0_-2px_3px_rgba(0,0,0,0.2)] border-t border-b border-white/60 border-t-white/85 border-b-blue-900/40 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_12px_30px_rgba(37,99,235,0.6)] active:scale-95 disabled:opacity-50 cursor-pointer overflow-hidden"
          >
            <span className="pointer-events-none absolute inset-x-3 top-1 h-[45%] rounded-full bg-gradient-to-b from-white/60 via-white/15 to-transparent" />
            <span className="pointer-events-none absolute inset-x-5 bottom-1 h-[25%] rounded-full bg-gradient-to-t from-white/35 to-transparent" />
            <span className="relative z-10 flex items-center gap-2">
              <span>{submitting ? t('createTrip.submitting') : t('createTrip.submit')}</span>
            </span>
            <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-white/40 to-white/10 border border-white/70 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.9)] backdrop-blur-md transition-transform duration-300 group-hover:translate-x-0.5 overflow-hidden">
              <span className="pointer-events-none absolute inset-x-0.5 top-0 h-[40%] rounded-full bg-gradient-to-b from-white/80 to-transparent" />
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}

interface BudgetHintProps {
  amount: number;
  travelers: number;
  days: number;
}

const TIER_INFO: Record<string, { label: string; emoji: string; color: string }> = {
  backpacker: { label: 'Tiết kiệm (backpacker)', emoji: '🎒', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
  budget: { label: 'Bình dân', emoji: '🏨', color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10' },
  mid: { label: 'Trung bình khá', emoji: '🌟', color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10' },
  premium: { label: 'Cao cấp', emoji: '✨', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' },
  luxury: { label: 'Sang trọng', emoji: '👑', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10' },
};

function classifyTier(perPersonPerDay: number): string {
  if (perPersonPerDay <= 400_000) return 'backpacker';
  if (perPersonPerDay <= 900_000) return 'budget';
  if (perPersonPerDay <= 1_800_000) return 'mid';
  if (perPersonPerDay <= 3_500_000) return 'premium';
  return 'luxury';
}

function BudgetHint({ amount, travelers, days }: BudgetHintProps) {
  const safeTravelers = Math.max(1, travelers);
  const safeDays = Math.max(1, days);
  const perDay = Math.round(amount / safeDays);
  const perPersonPerDay = Math.round(perDay / safeTravelers);
  const tier = classifyTier(perPersonPerDay);
  const info = TIER_INFO[tier];

  if (!amount) return null;

  return (
    <div className={`mt-2 flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold ${info.color}`}>
      <span className="flex items-center gap-1.5">
        <span aria-hidden>{info.emoji}</span>
        <span>Lịch trình sẽ được tối ưu cho mức {info.label.toLowerCase()}</span>
      </span>
      <span className="font-black tabular-nums">
        ≈ {perPersonPerDay.toLocaleString('vi-VN')} đ/người/ngày
      </span>
    </div>
  );
}
