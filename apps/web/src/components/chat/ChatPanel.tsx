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

  const currentSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div
      className="fixed bottom-20 right-4 sm:right-6 z-50 flex h-[640px] max-h-[calc(100vh-6.5rem)] w-[860px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[28px] border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-[#0B1324]/95 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-300 font-sans animate-in fade-in zoom-in-95"
      role="dialog"
      aria-label={t('chat.title')}
    >
      {/* 1. Left Sidebar: Chat History */}
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

      {/* 2. Main Chat Conversation Area */}
      <div className="flex flex-1 flex-col min-w-0 bg-slate-50/50 dark:bg-[#080E1C]/50">
        
        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0D162B]/90 px-5 py-3 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* AI Avatar */}
            <div className="relative flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-md shadow-blue-500/20 shrink-0">
              <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="currentColor">
                <path d="M10 2L12.5 8.5L19 11L12.5 13.5L10 20L7.5 13.5L1 11L7.5 8.5L10 2Z" />
                <path d="M18 1L19.2 4.2L22.4 5.4L19.2 6.6L18 9.8L16.8 6.6L13.6 5.4L16.8 4.2L18 1Z" />
                <path d="M18.5 14L19.3 16.3L21.6 17.1L19.3 17.9L18.5 20.2L17.7 17.9L15.4 17.1L17.7 16.3L18.5 14Z" />
              </svg>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0D162B]" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {currentSession?.title ? currentSession.title : 'TravelMind AI'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label={t('chat.close')}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* Message Stream Scroll Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messagesLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-xs font-bold text-slate-400">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <span>Đang tải đoạn hội thoại...</span>
              </div>
            </div>
          ) : (
            <ChatMessageList
              messages={messages}
              pending={sending}
              onPromptClick={(prompt) => void onSend(prompt)}
            />
          )}
        </div>

        {/* Bottom Input Area */}
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