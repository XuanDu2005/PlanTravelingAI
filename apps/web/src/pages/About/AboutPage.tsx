import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Compass, 
  BrainCircuit, 
  ShieldCheck, 
  HeartHandshake, 
  Clock, 
  Globe2, 
  SlidersHorizontal,
  Navigation,
  ArrowRight,
  SunMedium,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

const values = [
  {
    number: '01',
    title: 'Thấu hiểu cá nhân hóa',
    description: 'Mỗi hành trình bắt đầu từ sự lắng nghe sâu sắc về sở thích, nhịp độ và phong cách du lịch riêng biệt của bạn.',
    icon: HeartHandshake,
    accent: 'from-blue-600 to-indigo-600',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-cyan-400 border-blue-200 dark:border-blue-800',
    highlight: 'Học hỏi theo phong cách riêng'
  },
  {
    number: '02',
    title: 'Công nghệ AI vị nhân sinh',
    description: 'AI thế hệ mới xử lý hàng triệu biến số phức tạp về thời tiết, di chuyển và lưu trú để mang lại trải nghiệm mượt mà nhất.',
    icon: BrainCircuit,
    accent: 'from-cyan-500 to-blue-600',
    badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    highlight: 'Tối ưu lộ trình & ngân sách'
  },
  {
    number: '03',
    title: 'Tin cậy & Minh bạch',
    description: 'Dữ liệu điểm đến, giá vé và thời tiết được xác thực liên tục. Cam kết không phí ẩn, bảo mật dữ liệu hành trình tuyệt đối.',
    icon: ShieldCheck,
    accent: 'from-purple-600 to-pink-500',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    highlight: 'Xác thực thời gian thực 100%'
  },
];

const stats = [
  { 
    value: '95%', 
    label: 'Thời gian lập kế hoạch giảm', 
    sub: 'Tạo lịch trình chỉ trong 30s',
    tone: 'from-blue-600 to-cyan-500',
    icon: Clock
  },
  { 
    value: '24/7', 
    label: 'Đồng hành AI suốt hành trình', 
    sub: 'Giải đáp & cảnh báo thời tiết',
    tone: 'from-blue-500 to-indigo-600',
    icon: Compass
  },
  { 
    value: '100+', 
    label: 'Điểm đến & hành trình chuẩn', 
    sub: 'Được khảo sát thực tế',
    tone: 'from-indigo-600 to-purple-600',
    icon: Globe2
  },
  { 
    value: '100%', 
    label: 'Lịch trình cá nhân hóa', 
    sub: 'Khớp trọn vẹn mọi sở thích',
    tone: 'from-cyan-500 to-emerald-500',
    icon: SlidersHorizontal
  },
];

