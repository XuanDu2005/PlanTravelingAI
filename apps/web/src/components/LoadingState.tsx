import { useTranslation } from 'react-i18next';

interface Props {
  message?: string;
}

export default function LoadingState({ message }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-ink-500 dark:text-slate-400">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      <p className="text-sm">{message ?? t('common.loading')}</p>
    </div>
  );
}
