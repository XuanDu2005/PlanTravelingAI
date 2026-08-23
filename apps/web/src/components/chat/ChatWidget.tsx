import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { chatService } from '@/services';
import type {
  ChatMessage,
  ChatSessionSummary,
} from '@/types';
import ChatPanel from './ChatPanel';

export default function ChatWidget() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const list = await chatService.listSessions();
      setSessions(list);
      return list;
    } catch {
      return [] as ChatSessionSummary[];
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (sessionId: string) => {
    setMessagesLoading(true);
    try {
      const list = await chatService.listMessages(sessionId);
      setMessages(list);
    } catch {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // When the widget is opened, load session list and ensure there's an active session.
  useEffect(() => {
    if (!open) return;
    void (async () => {
      const list = await loadSessions();
      if (list.length > 0 && !activeSessionId) {
        const first = list[0];
        setActiveSessionId(first.id);
        await loadMessages(first.id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleCreateSession = useCallback(async (): Promise<string | null> => {
    try {
      const s = await chatService.createSession();
      setSessions((prev) => [s, ...prev]);
      setActiveSessionId(s.id);
      setMessages([]);
      return s.id;
    } catch {
      toast.error(t('chat.error'));
      return null;
    }
  }, [t]);

  const handleSelectSession = useCallback(
    async (id: string) => {
      if (id === activeSessionId) return;
      setActiveSessionId(id);
      await loadMessages(id);
    },
    [activeSessionId, loadMessages],
  );

  const handleDeleteSession = useCallback(
    async (id: string) => {
      try {
        await chatService.deleteSession(id);
      } catch {
        toast.error(t('chat.error'));
        return;
      }
      const remaining = sessions.filter((s) => s.id !== id);
      setSessions(remaining);
      if (activeSessionId === id) {
        const next = remaining[0];
        if (next) {
          setActiveSessionId(next.id);
          await loadMessages(next.id);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    },
    [activeSessionId, loadMessages, sessions, t],
  );

  const handleSend = useCallback(
    async (content: string) => {
      let sessionId = activeSessionId;
      if (!sessionId) {
        const newId = await handleCreateSession();
        if (!newId) return;
        sessionId = newId;
      }
      setSending(true);
      // Optimistic append of user message so the UI feels instant.
      const optimisticUser: ChatMessage = {
        id: `tmp-${Date.now()}`,
        role: 'USER',
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUser]);
      try {
        const { userMessage, assistantMessage } = await chatService.sendMessage(
          sessionId,
          content,
        );
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== optimisticUser.id),
          userMessage,
          assistantMessage,
        ]);
        // Bump the session to the top of the list with the latest title.
        setSessions((prev) => {
          const idx = prev.findIndex((s) => s.id === sessionId);
          if (idx === -1) return prev;
          const updated = {
            ...prev[idx],
            title:
              prev[idx].title && prev[idx].title.length > 0
                ? prev[idx].title
                : content.slice(0, 60),
            updatedAt: new Date().toISOString(),
          };
          return [updated, ...prev.filter((_, i) => i !== idx)];
        });
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
        toast.error(t('chat.error'));
      } finally {
        setSending(false);
      }
    },
    [activeSessionId, handleCreateSession, t],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="fixed bottom-4 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white shadow-xl transition hover:scale-105 hover:bg-brand-700"
        aria-label={open ? t('chat.close') : t('chat.open')}
        title={t('chat.title')}
      >
        <span className="text-2xl" aria-hidden>
          {open ? '×' : '💬'}
        </span>
      </button>
      <ChatPanel
        open={open}
        onClose={() => setOpen(false)}
        sessions={sessions}
        sessionsLoading={sessionsLoading}
        activeSessionId={activeSessionId}
        messages={messages}
        messagesLoading={messagesLoading}
        sending={sending}
        onSelectSession={(id) => handleSelectSession(id)}
        onCreateSession={handleCreateSession}
        onDeleteSession={async (id) => {
          await handleDeleteSession(id);
        }}
        onSend={handleSend}
      />
    </>
  );
}