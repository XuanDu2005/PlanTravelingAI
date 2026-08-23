import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';

export type ConfirmVariant = 'danger' | 'primary';

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve: ((value: boolean) => void) | null;
}

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [state, setState] = useState<ConfirmState>({
    open: false,
    title: '',
    resolve: null,
  });

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({
        open: true,
        title: opts.title,
        description: opts.description,
        confirmLabel: opts.confirmLabel,
        cancelLabel: opts.cancelLabel,
        variant: opts.variant ?? 'danger',
        resolve,
      });
    });
  }, []);

  const close = useCallback((value: boolean) => {
    setState((prev) => {
      prev.resolve?.(value);
      return { ...prev, open: false, resolve: null };
    });
  }, []);

  // Close on ESC
  useEffect(() => {
    if (!state.open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.open, close]);

  const ctxValue: ConfirmContextValue = { confirm };

  return (
    <ConfirmContext.Provider value={ctxValue}>
      {children}
      <ConfirmModal
        open={state.open}
        title={state.title}
        description={state.description}
        confirmLabel={state.confirmLabel ?? t('common.delete')}
        cancelLabel={state.cancelLabel ?? t('common.cancel')}
        variant={state.variant ?? 'danger'}
        onClose={close}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): (opts: ConfirmOptions) => Promise<boolean> {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used inside ConfirmProvider');
  }
  return ctx.confirm;
}

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: ConfirmVariant;
  onClose: (value: boolean) => void;
}

function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant,
  onClose,
}: ConfirmModalProps) {
  if (!open) return null;

  const confirmBtnClass =
    variant === 'danger'
      ? 'inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-400'
      : 'btn-primary';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-sm dark:bg-black/70"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(false);
      }}
    >
      <div className="card w-full max-w-md p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-ink-900 dark:text-slate-100">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-ink-500 dark:text-slate-400">
            {description}
          </p>
        )}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="btn-ghost"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onClose(true)}
            className={confirmBtnClass}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
