import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tripService } from '@/services';
import { Trip } from '@/types';
import { formatBudgetLabel } from '@/utils/format';
import TripWorkspace from '@/components/trip/TripWorkspace';
import { useAuth } from '@/store/AuthContext';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

export default function TripDetailPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(false);

  const cacheKey = user && id ? `tm_offline_trip_${user.id}_${id}` : null;

  const remember = (data: Trip) => {
    if (!cacheKey) return;
    try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch { /* storage can be unavailable */ }
  };

  const restore = (): Trip | null => {
    if (!cacheKey) return null;
    try { const raw = localStorage.getItem(cacheKey); return raw ? JSON.parse(raw) as Trip : null; } catch { return null; }
  };

  useEffect(() => {
    if (!id) return;
    setTrip(null);
    setError(false);
    loadTrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  async function loadTrip(): Promise<void> {
    if (!id) return;
    try {
      const data = await tripService.byId(id);
      setTrip(data); setOffline(false); remember(data);
    } catch {
      const cached = restore();
      if (cached) { setTrip(cached); setOffline(true); } else setError(true);
    }
  }


  if (error) return <ErrorState message={t('tripDetail.error')} />;
  if (!trip) return <LoadingState message={t('tripDetail.loading')} />;

  const days = trip.itinerary?.content?.days?.length ?? 0;

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-4 pb-20 pt-20 sm:px-8 sm:pt-22">
      {offline && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-800 backdrop-blur-md dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          <strong>📴 Chế độ ngoại tuyến:</strong> Bạn đang xem phiên bản hành trình được lưu gần nhất. Các thao tác chỉnh sửa sẽ hoạt động lại khi có kết nối mạng.
        </div>
      )}

      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] border border-blue-100 dark:border-slate-800 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-sky-50/70 dark:from-[#0B1528] dark:via-[#09101F] dark:to-[#070B16] shadow-xl p-6 sm:p-8 lg:p-10">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-blue-500/15 dark:bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-cyan-400/15 dark:bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 dark:border-slate-700 dark:bg-slate-800/90 px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:border-blue-400 hover:text-blue-600 dark:hover:text-cyan-300 transition cursor-pointer backdrop-blur-md"
            >
              <span>←</span>
              <span>{t('tripDetail.back').replace('← ', '')}</span>
            </button>

            <Link
              to="/trips"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 dark:border-slate-700 dark:bg-slate-800/80 px-4 py-1.5 text-xs font-bold text-blue-600 dark:text-cyan-300 shadow-xs hover:border-blue-400 transition"
            >
              <span>🧳</span>
              <span>{t('tripDetail.allTrips')}</span>
            </Link>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3.5 py-1 text-xs font-bold text-white shadow-md shadow-blue-500/20">
              <span>{trip.destination}</span>
            </div>

            <h1 className="font-outfit text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {trip.itinerary?.title ?? t('tripDetail.defaultTitle', { destination: trip.destination })}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium flex flex-wrap items-center gap-3">
              <span>{formatRange(trip.startDate, trip.endDate)}</span>
              <span>•</span>
              <span>{t('tripDetail.days', { count: days })}</span>
              <span>•</span>
              <span>{t('tripDetail.travelers', { count: trip.travelers })}</span>
            </p>
          </div>

          {/* Quick Stat Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <StatChip label={t('tripDetail.statDestination')} value={trip.destination} icon={<svg viewBox="0 0 24 24" className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>} />
            <StatChip label={t('tripDetail.statBudget')} value={formatBudgetLabel(trip.budget, t)} icon={<svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>} />
            <StatChip label={t('tripDetail.statTravelers')} value={`${trip.travelers} người`} icon={<svg viewBox="0 0 24 24" className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
            <StatChip label={t('tripDetail.statStatus')} value={t(`status.${trip.status}`)} icon={<svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
          </div>

          {trip.preferences && (
            <div className="rounded-2xl border border-blue-100/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-4 text-xs backdrop-blur-md">
              <span className="font-bold text-blue-700 dark:text-cyan-300">Sở thích & Yêu cầu:</span>
              <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">{trip.preferences}</p>
            </div>
          )}
        </div>
      </section>

      {/* Main Workspace Area */}
      <TripWorkspace
        trip={trip}
        onChange={(next) => { setTrip(next); remember(next); }}
        onReload={loadTrip}
      />
    </div>
  );
}

function StatChip({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-3.5 shadow-xs backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">{label}</span>
      </div>
      <p className="mt-1 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">{value}</p>
    </div>
  );
}

function formatRange(start: string, end: string) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('vi-VN', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  return `${fmt(start)} - ${fmt(end)}`;
}
