import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const next = i18n.language === 'vi' ? 'en' : 'vi';

  return (
    <button
      type="button"
      onClick={() => {
        void i18n.changeLanguage(next);
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-ink-100 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
      aria-label={t('common.language')}
      title={t('common.language')}
    >
      <span aria-hidden>🌐</span>
      <span>{next === 'vi' ? 'VI' : 'EN'}</span>
    </button>
  );
}