export default function AboutPage() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 pt-28 sm:pt-32 pb-16 space-y-16 select-none font-sans">
      
      {/* ========================================================================= */}
      {/* 1. HERO STORY BANNER (3D GLASSMORPHIC TRAVEL AI SHOWCASE) */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-[36px] sm:rounded-[44px] border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-blue-50/40 to-slate-50 dark:from-[#0B1528] dark:via-[#09101F] dark:to-[#050B18] shadow-[0_20px_60px_rgba(37,99,235,0.08)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.6)] p-6 sm:p-10 lg:p-14">
        
        {/* Background Ambient Glows & Flight Paths */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/15 dark:bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/15 dark:bg-indigo-600/20 blur-3xl pointer-events-none" />
        
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.07] pointer-events-none" viewBox="0 0 1200 600" fill="none">
          <path d="M50,450 C300,100 800,500 1150,150" stroke="currentColor" strokeWidth="2.5" strokeDasharray="10 8" />
          <circle cx="50" cy="450" r="6" fill="currentColor" />
          <circle cx="1150" cy="150" r="6" fill="currentColor" />
        </svg>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 dark:bg-blue-900/50 border border-blue-200/80 dark:border-blue-700/60 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:text-cyan-300 shadow-xs backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span>Câu chuyện TravelMind</span>
            </div>

            <h1 className="font-outfit text-3xl sm:text-5xl lg:text-[54px] font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              Thế giới vô cùng rộng lớn. <br />
              <span className="font-display italic font-normal tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300 bg-clip-text text-transparent drop-shadow-xs">
                Hành trình là của riêng bạn.
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              {/* Primary 3D Liquid Glass Button: Bắt đầu hành trình */}
              <Link
                to="/create-trip"
                className="group relative inline-flex items-center justify-between gap-5 rounded-full bg-gradient-to-b from-[#4387f6] via-[#2563eb] to-[#1a4ecb] pl-6 pr-2.5 py-2.5 text-white border border-white/60 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.75),inset_0_-2.5px_4px_rgba(15,23,42,0.35),0_12px_28px_-6px_rgba(37,99,235,0.38)] backdrop-blur-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-[inset_0_2px_3px_rgba(255,255,255,0.9),inset_0_-3px_5px_rgba(15,23,42,0.4),0_16px_36px_-6px_rgba(37,99,235,0.5)] active:scale-95 cursor-pointer overflow-hidden"
              >
                {/* Lớp phản quang vòm kính bong bóng phía trên (iOS Bubble Top Dome Reflection) */}
                <span className="pointer-events-none absolute inset-x-2.5 top-1 h-[45%] rounded-full bg-gradient-to-b from-white/55 via-white/15 to-transparent blur-[0.4px]" />
                
                {/* Lớp phản quang ánh sáng mép đáy (iOS Bubble Bottom Rim Reflection) */}
                <span className="pointer-events-none absolute inset-x-4 bottom-1 h-[25%] rounded-full bg-gradient-to-t from-white/30 to-transparent blur-[0.5px]" />

                {/* Cụm Sparkle Pha Lê & Chữ */}
                <div className="flex items-center gap-3 relative z-10">
                  <div className="relative flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.95)] drop-shadow-[0_0_15px_rgba(147,197,253,0.8)] transition-transform duration-500 group-hover:scale-110"
                      viewBox="0 0 32 32"
                      fill="currentColor"
                    >
                      <path d="M11 9C11 14 8 16 3 17C8 18 11 20 11 25C11 20 14 18 19 17C14 16 11 14 11 9Z" className="animate-pulse" />
                      <path d="M20 3C20 6.5 18 8 15 8.8C18 9.5 20 11 20 14.5C20 11 22 9.5 25 8.8C22 8 20 6.5 20 3Z" />
                      <path d="M24 18C24 20.8 22.5 22 20 22.6C22.5 23.2 24 24.5 24 27.2C24 24.5 25.5 23.2 28 22.6C25.5 22 24 20.8 24 18Z" />
                    </svg>
                  </div>
                  
                  <span className="font-bold text-sm sm:text-base tracking-tight text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.25)]">
                    Bắt đầu hành trình
                  </span>
                </div>

                {/* Nút tròn kính mờ bong bóng chứa mũi tên */}
                <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-white/35 to-white/10 border border-white/70 shadow-[inset_0_1px_2px_rgba(255,255,255,0.85),0_2px_8px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-300 group-hover:scale-110 group-hover:from-white/50 group-hover:to-white/20 group-hover:translate-x-0.5 overflow-hidden">
                  <span className="pointer-events-none absolute inset-x-1 top-0.5 h-[42%] rounded-full bg-gradient-to-b from-white/70 to-transparent" />
                  <ArrowRight className="relative z-10 w-4 h-4 text-white drop-shadow-xs" />
                </div>
              </Link>

              {/* Secondary 3D Frosted Crystal Glass Button: Giá trị cốt lõi */}
              <a
                href="#our-values"
                className="group relative inline-flex items-center justify-between gap-4 rounded-full bg-gradient-to-b from-white/95 via-white/85 to-slate-100/90 dark:from-slate-800/95 dark:via-slate-800/85 dark:to-slate-900/90 pl-6 pr-2.5 py-2.5 text-slate-800 dark:text-white border border-white/90 dark:border-slate-700/80 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.06),0_10px_25px_-5px_rgba(0,0,0,0.08)] backdrop-blur-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-[inset_0_2px_3px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.08),0_14px_30px_-5px_rgba(0,0,0,0.12)] active:scale-95 cursor-pointer overflow-hidden"
              >
                {/* Lớp phản quang vòm kính bong bóng phía trên */}
                <span className="pointer-events-none absolute inset-x-2.5 top-1 h-[45%] rounded-full bg-gradient-to-b from-white/70 via-white/20 to-transparent blur-[0.4px] dark:from-white/20 dark:via-white/5" />
                
                {/* Lớp phản quang ánh sáng mép đáy */}
                <span className="pointer-events-none absolute inset-x-4 bottom-1 h-[25%] rounded-full bg-gradient-to-t from-white/40 to-transparent blur-[0.5px] dark:from-white/10" />

                <div className="flex items-center gap-2.5 relative z-10">
                  <span className="font-bold text-sm sm:text-base tracking-tight text-slate-800 dark:text-slate-100">
                    Giá trị cốt lõi
                  </span>
                </div>

                {/* Nút tròn kính mờ bong bóng chứa mũi tên xuống */}
                <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/90 dark:bg-slate-700/90 border border-slate-200/80 dark:border-slate-600 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-300 group-hover:scale-110 group-hover:translate-y-0.5 overflow-hidden">
                  <span className="text-slate-600 dark:text-slate-200 text-xs font-bold">▾</span>
                </div>
              </a>
            </div>
          </div>

          {/* Right Visual Column (Compact Itinerary Card + Detailed GPS Route Map below) */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center space-y-4 p-1">
            
            {/* 1. Compact Central Itinerary AI Card */}
            <div className="relative z-10 w-full max-w-[390px] rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-[0_20px_50px_rgba(37,99,235,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-transform duration-300 hover:scale-[1.01] space-y-3">
              
              {/* Row 1: Header (Icon + Title + 99.8% Fit Badge) */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30">
                    <Navigation className="w-5 h-5 -rotate-45" fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                      <span>Hà Nội</span>
                      <span className="text-slate-400">→</span>
                      <span>Tokyo</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      5 ngày 4 đêm
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-1 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 leading-tight">
                      99.8% Fit
                    </div>
                    <div className="text-[8px] text-slate-400 font-medium">
                      AI Match Score
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Flight Route Box (Dải lộ trình bay HAN - HND) */}
              <div className="rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 p-2.5 flex items-center justify-between relative overflow-hidden">
                {/* Origin */}
                <div className="flex items-center gap-1.5 z-10">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-cyan-300">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-slate-900 dark:text-white leading-tight">HAN</div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">Hà Nội</div>
                  </div>
                </div>

                {/* Dotted Flight Trail with Plane */}
                <div className="flex-1 mx-2 flex items-center justify-center relative">
                  <div className="w-full border-t-2 border-dashed border-blue-400/60 dark:border-blue-500/50 relative flex items-center justify-center">
                    <div className="absolute -top-2 px-1 bg-slate-50 dark:bg-slate-800">
                      <svg className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 rotate-90" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Destination */}
                <div className="flex items-center gap-1.5 z-10 text-right">
                  <div>
                    <div className="text-[11px] font-black text-slate-900 dark:text-white leading-tight">HND</div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">Tokyo</div>
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-cyan-300">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Row 3: Weather Bar (Dự báo thời tiết) */}
              <div className="rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 px-3 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <SunMedium className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-bold text-[11px] text-slate-900 dark:text-white">22°C</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="font-medium text-[11px] text-slate-700 dark:text-slate-300">Nắng đẹp</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  <span>Dự báo tại Tokyo</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>

              {/* Row 4: Highlight Destination Card (Điểm nổi bật) */}
              <div className="rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 p-2.5 flex items-center gap-2.5 shadow-xs">
                <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden shadow-xs">
                  <img
                    src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=300&q=80"
                    alt="Tokyo Tower"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider block">
                    ĐIỂM NỔI BẬT
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Shibuya Sky & Omoide Yokocho
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-1 mt-0.5 font-normal">
                    Ngắm toàn cảnh Tokyo từ trên cao và dạo bước con phố ẩm thực...
                  </p>
                  
                  <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-1 font-medium">
                    <span>🕒 Gợi ý buổi tối</span>
                    <span>📍 Shibuya, Tokyo</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Row 5: Footer Branding */}
              <div className="pt-0.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3 h-3 text-blue-500 dark:text-cyan-400" />
                <span>Lịch trình được cá nhân hóa bởi </span>
                <span className="font-bold text-blue-600 dark:text-cyan-400">TravelMind AI</span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. KEY METRICS BENTO GRID (THỐNG KÊ ẤN TƯỢNG & ĐỘNG LỰC PHÁT TRIỂN) */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="group relative rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-7 text-left shadow-sm hover:shadow-xl transition-all duration-300 backdrop-blur-xl hover:-translate-y-1 overflow-hidden"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.tone}`} />
              
              <div className="flex items-center justify-between mb-4">
                <div className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${stat.tone} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                </div>
              </div>

              <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                {stat.label}
              </div>
              <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-1">
                {stat.sub}
              </div>
            </div>
          );
        })}
      </section>

      {/* ========================================================================= */}
      {/* 3. CORE VALUES (3 GIÁ TRỊ CỐT LÕI - 1 LỜI CAM KẾT BỀN VỮNG) */}
      {/* ========================================================================= */}
      <section id="our-values" className="space-y-6 text-left">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 dark:bg-blue-900/40 border border-blue-200/80 dark:border-blue-700/60 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-cyan-300 shadow-xs">
            ✨ Giá trị cốt lõi
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-normal mt-3">
            3 giá trị, 1 lời cam kết bền vững
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl font-normal">
            Những nguyên tắc dẫn lối cho mọi thuật toán, giao diện và trải nghiệm mà TravelMind kiến tạo.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {values.map((val) => {
            const Icon = val.icon;
            return (
              <div
                key={val.number}
                className="group relative rounded-[32px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-8 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1.5"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${val.accent}`} />
                
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-xs transition-transform duration-300 group-hover:scale-110">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-bold text-slate-200 dark:text-slate-700">
                      {val.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    {val.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed font-normal">
                    {val.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${val.badgeColor}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{val.highlight}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW IT WORKS (QUY TRÌNH 4 BƯỚC THÔNG MINH - TRỰC QUAN & DỄ HIỂU) */}
      {/* ========================================================================= */}
      <section className="rounded-[40px] border border-slate-200/90 dark:border-slate-800 bg-gradient-to-b from-slate-50/90 via-white/80 to-blue-50/40 dark:from-[#0B1528] dark:via-[#09101F] dark:to-[#050B18] p-6 sm:p-10 lg:p-14 text-left relative overflow-hidden shadow-xl">
        
        {/* Background Ambient Glows & Flight Trail */}
        <div className="absolute top-0 right-0 h-96 w-96 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-96 w-96 bg-cyan-400/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 dark:bg-blue-900/50 border border-blue-200/80 dark:border-blue-700/60 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:text-cyan-300 shadow-xs backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span>Quy trình tinh gọn</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mt-3">
            Từ ý tưởng đến hành trình hoàn hảo
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            Hệ thống AI xử lý hàng triệu dữ liệu để tạo nên chuyến đi độc bản dành riêng cho bạn chỉ trong 4 bước đơn giản.
          </p>
        </div>

        {/* 4 Interactive Visual Stage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          
          {/* STEP 1: Lắng nghe & Khởi tạo */}
          <div className="group relative rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
            
            <div>
              {/* Header: Step Number & Title */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-sm shadow-md shadow-blue-500/25">
                  01
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800/60">
                  Khởi tạo
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Lắng nghe & Khám phá
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Bạn chỉ cần nhập điểm đến, sở thích ẩm thực và ngân sách mong muốn.
              </p>

              {/* Visual Mockup Widget: Selection Tags */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Thông tin chuyến đi:</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-cyan-300">
                    🏝️ Phú Quốc
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                    💰 8-10 Triệu
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-purple-100/70 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                    📅 3 Ngày 2 Đêm
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-cyan-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Thu thập sở thích tức thì</span>
            </div>
          </div>

          {/* STEP 2: Phân tích AI đa chiều */}
          <div className="group relative rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-extrabold text-sm shadow-md shadow-cyan-500/25">
                  02
                </div>
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-200 dark:border-cyan-800/60">
                  Phân tích AI
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Phân tích đa chiều bằng AI
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                AI đối chiếu giá vé, khách sạn và dự báo thời tiết để tìm phương án tối ưu nhất.
              </p>

              {/* Visual Mockup Widget: Multi-source Scan */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span>Nguồn dữ liệu:</span>
                  <span className="text-emerald-500 text-[10px] animate-pulse">● Đang đối chiếu</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Chuyến bay tối ưu
                    </span>
                    <span className="font-bold text-blue-600 dark:text-cyan-400">1.450k</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Khách sạn 4★ trung tâm
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">820k/đêm</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Thời tiết dự báo
                    </span>
                    <span className="font-bold text-amber-500">26°C – Nắng nhẹ</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Xử lý trong 2.8 giây</span>
            </div>
          </div>

          {/* STEP 3: Tối ưu hóa lịch trình */}
          <div className="group relative rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-sm shadow-md shadow-indigo-500/25">
                  03
                </div>
                <span className="text-xs font-bold text-indigo-600 dark:text-purple-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800/60">
                  Tối ưu hóa
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Kiến tạo lịch trình thông minh
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Sắp xếp khung giờ di chuyển khoa học, cân đối giữa khám phá và nghỉ ngơi.
              </p>

              {/* Visual Mockup Widget: Day Timeline */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Lộ trình Ngày 1:</div>
                <div className="space-y-1 text-[10px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600 dark:text-purple-400">08:30</span>
                    <span>Đón sân bay & nhận phòng</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600 dark:text-purple-400">16:30</span>
                    <span>Sunset Sanato ngắm hoàng hôn</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-purple-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Tiết kiệm 45% thời gian di chuyển</span>
            </div>
          </div>

          {/* STEP 4: Đồng hành thời gian thực */}
          <div className="group relative rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-600 to-pink-500" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white font-extrabold text-sm shadow-md shadow-purple-500/25">
                  04
                </div>
                <span className="text-xs font-bold text-purple-600 dark:text-pink-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800/60">
                  Đồng hành
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Trợ lý AI hỗ trợ 24/7
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Định vị GPS, gợi ý quán ngon xung quanh và tự động điều chỉnh khi trời mưa.
              </p>

              {/* Visual Mockup Widget: Live AI Notification Bubble */}
              <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Trợ lý AI TravelMind:</span>
                </div>
                <p className="text-[10px] text-slate-700 dark:text-slate-300 italic">
                  "Gợi ý: Quán hải sản Làng Chài cách bạn 250m đang có ưu đãi 15%!"
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] font-semibold text-purple-600 dark:text-pink-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Chăm sóc trọn vẹn từng bước đi</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. LUXURY CLOSING CTA BOX (KHỞI ĐẦU CHUYẾN ĐI MƠ ƯỚC) */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-[40px] sm:rounded-[48px] bg-gradient-to-r from-[#0E2A47] via-[#1E3A8A] to-[#0284C7] p-8 sm:p-14 lg:p-16 text-center text-white shadow-2xl border border-blue-400/30">
        
        {/* Background Overlay Travel Image with Depth */}
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80"
          alt="Travel Horizon"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay scale-105 pointer-events-none"
        />
        
        {/* Ambient Light Blooms & Compass Watermark */}
        <div className="absolute -top-10 -right-10 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          
          {/* Top Pill Feature Badges */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>⚡ Tạo lịch trình trong 30s</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md shadow-sm">
              <span>🎯 Khớp 100% sở thích</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md shadow-sm">
              <span>🆓 Miễn phí 100%</span>
            </span>
          </div>

          <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            Sẵn sàng cho chuyến phiêu lưu tiếp theo?
          </h3>
          
          <p className="text-xs sm:text-base text-blue-100/90 leading-relaxed font-normal max-w-xl mx-auto">
            Hơn 10.000+ du khách đã tạo nên những kỷ niệm khó quên cùng TravelMind. Hãy để AI đồng hành cùng bạn ngay hôm nay!
          </p>

          {/* Liquid Glass Apple 3D CTA Button */}
          <div className="pt-4 flex items-center justify-center">
            <Link
              to="/create-trip"
              className="group relative inline-flex items-center justify-between gap-6 rounded-full bg-gradient-to-b from-[#4387f6] via-[#2563eb] to-[#1a4ecb] pl-8 pr-3.5 py-3 text-white border border-white/70 shadow-[inset_0_2px_3px_rgba(255,255,255,0.85),inset_0_-3px_5px_rgba(15,23,42,0.4),0_20px_40px_-8px_rgba(37,99,235,0.6)] backdrop-blur-2xl transition-all duration-300 hover:scale-105 hover:shadow-[inset_0_2.5px_4px_rgba(255,255,255,0.95),inset_0_-3.5px_6px_rgba(15,23,42,0.45),0_25px_50px_-8px_rgba(37,99,235,0.7)] active:scale-95 cursor-pointer overflow-hidden"
            >
              {/* Lớp phản quang vòm kính bong bóng phía trên */}
              <span className="pointer-events-none absolute inset-x-3 top-1 h-[45%] rounded-full bg-gradient-to-b from-white/60 via-white/20 to-transparent blur-[0.4px]" />
              
              {/* Lớp phản quang ánh sáng mép đáy */}
              <span className="pointer-events-none absolute inset-x-5 bottom-1 h-[25%] rounded-full bg-gradient-to-t from-white/35 to-transparent blur-[0.5px]" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="relative flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.95)] drop-shadow-[0_0_15px_rgba(147,197,253,0.8)] transition-transform duration-500 group-hover:scale-110"
                    viewBox="0 0 32 32"
                    fill="currentColor"
                  >
                    <path d="M11 9C11 14 8 16 3 17C8 18 11 20 11 25C11 20 14 18 19 17C14 16 11 14 11 9Z" className="animate-pulse" />
                    <path d="M20 3C20 6.5 18 8 15 8.8C18 9.5 20 11 20 14.5C20 11 22 9.5 25 8.8C22 8 20 6.5 20 3Z" />
                    <path d="M24 18C24 20.8 22.5 22 20 22.6C22.5 23.2 24 24.5 24 27.2C24 24.5 25.5 23.2 28 22.6C25.5 22 24 20.8 24 18Z" />
                  </svg>
                </div>
                
                <span className="font-bold text-base sm:text-lg tracking-tight text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.3)]">
                  Tạo lịch trình ngay
                </span>
              </div>

              {/* Nút tròn kính mờ bong bóng chứa mũi tên */}
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-white/40 to-white/15 border border-white/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_2px_8px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 group-hover:scale-110 group-hover:from-white/55 group-hover:to-white/25 group-hover:translate-x-1 overflow-hidden">
                <span className="pointer-events-none absolute inset-x-1 top-0.5 h-[42%] rounded-full bg-gradient-to-b from-white/75 to-transparent" />
                <ArrowRight className="relative z-10 w-5 h-5 text-white drop-shadow-xs" />
              </div>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
