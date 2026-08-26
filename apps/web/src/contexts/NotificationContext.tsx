import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AppNotification } from '@/types';

export type ToastKind = 'info' | 'success' | 'warning' | 'error';

export interface ToastInput {
  title: string;
  message?: string;
  kind?: ToastKind;
  link?: string;
  /** Auto-dismiss after ms. Set to 0 to disable auto-dismiss. Default 5000. */
  duration?: number;
}

export interface ToastEntry {
  id: string;
  title: string;
  message?: string;
  kind: ToastKind;
  link?: string;
  duration: number;
  sourceNotificationId?: string;
}

interface NotificationContextValue {
  toasts: ToastEntry[];
  pushToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
  /**
   * Merge a batch of freshly-loaded notifications into the toast queue.
   * Used by NotificationBell to surface new server-side notifications as toasts.
   * Returns the list of new (not previously seen) notifications.
   */
  ingestNotifications: (notifications: AppNotification[]) => AppNotification[];
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const TOAST_DEFAULT_DURATION = 5000;

let toastIdCounter = 0;
function makeToastId(): string {
  toastIdCounter += 1;
  return `toast-${Date.now()}-${toastIdCounter}`;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const timersRef = useRef<Map<string, number>>(new Map());

  // Persist "seen" notification ids in sessionStorage so we never re-surface
  // an already-known server notification (e.g. after F5 / remount). Reset
  // when the user signs out / changes account is handled by the provider
  // tree, not by this effect.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem('travelmind_seen_notifications');
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed)) {
          seenNotificationIdsRef.current = new Set(parsed);
        }
      }
    } catch {
      /* sessionStorage may be unavailable */
    }
  }, []);

  useEffect(() => {
    const seen = seenNotificationIdsRef.current;
    if (!seen.size) return;
    try {
      window.sessionStorage.setItem(
        'travelmind_seen_notifications',
        JSON.stringify(Array.from(seen)),
      );
    } catch {
      /* quota / disabled */
    }
  });

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (typeof timer === 'number') {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const pushToast = useCallback<NotificationContextValue['pushToast']>((toast) => {
    const id = makeToastId();
    const entry: ToastEntry = {
      id,
      title: toast.title,
      message: toast.message,
      link: toast.link,
      kind: toast.kind ?? 'info',
      duration: toast.duration ?? TOAST_DEFAULT_DURATION,
    };
    setToasts((current) => [...current, entry]);
    if (entry.duration > 0) {
      const timer = window.setTimeout(() => {
        dismissToast(id);
      }, entry.duration);
      timersRef.current.set(id, timer);
    }
    return id;
  }, [dismissToast]);

  const ingestNotifications = useCallback<NotificationContextValue['ingestNotifications']>(
    (notifications) => {
      const seen = seenNotificationIdsRef.current;
      const fresh: AppNotification[] = [];
      for (const notification of notifications) {
        if (seen.has(notification.id)) continue;
        seen.add(notification.id);
        fresh.push(notification);
      }
      try {
        window.sessionStorage.setItem(
          'travelmind_seen_notifications',
          JSON.stringify(Array.from(seen)),
        );
      } catch {
        /* ignore */
      }
      // Auto-toast from server notifications is disabled by design:
      // user-facing alerts live only in the bell to avoid repeating
      // old notifications on every refresh / route change.
      return fresh;
    },
    [],
  );

  // Clean up any lingering timers when the provider unmounts
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
    };
  }, []);

  const value = useMemo<NotificationContextValue>(
    () => ({ toasts, pushToast, dismissToast, ingestNotifications }),
    [toasts, pushToast, dismissToast, ingestNotifications],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotificationContext(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotificationContext must be used inside <NotificationProvider>');
  }
  return ctx;
}