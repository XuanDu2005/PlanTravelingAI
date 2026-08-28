import { useTranslation } from 'react-i18next';
import type { ChatSessionSummary } from '@/types';
import { useConfirm } from '@/components/ConfirmProvider';

interface Props {
  sessions: ChatSessionSummary[];
  activeId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export default function SessionList({
  sessions,
  activeId,
  loading,
  onSelect,
  onCreate,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const confirm = useConfirm();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await confirm({
      title: t('chat.deleteConfirm'),
      confirmLabel: t('common.delete'),
      variant: 'danger',
    });
    if (ok) onDelete(id);
  };

  return (
    <div className="hidden sm:flex h-full w-60 flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#091122]/90 shrink-0">
      
      {/* Top Action */}
      <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <button
          type="button"
          onClick={onCreate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-blue-500/20 transition cursor-pointer"
        >
          <span className="text-sm font-bold leading-none">+</span>
          <span>{t('chat.newChat')}</span>
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="p-4 text-center text-xs text-slate-400">{t('chat.loadingHistory')}</div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            {t('chat.emptyHistory')}
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((s) => {
              const isActive = s.id === activeId;
              return (
                <div
                  key={s.id}
                  onClick={() => onSelect(s.id)}
                  className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#13203A] text-blue-600 dark:text-cyan-300 shadow-xs border border-slate-200/90 dark:border-blue-500/30 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 opacity-70" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="truncate" title={s.title || t('chat.untitled')}>
                      {s.title || t('chat.untitled')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 h-5.5 w-5.5 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 ml-1"
                    title={t('common.delete')}
                  >
                    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}