import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('common.theme')}
      title={isDark ? t('common.themeLight') : t('common.themeDark')}
      className={`group relative flex h-8 w-20 items-center rounded-full p-1 border transition-all duration-500 cursor-pointer overflow-hidden select-none shrink-0 shadow-inner ${
        isDark
          ? 'border-indigo-900/60 bg-gradient-to-r from-[#091122] via-[#0d1b38] to-[#162a52]'
          : 'border-sky-300/80 bg-gradient-to-r from-sky-400 via-sky-300 to-blue-400'
      }`}
    >
      {/* ☀️ DAY TIME DECORATIONS: Clouds floating on the right */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          isDark ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        {/* Large Fluffy Bottom Cloud */}
        <svg
          className="absolute right-1 -bottom-0.5 w-9 h-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 40 24"
          fill="currentColor"
        >
          <path d="M12 20h20a6 6 0 0 0 0-12 7.5 7.5 0 0 0-14.5-2A6 6 0 0 0 12 20z" />
        </svg>

        {/* Small Airy Top Cloud */}
        <svg
          className="absolute right-6 top-1 w-6 h-3.5 text-white/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-transform duration-700 group-hover:-translate-x-0.5"
          viewBox="0 0 40 24"
          fill="currentColor"
        >
          <path d="M12 20h20a6 6 0 0 0 0-12 7.5 7.5 0 0 0-14.5-2A6 6 0 0 0 12 20z" />
        </svg>
      </div>

      {/* 🌙 NIGHT TIME DECORATIONS: Stars & Sparkles twinkling on the left */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          isDark ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        {/* Golden 4-point Star */}
        <svg
          className="absolute left-2.5 top-1.5 w-3 h-3 text-amber-200 animate-pulse drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" />
        </svg>

        {/* Cyan Mini Star */}
        <svg
          className="absolute left-6.5 top-3.5 w-2 h-2 text-cyan-200 drop-shadow-[0_0_3px_rgba(165,243,252,0.9)]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" />
        </svg>

        {/* Distant Star Dots */}
        <div className="absolute left-4 bottom-1.5 w-1 h-1 rounded-full bg-yellow-100 shadow-[0_0_3px_#fef08a]" />
        <div className="absolute left-8 bottom-2 w-1 h-1 rounded-full bg-cyan-200/90" />
      </div>

      {/* 🔘 SLIDING KNOB (Sun / Moon) */}
      <div
        className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transform transition-transform duration-500 ease-out shadow-md ${
          isDark
            ? 'translate-x-[46px] bg-slate-900 ring-2 ring-cyan-300/60 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
            : 'translate-x-0 bg-amber-400 ring-2 ring-amber-200/90 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
        }`}
      >
        {!isDark ? (
          /* Radiant Golden Sun */
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" fill="currentColor" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="M4.93 4.93l1.41 1.41" />
            <path d="M17.66 17.66l1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="M6.34 17.66l-1.41 1.41" />
            <path d="M19.07 4.93l-1.41 1.41" />
          </svg>
        ) : (
          /* Glowing Crescent Moon */
          <svg
            viewBox="0 0 24 24"
            className="w-3.5 h-3.5 text-cyan-300 drop-shadow-[0_0_4px_rgba(34,211,238,0.8)]"
            fill="currentColor"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </div>
    </button>
  );
}