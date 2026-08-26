import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '@/services';
import type { AppNotification } from '@/types';
import { useTranslation } from 'react-i18next';
import { useNotificationContext } from '@/contexts/NotificationContext';

const POLL_INTERVAL_MS = 15_000;

export default function NotificationBell() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { ingestNotifications } = useNotificationContext();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);

  const load = useCallback(
    async (silent = false) => {
      try {
        const next = await notificationService.list();
        if (silent) {
          // Push a toast for any newly-arrived notification the user hasn't seen yet
          ingestNotifications(next);
        }
        setItems(next);
      } catch {
        /* network errors are expected; ignore */
      }
    },
    [ingestNotifications],
  );

  // Initial load (silent=false so we don't toast on first mount) + poll
  useEffect(() => {
    void load(false);
    const timer = window.setInterval(() => void load(true), POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  const unread = items.filter((item) => !item.isRead).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative grid h-8 w-8 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label={t('notifications.title')}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
            {Math.min(unread, 9)}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-[70] w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
            <div>
              <strong className="text-sm text-slate-900 dark:text-white">
                {t('notifications.title')}
              </strong>
              <p className="text-[11px] text-slate-500">
                {t('notifications.unread', { count: unread })}
              </p>
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={async () => {
                  await notificationService.readAll();
                  setItems((current) => current.map((item) => ({ ...item, isRead: true })));
                }}
                className="text-xs font-bold text-blue-600 dark:text-cyan-400"
              >
                {t('notifications.readAll')}
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={async () => {
                  if (!item.isRead) await notificationService.read(item.id);
                  setItems((current) =>
                    current.map((row) => (row.id === item.id ? { ...row, isRead: true } : row)),
                  );
                  setOpen(false);
                  if (item.link) navigate(item.link);
                }}
                className={`w-full rounded-xl p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  item.isRead ? 'opacity-65' : 'bg-blue-50/60 dark:bg-blue-500/5'
                }`}
              >
                <div className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white shadow-sm dark:bg-slate-800">
                    {item.type === 'WEATHER'
                      ? '⛅'
                      : item.type === 'COLLABORATION'
                        ? '👥'
                        : item.type === 'BOOKING'
                          ? '🎫'
                          : '🔔'}
                  </span>
                  <span>
                    <strong className="block text-xs text-slate-900 dark:text-white">
                      {item.type === 'COLLABORATION' ? t('notifications.collaborationTitle') : item.title}
                    </strong>
                    <span className="mt-1 block text-[11px] leading-4 text-slate-500">
                      {item.type === 'COLLABORATION'
                        ? t('notifications.collaborationMessage', {
                            destination: item.message.replace(/^Bạn được mời tham gia chuyến đi\s*/, '').replace(/\.$/, ''),
                          })
                        : item.message}
                    </span>
                    <span className="mt-1 block text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleString(i18n.language === 'en' ? 'en-US' : 'vi-VN')}
                    </span>
                  </span>
                </div>
              </button>
            ))}
            {!items.length && (
              <div className="p-8 text-center text-xs text-slate-500">{t('notifications.empty')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}