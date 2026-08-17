import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { tripService } from '@/services';
import { formatBudgetLabel } from '@/utils/format';

const today = () => new Date().toISOString().slice(0, 10);

const BUDGET_VALUES = ['Budget', 'Mid-range', 'Premium', 'Luxury'] as const;

export default function CreateTripPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  });
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState<string>('Mid-range');
  const [preferences, setPreferences] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (new Date(endDate) < new Date(startDate)) {
      toast.error(t('createTrip.dateError'));
      return;
    }

    const payload = {
      destination,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      travelers,
      budget,
      preferences,
    };

    setSubmitting(true);
    try {
      const trip = await tripService.create(payload);
      toast.success(t('createTrip.success'));
      navigate(`/trips/${trip.id}`);
    } catch {
      /* handled in interceptor */
    } finally {
      setSubmitting(false);
    }
  };

  const budgetLabel = (v: string) => formatBudgetLabel(v, t);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-ink-900 dark:text-slate-100">
          {t('createTrip.title')}
        </h1>
        <p className="text-sm text-ink-500 dark:text-slate-400">{t('createTrip.desc')}</p>
      </header>

      <form className="card space-y-5 p-6 sm:p-8" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">{t('createTrip.destination')}</label>
            <input
              required
              className="input"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={t('createTrip.destinationPlaceholder')}
            />
          </div>

          <div>
            <label className="label">{t('createTrip.startDate')}</label>
            <input
              required
              type="date"
              className="input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="label">{t('createTrip.endDate')}</label>
            <input
              required
              type="date"
              className="input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div>
            <label className="label">{t('createTrip.travelers')}</label>
            <input
              required
              type="number"
              min={1}
              max={50}
              className="input"
              value={travelers}
              onChange={(e) => setTravelers(parseInt(e.target.value || '1', 10))}
            />
          </div>

          <div>
            <label className="label">{t('createTrip.budget')}</label>
            <select
              className="input"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            >
              {BUDGET_VALUES.map((v) => (
                <option key={v} value={v}>
                  {budgetLabel(v)}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="label">{t('createTrip.preferences')}</label>
            <textarea
              className="input min-h-[110px]"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder={t('createTrip.preferencesPlaceholder')}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-ink-500 dark:text-slate-400">{t('createTrip.footerNote')}</p>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? t('createTrip.submitting') : t('createTrip.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}
