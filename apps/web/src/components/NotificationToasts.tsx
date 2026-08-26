import { useNavigate } from 'react-router-dom';
import { useNotificationContext, type ToastKind } from '@/contexts/NotificationContext';

interface ToastStyle {
  bar: string;
  icon: string;
  bg: string;
  emoji: string;
}

const KIND_STYLES: Record<ToastKind, ToastStyle> = {
  info: {
    bar: 'bg-blue-500',
    icon: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10',
    bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700',
    emoji: '🔔',
  },
  success: {
    bar: 'bg-emerald-500',
    icon: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
    bg: 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-700/40',
    emoji: '✅',
  },
  warning: {
    bar: 'bg-amber-500',
    icon: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
    bg: 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-700/40',
    emoji: '⚠️',
  },
  error: {
    bar: 'bg-rose-500',
    icon: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10',
    bg: 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-700/40',
    emoji: '⛔',
  },
};

export default function NotificationToasts() {
  const { toasts, dismissToast } = useNotificationContext();
  const navigate = useNavigate();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[120] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
    >
      {toasts.map((toast) => {
        const style = KIND_STYLES[toast.kind] ?? KIND_STYLES.info;
        const clickable = Boolean(toast.link);
        const content = (
          <>
            <span className={`absolute inset-y-0 left-0 w-1 rounded-l-2xl ${style.bar}`} />
            <div className="flex gap-3 pl-4 pr-2 py-3">
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base ${style.icon}`}
                aria-hidden="true"
              >
                {style.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <strong className="block text-sm font-semibold text-slate-900 dark:text-white">
                  {toast.title}
                </strong>
                {toast.message && (
                  <span className="mt-1 block text-xs leading-5 text-slate-600 dark:text-slate-300">
                    {toast.message}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  dismissToast(toast.id);
                }}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                aria-label="Đóng thông báo"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </>
        );

        const wrapperClass = `pointer-events-auto relative overflow-hidden rounded-2xl border shadow-[0_18px_45px_-18px_rgba(15,23,42,0.35)] animate-toast-slide-in ${style.bg}`;
        if (clickable) {
          return (
            <button
              key={toast.id}
              type="button"
              onClick={() => {
                if (toast.link) navigate(toast.link);
                dismissToast(toast.id);
              }}
              className={`${wrapperClass} text-left transition hover:-translate-y-0.5 hover:shadow-[0_24px_55px_-22px_rgba(15,23,42,0.45)]`}
            >
              {content}
            </button>
          );
        }
        return (
          <div key={toast.id} className={wrapperClass}>
            {content}
          </div>
        );
      })}
    </div>
  );
}