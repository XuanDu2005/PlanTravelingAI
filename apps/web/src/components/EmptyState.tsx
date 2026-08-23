import { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({ title, description, icon, action }: Props) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="text-3xl">{icon ?? '🧳'}</div>
      <h3 className="text-lg font-semibold text-ink-900 dark:text-slate-100">{title}</h3>
      {description && (
        <p className="max-w-md text-sm text-ink-500 dark:text-slate-400">{description}</p>
      )}
      {action}
    </div>
  );
}