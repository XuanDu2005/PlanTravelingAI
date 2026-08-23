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

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: t('chat.deleteConfirm'),
      confirmLabel: t('common.delete'),
      variant: 'danger',
    });
    if (ok) onDelete(id);
  };

  return (
    <div className="flex h-full w-60 flex-col border-r border-ink-100 bg-white transition-colors duration-200 dark:border-surface-100 dark:bg-surface-200">
      <div className="border-b border-ink-100 p-3 dark:border-surface-100">
        <button
          type="button"
          onClick={onCreate}
          className="btn-primary w-full"
        >
          <span aria-hidden>+</span>
          <span>{t('chat.newSession')}</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <h4 className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-slate-500">
          {t('chat.history')}
        </h4>
        {loading ? (
          <p className="px-3 text-xs text-ink-400 dark:text-slate-500">...</p>
        ) : sessions.length === 0 ? (
          <p className="px-3 text-xs text-ink-400 dark:text-slate-500">{t('chat.noHistory')}</p>
        ) : (
          <ul className="flex flex-col">
            {sessions.map((s) => {
              const isActive = s.id === activeId;
              return (
                <li
                  key={s.id}
                  className={`group flex items-center gap-1 border-l-2 ${
                    isActive
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/30'
                      : 'border-transparent hover:bg-ink-50 dark:hover:bg-surface-100'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(s.id)}
                    className="flex-1 truncate px-3 py-2 text-left text-sm text-ink-800 dark:text-slate-200"
                    title={s.title || t('chat.untitled')}
                  >
                    {s.title || t('chat.untitled')}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(s.id);
                    }}
                    className="mr-2 hidden rounded-md p-1 text-ink-300 hover:bg-rose-50 hover:text-rose-600 group-hover:block dark:text-slate-500 dark:hover:bg-rose-900/30 dark:hover:text-rose-300"
                    title={t('chat.deleteSession')}
                    aria-label={t('chat.deleteSession')}
                  >
                    <span aria-hidden>×</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}