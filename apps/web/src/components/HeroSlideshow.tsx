import { useEffect, useState } from 'react';

export type Slide = { src: string };

type Props = {
  slides: Slide[];
  interval?: number;
  /**
   * Optional caption rendered bottom-left (above the dots). When provided
   * the carousel shows a small overlay; when omitted the slide takes the
   * full visual area.
   */
  caption?: string;
};

export default function HeroSlideshow({
  slides,
  interval = 4000,
  caption,
}: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [paused, slides.length, interval]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  if (slides.length === 0) return null;

  return (
    <div
      className="relative h-72 overflow-hidden rounded-3xl sm:h-80"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured destinations"
    >
      {slides.map((slide, i) => (
        <img
          key={slide.src}
          src={slide.src}
          alt=""
          aria-hidden={i !== index}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          loading={i === 0 ? 'eager' : 'lazy'}
          onError={(e) => {
            // Hide broken images silently instead of leaking a broken icon.
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/40 via-transparent to-transparent" />

      {caption && (
        <div className="absolute bottom-4 left-4 max-w-[60%] rounded-xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur dark:bg-surface-200/95">
          <p className="text-base font-semibold text-ink-900 transition-opacity duration-500 dark:text-slate-100">
            {caption}
          </p>
        </div>
      )}

      <div
        className="absolute bottom-4 right-4 flex gap-1.5"
        role="tablist"
        aria-label="Slide controls"
      >
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index
                ? 'w-6 bg-white'
                : 'w-1.5 bg-white/60 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
