import { useTranslation } from 'react-i18next';

interface Props {
  title?: string;
  message?: string;
}

export default function ErrorState({
  title,
  message,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="text-3xl">⚠️</div>
      <h3 className="text-lg font-semibold text-ink-900 dark:text-slate-100">
        {title ?? t('common.errorTitle', 'Có lỗi xảy ra')}
      </h3>
      <p className="max-w-md text-sm text-ink-500 dark:text-slate-400">
        {message ?? t('common.errorMessage', 'Vui lòng thử lại sau ít phút.')}
      </p>
    </div>
  );
}
