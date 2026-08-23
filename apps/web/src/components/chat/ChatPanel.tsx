import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  ChatMessage,
  ChatSessionSummary,
} from '@/types';
import ChatInput from './ChatInput';
import ChatMessageList from './ChatMessageList';
import SessionList from './SessionList';

interface Props {
  open: boolean;
  onClose: () => void;
  sessions: ChatSessionSummary[];
  sessionsLoading: boolean;
  activeSessionId: string | null;
  messages: ChatMessage[];
  messagesLoading: boolean;
  sending: boolean;
  onSelectSession: (id: string) => void;
  onCreateSession: () => Promise<string | null>;
  onDeleteSession: (id: string) => Promise<void>;
  onSend: (content: string) => Promise<void>;
}

export default function ChatPanel({
  open,
  onClose,
  sessions,
  sessionsLoading,
  activeSessionId,
  messages,
  messagesLoading,
  sending,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onSend,
}: Props) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || activeSessionId) return;
    void onCreateSession();
  }, [open, activeSessionId, onCreateSession]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending, open]);

  if (!open) return null;

  return (
    <div
      className="fixed bottom-20 right-4 z-50 flex h-[600px] max-h-[calc(100vh-6rem)] w-[760px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-2xl transition-colors duration-200 dark:border-surface-100 dark:bg-surface-200"
      role="dialog"
      aria-label={t('chat.title')}
    >
      <SessionList
        sessions={sessions}
        activeId={activeSessionId}
        loading={sessionsLoading}
        onSelect={onSelectSession}
        onCreate={() => {
          void onCreateSession();
        }}
        onDelete={(id) => {
          void onDeleteSession(id);
        }}
      />

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-ink-100 bg-gradient-to-br from-brand-600 to-brand-700 px-4 py-3 text-white dark:border-surface-100">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{t('chat.title')}</h3>
            <p className="text-xs text-brand-100">{t('chat.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label={t('chat.close')}
          >
            <span aria-hidden>×</span>
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50 dark:bg-surface-300">
          {messagesLoading ? (
            <div className="grid h-full place-items-center text-sm text-ink-400 dark:text-slate-500">
              ...
            </div>
          ) : (
            <ChatMessageList messages={messages} pending={sending} />
          )}
        </div>

        <ChatInput
          onSend={(content) => {
            void onSend(content);
          }}
          disabled={sending || !activeSessionId}
        />
      </div>
    </div>
  );
}