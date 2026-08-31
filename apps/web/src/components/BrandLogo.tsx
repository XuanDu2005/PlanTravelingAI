import { Link } from 'react-router-dom';

interface BrandLogoProps {
  to?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  adminBadge?: boolean;
  className?: string;
}

export default function BrandLogo({
  to = '/',
  size = 'md',
  showText = true,
  adminBadge = false,
  className = '',
}: BrandLogoProps) {
  const emblemSizes = {
    sm: 'h-8 w-8 rounded-lg',
    md: 'h-9 w-9 rounded-xl',
    lg: 'h-11 w-11 rounded-2xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      <img
        src="/logo.png"
        alt="TravelMind"
        className={`${emblemSizes[size]} object-cover shrink-0 transition-transform duration-300 group-hover:scale-105`}
        draggable={false}
      />

      {showText && (
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`font-black tracking-tight text-slate-900 dark:text-white leading-none ${textSizes[size]}`}
          >
            Travel<span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Mind</span>
          </span>

          {adminBadge && (
            <span className="rounded-md bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800/80 px-1.5 py-0.5 text-[10px] font-extrabold text-blue-700 dark:text-cyan-300 uppercase tracking-wider leading-none">
              Admin
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return content;
}