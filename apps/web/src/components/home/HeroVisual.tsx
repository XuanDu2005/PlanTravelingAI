export default function HeroVisual() {
  return (
    <div className="relative w-full max-w-[420px] aspect-[4/5] mx-auto overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
      <img
        src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80"
        alt="Travel destination"
        className="h-full w-full object-cover"
        loading="eager"
      />
    </div>
  );
}