import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HeroVisual from './HeroVisual';

export default function HeroSection() {
  const { t } = useTranslation();

  const scrollToNextSection = () => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-24"
    >
      <div className="grid items-center gap-12 lg:grid-cols-2 max-w-[1200px] mx-auto w-full">
        {/* Left column */}
        <div className="space-y-6 text-center lg:text-left">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            TravelMind
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
            {t('home.heroTitle1')}{' '}
            <span className="text-sky-700 dark:text-sky-400">
              {t('home.heroTitle2')}
            </span>
          </h1>

          <p className="max-w-lg mx-auto lg:mx-0 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('home.heroDesc')}
          </p>

          <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
            <Link
              to="/recommendations"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {t('home.ctaPrimary')}
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M5 10h10M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              to="/trips/new"
              className="inline-flex items-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t('home.ctaSecondary', 'Tạo chuyến đi')}
            </Link>
          </div>
        </div>

        {/* Right column */}
        <div className="w-full flex justify-center">
          <HeroVisual />
        </div>
      </div>

      <div className="mt-16 flex justify-center">
        <button
          type="button"
          onClick={scrollToNextSection}
          className="text-xs font-medium text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
          title={t('home.scrollDown')}
        >
          ↓ {t('home.scrollDown')}
        </button>
      </div>
    </section>
  );
}