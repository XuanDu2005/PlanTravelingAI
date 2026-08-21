import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useFavorites } from '@/store/FavoritesProvider';
import { useAuth } from '@/store/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  recommendationId: string;
  /** Visual style of the surface button. */
  variant?: 'overlay' | 'inline';
  /** Shows a short pop animation when toggled. */
  withAnimation?: boolean;
}

export default function FavoriteButton({
  recommendationId,
  variant = 'overlay',
  withAnimation = true,
}: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { has, toggle } = useFavorites();
  const [pulse, setPulse] = useState(false);

  const isFav = has(recommendationId);

  const surfaceClass =
    variant === 'overlay'
      ? 'absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink-700 shadow hover:text-rose-600 dark:bg-surface-200/90 dark:text-slate-100'
      : 'grid h-9 w-9 place-items-center rounded-full text-ink-700 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-200 dark:hover:bg-rose-900/30 dark:hover:text-rose-300';

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      // Soft prompt: take them to login.
      navigate('/login');
      return;
    }
    const newState = await toggle(recommendationId);
    if (newState && withAnimation) {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 400);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isFav ? t('favorites.remove') : t('favorites.add')}
      aria-pressed={isFav}
      title={isFav ? t('favorites.remove') : t('favorites.add')}
      className={`${surfaceClass} ${pulse ? 'scale-125' : ''} transition-all duration-200`}
    >
      <span
        aria-hidden
        className={`text-base leading-none ${isFav ? 'text-rose-600 dark:text-rose-400' : ''}`}
      >
        {isFav ? '♥' : '♡'}
      </span>
    </button>
  );
}
