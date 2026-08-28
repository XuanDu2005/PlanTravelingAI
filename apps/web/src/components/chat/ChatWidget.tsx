import { useCallback, useEffect, useRef, useState } from 'react';
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

  // 🚀 Smooth Draggable Position State with Viewport Clamping
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });
  const hasMovedRef = useRef(false);

  // Initialize position at bottom-right corner safely within bounds
  useEffect(() => {
    const updateDefaultPos = () => {
      const btnWidth = 180;
      const defaultX = Math.max(16, window.innerWidth - btnWidth - 24);
      const defaultY = Math.max(16, window.innerHeight - 80);
      setPosition((prev) => {
        if (!prev) return { x: defaultX, y: defaultY };
        return {
          x: Math.min(Math.max(16, prev.x), window.innerWidth - btnWidth - 16),
          y: Math.min(Math.max(16, prev.y), window.innerHeight - 72),
        };
      });
    };

    updateDefaultPos();
    window.addEventListener('resize', updateDefaultPos);
    return () => window.removeEventListener('resize', updateDefaultPos);
  }, []);

  const handleDragStart = (clientX: number, clientY: number) => {
    if (!position) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const deltaX = clientX - dragStartRef.current.startX;
    const deltaY = clientY - dragStartRef.current.startY;

    if (Math.hypot(deltaX, deltaY) > 5) {
      hasMovedRef.current = true;
    }

    const btnWidth = 180;
    const nextX = Math.min(
      Math.max(16, dragStartRef.current.initialX + deltaX),
      window.innerWidth - btnWidth - 16
    );
    const nextY = Math.min(
      Math.max(16, dragStartRef.current.initialY + deltaY),
      window.innerHeight - 72
    );

    setPosition({ x: nextX, y: nextY });
  }, []);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        handleDragMove(e.clientX, e.clientY);
      }
    };
    const onMouseUp = () => {
      if (isDraggingRef.current) {
        handleDragEnd();
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches[0]) {
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => {
      if (isDraggingRef.current) {
        handleDragEnd();
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  useEffect(() => {
    const handleOpenChat = () => setOpen(true);
    window.addEventListener('travelmind:open-chat', handleOpenChat);
    return () => window.removeEventListener('travelmind:open-chat', handleOpenChat);
  }, []);

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
        setSessions((prev) => {
          const idx = prev.findIndex((s) => s.id === sessionId);
          if (idx === -1) return prev;
          const updated = {
            ...prev[idx],
            title:
              prev[idx].title && prev[idx].title.length > 0
                ? prev[idx].title
                : content.slice(0, 60),
          };
          return [updated, ...prev.filter((_, i) => i !== idx)];
        });
      } catch {
        toast.error(t('chat.error'));
        setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
      } finally {
        setSending(false);
      }
    },
    [activeSessionId, handleCreateSession, t],
  );

  const handleClickOrb = () => {
    if (!hasMovedRef.current) {
      setOpen((s) => !s);
    }
  };

  return (
    <>
      {/* 🚀 Redesigned Premium Floating AI Assistant Launcher */}
      {position && (
        <div
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            touchAction: 'none',
          }}
          className="fixed top-0 left-0 z-50 select-none"
        >
          <div
            onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
            onTouchStart={(e) => {
              if (e.touches[0]) {
                handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onClick={handleClickOrb}
            className="group relative cursor-grab active:cursor-grabbing inline-flex items-center"
            title="Kéo để di chuyển • Nhấp để mở Trợ lý AI TravelMind"
          >
            {/* Ambient Pulse Glow Aura */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />

            {/* Glowing Pill / Capsule Button */}
            <button
              type="button"
              className={`relative flex items-center gap-2.5 rounded-full border border-white/60 dark:border-cyan-400/40 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 px-4 py-2.5 text-white shadow-2xl transition-all duration-200 group-hover:scale-105 group-active:scale-95 cursor-pointer backdrop-blur-xl ${
                open ? 'ring-2 ring-white/80 dark:ring-cyan-300' : ''
              }`}
              aria-label={open ? t('chat.close') : t('chat.open')}
            >
              {/* Icon Orb */}
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md shadow-inner shrink-0">
                {open ? (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <path d="M10 2L12.5 8.5L19 11L12.5 13.5L10 20L7.5 13.5L1 11L7.5 8.5L10 2Z" />
                    <path d="M18 1L19.2 4.2L22.4 5.4L19.2 6.6L18 9.8L16.8 6.6L13.6 5.4L16.8 4.2L18 1Z" />
                    <path d="M18.5 14L19.3 16.3L21.6 17.1L19.3 17.9L18.5 20.2L17.7 17.9L15.4 17.1L17.7 16.3L18.5 14Z" />
                  </svg>
                )}
              </div>

              {/* Text Label */}
              <div className="flex items-center gap-1.5 pr-1">
                <span className="text-xs font-black tracking-wide whitespace-nowrap">
                  {open ? t('chat.launcherClose') : t('chat.launcher')}
                </span>
                {!open && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-80" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Global Modern Chat Panel */}
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
