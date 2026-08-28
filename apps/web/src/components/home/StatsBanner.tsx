import { useState } from 'react';

interface MetricItem {
  id: string;
  icon: string;
  value: string;
  label: string;
  growth: string;
  detail: string;
}

const STATS_DATA: MetricItem[] = [
  {
    id: 'users',
    icon: '👥',
    value: '10.000+',
    label: 'Người dùng tin tưởng',
    growth: '+142% tháng này',
    detail: 'Hơn 10.000 khách du lịch cá nhân & doanh nghiệp đã lên lịch trình thành công.',
  },
  {
    id: 'trips',
    icon: '✈️',
    value: '25.000+',
    label: 'Chuyến đi được tạo',
    growth: 'Tự động hóa 100%',
    detail: '25.000+ tour nội địa & quốc tế đã được may đo tối ưu ngân sách bởi AI.',
  },
  {
    id: 'destinations',
    icon: '🌐',
    value: '100+',
    label: 'Điểm đến toàn cầu',
    growth: 'Mở rộng liên tục',
    detail: 'Bao phủ 100+ quốc gia và vùng lãnh thổ với dữ liệu thời tiết & giá vé trực tiếp.',
  },
  {
    id: 'rating',
    icon: '⭐',
    value: '4.9/5',
    label: 'Đánh giá hài lòng',
    growth: '98% 5-sao',
    detail: 'Dựa trên hơn 8.500 lượt đánh giá tích cực từ cộng đồng du lịch thông minh.',
  },
];

export default function StatsBanner() {
  const [selectedStat, setSelectedStat] = useState<MetricItem | null>(null);

  return (
    <section className="my-10 sm:my-16 select-none">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#060c1a] via-[#0b1730] to-[#081124] p-6 sm:p-10 lg:p-12 shadow-[0_20px_50px_rgba(2,132,199,0.15)] border border-slate-700/60">
        
        {/* Background Constellations & Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-1/4 h-1.5 w-1.5 rounded-full bg-cyan-300 opacity-70 animate-ping" />
          <div className="absolute bottom-6 right-1/3 h-2 w-2 rounded-full bg-blue-400 opacity-60" />
          <div className="absolute top-1/2 left-8 h-1 w-1 rounded-full bg-white opacity-40" />
          <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-blue-600/25 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-purple-600/25 blur-3xl" />
          
          {/* Orbital Line Grid */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full border border-sky-500/15 pointer-events-none" />
          <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full border border-dashed border-cyan-400/20 pointer-events-none" />
        </div>

        {/* Top Header inside Stats */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 sm:pb-8 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-cyan-300">
              Chỉ số tăng trưởng thời gian thực (Live Metrics)
            </span>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            * Nhấn vào từng chỉ số để xem chi tiết
          </div>
        </div>

        {/* 4 Interactive Stats Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-6 sm:pt-8">
          {STATS_DATA.map((stat) => {
            const isSelected = selectedStat?.id === stat.id;
            return (
              <div
                key={stat.id}
                onClick={() => setSelectedStat(isSelected ? null : stat)}
                className={`group relative rounded-2xl p-4 sm:p-5 border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/20 border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.3)] scale-102'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/70 hover:border-slate-700/90 hover:-translate-y-1'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    {stat.growth}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-black tracking-tight text-white font-outfit drop-shadow-sm">
                    {stat.value}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">
                    {stat.label}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-cyan-400 font-bold opacity-80 group-hover:opacity-100">
                  <span>{isSelected ? 'Đang hiển thị ▲' : 'Xem phân tích ▼'}</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expandable Detail Drawer Display */}
        {selectedStat && (
          <div className="relative z-10 mt-6 rounded-2xl bg-blue-950/70 border border-cyan-500/40 p-5 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-left">
              <span className="text-3xl">{selectedStat.icon}</span>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{selectedStat.label}:</span>
                  <span className="text-cyan-300 font-extrabold">{selectedStat.value}</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">{selectedStat.detail}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStat(null)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white border border-slate-700 transition"
            >
              Đóng lại ✕
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
