import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { ChatSessionSummary } from '@/types';
import { chatService } from '@/services';
import { useConfirm } from '@/components/ConfirmProvider';

interface Props {
  sessions: ChatSessionSummary[];
  activeId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRenamed: (session: ChatSessionSummary) => void;
}

export default function SessionList({
  sessions,
  activeId,
  loading,
  onSelect,
  onCreate,
  onDelete,
  onRenamed,
}: Props) {
  const { t } = useTranslation();
  const confirm = useConfirm();

  const [renameTarget, setRenameTarget] = useState<ChatSessionSummary | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (renameTarget && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renameTarget]);

  const openRename = (session: ChatSessionSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenameTarget(session);
    setRenameValue(session.title || '');
  };

  const closeRename = () => {
    if (renaming) return;
    setRenameTarget(null);
    setRenameValue('');
  };

  const submitRename = async () => {
    if (!renameTarget) return;
    const trimmed = renameValue.trim();
    if (!trimmed) {
      toast.error(t('chat.renameEmpty'));
      return;
    }
    if (trimmed.length > 120) {
      toast.error(t('chat.renameTooLong'));
      return;
    }
    if (trimmed === renameTarget.title) {
      closeRename();
      return;
    }
    setRenaming(true);
    try {
      const updated = await chatService.renameSession(renameTarget.id, trimmed);
      onRenamed(updated);
      toast.success(t('chat.renameSuccess'));
      closeRename();
    } catch {
      toast.error(t('chat.renameError'));
    } finally {
      setRenaming(false);
    }
  };

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

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 shrink-0 ml-1 transition">
                    <button
                      type="button"
                      onClick={(e) => openRename(s, e)}
                      className="h-5.5 w-5.5 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                      title={t('chat.rename')}
                      aria-label={t('chat.rename')}
                    >
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(s.id, e)}
                      className="h-5.5 w-5.5 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title={t('common.delete')}
                      aria-label={t('common.delete')}
                    >
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rename Modal */}
      {renameTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-sm dark:bg-black/70"
          role="dialog"
          aria-modal="true"
          aria-label={t('chat.renamePromptTitle')}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeRename();
          }}
        >
          <div className="card w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-ink-900 dark:text-slate-100">
              {t('chat.renamePromptTitle')}
            </h2>
            <form
              className="mt-4"
              onSubmit={(e) => {
                e.preventDefault();
                void submitRename();
              }}
            >
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                {t('chat.renameLabel')}
              </label>
              <input
                ref={renameInputRef}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder={t('chat.renamePlaceholder')}
                maxLength={120}
                disabled={renaming}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
              />
              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeRename}
                  disabled={renaming}
                  className="btn-ghost"
                >
                  {t('chat.renameCancel')}
                </button>
                <button
                  type="submit"
                  disabled={renaming}
                  className="btn-primary"
                >
                  {t('chat.renameSave')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
