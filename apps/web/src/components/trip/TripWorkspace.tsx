import { useState } from 'react';
import toast from 'react-hot-toast';
import ItineraryView from '@/components/ItineraryView';
import ItineraryEditor from './ItineraryEditor';
import BudgetPanel from './BudgetPanel';
import PackingPanel from './PackingPanel';
import WeatherPanel from './WeatherPanel';
import { tripService } from '@/services';
import { exportItineraryPdf } from '@/services/pdfExport';
import type { Trip } from '@/types';
import { useTranslation } from 'react-i18next';

type Tab = 'itinerary' | 'budget' | 'packing' | 'weather';

const TABS: Array<{ id: Tab; icon: React.ReactNode; labelKey: string }> = [
  {
    id: 'itinerary',
    labelKey: 'workspace.tabs.itinerary',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M3 7h18M3 12h18M3 17h12" />
      </svg>
    ),
  },
  {
    id: 'weather',
    labelKey: 'workspace.tabs.weather',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M7 18a5 5 0 1 1 1.5-9.8A6 6 0 0 1 20 12.5 4.5 4.5 0 0 1 16.5 18H7z" />
        <path d="M9 21h6" />
      </svg>
    ),
  },
  {
    id: 'budget',
    labelKey: 'workspace.tabs.budget',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M7 10h2M11 10h6M7 14h10" />
        <circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'packing',
    labelKey: 'workspace.tabs.packing',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M9 4h6v3H9z" />
        <path d="M5 7h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
        <path d="M9 12h6" />
      </svg>
    ),
  },
];

export default function TripWorkspace({ trip, onChange, onReload }: { trip: Trip; onChange: (trip: Trip) => void; onReload: () => Promise<void> }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('itinerary');
  const [editing, setEditing] = useState(false);
  const [replanning, setReplanning] = useState(false);
  const [exporting, setExporting] = useState(false);

  const content = trip.itinerary?.content;

  const replan = async () => {
    setReplanning(true);
    try {
      const updated = await tripService.replan(trip.id, { reason: t('workspace.replanAllReason') });
      onChange(updated);
      toast.success(t('workspace.toasts.replanned'));
    } finally {
      setReplanning(false);
    }
  };

  const exportPdf = async () => {
    if (!content) {
      toast.error(t('workspace.toasts.noItinerary'));
      return;
    }
    setExporting(true);
    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      exportItineraryPdf(trip);
      toast.success(t('workspace.toasts.exported'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('workspace.toasts.exportFailed'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="-mx-4 sm:-mx-8 rounded-none border-y border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="mx-auto flex max-w-[1440px] items-center justify-start gap-1.5 overflow-x-auto px-4 py-2 sm:px-8">
          {TABS.map((item, index) => {
            const active = tab === item.id;
            return (
              <div key={item.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => { setTab(item.id); setEditing(false); }}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-colors duration-150 cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className={active ? 'text-white' : 'text-blue-600 dark:text-cyan-400'}>{item.icon}</span>
                  <span>{t(item.labelKey)}</span>
                </button>
                {index < TABS.length - 1 && (
                  <span className="mx-2 hidden h-4 w-px bg-slate-200 dark:bg-slate-700 sm:inline-block" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {tab === 'itinerary' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 sm:p-5 shadow-sm backdrop-blur-xl">
            <div>
              <h3 className="font-outfit text-base font-extrabold text-slate-900 dark:text-white">{t('workspace.controlsTitle')}</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t('workspace.versionDescription', { version: trip.itinerary?.versionCount ?? 1 })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={exporting || !content}
                onClick={exportPdf}
                title={!content ? t('workspace.toasts.noItinerary') : undefined}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:scale-105 active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {exporting ? (
                  <>
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <span>{t('workspace.exporting')}</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                      <path d="M9 13h6" />
                      <path d="M9 17h6" />
                    </svg>
                    <span>{t('workspace.exportPdf')}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={replanning}
                onClick={replan}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/20 hover:scale-105 active:scale-95 transition cursor-pointer disabled:opacity-60"
              >
                {replanning ? `✨ ${t('workspace.aiReplanning')}` : `✨ ${t('workspace.aiReplan')}`}
              </button>
              <button
                type="button"
                onClick={() => setEditing((value) => !value)}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                {editing ? `👁️ ${t('workspace.viewItinerary')}` : `✏️ ${t('common.edit')}`}
              </button>
            </div>
          </div>

          {!content ? (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 p-12 text-center text-sm text-slate-500">
              {t('workspace.emptyItinerary')}
            </div>
          ) : editing ? (
            <ItineraryEditor
              trip={trip}
              content={content}
              onChange={onChange}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <ItineraryView content={content} />
          )}
        </div>
      )}

      {tab === 'budget' && <BudgetPanel trip={trip} onReload={onReload} />}
      {tab === 'packing' && <PackingPanel trip={trip} onReload={onReload} />}
      {tab === 'weather' && <WeatherPanel trip={trip} />}
    </div>
  );
}