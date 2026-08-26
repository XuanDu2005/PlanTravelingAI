import { useState } from 'react';
import toast from 'react-hot-toast';
import { tripService } from '@/services';
import type { Trip, TripPackingItem } from '@/types';

const CATEGORIES = ['Giấy tờ', 'Trang phục', 'Cá nhân', 'Sức khoẻ', 'Điện tử', 'Khác'];

export default function PackingPanel({ trip, onReload }: { trip: Trip; onReload: () => Promise<void> }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [quantity, setQuantity] = useState('1');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const packed = trip.packingItems.filter((p) => p.isPacked).length;
  const total = trip.packingItems.length;
  const pct = total ? Math.round((packed / total) * 100) : 0;

  const groups: Record<string, TripPackingItem[]> = {};
  for (const item of trip.packingItems) {
    (groups[item.category] ??= []).push(item);
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await tripService.addPacking(trip.id, { name: name.trim(), category, quantity: Number(quantity) || 1 });
      setName('');
      setQuantity('1');
      await onReload();
      toast.success('Đã thêm đồ dùng');
    } finally {
      setSaving(false);
    }
  };

  const aiGenerate = async () => {
    if (total > 0) {
      const ok = window.confirm('AI sẽ thay thế toàn bộ checklist hiện tại bằng danh sách gợi ý mới. Tiếp tục?');
      if (!ok) return;
    }
    setGenerating(true);
    try {
      const result = await tripService.generatePacking(trip.id);
      await onReload();
      toast.success(`AI đã tạo ${result.created} món đồ dùng`);
    } catch {
      toast.error('Không thể tạo checklist. Vui lòng thử lại.');
    } finally {
      setGenerating(false);
    }
  };

  const toggle = async (item: TripPackingItem) => {
    await tripService.updatePacking(trip.id, item.id, { isPacked: !item.isPacked });
    await onReload();
  };

  const remove = async (id: string) => {
    await tripService.removePacking(trip.id, id);
    await onReload();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-outfit text-base font-extrabold text-slate-900 dark:text-white">Checklist đồ dùng</h3>
            <p className="mt-1 text-xs text-slate-500">{packed}/{total} đã đóng gói</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={generating}
              onClick={aiGenerate}
              className="rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/25 hover:scale-[1.02] active:scale-95 transition cursor-pointer disabled:opacity-60"
              title="AI tạo checklist dựa trên điểm đến, số ngày và số người"
            >
              {generating ? '✨ Đang tạo...' : '✨ AI tạo checklist'}
            </button>
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <form onSubmit={submit} className="lg:col-span-4 space-y-3 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-sm h-fit">
          <h3 className="font-outfit text-base font-extrabold text-slate-900 dark:text-white">+ Thêm đồ dùng</h3>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên đồ dùng" required className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500" />
          <div className="grid grid-cols-2 gap-3">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-blue-500">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500" />
          </div>
          <button disabled={saving} className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-bold text-white shadow-md hover:scale-[1.02] active:scale-95 transition disabled:opacity-60">
            {saving ? 'Đang lưu...' : '+ Thêm'}
          </button>
        </form>

        <div className="lg:col-span-8 space-y-6">
          {Object.keys(groups).length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 p-12 text-center text-sm text-slate-500">
              Chưa có đồ dùng nào. Hãy thêm từng món bạn cần mang theo.
            </div>
          )}
          {Object.entries(groups).map(([cat, items]) => (
            <div key={cat} className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 shadow-sm">
              <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-slate-400">{cat}</h4>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {items.map((item) => (
                  <label key={item.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition select-none ${item.isPacked ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-950/20' : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-blue-300'}`}>
                    <input type="checkbox" checked={item.isPacked} onChange={() => toggle(item)} className="h-4 w-4 rounded accent-emerald-500 cursor-pointer" />
                    <span className={`flex-1 text-sm ${item.isPacked ? 'text-slate-400 line-through' : 'font-semibold text-slate-800 dark:text-slate-100'}`}>{item.name}</span>
                    <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-500">×{item.quantity}</span>
                    <button type="button" onClick={(e) => { e.preventDefault(); remove(item.id); }} className="text-slate-300 hover:text-rose-500 transition" aria-label="Xoá">×</button>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}