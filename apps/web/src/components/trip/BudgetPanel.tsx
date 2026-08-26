import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { tripService } from '@/services';
import type { Trip, TripExpense } from '@/types';
import { useTranslation } from 'react-i18next';

const CATEGORIES = ['Ăn uống', 'Di chuyển', 'Lưu trú', 'Tham quan', 'Mua sắm', 'Khác'];
const MAX_EXPENSE_AMOUNT = 2_000_000_000;

const SUGGESTION_MULTIPLIERS = [10, 100, 1000, 10000] as const;

function compactVND(value: number): string {
  if (value >= 1_000_000_000) {
    const ty = value / 1_000_000_000;
    return Number.isInteger(ty) ? `${ty} tỷ` : `${ty.toFixed(ty >= 10 ? 1 : 2)} tỷ`;
  }
  if (value >= 1_000_000) {
    const tr = value / 1_000_000;
    return Number.isInteger(tr) ? `${tr} Tr` : `${tr.toFixed(tr >= 10 ? 1 : 2)} Tr`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return Number.isInteger(k) ? `${k}K` : `${k.toFixed(k >= 10 ? 1 : 2)}K`;
  }
  return value.toString();
}

/**
 * Build "append zero" suggestions that keep the typed number as a prefix.
 * - Input "4"   -> [40, 400, 4_000]              -> "40", "400", "4K"
 * - Input "15"  -> [150, 1_500, 15_000]          -> "150", "1.5K", "15K"
 * - Input "150" -> [1_500, 15_000, 150_000]      -> "1.5K", "15K", "150K"
 * - Input "1.5M" -> [15M, 150M, 1.5B]            -> "15 Tr", "150 Tr", "1.5 tỷ"
 */
function buildSuggestions(raw: string): number[] {
  const num = parseAmountInput(raw);
  if (num === null || num <= 0) return [];
  const seen = new Set<number>();
  const out: number[] = [];
  for (const mult of SUGGESTION_MULTIPLIERS) {
    const v = num * mult;
    if (v > MAX_EXPENSE_AMOUNT) break;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
    if (out.length >= 3) break;
  }
  return out;
}

function formatVND(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
}

function parseAmountInput(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d]/g, '');
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

export default function BudgetPanel({ trip, onReload }: { trip: Trip; onReload: () => Promise<void> }) {
  const { t: _t } = useTranslation();
  void _t;
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const total = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory: Record<string, number> = {};
  for (const e of trip.expenses) {
    const key = e.category;
    byCategory[key] = (byCategory[key] ?? 0) + e.amount;
  }

  const handleAmountChange = (raw: string) => {
    const num = parseAmountInput(raw);
    if (num === null) {
      setAmount('');
      return;
    }
    if (num > MAX_EXPENSE_AMOUNT) {
      toast.error('Số tiền mỗi khoản chi không được vượt quá 2 tỷ VND');
      setAmount(String(MAX_EXPENSE_AMOUNT));
      return;
    }
    setAmount(String(num));
  };

  const titleError = useMemo(() => {
    if (!title.trim()) return 'Vui lòng nhập tên khoản chi';
    if (title.trim().length < 2) return 'Tên khoản chi phải có ít nhất 2 ký tự';
    return null;
  }, [title]);

  const amountError = useMemo(() => {
    if (!amount) return 'Vui lòng nhập số tiền';
    const num = Number(amount);
    if (!Number.isFinite(num) || num < 0) return 'Số tiền không hợp lệ';
    if (num > MAX_EXPENSE_AMOUNT) return 'Số tiền không được vượt quá 2 tỷ VND';
    return null;
  }, [amount]);

  const isFormValid = !titleError && !amountError;

  const smartSuggestions = useMemo(() => buildSuggestions(amount), [amount]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (titleError) {
      toast.error(titleError);
      return;
    }
    if (amountError) {
      toast.error(amountError);
      return;
    }
    const value = Number(amount);
    setSaving(true);
    try {
      await tripService.addExpense(trip.id, { title: title.trim(), category, amount: Math.round(value) });
      setTitle('');
      setAmount('');
      await onReload();
      toast.success('Đã thêm chi tiêu');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await tripService.removeExpense(trip.id, id);
    await onReload();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-emerald-200/60 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 p-6 text-white shadow-xl">
        <p className="text-xs font-bold uppercase tracking-wider text-white/80">Tổng chi tiêu thực tế</p>
        <p className="mt-2 font-outfit text-3xl font-black">{formatVND(total)}</p>
        <p className="mt-1 text-xs text-white/80">{trip.expenses.length} khoản · ngân sách dự kiến: {trip.budget}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <form onSubmit={submit} noValidate className="lg:col-span-5 space-y-3 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-sm">
          <h3 className="font-outfit text-base font-extrabold text-slate-900 dark:text-white">+ Thêm khoản chi</h3>
          <div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tên khoản chi (vd: Ăn tối)"
              aria-invalid={titleError ? 'true' : 'false'}
              className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm outline-none transition ${titleError ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`}
            />
            {titleError && (
              <p className="mt-1 text-[11px] font-semibold text-rose-500">{titleError}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-blue-500">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div>
              <input
                type="number"
                min="0"
                max={MAX_EXPENSE_AMOUNT}
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="VNĐ (tối đa 2 tỷ)"
                aria-invalid={amountError ? 'true' : 'false'}
                className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm outline-none transition ${amountError ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`}
              />
              {amountError && (
                <p className="mt-1 text-[11px] font-semibold text-rose-500">{amountError}</p>
              )}
              {smartSuggestions.length > 0 && !amountError && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mr-0.5">
                    Thêm số 0 →
                  </span>
                  {smartSuggestions.map((v) => {
                    const active = Number(amount) === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setAmount(String(v))}
                        title={v.toLocaleString('vi-VN') + ' VND'}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${active ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-500/15' : 'border-blue-200 bg-blue-50/50 text-blue-600 hover:border-blue-400 hover:bg-blue-100 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20'}`}
                      >
                        {compactVND(v)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving || !isFormValid}
            title={!isFormValid ? (titleError ?? amountError ?? '') : ''}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-bold text-white shadow-md hover:scale-[1.02] active:scale-95 transition disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {saving ? 'Đang lưu...' : '+ Thêm'}
          </button>
        </form>

        <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-sm">
          <h3 className="font-outfit text-base font-extrabold text-slate-900 dark:text-white">Lịch sử chi tiêu</h3>
          <div className="mt-4 space-y-2">
            {trip.expenses.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center text-xs text-slate-500">
                Chưa có khoản chi nào. Hãy thêm chi tiêu đầu tiên của bạn.
              </p>
            )}
            {trip.expenses.map((e: TripExpense) => (
              <div key={e.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-100/70 text-base dark:bg-emerald-500/15">💳</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-slate-900 dark:text-white">{e.title}</div>
                  <div className="text-xs text-slate-500">{e.category} · {new Date(e.spentAt).toLocaleDateString('vi-VN')}</div>
                </div>
                <strong className="text-sm font-mono font-black text-slate-900 dark:text-white">{formatVND(e.amount)}</strong>
                <button type="button" onClick={() => remove(e.id)} className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition" aria-label="Xoá">×</button>
              </div>
            ))}
          </div>

          {Object.keys(byCategory).length > 0 && (
            <div className="mt-6 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Phân bổ theo danh mục</h4>
              {Object.entries(byCategory).map(([cat, val]) => {
                const pct = total ? Math.round((val / total) * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="mb-1 flex justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-300">{cat}</span>
                      <span className="font-mono text-slate-900 dark:text-white">{formatVND(val)} ({pct}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.max(5, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}