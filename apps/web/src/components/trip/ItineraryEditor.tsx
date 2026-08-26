import { useState } from 'react';
import toast from 'react-hot-toast';
import { tripService } from '@/services';
import type { GeneratedItinerary, Trip } from '@/types';

type Day = GeneratedItinerary['days'][number];
type Activity = Day['activities'][number];

export default function ItineraryEditor({ trip, content, onChange, onCancel }: {
  trip: Trip;
  content: GeneratedItinerary;
  onChange: (trip: Trip) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<GeneratedItinerary>(() => structuredClone(content));
  const [saving, setSaving] = useState(false);
  const [editingIdx, setEditingIdx] = useState<string | null>(null);

  const updateActivity = (dayIndex: number, activityIndex: number, patch: Partial<Activity>) => {
    setDraft((prev) => {
      const days = prev.days.map((d, di) => {
        if (di !== dayIndex) return d;
        return {
          ...d,
          activities: d.activities.map((a, ai) => (ai === activityIndex ? { ...a, ...patch } : a)),
        };
      });
      return { ...prev, days };
    });
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    setDraft((prev) => ({
      ...prev,
      days: prev.days.map((d, di) => {
        if (di !== dayIndex) return d;
        return { ...d, activities: d.activities.filter((_, ai) => ai !== activityIndex) };
      }),
    }));
  };

  const addActivity = (dayIndex: number) => {
    setDraft((prev) => ({
      ...prev,
      days: prev.days.map((d, di) => {
        if (di !== dayIndex) return d;
        const newActivity: Activity = {
          time: '08:00',
          title: 'Hoạt động mới',
          location: '',
          description: '',
          estimatedCost: '',
          transport: '',
          imageUrl: '',
          category: '',
        };
        return { ...d, activities: [...d.activities, newActivity] };
      }),
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const updated = await tripService.updateItinerary(trip.id, draft);
      onChange(updated);
      toast.success('Đã lưu lịch trình');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-24 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200/80 dark:border-blue-800 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm backdrop-blur-md">
        <div>
          <h3 className="font-outfit text-base font-extrabold text-slate-900 dark:text-white">Chỉnh sửa lịch trình</h3>
          <p className="text-xs text-slate-500">{draft.days.length} ngày · {draft.days.reduce((s, d) => s + d.activities.length, 0)} hoạt động</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition">Huỷ</button>
          <button type="button" onClick={save} disabled={saving} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:scale-[1.02] active:scale-95 transition disabled:opacity-60">
            {saving ? 'Đang lưu...' : '💾 Lưu'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {draft.days.map((day, dayIndex) => (
          <div key={day.day} className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-cyan-400">Ngày {day.day}</span>
                <h4 className="font-outfit text-base font-extrabold text-slate-900 dark:text-white">{day.date}</h4>
              </div>
              <button type="button" onClick={() => addActivity(dayIndex)} className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/40 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-cyan-300 hover:bg-blue-100 transition">
                + Hoạt động
              </button>
            </div>

            <div className="space-y-2">
              {day.activities.map((activity, activityIndex) => {
                const id = `${dayIndex}-${activityIndex}`;
                const isEditing = editingIdx === id;
                return (
                  <div key={id} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-[80px_1fr] gap-2">
                          <input type="time" value={activity.time} onChange={(e) => updateActivity(dayIndex, activityIndex, { time: e.target.value })} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm" />
                          <input value={activity.title} onChange={(e) => updateActivity(dayIndex, activityIndex, { title: e.target.value })} placeholder="Tiêu đề" className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm" />
                        </div>
                        <input value={activity.location} onChange={(e) => updateActivity(dayIndex, activityIndex, { location: e.target.value })} placeholder="Địa điểm" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm" />
                        <textarea value={activity.description} onChange={(e) => updateActivity(dayIndex, activityIndex, { description: e.target.value })} placeholder="Mô tả" rows={2} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm" />
                        <div className="flex justify-between gap-2">
                          <input value={activity.estimatedCost} onChange={(e) => updateActivity(dayIndex, activityIndex, { estimatedCost: e.target.value })} placeholder="Chi phí ước tính" className="w-40 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm" />
                          <div className="flex gap-1">
                            <button type="button" onClick={() => setEditingIdx(null)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white">Xong</button>
                            <button type="button" onClick={() => removeActivity(dayIndex, activityIndex)} className="rounded-lg text-rose-500 hover:bg-rose-50 px-3 py-1.5 text-xs font-bold">Xoá</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <span className="rounded-md bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">{activity.time}</span>
                        <div className="min-w-0 flex-1">
                          <strong className="block text-sm font-bold text-slate-900 dark:text-white">{activity.title}</strong>
                          {activity.location && <span className="block text-xs text-slate-500">📍 {activity.location}</span>}
                          {activity.description && <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{activity.description}</p>}
                        </div>
                        <button type="button" onClick={() => setEditingIdx(id)} className="rounded-lg px-2 py-1 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:bg-blue-50 dark:hover:bg-blue-950/30">Sửa</button>
                      </div>
                    )}
                  </div>
                );
              })}
              {day.activities.length === 0 && (
                <p className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-4 text-center text-xs text-slate-500">
                  Chưa có hoạt động nào cho ngày này.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}