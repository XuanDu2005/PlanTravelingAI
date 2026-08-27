export type FloatingCardType = 'weather' | 'personalized' | 'hotel' | 'realtime' | 'food';

interface FloatingInfoCardProps {
  type: FloatingCardType;
  title: string;
  subtitle: string;
  className?: string;
  animationClass?: string;
}

export default function FloatingInfoCard({
  type,
  title,
  subtitle,
  className = '',
  animationClass = 'animate-float-card-1',
}: FloatingInfoCardProps) {
  const renderIcon = () => {
    switch (type) {
      case 'weather':
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-cyan-300 border border-blue-100 dark:border-blue-800/40">
            {/* Clean Sun with Rays SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          </div>
        );
      case 'personalized':
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-100 dark:border-rose-800/40">
            {/* Clean Heart Outline SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
        );
      case 'hotel':
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40">
            {/* Clean Hotel Building Outline SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
              <path d="M6 12H4a2 2 0 0 0-2 2v8h4" />
              <path d="M18 9h2a2 2 0 0 1 2 2v11h-4" />
              <path d="M10 6h4" />
              <path d="M10 10h4" />
              <path d="M10 14h4" />
              <path d="M10 18h4" />
            </svg>
          </div>
        );
      case 'realtime':
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-100 dark:border-sky-800/40">
            {/* Clean Lightning Bolt SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
        );
      case 'food':
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-100 dark:border-purple-800/40">
            {/* Clean Utensils & Food SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
              <path d="M15 2v20" />
              <path d="M5 2v20" />
              <path d="M2 2h6v6a3 3 0 0 1-6 0V2z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div
      className={`glass-card absolute z-30 rounded-2xl px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-white/90 dark:border-slate-800/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${animationClass} ${className}`}
    >
      <div className="flex items-center gap-3">
        {renderIcon()}
        <div className="text-left">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
            {title}
          </h4>
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-300 mt-0.5 leading-snug">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
