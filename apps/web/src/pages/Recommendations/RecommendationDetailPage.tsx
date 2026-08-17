import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { recommendationService } from '@/services';
import { Recommendation } from '@/types';
import ItineraryView from '@/components/ItineraryView';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

export default function RecommendationDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setRec(null);
    setError(false);
    recommendationService
      .byId(id)
      .then(setRec)
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <ErrorState
        message={t('recs.notFoundDesc')}
        title={t('recs.notFoundTitle')}
      />
    );
  }
  if (!rec) return <LoadingState message={t('recs.loadingDetail')} />;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          {t('tripDetail.back')}
        </button>
        <div className="relative overflow-hidden rounded-3xl">
          {rec.image ? (
            <img
              src={rec.image}
              alt={rec.title}
              className="h-56 w-full object-cover sm:h-72"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="h-56 w-full bg-gradient-to-br from-brand-500 to-brand-700 sm:h-72" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <span className="badge bg-white/20 text-white">{rec.destination}</span>
            <h1 className="mt-2 text-3xl font-semibold">{rec.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-white/85">
              {rec.description}
            </p>
          </div>
        </div>
      </header>

      <section>
        <ItineraryView content={rec.content ?? null} />
      </section>

      <div className="flex justify-center">
        <Link to="/recommendations" className="btn-ghost">
          {t('recs.allRecs')}
        </Link>
      </div>
    </div>
  );
}
